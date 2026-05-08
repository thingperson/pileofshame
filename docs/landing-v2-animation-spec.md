# Landing V2 Animation Spec

Motion design proposals for `components/LandingPageV2.tsx`. Everything here is additive to the existing `Reveal` component. Nothing requires an external animation library.

---

## 0. Foundations: upgraded Reveal + scroll utilities

Before the per-section proposals, two small primitives that the rest of the spec depends on.

### 0a. ScrollProgress hook

A lightweight hook that returns a 0-1 progress value for an element's journey through the viewport. Used for parallax, scroll-linked transforms, and the experimental progress bar.

```tsx
function useScrollProgress(ref: React.RefObject<HTMLElement | null>, options?: { start?: number; end?: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el!.getBoundingClientRect();
        const start = options?.start ?? window.innerHeight;
        const end = options?.end ?? 0;
        const raw = 1 - (rect.top - end) / (start - end);
        setProgress(Math.max(0, Math.min(1, raw)));
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [ref, options?.start, options?.end]);

  return progress;
}
```

### 0b. Reveal variants

The current `Reveal` only does translateY + opacity. Add a `variant` prop for directional and scale entrances without breaking existing usage.

```tsx
type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'none';

function Reveal({ children, delay = 0, variant = 'up', className }: {
  children: React.ReactNode;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) { setShown(true); io.unobserve(e.target); } },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const transforms: Record<RevealVariant, string> = {
    up: 'translateY(32px)',
    left: 'translateX(-40px)',
    right: 'translateX(40px)',
    scale: 'scale(0.92)',
    none: 'none',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : transforms[variant],
        transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: shown ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
```

---

## 1. Hero entrance choreography

The hero has five visual layers that should arrive in a deliberate sequence. The goal is to feel like a magazine page assembling itself. Fast, confident. Not floaty.

### Sequence (all timings from page load)

| Layer | Delay | Effect | Duration |
|---|---|---|---|
| Pink accent bar (top) | 0ms | scaleX from left | 500ms |
| "Stop scrolling" badge | 100ms | fade + translateX(-20px) | 500ms |
| Headline "You don't need more games" | 200ms | fade + translateY(24px) | 600ms |
| Headline "You need a decision" (pink) | 350ms | fade + translateY(24px) | 600ms |
| Subhead + CTAs | 500ms | fade + translateY(16px) | 500ms |
| Picker card (right) | 400ms | fade + translateY(40px) + rotate settles from 4deg to 2deg | 800ms |
| Collage top-right | 600ms | fade + scale(0.85) to scale(1) | 700ms |
| Triangles SVG | 700ms | fade only | 400ms |

### Code: pink accent bar entrance

Replace the static accent bar with a CSS animation that scales from the left edge.

```tsx
{/* Pink accent bar — animates in on load */}
<div
  className="absolute top-0 left-0 w-[60%] h-2 sm:h-3 z-10 hidden sm:block"
  style={{
    backgroundColor: C.pink,
    transform: 'skewX(-25deg)',
    transformOrigin: 'top left',
    animation: 'accentSlide 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
  }}
  aria-hidden
/>
```

```css
@keyframes accentSlide {
  from { transform: skewX(-25deg) scaleX(0); }
  to   { transform: skewX(-25deg) scaleX(1); }
}
```

### Code: picker card entrance with rotation settle

The card starts at a steeper rotation and eases into its resting angle. Feels like it was tossed onto a desk.

```tsx
<Reveal delay={400}>
  <div
    className="relative picker-card-entrance"
    style={{ transform: 'rotate(2deg)' }}
  >
    {/* ...existing card content */}
  </div>
</Reveal>
```

```css
.picker-card-entrance {
  animation: cardSettle 800ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both;
}

@keyframes cardSettle {
  from {
    opacity: 0;
    transform: rotate(5deg) translateY(40px);
  }
  to {
    opacity: 1;
    transform: rotate(2deg) translateY(0);
  }
}
```

### Code: split headline entrance

The two headline lines arrive separately. The second line (pink "You need a decision") arrives slightly after, creating a one-two punch that mirrors the copywriting cadence.

```tsx
<div className="hero-headline-1" style={{
  animation: 'revealUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both',
}}>
  You don't need more games.
</div>
<div className="hero-headline-2" style={{
  animation: 'revealUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 350ms both',
}}>
  <span style={{ color: C.pink }}>
    You need a decision.
    {/* cyan underline */}
  </span>
</div>
```

```css
@keyframes revealUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Cyan underline draw-on

The underline beneath "You need a decision" should draw itself in from left to right, arriving just after the text.

```css
@keyframes drawLine {
  from { transform: skewX(-12deg) scaleX(0); }
  to   { transform: skewX(-12deg) scaleX(1); }
}
```

```tsx
<span
  className="absolute -bottom-1 left-0 w-full h-1.5 sm:h-2"
  style={{
    backgroundColor: C.cyan,
    transformOrigin: 'left center',
    animation: 'drawLine 400ms cubic-bezier(0.16, 1, 0.3, 1) 550ms both',
  }}
  aria-hidden
/>
```

---

## 2. Scroll-triggered section animations

### 2a. Problem items: staggered slide-in from left

The four problem bullets currently fade up uniformly. Instead, slide them in from the left with increasing delays. The "X" icons should arrive first (scale pop), then the text fades in.

```tsx
{problems.map((p, i) => (
  <Reveal key={i} delay={i * 120} variant="left">
    <div className="flex gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
        style={{
          backgroundColor: 'rgba(233, 30, 99, 0.12)',
          color: C.pink,
          animation: `iconPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${200 + i * 120}ms both`,
        }}
      >
        {'✕'}
      </div>
      <div>
        <p className="font-bold text-sm" style={{ color: C.textDark }}>{p.title}</p>
        <p className="text-sm" style={{ color: C.textMuted }}>{p.body}</p>
      </div>
    </div>
  </Reveal>
))}
```

```css
@keyframes iconPop {
  from { transform: scale(0); opacity: 0; }
  50%  { transform: scale(1.2); }
  to   { transform: scale(1); opacity: 1; }
}
```

### 2b. Solution items: staggered slide-in from right

Mirror the problem items but from the opposite direction. Creates a visual argument: problems push in from the left, solutions answer from the right.

```tsx
{solutions.map((s, i) => (
  <Reveal key={i} delay={i * 120} variant="right">
    {/* ...existing solution card markup */}
  </Reveal>
))}
```

### 2c. Section headings: rotation settle

The rotated headings ("Why it feels impossible", "How Inventory Full fixes it") should start at a more extreme rotation and settle into their resting angle as they enter the viewport.

```tsx
<Reveal>
  <div style={{
    transform: 'rotate(-2.5deg)',
    transformOrigin: 'top left',
  }}>
    <h2
      className="font-[family-name:var(--font-condensed)] uppercase leading-[0.85] tracking-tight section-heading-entrance"
      style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
    >
      Why it feels
    </h2>
    {/* ... */}
  </div>
</Reveal>
```

The Reveal handles opacity + translateY. The heading itself gets an additional CSS animation for the rotation settle, triggered by the same IntersectionObserver via a class toggle.

```css
.section-heading-entrance {
  /* Applied when Reveal sets shown=true */
  animation: rotationSettle 800ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes rotationSettle {
  from { transform: rotate(-1.5deg); }
  to   { transform: rotate(0deg); }
}
```

The parent div already has `rotate(-2.5deg)`. The heading's own rotation is additive. Net result: the heading overshoots to -4deg and settles to -2.5deg.

---

## 3. Section transitions: scroll-linked skew movement

### 3a. PlatformBar skew shift

The PlatformBar already has `skewY(-2deg)`. As the user scrolls past it, subtly shift the skew from -3deg to -1deg. This makes the bar feel like it's flattening under the scroll momentum.

```tsx
function PlatformBar() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);
  // Interpolate skew from -3 to -1 as progress goes 0 to 1
  const skew = -3 + progress * 2;

  return (
    <div ref={ref} className="relative my-4 sm:my-6" style={{ transform: `skewY(${skew}deg)` }}>
      {/* ...existing content with counter-skew on children */}
    </div>
  );
}
```

### 3b. ClarityBanner parallax reveal

The big pink banner should have a subtle vertical parallax: the background image moves slightly slower than the text, creating depth.

```tsx
function ClarityBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);
  const bgOffset = (progress - 0.5) * -30; // -15px to +15px

  return (
    <Reveal>
      <div ref={ref} className="relative py-6" style={{ margin: '-1rem 0 1rem' }}>
        <div className="relative overflow-hidden" style={{ transform: 'skewY(-3deg)', padding: '3rem 0' }}>
          <div className="absolute inset-0 z-0" style={{ transform: `translateY(${bgOffset}px)` }}>
            <Image src="/landing/pink-banner-strip.png" alt="" width={1600} height={200} className="w-full h-full object-cover" />
          </div>
          {/* ...rest unchanged */}
        </div>
      </div>
    </Reveal>
  );
}
```

### 3c. Footer polygon wipe

The footer's SVG triangle that creates the angled top edge could animate: the polygon's top-right point slides from center to right as it scrolls into view. Makes it feel like the dark footer is slicing upward into the page.

```tsx
function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);
  // Animate the polygon's top-right x coordinate from 720 to 1440
  const topRightX = 720 + progress * 720;

  return (
    <div ref={ref} className="relative">
      <div className="absolute -top-10 sm:-top-16 left-0 right-0 h-10 sm:h-16 z-[1]" aria-hidden>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-full">
          <polygon points={`0,70 ${topRightX},0 1440,70`} fill={C.dark} />
        </svg>
      </div>
      {/* ...rest unchanged */}
    </div>
  );
}
```

---

## 4. Micro-interactions

### 4a. CTA buttons: pink glow pulse on hover

The "Import My Library" buttons already have a pink box-shadow. On hover, pulse the glow radius.

```css
.cta-primary {
  transition: transform 150ms ease, box-shadow 200ms ease;
}

.cta-primary:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 30px rgba(233, 30, 99, 0.35), 0 0 60px rgba(233, 30, 99, 0.1);
}

.cta-primary:active {
  transform: scale(0.97);
  box-shadow: 0 2px 10px rgba(233, 30, 99, 0.2);
}
```

### 4b. Vibe pills: border color transition + slight lift

The vibe buttons should feel tactile. On hover, the border shifts to pink (already happens), the pill lifts slightly via translateY, and a faint shadow appears.

```tsx
<button
  key={v.label}
  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border cursor-pointer"
  style={{
    borderColor: 'rgba(0,0,0,0.12)',
    color: C.textDark,
    backgroundColor: C.white,
    transition: 'transform 150ms ease, border-color 200ms ease, box-shadow 200ms ease',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
    e.currentTarget.style.borderColor = C.pink;
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 30, 99, 0.12)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
    e.currentTarget.style.boxShadow = '';
  }}
>
  <span>{v.emoji}</span><span>{v.label}</span>
</button>
```

Or more cleanly with Tailwind classes if you add a group hover:

```tsx
<button className="... hover:-translate-y-0.5 hover:scale-[1.04] hover:border-[#E91E63] hover:shadow-md transition-all duration-150">
```

### 4c. Emoji bounce on vibe pill hover

When hovering a vibe pill, the emoji should do a quick bounce. CSS only.

```css
.vibe-pill:hover .vibe-emoji {
  animation: emojiBounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes emojiBounce {
  0%, 100% { transform: translateY(0); }
  40%      { transform: translateY(-4px); }
  70%      { transform: translateY(-1px); }
}
```

### 4d. Platform badges: subtle left-to-right stagger

The platform names in the PlatformBar should reveal with a staggered fade, left to right, as the bar scrolls into view. This replaces a static list with a quick cascade.

```tsx
{platforms.map((p, i) => (
  <Reveal key={p} delay={i * 60} variant="up">
    <span className="text-sm font-medium">{p}</span>
  </Reveal>
))}
```

### 4e. Nav CTA: persistent subtle pulse

The nav "Import My Library" button gets a very subtle box-shadow pulse to draw the eye without being obnoxious. Runs once on load, then stops.

```css
@keyframes navPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(12, 12, 18, 0.3); }
  50%      { box-shadow: 0 0 0 6px rgba(12, 12, 18, 0); }
}

.nav-cta {
  animation: navPulse 2s ease-in-out 1.5s 2; /* 2 pulses after 1.5s delay, then stops */
}
```

---

## 5. The pick card

### 5a. Simulated card flip

When the picker card scrolls into the vibe section, simulate a pick result sliding in. The Firewatch card image rotates from -2deg rest position, flips 180deg on Y axis, and the "result" side is revealed. This is a single CSS animation triggered by IntersectionObserver.

However, since we're working with static images (not two separate card faces), a simpler approach works better:

### 5b. Card slide-in with result highlight

The Firewatch card in the vibe section should enter from below with a slight overshoot, then after settling, a highlight border pulses once to simulate "here's your pick."

```tsx
function PickCardReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) { setShown(true); io.unobserve(e.target); } },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'rotate(-2deg)' : 'rotate(-2deg) translateY(60px) scale(0.95)',
        transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        className="rounded-xl"
        style={{
          boxShadow: shown
            ? '0 25px 50px -12px rgba(0,0,0,0.15)'
            : '0 10px 20px -5px rgba(0,0,0,0.1)',
          transition: 'box-shadow 1s ease 600ms',
        }}
      >
        {children}
      </div>
      {/* Pink glow pulse after card lands */}
      {shown && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            animation: 'pickGlow 1.2s ease-out 800ms both',
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
```

```css
@keyframes pickGlow {
  0%   { box-shadow: 0 0 0 0 rgba(233, 30, 99, 0.4); }
  50%  { box-shadow: 0 0 0 8px rgba(233, 30, 99, 0.15); }
  100% { box-shadow: 0 0 0 0 rgba(233, 30, 99, 0); }
}
```

This reads as: the card slides up, lands with a slight bounce (the 0.34, 1.56 cubic-bezier overshoots), then a pink glow pulses outward once like "found it."

---

## 6. Parallax layers

### 6a. Which elements move and at what rates

Not everything should parallax. The rule: **decorative collage elements drift. Content stays anchored.** The user is reading content. Collage pieces are atmosphere.

| Element | Parallax rate | Direction | Notes |
|---|---|---|---|
| Hero collage top-right (`collage-4.png`) | 0.3x (slow) | Vertical, downward drift | Moves 30% of scroll speed |
| Hero paint stroke | 0.15x (very slow) | Vertical | Barely moves. Grounding layer. |
| Hero mountain | 0.1x (glacial) | Vertical | Mountains are far away. Slow = depth. |
| Hero triangles SVG | 0.4x | Vertical + slight horizontal | Floaty, geometric, detached |
| ProblemSolution collage (`collage-2.png`) | 0.25x | Vertical | |
| BottomCTA hand collage | 0.2x | Vertical | |
| BottomCTA collage left | 0.3x | Vertical | |
| Firewatch tower | 0.15x | Vertical | Anchored, barely drifts |

### 6b. Implementation: ParallaxLayer wrapper

A thin wrapper that applies scroll-linked translateY to decorative elements.

```tsx
function ParallaxLayer({
  children,
  rate = 0.2,
  className,
  style,
}: {
  children: React.ReactNode;
  rate?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) { ticking = false; return; }
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        setOffset((center - viewCenter) * rate);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [rate]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: `${style?.transform ?? ''} translateY(${offset}px)`.trim(),
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
```

### 6c. Usage example: hero collage

```tsx
{/* Collage top-right — rotated + parallax */}
<ParallaxLayer
  rate={0.3}
  className="absolute -top-6 -right-6 w-56 sm:w-72 pointer-events-none opacity-80 z-[1] hidden sm:block"
  style={{ transform: 'rotate(12deg)' }}
>
  <Image src="/landing/collage-4.png" alt="" width={400} height={400} className="w-full h-auto" />
</ParallaxLayer>
```

### 6d. Triangle float

The SVG triangle clusters should have a very gentle floating animation independent of scroll. This adds life even when the user isn't scrolling.

```css
@keyframes triangleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-6px) rotate(1deg); }
}

.triangle-float {
  animation: triangleFloat 6s ease-in-out infinite;
}

.triangle-float-delayed {
  animation: triangleFloat 7s ease-in-out 2s infinite;
}
```

Apply to the hero triangle cluster and the smaller triangle accents throughout.

---

## 7. Experimental idea: scroll-driven "pile progress" bar

### Concept

A thin, fixed bar at the very top of the page (above the sticky nav, or just below it) that fills from left to right as the user scrolls down the page. But it's not a generic scroll indicator. It's themed as a "pile clearing" metaphor:

- At 0%, the bar is labeled with a tiny "200 games" text on the left edge.
- As you scroll, the bar fills with a pink-to-cyan gradient.
- At 100% (bottom of page), the bar is full and the label switches to "1 decision."

This reinforces the entire page's argument in a single visual throughline: you came in with too many games, you're leaving with clarity.

### Why it works for this brand

The page's narrative arc is: you have too many games (problem) -> we narrow it to one (solution). The progress bar makes that arc spatial and visceral. It also subtly rewards scrolling, which is the one behavior we actually want on this page (as opposed to in-app, where less time = better).

It's not a gimmick because it directly maps to the product's value proposition. A generic scroll bar would be decorative. This one is argumentative.

### Implementation

```tsx
function PileProgressBar() {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      return;
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (reducedMotion) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-1 pointer-events-none"
      aria-hidden
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${C.pink}, ${C.cyan})`,
          transition: 'width 50ms linear',
        }}
      />
      {/* Labels at extremes */}
      <div
        className="absolute top-1 left-2 text-[9px] font-[family-name:var(--font-mono)] uppercase tracking-wider transition-opacity duration-300"
        style={{
          color: C.pink,
          opacity: progress < 0.05 ? 1 : 0,
        }}
      >
        200 games
      </div>
      <div
        className="absolute top-1 right-2 text-[9px] font-[family-name:var(--font-mono)] uppercase tracking-wider transition-opacity duration-300"
        style={{
          color: C.cyan,
          opacity: progress > 0.95 ? 1 : 0,
        }}
      >
        1 decision
      </div>
    </div>
  );
}
```

Place it as the first child inside the root `<div>` of LandingPageV2. It sits above the sticky nav's `z-50` at `z-60`.

### Fallback

If the labels feel too cute, drop them and keep just the gradient bar. A pink-to-cyan gradient that fills on scroll is still on-brand and satisfying without any text.

---

## 8. Performance notes

### What's CSS-only (no JS on scroll)

- Hero entrance choreography (all `@keyframes` with `animation-delay`)
- Cyan underline draw-on
- Icon pop animation
- Emoji bounce on hover
- CTA glow pulse
- Triangle float animation
- Nav CTA pulse
- All hover micro-interactions (translateY, scale, border-color, box-shadow)

### What needs JS (IntersectionObserver, one-time)

- Reveal variants (existing pattern, just extended)
- PickCardReveal glow trigger
- Rotation settle on section headings (class toggle on intersection)

### What needs JS (scroll listener, continuous)

- `useScrollProgress` hook (parallax, skew shift, footer wipe, progress bar)
- `ParallaxLayer` wrapper

### `will-change` strategy

- Set `will-change: transform` on ParallaxLayer elements (they transform every frame during scroll).
- Set `will-change: opacity, transform` on Reveal elements ONLY while they're still hidden. Once shown, reset to `auto` (the current code already does this).
- Do NOT set `will-change` on hover animations. The browser promotes layers on hover naturally.
- The progress bar's inner div gets `will-change: width` since it changes every frame.

### `prefers-reduced-motion` strategy

Every animation system respects `prefers-reduced-motion: reduce`:

- `useScrollProgress` returns 0 and never attaches a listener.
- `ParallaxLayer` renders children without any transform offset.
- `Reveal` snaps to shown state immediately (current behavior preserved).
- `PileProgressBar` returns `null`.
- All CSS `@keyframes` should be wrapped:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This single rule kills all CSS animations and transitions for users who prefer reduced motion. Put it in `globals.css`.

### Scroll listener performance

All scroll handlers use `requestAnimationFrame` gating (one rAF per frame max, skipped if already pending). Combined with `{ passive: true }`, this won't block the main thread or cause jank.

For pages with many ParallaxLayer instances (6-8 on this page), consider consolidating into a single scroll listener that updates all layers, rather than 8 independent listeners. A lightweight approach:

```tsx
// Single scroll coordinator
const scrollListeners = new Set<() => void>();
let scrollTicking = false;

function onGlobalScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollListeners.forEach((fn) => fn());
    scrollTicking = false;
  });
}

// In each ParallaxLayer, register/unregister from the set
// instead of adding a new window listener
```

This keeps the rAF count to 1 per frame regardless of how many parallax elements exist.

### Bundle impact

Zero external dependencies. Everything is CSS `@keyframes`, IntersectionObserver (already used), and vanilla scroll listeners. No Framer Motion, no GSAP, no Spring libraries.

---

## Summary: implementation priority

If implementing incrementally, this is the order that delivers the most impact per effort:

1. **Hero entrance choreography** (section 1) -- highest visual impact, first thing users see
2. **Reveal variants + staggered problem/solution items** (sections 0b, 2a, 2b) -- small code change, noticeable polish
3. **Micro-interactions** (section 4) -- hover states make the page feel alive
4. **Parallax layers** (section 6) -- adds depth to the collage composition
5. **Pick card bounce + glow** (section 5) -- nice moment in the vibe section
6. **Scroll-linked section transitions** (section 3) -- subtle but adds cohesion
7. **Pile progress bar** (section 7) -- experimental, ship last or not at all
8. **Scroll listener consolidation** (section 8) -- optimization pass after everything else works
