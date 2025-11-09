// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utils: Timeout wrapper (optional, removed from Auth if not needed)
export const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
};

// History utils (for Validator/Sentiment saves)
export const saveToHistory = async (data: any, userId?: string) => {
  if (!userId) {
    localStorage.setItem('history', JSON.stringify([...(JSON.parse(localStorage.getItem('history') || '[]')), { ...data, timestamp: Date.now() }]));
    return;
  }
  const table = data.topic ? 'sentiment_history' : 'validation_history';
  const { error } = await supabase.from(table).insert({ user_id: userId, ...data });
  if (error) throw error;
};

export const getHistory = (table = 'validation_history') => {
  const local = JSON.parse(localStorage.getItem('history') || '[]');
  // Sync from DB if user
  // (Implement in pages as needed)
  return local;
};

export const clearHistory = async (userId?: string) => {
  if (userId) {
    await supabase.from('validation_history').delete().eq('user_id', userId);
    await supabase.from('sentiment_history').delete().eq('user_id', userId);
  }
  localStorage.removeItem('history');
};