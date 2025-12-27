'use client';

import Link from 'next/link';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

export function Header({ onBack, showBack = false }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Paint brush icon */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-5 h-5"
            >
              <path d="M11.5 2a8.5 8.5 0 018.5 8.5c0 1.5-.5 3-1.3 4.2l-.2.3-6.4 6.4c-.5.5-1.2.5-1.7 0l-6.4-6.4-.2-.3A8.5 8.5 0 0111.5 2zm0 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
            </svg>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            FindMyPaintCode
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Back to Home
            </button>
          ) : (
            <>
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                How it Works
              </Link>
              <Link href="#support" className="text-gray-600 hover:text-gray-900 transition-colors">
                Support
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
