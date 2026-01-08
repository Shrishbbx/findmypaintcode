'use client';

interface YouTubeEmbedProps {
  embedUrl: string;
  title: string;
  className?: string;
}

export function YouTubeEmbed({ embedUrl, title, className = '' }: YouTubeEmbedProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg border-2 border-gray-200 shadow-md"
        />
      </div>
    </div>
  );
}
