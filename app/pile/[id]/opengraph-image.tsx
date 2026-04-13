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

  // Build the highlighted data points (checked values + flavor text)
  const highlights: { label: string; value: string; color: string }[] = [];

  if (card.show_value && card.unplayed_value) {
    highlights.push({ label: 'Untapped value', value: `~$${card.unplayed_value.toLocaleString()}`, color: '#a78bfa' });
  }
  if (card.show_value && card.played_value) {
    highlights.push({ label: 'Value unlocked', value: `$${card.played_value.toLocaleString()}`, color: '#22c55e' });
  }
  if (card.show_value && card.backlog_hours) {
    highlights.push({ label: 'Time to complete', value: `~${card.backlog_hours.toLocaleString()}h`, color: '#f59e0b' });
  }
  if (card.show_hours && card.hours_logged > 0) {
    highlights.push({ label: 'Hours logged', value: Math.round(card.hours_logged).toLocaleString(), color: '#38bdf8' });
  }
  if (card.show_trophies && card.trophies_earned) {
    highlights.push({ label: 'Trophies', value: card.trophies_earned.toLocaleString(), color: '#f59e0b' });
  }
  if (card.show_trophies && card.platinums && card.platinums > 0) {
    highlights.push({ label: 'Platinums', value: card.platinums.toString(), color: '#e2e8f0' });
  }
  if (card.show_trophies && card.gamerscore && card.gamerscore > 0) {
    highlights.push({ label: 'Gamerscore', value: card.gamerscore.toLocaleString(), color: '#22c55e' });
  }

  // Compact stats line
  const statParts = [
    `${card.games_cleared} completed`,
    `${card.games_in_motion} in motion`,
    `${card.backlog_size} in the pile`,
  ];
  if (card.streak > 1) statParts.push(`${card.streak} streak`);
  if (card.lines_drawn > 0) statParts.push(`${card.lines_drawn} moved on`);

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
        {/* Purple glow from top */}
        <div style={{ position: 'absolute', top: '-100px', left: '30%', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.2), transparent 65%)', display: 'flex' }} />

        {/* Secondary glow bottom right */}
        <div style={{ position: 'absolute', bottom: '-80px', right: '-60px', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(167, 139, 250, 0.1), transparent 70%)', display: 'flex' }} />

        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', display: 'flex' }} />

        {/* === TOP: Logomark + Brand Name === */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '36px 56px 0', position: 'relative', zIndex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://inventoryfull.gg/icon-192.png"
            alt=""
            width={80}
            height={80}
            style={{ width: '80px', height: '80px', borderRadius: '16px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '22px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: '#a78bfa', letterSpacing: '4px', display: 'flex' }}>
              INVENTORY FULL
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', display: 'flex', marginTop: '4px' }}>
              {card.total_games} games tracked
              {card.show_display_name && card.display_name ? ` · ${card.display_name}` : ''}
            </div>
          </div>
          {/* Exploration % - right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <div style={{ width: '80px', height: '8px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex' }}>
              <div style={{ width: `${card.exploration_pct}%`, height: '100%', borderRadius: '4px', backgroundColor: '#a78bfa', display: 'flex' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#a78bfa', fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>
              {card.exploration_pct}%
            </span>
          </div>
        </div>

        {/* === MIDDLE: Archetype + Descriptor + Flavor Text === */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px 56px', position: 'relative', zIndex: 1, justifyContent: 'center' }}>

          {/* Archetype name */}
          {card.show_archetype && card.archetype_name && (
            <div style={{ fontSize: '44px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-1.5px', lineHeight: 1.1, display: 'flex', marginBottom: '12px' }}>
              {card.archetype_name}
            </div>
          )}

          {/* Archetype descriptor */}
          {card.show_archetype && card.archetype_descriptor && (
            <div style={{ fontSize: '20px', color: '#c4b5fd', lineHeight: 1.5, display: 'flex', marginBottom: '16px', maxWidth: '900px' }}>
              {card.archetype_descriptor.length > 160 ? card.archetype_descriptor.slice(0, 157) + '...' : card.archetype_descriptor}
            </div>
          )}

          {/* Flavor text (always shown if present) */}
          {card.flavor_text && (
            <div style={{ fontSize: '18px', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.4, display: 'flex', marginBottom: '20px' }}>
              {`"${card.flavor_text}"`}
            </div>
          )}

          {/* Highlighted values the user checked */}
          {highlights.length > 0 && (
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {highlights.map((h) => (
                <div
                  key={h.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>{h.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: h.color, fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>{h.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === BOTTOM: Compact stats line + CTA === */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 56px 28px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: '#475569', display: 'flex', gap: '6px' }}>
            {statParts.join(' · ')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', padding: '5px 14px', borderRadius: '8px', backgroundColor: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
              {"Your pile's not gonna play itself. →"}
            </div>
            <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: '#64748b', display: 'flex' }}>
              inventoryfull.gg
            </div>
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
