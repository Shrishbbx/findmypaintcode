import { NextRequest, NextResponse } from 'next/server';
import { loadVideoDatabase, getVideoByBrand } from '@/lib/video-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand } = body;

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand is required' },
        { status: 400 }
      );
    }

    // Load video database
    const videos = await loadVideoDatabase();

    // Find video for the brand
    const video = getVideoByBrand(videos, brand);

    if (video) {
      return NextResponse.json({
        success: true,
        video: {
          brand: video.brand,
          title: video.title,
          url: video.url,
          embedUrl: video.embedUrl,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No video found for this brand',
        brand,
      });
    }
  } catch (error) {
    console.error('[API] Error fetching brand video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}
