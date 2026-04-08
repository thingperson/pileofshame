import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'Game Cleared - Inventory Full';
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

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch share card from Supabase (using anon key — public read)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: card } = await supabase
    .from('share_cards')
    .select('*')
    .eq('id', id)
    .single<ShareCard>();

  if (!card) {
    // Fallback: generic branded card
    return new ImageResponse(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#0a0a0f', color: '#a78bfa', fontSize: '32px', fontFamily: 'system-ui' }}>
        inventoryfull.gg
      </div>,
      { ...size },
    );
  }

  const { outfitBold, outfitRegular, jetbrainsMono } = await loadFonts();

  // Build detail lines based on what the user chose to show
  const details: { label: string; value: string; color: string }[] = [];

  if (card.show_hours && card.hours_played) {
    details.push({ label: 'Time invested', value: `${Math.round(card.hours_played)}h`, color: '#38bdf8' });
  }

  if (card.show_hltb_compare && card.hours_played && card.hltb_main && card.hltb_main > 0) {
    const diff = Math.round(card.hltb_main - card.hours_played);
    if (diff > 0) {
      details.push({ label: 'vs average', value: `${diff}h faster`, color: '#22c55e' });
    } else if (diff < 0) {
      details.push({ label: 'vs average', value: `${Math.abs(diff)}h more (thorough)`, color: '#f59e0b' });
    }
  }

  if (card.show_pile_time && card.time_in_pile_days) {
    const years = Math.floor(card.time_in_pile_days / 365);
    const months = Math.floor((card.time_in_pile_days % 365) / 30);
    const timeStr = years > 0
      ? `${years}y ${months > 0 ? `${months}mo` : ''} in the pile`.trim()
      : months > 0
        ? `${months} months in the pile`
        : `${card.time_in_pile_days} days in the pile`;
    details.push({ label: 'Time in pile', value: timeStr, color: '#a78bfa' });
  }

  if (card.show_dollar_value && card.dollar_value) {
    details.push({ label: 'Value recovered', value: `$${Math.round(card.dollar_value)}`, color: '#22c55e' });
  }

  if (card.show_stats && card.total_cleared) {
    details.push({ label: 'Total cleared', value: `Game #${card.total_cleared}`, color: '#c4b5fd' });
  }

  if (card.show_stats && card.backlog_remaining) {
    details.push({ label: 'Pile remaining', value: `${card.backlog_remaining} games`, color: '#64748b' });
  }

  const stars = card.rating > 0 ? '⭐'.repeat(card.rating) : '';

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
        {/* Background: game cover art, blurred and tinted */}
        {card.cover_url && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.cover_url}
              alt=""
              width={1200}
              height={630}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.3) saturate(0.6)' }}
            />
          </div>
        )}

        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 15, 0.7)', display: 'flex' }} />

        {/* Purple glow */}
        <div style={{ position: 'absolute', top: '-60px', left: '50%', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.15), transparent 65%)', transform: 'translateX(-50%)', display: 'flex' }} />

        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', display: 'flex' }} />

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, padding: '48px 56px', gap: '40px', position: 'relative', zIndex: 1 }}>

          {/* Left: Game cover */}
          {card.cover_url && (
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.cover_url}
                alt=""
                width={200}
                height={280}
                style={{
                  width: '200px',
                  height: '280px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '2px solid rgba(167, 139, 250, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                }}
              />
            </div>
          )}

          {/* Right: Content */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            {/* CLEARED badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  fontSize: '14px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 500,
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  letterSpacing: '2px',
                  display: 'flex',
                }}
              >
                CLEARED
              </div>
              {stars && <div style={{ fontSize: '20px', display: 'flex' }}>{stars}</div>}
            </div>

            {/* Game name */}
            <div
              style={{
                fontSize: card.game_name.length > 30 ? '36px' : '44px',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-1.5px',
                lineHeight: 1.1,
                display: 'flex',
                marginBottom: '8px',
              }}
            >
              {card.game_name}
            </div>

            {/* Flavor text */}
            {card.flavor_text && (
              <div
                style={{
                  fontSize: '18px',
                  color: '#94a3b8',
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                  display: 'flex',
                  marginBottom: '20px',
                }}
              >
                {card.flavor_text}
              </div>
            )}

            {/* Detail pills */}
            {details.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {details.map((d) => (
                  <div
                    key={d.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>{d.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: d.color, display: 'flex' }}>{d.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Display name */}
            {card.show_display_name && card.display_name && (
              <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: '16px', display: 'flex' }}>
                cleared by {card.display_name}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 56px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: '#a78bfa', letterSpacing: '3px', display: 'flex' }}>
              INVENTORY FULL
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
