import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';
import { webSearchCache, cacheKeys } from '@/lib/cache';
import type { WebSearchResponse } from '@/types';

// SECURITY: Rate limit (3 requests per minute - expensive operation!)
const WEB_SEARCH_RATE_LIMIT = {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 3, // 3 requests/min
};

// Cache for 24 hours (search results don't change often)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Google Custom Search API configuration
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX;

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // SECURITY: Rate limiting (3 requests per minute per IP)
    const rateLimitResult = rateLimit(clientIp, WEB_SEARCH_RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          results: [],
          cached: false,
          error: 'Too many search requests. Please wait before trying again.',
        } as WebSearchResponse,
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Parse request body
    const body = await request.json();
    const { query, maxResults = 5, searchType } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        {
          success: false,
          results: [],
          cached: false,
          error: 'Query is required',
        } as WebSearchResponse,
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Check cache first
    const cacheKey = cacheKeys.webSearch(query);
    const cachedResults = webSearchCache.get(cacheKey);

    if (cachedResults) {
      console.log('[WEB-SEARCH] Cache hit:', query);
      return NextResponse.json(
        {
          success: true,
          results: cachedResults,
          cached: true,
        } as WebSearchResponse,
        { headers: SECURITY_HEADERS }
      );
    }

    // Validate API keys
    if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_CX) {
      console.error('[WEB-SEARCH] Missing Google Search API credentials');
      return NextResponse.json(
        {
          success: false,
          results: [],
          cached: false,
          error: 'Search service not configured',
        } as WebSearchResponse,
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Execute Google Custom Search
    console.log('[WEB-SEARCH] Searching:', query, '| Type:', searchType);

    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', GOOGLE_SEARCH_API_KEY);
    searchUrl.searchParams.set('cx', GOOGLE_SEARCH_CX);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('num', Math.min(maxResults, 10).toString());

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[WEB-SEARCH] Google API error:', response.status, response.statusText);
      throw new Error(`Google Search API returned ${response.status}`);
    }

    const data = await response.json();

    // Transform Google results to our format
    const results = (data.items || []).map((item: unknown) => {
      const googleItem = item as {
        title: string;
        snippet: string;
        link: string;
      };

      return {
        title: googleItem.title,
        snippet: googleItem.snippet,
        url: googleItem.link,
      };
    });

    // Cache the results
    webSearchCache.set(cacheKey, results, CACHE_TTL_MS);

    console.log('[WEB-SEARCH] Found', results.length, 'results');

    return NextResponse.json(
      {
        success: true,
        results,
        cached: false,
      } as WebSearchResponse,
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[WEB-SEARCH] Error:', error);

    return NextResponse.json(
      {
        success: false,
        results: [],
        cached: false,
        error: error instanceof Error ? error.message : 'Search failed',
      } as WebSearchResponse,
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
