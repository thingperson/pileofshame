'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const CONSENT_KEY = 'if-cookie-consent';
const GA_ID = 'G-98B24MRQZS';

type Consent = 'accepted' | 'declined' | null;

function readConsent(): Consent {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
}

function writeConsent(value: 'accepted' | 'declined') {
  try {
    localStorage.setItem(CONSENT_KEY, value);
    // Notify same-tab listeners (Footer "Manage cookies" link reopens banner)
    window.dispatchEvent(new CustomEvent('if-consent-change', { detail: value }));
  } catch {
    // ignore
  }
}

// Public helper: lets app-wide code read consent without re-importing the key.
export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'accepted';
}

// Public helper: lets footer "Manage cookies" link reopen the banner.
export function reopenCookieBanner() {
  try {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new CustomEvent('if-consent-change', { detail: null }));
  } catch {
    // ignore
  }
}

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  // Read consent after mount to avoid hydration mismatch
  useEffect(() => {
    setConsent(readConsent());
    setHydrated(true);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Consent;
      setConsent(detail);
    };
    window.addEventListener('if-consent-change', onChange);
    return () => window.removeEventListener('if-consent-change', onChange);
  }, []);

  const accept = () => {
    writeConsent('accepted');
    setConsent('accepted');
  };

  const decline = () => {
    writeConsent('declined');
    setConsent('declined');
  };

  // Don't render anything until we know the user's choice (no flicker, no SSR mismatch)
  if (!hydrated) return null;

  return (
    <>
      {/* GA only loads after explicit consent — no cookies set before opt-in */}
      {consent === 'accepted' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {consent === null && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie preferences"
          className="fixed bottom-0 inset-x-0 z-[100] p-3 sm:p-4 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-xl shadow-2xl p-4 sm:p-5 pointer-events-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <p className="text-sm text-neutral-200 leading-relaxed flex-1">
                We use cookies for sign-in and anonymous analytics. Sign-in cookies are required.{' '}
                <a href="/privacy" className="underline text-violet-300 hover:text-violet-200">
                  Privacy
                </a>
                .
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={decline}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={accept}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
