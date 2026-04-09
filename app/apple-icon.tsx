import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

// iOS "Add to Home Screen" icon. Uses the full logomark art instead of the
// small favicon sack — the sack reads at 16px but looks tiny and wrong at
// 180px. iOS auto-rounds the corners of this tile, so we render the logomark
// edge-to-edge on a brand-dark background.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const imgData = await readFile(join(process.cwd(), 'public/inventoryfull-logomark.png'));
  const base64 = imgData.toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
        }}
      >
        <img
          src={`data:image/png;base64,${base64}`}
          width={180}
          height={180}
          style={{ objectFit: 'cover' }}
        />
      </div>
    ),
    { ...size }
  );
}
