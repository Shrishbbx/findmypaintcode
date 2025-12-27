'use client';

import { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { ChatContainer } from '@/components/chat';

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header showBack={showChat} onBack={() => setShowChat(false)} />
      
      <main className="pt-16">
        {!showChat ? (
          /* Landing Page */
          <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-blue-700">AI-Powered Color Matching</span>
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

              {/* CTA Button */}
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              >
                Find My Paint Code
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* How it Works Section */}
            <div id="how-it-works" className="w-full max-w-5xl mx-auto mt-24 mb-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How it Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                    <span className="text-xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tell Us Your Car</h3>
                  <p className="text-gray-600">
                    Select your make, model, and year — or upload a photo and let AI identify it.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                    <span className="text-xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Your Color</h3>
                  <p className="text-gray-600">
                    We&apos;ll show you exactly where to find the paint code on your vehicle.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                    <span className="text-xl font-bold text-blue-600">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Your Paint</h3>
                  <p className="text-gray-600">
                    Order the exact matching touch-up paint from trusted retailers.
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
        <p>Powered by <span className="font-semibold text-gray-700">ERAPAINTS</span></p>
      </footer>
    </div>
  );
}
