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

export const saveToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const fullItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...item,
  };

  // Local save (immediate)
  const existing = getHistory();
  const updated = [...existing, fullItem];
  localStorage.setItem('validatorHistory', JSON.stringify(updated));

  // DB Save (async if user)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('validation_history').insert(fullItem);
      if (error) console.warn('DB history save failed:', error.message);
    }
  } catch (err) {
    console.warn('DB history save error:', err);
  }

  return fullItem;
};

export const clearHistory = async () => {
  // Local clear
  localStorage.removeItem('validatorHistory');

  // DB Clear (async if user)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: vError } = await supabase.from('validation_history').delete().eq('user_id', user.id);
      if (vError) console.warn('DB validation clear failed:', vError.message);

      const { error: sError } = await supabase.from('sentiment_history').delete().eq('user_id', user.id);
      if (sError) console.warn('DB sentiment clear failed:', sError.message);
    }
  } catch (err) {
    console.warn('DB history clear error:', err);
  }
};