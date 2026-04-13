import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'My Gaming Stats - Inventory Full';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFonts() {
  const [outfitBold, outfitRegular, jetbrainsMono] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxjPQ.ttf').then(r => r.arrayBuffer()),
  ]);
  return { outfitBold, outfitRegular, jetbrainsMono };
}

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

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: card } = await supabase
    .from('share_stats')
    .select('*')
    .eq('id', id)
    .single<StatsCard>();

  if (!card) {
    return new ImageResponse(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#0a0a0f', color: '#a78bfa', fontSize: '32px', fontFamily: 'system-ui' }}>
        inventoryfull.gg
      </div>,
      { ...size },
    );
  }

  const { outfitBold, outfitRegular, jetbrainsMono } = await loadFonts();

  // Build stat pills for the main grid
  const mainStats: { label: string; value: string; emoji: string; color: string }[] = [
    { label: 'Cleared', value: card.games_cleared.toString(), emoji: '✅', color: '#22c55e' },
    { label: 'In Motion', value: card.games_in_motion.toString(), emoji: '🚀', color: '#f59e0b' },
    { label: 'Backlog', value: card.backlog_size.toString(), emoji: '📚', color: '#64748b' },
    { label: 'Streak', value: card.streak.toString(), emoji: '⚡', color: '#a78bfa' },
  ];

  if (card.show_hours && card.hours_logged > 0) {
    mainStats.push({ label: 'Hours', value: Math.round(card.hours_logged).toLocaleString(), emoji: '⏱️', color: '#38bdf8' });
  }

  if (card.lines_drawn > 0) {
    mainStats.push({ label: 'Lines Drawn', value: card.lines_drawn.toString(), emoji: '✊', color: '#94a3b8' });
  }

  // Extra detail pills
  const details: { label: string; value: string; color: string }[] = [];

  if (card.show_value && card.unplayed_value) {
    details.push({ label: 'Untapped value', value: `~$${card.unplayed_value.toLocaleString()}`, color: '#a78bfa' });
  }
  if (card.show_value && card.played_value) {
    details.push({ label: 'Value unlocked', value: `$${card.played_value.toLocaleString()}`, color: '#22c55e' });
  }
  if (card.show_value && card.backlog_hours) {
    details.push({ label: 'Time to clear', value: `~${card.backlog_hours.toLocaleString()}h`, color: '#f59e0b' });
  }
  if (card.show_trophies && card.trophies_earned) {
    details.push({ label: 'Trophies', value: `${card.trophies_earned.toLocaleString()}${card.trophies_total ? ` / ${card.trophies_total.toLocaleString()}` : ''}`, color: '#f59e0b' });
  }
  if (card.show_trophies && card.platinums && card.platinums > 0) {
    details.push({ label: 'Platinums', value: card.platinums.toString(), color: '#e2e8f0' });
  }
  if (card.show_trophies && card.gamerscore && card.gamerscore > 0) {
    details.push({ label: 'Gamerscore', value: card.gamerscore.toLocaleString(), color: '#22c55e' });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#0a0a0f',
          fontFamily: 'Outfit, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Purple glow */}
        <div style={{ position: 'absolute', top: '-80px', left: '50%', width: '900px', height: '600px', background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.18), transparent 65%)', transform: 'translateX(-50%)', display: 'flex' }} />

        {/* Secondary glow */}
        <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(167, 139, 250, 0.1), transparent 70%)', display: 'flex' }} />

        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', display: 'flex' }} />

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '40px 56px 0', position: 'relative', zIndex: 1 }}>

          {/* Header row: badge + exploration bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(167, 139, 250, 0.15)',
                  color: '#a78bfa',
                  fontSize: '14px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 500,
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  letterSpacing: '2px',
                  display: 'flex',
                }}
              >
                MY PILE
              </div>
              <div style={{ fontSize: '16px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>
                {card.total_games} games tracked
              </div>
            </div>
            {/* Exploration % */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '100px', height: '8px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex' }}>
                <div style={{ width: `${card.exploration_pct}%`, height: '100%', borderRadius: '4px', backgroundColor: '#a78bfa', display: 'flex' }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#a78bfa', fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>
                {card.exploration_pct}%
              </span>
            </div>
          </div>

          {/* Archetype (if shown) */}
          {card.show_archetype && card.archetype_name && (
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-1px', lineHeight: 1.1, display: 'flex' }}>
                {card.archetype_name}
              </div>
              {card.archetype_descriptor && (
                <div style={{ fontSize: '16px', color: '#94a3b8', fontStyle: 'italic', marginTop: '6px', lineHeight: 1.4, display: 'flex' }}>
                  {card.archetype_descriptor.length > 120 ? card.archetype_descriptor.slice(0, 117) + '...' : card.archetype_descriptor}
                </div>
              )}
            </div>
          )}

          {/* Flavor text (if no archetype shown) */}
          {(!card.show_archetype || !card.archetype_name) && card.flavor_text && (
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-1px', lineHeight: 1.2, marginBottom: '20px', display: 'flex' }}>
              {card.flavor_text}
            </div>
          )}

          {/* Main stats grid */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {mainStats.map((s) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  minWidth: '120px',
                }}
              >
                <div style={{ fontSize: '14px', display: 'flex', marginBottom: '4px' }}>{s.emoji}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', display: 'flex', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Detail pills row */}
          {details.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {details.map((d) => (
                <div
                  key={d.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>{d.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: d.color, display: 'flex' }}>{d.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Display name */}
          {card.show_display_name && card.display_name && (
            <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: '16px', display: 'flex' }}>
              {card.display_name}{"'s pile"}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 56px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: '#a78bfa', letterSpacing: '3px', display: 'flex' }}>
              INVENTORY FULL
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', padding: '4px 14px', borderRadius: '8px', backgroundColor: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
              Stop stalling. Get playing. →
            </div>
          </div>
          <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: '#475569', display: 'flex' }}>
            inventoryfull.gg
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Outfit', data: outfitBold, weight: 800 as const, style: 'normal' as const },
        { name: 'Outfit', data: outfitRegular, weight: 400 as const, style: 'normal' as const },
        { name: 'JetBrains Mono', data: jetbrainsMono, weight: 500 as const, style: 'normal' as const },
      ],
    },
  );
}
