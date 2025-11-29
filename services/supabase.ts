import { createClient } from '@supabase/supabase-js';

// You will get these keys from your Supabase Project Dashboard
const supabaseUrl = 'https://ndzojoilmmsucodpmdim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9qb2lsbW1zdWNvZHBtZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDkwNzQsImV4cCI6MjA3OTkyNTA3NH0.ekIGM8M2YRJ0iKTIWOtu5xiLrdptQy53jbajc_9Knfg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);