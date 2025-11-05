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

  // Get API key and model from context
  const { apiKey, model } = useModel();

  const analyze = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);

    // If no API key, show friendly message
    if (!apiKey) {
      setResult({
        score: 0,
        verdict: 'neutral',
        explanation: 'Please add your xAI API key in Settings to enable real analysis.',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `You are a bullshit detector. Analyze the user's text for political spin, exaggeration, or falsehoods.
              Respond **only** with valid JSON in this exact format:
              {
                "score": 0.0 to 1.0,
                "verdict": "bullshit" | "mostly true" | "neutral",
                "explanation": "1-2 sentence explanation"
              }
              No extra text, no markdown, no code blocks.`,
            },
            { role: 'user', content: input },
          ],
          max_tokens: 150,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) throw new Error('No response from model');

      // Parse JSON from Grok
      let parsed: AnalysisResult;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        throw new Error('Model did not return valid JSON');
      }

      // Validate fields
      if (
        typeof parsed.score !== 'number' ||
        !['bullshit', 'mostly true', 'neutral'].includes(parsed.verdict) ||
        typeof parsed.explanation !== 'string'
      ) {
        throw new Error('Invalid response format');
      }

      setResult(parsed);
    } catch (error) {
      console.error('xAI API Error:', error);
      setResult({
        score: 0,
        verdict: 'neutral',
        explanation: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check your API key and internet connection.`,
      });
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
        />

        <button
          onClick={analyze}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing with Grok...
            </>
          ) : (
            'Detect Bullshit'
          )}
        </button>

        {result && (
          <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold">
                {result.verdict === 'bullshit'
                  ? 'Bullshit'
                  : result.verdict === 'mostly true'
                  ? 'Mostly True'
                  : 'Neutral'}
              </span>
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.score > 0.7
                      ? 'bg-red-500'
                      : result.score > 0.4
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(result.score * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {(result.score * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{result.explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Using model: <strong>{model === 'grok-3' ? 'Grok 3 (Free)' : 'Grok 4 (Premium)'}</strong>
        {apiKey ? ' | API Key Connected' : ' | Add API Key in Settings'}
      </div>
    </div>
  );
}