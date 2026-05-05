'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Wordmark from '@/components/Wordmark';

type State = 'idle' | 'working' | 'done' | 'error';

function UnsubscribeInner() {
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';

  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState<string>('');

  async function unsubscribe() {
    setState('working');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || 'Something went wrong. Try again later.');
        setState('error');
        return;
      }
      setState('done');
    } catch {
      setMessage('Network error. Try again later.');
      setState('error');
    }
  }

  // Auto-run on mount when params look valid. JS-required avoids prefetcher-triggered unsubs.
  useEffect(() => {
    if (email && token) unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-10 flex justify-center">
          <Link href="/" aria-label="Inventory Full">
            <Wordmark width={160} />
          </Link>
        </div>

        <div
          className="rounded-2xl border p-8 sm:p-10"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          {state === 'idle' && !email && (
            <>
              <h1 className="text-2xl font-bold mb-3">Unsubscribe</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                This link is missing an email. Open the unsubscribe link from one of our emails to take yourself off the list.
              </p>
            </>
          )}

          {state === 'working' && (
            <>
              <h1 className="text-2xl font-bold mb-3">Unsubscribing…</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>One sec.</p>
            </>
          )}

          {state === 'done' && (
            <>
              <h1 className="text-2xl font-bold mb-3">You&apos;re off the list.</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                We won&apos;t email you anymore. No hard feelings.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 text-sm font-bold rounded-xl transition-all hover:scale-[1.03]"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
                  color: '#fff',
                }}
              >
                Open Inventory Full
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <h1 className="text-2xl font-bold mb-3">Couldn&apos;t unsubscribe.</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
              <button
                onClick={unsubscribe}
                className="px-6 py-3 text-sm font-bold rounded-xl border transition-all hover:scale-[1.03]"
                style={{
                  borderColor: 'var(--color-border-active)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeInner />
    </Suspense>
  );
}
