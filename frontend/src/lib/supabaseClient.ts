import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  cached = createClient(supabaseUrl, supabaseAnonKey);
  return cached;
}


