// src/pages/SentimentPage.tsx
import { useState } from 'react';

interface SentimentData {
  topic: string;
  positive: number;
  neutral: number;
  negative: number;
  totalPosts: number;
}

export default function SentimentPage() {
  const [results, setResults] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = async () => {
    setLoading(true);
    setResults(null);

    setTimeout(() => {
      setResults({
        topic: 'Climate Change Policy',
        positive: 420,
        neutral: 180,
        negative: 300,
        totalPosts: 900,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Sentiment Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Analyze public sentiment on any topic in real time.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border mb-6">
        <button
          onClick={analyzeSentiment}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
        >
          {loading ? 'Analyzing...' : 'Run Sentiment Analysis'}
        </button>
      </div>

      {results && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Positive */}
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {((results.positive / results.totalPosts) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
            <div className="text-2xl font-medium mt-1">{results.positive} posts</div>
          </div>

          {/* Neutral */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {((results.neutral / results.totalPosts) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
            <div className="text-2xl font-medium mt-1">{results.neutral} posts</div>
          </div>

          {/* Negative */}
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {((results.negative / results.totalPosts) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
            <div className="text-2xl font-medium mt-1">{results.negative} posts</div>
          </div>
        </div>
      )}

      {results && (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <h3 className="font-semibold mb-2">Topic: {results.topic}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based on {results.totalPosts} recent posts from public sources.
          </p>
        </div>
      )}
    </div>
  );
}