import { createClient } from '@supabase/supabase-js';

export function createServerClient() {
  // Use SUPABASE_URL/SUPABASE_ANON_KEY (server-only, available at runtime)
  // with fallback to NEXT_PUBLIC_ variants (for local dev)
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_ variants).'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
