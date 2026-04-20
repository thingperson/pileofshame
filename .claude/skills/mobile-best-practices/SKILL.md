---
name: mobile-best-practices
description: Audit the app against mobile best practices — iOS Safari + Android Chrome. Covers viewport/safe area, touch interactions, iOS/Android quirks, performance, PWA readiness, offline considerations, text legibility, and form UX. Use when doing mobile polish sprints, testing on real devices, or verifying a mobile-affecting change.
---

# Mobile Best Practices — Inventory Full

The app is mobile-first. Primary use case is **phone in hand, in front of a console/PC**. Desktop works; mobile is the design target.

## Modes

- **Full audit (~45 min)** — every category below, both iOS Safari + Android Chrome
- **Change-scoped audit (~15 min)** — only surfaces touched by current diff
- **Device-specific audit** — iOS-only or Android-only deep dive (e.g. after an iOS 18 update)

## Scope

### A. Viewport + safe area

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` set in `app/layout.tsx`?
- `env(safe-area-inset-*)` honored on landing / top nav / bottom action bars (notch + home indicator)
- **`100dvh` not `100vh`** — iOS Safari's dynamic viewport fix. Already applied to Reroll modal per ROADMAP. Verify no other offenders.
- Keyboard open state: inputs should not push layout above the fold; sticky action bars should move above keyboard (`interactive-widget=resizes-content`)

### B. Touch interactions

- Every tappable element **≥44×44 px** (WCAG 2.5.5)
- No `:hover`-only affordances (hover doesn't exist on touch)
- Avoid `onClick` on `<div>` — use `<button>` so touch events work cleanly + a11y
- Swipe gestures only where meaningful — nav via taps, not mystery swipes
- No accidental double-tap zoom: `touch-action: manipulation` on primary action buttons
- Tap target **spacing** ≥ 8 px between adjacent targets (avoids misclicks)

**Priority surfaces:** GameCard (has nested tappable sub-buttons — verify no target overlap), Reroll action buttons, status badge tap-to-advance, SettingsMenu accordion triggers.

### C. iOS Safari quirks

- **dvh units** for full-height elements (already applied in Reroll)
- **Input font-size ≥ 16px** prevents auto-zoom on focus. Verify search, AddGame, Xbox gamertag, PSN ID inputs.
- **Momentum scrolling:** `-webkit-overflow-scrolling: touch` (mostly default now, verify for any clipped scroll containers)
- **Back-swipe gesture** — test browser-back doesn't interfere with modal dismiss; consider `history.pushState` for important modal states so back closes them intuitively
- **PWA quirks** — iOS homescreen PWA runs in "standalone" mode. Detect via `window.matchMedia('(display-mode: standalone)')`. No service worker restrictions that didn't already exist.
- **Date/time inputs** — iOS shows native picker, style accordingly

### D. Android Chrome quirks

- `<meta name="theme-color">` matches current theme — browser chrome tints correctly
- **Android home-screen install** banner (auto-suggested when manifest criteria met)
- **Autofill** — input types correct (email, tel, url) so password managers work
- `<meta name="mobile-web-app-capable" content="yes">` for full-screen standalone mode

### E. Performance

- **LCP** (Largest Contentful Paint) < 2.5s — usually the hero image or first card cover. Use `priority` on above-fold next/image, lazy-load the rest.
- **INP** (Interaction to Next Paint) < 200ms — no jank on status tap, mood chip tap, reroll roll
- **CLS** (Cumulative Layout Shift) < 0.1 — reserve space for cover art, fonts with `font-display: optional` or preload
- Image sizes appropriate for mobile (don't ship desktop-sized covers)
- Avoid render-blocking scripts — inline critical CSS, defer rest

### F. PWA readiness (see also `docs/pwa-explainer-2026-04-20.md`)

- `public/manifest.json` has: name, short_name, start_url, display: standalone, theme_color, background_color, icons (192, 512, maskable)
- iOS uses `apple-touch-icon` — separate from manifest icons
- Android uses maskable icons — verify one exists
- Splash screens for iOS (meta tags per size) — nice to have, not critical
- **No service worker yet** — that's Tier 2 per PWA explainer; deferred

### G. Offline considerations

Even without a service worker, think about graceful degradation:
- localStorage is authoritative — most of app works offline once loaded
- API calls (RAWG, HLTB, Supabase) fail silently and surface a toast instead of breaking
- "You're offline — picks still work from your library" kind of messaging if detected
- Don't BLOCK core loop on network. Pick-from-local must always work.

### H. Text legibility

- Base font-size ≥ 16px (reading distance on mobile is ~10in, smaller than desktop)
- Line-height 1.4–1.6 for body text
- Max line length (measure) 45–75 chars — check landing copy blocks on narrow phones
- Sufficient padding on interactive text (not cramped against edges)

### I. Form UX

- `type="email"` — email keyboard
- `type="tel"` — number keyboard for phone
- `type="search"` — rounded + clear button on iOS
- `inputmode="numeric"` — numeric keyboard without the tel formatting
- `autocomplete="off"` only when necessary (password managers matter)
- `autocomplete="email"` / `autocomplete="current-password"` / `autocomplete="new-password"` for auth flows
- Autofocus sparingly — opens keyboard immediately, can be jarring on slow devices

### J. Gestures + navigation patterns

- No custom hamburger menu if a bottom bar works better (thumb reach)
- Action confirmations accessible with thumb (bottom 60% of screen, not top)
- Tab bar if primary nav has 3+ destinations
- Pull-to-refresh on list surfaces? — decide per surface, not globally

## Process

1. **Read scope.** Full / changed-files / device-specific.
2. **Verify manifest.** Read `public/manifest.json` + `app/layout.tsx` viewport meta + apple-touch icons.
3. **Grep for anti-patterns:**
   - `onClick` on `<div>` or `<span>` → candidates for `<button>`
   - `100vh` → should be `100dvh` on mobile-relevant elements
   - `:hover` without focus-visible equivalent
   - Fixed widths that'd break below 320px
4. **Preview on mobile viewport.** Use preview MCP `preview_resize` to 375×667 (iPhone SE) and 390×844 (iPhone 14) and 360×800 (Android baseline). Screenshot each primary surface.
5. **Check touch targets.** Inspect computed padding on status badges, icon buttons, X-close buttons.
6. **Report.** Per-category, with severity + file:line + fix suggestion.

## Severity rubric

- **Critical:** breaks mobile experience (text zoomed-in on input focus, action bar blocked by keyboard, tap target unreachable). Fix immediately.
- **Serious:** noticeable degradation (tap target < 40px, LCP > 4s on 4G, viewport overflow). Fix this sprint.
- **Moderate:** suboptimal (hover-only affordance, missing theme-color). Next sprint.
- **Minor:** polish (missing splash screen). Backlog.

## Known state (as of 2026-04-20)

- **Shipped:** bottom-sheet Reroll modal with sticky action buttons (Apr 14), 100dvh for Reroll (Apr 14), tap-targets mobile sweep (Apr 12), iOS Safari icon fix (Apr 9).
- **PWA Tier 1 live.** Manifest + icons wired. No service worker.
- **Not audited recently:** input font-size ≤ 16px audit, GameCard nested-target overlap, android theme-color per-theme binding, LCP measurement on real device.
- **Deferred:** service worker (PWA Tier 2), push notifications (PWA Tier 3).

## Example invocations

- "Run the mobile best practices audit" → full
- "Mobile check on what I just changed" → changed-files
- "Audit just iOS Safari" → device-specific
- "Mobile sweep before deploy" → changed-files, deploy-gate integration

## Integration

- Call on demand before shipping a mobile-affecting change
- Pair with `/accessibility-review` — they overlap on touch targets + motion prefs but cover different ground otherwise
- Should become part of `/pre-push-review` when the next expansion happens

## References

- `docs/pwa-explainer-2026-04-20.md` — PWA tier decisions
- `AGENTS.md` — primary use case is mobile, design for that first
- `.claude/rules/deploy-gates.md` — a11y + voice gates
