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
          {[0, 1, 2].map((i) => (
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
                We know. Everyone does. You bought them with good intentions, and now they sit there,
                judging you from your library. This app fixes that.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                Import your library. Tell us your mood. We find your game. You play it. Done.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  color: '#ffffff',
                }}
              >
                Let&apos;s go
              </button>
              <button
                onClick={dismiss}
                className="w-full py-2 text-xs text-text-faint hover:text-text-muted transition-colors"
              >
                I know what I&apos;m doing, skip this
              </button>
            </div>
          )}

          {/* Step 1: Import */}
          {step === 1 && (
            <div className="card-enter space-y-4">
              <div className="text-4xl">📥</div>
              <h2 className="text-xl font-bold text-text-primary">
                Get your games in here
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                The fastest way: import from Steam or PlayStation. We&apos;ll pull in your whole library
                with cover art, playtime, and achievements. Takes about 30 seconds.
              </p>
              <p className="text-xs text-text-dim leading-relaxed">
                We auto-fill descriptions, mood tags, and time estimates for every game. Zero work from you.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleImport}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                    color: '#ffffff',
                  }}
                >
                  📥 Import my library
                </button>
                <button
                  onClick={handleManual}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border transition-all hover:border-accent-purple"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  + Add games manually instead
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setStep(0)}
                  className="text-xs text-text-faint hover:text-text-muted transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-text-faint hover:text-text-muted transition-colors"
                >
                  I&apos;ll do this later →
                </button>
              </div>
            </div>
          )}

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
                onClick={() => setStep(1)}
                className="w-full py-2 text-xs text-text-faint hover:text-text-muted transition-colors"
              >
                ← Back to import
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
