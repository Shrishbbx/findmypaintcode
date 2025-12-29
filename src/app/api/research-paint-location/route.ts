import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';
import { paintLocationCache, cacheKeys } from '@/lib/cache';
import type { PaintLocationResponse, WebSearchResponse } from '@/types';
import { getPaintCodeLocationByBrand } from '@/data/paint-code-locations';

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Rate limiting (5 requests per minute)
const RATE_LIMIT = {
  interval: 60 * 1000,
  uniqueTokenPerInterval: 5,
};

// Cache for 30 days (paint code locations rarely change)
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(clientIp, RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          locations: [],
          sources: [],
          cached: false,
          error: 'Too many research requests. Please wait.',
        } as PaintLocationResponse,
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Parse request
    const body = await request.json();
    const { brand, model, year } = body;

    if (!brand || !model || !year) {
      return NextResponse.json(
        {
          success: false,
          locations: [],
          sources: [],
          cached: false,
          error: 'Brand, model, and year are required',
        } as PaintLocationResponse,
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Check cache first
    const cacheKey = cacheKeys.paintLocation(brand, model, year);
    const cachedData = paintLocationCache.get(cacheKey);

    if (cachedData) {
      console.log('[PAINT-LOCATION] Cache hit:', cacheKey);
      return NextResponse.json(
        {
          success: true,
          locations: cachedData.locations,
          sources: cachedData.sources,
          cached: true,
        } as PaintLocationResponse,
        { headers: SECURITY_HEADERS }
      );
    }

    console.log('[PAINT-LOCATION] Researching:', brand, model, year);

    // Step 1: Check local paint code location database first
    const localData = getPaintCodeLocationByBrand(brand);

    if (localData) {
      console.log('[PAINT-LOCATION] Found in local database for brand:', brand);

      // Format the local data into location strings
      const locations = [
        ...localData.paintCodeLocations.map((loc, idx) =>
          idx === 0 ? `${loc} (most common)` : loc
        ),
        ...localData.detailedSteps.slice(0, 3),
      ].slice(0, 4); // Limit to 4 locations

      const result = {
        locations,
        sources: ['Local Paint Code Location Database'],
        researched: true,
      };

      // Cache the results
      paintLocationCache.set(cacheKey, result, CACHE_TTL_MS);

      return NextResponse.json(
        {
          success: true,
          locations: result.locations,
          sources: result.sources,
          cached: false,
          fromDatabase: true,
        } as PaintLocationResponse,
        { headers: SECURITY_HEADERS }
      );
    }

    console.log('[PAINT-LOCATION] Brand not in local database, falling back to web search');

    // Step 2: Fallback to web search for paint code location information
    const searchQueries = [
      `${brand} ${model} ${year} paint code location where to find`,
      `where is paint code on ${brand} ${model}`,
    ];

    const allResults: WebSearchResponse[] = [];

    for (const query of searchQueries) {
      try {
        const searchResponse = await fetch(`${request.nextUrl.origin}/api/web-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, maxResults: 3 }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json() as WebSearchResponse;
          allResults.push(searchData);
        }
      } catch (error) {
        console.error('[PAINT-LOCATION] Search error:', error);
        // Continue with other searches
      }
    }

    // Combine all search results
    const combinedResults = allResults.flatMap(r => r.results);

    if (combinedResults.length === 0) {
      console.log('[PAINT-LOCATION] No search results found');
      return NextResponse.json(
        {
          success: false,
          locations: [],
          sources: [],
          cached: false,
          error: 'No location information found',
        } as PaintLocationResponse,
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // Step 2: Use AI to synthesize search results into structured locations
    const searchContext = combinedResults
      .map((r, i) => `[Source ${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`)
      .join('\n\n---\n\n');

    const synthesisPrompt = `Based on these web search results about where to find the paint code on a ${year} ${brand} ${model}, create a clear, structured list of locations.

Search Results:
${searchContext}

Create a JSON response with:
{
  "locations": [
    "string - specific location #1 (e.g., 'Driver side door jamb on a label')",
    "string - specific location #2",
    "string - specific location #3 (if applicable)"
  ],
  "sources": [
    "URL from most helpful source",
    "URL from second most helpful source"
  ],
  "confidence": "high|medium|low"
}

Guidelines:
- Be SPECIFIC about locations (e.g., "Driver side door jamb" not just "door jamb")
- Include all common locations for this specific vehicle
- List most common location first
- Keep each location concise (one sentence)
- Only include locations mentioned in the search results
- Include 2-4 locations maximum
- Provide 1-2 source URLs that were most helpful`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at synthesizing automotive information from web search results.',
        },
        {
          role: 'user',
          content: synthesisPrompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.3, // Low temperature for factual accuracy
      response_format: { type: 'json_object' },
    });

    const synthesisText = aiResponse.choices[0]?.message?.content || '{}';

    let synthesized;
    try {
      synthesized = JSON.parse(synthesisText);
    } catch {
      console.error('[PAINT-LOCATION] Failed to parse AI response');
      return NextResponse.json(
        {
          success: false,
          locations: [],
          sources: [],
          cached: false,
          error: 'Failed to process location data',
        } as PaintLocationResponse,
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    const locations = synthesized.locations || [];
    const sources = synthesized.sources || [];

    // Validate we got useful data
    if (locations.length === 0) {
      console.log('[PAINT-LOCATION] No locations extracted');
      return NextResponse.json(
        {
          success: false,
          locations: [],
          sources: [],
          cached: false,
          error: 'No specific locations found',
        } as PaintLocationResponse,
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // Cache the results
    paintLocationCache.set(cacheKey, {
      locations,
      sources,
      researched: true,
    }, CACHE_TTL_MS);

    console.log('[PAINT-LOCATION] Found', locations.length, 'locations');

    return NextResponse.json(
      {
        success: true,
        locations,
        sources,
        cached: false,
      } as PaintLocationResponse,
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[PAINT-LOCATION] Error:', error);

    return NextResponse.json(
      {
        success: false,
        locations: [],
        sources: [],
        cached: false,
        error: 'Failed to research paint code location',
      } as PaintLocationResponse,
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
