import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Node runtime so we can read the co-located assets straight off disk. Edge +
// `fetch(new URL(..., import.meta.url))` blew up in Next 16 Turbopack
// ("u2 is not iterable" inside satori's font pipeline); fs.readFile is the
// pattern `app/apple-icon.tsx` uses and it works reliably.
export const runtime = 'nodejs';
export const alt = 'Game Cleared - Inventory Full';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadAssets() {
  const dir = join(process.cwd(), 'public/og-assets');
  const [bungeeInline, bungee, outfitBold, heroBytes] = await Promise.all([
    readFile(join(dir, 'BungeeInline.ttf')),
    readFile(join(dir, 'Bungee.ttf')),
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf').then((r) => r.arrayBuffer()),
    readFile(join(dir, 'hero.png')),
  ]);
  return { bungeeInline, bungee, outfitBold, heroBytes };
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

function getMockCard(id: string): ShareCard {
  // /clear/mock | mock-dollar | mock-hltb | mock-slow | mock-count | mock-hours
  const base: ShareCard = {
    game_name: 'Elden Ring',
    cover_url: null,
    rating: 5,
    hours_played: 85,
    hltb_main: 58,
    time_in_pile_days: null,
    dollar_value: 70,
    total_cleared: 12,
    backlog_remaining: 143,
    total_reclaimed: null,
    show_hours: false,
    show_hltb_compare: false,
    show_pile_time: false,
    show_dollar_value: false,
    show_stats: false,
    show_display_name: true,
    display_name: 'brady',
    flavor_text: null,
  };
  const v = id.replace(/^mock-?/, '');
  switch (v) {
    case 'hltb':
      return { ...base, game_name: 'Hollow Knight', hours_played: 28, hltb_main: 40, show_hltb_compare: true };
    case 'slow':
      return { ...base, game_name: 'The Witcher 3', hours_played: 160, hltb_main: 103, show_hltb_compare: true };
    case 'count':
      return { ...base, game_name: 'Stardew Valley', show_stats: true };
    case 'hours':
      return { ...base, game_name: 'Baldur\'s Gate 3', hours_played: 120, show_hours: true };
    case 'long':
      return { ...base, game_name: 'Disco Elysium: The Final Cut', show_dollar_value: true };
    case 'dollar':
    case '':
    default:
      return { ...base, show_dollar_value: true };
  }
}

function pickSubtitle(card: ShareCard): string {
  // Four stat templates, first-match wins. Falls back to a generic line.
  if (card.show_dollar_value && card.dollar_value) {
    return `that's $${Math.round(card.dollar_value)} back from the pile.`;
  }
  if (card.show_hltb_compare && card.hours_played && card.hltb_main && card.hltb_main > 0) {
    const diff = Math.round(card.hltb_main - card.hours_played);
    if (diff > 0) return `${diff}h faster than average.`;
    if (diff < 0) return `${Math.abs(diff)}h more. you took your time.`;
  }
  if (card.show_stats && card.total_cleared) {
    return `game #${card.total_cleared} off the pile.`;
  }
  if (card.show_hours && card.hours_played) {
    return `${Math.round(card.hours_played)}h, well spent.`;
  }
  return 'another one down.';
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Preview/mock shortcuts — hit /clear/mock/opengraph-image to see the card
  // without a real share_cards row. Variants exercise each subtitle template.
  let card: ShareCard | null = null;
  if (id.startsWith('mock')) {
    card = getMockCard(id);
  } else {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data } = await supabase
      .from('share_cards')
      .select('*')
      .eq('id', id)
      .single<ShareCard>();
    card = data;
  }

  if (!card) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#0b0618', color: '#a78bfa', fontSize: '32px', fontFamily: 'system-ui' }}>
          inventoryfull.gg
        </div>
      ),
      { ...size },
    );
  }

  const { bungeeInline, bungee, outfitBold, heroBytes } = await loadAssets();
  const heroDataUrl = `data:image/png;base64,${heroBytes.toString('base64')}`;

  const gameName = card.game_name.toUpperCase();
  const subtitle = pickSubtitle(card);

  // Layout strategy:
  //   Short combined ("ELDEN RING CLEARED!") → one line, big type.
  //   Longer → stack "game" on top, "CLEARED!" below. Game-name size scales
  //   against its own length so "Disco Elysium: The Final Cut" still fits.
  // Rough Bungee Inline width ≈ 0.6 × fontSize per char. Safe-zone padding 80px
  // each side → content cap ≈ 1040px.
  const combinedLen = gameName.length + ' CLEARED!'.length;
  const stackLayout = combinedLen > 22;
  let gameSize: number;
  let clearedSize: number;
  if (stackLayout) {
    // Fit game name alone to ~1000px. Char ≈ 0.58 × fontSize.
    gameSize = Math.min(83, Math.max(35, Math.floor(800 / (gameName.length * 0.58))));
    clearedSize = 90;
  } else {
    // Single line — fit combined string.
    gameSize = Math.min(77, Math.floor(800 / (combinedLen * 0.58)));
    clearedSize = gameSize;
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(180deg, #1a0a2e 0%, #0b0618 60%, #0b0618 100%)',
          position: 'relative',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        {/* Purple radial glow — full-width flex row centers it */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: 0,
            width: '1200px',
            height: '560px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '900px',
              height: '560px',
              background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.38), rgba(234, 45, 225, 0.08) 45%, transparent 70%)',
              display: 'flex',
            }}
          />
        </div>

        {/* Hero faded as the backdrop anchor — centered via flex row.
            PNG not webp: satori in next/og 16.2.1 crashes on webp data URLs. */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: 0,
            width: '1200px',
            height: '380px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroDataUrl}
            alt=""
            width={540}
            height={360}
            style={{ width: '540px', height: '360px', objectFit: 'contain' }}
          />
        </div>

        {/* Main hero — game name (strikethrough) + CLEARED!, stacked or inline */}
        <div
          style={{
            position: 'absolute',
            bottom: stackLayout ? '150px' : '178px',
            left: 0,
            width: '1200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 80px',
            gap: '0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: stackLayout ? 0 : '22px', flexWrap: 'nowrap' }}>
            <div
              style={{
                fontFamily: 'Bungee Inline, sans-serif',
                fontSize: `${gameSize}px`,
                lineHeight: 1,
                color: '#f4ecff',
                letterSpacing: '1px',
                textDecoration: 'line-through',
                textDecorationColor: '#ea2de1',
                textDecorationThickness: `${Math.max(4, Math.round(gameSize / 18))}px`,
                display: 'flex',
                whiteSpace: 'nowrap',
              }}
            >
              {gameName}
            </div>
            {!stackLayout && (
              <div
                style={{
                  fontFamily: 'Bungee, sans-serif',
                  fontSize: `${clearedSize}px`,
                  lineHeight: 1,
                  color: '#ff5a8a',
                  letterSpacing: '1px',
                  display: 'flex',
                  whiteSpace: 'nowrap',
                }}
              >
                CLEARED!
              </div>
            )}
          </div>
          {stackLayout && (
            <div
              style={{
                fontFamily: 'Bungee, sans-serif',
                fontSize: `${clearedSize}px`,
                lineHeight: 1,
                marginTop: '8px',
                color: '#ff5a8a',
                letterSpacing: '2px',
                display: 'flex',
              }}
            >
              CLEARED!
            </div>
          )}
        </div>

        {/* Subtitle — stat template */}
        <div
          style={{
            position: 'absolute',
            bottom: '108px',
            left: 0,
            width: '1200px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '34px',
              color: '#d8c8f5',
              letterSpacing: '-0.3px',
              display: 'flex',
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom row: attribution (left) + wordmark (right) */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: 0,
            width: '1200px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 48px',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              color: '#7c6a9a',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            {card.show_display_name && card.display_name ? `cleared by ${card.display_name}` : ''}
          </div>
          {/* Wordmark — inline paths from public/if-logos/wordmark-alone.svg so
              satori renders actual brand glyphs (external SVG <img> is unreliable
              in @vercel/og). "IN" override to white on dark; "VENTORY FULL" teal. */}
          <svg
            width={260}
            height={34}
            viewBox="70 645 2580 335"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m1592.68 702.2 107.69-50.26h157.95v116.14h-113.18v-61.66h-40.12v102.2H1822v55.33h-116.98v108.96h-112.34zm294.79-50.26h113.18v265.64h39.7V651.94h113.61v320.97h-266.49zm296.05 0h112.34v266.07h97.13v54.9h-209.48V651.94Zm238.61 0h112.34v266.07h97.13v54.9h-209.48V651.94Z"
              fill="#1ae2c0"
            />
            <path
              d="M76.42 651.89h65.88v320.97H76.42zm91.22 51.1 64.62-51.1h91.22v320.97h-66.31V706.79h-23.23v266.07h-66.3zm181.17-51.1h64.62v266.07h23.23V651.89h65.88v271.98l-62.51 48.99h-91.22zm179.06 50.26 63.77-50.26h90.8v116.14h-65.88v-61.66h-23.23v102.2h67.99v55.33h-67.99v53.64h89.11v55.32H527.87zm179.91.84 64.62-51.1h91.22v320.97h-66.31V706.79h-23.23v266.07h-66.3zm216.23 3.81h-35.05v-54.9h137.26v54.9h-34.21v266.07h-67.99V706.8Zm127.54 0 66.3-54.9h88.69v266.49l-65.04 54.48h-89.95zm89.53 210.74V706.8h-23.23v210.74zm90.8-213.28 64.19-52.37h90.38v143.59l-36.74 40.54h36.74v136.84h-65.88V864.74h-22.81v108.12h-65.88zm88.69 100.51v-97.56h-22.81v97.56zm91.22 112.77h87.84v-54.9h-87.84V651.9h64.62v155.42h23.23V651.9h66.31v265.64l-64.19 55.32h-89.95v-55.32Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Bungee Inline', data: bungeeInline, weight: 400 as const, style: 'normal' as const },
        { name: 'Bungee', data: bungee, weight: 400 as const, style: 'normal' as const },
        { name: 'Outfit', data: outfitBold, weight: 700 as const, style: 'normal' as const },
      ],
    },
  );
}
