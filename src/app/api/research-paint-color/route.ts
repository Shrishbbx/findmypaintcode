import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';

// Rate limit: 5 requests per minute (expensive operation)
const RATE_LIMIT = {
  interval: 60 * 1000,
  uniqueTokenPerInterval: 5,
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * API Route: /api/research-paint-color
 *
 * Researches paint code color from web when not in database
 * Uses Google Search + AI to extract accurate color information
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(clientIp, RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    const body = await request.json();
    const { brand, paintCode } = body;

    if (!brand || !paintCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: brand and paintCode' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('[PAINT-COLOR-RESEARCH] OPENAI_API_KEY is not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Web research service not configured. Please add OPENAI_API_KEY to environment variables.',
        },
        { status: 503, headers: SECURITY_HEADERS }
      );
    }

    console.log('[PAINT-COLOR-RESEARCH] Researching:', brand, paintCode);

    // Step 1: Search the web for paint code information using Google Custom Search
    const searchQuery = `${brand} paint code ${paintCode} color name`;

    const searchResponse = await fetch(`${request.nextUrl.origin}/api/web-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery, maxResults: 5 }),
    });

    const searchData = await searchResponse.json();

    console.log('[PAINT-COLOR-RESEARCH] Search response status:', searchResponse.status);
    console.log('[PAINT-COLOR-RESEARCH] Search data:', JSON.stringify(searchData, null, 2));

    if (!searchData.success || !searchData.results || searchData.results.length === 0) {
      console.error('[PAINT-COLOR-RESEARCH] No search results found');
      console.error('[PAINT-COLOR-RESEARCH] Search error:', searchData.error);
      return NextResponse.json({
        success: false,
        error: searchData.error || 'No color information found online',
      }, { headers: SECURITY_HEADERS });
    }

    // Step 2: Use OpenAI to extract color information from search results
    const searchResultsText = searchData.results
      .map((r: { title: string; snippet: string; url: string }) =>
        `Title: ${r.title}\nSnippet: ${r.snippet}\nURL: ${r.url}`
      )
      .join('\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a color extraction expert specializing in automotive paint codes. Extract exact color information from search results.'
        },
        {
          role: 'user',
          content: `Analyze these search results about the ${brand} paint code ${paintCode} and extract the EXACT color information.

Search Results:
${searchResultsText}

Extract and return ONLY a JSON object with this exact structure:
{
  "found": true/false,
  "colorName": "Official color name",
  "hexBase": "#RRGGBB format",
  "rgbBase": [R, G, B] as numbers 0-255,
  "confidence": "high/medium/low",
  "source": "Which URL had the most reliable info"
}

IMPORTANT Rules:
1. Return ONLY valid JSON, no other text
2. If color found: set found=true and include all fields
3. If no reliable color found: set found=false
4. Prefer official manufacturer sources (${brand.toLowerCase()}.com, automotive databases)
5. hexBase must be uppercase 6-digit hex code starting with #
6. rgbBase must be array of 3 integers between 0-255
7. For metallic colors, estimate a representative base color value`
        }
      ],
      temperature: 0.3, // Low temperature for accurate extraction
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '';

    console.log('[PAINT-COLOR-RESEARCH] AI Response:', responseText);

    // Parse AI response (OpenAI with json_object format returns valid JSON directly)
    let colorData;
    try {
      colorData = JSON.parse(responseText);
    } catch (error) {
      console.error('[PAINT-COLOR-RESEARCH] Failed to parse JSON from AI response:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse color information',
      }, { headers: SECURITY_HEADERS });
    }

    if (!colorData.found) {
      return NextResponse.json({
        success: false,
        error: 'Could not find reliable color information',
      }, { headers: SECURITY_HEADERS });
    }

    // Validate extracted data
    if (!colorData.hexBase || !colorData.rgbBase || colorData.rgbBase.length !== 3) {
      console.error('[PAINT-COLOR-RESEARCH] Invalid color data:', colorData);
      return NextResponse.json({
        success: false,
        error: 'Invalid color data extracted',
      }, { headers: SECURITY_HEADERS });
    }

    console.log('[PAINT-COLOR-RESEARCH] Successfully extracted color:', colorData.colorName);

    return NextResponse.json({
      success: true,
      color: {
        name: colorData.colorName,
        hexBase: colorData.hexBase,
        rgbBase: colorData.rgbBase,
        confidence: colorData.confidence,
        source: colorData.source,
        researched: true,
      },
    }, { headers: SECURITY_HEADERS });

  } catch (error) {
    console.error('[PAINT-COLOR-RESEARCH] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Research failed',
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
