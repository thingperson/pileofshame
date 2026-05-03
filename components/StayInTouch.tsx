'use client';

import { useState } from 'react';
import { DISCORD_INVITE_URL } from '@/lib/social';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Lightweight email capture + Discord link for unauthenticated visitors.
 * Sits above the legal footer on landing/about. Voice-charter compliant —
 * confident, no hedging, low-shame.
 */
export function StayInTouch({ source = 'landing' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          pageUrl: typeof window !== 'undefined' ? window.location.href : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Something went sideways. Try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setEmail('');
    } catch {
      setErrorMsg('Something went sideways. Try again.');
      setStatus('error');
    }
  }

  return (
    <div
      className="rounded-xl border p-6 sm:p-8"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 items-start">
        {/* Email capture */}
        <div>
          <h3
            className="text-base font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Hear when we ship something good.
          </h3>
          <p
            className="text-xs mb-4 font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)' }}
          >
            Occasional updates. No spam. Unsubscribe whenever.
          </p>

          {status === 'success' ? (
            <p
              className="text-sm font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-accent-pink)' }}
            >
              You&apos;re in. Talk soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@somewhere.com"
                aria-label="Email address"
                disabled={status === 'submitting'}
                className="flex-1 min-w-0 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-purple)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                }}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
                  color: '#fff',
                }}
              >
                {status === 'submitting' ? 'Sending…' : 'Sign me up'}
              </button>
            </form>
          )}

          {status === 'error' && errorMsg && (
            <p
              className="mt-2 text-xs font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-accent-pink)' }}
            >
              {errorMsg}
            </p>
          )}
        </div>

        {/* Discord */}
        <div className="sm:border-l sm:pl-8" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <h3
            className="text-base font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            We&apos;re hanging out in Discord.
          </h3>
          <p
            className="text-xs mb-4 font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)' }}
          >
            Share what got picked. Roast your own pile. Tell us what to fix.
          </p>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-purple)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M19.27 5.33A18.41 18.41 0 0 0 14.61 4l-.21.42a17.24 17.24 0 0 1 4.13 1.31 15.5 15.5 0 0 0-13.06 0A17.24 17.24 0 0 1 9.6 4.42L9.39 4a18.41 18.41 0 0 0-4.66 1.33A19.42 19.42 0 0 0 1.5 16.4a18.5 18.5 0 0 0 5.62 2.85l.45-.62a11.85 11.85 0 0 1-1.78-.86l.43-.34a13.21 13.21 0 0 0 11.56 0l.43.34a11.85 11.85 0 0 1-1.78.86l.45.62a18.5 18.5 0 0 0 5.62-2.85 19.42 19.42 0 0 0-3.23-11.07ZM8.52 14.45c-1.1 0-2-1.02-2-2.27s.9-2.27 2-2.27 2 1.02 2 2.27-.9 2.27-2 2.27Zm6.96 0c-1.1 0-2-1.02-2-2.27s.9-2.27 2-2.27 2 1.02 2 2.27-.9 2.27-2 2.27Z" />
            </svg>
            Join the Discord
          </a>
        </div>
      </div>
    </div>
  );
}
