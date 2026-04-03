'use client';

interface OnboardingWelcomeProps {
  onImport: () => void;
  onAddManual: () => void;
}

export default function OnboardingWelcome({ onImport, onAddManual }: OnboardingWelcomeProps) {
  return (
    <div className="card-enter py-8 sm:py-14">
      <div
        className="max-w-lg mx-auto rounded-2xl overflow-hidden border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        <div className="px-6 py-8 space-y-5 text-center">
          <div className="text-4xl">🎮</div>
          <h2 className="text-xl font-bold text-text-primary">
            Let&apos;s find your game.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Import your library and we&apos;ll pick your first game in seconds.
          </p>

          <button
            onClick={onImport}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
              color: '#ffffff',
            }}
          >
            Import My Library
          </button>
          <p className="text-[10px] text-text-faint font-[family-name:var(--font-mono)]">
            Steam, PlayStation, Xbox, GOG, Playnite
          </p>

          <button
            onClick={onAddManual}
            className="w-full py-2.5 rounded-xl text-sm font-medium border transition-all hover:border-accent-purple"
            style={{
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
            }}
          >
            + Add a Game Manually
          </button>
        </div>
      </div>
    </div>
  );
}
