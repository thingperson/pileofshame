import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (code && supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect back to the app with a flag so the client can fire a one-time
  // GA4 signup_completed event. The flag is stripped from the URL on mount.
  return NextResponse.redirect(new URL('/?auth=ok', request.url));
}
