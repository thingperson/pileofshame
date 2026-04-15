import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { supabaseServer } from '@/lib/supabaseServer';

// Generate 8-char alphanumeric ID (URL-safe, no ambiguous chars)
function generateId(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // no i/l/o/0/1
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function POST(req: NextRequest) {
  if (!supabaseServer) {
    return NextResponse.json({ error: 'Share cards unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { gameName, coverUrl, rating } = body;

    if (!gameName || typeof gameName !== 'string') {
      return NextResponse.json({ error: 'gameName required' }, { status: 400 });
    }

    // Sanitize all string inputs
    const sanitize = (s: unknown, max: number): string | null => {
      if (typeof s !== 'string') return null;
      return s.slice(0, max).trim() || null;
    };
    const sanitizeNum = (n: unknown): number | null => {
      if (typeof n !== 'number' || !isFinite(n)) return null;
      return n;
    };
    const sanitizeBool = (b: unknown): boolean => b === true;

    const id = generateId();

    const { error } = await supabaseServer.from('share_cards').insert({
      id,
      game_name: sanitize(gameName, 200),
      cover_url: sanitize(coverUrl, 500),
      rating: typeof rating === 'number' && rating >= 0 && rating <= 5 ? rating : 0,
      hours_played: sanitizeNum(body.hoursPlayed),
      hltb_main: sanitizeNum(body.hltbMain),
      time_in_pile_days: sanitizeNum(body.timeInPileDays),
      dollar_value: sanitizeNum(body.dollarValue),
      total_cleared: sanitizeNum(body.totalCleared),
      backlog_remaining: sanitizeNum(body.backlogRemaining),
      total_reclaimed: sanitizeNum(body.totalReclaimed),
      show_hours: sanitizeBool(body.showHours),
      show_hltb_compare: sanitizeBool(body.showHltbCompare),
      show_pile_time: sanitizeBool(body.showPileTime),
      show_dollar_value: sanitizeBool(body.showDollarValue),
      show_stats: sanitizeBool(body.showStats),
      show_display_name: sanitizeBool(body.showDisplayName),
      display_name: sanitize(body.displayName, 50),
      flavor_text: sanitize(body.flavorText, 300),
    });

    if (error) {
      console.error('Share card insert error:', error);
      Sentry.captureException(error, { tags: { route: 'share' } });
      return NextResponse.json({ error: 'Failed to create share card' }, { status: 500 });
    }

    return NextResponse.json({ id, url: `https://inventoryfull.gg/clear/${id}` });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: 'share' } });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
