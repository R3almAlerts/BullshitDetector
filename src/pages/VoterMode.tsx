// src/pages/VoterMode.tsx
import { useState } from 'react';
import { useModel } from '../contexts/ModelContext';

interface AnalysisResult {
  score: number;
  verdict: 'bullshit' | 'mostly true' | 'neutral';
  explanation: string;
}

export default function VoterMode() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { model } = useModel();

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);

    // Mock AI response (replace with real xAI call later)
    setTimeout(() => {
      const fake = {
        score: Math.random(),
        verdict: ['bullshit', 'mostly true', 'neutral'][Math.floor(Math.random() * 3)] as any,
        explanation: 'This statement contains exaggerated claims without evidence.',
      };
      setResult(fake);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Voter Mode</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Paste a political statement, headline, or claim to check for spin.
      </p>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., This candidate will cut taxes for everyone by 50%..."
          className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />

        <button
          onClick={analyze}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Analyzing...' : 'Detect Bullshit'}
        </button>

        {result && (
          <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">
                {result.verdict === 'bullshit' ? 'Bullshit' : result.verdict === 'mostly true' ? 'Mostly True' : 'Neutral'}
              </span>
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    result.score > 0.7 ? 'bg-red-500' : result.score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${result.score * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{(result.score * 100).toFixed(0)}%</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{result.explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Using model: <strong>{model}</strong>
      </div>
    </div>
  );
}