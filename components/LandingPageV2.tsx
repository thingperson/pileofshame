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
  purple: '#7c3aed',
  dark: '#0c0c12',
  cardDark: '#131319',
  cream: '#F5F0EB',
  creamDark: '#EDE8E3',
  white: '#FFFFFF',
  textDark: '#1a1a1a',
  textMuted: '#555',
  textFaint: '#888',
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
      <AntiTracker />
      <ProblemSolution />
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
            <div className="flex items-center gap-3 text-xs font-[family-name:var(--font-mono)]" style={{ color: C.textFaint }}>
              <span>✓ Free to try</span><span>·</span><span>⚡ No account required</span><span>·</span><span>🔒 Your data stays local</span>
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
  const platforms = ['Steam', 'Epic Games', 'GOG', 'Xbox', 'PlayStation', '+ CSV Import'];
  return (
    <div className="relative my-4 sm:my-6" style={{ transform: 'skewY(-2deg)' }}>
      <div className="py-6 sm:py-7 px-6" style={{ backgroundColor: C.dark, color: 'rgba(255,255,255,0.6)' }}>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8" style={{ transform: 'skewY(2deg)' }}>
          <span className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider">Works with your existing libraries →</span>
          {platforms.map((p) => (<span key={p} className="text-sm font-medium">{p}</span>))}
        </div>
      </div>
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
          <p className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-condensed)] uppercase tracking-tight" style={{ color: C.textDark }}>
            More library managing = less playing.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-base" style={{ color: C.textMuted }}>
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
    { icon: '⊕', title: 'You tell us what you want.', body: 'Mood and time. Two questions. We keep it simple.' },
    { icon: '✦', title: 'We analyze your library.', body: 'Genres, playtime, tags, and recency. Without the noise.' },
    { icon: '⚡', title: 'We pick your game.', body: 'One game. Matched to your mood, your time, and your library. Not a list. An answer.' },
    { icon: '▶', title: 'You play.', body: "Less friction. More fun. That's the whole point." },
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
          <p className="text-center text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] mb-12" style={{ color: C.textFaint }}>The actual problem.</p>
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
          <p className="text-base sm:text-lg mb-10 mt-6 max-w-xl" style={{ color: C.textMuted }}>Too many games. Too many choices. Your brain checks out.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 max-w-3xl">
            {problems.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold" style={{ backgroundColor: 'rgba(233, 30, 99, 0.12)', color: C.pink }}>{'✕'}</div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: C.textDark }}>{p.title}</p>
                    <p className="text-sm" style={{ color: C.textMuted }}>{p.body}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 mt-8 max-w-3xl">
            {solutions.map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm" style={{ backgroundColor: 'rgba(0, 188, 212, 0.12)', color: C.cyan }}>{s.icon}</div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: C.textDark }}>{s.title}</p>
                    <p className="text-sm" style={{ color: C.textMuted }}>{s.body}</p>
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

function VibeSection() {
  const vibes = [
    { emoji: '🌙', label: 'I want to chill' },
    { emoji: '⚡', label: 'I want a challenge' },
    { emoji: '📖', label: 'I want a good story' },
    { emoji: '⏱', label: 'I want something quick' },
    { emoji: '😄', label: 'I want to laugh' },
    { emoji: '✨', label: 'Surprise me' },
  ];

  return (
    <section id="features" className="relative px-5 sm:px-8 py-14 sm:py-20 overflow-hidden" style={{ backgroundColor: C.cream }}>
      {/* Firewatch tower — absolute, bleeding into next section */}
      <div className="absolute -right-2 sm:right-8 -bottom-8 w-52 sm:w-64 pointer-events-none opacity-85 z-[2] hidden md:block" style={{ transform: 'rotate(3deg)' }}>
        <Image src="/landing/firewatch-tower.png" alt="" width={600} height={300} className="w-full h-auto" />
      </div>

      {/* Small triangle cluster — left */}
      <svg className="absolute top-10 left-2 sm:left-8 w-16 sm:w-20 pointer-events-none opacity-35 hidden sm:block" viewBox="0 0 80 70" fill="none" aria-hidden>
        <polygon points="0,70 40,0 80,70" fill={C.cyan} opacity="0.7" />
        <polygon points="20,70 50,15 80,70" fill={C.pink} opacity="0.5" />
      </svg>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Reveal>
          <div style={{ transform: 'rotate(-1.5deg)' }}>
            <h2 className="font-[family-name:var(--font-condensed)] uppercase tracking-tight mb-2" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: C.textDark }}>
              Or skip the form. Just tap a vibe.
            </h2>
          </div>
          <p className="text-sm mb-8" style={{ color: C.textMuted }}>Tap one and see what we&apos;d pick from a sample library.</p>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {vibes.map((v) => (
              <button key={v.label} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all hover:scale-[1.04] active:scale-[0.97] cursor-pointer hover:border-[#E91E63]" style={{ borderColor: 'rgba(0,0,0,0.12)', color: C.textDark, backgroundColor: C.white }}>
                <span>{v.emoji}</span><span>{v.label}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.15em] mb-4" style={{ color: C.pink }}>What our picks look like.</p>

          {/* Card — tilted for angular feel */}
          <div style={{ transform: 'rotate(-2deg)' }}>
            <Image src="/landing/firewatch-card.png" alt="Example pick: Firewatch — 2-3 hours, Cozy, Curious, PC. Let's go or Roll again." width={600} height={250} className="max-w-md mx-auto w-full h-auto rounded-xl shadow-lg" />
          </div>

          <p className="mt-6 text-xs italic" style={{ color: C.textFaint }}>Every pick comes with a reason. And a tiny disclaimer.</p>
        </Reveal>
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
          <p className="text-sm mb-8 mt-4" style={{ color: C.textMuted }}>Stop scrolling. Start playing.</p>
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
          <p className="text-xs font-[family-name:var(--font-mono)]" style={{ color: C.textFaint }}>Free. No account. No hassle. We barely want your email.</p>
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
