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
  const [facts, setFacts] = useState<string>('');
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

        if (data.success && data.facts) {
          setFacts(data.facts);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch fun facts:', err);
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
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Fun Facts & History</h3>
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
    return null; // Gracefully hide if error occurs
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
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">Fun Facts & History</h3>
          <p className="text-sm text-gray-600 mt-0.5">About your {year} {brand} {model}</p>
        </div>
      </div>

      <div className="prose prose-sm md:prose-base max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{facts}</p>
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
