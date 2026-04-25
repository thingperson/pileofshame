# Session Resume — 2026-04-25 (Saturday, PDT)

**Type:** Maintenance + reorient day. ~2 weeks out from soft launch.

## What shipped this session

Six mobile/PWA fixes, all in one commit. Build verified clean.

### 1. Viewport meta — `app/layout.tsx`
Added `export const viewport: Viewport` with `viewportFit: 'cover'`, `interactiveWidget: 'resizes-content'`, and themeColor. App was relying on Next's silent default; iPhone notch/home indicator regions now extend properly.

### 2. `100vh` → `100dvh` (3 spots)
- `app/page.tsx:505` — landing hero min-height
- `app/globals.css:48` — body min-height
- `app/global-error.tsx:21` — error page

The float animation at `globals.css:757` correctly stays `100vh` (it's a transform, not a layout dimension).

### 3. iOS auto-zoom on input focus — global CSS rule
Single media query in `app/globals.css` forces all real text inputs to 16px on viewports ≤640px. Beats touching 16 component files. Tailwind `text-sm`/`text-xs` classes are preserved on desktop.

### 4. Safe-area insets on fixed-bottom UI
Added `env(safe-area-inset-bottom)` to:
- `components/FeedbackWidget.tsx:82` (Feedback button)
- `components/CookieBanner.tsx:101` (banner)
- `components/JustFiveMinutes.tsx:294` (timer pill)
- `components/Toast.tsx:36` (toast container)

### 5. Maskable icon — `app/manifest.ts`
Added `purpose: 'maskable'` entry pointing at existing `/icon-512.png`. **Caveat:** ideally we'd ship a separate icon variant with ~20% safe padding so Android's circle/squircle mask doesn't crop the logo edges. Reusing the existing 512 is interim.

---

## Background research delivered (3 agents) — for review

The following are research findings, **no code changed for these.** Picked your tier of "what to do" and listed the concrete proposals.

### A. About page logo + share card audit

| # | Issue | File | Fix |
|---|---|---|---|
| A1 | About page uses `<Wordmark variant="alone" />` (logomark only); landing uses `variant="full"` | `app/about/page.tsx:23` | Change `alone` → `full` |
| A2 | Clear-card OG can render `"UNDEFINED CLEARED!"` if `card.game_name` is null — no fallback before `.toUpperCase()` | `app/clear/[id]/opengraph-image.tsx:141` | `const gameName = (card.game_name ?? 'Unknown Game').toUpperCase()` |
| A3 | No share-card preview before sharing | `components/StatsShareComposer.tsx` (after success state) | Add `<img src={ogImageUrl}>` after `setShareUrl` fires; live preview that updates as toggles change |

Pile-card OG (`app/pile/[id]/opengraph-image.tsx`) is fully guarded — no action needed.
Root OG is intentionally static — no action needed.

### B. Onboarding audit

**Time-to-pick estimates:**
- Sample library: ~30s ✓
- Small real library: ~75s (15s over thesis)
- Medium 100–300 games: ~120s
- Large 500+: ~180s+ (game-selection bottleneck)

**Critical friction (in order):**
1. **Landing has too much** — `LandingPage.tsx:217–298` "It's really just three things" section. Decision-paralyzed users don't need a marketing pitch. Recommendation: cut to one-screen hero + immediate CTA. Move marketing narrative to `/about`.
2. **No auto-progression import → first pick.** PostImportSummary modal can be dismissed with no clear next action. Recommendation: auto-launch Reroll modal after import, summary as collapsed sub-section.
3. **Game-selection grid in Steam import** — 500-game library = 2–3 min of scrolling/checking. Recommendation: add "Deselect already-played" one-tap (uses Steam playtime).

**Voice issues found** (only 1):
- `Reroll.tsx:856` — *"Pick one. No more rolls."* reads punitive. Voice-charter fix: *"Time to commit. Pick one. You've got this."* (or similar warm imperative).

**Other moderate flags:**
- Energy pills (🔋/⚡/🔥) are metaphor, not clarity. Suggestion: *"Quick (30m) / Medium (2–4h) / Long (4h+)"*.
- Forced 10-roll gate (`Reroll.tsx:850–910`) traps users. Soft-gate with toast at 8 rolls would respect autonomy.
- Energy + Mode required before first roll — technically at the 2-input ceiling but feels heavy on first open. Mitigated by "Anything" default.

### C. Feature creep + paid-tier audit

**Strategic recommendation: ship as-is with 5 surgical cuts.** Soft launch will tell you what's dead weight; pre-optimizing now is guessing.

**Must-cut before launch:**
1. **Custom categories** — verify users can't create new shelves beyond the 6 defaults. Organization is what we *don't* want. Lock the 6.
2. **Affiliate component (`AffiliateDisclosure`)** — gate behind `process.env.NEXT_PUBLIC_AFFILIATE_ENABLED` or remove. Shipping unfinished revenue scaffolding looks unfinished, and RAWG Commercial license + Stripe aren't live.

**Should-cut for focus:**
3. **Custom vibes** — fixed 10-mood palette only. Nobody asked for custom; signals "we don't know what moods matter."
4. **Themes 13 → 3 visible** — Dark (default), Dino, 90s as easter eggs. Hide the other 10 behind "more themes coming." Keep code.
5. **Sub Shuffle** — move from primary nav to a sub-option of "Add games." Browsing catalogs invites the paralysis we solve.

**Consider:**
- Tone down "we learned X about you" framing in nudges → state facts, not inferences. Trust signal.

**Paid tier shape (phase 2, not now):**
- ✅ Cosmetic perks (extra themes, archetype badges, animated logomark) — clean, doesn't gate core
- ✅ Family/household sharing — clean, real use case (phase 3)
- ✅ Advanced engine modes (custom weighting, duo mode) — phase 3+
- ⚠️ Personal play-pattern analytics — **fights the thesis** (incentivizes time-in-app). Don't ship.
- ❌ Behavioral targeting for purchases — off-limits forever (legal-compliance.md)
- ❌ Ads / data sales — off-limits forever
- ⚠️ Cloud sync as paid — would require stripping it from free; don't move that gate

---

## Review punch list (your call before code changes)

Quick-yes/no items for your next pass. None of these were touched this session — research only.

**About page + share cards (~30 min total):**
- [ ] Swap About page Wordmark variant: `alone` → `full`
- [ ] Add null fallback for `game_name` in clear-card OG route
- [ ] Add OG-image preview to StatsShareComposer success state

**Cuts before launch (~3–4 hr total):**
- [ ] Lock the 6 default categories, remove "add category" UI if it exists
- [ ] Gate or remove `AffiliateDisclosure` component
- [ ] Revert custom vibes → fixed 10-tag mood palette
- [ ] Cut visible themes to 3 (Dark / Dino / 90s)
- [ ] Move Sub Shuffle from primary nav to "Add games" sub-option
- [ ] Compress Settings menu if >8 items

**Onboarding polish (~1–2 hr):**
- [ ] Cut/move "It's really just three things" landing marketing section
- [ ] Auto-launch Reroll modal after import (summary collapses)
- [ ] Add "Deselect already-played" button to Steam import
- [ ] Rewrite "No more rolls" copy → warm imperative
- [ ] Soften 10-roll gate (toast at 8, don't trap)
- [ ] Optional: change energy pills from metaphor to time labels

**Mobile polish — interim (~1 hr):**
- [ ] Ship a true maskable icon variant (with ~20% safe padding) to replace the reused `/icon-512.png`

---

## In-progress / unchanged from prior sessions

See `docs/session-resume-2026-04-21.md` for what shipped before this session. The voice-charter, status-cycle lock, and PWA Tier 1 state are all intact.

---

*Closing status: build clean, no preview verification done (Brady heading out, asked to commit). All five mobile fixes shipped. Three audits documented for review. No copy changes made yet — punch list above is the menu.*
