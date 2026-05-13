import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const alt = 'Game Cleared - Inventory Full';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadAssets() {
  const dir = join(process.cwd(), 'public/og-assets');
  const [bungee, outfitBold, pipBytes] = await Promise.all([
    readFile(join(dir, 'Bungee.ttf')),
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf').then((r) => r.arrayBuffer()),
    readFile(join(dir, 'pip-trophy.png')),
  ]);
  return { bungee, outfitBold, pipBytes };
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
  const base: ShareCard = {
    game_name: 'Elden Ring',
    cover_url: 'https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efcc546364e348.jpg',
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
  if (card.show_dollar_value && card.dollar_value) {
    return `$${Math.round(card.dollar_value)} reclaimed from the pile.`;
  }
  if (card.show_hltb_compare && card.hours_played && card.hltb_main && card.hltb_main > 0) {
    const diff = Math.round(card.hltb_main - card.hours_played);
    if (diff > 0) return `${diff}h faster than average.`;
  }
  if (card.show_stats && card.total_cleared) {
    return `Game #${card.total_cleared} off the pile.`;
  }
  if (card.show_hours && card.hours_played) {
    return `${Math.round(card.hours_played)}h well spent.`;
  }
  return 'Another one down.';
}

function fitGameName(name: string): { fontSize: number; lineHeight: number } {
  const len = name.length;
  if (len <= 8) return { fontSize: 88, lineHeight: 1 };
  if (len <= 14) return { fontSize: 72, lineHeight: 1 };
  if (len <= 20) return { fontSize: 58, lineHeight: 1.05 };
  if (len <= 30) return { fontSize: 46, lineHeight: 1.1 };
  return { fontSize: 38, lineHeight: 1.15 };
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#0a0a0f', color: '#1ae2c0', fontSize: '32px', fontFamily: 'system-ui' }}>
          inventoryfull.gg
        </div>
      ),
      { ...size },
    );
  }

  const { bungee, outfitBold, pipBytes } = await loadAssets();
  const pipDataUrl = `data:image/png;base64,${pipBytes.toString('base64')}`;

  // Satori can't fetch external URLs — fetch cover art server-side and embed as base64
  let coverDataUrl: string | null = null;
  if (card.cover_url) {
    try {
      const res = await fetch(card.cover_url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const ct = res.headers.get('content-type') || 'image/jpeg';
        coverDataUrl = `data:${ct};base64,${buf.toString('base64')}`;
      }
    } catch {
      // decorative only — fail silently
    }
  }

  const gameName = (card.game_name ?? 'A Game').toUpperCase();
  const subtitle = pickSubtitle(card);
  const { fontSize: gameSize, lineHeight: gameLH } = fitGameName(gameName);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: '#0a0a0f',
          position: 'relative',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        {/* Decorative border frame */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            bottom: '12px',
            border: '1px solid rgba(218, 165, 32, 0.25)',
            borderRadius: '8px',
            display: 'flex',
          }}
        />
        {/* Inner glow line */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            bottom: '16px',
            border: '1px solid rgba(26, 226, 192, 0.08)',
            borderRadius: '6px',
            display: 'flex',
          }}
        />
        {/* Left panel — Pip trophy on dark bg with subtle glow */}
        <div
          style={{
            display: 'flex',
            width: '460px',
            height: '630px',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Golden radial glow behind Pip */}
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '40px',
              width: '380px',
              height: '460px',
              background: 'radial-gradient(ellipse, rgba(218, 165, 32, 0.2) 0%, rgba(218, 165, 32, 0.05) 40%, transparent 70%)',
              display: 'flex',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pipDataUrl}
            alt=""
            width={340}
            height={340}
            style={{ width: '340px', height: '340px', objectFit: 'contain' }}
          />
        </div>

        {/* Right panel — text over cover art */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Cover art backdrop — faded and dark */}
          {coverDataUrl && (
            <img
              src={coverDataUrl}
              alt=""
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.38,
                filter: 'saturate(0.8) brightness(0.75)',
              }}
            />
          )}
          {/* Gradient overlay to blend cover into bg */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #0a0a0f 0%, rgba(10, 10, 15, 0.6) 30%, rgba(10, 10, 15, 0.15) 100%)',
              display: 'flex',
            }}
          />
          {/* Vignette at bottom for bar blend */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '100%',
              height: '160px',
              background: 'linear-gradient(0deg, #0a0a0f, transparent)',
              display: 'flex',
            }}
          />

          {/* Text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '72px 56px 40px 0',
              justifyContent: 'center',
              flex: 1,
              position: 'relative',
            }}
          >
            {/* "I CLEARED" label */}
            <div
              style={{
                fontFamily: 'Bungee, sans-serif',
                fontSize: '36px',
                color: '#ffffff',
                letterSpacing: '3px',
                display: 'flex',
                marginBottom: '16px',
              }}
            >
              I CLEARED
            </div>

            {/* Game name — teal, big, adaptive */}
            <div
              style={{
                fontFamily: 'Bungee, sans-serif',
                fontSize: `${gameSize}px`,
                lineHeight: gameLH,
                color: '#1ae2c0',
                letterSpacing: '1px',
                display: 'flex',
                flexWrap: 'wrap',
                maxWidth: '660px',
                textShadow: '0 2px 24px rgba(26, 226, 192, 0.3)',
              }}
            >
              {gameName}
            </div>

            {/* Subtitle stat */}
            <div
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '28px',
                color: '#d8c8f5',
                display: 'flex',
                marginTop: '28px',
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        {/* Bottom bar — wordmark + tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '1200px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 48px',
            borderTop: '1px solid rgba(26, 226, 192, 0.15)',
            background: 'linear-gradient(0deg, rgba(10, 10, 15, 0.95), transparent)',
          }}
        >
          {/* Wordmark */}
          <svg
            width={220}
            height={28}
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
          {/* Tagline */}
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.5)',
              display: 'flex',
            }}
          >
            We help you pick. You do the playing.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Bungee', data: bungee, weight: 400 as const, style: 'normal' as const },
        { name: 'Outfit', data: outfitBold, weight: 700 as const, style: 'normal' as const },
      ],
    },
  );
}
