// src/pages/HistoryPage.tsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trash2, AlertCircle, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getHistory, clearHistory, type HistoryItem } from '../lib/history';

interface ValidationHistory extends HistoryItem {
  type: 'validation';
  explanation?: string;
  riskAssessment?: string;
  sources?: { title: string; url: string; extract?: string }[];
  sentiment?: { positive: number; neutral: number; negative: number; total: number };
}

interface SentimentHistory {
  id: string;
  type: 'sentiment';
  topic: string;
  positive: number;
  neutral: number;
  negative: number;
  totalPosts: number;
  explanation: string;
  quotes?: { text: string; sentiment: 'positive' | 'neutral' | 'negative' }[];
  sources?: { title: string; url: string }[];
  timestamp: number;
  mode: 'voter' | 'professional';
}

type UnifiedHistory = ValidationHistory | SentimentHistory;

export default function HistoryPage() {
  const [history, setHistory] = useState<UnifiedHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'validation' | 'sentiment'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Local cache fallback
      let localRaw: any = getHistory();
      const localHistory = Array.isArray(localRaw) ? localRaw : [];

      const { data: { user } } = await supabase.auth.getUser();
      let dbHistory: UnifiedHistory[] = [];

      if (user) {
        // Fetch validation
        const { data: validationData } = await supabase
          .from('validation_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch sentiment
        const { data: sentimentData } = await supabase
          .from('sentiment_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Map to UnifiedHistory
        const validationMapped = (validationData || []).map((item: any) => ({
          ...item,
          type: 'validation' as const,
          timestamp: new Date(item.created_at).getTime(),
        })) as ValidationHistory[];

        const sentimentMapped = (sentimentData || []).map((item: any) => ({
          ...item,
          type: 'sentiment' as const,
          timestamp: new Date(item.created_at).getTime(),
          mode: item.mode || 'voter', // Fallback
        })) as SentimentHistory[];

        dbHistory = [...validationMapped, ...sentimentMapped];
      }

      // Prefer DB, fallback/append local (hybrid)
      const unified = dbHistory.length > 0 ? dbHistory : localHistory.map((item: any) => ({ ...item, type: 'validation' as const }));
      setHistory(unified.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('History load failed:', err);
      // Fallback to local
      const localRaw: any = getHistory();
      const localHistory = Array.isArray(localRaw) ? localRaw : [];
      setHistory(localHistory.sort((a, b) => b.timestamp - a.timestamp) as UnifiedHistory[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const toggleExpand = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const filteredHistory = activeTab === 'all' ? history : history.filter(h => h.type === activeTab);

  const deleteAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Delete validation
        const { error: vError } = await supabase
          .from('validation_history')
          .delete()
          .eq('user_id', user.id);
        if (vError) console.warn('Supabase validation delete failed:', vError.message);

        // Delete sentiment
        const { error: sError } = await supabase
          .from('sentiment_history')
          .delete()
          .eq('user_id', user.id);
        if (sError) console.warn('Supabase sentiment delete failed:', sError.message);
      }
      clearHistory();
      setHistory([]);
      setSelectedId(null);
    } catch (err) {
      console.error('Delete all failed:', err);
    }
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-500">Loading history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">History</h1>
        {filteredHistory.length > 0 && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete All
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800">
          {['all', 'validation', 'sentiment'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'all' | 'validation' | 'sentiment')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === tab
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'validation' ? 'Validation' : 'Sentiment'}
            </button>
          ))}
        </nav>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No {activeTab === 'all' ? 'history' : activeTab} yet.</p>
          <p className="text-sm mt-2">Start {activeTab === 'all' ? 'analyzing' : activeTab === 'validation' ? 'validating claims' : 'sentiment analysis'} to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
              {/* Card Header */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-expanded={selectedId === item.id}
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(item.timestamp), 'MMM d, yyyy • h:mm a')}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'validation' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {item.type === 'validation' ? 'Validation' : 'Sentiment'}
                    </span>
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {item.mode === 'professional' ? 'Pro' : 'Voter'}
                    </span>
                  </p>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${selectedId === item.id ? 'rotate-180' : ''}`} 
                  />
                </div>
                <p className="font-medium text-gray-900 dark:text-white mb-2">
                  {item.type === 'validation' ? item.claim : item.topic}
                </p>
                {item.type === 'validation' && (
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      (item as ValidationHistory).verdict === 'bullshit' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      (item as ValidationHistory).verdict === 'mostly true' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {(item as ValidationHistory).verdict === 'bullshit' ? 'Bullshit' : (item as ValidationHistory).verdict === 'mostly true' ? 'Mostly True' : 'Neutral'}
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          (item as ValidationHistory).score > 0.7 ? 'bg-red-500' : (item as ValidationHistory).score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(item as ValidationHistory).score * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {((item as ValidationHistory).score * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {item.type === 'sentiment' && (
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {item.totalPosts} Posts
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.explanation.substring(0, 50)}...
                    </span>
                  </div>
                )}
              </button>

              {/* Expanded Details */}
              {selectedId === item.id && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto transition-all duration-300 ease-in-out">
                  {item.type === 'validation' && (
                    <>
                      {(item as ValidationHistory).explanation && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Explanation</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{(item as ValidationHistory).explanation}</p>
                        </div>
                      )}
                      {(item as ValidationHistory).riskAssessment && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Risk Assessment</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">{(item as ValidationHistory).riskAssessment}</p>
                        </div>
                      )}
                      {(item as ValidationHistory).sources && (item as ValidationHistory).sources.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sources</h3>
                          <ul className="space-y-2">
                            {(item as ValidationHistory).sources.map((source, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                  >
                                    {source.title}
                                  </a>
                                  {source.extract && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{source.extract}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(item as ValidationHistory).sentiment && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sentiment</h3>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {((item as ValidationHistory).sentiment.positive / (item as ValidationHistory).sentiment.total * 100).toFixed(0)}%
                              </div>
                              <p className="text-xs text-gray-500">Positive</p>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-yellow-600">
                                {((item as ValidationHistory).sentiment.neutral / (item as ValidationHistory).sentiment.total * 100).toFixed(0)}%
                              </div>
                              <p className="text-xs text-gray-500">Neutral</p>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-red-600">
                                {((item as ValidationHistory).sentiment.negative / (item as ValidationHistory).sentiment.total * 100).toFixed(0)}%
                              </div>
                              <p className="text-xs text-gray-500">Negative</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {item.type === 'sentiment' && (
                    <>
                      {item.explanation && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Explanation</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item.explanation}</p>
                        </div>
                      )}
                      {item.quotes && item.quotes.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quotes</h3>
                          <div className="space-y-2">
                            {item.quotes.map((q, i) => (
                              <blockquote key={i} className={`p-3 rounded-lg ${
                                q.sentiment === 'positive' ? 'bg-green-50 border-l-green-500' :
                                q.sentiment === 'neutral' ? 'bg-yellow-50 border-l-yellow-500' :
                                'bg-red-50 border-l-red-500'
                              }`}>
                                <p className="text-sm italic">"{q.text}"</p>
                                <span className={`text-xs font-medium ${
                                  q.sentiment === 'positive' ? 'text-green-700' :
                                  q.sentiment === 'neutral' ? 'text-yellow-700' :
                                  'text-red-700'
                                }`}>
                                  — {q.sentiment.toUpperCase()}
                                </span>
                              </blockquote>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.sources && item.sources.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sources</h3>
                          <ul className="space-y-2">
                            {item.sources.map((src, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                  >
                                    {src.title}
                                  </a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold">Delete All History?</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete <strong>{filteredHistory.length}</strong> {activeTab} records.
              This action <strong>cannot be undone</strong>.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}