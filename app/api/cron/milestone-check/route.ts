import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { supabaseServer } from '@/lib/supabaseServer';

// Daily cron: counts users + share cards, pushes ntfy notification on milestone crossings.
// Gated by CRON_SECRET to prevent abuse.
//
// Vercel Cron sets the `Authorization: Bearer <CRON_SECRET>` header automatically
// when the cron is configured in vercel.json with a secret env reference. We also
// accept a manual `?key=<CRON_SECRET>` for local testing via curl.

const USER_MILESTONES = [100, 300, 1000, 3000, 5000, 10000, 25000, 50000];
const SHARE_MILESTONES = [100, 1000, 5000, 10000, 50000];

const NTFY_URL = process.env.NTFY_TOPIC_URL || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

function nextCrossedMilestone(count: number, lastNotified: number, milestones: number[]): number | null {
  // Find the highest milestone <= count that's strictly greater than lastNotified
  let crossed: number | null = null;
  for (const m of milestones) {
    if (count >= m && m > lastNotified) crossed = m;
  }
  return crossed;
}

async function pushNtfy(title: string, message: string, priority = 'default'): Promise<void> {
  if (!NTFY_URL) {
    console.warn('NTFY_TOPIC_URL not set; skipping push');
    return;
  }
  try {
    await fetch(NTFY_URL, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': priority,
        'Tags': 'rocket',
      },
      body: message,
    });
  } catch (err) {
    console.error('ntfy push failed:', err);
  }
}

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron sends Authorization: Bearer <secret>; manual call uses ?key=
  const auth = req.headers.get('authorization');
  const url = new URL(req.url);
  const queryKey = url.searchParams.get('key');

  const expected = `Bearer ${CRON_SECRET}`;
  if (!CRON_SECRET || (auth !== expected && queryKey !== CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Count cloud-synced users (proxy for engaged users — anonymous local users not counted)
    const { count: userCount, error: userErr } = await supabaseServer
      .from('libraries')
      .select('user_id', { count: 'exact', head: true });

    if (userErr) throw new Error(`libraries count failed: ${userErr.message}`);

    // Count share cards (lifetime)
    const { count: shareCount, error: shareErr } = await supabaseServer
      .from('share_cards')
      .select('id', { count: 'exact', head: true });

    if (shareErr) throw new Error(`share_cards count failed: ${shareErr.message}`);

    // Read current milestone state
    const { data: meta, error: metaErr } = await supabaseServer
      .from('app_meta')
      .select('last_user_milestone, last_share_milestone')
      .eq('id', 1)
      .single();

    if (metaErr) throw new Error(`app_meta read failed: ${metaErr.message}`);

    const users = userCount ?? 0;
    const shares = shareCount ?? 0;
    const lastUser = meta?.last_user_milestone ?? 0;
    const lastShare = meta?.last_share_milestone ?? 0;

    const crossedUser = nextCrossedMilestone(users, lastUser, USER_MILESTONES);
    const crossedShare = nextCrossedMilestone(shares, lastShare, SHARE_MILESTONES);

    const notifications: string[] = [];

    if (crossedUser !== null) {
      const msg = `Inventory Full just crossed ${crossedUser.toLocaleString()} cloud-synced users. Total: ${users.toLocaleString()}.`;
      await pushNtfy(`${crossedUser.toLocaleString()} users 🎉`, msg, 'high');
      notifications.push(`user:${crossedUser}`);
    }

    if (crossedShare !== null) {
      const msg = `Share cards crossed ${crossedShare.toLocaleString()}. Total: ${shares.toLocaleString()}.`;
      await pushNtfy(`${crossedShare.toLocaleString()} share cards 🎉`, msg, 'high');
      notifications.push(`share:${crossedShare}`);
    }

    // Update state if anything changed
    if (crossedUser !== null || crossedShare !== null) {
      await supabaseServer
        .from('app_meta')
        .update({
          last_user_milestone: crossedUser ?? lastUser,
          last_share_milestone: crossedShare ?? lastShare,
          last_checked_at: new Date().toISOString(),
        })
        .eq('id', 1);
    } else {
      // Just bump the timestamp so we know cron is alive
      await supabaseServer
        .from('app_meta')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', 1);
    }

    return NextResponse.json({
      ok: true,
      users,
      shares,
      lastUser,
      lastShare,
      crossed: notifications,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('milestone-check error:', msg);
    Sentry.captureException(err, { tags: { route: 'milestone-check' } });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
