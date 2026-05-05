import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';

export const runtime = 'nodejs';

// One-click unsubscribe. Token-protected to prevent drive-by unsubs.
// Sets email_subscribers.unsubscribed_at. Auth users with wants_updates=true
// manage their preference from the in-app settings toggle today; when we ship
// Resend, add an admin lookup (auth.users → profiles) to flip that here too.
export async function POST(req: NextRequest) {
  if (!supabaseServer) {
    return NextResponse.json({ error: 'Unsubscribe unavailable' }, { status: 503 });
  }

  let email: string;
  let token: string;
  try {
    const body = await req.json();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
    token = typeof body.token === 'string' ? body.token.trim().slice(0, 200) : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  try {
    const now = new Date().toISOString();

    const { error: subErr } = await supabaseServer
      .from('email_subscribers')
      .update({ unsubscribed_at: now })
      .eq('email', email);
    if (subErr) {
      console.error('unsubscribe error:', subErr);
      Sentry.captureException(subErr, { tags: { route: 'unsubscribe' } });
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: 'unsubscribe' } });
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
