import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

let cached: SupabaseClient | null = null;

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
});

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const env = envSchema.parse(process.env);
  cached = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  return cached;
}


