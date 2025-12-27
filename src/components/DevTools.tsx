'use client';

import { useState, useEffect } from 'react';

const VIEWPORTS = [
  { name: 'Mobile S', width: 320, icon: '📱' },
  { name: 'Mobile M', width: 375, icon: '📱' },
  { name: 'Mobile L', width: 425, icon: '📱' },
  { name: 'Tablet', width: 768, icon: '📲' },
  { name: 'Laptop', width: 1024, icon: '💻' },
  { name: 'Desktop', width: 1440, icon: '🖥️' },
  { name: 'Full', width: 0, icon: '🔲' },
];

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedViewport, setSelectedViewport] = useState<number>(0);
  const [showOutline, setShowOutline] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleViewportChange = (width: number) => {
    setSelectedViewport(width);

    if (width === 0) {
      // Full width - remove constraints
      document.body.style.maxWidth = '';
      document.body.style.margin = '';
      document.body.style.boxShadow = '';
    } else {
      // Apply viewport width
      document.body.style.maxWidth = `${width}px`;
      document.body.style.margin = '0 auto';
      document.body.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
    }
  };

  const toggleOutline = () => {
    setShowOutline(!showOutline);
    if (!showOutline) {
      const style = document.createElement('style');
      style.id = 'dev-outline';
      style.textContent = '* { outline: 1px solid rgba(255,0,0,0.2) !important; }';
      document.head.appendChild(style);
    } else {
      document.getElementById('dev-outline')?.remove();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
        title="Dev Tools"
      >
        🛠️
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9999] bg-gray-900 text-white rounded-xl shadow-2xl p-4 w-72">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Viewport Selector */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Viewport Size</p>
            <div className="grid grid-cols-4 gap-1">
              {VIEWPORTS.map((vp) => (
                <button
                  key={vp.name}
                  onClick={() => handleViewportChange(vp.width)}
                  className={`p-2 text-xs rounded transition-colors ${
                    selectedViewport === vp.width
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={`${vp.name}${vp.width ? ` (${vp.width}px)` : ''}`}
                >
                  <span className="block text-lg">{vp.icon}</span>
                  <span className="block mt-1 truncate">{vp.width || 'Full'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Width Display */}
          <div className="mb-4 p-2 bg-gray-800 rounded text-center">
            <span className="text-xs text-gray-400">Current: </span>
            <span className="text-sm font-mono">
              {selectedViewport || 'Full Width'}
              {selectedViewport ? 'px' : ''}
            </span>
          </div>

          {/* Debug Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showOutline}
                onChange={toggleOutline}
                className="rounded"
              />
              Show element outlines
            </label>
          </div>

          {/* Quick Info */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              Window: <span className="font-mono" id="window-size">-</span>
            </p>
          </div>

          {/* Window Size Tracker */}
          <WindowSizeTracker />
        </div>
      )}
    </>
  );
}

function WindowSizeTracker() {
  useEffect(() => {
    const updateSize = () => {
      const el = document.getElementById('window-size');
      if (el) {
        el.textContent = `${window.innerWidth} × ${window.innerHeight}`;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return null;
}
