import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';

// SECURITY: OpenAI client with paid API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// SECURITY: Usage limits
const TIMEOUT_MS = 20000; // 20 second timeout
const MAX_TOKENS = 400;

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.'
        },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // SECURITY: Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // SECURITY: Rate limiting (3 requests per minute)
    const rateLimitResult = rateLimit(clientIp, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 3, // Only 3 facts requests per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please wait before requesting facts.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { brand, model, year, paintCode, colorName } = body;

    if (!brand || !model || !year) {
      return NextResponse.json(
        { success: false, error: 'Brand, model, and year are required' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const prompt = `Generate fun facts about this vehicle in TWO distinct sections:

**Section 1: Vehicle History** (2-3 sentences)
- Focus on the ${year} ${brand} ${model}
- Include notable features, production details, cultural significance, or interesting history
- Make it specific to this model year when possible
- Examples: special editions, engineering innovations, awards, pop culture appearances

**Section 2: Color Heritage** (1-2 sentences)
${paintCode && colorName ? `- Focus on the paint color: ${colorName} (${paintCode})
- Mention if this color has special significance with this brand
- Include if it was used in notable vehicles, special editions, or films
- If not particularly notable, mention general appeal or popularity` : `- General note about paint colors for this model
- Mention popular color choices or notable options`}

Format your response EXACTLY as JSON:
{
  "vehicleHistory": "2-3 sentence paragraph here",
  "colorHeritage": "1-2 sentence paragraph here"
}

Write in a warm, enthusiastic tone. Make the owner feel excited about their vehicle.`;

    // SECURITY: Call OpenAI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await openai.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an enthusiastic automotive historian who loves sharing fascinating facts about cars. Be warm, engaging, and make people excited about their vehicles.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: MAX_TOKENS,
          temperature: 0.8, // More creative for fun facts
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const rawFacts = response.choices[0]?.message?.content || '';

      // Parse JSON response
      let parsedFacts;
      try {
        parsedFacts = JSON.parse(rawFacts);
      } catch (error) {
        // Fallback if AI doesn't return proper JSON
        console.error('Failed to parse vehicle facts JSON:', error);
        parsedFacts = {
          vehicleHistory: rawFacts,
          colorHeritage: '',
        };
      }

      return NextResponse.json(
        {
          success: true,
          facts: parsedFacts.vehicleHistory, // For backwards compatibility
          vehicleHistory: parsedFacts.vehicleHistory,
          colorHeritage: parsedFacts.colorHeritage,
        },
        {
          headers: {
            ...SECURITY_HEADERS,
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      );
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout. Please try again.' },
          { status: 504, headers: SECURITY_HEADERS }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Facts & History API error:', error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate facts and history. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
