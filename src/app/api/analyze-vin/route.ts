import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { validateImageDataUrl, SECURITY_HEADERS } from '@/lib/security';
import type { VinAnalysisResponse } from '@/types';

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

    // SECURITY: Stricter rate limiting for VIN analysis (5 per minute - same as image analysis)
    const rateLimitResult = rateLimit(clientIp, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 5, // 5 VIN analysis per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many VIN tag uploads. Please wait before uploading another photo.',
        } as VinAnalysisResponse,
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

    // SECURITY: Validate request body size (10MB max)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image too large. Maximum size is 10MB.',
        } as VinAnalysisResponse,
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
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid image',
        } as VinAnalysisResponse,
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Extract base64 data
    const base64Data = validatedImage.split(',')[1];
    if (!base64Data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image format',
        } as VinAnalysisResponse,
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // VIN tag-specific OCR prompt
    const prompt = `Analyze this VIN identification tag/sticker/label to extract vehicle information.

VIN tags typically contain:
- VIN number (17 characters, alphanumeric, usually labeled "VIN" or "Vehicle Identification Number")
- Paint code (2-6 character code, may be labeled "PAINT", "COLOR", "EXT PAINT", "TRIM", "C/TR", "BC/CC")
- Color name (text description of the color)
- Other codes (tire pressure, options, etc.)

Common label variations:
- "PAINT", "COLOR", "EXT PAINT", "EXTERIOR PAINT", "BODY COLOR"
- "TRIM", "TR", "C/TR", "BC/CC" (body color/clearcoat)

Your task:
1. Read ALL text on the sticker carefully using OCR
2. Identify the VIN (17 characters)
3. Find the paint code (usually near "PAINT" or "COLOR" labels)
4. Extract the color name if visible
5. If you can identify the vehicle make/model from the VIN or context, include it
6. Rate your confidence level

IMPORTANT:
- Paint codes are often near labels like "PAINT:", "EXT:", or "COLOR:"
- VIN is always 17 characters (no I, O, or Q letters)
- Be precise with the paint code - it's critical for matching

Respond in JSON format:
{
  "vin": "string (17 characters) or null",
  "paintCode": "string or null",
  "colorName": "string or null",
  "brand": "string or null",
  "model": "string or null",
  "year": "number or null",
  "hexColor": "string (hex code if you can infer from color name) or null",
  "confidence": "high|medium|low",
  "additionalInfo": "any other useful information you found"
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
                    detail: 'high', // Use HIGH detail for VIN tags (need to read small text)
                  },
                },
              ],
            },
          ],
          max_tokens: MAX_TOKENS,
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
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse VIN data',
          } as VinAnalysisResponse,
          { status: 500, headers: SECURITY_HEADERS }
        );
      }

      console.log('[VIN-ANALYSIS] Extracted:', {
        vin: parsedResponse.vin,
        paintCode: parsedResponse.paintCode,
        confidence: parsedResponse.confidence,
      });

      return NextResponse.json(
        {
          success: true,
          vinData: {
            vin: parsedResponse.vin,
            brand: parsedResponse.brand,
            model: parsedResponse.model,
            year: parsedResponse.year,
            paintCode: parsedResponse.paintCode,
            colorName: parsedResponse.colorName,
            hexColor: parsedResponse.hexColor,
            confidence: parsedResponse.confidence || 'medium',
          },
        } as VinAnalysisResponse,
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
          {
            success: false,
            error: 'VIN analysis timeout. Please try again.',
          } as VinAnalysisResponse,
          { status: 504, headers: SECURITY_HEADERS }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('[VIN-ANALYSIS] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze VIN tag. Please try again.',
      } as VinAnalysisResponse,
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
