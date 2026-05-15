import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 604800;
export const alt = 'Inventory Full - get playing.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFonts() {
  const [outfitRegular, outfitBold, outfitBlack, jetbrainsMono] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4ZmyC4E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxjPQ.ttf').then(r => r.arrayBuffer()),
  ]);
  return { outfitBold, outfitRegular, outfitBlack, jetbrainsMono };
}

// Inline wordmark paths — same as components/Wordmark.tsx
const BODY_PATH =
  'm1592.68 702.2 107.69-50.26h157.95v116.14h-113.18v-61.66h-40.12v102.2H1822v55.33h-116.98v108.96h-112.34zm294.79-50.26h113.18v265.64h39.7V651.94h113.61v320.97h-266.49zm296.05 0h112.34v266.07h97.13v54.9h-209.48V651.94Zm238.61 0h112.34v266.07h97.13v54.9h-209.48V651.94Z';
const IN_PATH =
  'M76.42 651.89h65.88v320.97H76.42zm91.22 51.1 64.62-51.1h91.22v320.97h-66.31V706.79h-23.23v266.07h-66.3zm181.17-51.1h64.62v266.07h23.23V651.89h65.88v271.98l-62.51 48.99h-91.22zm179.06 50.26 63.77-50.26h90.8v116.14h-65.88v-61.66h-23.23v102.2h67.99v55.33h-67.99v53.64h89.11v55.32H527.87zm179.91.84 64.62-51.1h91.22v320.97h-66.31V706.79h-23.23v266.07h-66.3zm216.23 3.81h-35.05v-54.9h137.26v54.9h-34.21v266.07h-67.99V706.8Zm127.54 0 66.3-54.9h88.69v266.49l-65.04 54.48h-89.95zm89.53 210.74V706.8h-23.23v210.74zm90.8-213.28 64.19-52.37h90.38v143.59l-36.74 40.54h36.74v136.84h-65.88V864.74h-22.81v108.12h-65.88zm88.69 100.51v-97.56h-22.81v97.56zm91.22 112.77h87.84v-54.9h-87.84V651.9h64.62v155.42h23.23V651.9h66.31v265.64l-64.19 55.32h-89.95v-55.32Z';

export default async function Image() {
  const pipUrl = new URL('/landing/pip-wave.png', process.env.NEXT_PUBLIC_APP_URL || 'https://inventoryfull.gg').toString();
  const { outfitBold, outfitRegular, outfitBlack, jetbrainsMono } = await loadFonts();

  const pills: { label: string; color: string; bg: string }[] = [
    { label: 'Steam + Xbox + PS', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.10)' },
    { label: 'Mood Matching', color: '#E91E63', bg: 'rgba(233, 30, 99, 0.08)' },
    { label: 'Free, no sign-up', color: '#006D75', bg: 'rgba(0, 188, 212, 0.10)' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#F5F0EB',
          fontFamily: 'Outfit, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle pink accent bar — top edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '55%',
            height: '5px',
            background: '#E91E63',
            display: 'flex',
          }}
        />

        {/* Subtle ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-40px',
            width: '500px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(233, 30, 99, 0.06), transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Main layout: copy left, Pip right */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '50px 56px 20px',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          {/* Copy block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            {/* Brand wordmark — dark IN on cream, pink body */}
            <svg
              width={520}
              height={70}
              viewBox="70 645 2500 340"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'flex' }}
            >
              <path d={BODY_PATH} fill="#1a1a1a" />
              <path d={IN_PATH} fill="#E91E63" />
            </svg>

            {/* Tagline */}
            <div
              style={{
                fontSize: '18px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                color: '#E91E63',
                marginTop: '8px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              get playing.
            </div>

            {/* Headline */}
            <div
              style={{
                fontSize: '38px',
                fontWeight: 900,
                color: '#1a1a1a',
                marginTop: '28px',
                lineHeight: 1.15,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span>You don&#39;t need more games.</span>
              <span style={{ color: '#E91E63' }}>You need one good pick.</span>
            </div>

            {/* Subline */}
            <div
              style={{
                fontSize: '18px',
                fontWeight: 400,
                color: '#555555',
                marginTop: '16px',
                lineHeight: 1.5,
                display: 'flex',
              }}
            >
              Tell us your mood. We find your game. You go play.
            </div>

            {/* Feature pills */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '24px',
                flexWrap: 'wrap',
              }}
            >
              {pills.map((pill) => (
                <div
                  key={pill.label}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    backgroundColor: pill.bg,
                    color: pill.color,
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 500,
                    border: `1px solid ${pill.color}30`,
                    display: 'flex',
                  }}
                >
                  {pill.label}
                </div>
              ))}
            </div>
          </div>

          {/* Pip character */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '340px',
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pipUrl}
              alt=""
              width={300}
              height={300}
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.08))',
              }}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 56px 28px',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 500,
              color: '#999',
              letterSpacing: '2px',
              display: 'flex',
            }}
          >
            inventoryfull.gg
          </div>
          <div
            style={{
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 400,
              color: '#999',
              display: 'flex',
            }}
          >
            Free forever. Your data stays on your device.
          </div>
        </div>

        {/* Cyan accent — bottom right corner */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '30%',
            height: '4px',
            background: '#00BCD4',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Outfit', data: outfitBlack, weight: 900 as const, style: 'normal' as const },
        { name: 'Outfit', data: outfitBold, weight: 800 as const, style: 'normal' as const },
        { name: 'Outfit', data: outfitRegular, weight: 400 as const, style: 'normal' as const },
        { name: 'JetBrains Mono', data: jetbrainsMono, weight: 500 as const, style: 'normal' as const },
      ],
    },
  );
}
