import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { SPRITE_KEY_BY_TITLE } from '@/lib/archetypes';

// Node runtime — needs fs.readFile to load persona sprite SVGs from
// public/sprites/personas/. Same pattern as app/clear/[id]/opengraph-image.tsx.
export const runtime = 'nodejs';
export const alt = 'Gaming Stats - Inventory Full';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFonts() {
  const [outfitBold, outfitRegular, outfitItalic] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf').then(r => r.arrayBuffer()),
    // Outfit doesn't ship italic, so fall back to regular for italic style.
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf').then(r => r.arrayBuffer()),
  ]);
  return { outfitBold, outfitRegular, outfitItalic };
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

function spriteKeyForTitle(title: string): string {
  if (title.endsWith(' Addict')) return 'genreAddict';
  return SPRITE_KEY_BY_TITLE[title] ?? 'gamer';
}

// Inline wordmark — same path data as app/clear/[id]/opengraph-image.tsx.
// "IN" in white, "VENTORY FULL" in teal. viewBox 70 645 2580 335.
function Wordmark({ width, height }: { width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
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
  );
}

function FallbackCard() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#0a0a0f',
        fontFamily: 'Outfit, sans-serif',
        gap: '14px',
      }}
    >
      <Wordmark width={440} height={60} />
      <div style={{ fontSize: '28px', color: '#ea2de1', fontFamily: 'Outfit, sans-serif', fontWeight: 400, display: 'flex' }}>
        get playing.
      </div>
    </div>
  );
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

  const { outfitBold, outfitRegular, outfitItalic } = await loadFonts();

  const fontPack = {
    fonts: [
      { name: 'Outfit', data: outfitBold, weight: 800 as const, style: 'normal' as const },
      { name: 'Outfit', data: outfitRegular, weight: 400 as const, style: 'normal' as const },
      { name: 'Outfit', data: outfitItalic, weight: 400 as const, style: 'italic' as const },
    ],
  };

  if (!card || !card.archetype_name) {
    return new ImageResponse(<FallbackCard />, { ...size, ...fontPack });
  }

  // Try to load the persona sprite. If it fails, render the minimal fallback.
  const spriteKey = spriteKeyForTitle(card.archetype_name);
  let spriteDataUrl: string | null = null;
  try {
    const buf = await readFile(
      join(process.cwd(), 'public/sprites/personas', `${spriteKey}.svg`),
    );
    spriteDataUrl = `data:image/svg+xml;base64,${buf.toString('base64')}`;
  } catch {
    spriteDataUrl = null;
  }

  if (!spriteDataUrl) {
    return new ImageResponse(<FallbackCard />, { ...size, ...fontPack });
  }

  // Manual descriptor cap so a long line doesn't blow the layout — satori has
  // limited CSS truncation support.
  const descriptor = card.archetype_descriptor ?? '';
  const descriptorTrimmed =
    descriptor.length > 180 ? descriptor.slice(0, 178).trimEnd() + '…' : descriptor;

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
        {/* Background — purple radial glow + secondary glow + grid */}
        <div style={{ position: 'absolute', top: '-100px', left: '30%', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.2), transparent 65%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-60px', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(167, 139, 250, 0.1), transparent 70%)', display: 'flex' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', display: 'flex' }} />

        {/* Top row: wordmark + tagline (left) and games-tracked (right) */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '60px',
            right: '60px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Wordmark width={220} height={30} />
            <div
              style={{
                fontSize: '24px',
                color: '#ea2de1',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                display: 'flex',
              }}
            >
              get playing.
            </div>
          </div>
          <div
            style={{
              fontSize: '18px',
              color: '#94a3b8',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              display: 'flex',
              marginTop: '4px',
            }}
          >
            {card.total_games} games tracked
          </div>
        </div>

        {/* Hero row: persona sprite (left) + archetype name + descriptor (right) */}
        <div
          style={{
            position: 'absolute',
            top: '150px',
            left: '60px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            zIndex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={spriteDataUrl}
            alt=""
            width={360}
            height={360}
            style={{ width: '360px', height: '360px', imageRendering: 'pixelated' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
            <div
              style={{
                fontSize: '72px',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-1.5px',
                lineHeight: 1.1,
                display: 'flex',
              }}
            >
              {card.archetype_name}
            </div>
            {descriptorTrimmed && (
              <div
                style={{
                  fontSize: '26px',
                  color: '#c4b5fd',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.35,
                  display: 'flex',
                }}
              >
                {descriptorTrimmed}
              </div>
            )}
          </div>
        </div>

        {/* Flavor text — only when present */}
        {card.flavor_text && (
          <div
            style={{
              position: 'absolute',
              bottom: '70px',
              left: '60px',
              right: '60px',
              display: 'flex',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                fontFamily: 'Outfit, sans-serif',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.3,
                maxWidth: '1040px',
                display: 'flex',
              }}
            >
              {`"${card.flavor_text}"`}
            </div>
          </div>
        )}

        {/* Attribution — bottom right */}
        {card.show_display_name && card.display_name && (
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              right: '60px',
              fontSize: '16px',
              color: '#7c6a9a',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              display: 'flex',
              zIndex: 1,
            }}
          >
            cleared by {card.display_name}
          </div>
        )}
      </div>
    ),
    { ...size, ...fontPack },
  );
}
