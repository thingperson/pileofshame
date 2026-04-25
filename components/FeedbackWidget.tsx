'use client';

import { useState, useCallback, useEffect } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [anyModalOpen, setAnyModalOpen] = useState(false);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Hide the floating launcher whenever a blocking modal is open — on mobile
  // the Feedback pill was covering primary CTAs (e.g., the Let's Go button
  // in the Reroll modal). We key off aria-modal="true" so non-blocking
  // role="dialog" notices (like the cookie banner) don't hide us.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const check = () => {
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      let otherDialogOpen = false;
      dialogs.forEach((d) => {
        if ((d as HTMLElement).dataset.feedbackDialog !== 'true') otherDialogOpen = true;
      });
      setAnyModalOpen(otherDialogOpen);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['role', 'aria-modal'] });
    return () => observer.disconnect();
  }, []);

  const submit = useCallback(async () => {
    if (message.trim().length < 3) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          marketingConsent: !!email.trim() && marketingConsent,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      setStatus('sent');
      setMessage('');
      setEmail('');
      setMarketingConsent(false);
      // Auto-close after 2s on success
      setTimeout(() => {
        setOpen(false);
        setStatus('idle');
      }, 2000);
    } catch {
      setStatus('error');
    }
  }, [message, email, marketingConsent]);

  return (
    <>
      {/* Floating launcher button — hidden when another modal is open */}
      {!anyModalOpen && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Send feedback"
          className="fixed right-4 z-40 px-3 py-2 text-xs font-medium rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shadow-lg backdrop-blur-sm transition-colors"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          Feedback
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Send feedback"
          data-feedback-dialog="true"
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Tell us what's up</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Bug, idea, or just hi. Email is optional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close feedback"
                className="text-neutral-500 hover:text-neutral-300 text-2xl leading-none -mt-1"
              >
                ×
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              maxLength={5000}
              disabled={status === 'sending' || status === 'sent'}
              className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500 resize-none disabled:opacity-50"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional, only if you want a reply)"
              maxLength={200}
              disabled={status === 'sending' || status === 'sent'}
              className="w-full mt-3 px-3 py-2 text-sm bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
            />

            {email.trim() && (
              <label className="flex items-start gap-2 mt-3 text-xs text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  disabled={status === 'sending' || status === 'sent'}
                  className="mt-0.5 accent-violet-600"
                />
                <span>
                  Hear from us about updates and new features. Unsubscribe anytime. We'll never share your email.
                </span>
              </label>
            )}

            <div className="flex items-center justify-between gap-3 mt-4">
              <div className="text-xs text-neutral-500 min-h-[1rem]">
                {status === 'sent' && <span className="text-emerald-400">Got it. Thanks.</span>}
                {status === 'error' && <span className="text-rose-400">Send failed. Try again.</span>}
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={status === 'sending' || status === 'sent' || message.trim().length < 3}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
