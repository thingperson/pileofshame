import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Inventory Full - Your pile\'s not gonna play itself.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Fetch font files for Satori rendering
async function loadFonts() {
  const [outfitRegular, outfitBold, jetbrainsMono] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf').then(r => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxjPQ.ttf').then(r => r.arrayBuffer()),
  ]);
  return { outfitBold, outfitRegular, jetbrainsMono };
}

export default async function Image() {
  const heroUrl = new URL('/inventoryfull-hero-transparent.png', process.env.NEXT_PUBLIC_APP_URL || 'https://inventoryfull.gg').toString();
  const { outfitBold, outfitRegular, jetbrainsMono } = await loadFonts();

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
        {/* Background glow — matches landing page radial gradient */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            width: '900px',
            height: '700px',
            background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.2), transparent 65%)',
            transform: 'translateX(-50%)',
            display: 'flex',
          }}
        />
        {/* Secondary glow — bottom right, pink tint */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-60px',
            width: '500px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(167, 139, 250, 0.12), transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            display: 'flex',
          }}
        />

        {/* Main layout: hero image left, copy right */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '40px 60px 20px 40px',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {/* Hero illustration */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '380px',
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroUrl}
              alt=""
              width={360}
              height={240}
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 40px rgba(124, 58, 237, 0.3))',
              }}
            />
          </div>

          {/* Copy block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              gap: '0px',
            }}
          >
            {/* Brand name — mono font */}
            <div
              style={{
                fontSize: '16px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                color: '#a78bfa',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginBottom: '12px',
                display: 'flex',
              }}
            >
              INVENTORY FULL
            </div>

            {/* Headline — matches landing page */}
            <div
              style={{
                fontSize: '52px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-2px',
                lineHeight: 1.05,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span>Your pile&apos;s not</span>
              <span>gonna <span style={{ color: '#a78bfa' }}>play itself.</span></span>
            </div>

            {/* Subline */}
            <div
              style={{
                fontSize: '20px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: '#94a3b8',
                marginTop: '16px',
                lineHeight: 1.5,
                display: 'flex',
              }}
            >
              Import your library. Tell us your mood. We pick the game.
            </div>

            {/* Key feature pills — mono font */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '24px',
                flexWrap: 'wrap',
              }}
            >
              {[
                'Steam + Xbox + PS',
                'Mood Matching',
                'Free, no sign-up',
              ].map((label) => (
                <div
                  key={label}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(167, 139, 250, 0.1)',
                    color: '#c4b5fd',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 500,
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    display: 'flex',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar — mono font */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 60px 28px',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 500,
              color: '#64748b',
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
              color: '#475569',
              display: 'flex',
            }}
          >
            No ads. No tracking. Your data stays yours.
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
