'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AboutPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative z-10 w-full overflow-hidden min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      {/* ── Nav bar ── */}
      <nav className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <a href="/" className="text-lg font-extrabold tracking-tight hover:text-accent-purple transition-colors" style={{ color: 'var(--color-text-primary)' }}>
          Inventory Full
        </a>
        <a
          href="/"
          className="px-4 py-2 text-xs font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
            color: '#fff',
          }}
        >
          Open App
        </a>
      </nav>

      {/* ── Floating geometric elements ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <svg className="absolute -top-20 -right-20 w-80 h-80 opacity-[0.04] animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-accent-purple)' }} />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" style={{ color: 'var(--color-accent-pink)' }} />
        </svg>
        <svg className="absolute top-[30%] -left-6 w-24 h-24 opacity-[0.06]" viewBox="0 0 100 100" style={{ animation: 'float 8s ease-in-out infinite' }}>
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 50 50)" style={{ color: 'var(--color-accent-purple)' }} />
        </svg>
        <svg className="absolute bottom-[25%] left-12 w-20 h-20 opacity-[0.05]" viewBox="0 0 100 100" style={{ animation: 'float 10s ease-in-out infinite reverse' }}>
          <polygon points="50,15 85,85 15,85" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-accent-pink)' }} />
        </svg>
      </div>

      {/* ── Hero ── */}
      <section className="relative min-h-[35vh] flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.4 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/IF-landing-BG.webp" alt="" className="w-full h-full object-cover" fetchPriority="high" />
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 700px 500px at 50% 30%, color-mix(in srgb, var(--color-accent-purple) 12%, transparent), transparent)',
          }}
        />

        <div
          className="relative max-w-2xl mx-auto transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <div className="mb-4 flex justify-center">
            <Image
              src="/inventoryfull-hero-transparent.webp"
              alt="A hand rising from a pile of games, holding a controller"
              width={384}
              height={256}
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
            className="text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Can&apos;t decide what to play? Yeah, we know.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-4 tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            It&apos;s really just three things:
          </h2>
          <p
            className="text-center text-sm mb-12 sm:mb-16 font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)' }}
          >
            from &quot;I own 300 games&quot; to &quot;I&apos;m playing one&quot;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <StepCard number="01" title="Import" description="Connect Steam, PlayStation, Xbox, or paste a CSV. We grab everything. You do nothing." />
            <StepCard number="02" title="Vibe Check" description="Tell us your mood and how much time you've got. We match you to a game that fits right now." />
            <StepCard number="03" title="Play" description="We pick, you play. Clear it, drop it, or just move on? No judgement. Moving on is deciding too." />
          </div>
        </div>
      </section>

      {/* ── The pitch ── */}
      <section className="relative px-6 py-16 sm:py-24">
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
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Every other app wants you to catalogue and organize.
              <br />
              We want you to <strong style={{ color: 'var(--color-text-primary)' }}>close the app and go play.</strong>
            </p>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              You scroll for 20 minutes, pick nothing, open YouTube.
              <br />
              Inventory Full fixes that.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12 tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            What you get.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard title="Mood matching" description="Cozy, intense, brain-off, narrative - match your energy to a game." />
            <FeatureCard title="Time-aware picks" description="Got 20 minutes or a whole evening? We know the difference." />
            <FeatureCard title="5-minute try timer" description="Not sure about a game? Give it five minutes. Timer says stop, you decide." />
            <FeatureCard title="Completion celebrations" description="Finished a game? You earned the confetti. Moved on? That counts too." />
            <FeatureCard title="Free. No sign-up." description="No email, no account required. Open it, use it. Done." />
            <FeatureCard title="Your data stays yours" description="Everything lives in your browser. Export anytime. We don't sell anything." />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <section className="relative px-6 py-16 text-center">
        <div className="max-w-xs mx-auto mb-12 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
          <svg className="w-4 h-4 opacity-30" viewBox="0 0 20 20" style={{ color: 'var(--color-accent-pink)' }}>
            <circle cx="10" cy="10" r="4" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
        </div>

        <p className="text-sm mb-6 font-[family-name:var(--font-mono)]" style={{ color: 'var(--color-text-faint)' }}>
          stop stalling. get playing.
        </p>

        <a
          href="/"
          className="inline-block px-8 py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
            color: '#fff',
            boxShadow: '0 4px 24px color-mix(in srgb, var(--color-accent-purple) 30%, transparent)',
          }}
        >
          Open Inventory Full
        </a>

        <div className="mt-12 space-y-3">
          <p
            className="text-xs font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--color-text-faint)', opacity: 0.5 }}
          >
            and we have a dino theme. come on.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="/privacy" className="text-xs hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]" style={{ color: 'var(--color-text-faint)' }}>
              Privacy
            </a>
            <a href="/terms" className="text-xs hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]" style={{ color: 'var(--color-text-faint)' }}>
              Terms
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div
      className="rounded-xl p-6 sm:p-8 border transition-all duration-200 hover:border-accent-purple group"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-bold font-[family-name:var(--font-mono)]" style={{ color: 'var(--color-accent-purple)' }}>
          {number}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="flex gap-4 rounded-xl p-5 border transition-all duration-200 hover:border-accent-purple"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)' }}
    >
      <div>
        <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      </div>
    </div>
  );
}
