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

---

# Second pass — same day (afternoon)

Brady picked items off the morning punch list and asked for a parallel sweep of more areas. Below is what shipped in the second commit.

## Shipped

### About + share cards (the morning punch list, executed)
- About page Wordmark variant `alone` → `full`, plus inline `--wordmark-in: #ffffff` so it stays legible on the dark nav (matches how landing handles it). [app/about/page.tsx:23](app/about/page.tsx)
- Clear-card OG route gets a null fallback on `card.game_name` so a missing field never renders "UNDEFINED CLEARED!". [app/clear/[id]/opengraph-image.tsx:141](app/clear/[id]/opengraph-image.tsx)
- StatsShareComposer now shows a 1200×630 preview of the actual OG image right after the share link is created. Live thumbnail of what unfurls. [components/StatsShareComposer.tsx:289](components/StatsShareComposer.tsx)
- Wordmark SVG gets explicit `preserveAspectRatio="xMidYMid meet"` for Safari sizing reliability. [components/Wordmark.tsx](components/Wordmark.tsx)

### Reroll bug fix — filter changes no longer auto-roll
The 10-roll budget was being silently consumed because tapping a session-mode pill or cycling the energy pill called `doRoll()` directly. Now mode/energy pills only update filter state; new picks fire only on explicit "Roll Again" click. [components/Reroll.tsx:580](components/Reroll.tsx) and [components/Reroll.tsx:592](components/Reroll.tsx).

The mood-filter pills were already correct.

The roll counter itself was safe (these calls passed `countAsRoll=false`), but the UX still felt like the user was burning rolls without consent. Now mode/energy/mood adjust the next pick without producing one.

### Landing trim — marketing sections moved to /about
Cut from [components/LandingPage.tsx](components/LandingPage.tsx):
- "It's really just three things" section
- "Not another backlog tracker" pitch
- "Your backlog should feel exciting" pull quote
- "3 ways to pick today's game" cards
- The orphaned `StepCard`, `PickModeCard`, `ImportStepIcon`, `VibeStepIcon`, `PlayStepIcon` components

Landing is now hero → bottom CTA. About is the canonical "what is this product" page. The /about page already has equivalent sections — only the orphan "5 ways to pick" copy was fixed (→ "4 ways") to match the 4 cards rendered.

**Diff size:** ~165 lines deleted from LandingPage. Sections preserved in git history; restorable via `git revert` or cherry-picking the deleted block back if Brady changes his mind.

### Padded maskable icon
Generated a proper 512×512 maskable variant via sharp script (used existing `/icon-512.png` scaled to 60% inside a brand-purple `#7c3aed` field with 20% safe-zone padding on all sides). Manifest now points the maskable entry at the new asset.
- New file: [public/icon-512-maskable.png](public/icon-512-maskable.png)
- Manifest: [app/manifest.ts](app/manifest.ts)

### Void theme WCAG AA fix
Stale-review sweep flagged the void theme as failing AA: text-dim was 1.95:1 on black, accent-pink was 1.32:1 — body text invisible, buttons unreadable. Bumped each token to the minimum value that passes (4.5:1 for text, 3:1 for UI). Theme is still the most subdued of the bunch but no longer a launch blocker.
- [app/globals.css:1646](app/globals.css)

## Documents added

- **`docs/pre-launch-paredown-2026-04-25.md`** — six pare-down items (lock categories, gate affiliates, custom-vibes revert, themes 13→3, sub-shuffle demote, soften "we learned" copy) parked with how-to-execute for each. Brady not committed to any yet.

## Stale-review sweep — remaining punch list

Findings from the stale-review agent that are NOT yet executed (review and pick):

| # | Severity | Finding | File:line |
|---|---|---|---|
| 1 | moderate | Game cover `<img alt="">` on game-id images should be `alt={game.name}` — semantically meaningful, not decorative | `SteamImportModal.tsx:439`, `Reroll.tsx:639`, `PSNImportModal.tsx:348` |
| 2 | moderate | Auth checkbox toggle missing `aria-label` for keyboard-only users | `AuthButton.tsx:152–154` |
| 3 | moderate | GameSearch dropdown lacks arrow-key navigation (autocomplete standard) | `GameSearch.tsx:95–134` |
| 4 | moderate | Files >800 lines: GameCard 1231, Reroll 967, CompletionCelebration 782 — refactor candidates if time allows |  |
| 5 | minor | Void-theme settings gear relies on opacity alone — add a 1px persistent border so it's never invisible | `globals.css:1693` |

Cross-browser, security, env-var, Sentry, RLS, console.log, dangerouslySetInnerHTML — all clean.

## Outstanding (from this session)

- **Apr24 archetype images** — see "Archetype images review" section below.
- **Other punch-list items from morning audit** (custom categories lock, affiliates gate, vibes revert, themes 13→3, sub-shuffle demote, copy softening) — see `docs/pre-launch-paredown-2026-04-25.md`.

## Verification status

- `npm run build` clean (twice — once after mobile fixes, once after second-pass fixes).
- No browser preview verification this session (Brady absent during execution; will verify next session or Brady will eyeball before pushing).

---

## Archetype images review (apr24 set)

**Location:** `notes/new archetype images apr24/` — 23 PNG files, UUID-named, dated 2026-04-24, 1.1–2.9 MB each.

**What's there:** professionally illustrated character art, clearly NOT AI-slop. Three+ distinct visual styles spotted across the set:

1. **Enthusiast** — colorful, whimsical creature; cartoon/anime; purple + gold + neon accents; integrated UI badges ("9/10 stars", "Hype Crew", "Loved It"). Joyful, earnest.
2. **PlayStation Purist** — cyberpunk warrior/agent, hooded figure with controller-as-weapon; deep navy + neon blue; tactical/sci-fi vibe.
3. **The Optimizer** — retro-futuristic steampunk robot; cream chassis + purple/gold + green CRT-display face; labeled mechanical parts. Nostalgic 90s PC-building energy.

Quality is high. Each character feels distinctly "that archetype" — not interchangeable.

**vs. current state:** `ArchetypeCard.tsx` shows logomark/emoji + flavor text only. Adding character art would shift the brand feel from minimalist-zen to **playful narrative**. That's a real direction change, not a polish.

### Modal mockup proposal (no code yet)

**Desktop (≥768px):** character art on the left ~250–300px tall, full-body, transparent BG; text column on the right (title, tone tag, stats, flavor text); CTAs at the bottom. Replaces the current logomark/emoji entirely when art exists.

**Mobile (<640px):** character stacked above text, ~150–180px tall, full-width or 80% width. Same content order, single column.

Background can stay subtle (theme gradient or a soft shape behind the character) — the character is the visual hero.

### Risk flags before any commitment

1. **Coverage gap (HIGH)** — `lib/archetypes.ts` has ~36 archetypes. Only 23 images. We need a mapping table or we'll have an inconsistent experience: some users see character art, others see emoji. Either get art for the rest, or treat character art as a "supporter tier" easter egg for now.
2. **Filename mapping (HIGH, easy fix)** — UUIDs make it impossible to know which character is which without opening all 23. Brady should rename or add a sidecar JSON before any integration.
3. **Tone audit (MEDIUM)** — "roast" archetypes (Hoarder, Bargain Hunter, Quitter) need characters that read warm + self-aware, not slumped/ashamed. Voice charter says we roast WITH the user, not AT them.
4. **Mobile payload (MEDIUM)** — 1–2 MB per character is heavy. Convert to WebP or AVIF, lazy-load on the modal open, target ~150 KB per image at the rendered size.
5. **Theme contrast (LOW)** — verify against Void / 80s / Future themes before shipping; current art looks legible on dark backgrounds based on samples reviewed.

### Recommended next step (deferred — your call)

A real visual prototype needs **one decision from Brady first:** which UUID file maps to which archetype. Once that mapping exists, a prototype modal at e.g. `/prototype/archetype-modal` (unlinked dev route) takes ~30 min to build with one real character + one real archetype's data. Without the mapping I'd be guessing which file is the Enthusiast vs the Hoarder.

If Brady wants to skip the mapping work and just see a layout sanity check, I can build the prototype with a placeholder character box ("[character goes here]") so the geometry can be inspected — that's ~15 min. Either way, deferred to next session unless explicit go.

**Verdict:** the art is good enough to be worth shipping IF coverage and filename mapping get resolved. Don't half-ship — character art on 23/36 archetypes will feel weird. Either go all-in (commission/generate the missing 13) or hold for a "Supporter tier" cosmetic perk later.
