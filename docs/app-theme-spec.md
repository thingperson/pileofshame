# App Theme Spec: Landing Page Alignment

**Date:** 2026-05-08
**Status:** Draft / research only
**Author:** Claude (research agent)

---

## 1. Scope Summary

**What we're changing:** The main app interface (everything the user sees after import/library load) to adopt the cream/pink/cyan warmth of the LandingPageV2 design.

**What we're NOT changing:**
- `LandingPageV2.tsx` — self-contained, already has its own `C` constants object. Excluded.
- `app/about/page.tsx` — separate page, excluded.
- OG image routes (`app/pile/`, `app/clear/`) — server-rendered, separate concerns.
- The 90s, 80s, and Future theme variants (discussed in section 6).

**What this means in practice:** The default dark-navy app (`--color-bg-primary: #0a0a0f`) becomes a warm light theme derived from the landing page's cream palette (`#F5F0EB`). Every component that currently assumes a dark background needs to work on light.

---

## 2. Token Mapping

The landing page's `C` constants object defines the source palette:

| Landing `C` key | Hex | Role |
|---|---|---|
| `cream` | `#F5F0EB` | Page background |
| `creamDark` | `#EDE8E3` | Elevated/card background |
| `white` | `#FFFFFF` | Card surface |
| `textDark` | `#1a1a1a` | Primary text |
| `textMuted` | `#555555` | Secondary text |
| `textFaint` | `#6b6b6b` | Dim text (4.71:1 on cream) |
| `pink` | `#E91E63` | Primary accent (CTA) |
| `cyan` | `#00BCD4` | Secondary accent |
| `cyanDark` | `#006D75` | AA-compliant cyan on cream (5.38:1) |
| `purple` | `#7c3aed` | Tertiary accent |
| `dark` | `#0c0c12` | Nav CTA button bg |
| `cardDark` | `#131319` | (unused in light context) |

### Proposed default theme token changes

| Token | Current (dark) | Proposed (cream) | Notes |
|---|---|---|---|
| `--color-bg-primary` | `#0a0a0f` | `#F5F0EB` | Landing cream |
| `--color-bg-card` | `#111118` | `#FFFFFF` | White cards on cream |
| `--color-bg-elevated` | `#1e293b` | `#EDE8E3` | Slightly darker cream for modals/dropdowns |
| `--color-border-subtle` | `#232333` | `#D9D3CC` | Warm grey border (~cream darkened) |
| `--color-border-active` | `#3d4f63` | `#E91E63` | Pink accent for active borders |
| `--color-text-primary` | `#f8fafc` | `#1a1a1a` | Landing textDark |
| `--color-text-secondary` | `#e2e8f0` | `#2d2d2d` | Slightly lighter than primary |
| `--color-text-muted` | `#b0bec9` | `#555555` | Landing textMuted |
| `--color-text-dim` | `#8896a7` | `#6b6b6b` | Landing textFaint |
| `--color-text-faint` | `#7e8fa0` | `#888888` | Lightest readable text (verify 4.5:1 on cream) |
| `--color-accent-purple` | `#a78bfa` | `#7c3aed` | Darker purple needed for light bg (matches landing) |
| `--color-accent-pink` | `#f9a8d4` | `#E91E63` | Landing pink |

### Ambient background effect

Current `body::before` uses purple/pink radial gradients at ~4-6% opacity on dark. Replace with:
- Subtle pink radial at ~3% opacity top-right
- Subtle cyan radial at ~2% opacity bottom-left
- Both on `#F5F0EB` base

### Scrollbar

Current: `#334155` thumb on transparent track. Proposed: `#C5BFB8` thumb on transparent track (warm grey, visible on cream).

---

## 3. Component Audit

28 of 44 component files have hardcoded dark-assumption colors (`#0a0a`, `#1111`, `rgba(0,0,0`, `white/`, or `rgba(255,255,255`). Listed below with occurrence count and what needs changing.

### High-impact (complex, many hardcoded colors)

| File | Occurrences | What needs changing |
|---|---|---|
| **GameCard.tsx** (1480 lines) | ~6 | `rgba(255,255,255,0.06)` progress bar bg, `rgba(255,255,255,0.08)` achievement bar, hardcoded `#22c55e`/`#a78bfa` status colors, `rgba(167,139,250,0.08)` re-entry panel bg. All `white/` opacity patterns assume dark bg. |
| **Reroll.tsx** | ~9 | Heavy use of `white/5`, `white/10`, `bg-white/10` for hover states, `rgba(255,255,255,0.05)` pill backgrounds, `rgba(255,255,255,0.06)` borders. All need inversion to dark-alpha on light bg. |
| **CompletionCelebration.tsx** | ~9 | `rgba(0,0,0,...)` backdrop/overlay, confetti colors (fine on any bg), likely modal background assumptions. |
| **GridCard.tsx** | ~2+ | Dark bg assumptions for card surfaces, `white/` hover states. |
| **StatsPanel.tsx** | ~1+ | Dark bg assumptions for stat cards. |
| **StatsShareComposer.tsx** | ~4 | Generates share images with hardcoded dark backgrounds. May need separate treatment (share cards could stay dark). |

### Medium-impact (modals with dark overlays)

| File | Occurrences | What needs changing |
|---|---|---|
| **SettingsMenu.tsx** | ~2 | `rgba(0,0,0)` backdrop, dark card assumptions |
| **AddGameModal.tsx** | ~1 | Modal bg/overlay |
| **PSNImportModal.tsx** | ~3 | Modal bg/overlay, dark input styling |
| **SteamImportModal.tsx** | ~4 | Modal bg/overlay |
| **SteamWishlistModal.tsx** | ~3 | Modal bg/overlay |
| **PlayniteImportModal.tsx** | ~2 | Modal bg/overlay |
| **GetStartedModal.tsx** | ~1 | Modal bg |
| **HelpModal.tsx** | ~1 | `white/` patterns |
| **GameDetailModal.tsx** | ~1 | `white/` patterns |
| **GamePassBrowse.tsx** | ~4 | `white/` hover states |

### Low-impact (1-2 small changes)

| File | Occurrences | What needs changing |
|---|---|---|
| **AuthButton.tsx** | ~2 | Small dark color refs |
| **TabNav.tsx** | ~1 | `white/` hover |
| **ViewToggle.tsx** | ~2 | `white/` hover |
| **ImportHub.tsx** | ~1 | `white/` pattern |
| **PostImportSummary.tsx** | ~1 | `white/` pattern |
| **JustFiveMinutes.tsx** | ~1 | `rgba(255,255,255)` |
| **FinishCheckNudge.tsx** | ~1 | `rgba(255,255,255)` |
| **StalledGameNudge.tsx** | ~1 | `rgba(255,255,255)` |
| **ValueCalculator.tsx** | ~1 | `rgba(255,255,255)` |
| **GameSearch.tsx** | ~1 | `white/` pattern |
| **XboxImportModal.tsx** | ~2 | `white/` patterns |

### Not affected

These components have no hardcoded color assumptions or are excluded:
- `LandingPageV2.tsx` (excluded from scope)
- `LandingPageClassic.tsx` (excluded)
- `Wordmark.tsx`, `PixelSprite.tsx`, `ArchetypeCard.tsx`, `CloudSync.tsx`, `CookieBanner.tsx`, `EnrichmentIndicator.tsx`, `FeedbackWidget.tsx`, `NinetiesMode.tsx`, `OnboardingWelcome.tsx`, `SampleImportNudge.tsx`, `StayInTouch.tsx`, `SyncNudge.tsx`, `Toast.tsx`, `StatCard.tsx`

### page.tsx (app shell)

`app/page.tsx` (1067 lines) is the main shell. It uses Tailwind token classes (`bg-bg-card`, `text-text-primary`, etc.) throughout, so it should largely adapt through token changes alone. The `InlineSearch` component within it uses `bg-bg-card`, `border-border-subtle`, `text-text-primary` — all token-driven. Main risk: the `hover:bg-white/5` patterns scattered throughout.

---

## 4. Status Colors

Status pill colors need to shift from "bright on dark" to "medium-saturated on light." The existing `theme-light` block in globals.css already has a working set:

| Status | Current fg / bg | Proposed fg / bg | Source |
|---|---|---|---|
| Backlog (buried) | `#64748b` / `#1e293b` | `#6b7280` / `#f3f4f6` | Existing light theme |
| Up Next (on-deck) | `#38bdf8` / `#082f49` | `#2563eb` / `#dbeafe` | Existing light theme |
| Playing Now | `#f59e0b` / `#422006` | `#d97706` / `#fef3c7` | Existing light theme |
| Completed (played) | `#22c55e` / `#052e16` | `#16a34a` / `#dcfce7` | Existing light theme |
| Moved On (bailed) | `#ef4444` / `#450a0a` | `#dc2626` / `#fee2e2` | Existing light theme |

These are solid starting points. They may need slight warmth adjustment to sit better on cream vs cool grey (`#f4f5f7`). Test the pill bg colors against `#F5F0EB` — the cool pastels could clash with warm cream.

### Vibe colors

The mood/vibe tag colors (`--color-vibe-*`) also need darkening for light bg contrast. Current values are pastel (designed for dark). Proposed:

| Vibe | Current | Proposed |
|---|---|---|
| Cozy | `#f9a8d4` | `#db2777` |
| Narrative | `#93c5fd` | `#2563eb` |
| Atmospheric | `#a78bfa` | `#7c3aed` |
| Challenge | `#f87171` | `#dc2626` |
| Mindless | `#fbbf24` | `#d97706` |
| Philosophical | `#34d399` | `#059669` |

All proposed values need WCAG AA verification against cream (`#F5F0EB`).

---

## 5. Alternative Themes

### Current state

Four alternative themes exist in `globals.css`:
1. **90s (Geocities)** — dark navy bg `#000080`, grey cards `#c0c0c0`, Comic Sans
2. **80s (Synthwave)** — deep purple bg `#0d0221`, neon pink/purple
3. **Future (Holographic)** — near-black bg `#05080f`, cyan/magenta
4. **Light** — cool grey bg `#f4f5f7`, white cards (already exists!)

### Recommendation

**Keep all four alternative themes as-is.** They are intentionally stylized. The 90s, 80s, and Future themes are dark by design (that's their aesthetic identity). The existing Light theme is a cool-grey variant.

The proposed change replaces the **default** theme only. The existing Light theme becomes redundant or could be renamed to "Cool Light" if the new warm default is different enough to warrant keeping both.

**Option A (simpler):** Replace the default theme tokens. Remove the existing `.theme-light` class. The new default IS the light theme. Three dark alternates remain.

**Option B (preserve choice):** Keep both dark and cream as selectable. Add "Cream" as a theme option, keep current dark as "Midnight" (or "Dark"), keep existing Light as "Cool Light" or remove it.

**Recommendation: Option B.** Existing users chose dark. Forcing light on them without a toggle is hostile. Ship cream as the new default for new users, but let existing users keep dark.

---

## 6. Risk Areas

### Tier 1: Hardest

| Area | Why it's hard | Est. effort |
|---|---|---|
| **GameCard.tsx** (1480 lines) | Biggest component. Inline styles scattered across 15+ UI states (expanded/collapsed, status variants, progress bars, re-entry panels, achievements). Every `rgba(255,255,255,...)` pattern needs conditional or token-based replacement. | L |
| **Reroll.tsx** | Mood pills, session length pills, result card — all use white-alpha for glass effects. These need to become dark-alpha on cream. The pill border/bg system is particularly fiddly. | M-L |
| **CompletionCelebration.tsx** | Full-screen overlay with backdrop, confetti, stats display. The celebratory moment is the crown jewel of the app — can't ship it looking off. | M |
| **`white/` → `black/` global pattern** | ~28 components use Tailwind `white/5`, `white/10` etc. for hover/focus states. On a light bg these are invisible. Need systematic replacement with `black/5`, `black/10` etc. Risk: the 90s/80s/Future dark themes break if we change these unconditionally. **Solution:** these need to be theme-aware (CSS variable or Tailwind dark: prefix). | L (systemic) |

### Tier 2: Medium complexity

| Area | Why | Est. effort |
|---|---|---|
| **All modal components** (8 files) | Shared pattern: dark backdrop + dark card bg. Straightforward but repetitive. | M (batch) |
| **StatsShareComposer.tsx** | Generates images. May need to stay dark or support both. | S-M |
| **GridCard.tsx** | Card variant with similar patterns to GameCard but smaller. | M |
| **`body::before` ambient gradients** | Current purple/pink on dark. Needs redesign for cream bg. | S |
| **Now-playing glow** | `.now-playing-glow` in globals.css uses amber glow on dark — amber on cream may be too subtle. | S |

### Tier 3: Systemic

| Area | Why | Est. effort |
|---|---|---|
| **Scrollbar styling** | Hardcoded in globals.css. Needs warm-grey treatment. | S |
| **Focus-visible outline** | Currently purple (`--color-accent-purple`). If accent shifts to pink, this follows automatically. Verify contrast. | S |
| **Tab-flash / row-pulse animations** | Use hardcoded `rgba(167, 139, 250, ...)` — purple glow on dark. On light bg the glow effect vanishes. Needs stronger opacity or different approach (border flash instead of shadow). | S-M |

---

## 7. Recommended Approach

### Ship as a theme toggle, not a replacement

**Rationale:**
1. Existing users chose dark. Forcing a light default without escape is hostile (reactance theory, locked in user-psychology.md).
2. The dark theme works. Nothing is broken about it. This is additive.
3. The alternative themes (90s, 80s, Future) all assume a dark base. A theme toggle sidesteps having to make every alternative work on both light and dark.
4. New users can get cream as default. Existing users keep dark.

**Implementation:**
1. Add a `theme-cream` class to `globals.css` (alongside `theme-90s`, `theme-80s`, etc.) with the proposed token values.
2. Make cream the default for new users (no theme class = cream, or set it in onboarding).
3. Existing users with no explicit theme preference keep dark (could detect via localStorage migration).
4. The `white/` → `black/` problem becomes scoped: add `.theme-cream` overrides where needed rather than changing every component. Or use CSS custom properties for glass-effect opacities.

**Alternative considered: replace the default, add dark as a toggle.** This is simpler CSS-wise but breaks the experience for every existing user on their next visit. Not recommended.

### Glass effect strategy

The pervasive `white/5`, `white/10`, `rgba(255,255,255,0.05)` pattern is the single biggest systemic issue. Options:

**A. CSS custom property for glass:** Define `--color-glass-subtle: rgba(255,255,255,0.05)` in the default theme, override to `rgba(0,0,0,0.04)` in cream. Then replace hardcoded values with the variable. Highest upfront cost, cleanest long-term.

**B. Tailwind dark: prefix:** Use `dark:bg-white/5 bg-black/5` pattern. Requires adding Tailwind dark mode support. Moderate effort, well-understood pattern.

**C. `.theme-cream` CSS overrides:** Keep component code as-is, override in globals.css with `.theme-cream .white\/5 { ... }`. Fragile and unmaintainable. Not recommended.

**Recommendation: Option A (CSS custom properties).** Add these to the `@theme` block:

```
--color-glass-subtle: rgba(255,255,255,0.05);   /* hover bg, pill bg */
--color-glass-medium: rgba(255,255,255,0.10);    /* active bg */
--color-glass-border: rgba(255,255,255,0.08);    /* subtle dividers */
--color-glass-overlay: rgba(0,0,0,0.5);          /* modal backdrops */
```

Then override in `.theme-cream`:

```
--color-glass-subtle: rgba(0,0,0,0.04);
--color-glass-medium: rgba(0,0,0,0.07);
--color-glass-border: rgba(0,0,0,0.08);
--color-glass-overlay: rgba(0,0,0,0.3);
```

This also fixes the pattern for future themes.

---

## 8. Estimated Effort

| Area | T-shirt size | Notes |
|---|---|---|
| **Token mapping in globals.css** (new `.theme-cream` block + glass variables) | S | ~1 session. Mostly copy from existing `.theme-light` + landing C values. |
| **GameCard.tsx** hardcoded colors → tokens | L | ~2 sessions. 1480 lines, 15+ inline style sites. Must test every state. |
| **Reroll.tsx** glass effects → tokens | M | ~1 session. Pill system is the main complexity. |
| **CompletionCelebration.tsx** | M | ~1 session. Overlay + confetti + stats layout. |
| **Modal components** (8 files, batch) | M | ~1 session. Mostly mechanical: backdrop + card bg. |
| **GridCard.tsx** | S-M | ~0.5 session. |
| **`white/` → glass token** migration (28 files) | L | ~2-3 sessions. Systemic find-and-replace with testing. |
| **Status/vibe color tuning** | S | ~0.5 session. Contrast verification on cream. |
| **Animations (tab-flash, row-pulse, glow)** | S | ~0.5 session. |
| **QA / visual regression** | M-L | ~2 sessions. Every view, every status, every theme combo. |
| **Settings UI** (theme selector update) | S | ~0.5 session. Add "Cream" option. |

**Total estimate: ~10-12 focused sessions (M-L project).**

The critical path is: tokens + glass variables (S) → GameCard (L) → Reroll (M) → modals (M) → systemic white/ migration (L) → QA (M-L).

### Phasing recommendation

**Phase 1:** Ship the token block + glass custom properties. Add theme-cream class. Wire the toggle. Test on a few simple components first (TabNav, ViewToggle, AuthButton). This validates the approach.

**Phase 2:** Migrate GameCard, Reroll, CompletionCelebration. These are the components users see most. Ship when these three look right.

**Phase 3:** Modals batch, remaining components, QA sweep. Polish pass on animations and glows.

Each phase is independently shippable. Phase 1 could land in 1-2 sessions.

---

## Open Questions

1. **Should StatsShareComposer-generated images stay dark?** Share cards are designed for social media previews where dark looks better. Probably yes — keep them dark regardless of app theme.
2. **Default for new users:** Cream or dark? Landing page sets the visual expectation of cream, so cream default for new users makes sense. Existing users keep whatever they had.
3. **Existing Light theme:** Remove it, keep it as "Cool Light," or merge its values into cream? It's cool-grey (`#f4f5f7`) vs warm-cream (`#F5F0EB`). Different enough to warrant both? Probably not — one light variant is enough.
4. **Now-playing glow on cream:** Amber glow on cream is low-contrast. May need a different treatment (pink glow? stronger shadow?).
5. **Cover art / game images:** These have arbitrary colors. On dark bg they float naturally. On cream, they may need subtle borders or shadow to separate from the background. Test with a variety of cover art colors.
