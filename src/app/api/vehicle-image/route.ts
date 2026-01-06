import { NextResponse, NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';

/**
 * API Route: /api/vehicle-image
 *
 * Fetches publicly available vehicle images from Unsplash API
 * Returns image URL with proper attribution per Unsplash terms
 */

// In-memory cache for vehicle images (30-day TTL)
interface CacheEntry {
  imageUrl: string;
  attribution: string;
  photographer: string;
  photographerUrl: string;
  timestamp: number;
}

const imageCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // SECURITY: Rate limiting (10 requests per minute)
    const rateLimitResult = rateLimit(clientIp, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 10,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    const body = await request.json();
    const { brand, model, year } = body;

    // Validation
    if (!brand || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: brand and model' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `${brand}-${model}-${year || 'any'}`.toLowerCase();

    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        imageUrl: cached.imageUrl,
        attribution: cached.attribution,
        photographer: cached.photographer,
        photographerUrl: cached.photographerUrl,
        cached: true,
      }, { headers: SECURITY_HEADERS });
    }

    // Check if Unsplash API key is configured
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!unsplashAccessKey) {
      // Return placeholder response if API key not configured
      return NextResponse.json({
        success: true,
        imageUrl: null,
        message: 'Unsplash API key not configured. Please add UNSPLASH_ACCESS_KEY to .env.local',
        requiresSetup: true,
      }, { headers: SECURITY_HEADERS });
    }

    // Build search query
    const searchQuery = year
      ? `${year} ${brand} ${model} car`
      : `${brand} ${model} car`;

    // Search Unsplash for vehicle images
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashAccessKey}`,
        },
      }
    );

    if (!unsplashResponse.ok) {
      throw new Error(`Unsplash API error: ${unsplashResponse.statusText}`);
    }

    const unsplashData = await unsplashResponse.json();

    if (unsplashData.results && unsplashData.results.length > 0) {
      // Get the first result (most relevant)
      const photo = unsplashData.results[0];

      const imageData = {
        imageUrl: photo.urls.regular,
        attribution: `Photo by ${photo.user.name} on Unsplash`,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        timestamp: Date.now(),
      };

      // Cache the result
      imageCache.set(cacheKey, imageData);

      // Trigger download tracking per Unsplash API guidelines
      if (photo.links.download_location) {
        fetch(photo.links.download_location, {
          headers: {
            Authorization: `Client-ID ${unsplashAccessKey}`,
          },
        }).catch(err => console.error('Unsplash download tracking error:', err));
      }

      return NextResponse.json({
        success: true,
        imageUrl: imageData.imageUrl,
        attribution: imageData.attribution,
        photographer: imageData.photographer,
        photographerUrl: imageData.photographerUrl,
        cached: false,
      }, { headers: SECURITY_HEADERS });
    } else {
      // No images found
      return NextResponse.json({
        success: true,
        imageUrl: null,
        message: `No images found for ${searchQuery}`,
      }, { headers: SECURITY_HEADERS });
    }
  } catch (error) {
    console.error('Error in vehicle-image API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of imageCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      imageCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour
