# Landing Page Critique — Apr 15, 2026

**Scope:** Full critique + copy rewrite of `components/LandingPage.tsx`.
**Goal:** Both conversion paths — cold visitors to `sample_started`, warm visitors to import.
**Status:** Findings only. Nothing shipped. Brady greenlights specific items.

---

## TL;DR — where I'd spend the effort

Ranked by leverage, highest first.

1. **Kill the modal gate on the hero CTA.** (High impact, trivial change)
2. **Rewrite the hero subhead to actually explain the product.** (High impact, copy only)
3. **Cut or merge the "Not another backlog tracker" section.** (Reduces scroll depth, sharpens narrative)
4. **Tighten the features grid from 6 → 4.** (Respect for attention)
5. **Unify button language across hero and bottom CTA.** (Consistency)
6. **Move "Already have an account?" out of the hero.** (Removes visual competition for new users)

Everything else is polish. Items 1–3 are the real wins.

---

## The page works. Here's what's in its way.

The landing page is already on-brand, voice-appropriate, and structurally sound. This is not a teardown — it's a sharpening pass. Most of the content can stay. The problems are about *what's asking for attention at the wrong moment*.

---

## 1. Hero — the first 3 seconds problem

### What works
- Headline is excellent. "Your pile's not gonna play itself." is locked, memorable, and does the job.
- Hero illustration (hand rising from pile) is the identity of the app. Keep.
- "Free. No account required." is reassuring and brand-appropriate.

### What's broken

**The subhead says nothing the headline didn't already say.**

Current:
> Can't decide what to play? Yeah, we know.

That's the same emotion as the headline. It restates the problem. A subhead's job is to deliver the promise — to answer "okay, and?" A cold visitor still doesn't know what this app *does* after reading both lines.

**The CTA opens a modal.** Primary button says "Get Started," which is vague and routes through `GetStartedModal`. That modal contains the actual choice: Import vs. Sample. So a cold visitor needs two clicks before anything happens. For the lowest-commitment path (sample), that's the wrong shape — the sample should be reachable in one click.

**Two-tier CTAs are fighting.** "Get Started" (primary) + "Already have an account? / Sign in" (secondary) both live in the hero. The sign-in is for returning users; new users don't need it adjacent to their primary action. Move it to a nav slot.

### Proposed hero copy

```
Your pile's not gonna
play itself.

We look at your Steam, PSN, or Xbox library, ask what
you're in the mood for, and tell you what to play.

[ Import My Library ]     [ Try a sample first ]

Free. No account required.
```

Two direct buttons, no modal. Subhead explains the actual mechanism in one sentence. Sign-in link moves to the top-right corner.

Alt subhead options if the above feels too descriptive:

- "Import your library. Tell us your mood. We pick the game."
- "Connect your library. We find you something to play tonight."
- "300 games in your library. One you should play tonight. We'll figure it out."

Pick based on what reads fastest on mobile. My vote is the first one (verb-verb-verb cadence — human, specific).

---

## 2. How It Works — keep it, one small tweak

### What works
- "It's really just three things:" is on-voice.
- The subhead "from 'I own 300 games' to 'I'm playing one'" is the best piece of copy on the page. Outcome-specific, conversational, disarming. Don't touch.
- Step 3's "Moving on is deciding too" lands the brand's core philosophy in six words.

### What to tweak
- Step 2 is labeled "Vibe Check" in the title but the brand doc lists this as "mood matching" or "Mood" in the feature vocabulary. Minor — "Vibe Check" is funnier, but it's an inconsistency worth noting. My vote: keep "Vibe Check" *here* (landing voice can be looser than product UI) but don't propagate it elsewhere.

---

## 3. "Not another backlog tracker" — overlapping pitch

### What works
- "Every other app wants you to catalogue and organize. We want you to close the app and go play." is the single best competitive differentiator line on the page.
- The YouTube line lands because it's specific enough to feel true.

### What's broken
This section is doing the same job as the hero. After "Your pile's not gonna play itself" and three How-It-Works steps, we pitch the problem *again*. Momentum dies.

### Options

**A. Cut it entirely.** The hero + How It Works already covers the pitch. Close CTA is 16vh away instead of 40vh away. Cleanest.

**B. Absorb the best line into How It Works.** Move "close the app and go play" as a tagline *above* the three steps or as a pull-quote between steps. Keeps the idea, kills the section.

**C. Shrink to a single line between sections.** One sentence, centered, no box. "Every other app wants you to catalogue. We want you to close the app and go play." That's it.

My vote: **C**. You lose the YouTube line (which is good but not load-bearing) and keep the one line that actually differentiates you from Backloggd/HLTB/etc.

---

## 4. Features grid — too many, some off-target

Current: 6 cards — Mood matching, Time-aware picks, 5-min try timer, Completion celebrations, Free/No sign-up, Your data stays yours.

### Problems
- **"Free. No sign-up."** duplicates the hero's "Free. No account required." and the How It Works "You do nothing."
- **"Your data stays yours"** is good and trust-building, but it's competing with the momentum-building cards. Trust copy belongs at the bottom near the close, not mid-page where we're trying to make someone excited.
- **"5-minute try timer"** is a niche hook. Cool feature, but cold visitors don't know what it is yet. It's a depth feature dressed as a landing hook.
- **Completion celebrations** is good — emotional payoff, visual-ready. Keep.
- **Mood matching + Time-aware** are the two core product promises. Keep.

### Proposed 4-card grid

| # | Title | Description |
|---|-------|-------------|
| 1 | Mood matching | Cozy, intense, brain-off, narrative. Match your energy to a game. |
| 2 | Time-aware picks | Got 20 minutes or a whole evening? We know the difference. |
| 3 | Completion celebrations | Finished a game? You earned the confetti. Moved on? That counts too. |
| 4 | Your data stays yours | Everything lives in your browser. Export anytime. We don't sell anything. |

Four is a better grid (2x2 on mobile, 2x2 or 4x1 on desktop). The 5-min timer and Free line get absorbed into the How It Works step copy instead.

---

## 5. Bottom CTA — mostly great, one fix

### What works
- "Your pile's not getting any smaller." — brand voice, punchy, closes the loop with the hero.
- "stop stalling. get playing." tagline placement is correct.
- "Import My Library - It's Free" is more specific and confident than the hero's "Get Started."
- "and we have a dino theme. come on." is chef's kiss. Don't touch.

### What to fix
**Button label mismatch.** Hero says "Get Started." Bottom says "Import My Library - It's Free." The bottom one is better. Unify: use "Import My Library" in both spots. (You can keep "It's Free" in the bottom one for emphasis, or move that to the microcopy line underneath both.)

---

## 6. Structure / scroll depth

Current order: Hero → How It Works → Not-another-tracker → Features → Bottom CTA.

Proposed order after cuts: Hero → How It Works (with absorbed differentiator line) → Features (4 cards) → Bottom CTA.

That's a 20% shorter page. Cold visitors who bounce at 30% scroll now hit the features card before they leave.

---

## 7. Mobile-specific

I haven't tested this on a real device in this pass — flagging for the `cross-browser` skill at pre-push time. Specific things to verify:

- Hero min-height is `40vh` with `py-8`. On short phones (iPhone SE-class), the CTA might push below the fold. Should probably be closer to `min-h-[80vh]` or `min-h-screen` with vertical centering so the CTA is always visible.
- If we go to two buttons in the hero (Import + Sample), they need to stack vertically on mobile with clear visual hierarchy (primary solid, secondary ghost).
- "Already have an account? Sign in" could wrap awkwardly. Moving to top-right nav solves this.

---

## 8. Secondary: GetStartedModal still has a job

If we inline the two buttons in the hero, `GetStartedModal` isn't gone — it still carries the auth/sync options (Discord, Google, Email). But it becomes **opt-in friction** (triggered by "Sign in" in the nav) rather than **mandatory friction** (gating the hero CTA).

That modal is actually well-designed for what it is: clear primary ("Import my library"), clear secondary ("Try sample data first"), and the sync-across-devices pitch with social sign-ins below. My suggestion is to let that modal live for returning users and decouple new-user import from it.

---

## Priority stack for Brady

If you want to spend 30 minutes on landing changes before launch, do:
1. Hero subhead rewrite (5 min)
2. Inline both buttons in hero, remove modal gate (10 min)
3. Cut "Not another backlog tracker" section down to one line (5 min)
4. Drop features grid to 4 cards (5 min)
5. Unify hero/bottom button language (2 min)

If you want a full pass (1–2 hours), add:
6. Move "Sign in" to top-right nav slot
7. Bump hero min-height for mobile
8. Run `design:accessibility-review` on the final
9. Run `/cross-browser` against Safari + mobile Chrome
10. Run `/theme-check` — the landing page uses CSS vars throughout, but worth verifying in non-default themes

---

## What I'd NOT change

- Headline: "Your pile's not gonna play itself." — locked, perfect.
- Hero illustration and background image — identity.
- How It Works 3-step structure — works.
- Bottom CTA closer line: "Your pile's not getting any smaller." — works.
- Tagline: "stop stalling. get playing." — locked brand.
- Dino theme easter egg footer — don't you dare.
- Footer links (Privacy / Terms / Cookies) — correct and compliant.

---

## Decisions locked (Apr 15 review pass)

1. **Hero subhead:** "We'll pick the game. You do the playing." ("do the playing" is intentional — reads as conversational, not slogan-polished.)
2. **Differentiator:** Keep the section, one block, "close our app and go play." Cut the YouTube line.
3. **Features:** Drop to 4 (Mood matching, Time-aware picks, Completion celebrations, Your data stays yours).
4. **Button language:** Unify on "Import My Library" across hero and bottom CTA.
5. **Sign-in:** Move to top-right nav slot, out of hero.
6. **GetStartedModal:** Demote to pure sign-in helper. Drop Import / Sample buttons from it.
7. **No A/B test.** Ship the better copy and move on. Not enough traffic yet.
8. **Sample→Import bridge:** Exists but thin. Add a post-first-commit nudge. See section below.

## Sample→Import bridge (audit + proposal)

**What's there today:**
- Persistent "Sample Library" purple pill in the library header status
- Dismissible top banner with gradient "Import yours" CTA
- `isSampleLibrary` detection via `g.id.startsWith('sample-')`
- `if-sample-pending` localStorage flag, used for `sample_completed` analytics

**Gaps:**
- Banner dismissible on first render, never returns
- No UX tied to the first reroll commit (the actual value-proof moment)
- Status pill is passive, not a CTA

**Proposal:**
- Keep the dismissible banner (it's fine for early in the session)
- Add a post-first-commit prompt triggered when `if-sample-pending` clears. Warm, one-time, skippable. Something like: "That felt good? That's one pick from fake data. Import your real library and do it for real." → [Import My Library] [Maybe later]
- Make the "Sample Library" pill tappable so it's always a one-click escape hatch to Import
- Only show the nudge once per browser (new flag: `if-sample-nudge-shown`)
