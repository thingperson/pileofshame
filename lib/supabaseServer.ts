import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client for API routes.
// Uses the service role key to bypass RLS (needed for writing to game_metadata).
// NEVER import this in client-side code.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseServer: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;
