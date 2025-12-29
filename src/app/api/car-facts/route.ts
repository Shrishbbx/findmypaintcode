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
    // SECURITY: Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // SECURITY: Rate limiting (3 requests per minute)
    const rateLimitResult = rateLimit(clientIp, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 3, // Only 3 fun facts requests per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait before requesting more facts.',
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
        { error: 'Brand, model, and year are required' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const prompt = `Generate interesting and engaging fun facts about the ${year} ${brand} ${model}${paintCode ? ` in ${paintCode} (${colorName})` : ''}.

Include:
1. A brief interesting history or notable fact about this specific model year
2. Any unique features or innovations introduced in this generation
3. If a paint color is specified, mention something interesting about that color (popularity, special editions, etc.)
4. Keep it concise, engaging, and fun - 3-4 sentences total
5. Make it feel personal and exciting for someone who owns this vehicle

Write in a warm, enthusiastic tone. Focus on making the owner feel good about their car choice.`;

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

      const facts = response.choices[0]?.message?.content || '';

      return NextResponse.json(
        {
          success: true,
          facts,
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
          { error: 'Request timeout. Please try again.' },
          { status: 504, headers: SECURITY_HEADERS }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Car facts API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate fun facts. Please try again.',
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
