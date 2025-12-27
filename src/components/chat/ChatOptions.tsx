'use client';

import { ChatOption } from '@/types';

interface ChatOptionsProps {
  options: ChatOption[];
  onSelect: (option: ChatOption) => void;
}

export function ChatOptions({ options, onSelect }: ChatOptionsProps) {
  return (
    <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white/80 border-t border-gray-100">
      <p className="text-xs text-gray-500 mb-2 sm:mb-3">Quick options:</p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 bg-white text-gray-700 text-xs sm:text-sm font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all active:scale-95"
          >
            {/* Color swatch if hex is provided */}
            {option.hex && (
              <span
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: option.hex }}
              />
            )}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
