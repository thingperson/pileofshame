import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Inventory Full - Stop scrolling your library. Start playing.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#0a0a0f',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-80px',
            width: '600px',
            height: '500px',
            background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.25), transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-60px',
            width: '500px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(167, 139, 250, 0.15), transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.08), transparent 60%)',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '40px 80px 20px',
            gap: '0px',
          }}
        >
          {/* Top label */}
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#a78bfa',
              letterSpacing: '5px',
              textTransform: 'uppercase',
              marginBottom: '16px',
              display: 'flex',
            }}
          >
            STOP SCROLLING. START PLAYING.
          </div>

          {/* Controller visual */}
          <div
            style={{
              fontSize: '64px',
              marginBottom: '12px',
              display: 'flex',
            }}
          >
            🎮
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-3px',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            Inventory Full
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '26px',
              color: '#94a3b8',
              marginTop: '16px',
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: '700px',
              display: 'flex',
            }}
          >
            Too many games. No idea what to play. We fix that.
          </div>

          {/* Feature row */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '32px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              '⚡ Steam + Xbox + PS Import',
              '🎲 Mood Matching',
              '🏆 Track Your Wins',
              '🎉 Completion Celebrations',
              '🆓 Free, no sign-up',
            ].map((label) => (
              <div
                key={label}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(167, 139, 250, 0.1)',
                  color: '#c4b5fd',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  display: 'flex',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 80px 30px',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '2px',
              display: 'flex',
            }}
          >
            inventoryfull.gg
          </div>
          <div
            style={{
              fontSize: '15px',
              color: '#475569',
              display: 'flex',
            }}
          >
            No ads. No tracking. Your data stays yours.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
