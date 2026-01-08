'use client';

import { useEffect, useState } from 'react';

interface FunFactsProps {
  brand: string;
  model: string;
  year: number;
  paintCode: string;
  colorName: string;
}

export function FunFacts({ brand, model, year, paintCode, colorName }: FunFactsProps) {
  const [vehicleHistory, setVehicleHistory] = useState<string>('');
  const [colorHeritage, setColorHeritage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchFacts() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch('/api/car-facts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand,
            model,
            year,
            paintCode,
            colorName,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Use new two-section format, fall back to old format for backwards compatibility
          setVehicleHistory(data.vehicleHistory || data.facts || '');
          setColorHeritage(data.colorHeritage || '');
        } else {
          console.error('Facts & History API returned error:', data);
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch facts and history:', err);
        console.error('This usually means the OPENAI_API_KEY environment variable is not set in production.');
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchFacts();
  }, [brand, model, year, paintCode, colorName]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border border-purple-100 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-600 animate-pulse">
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Facts & History</h3>
            <p className="text-sm text-gray-600 mt-0.5">Discovering interesting details...</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    // TEMPORARILY show error in production for debugging
    // TODO: Change back to hiding after Vercel issue is resolved
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-600">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-yellow-900">Facts & History Temporarily Unavailable</h3>
        </div>
        <p className="text-sm text-yellow-700">
          We're experiencing technical difficulties loading vehicle history.
          {process.env.NODE_ENV === 'development' && ' Check console for details.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border border-purple-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-600">
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">Facts & History</h3>
          <p className="text-sm text-gray-600 mt-0.5">About your {year} {brand} {model}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Vehicle History Section */}
        {vehicleHistory && (
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-600">
                <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
              </svg>
              Vehicle History
            </h4>
            <p className="text-gray-700 leading-relaxed">{vehicleHistory}</p>
          </div>
        )}

        {/* Color Heritage Section */}
        {colorHeritage && (
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-600">
                <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L6.56 10l1.72-1.72zm4.5-1.06a.75.75 0 10-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25z" clipRule="evenodd" />
              </svg>
              Your Color: {colorName}
            </h4>
            <p className="text-gray-700 leading-relaxed">{colorHeritage}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-purple-200">
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">AI-generated insights based on automotive history</span>
        </div>
      </div>
    </div>
  );
}
