import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { validateImageDataUrl, SECURITY_HEADERS } from '@/lib/security';

// SECURITY: OpenAI client with paid API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// SECURITY: Usage limits
const TIMEOUT_MS = 60000; // 60 second timeout for image analysis
const MAX_TOKENS = 500;

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // SECURITY: Stricter rate limiting for image analysis (5 per minute - more expensive)
    const rateLimitResult = rateLimit(clientIp, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 5, // Only 5 image analysis per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many image uploads. Please wait before uploading another photo.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(rateLimitResult.resetTime / 1000)),
          },
        }
      );
    }

    // SECURITY: Validate request body size (images can be large, but limit to 10MB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      // 10MB max
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 10MB.' },
        { status: 413, headers: SECURITY_HEADERS }
      );
    }

    const body = await request.json();
    const { image, mimeType } = body;

    // SECURITY: Validate image data
    let validatedImage: string;
    try {
      validatedImage = validateImageDataUrl(image);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid image' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Extract base64 data
    const base64Data = validatedImage.split(',')[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const prompt = `STEP 1: DETERMINE IMAGE TYPE
First, identify if this is:
A) A VIN tag/sticker (certification label on door jamb with text, numbers, and codes)
B) A car photo (showing the vehicle exterior/paint)

STEP 2: ANALYZE BASED ON TYPE

=== IF VIN TAG/STICKER (TYPE A) ===
CRITICAL: VIN tags contain paint codes in specific locations. Look for these labels:
- "C/TR" (Toyota/Lexus) - Format: "C/TR: 1C8 / FB13" → Paint code is 1C8 (before the /)
- "PNT" or "Paint" - Followed by 2-3 character code
- "EXT PNT" or "Exterior Paint Code" (Ford) - 2-digit code like UH, N1
- "Color" or "CLR" - Followed by code
- Manufacturer-specific formats

Instructions for VIN tag:
1. Read ALL text on the sticker carefully using OCR
2. Identify paint code label keywords (C/TR, PNT, Paint, Color, EXT PNT)
3. Extract the 2-3 character alphanumeric code NEXT TO these labels
4. If you see "C/TR: XXX / YYY" - the paint code is XXX (ignore YYY, that's trim)
5. Try to identify the manufacturer from the VIN or sticker text
6. Provide high confidence if paint code label is clearly visible

=== IF CAR PHOTO (TYPE B) ===
- Identify the vehicle make and model
- Estimate year range based on design
- Describe the color in detail (e.g., "metallic dark blue", "pearl white")
- Suggest possible paint codes based on color and vehicle
- Provide medium/low confidence (visual estimation only)

Respond in JSON format:
{
  "imageType": "vin_tag" | "car_photo",
  "make": "string or null",
  "model": "string or null",
  "yearRange": "string or null",
  "colorDescription": "string",
  "paintCode": "string or null (if found on VIN tag)",
  "possiblePaintCodes": ["array of strings"],
  "confidence": "high|medium|low",
  "vinTagDetails": {
    "paintCodeLabel": "which label was found (C/TR, PNT, etc)",
    "rawTextNearCode": "text surrounding the paint code",
    "vinNumber": "VIN if visible"
  } | null,
  "additionalInfo": "string"
}`;

    // SECURITY: Call OpenAI Vision with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await openai.chat.completions.create(
        {
          model: 'gpt-4o-mini', // Supports vision
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: validatedImage,
                    detail: 'low', // SECURITY: Use low detail to reduce costs
                  },
                },
              ],
            },
          ],
          max_tokens: MAX_TOKENS, // SECURITY: Limit response length
          response_format: { type: 'json_object' },
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const text = response.choices[0]?.message?.content || '';

      // Parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        parsedResponse = { raw: text };
      }

      return NextResponse.json(
        {
          success: true,
          analysis: parsedResponse,
          rawResponse: text,
        },
        {
          headers: {
            ...SECURITY_HEADERS,
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(Math.floor(rateLimitResult.resetTime / 1000)),
          },
        }
      );
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        return NextResponse.json(
          { error: 'Image analysis timeout. Please try again with a smaller image.' },
          { status: 504, headers: SECURITY_HEADERS }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Image analysis error:', error);

    // SECURITY: Don't leak internal error details to client
    return NextResponse.json(
      {
        error: 'Failed to analyze image. Please try again.',
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
