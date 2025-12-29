interface EraPaintsVideoSectionProps {
  videoId: string;
  title: string;
  repairType?: string;
}

export function EraPaintsVideoSection({
  videoId,
  title,
  repairType,
}: EraPaintsVideoSectionProps) {
  return (
    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border border-red-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-white"
          >
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">How-To Video Guide</h3>
          {repairType && (
            <p className="text-sm text-gray-600 mt-0.5">
              Recommended for your <span className="font-medium text-gray-800">{repairType}</span>{' '}
              repair
            </p>
          )}
        </div>
      </div>

      {/* YouTube iframe embed */}
      <div className="aspect-video rounded-xl overflow-hidden shadow-lg mb-4 bg-gray-900">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-red-500"
          >
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
          </svg>
          <span className="font-medium">From ERA Paints YouTube Channel</span>
        </div>

        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors mt-2"
        >
          <span>Watch on YouTube</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
