interface PaintLocationSectionProps {
  brand: string;
  model: string;
  year: number;
  locations: string[];
  sources?: string[];
}

export function PaintLocationSection({
  brand,
  model,
  year,
  locations,
  sources = [],
}: PaintLocationSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-blue-600"
          >
            <path
              fillRule="evenodd"
              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
            Where to Find Your Paint Code
          </h3>
          <p className="text-sm text-gray-600 mt-0.5">
            Specifically researched for {year} {brand} {model}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {locations.map((location, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 hover:border-blue-200 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            <p className="text-gray-800 font-medium flex-1 leading-relaxed pt-1">
              {location}
            </p>
          </div>
        ))}
      </div>

      {sources && sources.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Information researched from {sources.length} automotive{' '}
              {sources.length === 1 ? 'source' : 'sources'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
