// src/pages/HistoryPage.tsx
import { useState, useEffect } from 'react';

interface AnalysisResult {
  id: string;
  text: string;
  verdict: 'bullshit' | 'mostly true' | 'neutral';
  score: number;
  explanation: string;
  timestamp: number;
}

type VerdictLevel = 'bullshit' | 'mostly true' | 'neutral';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<VerdictLevel | 'all'>('all');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bullshit-history');
    if (saved) {
      setAnalyses(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever analyses change
  useEffect(() => {
    localStorage.setItem('bullshit-history', JSON.stringify(analyses));
  }, [analyses]);

  // Filter results
  const filtered = analyses
    .filter(a => filterVerdict === 'all' || a.verdict === filterVerdict)
    .filter(a => a.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.timestamp - a.timestamp);

  const clearHistory = () => {
    if (confirm('Delete all history?')) {
      setAnalyses([]);
      localStorage.removeItem('bullshit-history');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Review and search past bullshit detections.
      </p>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search analyses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />

        <select
          value={filterVerdict}
          onChange={(e) => setFilterVerdict(e.target.value as any)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="all">All Verdicts</option>
          <option value="bullshit">Bullshit</option>
          <option value="mostly true">Mostly True</option>
          <option value="neutral">Neutral</option>
        </select>

        <button
          onClick={clearHistory}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Clear All
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {analyses.length === 0 ? 'No analyses yet. Try detecting some bullshit!' : 'No results match your filters.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((analysis) => (
            <div
              key={analysis.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {new Date(analysis.timestamp).toLocaleString()}
                  </p>
                  <p className="font-medium">{analysis.text}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.verdict === 'bullshit' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    analysis.verdict === 'mostly true' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {analysis.verdict === 'bullshit' ? 'Bullshit' : analysis.verdict === 'mostly true' ? 'Mostly True' : 'Neutral'}
                  </span>
                  <span className="text-sm font-bold">{(analysis.score * 100).toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}