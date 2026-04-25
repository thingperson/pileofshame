'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import AuthButton from '@/components/AuthButton';
import Wordmark from '@/components/Wordmark';

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
          TOP HEADER — wordmark + nav in one row
          ═══════════════════════════════════════════ */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <Wordmark
          variant="full"
          aria-label="Inventory Full — get playing."
          className="h-9 sm:h-11 w-auto"
          style={{ ['--wordmark-in' as string]: '#ffffff' }}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
              color: '#fff',
              boxShadow: '0 2px 12px color-mix(in srgb, var(--color-accent-purple) 25%, transparent)',
            }}
          >
            Open app
          </button>
          <AuthButton />
        </div>
      </header>

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
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Your pile&apos;s not gonna play itself.
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

      {/* Marketing-narrative sections (How it works / Not another tracker /
          Pull quote / 3 ways to pick) moved to /about on 2026-04-25 to keep
          the landing as a fast decision funnel. The /about page is now the
          canonical "what is this product" surface. */}

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
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 lowercase"
              style={{ color: 'var(--color-accent-pink)' }}
            >
              get playing.
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
        <div className="mt-16 space-y-4">
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


