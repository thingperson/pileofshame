'use client';

import { useEffect, useRef, useState } from 'react';
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
          TOP NAV — sign-in only, minimal
          ═══════════════════════════════════════════ */}
      <nav className="relative z-20 flex items-center justify-end px-6 py-4">
        <AuthButton />
      </nav>

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center px-6 py-8 text-center">
        {/* Landing page background image — uses <img> instead of CSS background-image
            so the browser preload scanner can discover it (cuts ~2s off LCP) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.4 }}>
          <img
            src="/IF-landing-BG.webp"
            alt=""
            // eslint-disable-next-line @next/next/no-img-element
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
        </div>

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
          {/* Hero illustration — 2× asset (768×512) so desktop/retina renders crisp at larger sizes */}
          <div className="mb-5 flex justify-center">
            <Image
              src="/inventoryfull-hero-transparent@2x.webp"
              alt="A hand rising from a pile of games, holding a controller"
              width={768}
              height={512}
              className="w-56 h-auto sm:w-72 md:w-80 lg:w-96 object-contain"
              style={{ filter: 'drop-shadow(0 0 20px color-mix(in srgb, var(--color-accent-purple) 25%, transparent))' }}
              priority
            />
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Your pile&apos;s not gonna
            <br />
            <span style={{ color: 'var(--color-accent-purple)' }}>play itself.</span>
          </h1>

          <p
            className="text-lg sm:text-xl md:text-2xl leading-relaxed max-w-md mx-auto mb-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            We&apos;ll help you pick. You do the playing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onImport}
              className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
                color: '#fff',
                boxShadow: '0 4px 24px color-mix(in srgb, var(--color-accent-purple) 30%, transparent)',
              }}
            >
              Import My Library
            </button>
            <button
              onClick={onLoadSample}
              className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
              Try a sample first
            </button>
          </div>

          <p
            className="mt-4 text-xs font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)' }}
          >
            Free. No account required.
          </p>
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
      <section className="relative px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-4 tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              It&apos;s really just three things:
            </h2>
            <p
              className="text-center text-sm sm:text-base mb-10 sm:mb-14 font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-faint)' }}
            >
              from &quot;I own 300 games&quot; to &quot;I&apos;m playing one&quot;
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <Reveal delay={0}>
              <StepCard
                number="01"
                title="Import"
                description="Connect Steam, PlayStation, Xbox, or paste a CSV. We grab everything while you do nothing."
                icon={<ImportStepIcon />}
              />
            </Reveal>
            <Reveal delay={120}>
              <StepCard
                number="02"
                title="Match today's vibe"
                description="Tell us your mood and how much time you've got, and we'll match you to a game that fits right now."
                icon={<VibeStepIcon />}
              />
            </Reveal>
            <Reveal delay={240}>
              <StepCard
                number="03"
                title="Play"
                description="We pick, you play. Clear it, drop it, or just move on without guilt. Moving on is deciding too."
                icon={<PlayStepIcon />}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          THE PITCH — WHY THIS IS DIFFERENT
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-12 sm:py-16">
        {/* Decorative divider line */}
        <div className="max-w-xs mx-auto mb-16 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
          <svg className="w-4 h-4 opacity-30" viewBox="0 0 20 20" style={{ color: 'var(--color-accent-purple)' }}>
            <rect x="5" y="5" width="10" height="10" fill="currentColor" transform="rotate(45 10 10)" />
          </svg>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
        </div>

        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-6"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Not another backlog tracker.
            </h2>

            <div className="space-y-5">
              <p
                className="text-lg sm:text-xl leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                More library managing = less playing.
                <br />
                <strong style={{ color: 'var(--color-text-primary)' }}>We help you pick. You get playing.</strong>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          PULL QUOTE
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-6 sm:py-10">
        <Reveal>
          <div className="max-w-xl mx-auto text-center">
            <div className="max-w-xs mx-auto mb-6 flex items-center gap-4">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
            </div>
            <p
              className="text-lg sm:text-xl leading-relaxed italic"
              style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}
            >
              Your backlog should feel exciting.
              <br />
              Not an abandoned warehouse of good intentions.
            </p>
            <div className="max-w-xs mx-auto mt-6 flex items-center gap-4">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          5 WAYS TO PICK TONIGHT'S GAME
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-3 tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              5 ways to pick tonight&apos;s game.
            </h2>
            <p
              className="text-center text-sm sm:text-base mb-10 font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-faint)' }}
            >
              tap one. we do the rest.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Reveal delay={0}>
              <PickModeCard
                icon="🎲"
                title="Anything"
                description="Just pick something. We'll figure out what fits right now."
              />
            </Reveal>
            <Reveal delay={80}>
              <PickModeCard
                icon="🌙"
                title="Quick Session"
                description="Short session tonight? We know which games are built for that."
              />
            </Reveal>
            <Reveal delay={160}>
              <PickModeCard
                icon="🔥"
                title="Deep Cut"
                description="A world you lived in. Your save's still there."
              />
            </Reveal>
            <Reveal delay={240}>
              <PickModeCard
                icon="▶"
                title="Keep Playing"
                description="You started five games. We'll tell you which one to finish."
              />
            </Reveal>
            <Reveal delay={320}>
              <PickModeCard
                icon="🏁"
                title="Almost Done"
                description="That game you're 80% through? Let's roll the credits."
              />
            </Reveal>
            <Reveal delay={400}>
              <PickModeCard
                icon="✦"
                title="Plus the basics"
                description="Free. No sign-up. Your data stays on your device. Export anytime."
                muted
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BOTTOM CTA
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-14 sm:py-20 text-center">
        {/* Decorative divider */}
        <div className="max-w-xs mx-auto mb-16 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
          <svg className="w-4 h-4 opacity-30" viewBox="0 0 20 20" style={{ color: 'var(--color-accent-pink)' }}>
            <circle cx="10" cy="10" r="4" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
        </div>

        <Reveal>
          <div className="max-w-lg mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-8"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Stop stalling. Get playing.
            </h2>

            {/* Side-by-side CTAs — mirrors the hero layout so users get consistent affordances */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onImport}
                className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 24px color-mix(in srgb, var(--color-accent-purple) 30%, transparent)',
                }}
              >
                Import My Library
              </button>
              <button
                onClick={onLoadSample}
                className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
                Try a sample first
              </button>
            </div>

            <p
              className="mt-4 text-xs font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Free. No account required.
            </p>
          </div>
        </Reveal>

        {/* Footer */}
        <div className="mt-16 space-y-3">
          <p
            className="text-xs font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)', opacity: 0.5 }}
          >
            and we have a dino theme. come on.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/privacy"
              className="text-xs hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-xs hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Terms
            </a>
            <button
              type="button"
              onClick={() => {
                import('./CookieBanner').then((m) => m.reopenCookieBanner());
              }}
              className="text-xs hover:text-text-dim transition-colors font-[family-name:var(--font-mono)] cursor-pointer"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Cookies
            </button>
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

/**
 * Reveal: fade + translateY scroll-in using IntersectionObserver.
 * Mobile-safe (opacity + transform only), respects prefers-reduced-motion,
 * one-shot (unobserves after first reveal).
 */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;

    // Skip the animation for users who asked for less motion
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        // Option A: larger vertical travel + a hint of scale-up on entry — reads more
        // clearly as "new content arriving" on mobile without feeling gimmicky
        transform: shown ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.985)',
        transition: `opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: shown ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

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
        className="text-xl font-bold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      <p
        className="text-base leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {description}
      </p>
    </div>
  );
}

function PickModeCard({
  icon,
  title,
  description,
  muted = false,
}: {
  icon: string;
  title: string;
  description: string;
  muted?: boolean;
}) {
  return (
    <div
      className="flex gap-4 rounded-xl p-5 border transition-all duration-200 hover:border-accent-purple"
      style={{
        backgroundColor: muted ? 'transparent' : 'var(--color-bg-card)',
        borderColor: 'var(--color-border-subtle)',
        opacity: muted ? 0.75 : 1,
      }}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
        style={{ backgroundColor: muted ? 'transparent' : 'var(--color-bg-elevated)' }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <h3
          className="text-base font-bold mb-1"
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

