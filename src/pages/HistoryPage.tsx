// src/lib/history.ts
import { supabase } from './supabase';

export interface HistoryItem {
  id: string;
  claim: string;
  verdict: 'bullshit' | 'mostly true' | 'neutral';
  score: number;
  mode: 'voter' | 'professional';
  timestamp: number;
}

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem('validatorHistory');
    return stored ? JSON.parse(stored) as HistoryItem[] : [];
  } catch (err) {
    console.warn('Local history parse failed:', err);
    return [];
  }
};

export const saveToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>, userId?: string) => {
  const fullItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...item,
  };

  // Local save (immediate)
  const existing = getHistory();
  const updated = [...existing, fullItem];
  localStorage.setItem('validatorHistory', JSON.stringify(updated));

  // DB Save (async if userId)
  if (userId) {
    try {
      await supabase
        .from('validation_history')
        .insert({
          user_id: userId,
          ...fullItem,
          timestamp: fullItem.timestamp, // Explicit for DB (trigger also sets, but safe)
        });
    } catch (err) {
      console.warn('DB history save failed:', err); // Fallback to local
    }
  } else {
    console.warn('No user_id—skipping DB save, local only');
  }

  return fullItem;
};

export const clearHistory = async (userId?: string) => {
  // Local clear
  localStorage.removeItem('validatorHistory');

  // DB Clear (async if userId)
  if (userId) {
    try {
      await supabase
        .from('validation_history')
        .delete()
        .eq('user_id', userId);
    } catch (err) {
      console.warn('DB history clear failed:', err);
    }
  }
};