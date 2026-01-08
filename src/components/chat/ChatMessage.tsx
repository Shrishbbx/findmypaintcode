'use client';

import { ChatMessage as ChatMessageType } from '@/types';
import Link from 'next/link';

interface ChatMessageProps {
  message: ChatMessageType;
}

// Parse markdown (bold **text** and links [text](url))
function parseMarkdown(text: string) {
  const elements: React.ReactNode[] = [];
  let key = 0;

  // Split by markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      elements.push(...parseBold(beforeText, key));
      key += 100;
    }

    // Add the link
    const linkText = match[1];
    const linkUrl = match[2];
    elements.push(
      <Link
        key={key++}
        href={linkUrl}
        className="text-blue-600 hover:text-blue-700 underline font-medium"
      >
        {linkText}
      </Link>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last link
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    elements.push(...parseBold(remainingText, key));
  }

  return elements;
}

// Parse bold **text**
function parseBold(text: string, startKey: number) {
  const parts = text.split('**');
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={startKey + i}>{part}</strong> : <span key={startKey + i}>{part}</span>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex gap-2 sm:gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {/* Bot avatar */}
      {isBot && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4 sm:w-5 sm:h-5">
            <path d="M11.5 2a8.5 8.5 0 018.5 8.5c0 1.5-.5 3-1.3 4.2l-.2.3-6.4 6.4c-.5.5-1.2.5-1.7 0l-6.4-6.4-.2-.3A8.5 8.5 0 0111.5 2zm0 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          </svg>
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
          isBot
            ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
            : 'bg-blue-600 text-white'
        }`}
      >
        {/* Message content with markdown support (bold and links) */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {parseMarkdown(message.content)}
        </div>

        {/* Image preview if present */}
        {message.imageUrl && (
          <div className="mt-2 sm:mt-3">
            <img
              src={message.imageUrl}
              alt="Uploaded vehicle"
              className="rounded-xl max-w-full h-auto max-h-40 sm:max-h-56 object-cover"
            />
          </div>
        )}
      </div>

      {/* User avatar - hidden on very small screens */}
      {!isBot && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1 hidden xs:flex">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}
