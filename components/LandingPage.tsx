'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import AuthButton from '@/components/AuthButton';

interface LandingPageProps {
  onImport: () => void;
  onLoadSample: () => void;
}

export default function LandingPage({ onImport, onLoadSample }: LandingPageProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative z-10 w-full overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      {/* ═══════════════════════════════════════════
          FLOATING GEOMETRIC ELEMENTS
          ═══════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Large ring - top right */}
        <svg className="absolute -top-20 -right-20 w-80 h-80 opacity-[0.04] animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-accent-purple)' }} />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" style={{ color: 'var(--color-accent-pink)' }} />
        </svg>

        {/* Small diamond - left side */}
        <svg className="absolute top-[30%] -left-6 w-24 h-24 opacity-[0.06]" viewBox="0 0 100 100" style={{ animation: 'float 8s ease-in-out infinite' }}>
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 50 50)" style={{ color: 'var(--color-accent-purple)' }} />
        </svg>

        {/* Dots cluster - right side mid */}
        <svg className="absolute top-[55%] right-8 w-32 h-32 opacity-[0.05]" viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="2" fill="currentColor" style={{ color: 'var(--color-accent-purple)' }} />
          <circle cx="50" cy="15" r="1.5" fill="currentColor" style={{ color: 'var(--color-accent-pink)' }} />
          <circle cx="75" cy="30" r="2.5" fill="currentColor" style={{ color: 'var(--color-accent-purple)' }} />
          <circle cx="30" cy="55" r="1.5" fill="currentColor" style={{ color: 'var(--color-accent-pink)' }} />
          <circle cx="65" cy="60" r="2" fill="currentColor" style={{ color: 'var(--color-accent-purple)' }} />
          <circle cx="45" cy="80" r="1.5" fill="currentColor" style={{ color: 'var(--color-accent-pink)' }} />
          <circle cx="80" cy="75" r="2" fill="currentColor" style={{ color: 'var(--color-accent-purple)' }} />
        </svg>

        {/* Triangle - bottom left */}
        <svg className="absolute bottom-[25%] left-12 w-20 h-20 opacity-[0.05]" viewBox="0 0 100 100" style={{ animation: 'float 10s ease-in-out infinite reverse' }}>
          <polygon points="50,15 85,85 15,85" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-accent-pink)' }} />
        </svg>

        {/* Cross/plus - right side low */}
        <svg className="absolute bottom-[40%] right-20 w-16 h-16 opacity-[0.04]" viewBox="0 0 100 100" style={{ animation: 'float 12s ease-in-out infinite' }}>
          <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-accent-purple)' }} />
          <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-accent-purple)' }} />
        </svg>

        {/* Hexagon - far bottom right */}
        <svg className="absolute bottom-[10%] right-[15%] w-28 h-28 opacity-[0.03]" viewBox="0 0 100 100" style={{ animation: 'float 14s ease-in-out infinite' }}>
          <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--color-accent-purple)' }} />
        </svg>
      </div>

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center px-6 py-8 text-center">
        {/* Landing page background image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/IF-landing-BG.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />

        {/* Ambient glow behind hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 700px 500px at 50% 30%, color-mix(in srgb, var(--color-accent-purple) 12%, transparent), transparent)',
          }}
        />

        {/* Subtle grid pattern behind hero */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div
          className="relative max-w-2xl mx-auto transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          {/* Hero illustration */}
          <div className="mb-4 flex justify-center">
            <Image
              src="/inventoryfull-hero-transparent.webp"
              alt="A hand rising from a pile of games, holding a controller"
              width={576}
              height={384}
              className="w-48 h-auto sm:w-64 md:w-72 object-contain"
              style={{ filter: 'drop-shadow(0 0 20px color-mix(in srgb, var(--color-accent-purple) 25%, transparent))' }}
              priority
            />
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Your pile&apos;s not gonna
            <br />
            <span style={{ color: 'var(--color-accent-purple)' }}>play itself.</span>
          </h1>

          <p
            className="text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto mb-5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Import your library. Tell us your mood.
            <br className="hidden sm:block" />
            We pick the game. You hit play.
          </p>

          <button
            onClick={onImport}
            className="px-8 py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
              color: '#fff',
              boxShadow: '0 4px 24px color-mix(in srgb, var(--color-accent-purple) 30%, transparent)',
            }}
          >
            Import My Library
          </button>

          <p
            className="mt-4 text-xs font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)' }}
          >
            Steam / PlayStation / Xbox / GOG / Playnite
          </p>

          <button
            onClick={onLoadSample}
            className="mt-4 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border-subtle)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-purple)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            No library? Try a sample.
          </button>

          {/* Sign-in affordance for returning users */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span
              className="text-xs font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Already have an account?
            </span>
            <AuthButton />
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-700"
          style={{ opacity: visible ? 0.4 : 0, color: 'var(--color-text-dim)' }}
        >
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-4 tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Three steps. Zero decisions.
          </h2>
          <p
            className="text-center text-sm mb-12 sm:mb-16 font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)' }}
          >
            from &quot;I own 300 games&quot; to &quot;I&apos;m playing one&quot;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <StepCard
              number="01"
              title="Import"
              description="Connect Steam, PlayStation, Xbox, or paste a CSV. We grab everything. You do nothing."
              icon={<ImportStepIcon />}
            />
            <StepCard
              number="02"
              title="Vibe Check"
              description="Tell us your mood and how much time you've got. We match you to a game that fits right now."
              icon={<VibeStepIcon />}
            />
            <StepCard
              number="03"
              title="Play"
              description="We pick it. You play it. Clear it? Confetti. Bail on it? No judgment. That's a decision too."
              icon={<PlayStepIcon />}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          THE PITCH — WHY THIS IS DIFFERENT
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-16 sm:py-24">
        {/* Decorative divider line */}
        <div className="max-w-xs mx-auto mb-16 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
          <svg className="w-4 h-4 opacity-30" viewBox="0 0 20 20" style={{ color: 'var(--color-accent-purple)' }}>
            <rect x="5" y="5" width="10" height="10" fill="currentColor" transform="rotate(45 10 10)" />
          </svg>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Not another backlog tracker.
          </h2>

          <div className="space-y-5">
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Every other app wants you to catalogue and organize.
              <br />
              We want you to <strong style={{ color: 'var(--color-text-primary)' }}>close the app and go play.</strong>
            </p>

            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              You scroll for 20 minutes, pick nothing, open YouTube.
              <br />
              Inventory Full fixes that.
            </p>

            <p
              className="text-sm leading-relaxed font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-dim)' }}
            >
              We nudge you to play. If you don&apos;t like the game, blame us and keep going.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — QUICK HITS
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12 tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            What you get.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={<MoodIcon />}
              title="Mood matching"
              description="Cozy, intense, brain-off, narrative - match your energy to a game."
            />
            <FeatureCard
              icon={<ClockIcon />}
              title="Time-aware picks"
              description="Got 20 minutes or a whole evening? We know the difference."
            />
            <FeatureCard
              icon={<TimerIcon />}
              title="5-minute try timer"
              description="Not sure about a game? Give it five minutes. Timer says stop, you decide."
            />
            <FeatureCard
              icon={<PartyIcon />}
              title="Completion celebrations"
              description="Finished a game? You earned the confetti. Bailed? That counts too."
            />
            <FeatureCard
              icon={<FreeIcon />}
              title="Free. No sign-up."
              description="No email, no account required. Open it, use it. Done."
            />
            <FeatureCard
              icon={<LockIcon />}
              title="Your data stays yours"
              description="Everything lives in your browser. Export anytime. We don't sell anything."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BOTTOM CTA
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-20 sm:py-28 text-center">
        {/* Decorative divider */}
        <div className="max-w-xs mx-auto mb-16 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
          <svg className="w-4 h-4 opacity-30" viewBox="0 0 20 20" style={{ color: 'var(--color-accent-pink)' }}>
            <circle cx="10" cy="10" r="4" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
        </div>

        <div className="max-w-lg mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Your pile&apos;s not getting any smaller.
          </h2>
          <p
            className="text-sm mb-8 font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)' }}
          >
            stop deciding. start playing.
          </p>

          <button
            onClick={onImport}
            className="px-8 py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
              color: '#fff',
              boxShadow: '0 4px 24px color-mix(in srgb, var(--color-accent-purple) 30%, transparent)',
            }}
          >
            Import My Library - It&apos;s Free
          </button>

          <button
            onClick={onLoadSample}
            className="mt-4 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer block mx-auto"
            style={{
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border-subtle)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-purple)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            Or try a sample library
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 space-y-3">
          <p
            className="text-[11px] font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)', opacity: 0.5 }}
          >
            and we have a dino theme. come on.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/privacy"
              className="text-[11px] hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-[11px] hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Terms
            </a>
          </div>
        </div>
      </section>

      {/* Float keyframe for geometric elements */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6 sm:p-8 border transition-all duration-200 hover:border-accent-purple group"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-xs font-bold font-[family-name:var(--font-mono)]"
          style={{ color: 'var(--color-accent-purple)' }}
        >
          {number}
        </span>
        <div className="opacity-40 group-hover:opacity-70 transition-opacity">
          {icon}
        </div>
      </div>
      <h3
        className="text-lg font-bold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {description}
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className="flex gap-4 rounded-xl p-5 border transition-all duration-200 hover:border-accent-purple"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-elevated)' }}
      >
        {icon}
      </div>
      <div>
        <h3
          className="text-sm font-bold mb-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h3>
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step Icons (inline SVGs for How It Works)
   ───────────────────────────────────────────── */

function ImportStepIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function VibeStepIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function PlayStepIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-pink)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Feature Icons (inline SVGs, theme-aware)
   ───────────────────────────────────────────── */

function MoodIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S10.5 3.089 10.5 4.125c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.42 48.42 0 01-4.163-.3c.186 1.613.46 3.193.816 4.726l5.04 5.04a4.5 4.5 0 006.364-6.364l-3.862-3.862A19.873 19.873 0 0014.25 6.087z" />
    </svg>
  );
}

function PartyIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-pink)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  );
}

function FreeIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-5 h-5" style={{ color: 'var(--color-accent-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
