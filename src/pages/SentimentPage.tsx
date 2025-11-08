// src/pages/SentimentPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModel } from '../contexts/ModelContext';
import { useUserMode } from '../contexts/UserModeContext';
import { supabase } from '../lib/supabase'; // New: For DB insert

interface SentimentResult {
  topic: string;
  positive: number;
  neutral: number;
  negative: number;
  totalPosts: number;
  explanation: string;
  quotes?: { text: string; sentiment: 'positive' | 'neutral' | 'negative' }[];
  sources?: { title: string; url: string }[];
}

export default function SentimentPage() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { apiKey, model } = useModel();
  const { mode } = useUserMode();

  const analyzeSentiment = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setResult(null);

    if (!apiKey) {
      setResult({
        topic,
        positive: 0,
        neutral: 0,
        negative: 0,
        totalPosts: 0,
        explanation: 'Add your xAI API key in Settings to enable analysis.',
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
              content: `Analyze public sentiment on "${topic}". ${
                isPro
                  ? `Return FULL JSON with quotes and sources.`
                  : `Return only percentages and short summary.`
              }
              Respond **only** with valid JSON:
              {
                "topic": "${topic}",
                "positive": 0-1000,
                "neutral": 0-1000,
                "negative": 0-1000,
                "totalPosts": positive + neutral + negative,
                "explanation": "1-2 sentence summary"${isPro ? `,
                "quotes": [{"text": "quote", "sentiment": "positive|neutral|negative"}],
                "sources": [{"title": "Source", "url": "https://..."}]` : ''}
              }
              No markdown. Max 3 quotes.`,
            },
          ],
          max_tokens: isPro ? 500 : 200,
          temperature: 0.2,
        }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty response');

      const parsed: SentimentResult = JSON.parse(content);

      if (
        typeof parsed.positive !== 'number' ||
        typeof parsed.neutral !== 'number' ||
        typeof parsed.negative !== 'number' ||
        parsed.totalPosts !== parsed.positive + parsed.neutral + parsed.negative
      ) {
        throw new Error('Invalid format');
      }

      setResult(parsed);

      // New: DB Insert (async, user-specific)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('sentiment_history')
          .insert({
            user_id: user.id,
            topic,
            positive: parsed.positive,
            neutral: parsed.neutral,
            negative: parsed.negative,
            totalPosts: parsed.totalPosts,
            explanation: parsed.explanation,
            quotes: parsed.quotes,
            sources: parsed.sources,
          });

        if (error) console.warn('DB save failed:', error.message); // Fallback no UI block
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({
        topic,
        positive: 0,
        neutral: 0,
        negative: 0,
        totalPosts: 0,
        explanation: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type: 'positive' | 'neutral' | 'negative') => {
    if (result) {
      navigate(`/sentiment/${type}`, { state: { result, topic } });
    }
  };

  const total = result ? result.totalPosts : 0;
  const posPct = total > 0 ? (result!.positive / total) * 100 : 0;
  const neuPct = total > 0 ? (result!.neutral / total) * 100 : 0;
  const negPct = total > 0 ? (result!.negative / total) * 100 : 0;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Sentiment Analyzer</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a topic to analyze sentiment..."
        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={analyzeSentiment}
        disabled={loading || !topic.trim()}
        className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition"
      >
        {loading ? 'Analyzing...' : 'Analyze Sentiment'}
      </button>

      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Results for "{result.topic}"</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600">{posPct.toFixed(1)}%</div>
              <p className="text-sm text-green-700">Positive</p>
              <p className="text-2xl font-medium mt-1">{result.positive} posts</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-4xl font-bold text-yellow-600">{neuPct.toFixed(1)}%</div>
              <p className="text-sm text-yellow-700">Neutral</p>
              <p className="text-2xl font-medium mt-1">{result.neutral} posts</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-4xl font-bold text-red-600">{negPct.toFixed(1)}%</div>
              <p className="text-sm text-red-700">Negative</p>
              <p className="text-2xl font-medium mt-1">{result.negative} posts</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border mb-6">
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Based on <strong>{result.totalPosts}</strong> recent public posts.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
              {result.explanation}
            </p>
          </div>

          {mode === 'professional' && result.quotes && result.quotes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border mb-6">
              <h3 className="font-semibold mb-4">Sample Quotes</h3>
              <div className="space-y-4">
                {result.quotes.map((q, i) => (
                  <blockquote
                    key={i}
                    className={`p-4 rounded-lg border-l-4 ${
                      q.sentiment === 'positive'
                        ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                        : q.sentiment === 'neutral'
                        ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20'
                        : 'bg-red-50 border-red-500 dark:bg-red-900/20'
                    }`}
                  >
                    <p className="text-sm italic">"{q.text}"</p>
                    <span
                      className={`text-xs font-medium mt-1 inline-block ${
                        q.sentiment === 'positive'
                          ? 'text-green-700 dark:text-green-400'
                          : q.sentiment === 'neutral'
                          ? 'text-yellow-700 dark:text-yellow-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      — {q.sentiment.toUpperCase()}
                    </span>
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {mode === 'professional' && result.sources && result.sources.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Sources</h3>
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