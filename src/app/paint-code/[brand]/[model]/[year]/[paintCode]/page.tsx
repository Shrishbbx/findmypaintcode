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

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
          </svg>
          Start New Search
        </Link>

        {/* Vehicle info */}
        <div className="mb-8">
          <p className="text-muted mb-2">Your Vehicle</p>
          <h1 className="text-3xl font-bold text-foreground">
            {yearNum} {brand.name} {model.name}
          </h1>
        </div>

        {/* Paint code card */}
        <div className="bg-secondary/50 border border-border rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Color swatch */}
            {paintCode.hex && (
              <div
                className="w-24 h-24 rounded-xl border-4 border-white shadow-lg flex-shrink-0"
                style={{ backgroundColor: paintCode.hex }}
              />
            )}

            <div className="flex-1">
              <p className="text-muted mb-1">Paint Code</p>
              <h2 className="text-4xl font-bold text-foreground mb-2">{paintCode.code}</h2>
              <p className="text-xl text-foreground">{paintCode.name}</p>
            </div>
          </div>
        </div>

        {/* Where to find it */}
        <div className="bg-secondary/50 border border-border rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Where to Find Your Paint Code
          </h3>
          <p className="text-muted mb-4">
            To verify this paint code, check your vehicle at these locations:
          </p>
          <ul className="space-y-3">
            {codeLocations.map((location, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary flex-shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                </svg>
                <span className="text-foreground">{location}</span>
              </li>
            ))}
          </ul>

          {/* Placeholder for location image */}
          <div className="mt-6 p-6 border-2 border-dashed border-border rounded-xl text-center">
            <p className="text-muted">
              [Diagram showing paint code location will be added here]
            </p>
          </div>
        </div>

        {/* Purchase options */}
        <div className="bg-secondary/50 border border-border rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Buy Your Touch-Up Paint
          </h3>
          <p className="text-muted mb-6">
            Get the perfect match for your {brand.name} {model.name}. Available from these trusted retailers:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ERAPAINTS - Primary */}
            <a
              href={paintCode.purchaseLinks?.erapaints || '#'}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z" clipRule="evenodd" />
              </svg>
              ERAPAINTS (Recommended)
            </a>

            {/* Amazon */}
            <a
              href={paintCode.purchaseLinks?.amazon || '#'}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-background border border-border rounded-xl font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Amazon
            </a>

            {/* Walmart */}
            <a
              href={paintCode.purchaseLinks?.walmart || '#'}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-background border border-border rounded-xl font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Walmart
            </a>
          </div>

          <p className="text-sm text-muted mt-4 text-center">
            * Links will be populated with actual product URLs from the database
          </p>
        </div>

        {/* Need help? */}
        <div className="mt-8 text-center">
          <p className="text-muted mb-4">Not the right color?</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-border transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
            </svg>
            Try Again with Our Assistant
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted border-t border-border">
        <p>Powered by ERAPAINTS</p>
      </footer>
    </div>
  );
}
