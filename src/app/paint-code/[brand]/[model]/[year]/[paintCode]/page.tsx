import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBrandBySlug, getModelByName, getPaintCodeByCode, getAllPaintCodePaths } from '@/data/paint-codes';
import { findPaintCode } from '@/lib/paintDatabase';
import { loadVideoDatabase, getVideoByBrand } from '@/lib/video-helpers';
import { FunFacts } from '@/components/FunFacts';
import { PaintLocationSection } from '@/components/PaintLocationSection';
import { EraPaintsVideoSection } from '@/components/EraPaintsVideoSection';
import { EraPaintsArticleSection } from '@/components/EraPaintsArticleSection';
import ColorSwatch from '@/components/ColorSwatch';
import { ProductPurchaseSection } from '@/components/ProductPurchaseSection';
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed';
import type { PaintCodeHex } from '@/types';

interface PageProps {
  params: Promise<{
    brand: string;
    model: string;
    year: string;
    paintCode: string;
  }>;
  searchParams: Promise<{
    hex?: string;
    repairType?: string;
    recommendedProduct?: string;
    locations?: string;
    eraArticle?: string;
    eraVideo?: string;
  }>;
}

// Generate static paths for all paint codes
export async function generateStaticParams() {
  return getAllPaintCodePaths();
}

// Allow dynamic params for AI-detected paint codes not in database
export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps) {
  const { brand: brandSlug, model: modelSlug, year, paintCode: paintCodeSlug } = await params;

  const brand = getBrandBySlug(brandSlug) || {
    name: brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1),
    slug: brandSlug,
    models: [],
  };

  const model = brand.models.find(
    m => m.name.toLowerCase().replace(/\s+/g, '-') === modelSlug.toLowerCase()
  ) || {
    name: modelSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    years: [],
    paintCodes: [],
  };

  const paintCode = model.paintCodes.find(
    p => p.code.toLowerCase().replace(/\s+/g, '-') === paintCodeSlug.toLowerCase()
  ) || {
    code: paintCodeSlug.toUpperCase().replace(/-/g, ' '),
    name: '', // Empty - will be populated by web research if available
  };

  return {
    title: paintCode.name
      ? `${paintCode.code} ${paintCode.name} - ${year} ${brand.name} ${model.name} Paint Code`
      : `${paintCode.code} - ${year} ${brand.name} ${model.name} Paint Code`,
    description: paintCode.name
      ? `Find touch-up paint for your ${year} ${brand.name} ${model.name}. Paint code: ${paintCode.code} (${paintCode.name}). Buy from ERAPAINTS and other trusted retailers.`
      : `Find touch-up paint for your ${year} ${brand.name} ${model.name}. Paint code: ${paintCode.code}. Buy from ERAPAINTS and other trusted retailers.`,
  };
}

export default async function PaintCodeResultPage({ params, searchParams }: PageProps) {
  const { brand: brandSlug, model: modelSlug, year, paintCode: paintCodeSlug } = await params;
  const {
    hex: hexFromUrl,
    repairType,
    recommendedProduct,
    locations: locationsParam,
    eraArticle: articleParam,
    eraVideo: videoParam,
  } = await searchParams;

  // Parse and validate year first
  const yearNum = parseInt(year);
  if (isNaN(yearNum) || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) notFound();

  // Look up the data
  let brand = getBrandBySlug(brandSlug);

  // If brand not in database, create fallback brand object
  if (!brand) {
    brand = {
      name: brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1),
      slug: brandSlug,
      models: [],
      codeLocations: ['Driver side door jamb', 'Inside driver door frame'],
    };
  }

  let model = brand.models.find(
    m => m.name.toLowerCase().replace(/\s+/g, '-') === modelSlug.toLowerCase()
  );

  // If model not in database, create fallback model object
  if (!model) {
    model = {
      name: modelSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      years: [yearNum],
      paintCodes: [],
    };
  }

  let paintCode = model.paintCodes.find(
    p => p.code.toLowerCase().replace(/\s+/g, '-') === paintCodeSlug.toLowerCase()
  );

  // If paint code not found in this model, try other models of the same brand
  // (AI might have picked the wrong model but right brand/paint code)
  if (!paintCode) {
    for (const otherModel of brand.models) {
      paintCode = otherModel.paintCodes.find(
        p => p.code.toLowerCase().replace(/\s+/g, '-') === paintCodeSlug.toLowerCase()
      );
      if (paintCode) {
        // Found it in another model - use that model's data instead
        // (but keep the year the user specified)
        break;
      }
    }
  }

  // If still not found in old database, check the new paint database
  // Keep paintCodeFromDb separate for swatch rendering with full RGB data
  const paintCodeFromDb = findPaintCode(brand.name, paintCodeSlug.toUpperCase().replace(/-/g, ' '));
  if (!paintCode && paintCodeFromDb) {
    // Use the database entry directly as paintCode (it has all required fields)
    paintCode = paintCodeFromDb as any; // Type cast to avoid conflicts with old PaintCode interface
  }

  // If still not found, try web research to get accurate color data
  // Also research if we don't have a color name yet
  let researchedColor = null;
  const hasRealColorName = paintCode && paintCode.name && paintCode.name.trim() !== '';

  if (!hasRealColorName && !paintCodeFromDb && !hexFromUrl) {
    console.log('[PAINT-COLOR] Paint code not in database, attempting web research for:', paintCodeSlug);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const researchResponse = await fetch(`${apiUrl}/api/research-paint-color`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.name,
          paintCode: paintCodeSlug.toUpperCase().replace(/-/g, ' '),
        }),
        cache: 'no-store', // Don't cache during development
      });

      const researchData = await researchResponse.json();
      console.log('[PAINT-COLOR] Research API response:', JSON.stringify(researchData, null, 2));
      console.log('[PAINT-COLOR] Response status:', researchResponse.status);

      if (researchData.success && researchData.color) {
        researchedColor = researchData.color;
        console.log('[PAINT-COLOR] ✓ Web research succeeded! Found color:', researchedColor.name);
      } else {
        console.error('[PAINT-COLOR] ✗ Web research failed:', researchData.error || 'No color data returned');
        console.error('[PAINT-COLOR] Full error response:', JSON.stringify(researchData, null, 2));
      }
    } catch (error) {
      console.error('[PAINT-COLOR] ✗ Web research request failed:', error);
      // Continue without researched color - will use fallback
    }
  } else {
    console.log('[PAINT-COLOR] Skipping web research - using existing data:', {
      hasPaintCode: !!paintCode,
      hasPaintCodeFromDb: !!paintCodeFromDb,
      hasHexFromUrl: !!hexFromUrl
    });
  }

  // Update paintCode with researched data if we got better information
  if (researchedColor && paintCode) {
    // Update existing paintCode with researched data
    paintCode = {
      ...paintCode,
      name: researchedColor.name,
      hex: researchedColor.hexBase,
    } as any;
  } else if (!paintCode) {
    // Create fallback paint code object if still not found
    paintCode = {
      code: paintCodeSlug.toUpperCase().replace(/-/g, ' '),
      name: researchedColor?.name || '', // Empty string - don't show placeholder text
      hex: researchedColor?.hexBase || hexFromUrl || '#808080', // Default to gray if no color found
    } as any; // Type cast for researched colors without full RGB data
  }

  // At this point, paintCode is guaranteed to be defined (either from DB or fallback)
  // TypeScript doesn't understand this, so we assert it's defined
  if (!paintCode) {
    // This should never happen, but satisfies TypeScript
    notFound();
  }

  // Get code locations (use researched data if available, otherwise fall back to database)
  const researchedLocations = locationsParam ? (() => {
    try {
      return JSON.parse(locationsParam);
    } catch {
      return null;
    }
  })() : null;

  const codeLocations = model.codeLocations || brand.codeLocations || ['Driver side door jamb'];

  // Parse ERA Paints content
  const eraArticle = articleParam ? (() => {
    try {
      return JSON.parse(articleParam);
    } catch {
      return null;
    }
  })() : null;

  const eraVideo = videoParam ? (() => {
    try {
      return JSON.parse(videoParam);
    } catch {
      return null;
    }
  })() : null;

  // Load brand-specific instructional video
  const videos = await loadVideoDatabase();
  const brandVideo = getVideoByBrand(videos, brand.name);

  // Use hex color from URL if provided, otherwise use from database or researched color
  // Use base color from new database if available
  const hexColorRaw = hexFromUrl || researchedColor?.hexBase || paintCodeFromDb?.hex.base || paintCode?.hex;
  const hexColor = typeof hexColorRaw === 'string' ? hexColorRaw : (hexColorRaw as PaintCodeHex)?.base;

  // Create RGB object from researched color for swatch rendering
  // If we have researched color with RGB, use it. Otherwise, we'll fall back to hex
  const researchedColorRgb = researchedColor?.rgbBase ? {
    highlight: researchedColor.rgbBase,
    base: researchedColor.rgbBase,
    shadow: researchedColor.rgbBase,
  } : null;

  // Determine if we should show the 3D gradient swatch or simple swatch
  const has3DSwatchData = paintCodeFromDb?.hex || researchedColorRgb;
  const hasSimpleSwatchData = hexColor && !has3DSwatchData;

  // Build Amazon link from ASIN (example format)
  // In production, this would come from your CSV data with actual ASINs
  const amazonLink = paintCode?.purchaseLinks?.amazon || 'https://www.amazon.com/s?k=automotive+touch+up+paint';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Start New Search</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Success Banner */}
        <div className="mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-green-700">Perfect Match Found!</span>
          </div>
          <p className="text-gray-600 mb-2">Your Vehicle</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {yearNum} {brand.name} {model.name}
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Paint Code Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paint Code Hero Card */}
            <div className="bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 border border-blue-100/50 rounded-3xl p-8 md:p-10 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Color Swatch - Always show if we have any color data */}
                <div className="relative flex-shrink-0">
                  {/* Use 3D gradient swatch if database entry or researched color available */}
                  {has3DSwatchData ? (
                    <div className="relative">
                      <ColorSwatch hex={paintCodeFromDb?.hex || researchedColorRgb!} size={128} showBorder={true} />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center ring-2 ring-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-500">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    /* Fallback to simple square swatch for colors with only hex data */
                    <div className="relative">
                      <div
                        className="w-28 h-28 md:w-32 md:h-32 rounded-2xl shadow-xl border-4 border-white ring-1 ring-gray-200"
                        style={{ backgroundColor: hexColor || '#808080' }}
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center ring-2 ring-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-500">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Your Paint Code</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">{paintCode.code}</h2>
                  {paintCode.name && (
                    <p className="text-xl md:text-2xl text-gray-700 font-medium mb-4">{paintCode.name}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-blue-200 rounded-full text-sm font-medium text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Factory Match
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-green-200 rounded-full text-sm font-medium text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                      </svg>
                      OEM Certified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paint Code Location Section - Use researched data if available */}
            {researchedLocations ? (
              <PaintLocationSection
                brand={brand.name}
                model={model.name}
                year={yearNum}
                locations={researchedLocations.locations}
                sources={researchedLocations.sources}
              />
            ) : (
              /* Fallback to basic location display */
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
                      <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Find Your Paint Code</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Common locations on your vehicle</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {codeLocations.map((location, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-gray-800 font-medium flex-1">{location}</p>
                    </div>
                  ))}
                </div>

                {/* Brand-specific instructional video */}
                {brandVideo && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
                        <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                      </svg>
                      Video Guide: How to Find Your {brand.name} Paint Code
                    </h4>
                    <YouTubeEmbed
                      embedUrl={brandVideo.embedUrl}
                      title={brandVideo.title}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ERA Paints Video Section */}
            {eraVideo && (
              <EraPaintsVideoSection
                videoId={eraVideo.videoId}
                title={eraVideo.title}
                repairType={repairType}
              />
            )}

            {/* ERA Paints Article Section */}
            {eraArticle && (
              <EraPaintsArticleSection
                title={eraArticle.title}
                url={eraArticle.url}
                snippet={eraArticle.snippet}
              />
            )}

            {/* Fun Facts & History Section */}
            <FunFacts
              brand={brand.name}
              model={model.name}
              year={yearNum}
              paintCode={paintCode.code}
              colorName={paintCode.name}
            />
          </div>

          {/* Right Column - Purchase Options */}
          <div className="lg:col-span-1">
            <ProductPurchaseSection repairType={repairType} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-sm text-gray-500 border-t border-gray-100 bg-gray-50">
        <p>
          Powered by{' '}
          <a
            href="https://erapaints.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-700 hover:text-blue-600 transition-colors underline-offset-2 hover:underline"
          >
            ERAPAINTS
          </a>
          {' '}• Professional automotive touch-up paint since 1978
        </p>
      </footer>
    </div>
  );
}
