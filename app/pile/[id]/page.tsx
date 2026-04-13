import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';

interface StatsCard {
  games_cleared: number;
  games_in_motion: number;
  backlog_size: number;
  total_games: number;
  streak: number;
  hours_logged: number;
  exploration_pct: number;
  lines_drawn: number;
  archetype_name: string | null;
  archetype_descriptor: string | null;
  unplayed_value: number | null;
  played_value: number | null;
  backlog_hours: number | null;
  trophies_earned: number | null;
  trophies_total: number | null;
  platinums: number | null;
  perfect_games: number | null;
  gamerscore: number | null;
  show_value: boolean;
  show_archetype: boolean;
  show_trophies: boolean;
  show_hours: boolean;
  show_display_name: boolean;
  display_name: string | null;
  flavor_text: string | null;
}

async function getCard(id: string): Promise<StatsCard | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase
    .from('share_stats')
    .select('*')
    .eq('id', id)
    .single<StatsCard>();

  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return { title: 'Inventory Full' };
  }

  const who = card.show_display_name && card.display_name ? card.display_name : 'Someone';
  const title = `${who} has ${card.total_games} games tracked | Inventory Full`;
  const description = card.show_archetype && card.archetype_name
    ? `${card.archetype_name}. ${card.games_cleared} cleared, ${card.backlog_size} in the pile. Your backlog won't clear itself.`
    : `${card.games_cleared} cleared, ${card.games_in_motion} in motion, ${card.backlog_size} in the pile. Your backlog won't clear itself.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://inventoryfull.gg/pile/${id}`,
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

export default async function PilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Card not found</h1>
          <p className="text-text-muted mb-6">This stats card may have expired or doesn&apos;t exist.</p>
          <Link href="/" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white' }}>
            Check out Inventory Full
          </Link>
        </div>
      </main>
    );
  }

  // Build stat items for display
  const mainStats: { label: string; value: string; emoji: string }[] = [
    { label: 'Cleared', value: card.games_cleared.toString(), emoji: '✅' },
    { label: 'In Motion', value: card.games_in_motion.toString(), emoji: '🚀' },
    { label: 'Backlog', value: card.backlog_size.toString(), emoji: '📚' },
    { label: 'Streak', value: card.streak.toString(), emoji: '⚡' },
  ];

  if (card.show_hours && card.hours_logged > 0) {
    mainStats.push({ label: 'Hours Logged', value: Math.round(card.hours_logged).toLocaleString(), emoji: '⏱️' });
  }

  if (card.lines_drawn > 0) {
    mainStats.push({ label: 'Lines Drawn', value: card.lines_drawn.toString(), emoji: '✊' });
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-6 pt-12 pb-8">
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(167, 139, 250, 0.3)', boxShadow: '0 0 40px rgba(167, 139, 250, 0.08)' }}>
          <div className="p-6">
            {/* Badge + exploration */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-widest" style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                MY PILE
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${card.exploration_pct}%`, backgroundColor: '#a78bfa' }} />
                </div>
                <span className="text-sm font-bold font-mono" style={{ color: '#a78bfa' }}>{card.exploration_pct}%</span>
              </div>
            </div>

            {/* Archetype */}
            {card.show_archetype && card.archetype_name && (
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">{card.archetype_name}</h1>
                {card.archetype_descriptor && (
                  <p className="text-sm text-text-muted italic mt-1">{card.archetype_descriptor}</p>
                )}
              </div>
            )}

            {/* Flavor text */}
            {(!card.show_archetype || !card.archetype_name) && card.flavor_text && (
              <p className="text-lg font-bold text-text-primary mb-4">{card.flavor_text}</p>
            )}

            {/* Total games */}
            <p className="text-xs text-text-dim font-mono mb-3">{card.total_games} games tracked</p>

            {/* Main stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {mainStats.map((s) => (
                <div key={s.label} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="text-xs text-text-faint font-mono">{s.emoji} {s.label}</div>
                  <div className="text-lg font-bold text-text-primary">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Value section */}
            {card.show_value && (card.unplayed_value || card.played_value || card.backlog_hours) && (
              <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(167, 139, 250, 0.06)', border: '1px solid rgba(167, 139, 250, 0.15)' }}>
                <div className="text-xs text-text-faint font-mono mb-2">💎 Library Value</div>
                <div className="grid grid-cols-2 gap-2">
                  {card.unplayed_value && (
                    <div>
                      <div className="text-xs text-text-dim font-mono">Untapped</div>
                      <div className="text-lg font-bold font-mono" style={{ color: '#a78bfa' }}>~${card.unplayed_value.toLocaleString()}</div>
                    </div>
                  )}
                  {card.played_value && (
                    <div>
                      <div className="text-xs text-text-dim font-mono">Unlocked</div>
                      <div className="text-lg font-bold font-mono" style={{ color: '#22c55e' }}>${card.played_value.toLocaleString()}</div>
                    </div>
                  )}
                  {card.backlog_hours && (
                    <div>
                      <div className="text-xs text-text-dim font-mono">Time to clear</div>
                      <div className="text-lg font-bold font-mono" style={{ color: '#f59e0b' }}>~{card.backlog_hours.toLocaleString()}h</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trophy case */}
            {card.show_trophies && (card.trophies_earned || card.gamerscore) && (
              <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <div className="text-xs text-text-faint font-mono mb-2">🏆 Trophy Case</div>
                <div className="grid grid-cols-2 gap-2">
                  {card.trophies_earned && (
                    <div>
                      <div className="text-xs text-text-dim font-mono">Earned</div>
                      <div className="text-lg font-bold font-mono" style={{ color: '#f59e0b' }}>
                        {card.trophies_earned.toLocaleString()}{card.trophies_total ? ` / ${card.trophies_total.toLocaleString()}` : ''}
                      </div>
                    </div>
                  )}
                  {card.platinums != null && card.platinums > 0 && (
                    <div>
                      <div className="text-xs text-text-dim font-mono">Platinums</div>
                      <div className="text-lg font-bold font-mono" style={{ color: '#e2e8f0' }}>{card.platinums}</div>
                    </div>
                  )}
                  {card.perfect_games != null && card.perfect_games > 0 && (
                    <div>
                      <div className="text-xs text-text-dim font-mono">100% Complete</div>
                      <div className="text-lg font-bold font-mono" style={{ color: '#22c55e' }}>{card.perfect_games}</div>
                    </div>
                  )}
                  {card.gamerscore != null && card.gamerscore > 0 && (
                    <div>
                      <div className="text-xs text-text-dim font-mono">Gamerscore</div>
                      <div className="text-lg font-bold font-mono" style={{ color: '#22c55e' }}>{card.gamerscore.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attribution */}
            {card.show_display_name && card.display_name && (
              <p className="text-xs text-text-faint font-mono">{card.display_name}&apos;s pile</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-xl text-text-primary font-bold">Your backlog&apos;s not gonna play itself.</p>
          <p className="text-sm text-text-muted">Track your pile. Decide what to play. Get back to gaming.</p>
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
