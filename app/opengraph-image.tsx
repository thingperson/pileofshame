import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Inventory Full — Gaming Backlog Manager';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1e1e2e 50%, #0a0a0f 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Ambient gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-50px',
            width: '500px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(167, 139, 250, 0.15), transparent)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-50px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(249, 168, 212, 0.1), transparent)',
            display: 'flex',
          }}
        />

        {/* Emoji */}
        <div style={{ fontSize: '80px', marginBottom: '16px', display: 'flex' }}>
          🎒
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-2px',
            display: 'flex',
          }}
        >
          Inventory Full
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            marginTop: '12px',
            display: 'flex',
          }}
        >
          Your backlog is full. Your time doesn&apos;t have to be.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '32px',
          }}
        >
          {['Steam Import', 'Xbox Import', 'Backlog Payback', 'Deal Checker', 'Free Forever'].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(167, 139, 250, 0.12)',
                  color: '#a78bfa',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: '1px solid rgba(167, 139, 250, 0.25)',
                  display: 'flex',
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '18px',
            color: '#475569',
            letterSpacing: '1px',
            display: 'flex',
          }}
        >
          inventoryfull.gg
        </div>
      </div>
    ),
    { ...size },
  );
}
