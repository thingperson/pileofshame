'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Wordmark from '@/components/Wordmark';
import { DISCORD_INVITE_URL } from '@/lib/social';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COLOR PALETTE — matches LandingPageV2
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const C = {
  pink: '#E91E63',
  pinkGlow: 'rgba(233, 30, 99, 0.25)',
  cyan: '#00BCD4',
  cyanDark: '#006D75', // 5.38:1 on cream — AA compliant
  purple: '#7c3aed',
  dark: '#0c0c12',
  cardDark: '#131319',
  cream: '#F5F0EB',
  creamDark: '#EDE8E3',
  white: '#FFFFFF',
  textDark: '#1a1a1a',
  textMuted: '#555',
  textFaint: '#6b6b6b', // 4.71:1 on cream — AA compliant
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AboutPage() {
  return (
    <div className="w-full overflow-x-hidden" style={{ backgroundColor: C.cream, color: C.textDark }}>
      <Nav />
      <Hero />
      <Philosophy />
      <HowItWorks />
      <Principles />
      <PipCallout />
      <BottomCTA />
      <Footer />
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAV
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Nav() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 sm:px-8 py-3 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(245, 240, 235, 0.9)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
    >
      <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80" aria-label="Inventory Full — home">
        <Wordmark variant="full" aria-label="Inventory Full — get playing." className="h-8 sm:h-10 w-auto" style={{ ['--wordmark-in' as string]: C.textDark }} />
        <span className="hidden sm:block text-xs font-[family-name:var(--font-mono)] tracking-wide lowercase" style={{ color: C.textMuted }}>get playing.</span>
      </a>
      <a
        href="/"
        className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97]"
        style={{ backgroundColor: C.dark, color: C.white }}
      >
        Open App
      </a>
    </header>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HERO — editorial intro, more breathing room
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Hero() {
  return (
    <section className="relative px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32 overflow-hidden">
      {/* Angled background */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: C.cream, clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' }}
        aria-hidden
      />

      {/* Pink accent bar */}
      <div className="absolute top-0 left-0 w-[45%] h-2 sm:h-3 z-10 hidden sm:block" style={{ backgroundColor: C.pink, transform: 'skewX(-25deg)', transformOrigin: 'top left' }} aria-hidden />

      {/* Subtle paint stroke */}
      <div className="absolute top-[30%] -left-6 w-[50%] max-w-[500px] pointer-events-none opacity-40 z-0 hidden sm:block">
        <Image src="/landing/stroke-yellow.png" alt="" width={800} height={150} className="w-full h-auto" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <Reveal>
          <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-mono)] uppercase tracking-widest mb-6" style={{ color: C.pink }}>
            About Inventory Full
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h1
            className="font-[family-name:var(--font-condensed)] uppercase leading-[0.88] tracking-tight mb-8"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
          >
            You don&apos;t need more games.
            <br />
            <span className="relative inline-block" style={{ color: C.pink }}>
              You need one good pick.
              <span className="absolute -bottom-1 left-0 w-full h-1.5 sm:h-2" style={{ backgroundColor: C.cyan, transform: 'skewX(-12deg)' }} aria-hidden />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-lg sm:text-xl leading-relaxed max-w-xl mx-auto" style={{ color: C.textMuted }}>
            Inventory Full exists for one reason: to get you from staring at your library to actually playing something. Fast. Without the guilt spiral.
          </p>
        </Reveal>
      </div>

      {/* Collage accent — right */}
      <div className="absolute -top-4 -right-6 w-44 sm:w-56 pointer-events-none z-[1] hidden lg:block opacity-50" style={{ transform: 'rotate(10deg)' }}>
        <Image src="/landing/collage-4.png" alt="" width={400} height={400} className="w-full h-auto" />
      </div>

      {/* Triangle cluster */}
      <svg className="absolute bottom-[10%] left-6 sm:left-12 w-12 sm:w-16 pointer-events-none opacity-30 hidden sm:block" viewBox="0 0 40 40" fill="none" aria-hidden>
        <polygon points="20,2 38,38 2,38" fill={C.cyan} />
      </svg>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PHILOSOPHY — the story section, editorial feel
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Philosophy() {
  return (
    <section className="relative px-5 sm:px-8 py-16 sm:py-24 overflow-hidden">
      {/* Skewed darker cream background */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: C.creamDark, clipPath: 'polygon(0 4%, 100% 0, 100% 96%, 0 100%)' }} aria-hidden />

      {/* Pink accent bar */}
      <div className="absolute top-[6%] right-0 w-1/4 h-1.5 z-[1] hidden sm:block" style={{ backgroundColor: C.pink, transform: 'rotate(-2deg)' }} aria-hidden />

      <div className="relative z-10 max-w-2xl mx-auto">
        <Reveal>
          <h2
            className="font-[family-name:var(--font-condensed)] uppercase leading-[0.88] tracking-tight mb-10"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', transform: 'rotate(-1.5deg)', transformOrigin: 'left top' }}
          >
            Not another
            <br />
            <span className="relative inline-block" style={{ color: C.pink }}>
              backlog tracker.
              <span className="absolute -bottom-1 left-0 w-[110%] h-1.5" style={{ backgroundColor: C.cyan, transform: 'skewX(-15deg)' }} aria-hidden />
            </span>
          </h2>
        </Reveal>

        <div className="space-y-6">
          <Reveal delay={80}>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: C.textMuted }}>
              Every other tool wants you to organize your library. Tag things. Rate things. Sort things into seventeen categories. And then you close the tab and go watch YouTube because the organizing was the whole session.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: C.textMuted }}>
              We built Inventory Full because we were tired of that loop. The problem was never organization. The problem was deciding.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <p className="text-base sm:text-lg leading-relaxed font-bold" style={{ color: C.textDark }}>
              Two questions. One pick. You close the tab and go play. That&apos;s the entire product.
            </p>
          </Reveal>

          <Reveal delay={320}>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: C.textMuted }}>
              Less time in our app means we&apos;re doing our job. If you spend 30 minutes in Inventory Full, something went wrong.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Collage accent */}
      <div className="absolute -right-6 top-[25%] w-48 sm:w-64 pointer-events-none opacity-40 z-[1] hidden lg:block" style={{ transform: 'rotate(-8deg)' }}>
        <Image src="/landing/collage-2.png" alt="" width={400} height={500} className="w-full h-auto" />
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HOW IT WORKS — step by step
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Import your library.',
      body: 'Connect Steam, PlayStation, Xbox, or drop a CSV. Takes about 30 seconds.',
    },
    {
      num: '02',
      title: 'Tell us your mood and your time.',
      body: 'Two inputs. That’s all we ask. Your vibe and how long you’ve got.',
    },
    {
      num: '03',
      title: 'We pick one game.',
      body: 'Not a list. Not a shortlist. One game, matched to right now. With a reason why.',
    },
    {
      num: '04',
      title: 'You play.',
      body: 'Clear it. Move on from it. Come back tomorrow and pick again. The pile gets smaller either way.',
    },
  ];

  return (
    <section className="relative px-5 sm:px-8 py-16 sm:py-24 overflow-hidden" style={{ backgroundColor: C.cream }}>
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-mono)] uppercase tracking-widest mb-4" style={{ color: C.pink }}>
            How it works
          </p>
          <h2
            className="font-[family-name:var(--font-condensed)] uppercase leading-[0.88] tracking-tight mb-12"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            From &quot;I own 300 games&quot; to
            <br />
            <span style={{ color: C.pink }}>&quot;I&apos;m playing one.&quot;</span>
          </h2>
        </Reveal>

        <div className="space-y-8 sm:space-y-10">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 100}>
              <div className="flex gap-4 sm:gap-6">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 text-sm sm:text-base font-bold font-[family-name:var(--font-mono)]"
                  style={{ backgroundColor: C.cyanDark, color: C.white }}
                >
                  {s.num}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: C.textDark }}>{s.title}</h3>
                  <p className="text-base leading-relaxed" style={{ color: C.textMuted }}>{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Cyan triangle accent */}
      <svg className="absolute top-[15%] right-6 sm:right-12 w-10 sm:w-14 pointer-events-none opacity-25 hidden sm:block" viewBox="0 0 40 40" fill="none" aria-hidden>
        <polygon points="20,2 38,38 2,38" fill={C.cyan} />
      </svg>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRINCIPLES — what we believe
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Principles() {
  const beliefs = [
    {
      title: 'Your data is yours.',
      body: 'Everything lives on your device by default. We never sell it, share it, or look at it. Cloud sync is opt-in, and even then we keep it locked down.',
    },
    {
      title: 'Free means free.',
      body: 'No trial. No credit card. No feature gates behind a paywall. No ads. The app works the same whether you sign in or not.',
    },
    {
      title: 'Moving on counts.',
      body: 'Deciding a game isn’t for you is progress. We celebrate it the same way we celebrate finishing. Your pile shrinks either way.',
    },
    {
      title: 'We pick. You decide.',
      body: 'We’ll tell you what to play. We’ll never auto-sort your library, auto-complete your games, or assume we know what you want. Every status change is yours.',
    },
  ];

  return (
    <section className="relative px-5 sm:px-8 py-16 sm:py-24 overflow-hidden">
      {/* Skewed background */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: C.creamDark, clipPath: 'polygon(0 3%, 100% 0, 100% 97%, 0 100%)' }} aria-hidden />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Reveal>
          <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-mono)] uppercase tracking-widest mb-4" style={{ color: C.pink }}>
            What we believe
          </p>
          <h2
            className="font-[family-name:var(--font-condensed)] uppercase leading-[0.88] tracking-tight mb-12"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Built different.
            <br />
            <span className="relative inline-block" style={{ color: C.pink }}>
              On purpose.
              <span className="absolute -bottom-1 left-0 w-[115%] h-1.5" style={{ backgroundColor: C.cyan, transform: 'skewX(-15deg)' }} aria-hidden />
            </span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {beliefs.map((b, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="rounded-xl p-5 sm:p-6" style={{ backgroundColor: C.cream }}>
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: C.textDark }}>{b.title}</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: C.textMuted }}>{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Pink + cyan triangle cluster */}
      <svg className="absolute bottom-[8%] left-4 sm:left-8 w-14 sm:w-20 pointer-events-none opacity-30 hidden sm:block" viewBox="0 0 80 70" fill="none" aria-hidden>
        <polygon points="0,70 40,0 80,70" fill={C.cyan} opacity="0.7" />
        <polygon points="20,70 50,15 80,70" fill={C.pink} opacity="0.5" />
      </svg>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PIP CALLOUT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PipCallout() {
  return (
    <Reveal>
      <div className="flex items-end justify-center gap-4 py-10 px-5" style={{ backgroundColor: C.cream }}>
        <div className="shrink-0 w-24 sm:w-32">
          <Image src="/landing/pip-guide.png" alt="Pip, a small robot guide" width={128} height={128} className="w-full h-auto" />
        </div>
        <div className="relative rounded-xl px-4 py-3 max-w-xs" style={{ backgroundColor: C.cardDark }}>
          <div className="absolute -left-2 bottom-3 w-0 h-0" style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: `8px solid ${C.cardDark}` }} aria-hidden />
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Made by one person in Vancouver who had too many games and not enough will to pick one.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOTTOM CTA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function BottomCTA() {
  return (
    <section className="relative py-20 sm:py-28 text-center overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundColor: C.cream, clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 100%)' }} aria-hidden />

      {/* Hand collage — right */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-44 sm:w-56 pointer-events-none opacity-50 z-[1] hidden md:block" style={{ transform: 'translateY(-50%) rotate(-6deg)' }}>
        <Image src="/landing/hand-collage.png" alt="" width={400} height={300} className="w-full h-auto" />
      </div>

      {/* Pink accent bar */}
      <div className="absolute bottom-12 left-0 w-1/3 h-1.5 z-[1] hidden sm:block" style={{ backgroundColor: C.pink, transform: 'skewX(-20deg)' }} aria-hidden />

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div style={{ transform: 'rotate(-1.5deg)', transformOrigin: 'center' }}>
            <h2 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.88] tracking-tight mb-2" style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', color: C.textDark }}>
              Your pile&apos;s waiting.
            </h2>
            <h2 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.88] tracking-tight mb-2 relative inline-block" style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', color: C.pink }}>
              get playing.
              <span className="absolute -bottom-1 left-0 w-full h-2" style={{ backgroundColor: C.cyan, transform: 'skewX(-12deg)' }} aria-hidden />
            </h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <a
            href="/"
            className="inline-block px-7 py-3.5 mt-8 text-base font-bold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ backgroundColor: C.pink, color: C.white, boxShadow: `0 4px 20px ${C.pinkGlow}` }}
          >
            Open Inventory Full
          </a>
          <p className="text-sm mt-4 font-[family-name:var(--font-mono)]" style={{ color: C.textFaint }}>Free. No account needed. Your data stays on your device.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FOOTER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Footer() {
  return (
    <div className="relative">
      {/* Angled dark top edge */}
      <div className="absolute -top-8 sm:-top-12 left-0 right-0 h-8 sm:h-12 z-[1]" aria-hidden>
        <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="0,50 1440,0 1440,50" fill={C.dark} />
        </svg>
      </div>

      <footer className="relative px-5 sm:px-8 py-10 sm:py-14" style={{ backgroundColor: C.dark, color: 'rgba(255,255,255,0.5)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Email signup */}
          <div>
            <p className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Hear when we ship something good.</p>
            <p className="text-xs mb-4">Occasional updates. No spam. Unsubscribe whenever.</p>
            <FooterEmailForm />
          </div>

          {/* Discord */}
          <div>
            <p className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>We&apos;re hanging out in Discord.</p>
            <p className="text-xs mb-4">Share what got picked. Roast your own pile. Tell us what to fix.</p>
            <a href={DISCORD_INVITE_URL} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all hover:scale-[1.03]" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }} target="_blank" rel="noopener noreferrer">Join the Discord</a>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-xs">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <span className="mt-2 text-[10px] opacity-50">Made by Brady in Vancouver, BC</span>
          </div>
        </div>

        {/* Pip footer moment */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-end gap-3">
            <Image src="/landing/pip-wave.png" alt="Pip waving" width={100} height={100} className="w-16 sm:w-20 h-auto" />
            <div className="relative rounded-lg px-3 py-2 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="absolute -left-1.5 bottom-3 w-0 h-0" style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid rgba(255,255,255,0.08)' }} aria-hidden />
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>go play something.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FOOTER EMAIL FORM
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function FooterEmailForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'about', pageUrl: typeof window !== 'undefined' ? window.location.href : null }) });
      if (!res.ok) { setStatus('error'); return; }
      setStatus('success');
      setEmail('');
    } catch { setStatus('error'); }
  }

  if (status === 'success') return <p className="text-xs font-[family-name:var(--font-mono)]" style={{ color: C.cyan }}>You&apos;re in. Talk soon.</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@somewhere.com" aria-label="Email address" disabled={status === 'submitting'} className="flex-1 min-w-0 rounded-lg border px-3 py-2 text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }} />
      <button type="submit" disabled={status === 'submitting'} className="rounded-lg px-4 py-2 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer" style={{ backgroundColor: C.pink, color: C.white }}>
        {status === 'submitting' ? 'Sending…' : 'Sign me up'}
      </button>
    </form>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REVEAL — scroll-in animation
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShown(true); return; }
    const io = new IntersectionObserver((entries) => { for (const entry of entries) { if (entry.isIntersecting) { setShown(true); io.unobserve(entry.target); } } }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(28px)', transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`, willChange: shown ? 'auto' : 'opacity, transform' }}>
      {children}
    </div>
  );
}
