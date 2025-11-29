import { createClient } from '@supabase/supabase-js';

// You will get these keys from your Supabase Project Dashboard
const supabaseUrl = 'https://ndzojoilmmsucodpmdim.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);