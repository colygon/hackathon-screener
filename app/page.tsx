'use client';

import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Upload a CSV file to screen hackathon applicants');

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          🚀 Hackathon Screener
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          {message}
        </p>
        
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center">
            <p className="text-lg text-gray-700">
              This tool analyzes GitHub profiles to identify open-source contributors
            </p>
            <p className="text-sm text-gray-500 mt-4">
              API integration coming soon...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
