import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBrandBySlug, getModelByName, getPaintCodeByCode, getAllPaintCodePaths } from '@/data/paint-codes';

interface PageProps {
  params: Promise<{
    brand: string;
    model: string;
    year: string;
    paintCode: string;
  }>;
}

// Generate static paths for all paint codes
export async function generateStaticParams() {
  return getAllPaintCodePaths();
}

export async function generateMetadata({ params }: PageProps) {
  const { brand: brandSlug, model: modelSlug, year, paintCode: paintCodeSlug } = await params;

  const brand = getBrandBySlug(brandSlug);
  if (!brand) return { title: 'Paint Code Not Found' };

  const model = brand.models.find(
    m => m.name.toLowerCase().replace(/\s+/g, '-') === modelSlug.toLowerCase()
  );
  if (!model) return { title: 'Paint Code Not Found' };

  const paintCode = model.paintCodes.find(
    p => p.code.toLowerCase().replace(/\s+/g, '-') === paintCodeSlug.toLowerCase()
  );
  if (!paintCode) return { title: 'Paint Code Not Found' };

  return {
    title: `${paintCode.code} ${paintCode.name} - ${year} ${brand.name} ${model.name} Paint Code`,
    description: `Find touch-up paint for your ${year} ${brand.name} ${model.name}. Paint code: ${paintCode.code} (${paintCode.name}). Buy from ERAPAINTS and other trusted retailers.`,
  };
}

export default async function PaintCodeResultPage({ params }: PageProps) {
  const { brand: brandSlug, model: modelSlug, year, paintCode: paintCodeSlug } = await params;

  // Look up the data
  const brand = getBrandBySlug(brandSlug);
  if (!brand) notFound();

  const model = brand.models.find(
    m => m.name.toLowerCase().replace(/\s+/g, '-') === modelSlug.toLowerCase()
  );
  if (!model) notFound();

  const yearNum = parseInt(year);
  if (!model.years.includes(yearNum)) notFound();

  const paintCode = model.paintCodes.find(
    p => p.code.toLowerCase().replace(/\s+/g, '-') === paintCodeSlug.toLowerCase()
  );
  if (!paintCode) notFound();

  // Get code locations
  const codeLocations = model.codeLocations || brand.codeLocations || ['Driver side door jamb'];

  // Build Amazon link from ASIN (example format)
  // In production, this would come from your CSV data with actual ASINs
  const amazonLink = paintCode.purchaseLinks?.amazon || 'https://www.amazon.com/s?k=automotive+touch+up+paint';

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
                {/* Color Swatch */}
                {paintCode.hex && (
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-28 h-28 md:w-32 md:h-32 rounded-2xl shadow-xl border-4 border-white ring-1 ring-gray-200"
                      style={{ backgroundColor: paintCode.hex }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-500">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Your Paint Code</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">{paintCode.code}</h2>
                  <p className="text-xl md:text-2xl text-gray-700 font-medium mb-4">{paintCode.name}</p>
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

            {/* Where to Find It Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
                    <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Find Your Paint Code</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Verify by checking these locations on your vehicle</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {codeLocations.map((location, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-800 font-medium flex-1">{location}</p>
                  </div>
                ))}
              </div>

              {/* Diagram Placeholder with Better Styling */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <p className="text-gray-500 font-medium">Visual diagram coming soon</p>
                <p className="text-sm text-gray-400 mt-1">Location guide for {brand.name} {model.name}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Options */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Main Purchase Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-bold">Buy Touch-Up Paint</h3>
                </div>
                <p className="text-blue-100 text-sm mb-6">Professional-grade paint, guaranteed factory match</p>

                {/* ERA Paints Primary CTA */}
                <a
                  href={paintCode.purchaseLinks?.erapaints || amazonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mb-4 px-6 py-4 bg-white text-blue-600 rounded-xl font-bold text-center hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Shop ERA Paints</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs text-blue-500 mt-1 font-normal">Recommended • Fast Shipping</p>
                </a>

                {/* Product Options */}
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">Touch-Up Pen</span>
                      <span className="text-sm font-bold">$14.99</span>
                    </div>
                    <p className="text-xs text-blue-100">Perfect for small chips and scratches</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">Aerosol Spray Can</span>
                      <span className="text-sm font-bold">$29.99</span>
                    </div>
                    <p className="text-xs text-blue-100">Best for larger areas and panels</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">Complete Kit</span>
                      <span className="text-sm font-bold">$39.99</span>
                    </div>
                    <p className="text-xs text-blue-100">Includes clear coat and applicator</p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-white/20 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-200">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-100">Color Match Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-200">
                      <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                    </svg>
                    <span className="text-blue-100">1000+ 5-Star Reviews</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-200">
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                    </svg>
                    <span className="text-blue-100">Free Shipping Over $25</span>
                  </div>
                </div>
              </div>

              {/* Alternative Retailers */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Also Available At:</h4>
                <div className="space-y-2">
                  <a
                    href={paintCode.purchaseLinks?.amazon || amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <span className="font-medium text-gray-700">Amazon</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href={paintCode.purchaseLinks?.walmart || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <span className="font-medium text-gray-700">Walmart</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5">
                <h4 className="font-semibold text-gray-900 mb-2">Not the right color?</h4>
                <p className="text-sm text-gray-600 mb-4">Our AI assistant can help you find the perfect match</p>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.102 41.102 0 01-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 01-1.33 0l-1.713-3.293a.783.783 0 00-.642-.413 41.108 41.108 0 01-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
                  </svg>
                  Try Again
                </Link>
              </div>
            </div>
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
