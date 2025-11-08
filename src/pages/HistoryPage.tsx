// src/pages/HistoryPage.tsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trash2, AlertCircle, ChevronDown, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getHistory, clearHistory, type HistoryItem } from '../lib/history';

interface ExpandedHistoryItem extends HistoryItem {
  explanation?: string;
  riskAssessment?: string;
  sources?: { title: string; url: string; extract?: string }[];
  sentiment?: { positive: number; neutral: number; negative: number; total: number };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ExpandedHistoryItem[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null); // New: For expand state

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Local history fallback
      let rawHistory: any = getHistory();
      const localHistory = Array.isArray(rawHistory) ? rawHistory : [];
      
      // Supabase sync (user-specific)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbHistory, error } = await supabase
          .from('validation_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) {
          console.warn('Supabase history fetch failed:', error.message);
          setHistory(localHistory.sort((a, b) => b.timestamp - a.timestamp) as ExpandedHistoryItem[]);
        } else if (dbHistory && dbHistory.length > 0) {
          const syncedHistory = dbHistory.map((item: any) => ({
            id: item.id,
            claim: item.claim,
            verdict: item.verdict,
            score: item.score,
            mode: item.mode,
            timestamp: new Date(item.created_at).getTime(),
            explanation: item.explanation,
            riskAssessment: item.riskAssessment,
            sources: item.sources,
            sentiment: item.sentiment,
          })) as ExpandedHistoryItem[];
          setHistory(syncedHistory);
        } else {
          setHistory(localHistory.sort((a, b) => b.timestamp - a.timestamp) as ExpandedHistoryItem[]);
        }
      } else {
        setHistory(localHistory.sort((a, b) => b.timestamp - a.timestamp) as ExpandedHistoryItem[]);
      }
    } catch (err) {
      console.error('History load failed:', err);
      setHistory([]);
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

  const deleteAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('validation_history')
          .delete()
          .eq('user_id', user.id);
        if (error) console.warn('Supabase delete failed:', error.message);
      }
      clearHistory();
      setHistory([]);
      setSelectedId(null); // Close any expanded
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
        {history.length > 0 && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No validation history yet.</p>
          <p className="text-sm mt-2">Start validating claims to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
              {/* Card Header - Clickable */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-expanded={selectedId === item.id}
                aria-label={`Expand details for ${item.claim.substring(0, 50)}...`}
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(item.timestamp), 'MMM d, yyyy • h:mm a')}
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {item.mode === 'professional' ? 'Pro' : 'Voter'}
                    </span>
                  </p>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${selectedId === item.id ? 'rotate-180' : ''}`} 
                  />
                </div>
                <p className="font-medium text-gray-900 dark:text-white mb-2">{item.claim}</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.verdict === 'bullshit'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : item.verdict === 'mostly true'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {item.verdict === 'bullshit' ? 'Bullshit' : item.verdict === 'mostly true' ? 'Mostly True' : 'Neutral'}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        item.score > 0.7 ? 'bg-red-500' : item.score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {(item.score * 100).toFixed(0)}%
                  </span>
                </div>
              </button>

              {/* Expanded Details - Accordion Style */}
              {selectedId === item.id && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto transition-all duration-300 ease-in-out">
                  {item.explanation && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Explanation</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.explanation}</p>
                    </div>
                  )}
                  {item.riskAssessment && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Risk Assessment</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">{item.riskAssessment}</p>
                    </div>
                  )}
                  {item.sources && item.sources.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sources</h3>
                      <ul className="space-y-2">
                        {item.sources.map((source, idx) => (
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
                  {item.sentiment && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sentiment Breakdown</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">{((item.sentiment.positive / item.sentiment.total) * 100).toFixed(0)}%</div>
                          <p className="text-xs text-gray-500">Positive</p>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-600">{((item.sentiment.neutral / item.sentiment.total) * 100).toFixed(0)}%</div>
                          <p className="text-xs text-gray-500">Neutral</p>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-600">{((item.sentiment.negative / item.sentiment.total) * 100).toFixed(0)}%</div>
                          <p className="text-xs text-gray-500">Negative</p>
                        </div>
                      </div>
                    </div>
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
              This will permanently delete <strong>{history.length}</strong> validation records.
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