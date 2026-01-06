import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Rate limit: 5 requests per minute (expensive operation)
const RATE_LIMIT = {
  interval: 60 * 1000,
  uniqueTokenPerInterval: 5,
};

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

    console.log('[PAINT-COLOR-RESEARCH] Researching:', brand, paintCode);

    // Step 1: Search the web for paint code information
    const searchQuery = `${brand} paint code ${paintCode} color RGB hex`;

    const searchResponse = await fetch(`${request.nextUrl.origin}/api/web-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery, maxResults: 5 }),
    });

    const searchData = await searchResponse.json();

    if (!searchData.success || !searchData.results || searchData.results.length === 0) {
      console.log('[PAINT-COLOR-RESEARCH] No search results found');
      return NextResponse.json({
        success: false,
        error: 'No color information found online',
      }, { headers: SECURITY_HEADERS });
    }

    // Step 2: Use AI to extract color information from search results
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const searchResultsText = searchData.results
      .map((r: { title: string; snippet: string; url: string }) =>
        `Title: ${r.title}\nSnippet: ${r.snippet}\nURL: ${r.url}`
      )
      .join('\n\n');

    const prompt = `You are a color extraction expert. Analyze these search results about the ${brand} paint code ${paintCode} and extract the EXACT color information.

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

Rules:
1. Return ONLY valid JSON, no other text
2. If color found: set found=true and include all fields
3. If no reliable color found: set found=false
4. Prefer official manufacturer sources (${brand.toLowerCase()}.com, automotive databases)
5. hexBase must be uppercase 6-digit hex code starting with #
6. rgbBase must be array of 3 integers between 0-255`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log('[PAINT-COLOR-RESEARCH] AI Response:', responseText);

    // Parse AI response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[PAINT-COLOR-RESEARCH] Failed to extract JSON from AI response');
      return NextResponse.json({
        success: false,
        error: 'Failed to parse color information',
      }, { headers: SECURITY_HEADERS });
    }

    const colorData = JSON.parse(jsonMatch[0]);

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
