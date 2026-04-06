import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const imgData = await readFile(join(process.cwd(), 'public/if-icon.png'));
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
          background: '#0f0f13',
          overflow: 'hidden',
        }}
      >
        {/* Scale up to crop out the padding in the source image */}
        <img
          src={`data:image/png;base64,${base64}`}
          width={300}
          height={300}
          style={{
            objectFit: 'cover',
            marginTop: '10px',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
