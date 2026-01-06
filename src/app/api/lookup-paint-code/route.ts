import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { searchByBrandAndCode, type PaintCodeData } from '@/lib/csv-parser';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';

/**
 * API Route: /api/lookup-paint-code
 *
 * Searches for paint code in Colordata1.csv database
 * If not found, returns status indicating web search fallback needed
 */
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
    const { brand, code } = body;

    // Validation
    if (!brand || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: brand and code' },
        { status: 400 }
      );
    }

    if (typeof brand !== 'string' || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Brand and code must be strings' },
        { status: 400 }
      );
    }

    // Search in Colordata1.csv
    const result = await searchByBrandAndCode(brand, code);

    if (result) {
      // Paint code found in database
      return NextResponse.json({
        success: true,
        found: true,
        data: {
          brand: result.brand,
          code: result.code,
          colorName: result.colorName,
          rgbHighlight: result.rgbHighlight,
          rgbBase: result.rgbBase,
          rgbShadow: result.rgbShadow,
          hexHighlight: rgbToHex(...result.rgbHighlight),
          hexBase: rgbToHex(...result.rgbBase),
          hexShadow: rgbToHex(...result.rgbShadow),
          type: result.type,
          gloss: result.gloss,
          price: result.price,
          asins: {
            proKit: result.asinProKit,
            essentialKit: result.asinEssentialKit,
            premiumKit: result.asinPremiumKit,
            basicKit: result.asinBasicKit
          },
          productTitle: result.productTitle
        }
      }, { headers: SECURITY_HEADERS });
    } else {
      // Paint code not found - indicate web search needed
      return NextResponse.json({
        success: true,
        found: false,
        message: `Paint code ${code} for ${brand} not found in database`,
        fallbackToWebSearch: true
      }, { headers: SECURITY_HEADERS });
    }
  } catch (error) {
    console.error('Error in lookup-paint-code API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * Convert RGB values to hex color code
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
