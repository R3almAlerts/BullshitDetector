// src/pages/ProfessionalMode.tsx
import { useState } from 'react';
import { useModel } from '../contexts/ModelContext';

interface SentimentResult {
  topic: string;
  positive: number;
  neutral: number;
  negative: number;
  totalPosts: number;
  explanation: string;
  quotes: { text: string; sentiment: 'positive' | 'neutral' | 'negative' }[];
  sources: { title: string; url: string }[];
}

export default function ProfessionalMode() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { apiKey, model } = useModel();

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
        explanation: 'Please add your xAI API key in Settings to run real analysis.',
        quotes: [],
        sources: [],
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
              content: `You are a professional sentiment analyst.
              Analyze current public opinion on: "${topic}".
              Respond **only** with valid JSON in this exact format:
              {
                "topic": "${topic}",
                "positive": 0-1000,
                "neutral": 0-1000,
                "negative": 0-1000,
                "totalPosts": positive + neutral + negative,
                "explanation": "2-3 sentence summary of sentiment trend",
                "quotes": [
                  {"text": "short quote", "sentiment": "positive|neutral|negative"}
                ],
                "sources": [
                  {"title": "Source Name", "url": "https://..."}
                ]
              }
              No markdown, no extra text. Max 3 quotes.`,
            },
          ],
          max_tokens: 400,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API ${response.status}: ${err}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) throw new Error('Empty response');

      let parsed: SentimentResult;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('Invalid JSON from model');
      }

      // Validate
      if (
        typeof parsed.positive !== 'number' ||
        typeof parsed.neutral !== 'number' ||
        typeof parsed.negative !== 'number' ||
        parsed.totalPosts !== parsed.positive + parsed.neutral + parsed.negative ||
        !Array.isArray(parsed.quotes) ||
        !Array.isArray(parsed.sources)
      ) {
        throw new Error('Invalid response format');
      }

      setResult(parsed);
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      setResult({
        topic,
        positive: 0,
        neutral: 0,
        negative: 0,
        totalPosts: 0,
        explanation: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        quotes: [],
        sources: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const total = result ? result.totalPosts : 0;
  const posPct = total > 0 ? (result!.positive / total) * 100 : 0;
  const neuPct = total > 0 ? (result!.neutral / total) * 100 : 0;
  const negPct = total > 0 ? (result!.negative / total) * 100 : 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Professional Mode</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        In-depth public sentiment analysis with quotes and sources.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyzeSentiment()}
            placeholder="e.g., Universal Basic Income, AI Regulation..."
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
            disabled={loading}
          />
          <button
            onClick={analyzeSentiment}
            disabled={loading || !topic.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Sentiment'
            )}
          </button>
        </div>
      </div>

      {result && total === 0 && !result.explanation.includes('Please add') && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No data returned. Try a different topic.
        </div>
      )}

      {result && total > 0 && (
        <>
          {/* Sentiment Bars */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {posPct.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
              <div className="text-2xl font-medium mt-1">{result.positive} posts</div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                {neuPct.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
              <div className="text-2xl font-medium mt-1">{result.neutral} posts</div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                {negPct.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
              <div className="text-2xl font-medium mt-1">{result.negative} posts</div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border mb-6">
            <h3 className="font-semibold mb-2">Analysis: {result.topic}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Based on <strong>{result.totalPosts}</strong> recent public posts.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
              {result.explanation}
            </p>
          </div>

          {/* Quotes */}
          {result.quotes.length > 0 && (
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

          {/* Sources */}
          {result.sources.length > 0 && (
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
        </>
      )}

      {result && result.explanation.includes('Please add') && (
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
        Using model: <strong>{model === 'grok-3' ? 'Grok 3 (Free)' : 'Grok 4 (Premium)'}</strong>
        {apiKey ? ' | API Key Connected' : ' | Add API Key in Settings'}
      </div>
    </div>
  );
}