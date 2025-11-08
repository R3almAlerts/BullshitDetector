// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Env validation (enhanced from v0.1.8)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Timeout wrapper for auth/API calls (from v0.1.8, generalized)
export const withTimeout = async (promise: Promise<any>, ms: number = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    const result = await promise;
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${ms}ms. Check connection.`);
    }
    throw error;
  }
};

// RPC util for secure user delete (admin-only)
export const deleteUser = async (userId: string) => {
  const { data, error } = await supabase.rpc('delete_user', { user_id: userId });
  if (error) throw error;
  return data;
};