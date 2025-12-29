interface EraPaintsArticleSectionProps {
  title: string;
  url: string;
  snippet: string;
}

export function EraPaintsArticleSection({
  title,
  url,
  snippet,
}: EraPaintsArticleSectionProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-white"
          >
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">Helpful Guide</h3>
          <p className="text-xs text-gray-600 mt-0.5">From ERA Paints Knowledge Base</p>
        </div>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <h4 className="text-base font-semibold text-blue-600 group-hover:text-blue-700 mb-3 leading-snug transition-colors">
          {title}
        </h4>

        <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
          {snippet}
        </p>

        <div className="flex items-center gap-2 text-sm font-medium text-purple-600 group-hover:text-purple-700 transition-colors">
          <span>Read full article</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </a>

      <div className="mt-4 pt-4 border-t border-purple-200/50">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-purple-500"
          >
            <path
              fillRule="evenodd"
              d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>Expert tips and detailed instructions</span>
        </div>
      </div>
    </div>
  );
}
