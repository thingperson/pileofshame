'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something broke.</h2>
          <p style={{ color: '#888', marginBottom: '1.5rem' }}>We&apos;ve been notified. Try refreshing.</p>
          <button
            onClick={reset}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'transparent', color: '#fff', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
