/**
 * Cognitive Shadow Supabase Client Foundation
 * 
 * Central module providing a single configured Supabase client instance.
 * Automatically falls back to local development mock when Supabase 
 * environment variables are not configured in .env.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validate that credentials exist and are non-placeholder values
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim().length > 0 &&
  supabaseAnonKey.trim().length > 0 &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
);

export const authBackend: 'supabase' | 'local_fallback' = isSupabaseConfigured
  ? 'supabase'
  : 'local_fallback';

// Initialize the single shared Supabase client if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Safely retrieve the Supabase client or throw a descriptive error
 * if attempting to execute cloud operations without configuration.
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      '[Cognitive Shadow] Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
  }
  return supabase;
}

// Log configuration status in development
if (import.meta.env.DEV) {
  if (isSupabaseConfigured) {
    console.info('[Cognitive Shadow] Backend: Supabase Connected');
  } else {
    console.info('[Cognitive Shadow] Backend: Local Development Fallback Active (Supabase credentials unconfigured)');
  }
}
