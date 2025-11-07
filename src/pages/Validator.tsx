// src/pages/Validator.tsx
import { useState, useMemo } from 'react';
import { useModel } from '../contexts/ModelContext';
import { useUserMode } from '../contexts/UserModeContext';
import { saveToHistory } from '../lib/history';

interface Verdict {
  score: number;
  verdict: 'bullshit' | 'mostly true' | 'neutral';
  explanation: string;
  riskAssessment?: string; // New: Professional only
  sources?: { title: string; url: string }[];
  sentiment?: { positive: number; neutral: number; negative: number; total: number };
}

export default function Validator() {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);

  const { apiKey, model } = useModel();
  const { mode } = useUserMode();

  const analyze = async () => {
    if (!claim.trim()) return;

    setLoading(true);
    setResult(null);

    if (!apiKey) {
      setResult({
        score: 0,
        verdict: 'neutral',
        explanation: 'Add your xAI API key in Settings to validate claims.',
      });
      setLoading(false);
      return;
    }

    try {
      const isPro = mode === 'professional';

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
              content: `You are a professional fact-checker. Analyze: "${claim}".
              Respond **only** with valid JSON:
              {
                "score": 0.0-1.0,
                "verdict": "bullshit" | "mostly true" | "neutral",
                "explanation": "Detailed 3-4 sentence analysis with evidence breakdown"${isPro ? `,
                "riskAssessment": "1-2 sentence risk level (low/medium/high) with why",
                "sources": [3-5 {"title": "Source", "url": "https://..."}],
                "sentiment": {"positive": 0-100, "neutral": 0-100, "negative": 0-100, "total": sum of 200 sample posts}` : ''}
              }
              No markdown. Professional: Include citations; Voter: Keep concise.`,
            },
          ],
          max_tokens: isPro ? 800 : 200,
          temperature: 0.1,
        }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty response');

      const parsed: Verdict = JSON.parse(content);

      if (
        typeof parsed.score !== 'number' ||
        !['bullshit', 'mostly true', 'neutral'].includes(parsed.verdict)
      ) {
        throw new Error('Invalid format');
      }

      setResult(parsed);

      // Save to history
      if (parsed.verdict) {
        saveToHistory({
          claim,
          verdict: parsed.verdict,
          score: parsed.score,
          mode,
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setResult({
        score: 0,
        verdict: 'neutral',
        explanation: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const sentimentPie = useMemo(() => {
    if (!result?.sentiment || result.sentiment.total === 0) return null;
    const { positive, neutral, negative, total } = result.sentiment;
    return (
      <div className="relative">
        <div className="flex justify-center items-center w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {((total > 0 ? total / 200 * 100 : 0).toFixed(0))}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Coverage</div>
          </div>
        </div>
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-full" />
        </div>
        <style jsx>{`
          .pie {
            position: relative;
            width: 32px;
            height: 32px;
          }
        `}</style>
      </div>
    );
  }, [result]);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Validator</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {mode === 'professional'
          ? 'Professional-grade claim validation with sources and sentiment.'
          : 'Quick truth check for any claim.'}
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border mb-8">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && analyze()}
          placeholder="e.g., The moon landing was faked..."
          className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          disabled={loading}
        />
        <button
          onClick={analyze}
          disabled={loading || !claim.trim()}
          className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
              Validating...
            </>
          ) : (
            'Validate Claim'
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Verdict */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold">
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

          {/* Pro: Risk Assessment */}
          {mode === 'professional' && result.riskAssessment && (
            <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold mb-2">Risk Assessment</h3>
              <p className="text-orange-800 dark:text-orange-300 text-sm">{result.riskAssessment}</p>
            </div>
          )}

          {/* Pro: Sentiment */}
          {mode === 'professional' && result.sentiment && result.sentiment.total > 0 && (
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border">
              <h3 className="font-semibold mb-4">Public Sentiment (200 Sample Posts)</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {((result.sentiment.positive / result.sentiment.total) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {((result.sentiment.neutral / result.sentiment.total) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {((result.sentiment.negative / result.sentiment.total) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
                </div>
              </div>
            </div>
          )}

          {/* Pro: Sources */}
          {mode === 'professional' && result.sources && result.sources.length > 0 && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-semibold mb-4">Sources (3-5 Citations)</h3>
              <ul className="space-y-2">
                {result.sources.map((src, i) => (
                  <li key={i}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline text-sm flex items-center gap-1"
                    >
                      {src.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {result && result.explanation.includes('Add your xAI API key') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            {result.explanation}{' '}
            <a href="/settings" className="underline font-medium">
              Go to Settings
            </a>
          </p>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Mode: <strong>{mode === 'professional' ? 'Professional' : 'Voter'}</strong> | 
        Model: <strong>{model === 'grok-3' ? 'Grok 3' : 'Grok 4'}</strong>
      </div>
    </div>
  );
}