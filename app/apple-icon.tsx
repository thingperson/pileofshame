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
          {/* Skull */}
          <ellipse cx="60" cy="50" rx="55" ry="50" fill="#f8fafc" />
          <rect x="25" y="80" width="70" height="30" rx="5" fill="#f8fafc" />
          {/* Eyes */}
          <ellipse cx="39" cy="42" rx="14" ry="15" fill="#0a0a0f" />
          <ellipse cx="81" cy="42" rx="14" ry="15" fill="#0a0a0f" />
          {/* Eye glints */}
          <circle cx="44" cy="36" r="5" fill="#a78bfa" opacity="0.8" />
          <circle cx="86" cy="36" r="5" fill="#a78bfa" opacity="0.8" />
          {/* Nose */}
          <path d="M54,65 L60,75 L66,65 Z" fill="#0a0a0f" opacity="0.5" />
          {/* Teeth */}
          <line x1="42" y1="87" x2="42" y2="105" stroke="#0a0a0f" strokeWidth="3" strokeLinecap="round" />
          <line x1="54" y1="87" x2="54" y2="105" stroke="#0a0a0f" strokeWidth="3" strokeLinecap="round" />
          <line x1="66" y1="87" x2="66" y2="105" stroke="#0a0a0f" strokeWidth="3" strokeLinecap="round" />
          <line x1="78" y1="87" x2="78" y2="105" stroke="#0a0a0f" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
