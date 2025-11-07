// src/lib/history.ts
import { supabase } from './supabase';

export interface HistoryItem {
  id: string;
  claim: string;
  verdict: 'bullshit' | 'mostly true' | 'neutral';
  score: number;
  mode: 'voter' | 'professional';
  created_at: string;
}

export async function saveToHistory(item: Omit<HistoryItem, 'id' | 'created_at'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('validation_history')
    .insert({
      user_id: user.id,
      ...item,
    })
    .select()
    .single();

  if (error) console.error('Failed to save history:', error);
  return data;
}

export async function getHistory(): Promise<HistoryItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('validation_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }

  return data || [];
}

export async function clearHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('validation_history')
    .delete()
    .eq('user_id', user.id);

  if (error) console.error('Failed to clear history:', error);
}