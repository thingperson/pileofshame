# PR Preview — Landing Page Pass

**Branch:** (not created yet — preview only)
**Files touched:** `components/LandingPage.tsx`, `components/GetStartedModal.tsx`, `app/page.tsx`
**New file:** `components/SampleImportNudge.tsx`

Review each block. Reply with `approve` / `skip` / `change: <note>` per numbered item. I'll apply approvals as a single commit.

---

## 1. Hero — inline CTAs, new subhead, sign-in moved

**File:** `components/LandingPage.tsx`

### Before
```tsx
<h1 ...>
  Your pile's not gonna
  <br />
  <span>play itself.</span>
</h1>

<p>Can't decide what to play? Yeah, we know.</p>

<button onClick={() => setShowGetStarted(true)}>
  Get Started
</button>

<p>Free. No account required.</p>

{/* Sign-in affordance for returning users */}
<div className="mt-5 flex items-center justify-center gap-2">
  <span>Already have an account?</span>
  <AuthButton />
</div>

<GetStartedModal ... />
```

### After
```tsx
<h1 ...>
  Your pile's not gonna
  <br />
  <span>play itself.</span>
</h1>

<p className="text-base sm:text-lg md:text-xl ...">
  We'll pick the game. You do the playing.
</p>

<div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
  <button onClick={onImport} className="[primary gradient button]">
    Import My Library
  </button>
  <button onClick={onLoadSample} className="[secondary ghost button]">
    Try a sample first
  </button>
</div>

<p>Free. No account required.</p>
```

Sign-in link (`Already have an account? Sign in`) removed from hero.
`GetStartedModal` removed from `LandingPage.tsx` entirely — it no longer gets triggered from here.

### Notes
- Subhead size bumped one tier (was `text-sm sm:text-base md:text-lg`, now `text-base sm:text-lg md:text-xl`) because it's now doing real work.
- Primary button keeps the current gradient. Secondary is a ghost button matching the style of the current "Or try a sample library" on the bottom CTA.
- Mobile: buttons stack vertically (`flex-col`), desktop they sit side by side.

---

## 2. Sign-in moves to top-right nav slot

**File:** `components/LandingPage.tsx`

Add a minimal nav at the top of the landing page (above the hero section):

```tsx
<nav className="relative z-20 flex items-center justify-end px-6 py-4">
  <AuthButton />
</nav>
```

Rendered with no logo/title (the hero image is the identity). Just the sign-in button in the top-right. On scroll it stays in the document flow, not fixed.

### Notes
- `AuthButton` already opens its own auth flow / modal.
- No hamburger, no other links. This is a landing page, not an app nav.
- If you want a logo on the left, say the word — I'd vote no for simplicity.

---

## 3. Differentiator section — tightened

**File:** `components/LandingPage.tsx`

### Before
```tsx
<section>
  [decorative divider]
  <h2>Not another backlog tracker.</h2>
  <p>
    Every other app wants you to catalogue and organize.
    We want you to close the app and go play.
  </p>
  <p>
    You scroll for 20 minutes, pick nothing, open YouTube.
    Inventory Full fixes that.
  </p>
</section>
```

### After
```tsx
<section>
  [decorative divider]
  <h2>Not another backlog tracker.</h2>
  <p>
    Every other app wants you to catalogue and organize.
    We want you to close our app and go play.
  </p>
</section>
```

Changes: "the app" → "our app" (more ownership, more voice). YouTube paragraph deleted.

---

## 4. REVISED — Replace features grid with "5 ways to pick tonight's game"

**File:** `components/LandingPage.tsx`

Per Cowork audit + Brady call: the 5 reroll shortcut modes are a retention hook that's been undersold. They're also sharper marketing material than abstract feature cards. Replacing the "What you get." grid with a "5 ways to pick tonight's game" grid.

### Section title + subhead
```
5 ways to pick tonight's game.
Not in the mood for a full mood-and-time pick? Pick a vibe and go.
```

### Grid contents (sourced verbatim from `lib/reroll.ts` — single source of truth)
```
🎲  Anything       Pure random from your whole library.
🌙  Quick Session  Wind-down tier only. 30 minutes or less.
🔥  Deep Cut       A game buried in your backlog you may have forgotten about.
▶   Keep Playing   Games you already started. Pick one and finish it.
🏁  Almost Done    Close to the credits. Let's get you there.
```

### Layout
5-card grid. Desktop: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` (five across on wide screens, 2-wide on tablet, stacked on mobile). Each card: emoji on top, bold label, one-line description.

### What happens to the trust card
"Your data stays yours" was the 4th card in my previous proposal. Moving it to a single-line reassurance strip between this section and the bottom CTA, styled small:

> Everything lives in your browser. Export anytime. We don't sell anything.

Keeps the trust beat without making it a full feature card.

### Imports to remove after this
`MoodIcon`, `ClockIcon`, `TimerIcon`, `PartyIcon`, `FreeIcon`, `LockIcon`, the `FeatureCard` subcomponent (or keep `FeatureCard` renamed — see note).

### Note
If we want the 5-ways grid to visually match the `FeatureCard` component, we can reuse it with different content and drop the unused icons. If we want them to look more like the `StepCard` style (number + title + description), also an option. My vote: **new lightweight card style** — just emoji + bold title + one-line copy, slightly airier than `FeatureCard`. Happy to match either existing style if you prefer consistency.

### Why this is worth the extra scope
- Sharper positioning. "5 ways to pick" > "here are some features."
- Gives cold visitors a concrete self-locate moment ("oh, I'm a Deep Cut person tonight").
- Social-ready — see `docs/marketing-5-ways-to-decide.md` for how this feeds Reddit/PH copy.
- Zero new product work — pulls from existing `REROLL_MODES` constant.

---

## 5. Bottom CTA — button label unified

**File:** `components/LandingPage.tsx`

### Before
```tsx
<button onClick={onImport}>
  Import My Library - It's Free
</button>
```

### After
```tsx
<button onClick={onImport}>
  Import My Library
</button>
<p className="mt-3 text-xs ...">Free. No account required.</p>
```

Matches the hero button language exactly. The "It's Free" moves to microcopy underneath (consistent with hero pattern). Existing "stop stalling. get playing." tagline stays above the button as-is.

---

## 6. GetStartedModal — demoted to pure sign-in

**File:** `components/GetStartedModal.tsx`

### Changes
- Header text: "Get Started" → "Sign in to sync"
- Subheader: "Import your games. We'll pick what to play." → "Keep your library across devices. Free forever."
- **Remove** the "Import my library" + "Try sample data first" buttons and the "No account needed" microcopy
- **Remove** the "want to sync across devices?" divider (the whole modal is now about sync, no need to divide)
- Keep Discord / Google / Email sign-in flows intact
- Optional rename: `GetStartedModal` → `SignInModal` (more accurate, but larger diff — see note below)

### Note on rename
Renaming the component touches every import site. Safer for this pass: keep the filename, change the internal semantics and copy. We can rename in a separate cleanup commit once the dust settles. **My vote: skip the rename for now.**

### Trigger audit
Before shipping, I verify where `GetStartedModal` is currently triggered from:
- `LandingPage.tsx` hero (removing in change #1) ✓
- Anywhere else? I'll grep and confirm. If `AuthButton` already handles its own flow, we may be able to leave it at one trigger point (nav). If not, we wire nav → modal cleanly.

---

## 7. NEW component — SampleImportNudge

**File:** `components/SampleImportNudge.tsx` (new)

A one-time post-first-commit prompt for sample users. Fires when `if-sample-pending` flag clears (i.e., user completed their first reroll commit in sample mode).

### Behavior
- Only renders if `isSampleLibrary === true` AND `localStorage.getItem('if-sample-nudge-shown') !== '1'`
- Listens for the `if-sample-pending` flag to clear (or accepts an explicit `visible` prop from parent)
- Warm, not pushy. One primary CTA, one dismiss.
- Sets `if-sample-nudge-shown=1` on either action so it never fires twice

### Proposed copy
```
That felt good, right?

That was one pick from fake data.
Now do it with yours.

[ Import My Library ]   [ Keep exploring ]
```

### Wiring
Mount in `app/page.tsx` below the existing `PostImportSummary`. Triggered off the same `if-sample-pending` transition that fires `sample_completed` analytics.

### Notes
- Won't annoy users who dismissed the top banner immediately — the top banner is session-1 friction, this is post-value-proof.
- Won't stack with the banner if banner is still visible (check `sampleBannerDismissed` state or just accept mild redundancy — they serve slightly different moments).

---

## 8. Make "Sample Library" pill tappable

**File:** `app/page.tsx` (around line 594)

### Before
A non-interactive `<span>` showing "Sample Library" in purple.

### After
Wrap in a `<button>` that opens the Import Hub on click. Visual: unchanged, but cursor becomes pointer and it's keyboard-focusable. Adds a tooltip "Click to import your real library."

Small change, always-available escape hatch.

---

## 9. NEW — Per-game icon legend (Cowork audit)

**File(s):** `components/HelpModal.tsx` (add legend section), `components/GameCard.tsx` (first-visit callout)

### Problem
First-time visitors see persistent card icons without a visible legend. Tooltips only appear on hover (desktop) and aria-labels only read to screen readers. The icons are:

- ⭐ Wishlisted
- 🚫 Ignored from recommendations
- 💤 Soft-ignored (skipped 5+ times, hidden from picker)
- 🏆 Platinum earned / % for achievement progress
- Status icons (from `STATUS_CONFIG`): Backlog, Up Next, Playing Now, Completed, Moved On

Cowork's example was the right one: new users wonder "what does ⚡ on Skyrim mean vs. 📖 on Disco Elysium?" On its own, raw emoji is clutter.

### Proposed fix (two parts)

**Part A — Add a legend section to HelpModal**
A table or compact grid in the Help modal that lists every persistent icon with its meaning. Grouped:

> **On a game card, you'll see:**
> ⭐ Wishlisted — you want to buy this someday
> 🚫 Ignored — hidden from recommendations
> 💤 Soft-ignored — skipped too many times, hidden automatically
> 🏆 Platinum — you earned every achievement
>
> **Status icons:**
> [one row per status from STATUS_CONFIG]

**Part B — First-visit tooltip on the first card icon**
On a user's first library view (after import or sample load), a small callout appears next to the first icon on the first card: "Hover an icon to see what it means. Or check the Help menu for the full list."

Gated by a localStorage flag `if-icon-legend-seen`. One-time, dismissible, auto-dismisses after 10 seconds.

### Scope call
- **Part A is low-risk, high-value.** Ship it with the landing PR.
- **Part B is nice-to-have.** If it adds too much scope to this PR, defer to its own commit. My vote: defer Part B, ship Part A now.

### Out of scope
- Emojis in *toast/tip text* (gameplay tips like "📖 Read your save's chapter") are contextual and self-explaining in their sentence. Not part of this change.
- Icon redesign (replacing emojis with SVGs) — much bigger scope, defer to a future pass.

---

## 10. NEW — Demo capture above the fold (strategist: "single highest-leverage move")

**File:** `components/LandingPage.tsx`, plus new asset

### Problem (from strategist critique)
The landing page under-conveys what's inside. Users who explore the app experience voice and design discipline at every micro-interaction; users who bounce from the landing page get a partial read. Gap between "inside" and "outside" is the biggest conversion leak.

### Proposed fix
Add a 3-6 second looping screen capture above the fold — ideally showing a recommendation card in action with a standout line like the Dark Souls "now you own the guilt twice" description visible. Proves the product's voice and mechanism in two seconds.

### Placement
Between the hero subhead and the CTA buttons, OR as a subtle background element behind the hero (muted, looped, decorative). My vote: **below the buttons, above "Free. No account required."** — visible but not fighting the CTA for attention.

### Scope / effort
- **Asset creation:** Brady records a 3-6s loop with a screen recorder (Kap, CleanShot, or similar). Optimizes to <500KB (WebM + MP4 fallback).
- **Component:** Add `<video autoPlay muted loop playsInline>` with poster image fallback.
- **Accessibility:** `aria-label` description + `prefers-reduced-motion` media query to show static screenshot instead of video.

### Defer vs. ship
This is high-leverage but requires Brady to produce the capture. If he can shoot it in the next 30 minutes, ship with this PR. If not, defer to a follow-up — the rest of the PR is still valuable without it.

**Recommendation:** PR-land the component scaffolding with a placeholder image; Brady swaps in the real capture when ready.

---

## 11. NEW — Promote "warehouse of good intentions" line

**File:** `components/LandingPage.tsx`

### What's happening
The line *"Your backlog should feel exciting, not a warehouse of good intentions"* currently lives only in the interior "How It Works" copy. The strategist's read: this is the real thesis of the product. It's hiding.

### Proposed placement
Promote it to a standalone block between the hero and How It Works sections, OR absorb it into the hero subhead area as a secondary line. My vote: **standalone block, small and quiet, between hero and How It Works.**

```
Your backlog should feel exciting.
Not a warehouse of good intentions.
```

Centered, serif-adjacent, about 60% opacity, small decorative dividers above and below. Feels like a pull-quote from the product's own soul.

### Tradeoff
Adds one more section to the page (we just removed one). Worth it — this line is load-bearing. The hero tells you the pile won't play itself; this tells you the pile should *feel* like something good.

---

## 12. NEW — Name specific competitors in differentiator

**File:** `components/LandingPage.tsx` (updates item #3)

### Before (current proposal from item #3)
```
Not another backlog tracker.
Every other app wants you to catalogue and organize.
We want you to close our app and go play.
```

### After (strategist's stronger version)
```
Not another backlog tracker.
Steam, Backloggd, HowLongToBeat — they catalog and track.
We pick what you play tonight and get out of your way.
```

Named competitors make the contrast sharper per Dunford's positioning framework.

### Tradeoff
Naming competitors risks: (a) dating the copy if competitor landscape shifts, (b) implying we're in a fight with them rather than doing a different job, (c) giving visitors a mental off-ramp ("oh, I already use HLTB, so I don't need this"). My vote: **ship the named-competitor version, it's sharper.** But flagging the tradeoff so Brady can overrule.

---

## 13. NEW — Flip 3-step framing to outcome-first (evaluate, don't commit)

**File:** `components/LandingPage.tsx`

### The suggestion
Strategist proposes flipping Import → Vibe Check → Play to lead with the outcome:

```
You play.              (We pick.)
Based on your mood.    (We match.)
From your library.     (You import once.)
```

### My read
Cute in theory, weirder in practice. The current 3-step flow is *what the user does in order*, which is mental-model-clear. Flipping it creates a cognitive puzzle ("wait, I play first? No, I import first? What's going on?"). Feels like strategist-brain over UX-brain.

### Recommendation
**Skip this one or test it carefully.** Current 3-step is working. If we want to add outcome-framing, better done in the hero subhead ("We'll pick the game. You do the playing." already does this) than in the process diagram. Flagging for Brady's call.

---

## 14. NEW — Rethink "Vibe Check" label

**File:** `components/LandingPage.tsx`

### Status
Two independent votes (ours + strategist's) that "Vibe Check" may read as Gen-Z-coded to the 35+ gamer audience. Our current position: keep it on the landing (looser voice), don't propagate. Strategist seconds the concern.

### Options
- **A.** Keep "Vibe Check" — it's fine, mild signal, probably not a conversion killer.
- **B.** Rename to "Pick a mood" — direct, friendlier, slightly boring.
- **C.** Rename to "Match your mood" — active verb, slightly punchier.
- **D.** Rename to "Mood + time" — functional, factual, zero personality.

### Recommendation
**B or C.** My vote: **C, "Match your mood."** It's active, it's in-brand-voice, it removes the Gen-Z signal without going clinical. Keeps the step title punchy.

---

## 15. NEW — Founder anchor in footer

**File:** `components/LandingPage.tsx` (footer block around line 388)

### What to add
A single line in the footer: `made by @bradywhitteker` (or whatever handle Brady prefers) linking to GitHub, Bluesky, or personal site.

### Why
Reddit's default skeptic asks "who's behind this free thing and why should I trust them." A named human in the footer cuts through the "is this a data grab" concern in two seconds. Low effort, non-trivial trust signal.

### Placement
Below the Privacy / Terms / Cookies row. Small, faint, not fighting for attention.

### Tradeoff
None significant. Even if Brady doesn't want to promote himself, there's a privacy-through-obscurity argument for using a handle rather than a full name. Ship whichever feels comfortable.

---

## Out of scope for this PR

- Mobile hero min-height bump (flagged for `cross-browser` skill during pre-push)
- `design:accessibility-review` pass (defer to pre-push)
- `/theme-check` on landing copy changes (defer to pre-push)
- GetStartedModal → SignInModal rename (defer to later cleanup)
- Pre-launch risks flagged by strategist that are NOT landing-page work — see `docs/pre-launch-risks-2026-04-15.md`

---

## Review instructions

Reply to each numbered item:
- `approve` — ship as shown
- `skip` — don't ship this one
- `change: <note>` — ship with the noted tweak

When I have your calls, I'll apply approvals in a single commit, run `npm run build`, run the voice sweep from `deploy-gates.md`, and hand you back a push-ready diff.
