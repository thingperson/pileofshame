'use client';

import { useState, useEffect } from 'react';

interface OnboardingWelcomeProps {
  onImport: () => void;
  onAddManual: () => void;
}

const ONBOARDING_KEY = 'pos-onboarding-seen';

export default function OnboardingWelcome({ onImport, onAddManual }: OnboardingWelcomeProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user has never seen onboarding
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
  };

  const handleImport = () => {
    dismiss();
    onImport();
  };

  const handleManual = () => {
    dismiss();
    onAddManual();
  };

  if (!visible) return null;

  return (
    <div className="card-enter py-8 sm:py-14">
      <div
        className="max-w-lg mx-auto rounded-2xl overflow-hidden border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-5">
          {[0, 2].map((i) => (
            <div
              key={i}
              className="h-1 rounded-full flex-1 transition-all duration-300"
              style={{
                backgroundColor: i <= step ? 'var(--color-accent-purple)' : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        <div className="px-6 py-6">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="card-enter space-y-4">
              <div className="text-4xl">🎮</div>
              <h2 className="text-xl font-bold text-text-primary">
                You have games. Too many games.
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                You bought them because something in each one excited you. That excitement
                is still in there. You just need a nudge past the scroll-and-freeze loop.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                30 seconds to import. Tell us your mood. Play something great tonight.
              </p>
              <button
                onClick={handleImport}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  color: '#ffffff',
                }}
              >
                📥 Import my Steam / PSN library
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManual}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all hover:border-accent-purple"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  + Add manually
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 text-sm text-text-faint hover:text-text-muted transition-colors"
                >
                  How does this work?
                </button>
              </div>
            </div>
          )}

          {/* Step 1: no longer used — step 0 handles import directly */}

          {/* Step 2: How it works */}
          {step === 2 && (
            <div className="card-enter space-y-4">
              <div className="text-4xl">🎲</div>
              <h2 className="text-xl font-bold text-text-primary">
                Here&apos;s how this works
              </h2>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="text-lg shrink-0">📚</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Your games land in The Pile</p>
                    <p className="text-xs text-text-dim">Every imported game starts here. We enrich it with descriptions, mood tags, and completion times automatically.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg shrink-0">🔥</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Tap status badges to advance</p>
                    <p className="text-xs text-text-dim">Backlog → Play Next → Now Playing → Cleared. One tap moves a game forward.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg shrink-0">🎲</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Hit &ldquo;What Should I Play?&rdquo;</p>
                    <p className="text-xs text-text-dim">Can&apos;t decide? We pick for you. Filter by mood and time, or go full random.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg shrink-0">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Beat a game? We celebrate</p>
                    <p className="text-xs text-text-dim">Confetti, stats, and the satisfaction of watching your pile shrink.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={dismiss}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  color: '#ffffff',
                }}
              >
                Got it. Let me at my pile.
              </button>
              <button
                onClick={() => setStep(0)}
                className="w-full py-2 text-xs text-text-faint hover:text-text-muted transition-colors"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
