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

  // Build detail lines based on what the user chose to show.
  // NOTE: time_in_pile_days intentionally omitted — not reliably accurate and
  // doesn't carry emotional weight for the share moment.
  const details: { label: string; value: string; color: string }[] = [];

  if (card.show_hltb_compare && card.hours_played && card.hltb_main && card.hltb_main > 0) {
    const diff = Math.round(card.hltb_main - card.hours_played);
    if (diff > 0) {
      details.push({ label: 'vs average', value: `${diff}h faster`, color: '#22c55e' });
    } else if (diff < 0) {
      details.push({ label: 'vs average', value: `${Math.abs(diff)}h more (thorough)`, color: '#f59e0b' });
    }
  }

  if (card.show_hours && card.hours_played) {
    details.push({ label: 'Time invested', value: `${Math.round(card.hours_played)}h`, color: '#38bdf8' });
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
        {/* Background: game cover art, blurred and heavily dimmed so brand frame dominates */}
        {card.cover_url && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.cover_url}
              alt=""
              width={1200}
              height={630}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(48px) brightness(0.22) saturate(0.55)' }}
            />
          </div>
        )}

        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 15, 0.78)', display: 'flex' }} />

        {/* Purple glow from top */}
        <div style={{ position: 'absolute', top: '-80px', left: '50%', width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.22), transparent 65%)', transform: 'translateX(-50%)', display: 'flex' }} />

        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', display: 'flex' }} />

        {/* === TOP HEADER: logomark + INVENTORY FULL, centered, the brand anchor === */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', padding: '34px 56px 0 56px', position: 'relative', zIndex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://inventoryfull.gg/icon-512.png"
            alt=""
            width={112}
            height={112}
            style={{ width: '112px', height: '112px', borderRadius: '20px' }}
          />
          <div style={{ fontSize: '44px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: '#a78bfa', letterSpacing: '6px', display: 'flex' }}>
            INVENTORY FULL
          </div>
        </div>

        {/* === MAIN CONTENT: game art + hero copy === */}
        <div style={{ display: 'flex', flex: 1, padding: '20px 56px 12px 56px', gap: '40px', position: 'relative', zIndex: 1 }}>

          {/* Left: Game cover — wider box + objectFit contain so landscape source art
              (RAWG/Steam headers) renders whole instead of being guillotined on the sides.
              Subtle bg so contain letterboxing reads as intentional framing. */}
          {card.cover_url && (
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  width: '300px',
                  height: '300px',
                  borderRadius: '14px',
                  border: '2px solid rgba(167, 139, 250, 0.28)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                  backgroundColor: 'rgba(15, 15, 22, 0.85)',
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.cover_url}
                  alt=""
                  width={300}
                  height={300}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          )}

          {/* Right: Content — CLEARED, game name, flavor, small detail pills */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            {/* CLEARED badge + stars — both bumped, this is the emotional punchline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div
                style={{
                  padding: '6px 20px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(34, 197, 94, 0.18)',
                  color: '#22c55e',
                  fontSize: '22px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 500,
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  letterSpacing: '4px',
                  display: 'flex',
                }}
              >
                CLEARED
              </div>
              {stars && <div style={{ fontSize: '30px', display: 'flex' }}>{stars}</div>}
            </div>

            {/* Game name — hero type */}
            <div
              style={{
                fontSize: card.game_name.length > 34 ? '44px' : card.game_name.length > 22 ? '54px' : '62px',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-2px',
                lineHeight: 1.05,
                display: 'flex',
                marginBottom: '12px',
              }}
            >
              {card.game_name}
            </div>

            {/* Flavor text — bumped prominence under the title */}
            {card.flavor_text && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#cbd5e1',
                  fontStyle: 'italic',
                  lineHeight: 1.35,
                  display: 'flex',
                  marginBottom: '16px',
                }}
              >
                {card.flavor_text}
              </div>
            )}

            {/* Detail pills — barely visible, secondary */}
            {details.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {details.map((d) => (
                  <div
                    key={d.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>{d.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: d.color, fontFamily: 'JetBrains Mono, monospace', display: 'flex' }}>{d.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Display name attribution */}
            {card.show_display_name && card.display_name && (
              <div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: '12px', display: 'flex' }}>
                cleared by {card.display_name}
              </div>
            )}
          </div>
        </div>

        {/* === FOOTER: centered tagline sell + domain === */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '0 56px 26px 56px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.3px', display: 'flex' }}>
            Get playing.
          </div>
          <div style={{ fontSize: '17px', fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa', letterSpacing: '2px', display: 'flex' }}>
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
