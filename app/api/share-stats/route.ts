import { NextRequest, NextResponse } from 'next/server';
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

    const sanitize = (s: unknown, max: number): string | null => {
      if (typeof s !== 'string') return null;
      return s.slice(0, max).trim() || null;
    };
    const sanitizeInt = (n: unknown): number | null => {
      if (typeof n !== 'number' || !isFinite(n)) return null;
      return Math.round(n);
    };
    const sanitizeBool = (b: unknown): boolean => b === true;

    const id = generateId();

    const { error } = await supabaseServer.from('share_stats').insert({
      id,
      games_cleared: sanitizeInt(body.gamesCleared) ?? 0,
      games_in_motion: sanitizeInt(body.gamesInMotion) ?? 0,
      backlog_size: sanitizeInt(body.backlogSize) ?? 0,
      total_games: sanitizeInt(body.totalGames) ?? 0,
      streak: sanitizeInt(body.streak) ?? 0,
      hours_logged: typeof body.hoursLogged === 'number' && isFinite(body.hoursLogged) ? body.hoursLogged : 0,
      exploration_pct: sanitizeInt(body.explorationPct) ?? 0,
      lines_drawn: sanitizeInt(body.linesDrawn) ?? 0,
      archetype_name: sanitize(body.archetypeName, 100),
      archetype_descriptor: sanitize(body.archetypeDescriptor, 200),
      unplayed_value: sanitizeInt(body.unplayedValue),
      played_value: sanitizeInt(body.playedValue),
      backlog_hours: sanitizeInt(body.backlogHours),
      trophies_earned: sanitizeInt(body.trophiesEarned),
      trophies_total: sanitizeInt(body.trophiesTotal),
      platinums: sanitizeInt(body.platinums),
      perfect_games: sanitizeInt(body.perfectGames),
      gamerscore: sanitizeInt(body.gamerscore),
      show_value: sanitizeBool(body.showValue),
      show_archetype: sanitizeBool(body.showArchetype),
      show_trophies: sanitizeBool(body.showTrophies),
      show_hours: sanitizeBool(body.showHours),
      show_display_name: sanitizeBool(body.showDisplayName),
      display_name: sanitize(body.displayName, 50),
      flavor_text: sanitize(body.flavorText, 300),
    });

    if (error) {
      console.error('Stats share card insert error:', error);
      return NextResponse.json({ error: 'Failed to create stats card' }, { status: 500 });
    }

    return NextResponse.json({ id, url: `https://inventoryfull.gg/pile/${id}` });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
