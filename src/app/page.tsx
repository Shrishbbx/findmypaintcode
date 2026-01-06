'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/Header';
import { ChatContainer } from '@/components/chat';
import { Loading } from '@/components/ui/Loading';
import { HeroAnimation } from '@/components/ui/HeroAnimation';

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Show loading animation for 3.5 seconds on initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showBack={showChat} onBack={() => setShowChat(false)} />

      <main className="pt-16">
        {!showChat ? (
          /* Landing Page */
          <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badges */}
              <div className="inline-flex items-center gap-3 mb-8 mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-blue-700">AI-Powered Color Matching</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-green-700">100% Free</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Find your car&apos;s exact{' '}
                <span className="text-blue-600">paint code</span>{' '}
                in seconds.
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                Don&apos;t guess your color. Our AI assistant helps you identify the perfect 
                paint match for your specific make, model, and year.
              </p>

              {/* CTA Button with Laser Scanner */}
              <div className="relative inline-block">
                <button
                  onClick={() => setShowChat(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Find My Paint Code
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Laser Scanner Beam - shoots downward when scanning */}
                {isScanning && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-32 h-48 pointer-events-none z-50">
                    {/* Core laser beam */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/80 via-cyan-400/60 to-transparent animate-laser-scan" />

                    {/* Bright center line */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-white via-cyan-300 to-transparent animate-laser-pulse" />

                    {/* Side scanning lines */}
                    <div className="absolute left-[30%] w-0.5 h-full bg-gradient-to-b from-blue-400/50 to-transparent animate-laser-scan" style={{ animationDelay: '0.1s' }} />
                    <div className="absolute right-[30%] w-0.5 h-full bg-gradient-to-b from-blue-400/50 to-transparent animate-laser-scan" style={{ animationDelay: '0.2s' }} />

                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400/40 to-transparent blur-md animate-laser-glow" />
                  </div>
                )}
              </div>

              {/* Animated Cars */}
              <HeroAnimation onScanningChange={setIsScanning} />
            </div>

            {/* How it Works Section */}
            <div id="how-it-works" className="w-full max-w-5xl mx-auto mt-24 mb-16">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Three simple steps to perfect paint
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  No guesswork. No expensive trips to the dealership. Just the exact color you need.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 - Camera/Photo */}
                <div className="bg-gradient-to-br from-blue-50/40 to-indigo-50/40 rounded-2xl p-8 shadow-sm border border-blue-100/50 hover:shadow-lg transition-shadow group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 text-blue-600">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">STEP 1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Click an image of your color</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Snap a quick photo of your car&apos;s paint. Our AI instantly recognizes your vehicle&apos;s exact shade—even in different lighting.
                  </p>
                </div>

                {/* Step 2 - AI/Discovery */}
                <div className="bg-gradient-to-br from-purple-50/40 to-pink-50/40 rounded-2xl p-8 shadow-sm border border-purple-100/50 hover:shadow-lg transition-shadow group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 text-purple-600">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                      <path d="M11 8a3 3 0 0 0-3 3"></path>
                      <circle cx="8" cy="14" r="1" fill="currentColor"></circle>
                      <circle cx="14" cy="14" r="1" fill="currentColor"></circle>
                    </svg>
                  </div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">STEP 2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">We find your color</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our AI scans thousands of paint codes in milliseconds to match your car&apos;s factory finish. Then we show you exactly where to locate it.
                  </p>
                </div>

                {/* Step 3 - Paint/Success */}
                <div className="bg-gradient-to-br from-green-50/40 to-emerald-50/40 rounded-2xl p-8 shadow-sm border border-green-100/50 hover:shadow-lg transition-shadow group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 text-green-600">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"></circle>
                      <path d="m8 16 1.5-1.5"></path>
                      <path d="M14.5 9.5 16 8"></path>
                    </svg>
                  </div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">STEP 3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">You get your final paint</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Order professional-grade touch-up paint from trusted suppliers. Perfect color match guaranteed—no more touch-ups that don&apos;t match.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-4xl">
              <ChatContainer />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer id="support" className="py-8 text-center text-sm text-gray-500 border-t border-gray-100 bg-white">
        <p>
          Powered by{' '}
          <a
            href="https://erapaints.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-700 hover:text-blue-600 transition-colors underline-offset-2 hover:underline"
          >
            ERAPAINTS
          </a>
          {' '} · <span className="text-xs">v1.0 - Auto-Deploy ✨</span>
        </p>
      </footer>
    </div>
  );
}
