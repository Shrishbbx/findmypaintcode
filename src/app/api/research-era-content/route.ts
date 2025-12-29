import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';
import { eraContentCache, cacheKeys } from '@/lib/cache';
import type { EraContentResponse, WebSearchResponse } from '@/types';

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Rate limiting (5 requests per minute)
const RATE_LIMIT = {
  interval: 60 * 1000,
  uniqueTokenPerInterval: 5,
};

// Cache for 7 days (ERA content updated occasionally)
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(clientIp, RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          cached: false,
          error: 'Too many research requests. Please wait.',
        } as EraContentResponse,
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Parse request
    const body = await request.json();
    const { brand, model, repairType, repairProblem } = body;

    if (!brand || !model) {
      return NextResponse.json(
        {
          success: false,
          cached: false,
          error: 'Brand and model are required',
        } as EraContentResponse,
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Check cache first
    const cacheKey = cacheKeys.eraContent(brand, model, repairType || 'touchup');
    const cachedData = eraContentCache.get(cacheKey);

    if (cachedData) {
      console.log('[ERA-CONTENT] Cache hit:', cacheKey);
      return NextResponse.json(
        {
          success: true,
          article: cachedData.article,
          video: cachedData.video,
          cached: true,
        } as EraContentResponse,
        { headers: SECURITY_HEADERS }
      );
    }

    console.log('[ERA-CONTENT] Researching for:', brand, model, repairType);

    // Step 1: Search for ERA Paints articles
    const articleQuery = `site:erapaints.com ${brand} ${model} ${repairType || 'touch up paint'} automotive paint`;

    let articleResults: WebSearchResponse | null = null;
    try {
      const articleResponse = await fetch(`${request.nextUrl.origin}/api/web-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: articleQuery,
          maxResults: 5,
          searchType: 'era_content'
        }),
      });

      if (articleResponse.ok) {
        articleResults = await articleResponse.json() as WebSearchResponse;
      }
    } catch (error) {
      console.error('[ERA-CONTENT] Article search error:', error);
    }

    // Step 2: Search for ERA Paints YouTube videos
    const videoQuery = `site:youtube.com/erapaints ${repairType || 'touch up'} automotive paint ${brand}`;

    let videoResults: WebSearchResponse | null = null;
    try {
      const videoResponse = await fetch(`${request.nextUrl.origin}/api/web-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: videoQuery,
          maxResults: 5,
          searchType: 'era_content'
        }),
      });

      if (videoResponse.ok) {
        videoResults = await videoResponse.json() as WebSearchResponse;
      }
    } catch (error) {
      console.error('[ERA-CONTENT] Video search error:', error);
    }

    // Step 3: Use AI to select the best article and video
    const articleContext = articleResults?.results?.map((r, i) =>
      `[Article ${i + 1}]\nTitle: ${r.title}\nSnippet: ${r.snippet}\nURL: ${r.url}`
    ).join('\n\n') || 'No articles found';

    const videoContext = videoResults?.results?.map((r, i) =>
      `[Video ${i + 1}]\nTitle: ${r.title}\nSnippet: ${r.snippet}\nURL: ${r.url}`
    ).join('\n\n') || 'No videos found';

    const selectionPrompt = `You are helping users find ERA Paints content for their vehicle repair.

Vehicle: ${brand} ${model}
Repair Type: ${repairType || 'touch up'}
Problem: ${repairProblem || 'general paint repair'}

Available Articles:
${articleContext}

Available Videos:
${videoContext}

Select the SINGLE BEST article and the SINGLE BEST video that would be most helpful for this user.

Respond in JSON format:
{
  "article": {
    "title": "string",
    "url": "string (full URL)",
    "snippet": "string (brief description)",
    "relevance": number (1-10)
  } or null if no good match,
  "video": {
    "title": "string",
    "url": "string (full YouTube URL)",
    "videoId": "string (extract from URL - the v= parameter)",
    "thumbnail": "string (YouTube thumbnail URL: https://img.youtube.com/vi/{videoId}/maxresdefault.jpg)",
    "relevance": number (1-10)
  } or null if no good match,
  "reasoning": "string - why you chose these"
}

Guidelines:
- Prioritize content that matches the repair type (e.g., spray can for large areas, touch-up pen for chips)
- For videos, extract the YouTube video ID from the URL (e.g., youtube.com/watch?v=ABC123 → videoId: "ABC123")
- Only select content with relevance >= 5
- If no relevant content found, set to null`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at selecting the most relevant automotive paint repair content for users.',
        },
        {
          role: 'user',
          content: selectionPrompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const selectionText = aiResponse.choices[0]?.message?.content || '{}';

    let selection;
    try {
      selection = JSON.parse(selectionText);
    } catch {
      console.error('[ERA-CONTENT] Failed to parse AI selection');
      return NextResponse.json(
        {
          success: false,
          cached: false,
          error: 'Failed to process ERA content',
        } as EraContentResponse,
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    const article = selection.article && selection.article.relevance >= 5 ? {
      title: selection.article.title,
      url: selection.article.url,
      snippet: selection.article.snippet,
      relevance: selection.article.relevance,
    } : undefined;

    const video = selection.video && selection.video.relevance >= 5 ? {
      title: selection.video.title,
      url: selection.video.url,
      videoId: selection.video.videoId,
      thumbnail: selection.video.thumbnail,
      relevance: selection.video.relevance,
    } : undefined;

    console.log('[ERA-CONTENT] Selected:', {
      hasArticle: !!article,
      hasVideo: !!video,
      reasoning: selection.reasoning,
    });

    // Cache the results
    eraContentCache.set(cacheKey, {
      article,
      video,
      researched: true,
    }, CACHE_TTL_MS);

    return NextResponse.json(
      {
        success: true,
        article,
        video,
        cached: false,
      } as EraContentResponse,
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[ERA-CONTENT] Error:', error);

    return NextResponse.json(
      {
        success: false,
        cached: false,
        error: 'Failed to research ERA Paints content',
      } as EraContentResponse,
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
