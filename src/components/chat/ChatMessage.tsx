'use client';

import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex gap-2 sm:gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {/* Bot avatar */}
      {isBot && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600">
            <path d="M12 2a2 2 0 012 2v1h2a4 4 0 014 4v9a4 4 0 01-4 4H8a4 4 0 01-4-4V9a4 4 0 014-4h2V4a2 2 0 012-2zm-3 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
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
        {/* Message content with basic markdown support */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content.split('**').map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          )}
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
