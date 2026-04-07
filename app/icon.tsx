import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default async function Icon() {
  const imgData = await readFile(join(process.cwd(), 'public/if-favicon.png'));
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
        }}
      >
        <img
          src={`data:image/png;base64,${base64}`}
          width={30}
          height={30}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size }
  );
}
