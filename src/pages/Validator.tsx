// src/pages/Validator.tsx
import { useState, useMemo } from 'react';
import { useModel } from '../contexts/ModelContext';
import { useUserMode } from '../contexts/UserModeContext';
import { saveToHistory } from '../lib/history';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface Verdict {
  score: number;
  verdict: 'bullshit' | 'mostly true' | 'neutral';
  explanation: string;
  riskAssessment?: string;
  sources?: { title: string; url: string; extract?: string }[];
  sentiment?: { positive: number; neutral: number; negative: number; total: number };
}

export default function Validator() {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());

  const { apiKey, model } = useModel();
  const { mode } = useUserMode();

  const analyze = async () => {
    if (!claim.trim()) return;

    setLoading(true);
    setResult(null);
    setExpandedSources(new Set());

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
                "sources": [3-5 {"title": "Source Name", "url": "https://...", "extract": "50-100 word short extract from the source"}],
                "sentiment": {"positive": 0-100, "neutral": 0-100, "negative": 0-100, "total": sum of 200 sample posts}` : ''}
              }
              No markdown. Professional: Include extracts; Voter: Keep concise.`,
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

      // Local + DB save (optimistic local, pass user_id to history for DB)
      if (parsed.verdict) {
        const { data: { user } } = await supabase.auth.getUser();
        await saveToHistory({
          claim,
          verdict: parsed.verdict,
          score: parsed.score,
          mode,
        }, user?.id); // New: Pass user_id to history.ts
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

  const toggleSource = (index: number) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Validator</h1>
      <textarea
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="Enter a claim to validate..."
        className="w-full p-4 border rounded-lg resize-vertical h-32 focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={analyze}
        disabled={loading || !claim.trim()}
        className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition"
      >
        {loading ? 'Analyzing...' : 'Validate Claim'}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Result</h2>
          {/* Verdict Badge and Score */}
          <div className="mb-4">
            <span className={`px-4 py-2 rounded-full text-lg font-bold ${
              result.verdict === 'bullshit' ? 'bg-red-100 text-red-800' :
              result.verdict === 'mostly true' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {result.verdict === 'bullshit' ? '🛑 Bullshit' : result.verdict === 'mostly true' ? '✅ Mostly True' : '⚖️ Neutral'}
            </span>
            <div className="ml-4 inline-block">
              <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${
                  result.score > 0.7 ? 'bg-red-500' : result.score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                }`} style={{ width: `${result.score * 100}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{(result.score * 100).toFixed(0)}% Confidence</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Explanation</h3>
            <p className="text-gray-700">{result.explanation}</p>
          </div>

          {/* Risk Assessment (Pro Mode) */}
          {result.riskAssessment && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                Risk Assessment
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{result.riskAssessment}</p>
            </div>
          )}

          {/* Sentiment Breakdown (Pro Mode) */}
          {result.sentiment && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Sentiment Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{result.sentiment.positive}</p>
                  <p className="text-sm text-green-700">Positive</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{result.sentiment.neutral}</p>
                  <p className="text-sm text-yellow-700">Neutral</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{result.sentiment.negative}</p>
                  <p className="text-sm text-red-700">Negative</p>
                </div>
              </div>
            </div>
          )}

          {/* Sources (Pro Mode) */}
          {result.sources && result.sources.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Sources</h3>
              <div className="space-y-4">
                {result.sources.map((src, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-1">{src.title}</h4>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {src.url}
                    </a>
                    {src.extract && <p className="text-sm text-gray-600 mt-2">{src.extract}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Mode: <strong>{mode === 'professional' ? 'Professional' : 'Voter'}</strong> | 
        Model: <strong>{model === 'grok-3' ? 'Grok 3' : 'Grok 4'}</strong>
      </div>
    </div>
  );
}