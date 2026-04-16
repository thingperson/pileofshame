'use client';

import { useEffect, useState } from 'react';

interface SampleImportNudgeProps {
  isSampleLibrary: boolean;
  onImport: () => void;
}

const NUDGE_SHOWN_KEY = 'if-sample-nudge-shown';
const SAMPLE_COMPLETED_EVENT = 'if-sample-completed';

/**
 * One-time post-first-commit prompt for users exploring the sample library.
 *
 * Fires when Reroll.tsx clears the `if-sample-pending` flag after a successful
 * commit in sample mode — that moment is dispatched as a window event
 * (`if-sample-completed`) so this component can react without polling.
 *
 * Gated by:
 *  - isSampleLibrary prop from parent
 *  - localStorage `if-sample-nudge-shown` (never fire twice per browser)
 *
 * The user has just seen the value prop work ("we picked, I committed"); now
 * we point them at the real thing. Warm, skippable, one-time.
 */
export default function SampleImportNudge({ isSampleLibrary, onImport }: SampleImportNudgeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSampleLibrary) return;

    // Respect the "already shown" flag
    try {
      if (localStorage.getItem(NUDGE_SHOWN_KEY) === '1') return;
    } catch {
      return;
    }

    const handler = () => setVisible(true);
    window.addEventListener(SAMPLE_COMPLETED_EVENT, handler);
    return () => window.removeEventListener(SAMPLE_COMPLETED_EVENT, handler);
  }, [isSampleLibrary]);

  const dismiss = () => {
    try {
      localStorage.setItem(NUDGE_SHOWN_KEY, '1');
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  const handleImport = () => {
    dismiss();
    onImport();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-nudge-title"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-xl animate-[slideUp_240ms_ease-out]"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid color-mix(in srgb, var(--color-accent-purple) 25%, transparent)',
          boxShadow: '0 20px 60px color-mix(in srgb, var(--color-accent-purple) 15%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-2xl mb-3"
          aria-hidden="true"
        >
          🎉
        </div>

        <h2
          id="sample-nudge-title"
          className="text-xl font-bold mb-2 tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          That felt good, right?
        </h2>

        <p
          className="text-sm leading-relaxed mb-5"
          style={{ color: 'var(--color-text-muted)' }}
        >
          That was one pick from fake data.
          <br />
          Now do it with yours.
        </p>

        <div className="flex flex-col sm:flex-row-reverse gap-2">
          <button
            onClick={handleImport}
            className="flex-1 px-5 py-3 text-sm font-bold rounded-xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-pink))',
              boxShadow: '0 4px 20px color-mix(in srgb, var(--color-accent-purple) 30%, transparent)',
            }}
          >
            Import My Library
          </button>
          <button
            onClick={dismiss}
            className="flex-1 px-5 py-3 text-sm font-medium rounded-xl border transition-all hover:border-accent-purple"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
            }}
          >
            Keep exploring
          </button>
        </div>

        <p
          className="mt-4 text-xs font-[family-name:var(--font-mono)] text-center"
          style={{ color: 'var(--color-text-faint)' }}
        >
          Free. No account required.
        </p>
      </div>
    </div>
  );
}

/**
 * Emits the completion signal. Call from the commit handler that clears
 * `if-sample-pending`. Kept here so the event name stays paired with the
 * listener.
 */
export function emitSampleCompleted() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(SAMPLE_COMPLETED_EVENT));
  } catch {
    // ignore
  }
}
