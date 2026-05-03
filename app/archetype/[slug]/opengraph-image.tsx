import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { findArchetypeBySlug } from '@/lib/archetypeRegistry';
import { ALL_SPRITES } from '@/lib/pixel/sprites';
import { IF_PALETTE, type PaletteKey } from '@/lib/pixel/palette';

// Node runtime so we can read fonts off disk — same pattern as /clear/[id].
export const runtime = 'nodejs';
export const alt = 'Player Archetype - Inventory Full';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFonts() {
  const dir = join(process.cwd(), 'public/og-assets');
  const [bungee, outfitBold] = await Promise.all([
    readFile(join(dir, 'Bungee.ttf')),
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf').then((r) => r.arrayBuffer()),
  ]);
  return { bungee, outfitBold };
}

// Parse the ASCII sprite into per-color rect lists. Same algorithm as
// components/PixelSprite.tsx — duplicated here to avoid importing a 'use client'
// module from a Node-runtime route.
function parseSprite(spriteKey: string): { rows: string[]; w: number; h: number } | null {
  const str = ALL_SPRITES[spriteKey];
  if (!str) return null;
  const lines = str.split('\n').map((l) => l.replace(/\r$/, ''));
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const w = Math.max(...lines.map((l) => l.length));
  const rows = lines.map((l) => l.padEnd(w, '.'));
  return { rows, w, h: rows.length };
}

interface Rect { x: number; y: number; color: string; }
function spriteRects(rows: string[], w: number, h: number): Rect[] {
  const out: Rect[] = [];
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      if (!(ch in IF_PALETTE)) continue;
      out.push({ x, y, color: IF_PALETTE[ch as PaletteKey] });
    }
  }
  return out;
}

export default async function Image({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = findArchetypeBySlug(slug);
  const { bungee, outfitBold } = await loadFonts();

  // Fallback for unknown slugs — render a generic card so the OG never 500s.
  const fallback = a == null;
  const title = (a?.title ?? 'PLAYER ARCHETYPE').toUpperCase();
  const flavor = a?.flavor ?? 'Find out which one you are.';
  const toneAccent =
    a?.tone === 'roast' ? '#ff5a8a'
    : a?.tone === 'respect' ? '#a78bfa'
    : '#1ae2c0';

  const sprite = !fallback ? parseSprite(a!.spriteKey) : null;

  // Sprite rendering — scale each pixel up. 32×32 sprites at 12px/cell ≈ 384px.
  const PIXEL = sprite ? Math.floor(380 / Math.max(sprite.w, sprite.h)) : 12;
  const spritePxW = sprite ? sprite.w * PIXEL : 0;
  const spritePxH = sprite ? sprite.h * PIXEL : 0;
  const rects = sprite ? spriteRects(sprite.rows, sprite.w, sprite.h) : [];

  // Fit title to width — column is 600px wide, Bungee char ≈ 0.6 × fontSize.
  // Size against the longest word so multi-word titles wrap cleanly without
  // overflowing the column ("THE ARCHAEOLOGIST" → wrap on "ARCHAEOLOGIST" width).
  const longestWord = title.split(/\s+/).reduce((m, w) => Math.max(m, w.length), 1);
  const titleSize = Math.min(96, Math.max(44, Math.floor(560 / (longestWord * 0.6))));

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
        {/* Tone-tinted radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: 0,
            width: '1200px',
            height: '500px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '900px',
              height: '500px',
              background: `radial-gradient(ellipse, ${toneAccent}40, ${toneAccent}10 45%, transparent 70%)`,
              display: 'flex',
            }}
          />
        </div>

        {/* "PLAYER ARCHETYPE" eyebrow */}
        <div
          style={{
            position: 'absolute',
            top: '46px',
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
              fontSize: '20px',
              letterSpacing: '6px',
              color: toneAccent,
              display: 'flex',
            }}
          >
            PLAYER ARCHETYPE
          </div>
        </div>

        {/* Sprite — left of center on desktop layout */}
        <div
          style={{
            position: 'absolute',
            top: '110px',
            left: '90px',
            width: '380px',
            height: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {sprite ? (
            <svg
              width={spritePxW}
              height={spritePxH}
              viewBox={`0 0 ${sprite!.w} ${sprite!.h}`}
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              {rects.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={1} height={1} fill={r.color} />
              ))}
            </svg>
          ) : (
            <div style={{ display: 'flex', fontSize: '180px' }}>🎮</div>
          )}
        </div>

        {/* Title + flavor — right column */}
        <div
          style={{
            position: 'absolute',
            top: '140px',
            left: '510px',
            width: '600px',
            height: '360px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontFamily: 'Bungee, sans-serif',
              fontSize: `${titleSize}px`,
              lineHeight: 1.05,
              color: '#f4ecff',
              letterSpacing: '1px',
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '26px',
              lineHeight: 1.4,
              color: '#d8c8f5',
              display: 'flex',
            }}
          >
            {flavor}
          </div>
        </div>

        {/* Bottom row: CTA (left) + wordmark (right) */}
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
              fontSize: '18px',
              color: '#d8c8f5',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>find out which one you are</span>
            <span style={{ color: '#a78bfa' }}>→ inventoryfull.gg</span>
          </div>
          {/* Wordmark (same path data as /clear/[id] OG card) */}
          <svg width={260} height={34} viewBox="70 645 2580 335" xmlns="http://www.w3.org/2000/svg">
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
        { name: 'Bungee', data: bungee, weight: 400 as const, style: 'normal' as const },
        { name: 'Outfit', data: outfitBold, weight: 700 as const, style: 'normal' as const },
      ],
    },
  );
}
