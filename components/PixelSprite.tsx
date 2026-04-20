'use client';

import { IF_PALETTE, PaletteKey } from '@/lib/pixel/palette';
import { ALL_SPRITES } from '@/lib/pixel/sprites';

interface PixelSpriteProps {
  name: string;
  size?: number;
  ariaLabel?: string;
  shadow?: boolean;
  className?: string;
}

interface ParsedSprite {
  rows: string[];
  w: number;
  h: number;
}

function parseSprite(str: string): ParsedSprite {
  const lines = str.split('\n').map((l) => l.replace(/\r$/, ''));
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const w = Math.max(...lines.map((l) => l.length));
  const rows = lines.map((l) => l.padEnd(w, '.'));
  return { rows, w, h: rows.length };
}

function buildPathsByColor(rows: string[], w: number, h: number) {
  const byColor: Record<string, string> = {};
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      if (!(ch in IF_PALETTE)) continue;
      byColor[ch] = (byColor[ch] || '') + `M${x} ${y}h1v1h-1z`;
    }
  }
  return byColor;
}

export default function PixelSprite({
  name,
  size = 64,
  ariaLabel,
  shadow = false,
  className,
}: PixelSpriteProps) {
  const spriteStr = ALL_SPRITES[name];
  if (!spriteStr) {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <span style={{ color: '#ff5a5a', fontSize: 10, fontFamily: 'monospace' }}>
          ?{name}
        </span>
      );
    }
    return null;
  }

  const { rows, w, h } = parseSprite(spriteStr);
  const paths = buildPathsByColor(rows, w, h);
  const filterId = shadow ? `sh-${name.replace(/[^a-zA-Z0-9]/g, '')}` : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      shapeRendering="crispEdges"
      className={className}
      style={{ display: 'block', imageRendering: 'pixelated' }}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {filterId && (
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.3" />
            <feOffset dx="0" dy="0.4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={filterId ? `url(#${filterId})` : undefined}>
        {Object.entries(paths).map(([ch, d]) => (
          <path key={ch} d={d} fill={IF_PALETTE[ch as PaletteKey]} />
        ))}
      </g>
    </svg>
  );
}
