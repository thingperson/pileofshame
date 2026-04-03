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
                You&apos;re not lazy. You&apos;re overloaded.
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                You bought those games because something in each one genuinely excited you.
                That excitement is still in there, buried under 200 tiles and the
                world&apos;s worst multiple-choice question.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                Import your library. Tell us your mood. We&apos;ll find your game tonight.
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
                We do the work. You just play.
              </h2>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="text-lg shrink-0">📚</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">We auto-fill everything</p>
                    <p className="text-xs text-text-dim">Descriptions, mood tags, completion times. We pull it all in so you never have to tag or organize anything.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg shrink-0">🔥</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">One tap to commit</p>
                    <p className="text-xs text-text-dim">Tap a status badge: Backlog → Play Next → Now Playing → Cleared. No menus, no friction.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg shrink-0">🎲</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Can&apos;t decide? We decide for you.</p>
                    <p className="text-xs text-text-dim">Tell us your mood and how much time you have. We&apos;ll match you with the right game from your own library.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg shrink-0">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Finish a game? Confetti.</p>
                    <p className="text-xs text-text-dim">Real celebration. Stats. The satisfaction of watching your pile actually shrink. You earned it.</p>
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
                Let&apos;s go. Show me my pile.
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
