import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
          borderRadius: '40px',
        }}
      >
        <svg
          viewBox="0 0 120 140"
          width="120"
          height="140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Backpack body */}
          <rect x="20" y="45" width="80" height="75" rx="12" fill="#f8fafc" />
          {/* Top flap */}
          <rect x="28" y="32" width="64" height="22" rx="8" fill="#e2e8f0" />
          {/* Straps */}
          <rect x="10" y="52" width="14" height="50" rx="7" fill="#e2e8f0" />
          <rect x="96" y="52" width="14" height="50" rx="7" fill="#e2e8f0" />
          {/* Front pocket */}
          <rect x="34" y="75" width="52" height="30" rx="6" fill="#a78bfa" opacity="0.3" />
          {/* Pocket clasp */}
          <circle cx="60" cy="78" r="4" fill="#a78bfa" opacity="0.6" />
          {/* Items overflowing out the top */}
          <rect x="35" y="14" width="12" height="28" rx="3" fill="#fbbf24" transform="rotate(-12, 41, 28)" />
          <rect x="68" y="10" width="12" height="32" rx="3" fill="#22c55e" transform="rotate(10, 74, 26)" />
          <circle cx="55" cy="22" r="8" fill="#f472b6" />
          <rect x="50" y="18" width="10" height="20" rx="3" fill="#38bdf8" transform="rotate(-5, 55, 28)" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
