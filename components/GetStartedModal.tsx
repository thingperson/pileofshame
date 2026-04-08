'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/useAuth';

interface GetStartedModalProps {
  open: boolean;
  onClose: () => void;
  onImport: () => void;
  onLoadSample: () => void;
}

export default function GetStartedModal({ open, onClose, onImport, onLoadSample }: GetStartedModalProps) {
  const { signInWithDiscord, signInWithGoogle, signInWithEmail } = useAuth();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [open]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Get Started"
        className={`relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border overflow-hidden transition-all duration-300 ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
        }}
      >
        {/* Close X */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-lg text-text-faint hover:text-text-muted hover:bg-white/5 transition-all z-10"
          aria-label="Close"
        >
          &#x2715;
        </button>

        <div className="px-5 pt-6 pb-5 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-text-primary">Get Started</h2>
            <p className="text-xs text-text-muted mt-1">
              Sign in to sync across devices, or jump straight in.
            </p>
          </div>

          {!showEmailInput && !emailSent && (
            <>
              {/* Sign in options */}
              <div className="space-y-2">
                <button
                  onClick={() => { signInWithDiscord(); handleClose(); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ backgroundColor: '#5865F2', color: '#ffffff' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  Discord
                </button>
                <button
                  onClick={() => { signInWithGoogle(); handleClose(); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    borderColor: 'var(--color-border-active)',
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>

                <button
                  onClick={() => setShowEmailInput(true)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border transition-all hover:border-accent-purple"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Use email instead
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
                <span className="text-xs text-text-faint font-[family-name:var(--font-mono)]">or</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
              </div>

              {/* No-account options */}
              <div className="space-y-2">
                <button
                  onClick={() => { onImport(); handleClose(); }}
                  className="w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
                    color: '#fff',
                  }}
                >
                  Import my library
                </button>
                <button
                  onClick={() => { onLoadSample(); handleClose(); }}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border transition-all hover:border-accent-purple"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Just show me sample data for now
                </button>
              </div>

              <p className="text-xs text-text-faint/60 text-center font-[family-name:var(--font-mono)]">
                No account needed. You can always sign in later.
              </p>
            </>
          )}

          {showEmailInput && !emailSent && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setEmailError('');
              if (!email.includes('@')) { setEmailError('Enter a valid email'); return; }
              const { error } = await signInWithEmail(email);
              if (error) { setEmailError(error.message || 'Something went wrong'); }
              else { setEmailSent(true); }
            }} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoFocus
                className="w-full text-sm bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple"
              />
              {emailError && <p className="text-xs text-red-400">{emailError}</p>}
              <button
                type="submit"
                className="w-full px-3 py-2 text-sm font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
              >
                Send magic link
              </button>
              <button
                type="button"
                onClick={() => { setShowEmailInput(false); setEmailError(''); }}
                className="w-full text-xs text-text-faint hover:text-text-muted transition-colors"
              >
                ← Back
              </button>
            </form>
          )}

          {emailSent && (
            <div className="text-center space-y-2 py-2">
              <p className="text-2xl">✉️</p>
              <p className="text-sm text-text-primary font-medium">Check your email</p>
              <p className="text-xs text-text-muted">
                We sent a link to <span className="text-accent-purple">{email}</span>.
              </p>
              <button
                onClick={() => { setEmailSent(false); setShowEmailInput(false); setEmail(''); }}
                className="text-xs text-text-faint hover:text-text-muted transition-colors"
              >
                Try a different method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
