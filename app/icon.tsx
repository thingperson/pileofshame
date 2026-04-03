import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '7px',
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="26"
          height="26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Backpack body */}
          <rect x="7" y="12" width="18" height="16" rx="3" fill="#f8fafc" />
          {/* Backpack top flap */}
          <rect x="9" y="9" width="14" height="6" rx="2" fill="#e2e8f0" />
          {/* Straps */}
          <rect x="5" y="14" width="3" height="10" rx="1.5" fill="#e2e8f0" />
          <rect x="24" y="14" width="3" height="10" rx="1.5" fill="#e2e8f0" />
          {/* Pocket */}
          <rect x="11" y="19" width="10" height="6" rx="1.5" fill="#a78bfa" opacity="0.4" />
          {/* Items poking out the top */}
          <rect x="11" y="5" width="3" height="7" rx="1" fill="#fbbf24" transform="rotate(-10, 12.5, 8.5)" />
          <rect x="17" y="4" width="3" height="8" rx="1" fill="#22c55e" transform="rotate(8, 18.5, 8)" />
          <circle cx="15" cy="7" r="2" fill="#f472b6" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
