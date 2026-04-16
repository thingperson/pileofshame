import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';

interface ShareCard {
  game_name: string;
  cover_url: string | null;
  rating: number;
  hours_played: number | null;
  hltb_main: number | null;
  time_in_pile_days: number | null;
  dollar_value: number | null;
  total_cleared: number | null;
  backlog_remaining: number | null;
  total_reclaimed: number | null;
  show_hours: boolean;
  show_hltb_compare: boolean;
  show_pile_time: boolean;
  show_dollar_value: boolean;
  show_stats: boolean;
  show_display_name: boolean;
  display_name: string | null;
  flavor_text: string | null;
}

async function getCard(id: string): Promise<ShareCard | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase
    .from('share_cards')
    .select('*')
    .eq('id', id)
    .single<ShareCard>();

  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return { title: 'Inventory Full' };
  }

  const title = `I cleared ${card.game_name} off my backlog | Inventory Full`;
  const valueStr = card.show_dollar_value && card.dollar_value ? ` $${Math.round(card.dollar_value)} reclaimed.` : '';
  // SEO description targets the 110–160 char window. Share lead (flavor or fallback) sets the
  // emotional hook, then the app pitch carries the pitch to anyone who clicked through.
  const lead = card.flavor_text
    ? `${card.flavor_text}${valueStr}`
    : `${card.game_name} cleared off the pile.${valueStr}`;
  const description = `${lead} Inventory Full helps you pick your next game in seconds. Free, no sign-up. Less shame. More game.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://inventoryfull.gg/clear/${id}`,
      siteName: 'Inventory Full',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ClearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Card not found</h1>
          <p className="text-text-muted mb-6">This share card may have expired or doesn&apos;t exist.</p>
          <Link href="/" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white' }}>
            Check out Inventory Full
          </Link>
        </div>
      </main>
    );
  }

  const stars = card.rating > 0 ? '⭐'.repeat(card.rating) : '';

  // Build detail lines
  const details: { label: string; value: string }[] = [];

  if (card.show_hours && card.hours_played) {
    details.push({ label: 'Time invested', value: `${Math.round(card.hours_played)} hours` });
  }
  if (card.show_hltb_compare && card.hours_played && card.hltb_main && card.hltb_main > 0) {
    const diff = Math.round(card.hltb_main - card.hours_played);
    if (diff > 0) details.push({ label: 'vs average', value: `${diff}h faster than most` });
    else if (diff < 0) details.push({ label: 'vs average', value: `${Math.abs(diff)}h more thorough than most` });
  }
  if (card.show_pile_time && card.time_in_pile_days) {
    const years = Math.floor(card.time_in_pile_days / 365);
    const months = Math.floor((card.time_in_pile_days % 365) / 30);
    const timeStr = years > 0 ? `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months}mo` : ''}`.trim() : months > 0 ? `${months} months` : `${card.time_in_pile_days} days`;
    details.push({ label: 'Time in the pile', value: timeStr });
  }
  if (card.show_dollar_value && card.dollar_value) {
    details.push({ label: 'Value reclaimed', value: `$${Math.round(card.dollar_value)}` });
  }
  if (card.show_stats && card.total_cleared) {
    details.push({ label: 'Games cleared', value: `#${card.total_cleared}` });
  }
  if (card.show_stats && card.backlog_remaining) {
    details.push({ label: 'Pile remaining', value: `${card.backlog_remaining} games` });
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Card display */}
      <div className="max-w-lg mx-auto px-6 pt-12 pb-8">
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(34, 197, 94, 0.3)', boxShadow: '0 0 40px rgba(34, 197, 94, 0.08)' }}>
          {/* Cover art header */}
          {card.cover_url && (
            <div className="relative h-48 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.cover_url} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.5) saturate(0.7)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-bg-card), transparent)' }} />
            </div>
          )}

          <div className="p-6 -mt-12 relative">
            {/* Cleared badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-widest" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                CLEARED
              </span>
              {stars && <span className="text-lg">{stars}</span>}
            </div>

            {/* Game name */}
            <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">{card.game_name}</h1>

            {/* Flavor text */}
            {card.flavor_text && (
              <p className="text-text-muted italic mb-4">{card.flavor_text}</p>
            )}

            {/* Details */}
            {details.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {details.map((d) => (
                  <div key={d.label} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="text-xs text-text-faint font-mono">{d.label}</div>
                    <div className="text-sm font-semibold text-text-primary">{d.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Attribution */}
            {card.show_display_name && card.display_name && (
              <p className="text-xs text-text-faint font-mono">cleared by {card.display_name}</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-xl text-text-primary font-bold">Less shame. More game.</p>
          <p className="text-sm text-text-muted">Your pile won&apos;t clear itself. That&apos;s where we come in.</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-xl font-bold text-base transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white', boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)' }}
          >
            Try Inventory Full
          </Link>
          <p className="text-sm text-text-dim">Free. No account needed.</p>
        </div>

        {/* Brand footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-xs text-text-faint font-mono tracking-widest">INVENTORY FULL</p>
          <p className="text-xs text-text-dim mt-1">Stop stalling. Get playing.</p>
        </div>
      </div>
    </main>
  );
}
