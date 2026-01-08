'use client';

import { useEffect, useState } from 'react';
import { YouTubeEmbed } from '../ui/YouTubeEmbed';

interface VideoMessageProps {
  brand: string;
}

export function VideoMessage({ brand }: VideoMessageProps) {
  const [video, setVideo] = useState<{
    embedUrl: string;
    title: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch('/api/get-brand-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand }),
        });

        const data = await response.json();

        if (data.success && data.video) {
          setVideo({
            embedUrl: data.video.embedUrl,
            title: data.video.title,
          });
        }
      } catch (error) {
        console.error('[VIDEO] Error fetching video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [brand]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl">
        <div className="flex gap-2 items-center text-gray-600">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Loading video...</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
          <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
        </svg>
        <h4 className="text-sm font-semibold text-gray-900">
          📍 Video Guide: How to Find Your Paint Code
        </h4>
      </div>
      <YouTubeEmbed
        embedUrl={video.embedUrl}
        title={video.title}
      />
      <p className="text-xs text-gray-500 mt-3">
        💡 Watch this quick guide to find exactly where your paint code is located on your {brand}.
      </p>
    </div>
  );
}
