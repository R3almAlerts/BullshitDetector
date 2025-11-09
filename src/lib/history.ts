// src/lib/history.ts
import { supabase } from './supabase';
import toast from 'react-hot-toast';

export interface ValidationHistoryItem {
  id: string;
  user_id?: string; // Optional for local
  claim: string;
  verdict: 'bullshit' | 'mostly true' | 'neutral';
  score: number;
  mode: 'voter' | 'professional';
  timestamp: number;
}

export interface SentimentHistoryItem {
  id: string;
  user_id?: string; // Optional for local
  topic: string;
  positive: number;
  neutral: number;
  negative: number;
  total_posts: number;
  explanation: string;
  quotes?: any[]; // JSONB
  sources?: any[]; // JSONB
  timestamp: number;
}

type HistoryItem = ValidationHistoryItem | SentimentHistoryItem;
type HistoryType = 'validation' | 'sentiment';

const LOCAL_KEY = {
  validation: 'validatorHistory',
  sentiment: 'sentimentHistory',
} as const;

export const getHistory = async (type: HistoryType = 'validation'): Promise<HistoryItem[]> => {
  try {
    // Local first (quick, offline)
    const localKey = LOCAL_KEY[type];
    const stored = localStorage.getItem(localKey);
    const localHistory = stored ? JSON.parse(stored) as HistoryItem[] : [];

    // Sync from DB if user (merge + dedupe by ID + sort by timestamp desc)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const table = type === 'validation' ? 'validation_history' : 'sentiment_history';
      const { data: dbHistory, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn(`DB ${type} history fetch failed:`, error.message);
        toast.warn('History sync failed—using local data');
        return localHistory;
      }

      // Merge: DB primary (fresh), add local-only if no ID match
      const merged = dbHistory?.map((item: any) => ({
        ...item,
        id: item.id,
        timestamp: new Date(item.created_at).getTime(),
        user_id: user.id,
      })) || [];

      localHistory.forEach((localItem) => {
        if (!merged.find((dbItem) => dbItem.id === localItem.id)) {
          merged.push(localItem);
        }
      });

      // Sort desc by timestamp
      merged.sort((a, b) => b.timestamp - a.timestamp);
      return merged as HistoryItem[];
    }

    return localHistory;
  } catch (err) {
    console.error('History get failed:', err);
    toast.error('Failed to load history');
    return [];
  }
};

export const saveToHistory = async (item: Omit<ValidationHistoryItem, 'id' | 'timestamp'> | Omit<SentimentHistoryItem, 'id' | 'timestamp'>, type: HistoryType = 'validation'): Promise<HistoryItem> => {
  const fullItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...item,
  } as HistoryItem;

  // Local save (immediate)
  const localKey = LOCAL_KEY[type];
  const existing = await getHistory(type); // Re-fetch for merge (avoids stale)
  const updated = [...existing, fullItem];
  localStorage.setItem(localKey, JSON.stringify(updated));
  toast.success(`${type} saved locally`);

  // DB Save (async if user)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const table = type === 'validation' ? 'validation_history' : 'sentiment_history';
      const dbItem = { ...fullItem, user_id: user.id, created_at: new Date(fullItem.timestamp).toISOString() };
      const { error } = await supabase.from(table).insert(dbItem);
      if (error) {
        console.warn(`DB ${type} save failed:`, error.message);
        toast.warn('Saved locally—DB sync failed');
      } else {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} saved`);
      }
    }
  } catch (err) {
    console.warn('DB history save error:', err);
    toast.warn('DB sync failed');
  }

  return fullItem;
};

export const clearHistory = async (type: HistoryType = 'validation'): Promise<void> => {
  // Local clear
  const localKey = LOCAL_KEY[type];
  localStorage.removeItem(localKey);
  toast.success('Local history cleared');

  // DB Clear (async if user)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const table = type === 'validation' ? 'validation_history' : 'sentiment_history';
      const { error } = await supabase.from(table).delete().eq('user_id', user.id);
      if (error) {
        console.warn(`DB ${type} clear failed:`, error.message);
        toast.warn('DB clear failed');
      } else {
        toast.success('History cleared');
      }
    }
  } catch (err) {
    console.warn('DB history clear error:', err);
    toast.warn('DB clear failed');
  }
};

// Bulk clear (both types)
export const clearAllHistory = async (): Promise<void> => {
  await clearHistory('validation');
  await clearHistory('sentiment');
};