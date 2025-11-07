// src/lib/smtp.ts
import { supabase } from './supabase';

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
}

export async function getSMTPConfig(): Promise<SMTPConfig | null> {
  const { data } = await supabase.from('smtp_config').select('*').single();
  return data || null;
}

export async function saveSMTPConfig(config: SMTPConfig) {
  const { error } = await supabase.from('smtp_config').upsert(config).select();
  if (error) throw error;
}