'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Wordmark from '@/components/Wordmark';
import AuthButton from '@/components/AuthButton';
import { trackLandingView } from '@/lib/analytics';
import { useStore } from '@/lib/store';
import { DISCORD_INVITE_URL } from '@/lib/social';

interface LandingPageV2Props {
  onImport: () => void;
  onLoadSample: () => void;
}

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

export default function LandingPageV2({ onImport, onLoadSample }: LandingPageV2Props) {
  const gameCount = useStore((s) => s.games.length);

  useEffect(() => {
    trackLandingView({ has_library: gameCount > 0 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full overflow-x-hidden" style={{ backgroundColor: C.cream, color: C.textDark }}>
      <Nav onImport={onImport} />
      <Hero onImport={onImport} onLoadSample={onLoadSample} />
      <PlatformBar />
      <SocialProof />
      <AntiTracker />
      <ProblemSolution />
      <MidPageCTA onImport={onImport} />
      <ClarityBanner />
      <VibeSection />
      <BottomCTA onImport={onImport} onLoadSample={onLoadSample} />
      <Footer />
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAV
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Nav({ onImport }: { onImport: () => void }) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 sm:px-8 py-3 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(245, 240, 235, 0.9)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <Wordmark variant="full" aria-label="Inventory Full — get playing." className="h-8 sm:h-10 w-auto" style={{ ['--wordmark-in' as string]: C.textDark }} />
        <span className="hidden sm:block text-xs font-[family-name:var(--font-mono)] tracking-wide lowercase" style={{ color: C.textMuted }}>get playing.</span>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: C.textDark }}>
        <a href="#how-it-works" className="hover:opacity-70 transition-opacity">How It Works</a>
        <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
        <a href="/about" className="hover:opacity-70 transition-opacity">About</a>
        <AuthButton />
        <button onClick={onImport} className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer" style={{ backgroundColor: C.dark, color: C.white }}>
          Import My Library →
        </button>
      </nav>
      <div className="md:hidden flex items-center gap-2">
        <AuthButton />
        <button onClick={onImport} className="px-4 py-2 text-sm font-bold rounded-lg cursor-pointer" style={{ backgroundColor: C.dark, color: C.white }}>Import →</button>
      </div>
    </header>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HERO — angled background panel
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Hero({ onImport, onLoadSample }: { onImport: () => void; onLoadSample: () => void }) {
  return (
    <section className="relative px-5 sm:px-8 pt-8 sm:pt-12 pb-20 sm:pb-28 overflow-visible">
      {/* Angled cream background panel */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: C.cream,
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
        }}
        aria-hidden
      />

      {/* Mountain hero — left side, behind text. Masked so it fades out toward the text area */}
      <div
        className="absolute bottom-0 left-0 w-[25%] max-w-[320px] pointer-events-none z-[1] hidden xl:block opacity-50"
        style={{ maskImage: 'linear-gradient(to right, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 40%, transparent 100%)' }}
      >
        <Image src="/landing/mountain-hero.png" alt="" width={800} height={1000} className="w-full h-auto object-contain object-bottom" />
      </div>

      {/* Pink accent bar — top, angled */}
      <div className="absolute top-0 left-0 w-[60%] h-2 sm:h-3 z-10 hidden sm:block" style={{ backgroundColor: C.pink, transform: 'skewX(-25deg)', transformOrigin: 'top left' }} aria-hidden />

      {/* Collage top-right — rotated aggressively */}
      <div className="absolute -top-6 -right-6 w-56 sm:w-72 pointer-events-none opacity-80 z-[1] hidden sm:block" style={{ transform: 'rotate(12deg)' }}>
        <Image src="/landing/collage-4.png" alt="" width={400} height={400} className="w-full h-auto" />
      </div>

      {/* Cyan + pink triangle cluster — top right */}
      <svg className="absolute top-12 right-8 sm:right-16 w-24 sm:w-32 hidden sm:block pointer-events-none" viewBox="0 0 120 100" fill="none" aria-hidden>
        <polygon points="0,100 60,0 120,100" fill={C.cyan} opacity="0.65" />
        <polygon points="30,100 80,20 120,100" fill={C.pink} opacity="0.45" />
      </svg>

      {/* Paint stroke — wider, more visible */}
      <div className="absolute top-[22%] -left-6 w-[70%] max-w-[700px] pointer-events-none opacity-35 z-0 hidden sm:block">
        <Image src="/landing/paint-stroke-1.png" alt="" width={800} height={150} className="w-full h-auto" />
      </div>

      {/* "Stop scrolling" badge — pink paint-stroke bg with text on top */}
      <div className="relative z-10 inline-block ml-4 sm:ml-8 mb-2">
        <div className="absolute inset-y-0 -left-3 -right-3 pointer-events-none overflow-hidden">
          <Image src="/landing/paint-stroke-4.png" alt="" width={400} height={50} className="w-full h-full object-fill" />
        </div>
        <div className="absolute inset-y-0 -left-2 -right-2 pointer-events-none" style={{ backgroundColor: C.pink, opacity: 0.85, transform: 'skewX(-5deg)' }} aria-hidden />
        <span className="relative z-10 px-4 py-2 text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider block" style={{ color: C.white }}>
          Stop scrolling. Start playing.
        </span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-6 sm:pt-10 relative z-10">
        {/* Left: headline + copy */}
        <div className="relative">
          <Reveal>
            <h1 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.9] tracking-tight mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', transform: 'rotate(-2deg)', transformOrigin: 'left top' }}>
              You don&apos;t need more games.
              <br />
              <span className="relative inline-block" style={{ color: C.pink }}>
                You need a decision.
                <span className="absolute -bottom-1 left-0 w-full h-1.5 sm:h-2" style={{ backgroundColor: C.cyan, transform: 'skewX(-12deg)' }} aria-hidden />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-lg sm:text-xl leading-relaxed mb-2 font-bold" style={{ color: C.textDark }}>Your pile&apos;s not gonna play itself.</p>
            <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: C.textMuted }}>We turn your pile into one good answer for tonight. Mood + time in. A game out.</p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
              <button onClick={onImport} className="px-7 py-3.5 text-base font-bold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer" style={{ backgroundColor: C.pink, color: C.white, boxShadow: `0 4px 20px ${C.pinkGlow}` }}>
                Import My Library →
              </button>
              <button onClick={onLoadSample} className="px-6 py-3.5 text-base font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.97] cursor-pointer border" style={{ borderColor: C.textDark, color: C.textDark, backgroundColor: 'transparent' }}>
                Try a Sample First
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-5 sm:gap-6 mt-3">
              {[
                { icon: '✓', text: 'Free forever', desc: 'No credit card' },
                { icon: '⚡', text: 'No account needed', desc: 'Works instantly' },
                { icon: '🔒', text: 'Data stays on your device', desc: 'We never see it' },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: 'rgba(233, 30, 99, 0.1)' }}>{t.icon}</span>
                  <div className="leading-tight">
                    <span className="text-sm font-bold block" style={{ color: C.textDark }}>{t.text}</span>
                    <span className="text-xs" style={{ color: C.textMuted }}>{t.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right: picker card — tilted */}
        <Reveal delay={150}>
          <div className="relative" style={{ transform: 'rotate(2deg)' }}>
            <div className="absolute -top-12 -right-2 sm:right-0 w-52 sm:w-64 z-20 pointer-events-none">
              <Image src="/landing/annotation-tell-us.png" alt="Tell us a few things. We'll do the hard part." width={500} height={150} className="w-full h-auto" />
            </div>
            <Image src="/landing/hero-picker-card.png" alt="Inventory Full picker: choose your mood and time, get one game recommendation — A Short Hike" width={600} height={750} className="w-full max-w-md mx-auto h-auto rounded-2xl shadow-2xl" priority />
            <div className="absolute -bottom-8 -right-2 sm:right-0 w-48 sm:w-56 z-20 pointer-events-none">
              <Image src="/landing/annotation-new-picks.png" alt="New picks in seconds. No endless scrolling." width={500} height={100} className="w-full h-auto" />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Collage bottom-right — breaking into next section */}
      <div className="absolute -bottom-12 -right-6 w-52 sm:w-72 pointer-events-none opacity-75 z-[3] hidden sm:block" style={{ transform: 'rotate(-8deg)' }}>
        <Image src="/landing/collage-1.png" alt="" width={400} height={500} className="w-full h-auto" />
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PLATFORM BAR — full-width skewed dark panel
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PlatformBar() {
  return (
    <div className="relative my-4 sm:my-6" style={{ transform: 'skewY(-2deg)' }}>
      <div className="py-6 sm:py-7 px-6" style={{ backgroundColor: C.dark, color: 'rgba(255,255,255,0.6)' }}>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8" style={{ transform: 'skewY(2deg)' }}>
          <span className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider w-full sm:w-auto text-center mb-1 sm:mb-0">Works with your libraries →</span>
          <PlatformIcon name="Steam" d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.387 3.387 0 0 1 1.912-.59c.064 0 .127.003.19.008l2.861-4.142V8.91a4.528 4.528 0 0 1 4.524-4.524 4.528 4.528 0 0 1 4.524 4.524 4.528 4.528 0 0 1-4.524 4.524h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396a3.406 3.406 0 0 1-3.363-2.916L.464 15.24C1.884 20.24 6.514 24 11.979 24c6.627 0 12.001-5.373 12.001-12S18.606 0 11.979 0z" />
          <PlatformIcon name="PlayStation" d="M9.214 7.1v8.3l2.7.9V5.3c0-.6-.1-1.2-.3-1.7-.4-1-1.2-1.5-2.5-1.1L5.014 4c-2 .6-3.5 2-3.5 3.7 0 1.5.6 2.3 2.5 1.6l2.2-.8v1.5L4.314 10.6C1.714 11.6 0 12.7 0 14.5c0 1.8 1.2 2.7 3 2.1l4.2-1.5c.6-.2 1.4-.7 2-1.1v1.8l-4.1 1.5c-2 .7-3.5.2-4.3-.8-.4-.5-.6-1.1-.7-1.8 0 1.7.6 3.2 2 3.8.9.4 2.1.3 3.5-.2l5-1.8c.8-.3 1.7-.9 2.5-1.5v3.2l-3.6 1.3c-2.9 1-5.8.8-7.7-.4A4.7 4.7 0 0 1 0 16.3c0-2.1 1.3-4 3.6-5L9.2 9v-1.9zm9.4 3.6l-5 1.8v7.2l2.5-.9v-14c1.7-.6 3.3-.1 3.7 1.1.2.6.2 1.2.1 1.8l2.2.8c.4-1 .5-2.1.2-3.1-.7-2.2-3-3.1-5.7-2.3l-5.4 1.9v1.5l5-1.8c.7-.2 1.3-.3 1.8-.2.9.2 1.2.9 1.2 1.7v.3c0 .5-.3 1.1-.6 1.5-.2.3-.5.5-1 .7v-.1zm5.3 1.8c-1.5.8-2.5 2.2-2.5 3.9 0 1.4.7 2.3 1.8 2.6 1.2.3 2.5-.1 3.6-.7V20h2v-9.1c0-1.1-.4-2-1.1-2.5-.9-.6-2.2-.7-3.8.1zm1.9 5.2c-.5.3-1.1.4-1.5.3-.3-.1-.5-.4-.5-.9 0-.7.4-1.4 1.1-1.8.4-.2.7-.3.9-.3v2.7z" />
          <PlatformIcon name="Xbox" d="M4.102 21.033a11.947 11.947 0 0 1-2.642-3.677c-1.2-2.6-1.46-5.618-.692-8.06.81.39 2.622 1.762 4.733 4.076 2.094 2.297 3.79 4.674 4.49 5.758a23.94 23.94 0 0 1-2.222 1.46c-1.362.769-2.57 1.043-3.667.443zM12 2.244c-1.3 0-2.545.246-3.694.689.532.31 1.074.728 1.627 1.226 1.075.97 2.093 2.168 2.067 2.14-.024-.028 1.012-1.19 2.067-2.14a11.346 11.346 0 0 1 1.627-1.226A9.7 9.7 0 0 0 12 2.244zm7.898 18.789c-1.097.6-2.305.326-3.667-.443a23.94 23.94 0 0 1-2.222-1.46c.7-1.084 2.396-3.461 4.49-5.758 2.111-2.314 3.923-3.686 4.733-4.076.768 2.442.508 5.46-.692 8.06a11.947 11.947 0 0 1-2.642 3.677zm1.988-16.17c-.592-.32-2.882-.568-5.678 2.076l-.124.122c1.326 1.418 2.859 3.393 4.123 5.47.766 1.26 1.623 2.913 2.169 4.523a9.793 9.793 0 0 0 1.38-5.072 9.765 9.765 0 0 0-1.87-5.12zM2.114 4.863A9.765 9.765 0 0 0 .244 9.983c0 1.82.497 3.525 1.38 5.072.546-1.61 1.403-3.263 2.169-4.523 1.264-2.077 2.797-4.052 4.123-5.47l-.124-.122C4.996 2.295 2.706 2.543 2.114 4.863z" />
          <PlatformIcon name="Epic" d="M3.537 0C2.165 0 1.66.506 1.66 1.879V18.12c0 1.373.505 1.879 1.877 1.879h4.994v2.122c0 1.373.506 1.879 1.879 1.879h1.682c1.373 0 1.877-.506 1.877-1.879V20h4.994c1.373 0 1.877-.506 1.877-1.879V1.879C20.84.506 20.336 0 18.963 0zm.791 3.333h3.902v6.334H5.614V7.331h1.824V5.669H4.328zm5.943 0h2.47l1.542 3.726L15.825 3.333h2.47v9.334h-1.944V6.28l-1.86 4.666h-1.476L11.155 6.28v6.387H9.271z" />
          <PlatformIcon name="GOG" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.636 0 8.4 3.764 8.4 8.4 0 4.636-3.764 8.4-8.4 8.4-4.636 0-8.4-3.764-8.4-8.4 0-4.636 3.764-8.4 8.4-8.4zm0 2.4a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" />
          <span className="flex items-center gap-1.5 text-sm font-medium opacity-70">
            <span className="text-base">+</span> CSV
          </span>
        </div>
      </div>
    </div>
  );
}

function PlatformIcon({ name, d }: { name: string; d: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity" title={name}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={d} /></svg>
      <span className="hidden sm:inline">{name}</span>
    </span>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SOCIAL PROOF — lightweight activity signals
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SocialProof() {
  return (
    <Reveal>
      <div className="py-5 sm:py-6 px-5 text-center" style={{ backgroundColor: C.cream }}>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 max-w-3xl mx-auto">
          <ProofStat value="10,000+" label="games imported" />
          <ProofStat value="5,000+" label="picks delivered" />
          <ProofStat value="100%" label="free. no catch." />
        </div>
      </div>
    </Reveal>
  );
}

function ProofStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-condensed)]" style={{ color: C.pink }}>{value}</p>
      <p className="text-sm font-[family-name:var(--font-mono)] uppercase tracking-wide" style={{ color: C.textMuted }}>{label}</p>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANTI-TRACKER — angled panel
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function AntiTracker() {
  return (
    <section className="relative px-5 sm:px-8 py-10 sm:py-14 overflow-hidden" style={{ backgroundColor: C.cream }}>
      {/* Angled pink accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: C.pink, transform: 'skewY(-1deg)' }} aria-hidden />

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left">
        <Reveal>
          <p className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-condensed)] uppercase tracking-tight" style={{ color: C.textDark }}>
            More library managing = less playing.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-lg sm:text-xl leading-relaxed" style={{ color: C.textMuted }}>
            Not another tracker. Not another list.<br />We&apos;re here to pick from your pile, not organize it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PROBLEM / SOLUTION — skewed background panels
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ProblemSolution() {
  const problems = [
    { title: 'Decision fatigue is real.', body: 'The more options you have, the harder it is to choose.' },
    { title: 'Your mood changes.', body: 'What you want after work ≠ what you want on the weekend.' },
    { title: 'Time matters.', body: 'A 50-hour RPG on a busy night? Probably not.' },
    { title: "Libraries grow. Attention doesn't.", body: 'Your pile grows faster than your free time.' },
  ];

  const solutions = [
    { step: '1', title: 'You tell us what you want.', body: 'Mood and time. Two questions. We keep it simple.' },
    { step: '2', title: 'We analyze your library.', body: 'Genres, playtime, tags, and recency. Without the noise.' },
    { step: '3', title: 'We pick your game.', body: 'One game. Matched to your mood, your time, and your library. Not a list. An answer.' },
    { step: '4', title: 'You play.', body: "Less friction. More fun. That's the whole point." },
  ];

  return (
    <section id="how-it-works" className="relative py-16 sm:py-24 overflow-hidden">
      {/* Skewed background — the entire section bg is angled */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: C.creamDark, clipPath: 'polygon(0 5%, 100% 0, 100% 95%, 0 100%)' }} aria-hidden />

      {/* Collage — right, big + rotated + bleeding out */}
      <div className="absolute -right-8 top-[20%] w-64 sm:w-80 pointer-events-none opacity-55 z-[1] hidden lg:block" style={{ transform: 'rotate(-10deg)' }}>
        <Image src="/landing/collage-2.png" alt="" width={400} height={500} className="w-full h-auto" />
      </div>

      {/* Pink accent bar angled across */}
      <div className="absolute top-[8%] right-0 w-1/3 h-1.5 z-[1] hidden sm:block" style={{ backgroundColor: C.pink, transform: 'rotate(-3deg)' }} aria-hidden />

      <div className="relative z-10 px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-sm font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] mb-12" style={{ color: C.textFaint }}>The actual problem.</p>
        </Reveal>

        {/* PROBLEM panel — visibly rotated container */}
        <div className="max-w-5xl mx-auto mb-20">
          <div style={{ transform: 'rotate(-2.5deg)', transformOrigin: 'top left' }}>
            <Reveal>
              <h2 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.85] tracking-tight" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>Why it feels</h2>
              <h2 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.85] tracking-tight mb-4 relative inline-block" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontStyle: 'italic' }}>
                impossible.
                <span className="absolute -bottom-1 left-0 w-[115%] h-2" style={{ backgroundColor: C.pink, transform: 'skewX(-15deg)' }} aria-hidden />
              </h2>
            </Reveal>
          </div>
          <p className="text-lg sm:text-xl mb-10 mt-6 max-w-xl" style={{ color: C.textMuted }}>Too many games. Too many choices. Your brain checks out.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 max-w-3xl">
            {problems.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold" style={{ backgroundColor: 'rgba(233, 30, 99, 0.12)', color: C.pink }}>{'✕'}</div>
                  <div>
                    <p className="font-bold text-base" style={{ color: C.textDark }}>{p.title}</p>
                    <p className="text-base" style={{ color: C.textMuted }}>{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* SOLUTION panel — rotated the other direction */}
        <div className="max-w-5xl mx-auto">
          <div style={{ transform: 'rotate(1.5deg)', transformOrigin: 'top right' }}>
            <Reveal>
              <h2 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.85] tracking-tight" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                How <span style={{ color: C.pink }}>Inventory Full</span>
              </h2>
              <h2 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.85] tracking-tight mb-4 relative inline-block" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}>
                fixes it.
                <span className="absolute -bottom-1 left-0 w-[115%] h-2" style={{ backgroundColor: C.cyan, transform: 'skewX(-15deg)' }} aria-hidden />
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 mt-8 max-w-3xl">
            {solutions.map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold" style={{ backgroundColor: C.cyanDark, color: C.white }}>{s.step}</div>
                  <div>
                    <p className="font-bold text-base" style={{ color: C.textDark }}>{s.title}</p>
                    <p className="text-base" style={{ color: C.textMuted }}>{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Cyan triangle accent — bottom left */}
      <svg className="absolute bottom-[5%] left-4 w-12 sm:w-16 pointer-events-none opacity-40" viewBox="0 0 40 40" fill="none" aria-hidden>
        <polygon points="20,2 38,38 2,38" fill={C.cyan} />
      </svg>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MID-PAGE CTA — catch convinced-halfway visitors
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function MidPageCTA({ onImport }: { onImport: () => void }) {
  return (
    <Reveal>
      <div className="text-center py-8 sm:py-10 px-5" style={{ backgroundColor: C.cream }}>
        <button onClick={onImport} className="px-7 py-3.5 text-base font-bold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer" style={{ backgroundColor: C.pink, color: C.white, boxShadow: `0 4px 20px ${C.pinkGlow}` }}>
          Import My Library →
        </button>
        <p className="text-sm mt-3 font-[family-name:var(--font-mono)]" style={{ color: C.textFaint }}>Takes about 30 seconds. Seriously.</p>
      </div>
    </Reveal>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CLARITY BANNER — heavily skewed full-width
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ClarityBanner() {
  return (
    <Reveal>
      <div className="relative py-6" style={{ margin: '-1rem 0 1rem' }}>
        {/* The skewed banner panel */}
        <div className="relative overflow-hidden" style={{ transform: 'skewY(-3deg)', padding: '3rem 0' }}>
          <div className="absolute inset-0 z-0">
            <Image src="/landing/pink-banner-strip.png" alt="" width={1600} height={200} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 z-0" style={{ backgroundColor: 'rgba(233, 30, 99, 0.88)' }} />

          {/* Cyan angular overlay on right */}
          <div className="absolute top-0 right-0 w-1/4 h-full z-[1]" style={{ backgroundColor: 'rgba(0, 188, 212, 0.2)', clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }} aria-hidden />

          {/* Pink triangle overlapping left edge */}
          <svg className="absolute -left-2 top-1/2 -translate-y-1/2 w-16 sm:w-24 z-[1] pointer-events-none" viewBox="0 0 60 80" fill="none" aria-hidden>
            <polygon points="0,0 60,40 0,80" fill={C.pink} opacity="0.6" />
          </svg>

          <h2
            className="relative z-10 font-[family-name:var(--font-condensed)] uppercase tracking-tight text-center px-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', color: C.white, transform: 'skewY(3deg)' }}
          >
            More games ≠ more fun. Clarity does.
          </h2>
        </div>
      </div>
    </Reveal>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VIBE SECTION — angled card & tower
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const VIBE_PICKS: { emoji: string; label: string; game: string; art: string; time: string; tags: string; reason: string }[] = [
  { emoji: '🌙', label: 'I want to chill', game: 'Stardew Valley', art: '/landing/games/stardew-valley.jpg', time: '∞ (one more day)', tags: 'Cozy, Farming, Relaxing', reason: "No stakes. No pressure. Just you, your farm, and a town full of people who don't judge your bedtime." },
  { emoji: '⚡', label: 'I want a challenge', game: 'Sekiro: Shadows Die Twice', art: '/landing/games/sekiro.jpg', time: '30-50 hours', tags: 'Action, Souls-like, Precision', reason: "You said challenge. This is that. Every death teaches you something. Every victory is earned." },
  { emoji: '📖', label: 'I want a good story', game: 'Disco Elysium', art: '/landing/games/disco-elysium.jpg', time: '25-40 hours', tags: 'RPG, Detective, Narrative', reason: "The best-written RPG in years. You play a washed-up cop solving a murder. Your skills are your personality traits. It gets weird." },
  { emoji: '⏱', label: 'I want something quick', game: 'Vampire Survivors', art: '/landing/games/vampire-survivors.jpg', time: '15-20 min runs', tags: 'Roguelike, Action, Addictive', reason: "One run. Fifteen minutes. You mow down thousands of monsters and somehow it never gets old. Perfect for when you have a sliver of time." },
  { emoji: '😄', label: 'I want to laugh', game: 'Portal 2', art: '/landing/games/portal-2.jpg', time: '8-10 hours', tags: 'Puzzle, Comedy, Co-op', reason: "GLaDOS is still the funniest villain in gaming. The puzzles are brilliant. The writing is better." },
  { emoji: '✨', label: 'Surprise me', game: 'Inscryption', art: '/landing/games/inscryption.jpg', time: '10-12 hours', tags: 'Card Game, Horror, Mystery', reason: "Starts as a card game in a cabin. Becomes something else entirely. The less you know going in, the better." },
];

function VibeSection() {
  const [activeVibe, setActiveVibe] = useState<number | null>(null);
  const pick = activeVibe !== null ? VIBE_PICKS[activeVibe] : null;

  return (
    <section id="features" className="relative px-5 sm:px-8 py-14 sm:py-20 overflow-hidden" style={{ backgroundColor: C.cream }}>
      {/* Small triangle cluster — left */}
      <svg className="absolute top-10 left-2 sm:left-8 w-16 sm:w-20 pointer-events-none opacity-35 hidden sm:block" viewBox="0 0 80 70" fill="none" aria-hidden>
        <polygon points="0,70 40,0 80,70" fill={C.cyan} opacity="0.7" />
        <polygon points="20,70 50,15 80,70" fill={C.pink} opacity="0.5" />
      </svg>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Reveal>
          <div style={{ transform: 'rotate(-1.5deg)' }}>
            <h2 className="font-[family-name:var(--font-condensed)] uppercase tracking-tight mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: C.textDark }}>
              Or skip the form. Just tap a vibe.
            </h2>
          </div>
          <p className="text-base sm:text-lg mb-8" style={{ color: C.textMuted }}>Tap one and see what we&apos;d pick.</p>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {VIBE_PICKS.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setActiveVibe(i)}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-base font-medium border transition-all hover:scale-[1.04] active:scale-[0.97] cursor-pointer"
                style={{
                  borderColor: activeVibe === i ? C.pink : 'rgba(0,0,0,0.12)',
                  color: activeVibe === i ? C.pink : C.textDark,
                  backgroundColor: activeVibe === i ? 'rgba(233, 30, 99, 0.06)' : C.white,
                  boxShadow: activeVibe === i ? `0 2px 12px ${C.pinkGlow}` : 'none',
                }}
              >
                <span className="text-lg">{v.emoji}</span><span>{v.label}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Pick result card */}
        <div className="min-h-[280px] sm:min-h-[240px]">
          {pick ? (
            <div
              key={activeVibe}
              className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl"
              style={{
                backgroundColor: C.cardDark,
                transform: 'rotate(-1deg)',
                animation: 'vibeCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
              }}
            >
              <style>{`@keyframes vibeCardIn { from { opacity: 0; transform: rotate(-1deg) translateY(20px) scale(0.97); } to { opacity: 1; transform: rotate(-1deg) translateY(0) scale(1); } }`}</style>
              <div className="flex flex-col sm:flex-row">
                {/* Game art */}
                <div className="sm:w-48 h-48 sm:h-auto shrink-0 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pick.art} alt={pick.game} className="w-full h-full object-cover" loading="lazy" />
                </div>
                {/* Pick details */}
                <div className="flex-1 p-5 sm:p-6 text-left">
                  <p className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1" style={{ color: C.pink }}>
                    Tonight&apos;s answer
                  </p>
                  <h3 className="font-[family-name:var(--font-condensed)] uppercase text-2xl sm:text-3xl tracking-tight mb-2" style={{ color: C.white }}>
                    {pick.game}
                  </h3>
                  <p className="text-xs font-[family-name:var(--font-mono)] mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {pick.time} · {pick.tags}
                  </p>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {pick.reason}
                  </p>
                  <div className="flex gap-2">
                    <span className="px-4 py-2 text-sm font-bold rounded-lg" style={{ backgroundColor: C.pink, color: C.white }}>
                      Let&apos;s go
                    </span>
                    <span className="px-4 py-2 text-sm font-medium rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                      Roll again
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Reveal delay={200}>
              <div className="max-w-md mx-auto py-12 px-6 rounded-2xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <p className="text-lg font-medium" style={{ color: C.textMuted }}>
                  Pick a vibe above and we&apos;ll show you what a pick looks like.
                </p>
              </div>
            </Reveal>
          )}
        </div>

        <p className="mt-6 text-sm" style={{ color: C.textFaint }}>
          {pick ? 'This is how every pick works. Mood in, game out.' : 'Every pick comes with a reason. No shortlists, no browsing.'}
        </p>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOTTOM CTA — skewed background panel
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function BottomCTA({ onImport, onLoadSample }: { onImport: () => void; onLoadSample: () => void }) {
  return (
    <section className="relative py-20 sm:py-28 text-center overflow-hidden">
      {/* Skewed background */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: C.cream, clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 100%)' }} aria-hidden />

      {/* Hand collage — right, big + rotated */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-56 sm:w-72 pointer-events-none opacity-70 z-[1] hidden md:block" style={{ transform: 'translateY(-50%) rotate(-6deg)' }}>
        <Image src="/landing/hand-collage.png" alt="" width={400} height={300} className="w-full h-auto" />
      </div>

      {/* Collage — left, rotated */}
      <div className="absolute -left-6 bottom-4 w-44 sm:w-56 pointer-events-none opacity-60 z-[1] hidden md:block" style={{ transform: 'rotate(5deg)' }}>
        <Image src="/landing/collage-3.png" alt="" width={300} height={400} className="w-full h-auto" />
      </div>

      {/* Pink accent bar — bottom, angled */}
      <div className="absolute bottom-12 left-0 w-2/5 h-1.5 z-[1] hidden sm:block" style={{ backgroundColor: C.pink, transform: 'skewX(-20deg)' }} aria-hidden />

      {/* Cyan triangle — top right */}
      <svg className="absolute top-[12%] right-[15%] w-10 sm:w-14 pointer-events-none opacity-30 hidden sm:block" viewBox="0 0 40 40" fill="none" aria-hidden>
        <polygon points="20,2 38,38 2,38" fill={C.cyan} />
      </svg>

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div style={{ transform: 'rotate(-2deg)', transformOrigin: 'center' }}>
            <h2 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.85] tracking-tight mb-2" style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', color: C.textDark }}>
              Your library isn&apos;t the problem.
            </h2>
            <h2 className="font-[family-name:var(--font-condensed)] uppercase leading-[0.85] tracking-tight mb-6 relative inline-block" style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', color: C.pink }}>
              Clarity is the fix.
              <span className="absolute -bottom-1 left-0 w-full h-2" style={{ backgroundColor: C.cyan, transform: 'skewX(-12deg)' }} aria-hidden />
            </h2>
          </div>
          <p className="text-lg mb-8 mt-4" style={{ color: C.textMuted }}>Stop scrolling. Start playing.</p>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <button onClick={onImport} className="px-7 py-3.5 text-base font-bold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer" style={{ backgroundColor: C.pink, color: C.white, boxShadow: `0 4px 20px ${C.pinkGlow}` }}>
              Import My Library →
            </button>
            <button onClick={onLoadSample} className="px-6 py-3.5 text-base font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.97] cursor-pointer border" style={{ borderColor: C.textDark, color: C.textDark, backgroundColor: 'transparent' }}>
              Try a Sample First
            </button>
          </div>
          <p className="text-sm font-[family-name:var(--font-mono)]" style={{ color: C.textFaint }}>Free. No account. No hassle. We barely want your email.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FOOTER — angular top edge
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Footer() {
  return (
    <div className="relative">
      {/* Skewed dark panel extends up */}
      <div className="absolute -top-10 sm:-top-16 left-0 right-0 h-10 sm:h-16 z-[1]" aria-hidden>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="0,70 1440,0 1440,70" fill={C.dark} />
        </svg>
      </div>

      <footer className="relative px-5 sm:px-8 py-10 sm:py-14" style={{ backgroundColor: C.dark, color: 'rgba(255,255,255,0.5)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Hear when we ship something good.</p>
            <p className="text-xs mb-4">Occasional updates. No spam. Unsubscribe whenever.</p>
            <FooterEmailForm />
          </div>
          <div>
            <p className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>We&apos;re hanging out in Discord.</p>
            <p className="text-xs mb-4">Share what got picked. Roast your own pile. Tell us what to fix.</p>
            <a href={DISCORD_INVITE_URL} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all hover:scale-[1.03]" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }} target="_blank" rel="noopener noreferrer">🎮 Join the Discord</a>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <button type="button" onClick={() => { import('./CookieBanner').then((m) => m.reopenCookieBanner()); }} className="text-left hover:text-white transition-colors cursor-pointer">Cookies</button>
            <a href="/about" className="hover:text-white transition-colors">About</a>
            <span className="mt-2 text-[10px] opacity-50">Made by Brady in Vancouver, BC</span>
          </div>
        </div>
        <div className="mt-8 text-center flex items-center justify-center gap-2">
          <Image src="/landing/dino-silhouette.svg" alt="" width={24} height={16} className="opacity-30" />
          <p className="text-xs opacity-30 font-[family-name:var(--font-mono)]">and we have a dino theme. come on.</p>
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
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'landing-v2', pageUrl: typeof window !== 'undefined' ? window.location.href : null }) });
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
   REVEAL
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
    <div ref={ref} className={className} style={{ opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`, willChange: shown ? 'auto' : 'opacity, transform' }}>
      {children}
    </div>
  );
}
