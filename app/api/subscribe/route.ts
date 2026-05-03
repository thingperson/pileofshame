import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { supabaseServer } from '@/lib/supabaseServer';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

// Email subscribe: explicit opt-in capture from unauthenticated visitors.
// Rate-limited to 3 per IP per 10 minutes to discourage spam/enumeration.

const RATE_LIMIT = 3;
const RATE_WINDOW = 10 * 60_000;

export async function POST(req: NextRequest) {
  const ip = getClientIP(req.headers);
  const limited = checkRateLimit(ip, 'subscribe', RATE_LIMIT, RATE_WINDOW);
  if (limited) {
    return NextResponse.json(
      { error: 'Too many submissions. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } },
    );
  }

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Subscribe unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    // Lowercase for case-insensitive uniqueness (matches the UNIQUE constraint).
    const email = typeof body.email === 'string'
      ? body.email.trim().toLowerCase().slice(0, 200)
      : '';
    const source = typeof body.source === 'string' ? body.source.trim().slice(0, 50) : 'landing';
    const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl.slice(0, 500) : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;

    // Upsert by lowercased email; re-subscribe clears any prior unsubscribe.
    const { error } = await supabaseServer
      .from('email_subscribers')
      .upsert(
        {
          email,
          source,
          user_agent: userAgent,
          page_url: pageUrl,
          consented_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: 'email' },
      );

    if (error) {
      console.error('subscribe insert error:', error);
      Sentry.captureException(error, { tags: { route: 'subscribe' } });
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: 'subscribe' } });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
