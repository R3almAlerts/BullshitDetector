// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

export const supabase = createClient(https://supabase.com/dashboard/project/hinzcotdeuszvvyidbqe, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpbnpjb3RkZXVzenZ2eWlkYnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDUyNjgsImV4cCI6MjA3ODA4MTI2OH0.UalmkZawgDJcx-l6Mz6PG9-oTos7fu_7zFaaTd5n91k);