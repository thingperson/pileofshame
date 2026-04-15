import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

// Feedback ingestion. Anonymous by default — email + marketing_consent optional.
// Rate-limited to 5 submissions per IP per 10 minutes to discourage spam.

const RATE_LIMIT = 5;
const RATE_WINDOW = 10 * 60_000;

export async function POST(req: NextRequest) {
  const ip = getClientIP(req.headers);
  const limited = checkRateLimit(ip, 'feedback', RATE_LIMIT, RATE_WINDOW);
  if (limited) {
    return NextResponse.json(
      { error: 'Too many submissions. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } },
    );
  }

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Feedback unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
    const marketingConsent = body.marketingConsent === true;
    const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl.slice(0, 500) : null;

    if (message.length < 3) {
      return NextResponse.json({ error: 'Message too short' }, { status: 400 });
    }

    // Basic email shape check (don't be strict — real validation is a rabbit hole)
    const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;

    // Marketing consent only valid if a real email was provided
    const consent = validEmail ? marketingConsent : false;

    const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;

    const { error } = await supabaseServer.from('feedback').insert({
      message,
      email: validEmail,
      marketing_consent: consent,
      user_agent: userAgent,
      page_url: pageUrl,
    });

    if (error) {
      console.error('feedback insert error:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
