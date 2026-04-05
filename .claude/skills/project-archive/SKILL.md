---
name: project-archive
description: Full build history, completed features, competitive analysis, naming history, blue sky ideas, and phase 3-5 plans. Use /project-archive when you need historical context about what was built and why.
disable-model-invocation: true
---

# Inventory Full — Complete Build Archive

## Context
Gaming backlog matchmaker. Live at **pileofsha.me**, deployed on Vercel free tier. The core loop: **Import → Tell us your mood → We find your game → Play → Celebrate**. The app does the categorization work, not the user.

## Build Location
`~/Desktop/getplaying`

## Stack
- Next.js 14+ (App Router), TypeScript, Tailwind CSS v4
- Zustand (state + localStorage persistence)
- Fonts: Outfit (display/body) + JetBrains Mono (labels/badges)
- Dark theme only (exact colors from brief, bumped for legibility)
- CheapShark API (prices), HowLongToBeat (completion times), RAWG (game search/metadata)

---

## Phase 1 — MVP (COMPLETE)

### 1. Scaffold ✅
- Next.js App Router + TypeScript + Tailwind + Zustand + UUID
- Google Fonts (Outfit + JetBrains Mono)
- Dark theme globals with CSS variables
- Root layout with max-width 960px, ambient radial gradients

### 2. Types & Constants ✅
- `lib/types.ts` — Game (with rating, completedAt), RerollState, LibraryState
- `lib/constants.ts` — categories, vibes, statuses, colors, time tiers

### 3. Zustand Store ✅
- Full LibraryState with localStorage persistence
- Actions: addGame, updateGame, cycleStatus, setBailed, unBail, playAgain, newGamePlus
- Filters, Reroll state, Category management
- Celebration state (global, survives GameCard unmount)
- Cloud sync via Supabase

### 4. Game Cards ✅
- Compact view: status badge + name + tier icon + source icon
- Status tap-to-cycle with hover ghost preview + chevron hint
- Expand: cover art, notes (editable), vibes, category, time tier, Launch button, deals
- Played: "Replay" + "New Game+ / DLC" buttons
- Bailed: "Give it another shot?" button
- Long-press: "Bail?" action

### 5. Category Sections ✅
- Collapsible with game count, large headers (text-lg font-bold)

### 6. Manual Add ✅
- Name, source, category, vibes, time tier, notes

### 7. Filter Bar ✅
- Search, category, vibe, time tier, show/hide played + bailed

### 8. Reroll (Hero Feature) ✅
- 4 modes: Anything, Quick Session, Deep Cut, Continue
- Cover art hero image in reveal card
- Dramatic reveal animation (scale-in 400ms + backdrop blur)
- Abuse protection: toasts at rolls 3, 5, 7; forced 3-card choice at roll 10
- Direct mode buttons on main page (Quick Session / Deep Cut / Keep Playing)

### 9. Toast System ✅
- Status changes, reroll messages, game added, replay messages

### 10. Data Backup ✅
- Export/Import JSON via Settings menu

### 11. Empty State ✅
- "Nothing here yet." + Add Game CTA + Import CTA

### 12. Responsive Polish ✅
- Mobile-first, snappy animations
- Text legibility audit — all CSS color variables bumped brighter

### 13. Main Page Assembly ✅
- Header with tagline, stats bar, filter bar, hero Reroll CTA
- Up Next section, Category sections, Cleared section

---

## Phase 2 — Post-MVP Features (COMPLETE)

### 14. Import Hub ✅
- Steam import (via Steam Web API)
- RAWG game search with auto-complete
- Xbox/Game Pass import
- CSV import

### 15. Stats Panel ✅
- Victory row: Cleared, Now Playing, Streak, Hours Logged
- Shame row: Backlog, Bailed, Oldest, Total
- Shame Dollar Calculator (CheapShark prices, progressive caching, confidence bars)
- Time to Clear Backlog (HowLongToBeat, progressive caching)
- Background enrichment in batches with live-updating estimates
- Share buttons: Twitter / Reddit / Discord (platform-specific formatting)

### 16. Completion Celebration ✅
- Two-stage modal: confirm ("You beat X?") → celebrate (confetti + stats + rating)
- Canvas-based confetti (120 particles)
- Stats impact display (cleared count, backlog remaining, hours invested)
- Star rating (1-5) with personality copy per star level
- DLC / New Game+ nudge
- CTA: "Show Me My Cleared List" (scrolls to section)
- State lifted to Zustand store (fixes unmount bug)

### 17. Up Next Section ✅
- Dedicated section for Now Playing + On-Deck queue
- Empty state prompt explaining how to queue games

### 18. Cleared Section (Hall of Fame) ✅
- Open by default, sorted by most recently completed
- Average rating display
- Collapsed: green chips with star ratings
- Scrollable from header stats bar

### 19. Player Archetype System ✅
- `lib/archetypes.ts` — 15+ behavioral personality types
- Roasts: Pure Collector, The Hoarder, The Dabbler, The Quitter, The Juggler, The Archaeologist, The Window Shopper
- Respect: Backlog Zero, The Completionist, The Sniper, The Redeemer
- Neutral: The Critic, The Enthusiast, The Deep Diver, The Balanced Gamer
- Fallback: The Gamer
- Re-roll ("Read me again") when multiple archetypes match
- Integrated into StatsPanel with tone-based styling

### 20. Cloud Sync ✅
- Supabase auth (magic link)
- Real-time sync across devices

### 21. View Toggle ✅
- List view / Grid view

### 22. Deal Badges ✅
- CheapShark price lookup per game in expanded card

### 23. Help Modal ✅

### 24. PWA Support ✅
- Web manifest, icons

### 25. SEO ✅
- OpenGraph image, sitemap, robots.txt

### 26. 90s Mode (Easter Egg) ✅

### 27. Visual Themes ✅
- 6 themes: Dark, Light, 80s Synthwave, 90s Geocities, Future Holographic, Dino
- CSS custom property overrides via body class
- Theme-specific chrome (banners, footers, particles, cursor trails)
- Light mode legibility fixes

### 28. Game Descriptors ✅
- ~100 curated game descriptors with hand-written one-liners
- Score-based descriptors (metacritic ranges → personality copy)
- Genre-aware fallbacks for RPG, roguelike, puzzle, horror, etc.
- Edition detection (Deluxe, GOTY, Ultimate) with layered nudges
- Duplicate game detection across platforms

### 29. Cleared Section Hall of Fame ✅
- 10-level rank system (Pile Initiate → Marie Kondo of Gaming)
- XP-style progress bar to next rank
- Stats grid: Cleared, Pile Progress %, This Month, Value Reclaimed
- Share buttons (Twitter/Reddit/Discord)

### 30. Bail as Eject Action ✅
- Visible 🚪 Bail button separate from status cycle
- Confirmation flow with "Bail for real?" prompt

### 31. Steam Playtime Refresh ✅
- `action=playtime` API endpoint returns full playtime map
- Linked Steam ID persisted in store
- "🔄 Refresh Steam Hours" button in Settings
- Handles missing Steam ID with inline prompt
- Auto-resolves vanity URLs

### 32. Expanded Card UX Overhaul ✅
- Category dropdown labeled "Shelf" with tiny label
- Time tier: 2 → 4 tiers (⚡ Quick Hit, 🌙 Wind-Down, 🔥 Deep Cut, 🏔️ Marathon)
- Time tier changed from cycle-button to proper dropdown
- DealBadge auto-fetches on card expand (no more "Check deals" dead text)
- Deal display: exciting copy ("🚨 Steal alert!", "🔥 Seriously discounted") + clickable "Grab it →" link
- Replay/New Game+ buttons redesigned as clear CTAs ("🔥 Replay?", "🎯 DLC / New Game+?")
- Notes auto-save with "saved ✓" indicator
- 2 new default categories: Brain Off 🧹, The Shame Wall 😬
- Store migration v2 adds new categories for existing users

### 33. Grid Card Visual Polish ✅
- Game title: text-xs → text-sm font-semibold
- Genre text: text-[10px] → text-xs
- Status badge: text-[10px] → text-xs with bigger padding

### 34. PlayStation Import ✅
- PSN NPSSO token auth flow via `psn-api` npm package
- Step-by-step user instructions (log in → visit URL → copy token)
- Server-side API route `/api/psn` handles auth exchange
- Fetches full game library with trophy data
- Shows platform, trophy count, progress %, platinum status
- Games with 100% progress auto-marked as played
- Wired into ImportHub (PlayStation now "available", not "manual")

### 35. Search-to-Add ✅
- When search filter finds no results, shows "Add [query] to your pile?" CTA
- Opens AddGameModal for quick game addition from search

### 36a. Auto-Enrichment on Import ✅
- `useAutoEnrich` hook watches for unenriched games, triggers background enrichment after any import
- 2-second debounce prevents firing during bulk imports, rate limited (300ms between games, 1s every 5)
- `EnrichmentIndicator` component shows progress bar while running
- `enrichmentProgress` transient store field (not persisted)
- Existing "Smart Enrich" in Settings still works as manual fallback

### 36b. Grid View Detail Panel ✅
- `GameDetailModal` — slide-up on mobile, centered on desktop, renders `GameCard` in `forceExpanded` mode
- Full detail experience: descriptions, mood tags, deals, editing, status actions, celebration flow
- Focus trapping, Escape-to-close, body scroll lock
- `slideUp` CSS animation for mobile sheet feel

### 36c. Play Next Onboarding ✅
- Smart suggestion when Play Next queue is empty
- Scores candidates by: enrichment completeness, metacritic, HLTB length, cover art
- Randomizes from top 5 to keep suggestions fresh
- Shows cover art, description/metacritic, HLTB time
- One-click "🎯 Add to Play Next" button

### 36d. Status Badge Discoverability ✅
- Pulse animation on status badges until user taps one
- "tap to advance →" text hint visible on cards
- localStorage flag `pos-status-tapped` tracks discovery
- Disappears permanently after first status cycle

### 36e. Shelve / Back to Pile ✅
- `shelveGame(id)` store action — returns `playing` or `on-deck` games to `buried` (backlog)
- "📚 Back to the pile" button in expanded card for playing/on-deck games
- Fixes dead-end where games in Now Playing had no way back except bail or delete

### 52. Shareable Stats Cards ✅
- `/api/share-card` API route generates themed 1200x630 PNG images via `next/og` (Satori)
- 5 theme-matched card designs: Default (dark), Receipt (80s), Polaroid (90s), Pixel (dino), Ultra (chartreuse)
- `ShareCard` component with Preview, Download PNG, Copy Image Link buttons
- **Independent theme selector**: users can choose card style separately from page theme (5 options with icons)
- Auto-refreshes preview when switching card themes
- Defaults to matching current page theme, overridable per-card
- Integrated into StatsPanel alongside existing text share buttons
- Stats shown: backlog count, cleared, bailed, hours, unplayed value, recovered value, hours to clear, exploration progress %, archetype rank

### 53. Onboarding Flow ✅ (Overhauled Apr 2026)
- **Original**: 2-step modal with benefit cards, progress bar, localStorage tracking
- **Current**: Single-screen stateless component. Renders when library is empty, unmounts when games exist. No localStorage needed.
- "Let's find your game." headline + "Import My Library" primary CTA + "Add a Game Manually" secondary
- Platform list shown below import button (Steam, PlayStation, Xbox, GOG, Playnite)
- Auto-pick: after first import, auto-opens Reroll modal (800ms delay) via useRef tracking prevGameCount
- No emoji-only buttons, no multi-step wizard, no "How does this work?" link

### 54. Microinteractions Pass ✅
- Staggered card entrance animations (`card-enter` with per-card delay in CategorySection + UpNextSection)
- Status badge pop animation keyframe (`badge-pop`)
- Global `button:active` scale-down press feedback
- Enhanced card hover lift (2px translate + shadow)
- Stat number entrance animation in StatCard
- CSS keyframes: `cardEnter`, `badgePop`, `countUp`

### 55. ULTRA Theme (Chartreuse) ✅
- Full theme rewrite from red (#ff0040) to chartreuse (#BFFF00)
- Black background, chartreuse accents, glowing text, sharp zero-radius edges
- Themed card borders, button hovers (chartreuse bg + black text), scrollbar, progress bars, input focus states

### 56. Duplicate Games Bug Fix ✅
- Games with `playing` or `on-deck` status excluded from category section grouping
- Prevents games from appearing in both UpNextSection and their category (e.g., "The Pile")

### 57. Grid Card Image Fix ✅
- Changed grid card aspect ratio from 3:4 (portrait) to 16:9 (landscape) to match Steam header images (460x215 ≈ 2.14:1)
- Eliminates heavy cropping that was cutting off game art titles and key visuals
- PSN images may still look different — Sony API returns small square icons (144x144), but RAWG enrichment overwrites with landscape `background_image` for most games

### 58. Voice & Terminology Fixes ✅
- StatsPanel: fixed banned "That's not X, that's Y" pattern
- ClearedSection: replaced banned word "journey" in progress copy
- Terms page: "categories" → "shelves" per terminology guide
- All theme chrome banners/footers renamed "PILE OF SHAME" → "INVENTORY FULL"
- Share card templates (pixel/dino, ultra/chartreuse) renamed to "INVENTORY FULL"

### 58b. Voice & Copy Expansion Pass ✅
- Rewrote 7 punching-down archetypes to tease+encourage (Pure Collector, Hoarder, Dabbler, Juggler, Archaeologist, Window Shopper, Balanced Gamer)
- Added 3 new archetypes: The Momentum Builder, The Bargain Hunter, The Night Owl
- Split action/shooter genre descriptor fallback (sword games no longer say "lots of shooting")
- Added ~30 new curated game descriptors (DMC5, MGSV, Dragon Age, Divinity, Dishonored, Hitman, etc.)
- Celebration subtitle randomized from 7 options (was static)
- FUN_CTAS expanded from 5 → 16 share options
- CLEARED_FUN_CLOSERS expanded from 5 → 12 options

### 58c. Sorting Fix ✅
- Rating sort: falls back to user rating (scaled 0-100) when no metacritic score
- Oldest/Newest sort: alphabetical tiebreaker for games with same `addedAt` timestamp (common in bulk imports)
- HLTB sort: alphabetical tiebreaker added
- Fixes issue where bulk Steam imports produced seemingly random order

### 58d. Mobile UX Improvements ✅
- Status badges always show text labels on mobile (added `shortLabel` field: "Play Next" → "Next", "Now Playing" → "Playing")
- Auto-scroll to Up Next section when game status changes to on-deck or playing
- "tap to advance" hint hidden on mobile (saves space)
- Toast styling improved: larger padding, bolder text, longer duration (2500 → 3200ms), purple accent border

### 58e. 90s Theme Legibility Fix ✅
- CSS overrides for bright text on navy background (white headings, #cccccc body text)
- Dark text restored inside grey cards to maintain contrast
- Yellow accent for stat numbers

### 59. Platform Visibility on Cards (TODO)
- Currently: GridCard shows tiny 9px "STM"/"PSN"/"XBX" in corner; GameCard shows platform only when expanded
- Needed: More prominent platform indicator, especially on Now Playing and Play Next shelves where users need to know what to boot up
- Priority: HIGH — directly affects the "close the app, go play" moment

### 60. Deploy Skill Upgrade ✅
- Full rewrite of `.claude/skills/deploy/SKILL.md` with project info, two deploy modes (full review vs quick push), review skill references, common pitfalls, and git workflow documentation

### 61. AI Lingo Sweep & Voice Guide Expansion ✅
- Expanded voice-and-tone.md Section 3 "Never sound like AI" from ~8 lines to comprehensive 5-layer framework
- Layers: vocabulary watchlists, sentence rhythm, structural patterns, emotional register, cognitive fingerprint
- Full banned word lists: verbs (delve, elevate, unlock, embark, craft), adjectives (groundbreaking, innovative, robust), nouns (tapestry, landscape, journey, paradigm), adverbs (meticulously, seamlessly)
- Banned structural patterns: em-dashes for dramatic pauses, "That's not X, that's Y", mic-drop closers, uniform paragraph length, hedging openers
- Swept 20+ copy violations across archetypes.ts, seedData.ts, enrichment.ts, descriptors.ts, HelpModal, PlayniteImportModal, JustFiveMinutes, terms page, GridCard
- Created `AI_LINGO_SWEEP_CHANGELOG.md` documenting all before/after changes

### 62. Mobile Chrome Reduction ✅
- Removed inline stats bar from header (playing/backlog/cleared/total/hrs)
- Moved SyncNudge from above filter area to below UpNext section
- Slimmed SyncNudge from 84px card to 51px single-line bar
- Tightened header margins: mb-6 space-y-3 → mb-4 space-y-2
- Reduced hero CTA size: py-5 → py-3.5 sm:py-4
- Replaced long tagline with "Stop scrolling. Get playing." (4 words, mono font)
- Net result: ~30% reduction in chrome above games on mobile

### 63. Status Badge UX Overhaul ✅
- Status badges redesigned from labels to buttons: ring-1 ring-white/10 border, hover:ring-white/25
- Added → arrow affordance for interactive badges (not shown on played/bailed)
- Mobile shows shortLabel, desktop shows full label
- Removed "tap to advance →" text hint (arrow makes it self-evident)
- GridCard badge also updated: rounded-lg, py-1.5, ring-1 ring-white/15

### 64. Mobile Button Overflow Fix ✅
- Shortcut buttons (Quick Session, Deep Cut, Keep Playing, Just 5 Min) changed from flex-1 to shrink-0
- Container uses overflow-x-auto for horizontal scroll on small screens
- Added scrollbar-hide CSS utility (globals.css)
- All buttons always show full text labels (removed hidden sm:inline patterns)

### 65. Reroll Mode Labels ✅
- Mode switcher pills changed from emoji-only to emoji + text label
- "🎲", "⚡", "🔮", "🔄" → "🎲 Anything", "⚡ Quick", "🔮 Deep Cut", "🔄 Continue"

### 66. DNS & Domain Verification ✅
- Confirmed inventoryfull.gg → 76.76.21.93 (Vercel CNAME working)
- Confirmed pileofsha.me → 301 redirect to inventoryfull.gg
- NEXT_PUBLIC_APP_URL=https://inventoryfull.gg set in Vercel env vars

### 67. Feature Creep Audit ✅
- Full audit documented in `docs/feature-creep-audit-2026-04-03.md`
- Key findings: 13 buttons above fold (target 8-9), 12 modal types, 3 duplicate share composers
- Removal candidates: Player Archetype re-roll, ShareCard image export (watch usage), heavy theme chrome
- Simplification candidates: collapse reroll shortcuts into modal, consolidate share composers, trim themes 9→5

### 68. Decision Engine Plan ✅
- Full plan documented in `docs/decision-engine-plan-2026-04-03.md`
- P0: Weighted random selection (metacritic, enrichment, backlog age, skip penalty) + Mood mode in Reroll
- P1: Skip memory, improved forced choice UI, post-recommendation nudge
- P2: Time-of-day awareness, "Why this game?" tooltip
- P3: Genre balance learning

### 69. Mobile Google Login (TODO)
- NEXT_PUBLIC_APP_URL=https://inventoryfull.gg confirmed set in Vercel
- Needs testing on mobile device to verify Google OAuth redirect works
- Priority: MEDIUM — affects mobile cloud sync adoption

### 70. Tab-Based Layout Refactor ✅
- Replaced single-page category wall with 4-tab navigation: Backlog → Up Next → Now Playing → Completed
- New `TabNav` component with live counts, color-coded active state, horizontal scroll on mobile
- Games grouped by status (tab), not by category
- Bidirectional progression arrows on cards: "→ Up Next", "← Backlog", etc.
- Tab switches to destination when moving a game forward or back
- Up Next hard capped at 5 with clear messaging when full
- Backlog paginated: 10 games shown, "Show more" loads next 10
- Removed: CategorySection, UpNextSection, ClearedSection, StatsPanel, FilterBar from main page
- Terminology locked: "Bailed" → "Moved On", "Played" → "Completed", "Play Next" → "Up Next"
- "Shelves" term killed — tabs are tabs, mental model is a pipeline not a library

### 71. "Best for You" Smart Sort ✅
- New `lib/smartSort.ts` with genre affinity + metacritic + playtime + enrichment quality scoring
- Default sort for Backlog tab — users see most-likely-to-enjoy games first
- Genre affinity: calculates user's genre distribution vs flat baseline, boosts over-indexed genres
- Replaces alphabetical/priority sort as Backlog default

### 72. Smart Import (Steam) ✅
- Games with 5h+ playtime auto-sorted to Up Next (capped at 5, overflow stays Backlog)
- Games with hours >= HLTB × 1.3 threshold auto-sorted to Completed
- Non-finishable games (multiplayer, MMOs) with 50h+ → Completed
- `getSmartImportStatus()` in smartSort.ts, used by SteamImportModal
- Toast message reflects smart breakdown: "Imported 200 games. 12 already beaten, 5 ready to jump back into."
- `hoursPlayed` now actually passed to `addGame()` (was only in notes before, bug fixed)

### 73. PostImportSummary Component ✅
- Component built at `components/PostImportSummary.tsx`
- Shows breakdown: backlog count, started count, up next count, completed count
- "Your actual backlog is 155 games, not 200" shame-relief reframe
- "We guessed X games are already beaten. Wrong? Move them back anytime." messaging
- Wired into page.tsx: detects 0→N games transition, shows card with X + "Got it" dismiss
- Styled with purple tint background, subtle glow, bordered dismiss button

### 74. Duplicate Vercel Project Cleanup ✅
- Deleted stale `getplaying` Vercel project that was causing double deploy failures
- Only `pileofshame` project remains, correctly linked to GitHub repo

### 75. Cozy + Minimal Themes ✅
- **Cozy**: warm cream palette (#F5F0EB), Nunito font everywhere (no monospace), 16px+ rounded corners, soft shadows, pastel status colors, softened CTAs. Banner: "inventory full / take your time. pick something nice."
- **Minimal**: near-black (#0C0C0E), white at varying opacities, zero border-radius, no card backgrounds (dividers only), stripped gradient buttons to plain bordered text, muted status colors. Zero chrome.
- **DefaultBanner**: subtle "INVENTORY FULL" header added for dark/light/weird/ultra themes. Each styled differently (ultra=chartreuse glow, weird=flicker, light=muted grey).
- Nunito loaded via next/font/google (`--font-cozy` CSS var)
- Future parking lot: Retro Terminal, Cardboard/zine, Neon Arcade, Library Card (see `docs/theme-ideas.md`)

### 76. DealBadge Strip ✅ (Rebuild TODO)
- Stripped DealBadge from GameCard, CompletionCelebration, and all imports
- DealBadge.tsx, ShareCard.tsx, ShareComposer.tsx removed as orphaned dead code
- Also removed: CategorySection, ClearedSection, UpNextSection, FilterBar (dead since tab refactor)
- Rebuild TODO: DLC deals for playing/completed games, sequel deals on completed only
- Priority: LOW — rebuild later when deal logic is rethought

### 77. Stats Page ✅
- StatsPanel moved to `/stats` route (`app/stats/page.tsx`)
- Back arrow + "My Stats" header, dark theme styling, privacy/terms footer
- Main page still focused on pipeline — stats are one click away
- TODO: add "My Stats" link/button somewhere visible on main page

### 78. Share Overhaul (TODO)
- Remove static ShareCard image export (low value, no click-through)
- Fix card theme name mismatches (80s neon = monochrome receipt, pixel = dino)
- Replace with OG link preview: `inventoryfull.gg/u/[username]` auto-unfurls in Discord/Twitter
- Needs: public profile route, OG image generation, shareable URL system
- Priority: LOW — strip current, build OG later

### 79. "Jump Back In" Cheat Sheet ✅ (V1)
- Collapsible "🗺️ Jump Back In" section on Now Playing + Up Next expanded cards
- Progress bar: hours played vs HLTB with phase label (early/mid/almost there)
- Genre-aware tips: RPG (check quest log), action (relearn controls), strategy (check resources), adventure (read chapter), stealth (quicksave), souls-like (expect to die), open world (pick ONE objective), etc.
- Capped at 3 tips per game. Warm amber styling.
- V2 TODO: story progress estimation, spoiler-tagged beats, Supabase caching, pre-seed top 200 games

### 80. Wire PostImportSummary ✅
- PostImportSummary shows on main page after import (0→N games detection)
- Dismissible via X button or "Got it" bordered button
- Shows breakdown: backlog, started, up next, completed with reframe messaging

### 81. Search-to-Add ✅
- When search finds no results in current tab, checks other tabs (shows clickable links)
- When game not in library at all, shows "Add [query] to your pile" CTA
- AddGameModal accepts `initialName` prop to pre-fill the game name
- Smooth flow: search → not found → one click → add modal with name ready

### 82. Status Badge Tab Auto-Switch ✅
- Status badge cycle (tap-to-advance) now calls `onStatusChange` callback
- Page switches to destination tab when badge is tapped (was only arrow buttons before)
- Also fires on Replay, New Game+, Un-bail, Shelve actions
- Removed dead `scrollIntoView` for deleted `up-next-section` element

### 83. Dead Code Cleanup ✅
- Removed 7 orphaned components: CategorySection, ClearedSection, UpNextSection, FilterBar, DealBadge, ShareCard, ShareComposer
- All were dead imports since tab refactor (item 70) and DealBadge/ShareCard stripping (items 76/78)

### 84. Consistent Theme Banners ✅
- Added `DefaultBanner` ("INVENTORY FULL") for dark, light, weird, ultra themes
- Each theme styles the banner differently via CSS
- Dino, 80s, 90s, Future keep their unique chrome banners
- Cozy gets its own banner ("inventory full / take your time. pick something nice.")
- Minimal and Void get no banner (intentional)

### 85. Decision Engine: "Why This Game?" ✅
- `getPickReasons()` in reroll.ts generates human-readable pick explanations
- Reasons: metacritic score, started game, pile age, short completion time, mood match
- Reveal card now shows metacritic badge (color-coded), HLTB hours, "Why this one?" chips
- Forced choice (roll 10) upgraded: larger covers, metacritic, HLTB, descriptor lines

### 86. Accessibility Pass ✅
- TabNav: role=tablist/tab, aria-selected, arrow-key + Home/End keyboard nav, focus-visible outline
- JumpBackIn: aria-expanded on toggle, aria-hidden on arrow glyphs
- PostImportSummary: role=status + aria-live=polite, 40px close button touch target
- Cozy theme: darkened text-muted/dim/faint for WCAG AA contrast on cream backgrounds
- Minimal theme: bumped text opacities for readable contrast on near-black

### 87. Voice Sweep ✅
- Fixed "optimize" → "rewire" (Factorio descriptor)
- Fixed "The journey matters" → "The ride matters more than the destination" (ME3)
- Fixed "unlocked" → "recovered" (share text)
- Privacy page: em-dashes → colons in API list

### 88. Mobile Responsiveness Fixes ✅
- Search-to-add: truncate long game names at 30 chars
- Cozy theme: targeted radius selectors instead of blanket override
- Minimal theme: preserve 8px radius on modal dialogs

### 89. Dead Code Cleanup Pass 2 ✅
- Removed 7 orphaned components from pre-tab-refactor era
- Net -1,082 lines of dead code

### 90. Landing Page Design Doc ✅
- `docs/landing-page-plan.md` with hero copy options, section breakdown, technical approach
- Conditional render on / when no games exist vs separate /welcome route
- Mobile considerations, what NOT to build

### 91. Grid View Default ✅
- `viewMode` default changed from `'list'` to `'grid'` in store
- Sample library also forces grid view on load
- Grid shows cover art front and center for stronger first impression

### 92. Dino Theme DALL-E Illustrations ✅
- `dino-mascot.png` — T-Rex with controller, wired into DinoBanner
- `dino-landscape.png` — Full volcanic prehistoric scene as page background (replaces tiling fern)
- `dino-icons.png` — 6 status icons (egg, hatching, baby dino, skeleton, meteor) saved, not yet wired
- Removed emoji dinosaurs from banner in favor of illustrated mascot

### 93. Landing Page Visual Polish ✅
- Hero illustration: `inventoryfull-hero.png` (hand rising from game pile) as main visual
- Top banner: logomark + "Inventory Full" in bold responsive text (60% of hero headline scale)
- Per-theme DALL-E prompt files: 12 files in `docs/dalle-prompts/` for future asset generation

---

## Next Priorities (Queued)

### HIGH — Moat Work
1. **Custom icon sets** — Replace emoji icons with DALL-E illustrated icons per theme. Mood tags, status badges, time tiers. Brady has DALL-E generating the custom icons MD now. Wire them in when assets arrive.
2. **Decision engine V2** — time-of-day awareness (evening = wind-down suggestions), genre balance (don't recommend 3 RPGs in a row), "Why not this game?" on skip (optional feedback loop).
2. **Decision engine V2** — time-of-day awareness (evening = wind-down suggestions), genre balance (don't recommend 3 RPGs in a row), "Why not this game?" on skip (optional feedback loop).
3. **Jump Back In V2** — story progress estimation, Supabase caching of cheat sheet data, pre-seed top 200 games.

### MEDIUM — Polish
4. **Mobile Google login testing** — needs real device testing, can't verify remotely.
5. **Enrichment reliability audit** — test RAWG/HLTB match accuracy with real large libraries. Measure and reduce failure rate.
6. **Platform visibility on cards** — already implemented per agent review, but worth visual QA on live site.

### LOW — Future
7. **Share overhaul** — OG link previews, public profile route, shareable URL system.
8. **DealBadge rebuild** — DLC/sequel deals with intent-based logic.
9. **Drag-to-reorder Up Next queue** — dnd-kit installed but not wired.

---

## The Paradigm Shift (Phase 3 redesign)

**Original problem** (largely addressed by auto-enrichment): We built a library organizer. Users needed a game matchmaker. The app used to ask users to pre-categorize every game before it could help them. Auto-enrichment (Phase 2, items 36a-36e) fixed this — moods, session tiers, and descriptions are now auto-inferred from RAWG/HLTB data.

**Remaining gap**: The UX doesn't yet leverage enrichment data for mood-first discovery. The user's real intent — "I have 45 minutes and want something chill" → app shows matching games — requires the Mood-First Discovery UX (item 37) which is still TODO.

**Key failures in current UX** (assessed at time of Phase 3 planning — status updated):
1. ~~No game descriptions~~ — ✅ Fixed. Auto-enrichment adds RAWG descriptions on import.
2. ~~Vibes/tags are manual busywork~~ — ✅ Fixed. Moods auto-inferred from genre data.
3. ~~Time tiers are manual busywork~~ — ✅ Fixed. HLTB auto-assigns session tiers.
4. ~~Filters show empty results because nothing is pre-tagged~~ — ✅ Fixed. Auto-enrichment populates tags.
5. Shelves exist as categories but there's no shelf browsing view — still TODO
6. No mixtapes — no saved criteria-based queues — still TODO
7. ~~Bail button is cryptic~~ — ✅ Fixed. Bail has confirmation flow + personality copy (item 30).
8. High-playtime games get no ribbing (1874h in Rocket League = missed roast) — still TODO
9. ~~Search bar doesn't add games intuitively enough~~ — ✅ Fixed. Search-to-Add (item 35).
10. No affiliate revenue on deal links — still TODO

---

## Phase 3 — Smart Library + Mood-First UX

### 36. Auto-Enrichment Pipeline ✅ (see Phase 2 items 36a-36e)
**Completed.** `useAutoEnrich` hook handles background enrichment on import. RAWG provides descriptions/genres/metacritic, HLTB provides completion times, genre→mood and HLTB→session tier mappings are auto-inferred. `EnrichmentIndicator` shows progress.

**Remaining work (enrichment reliability)**:
- RAWG search sometimes returns wrong game (e.g., "Portal" matching a random indie). HLTB is fuzzy-match. Needs testing with real large libraries to measure and reduce failure rate.

### 37. Mood-First Discovery UX
**Goal**: Top of page becomes "What do you want to play?" not a library dump.

The hero section becomes a discovery prompt:
- **Time input**: "I have [15 min | 30 min | 1 hour | 2-3 hours | all night]"
- **Mood input**: "I want something [chill | intense | story-rich | brainless | spooky | competitive]"
- Hit go → app filters library by auto-inferred tags + HLTB time and shows matching games
- Each result shows: cover art, synopsis (2-3 lines), HLTB estimate, metacritic, mood tags, deal if available
- "Shuffle" picks randomly from matches
- This replaces/augments the current reroll — it's reroll but smarter

### 38. Game Info Cards — Mostly Complete (see Phase 2 items 28, 32)
Expanded cards already show: synopsis, HLTB time, mood tags, metacritic, deal badges, session tier.

**Remaining work**:
- **Playtime roasts**: High hours on certain games should trigger personality comments
  - "1874h in Rocket League. No wonder your pile isn't shrinking."
  - "You've sunk 200h into Stardew. We get it, the farm isn't going to water itself."
- **Metacritic one-line review summary** (not yet implemented)

### 39. Shelf View — SUPERSEDED by Tab Layout (Item 70)
**Original goal**: Visual bookshelf metaphor. **Replaced by**: Tab-based pipeline layout (Backlog → Up Next → Now Playing → Completed). The "shelf" metaphor was wrong — we're a pipeline, not a library. "Bailed" games now live under the Completed tab as "Moved On." Genre-based sub-grouping within tabs is a future nice-to-have but not the organizing principle.

### 40. Mixtapes (Smart Play-Next Shelves)
**Goal**: Auto-generated or criteria-based play queues with intentional sequencing.

- App generates a "play next" shelf with logic: a quick-hit easy finish → a deeper narrative game → a fun palette cleanser → repeat
- Some randomness, some intentional sequencing (variety in length/mood)
- User can optionally inform with criteria: mood, time budget, genre preferences
- Can pin/unpin specific games, regenerate the rest
- Multiple mixtapes allowed
- Examples:
  - "Bedtime Stories" — narrative + wind-down + unplayed
  - "Sunday Marathon" — deep-cut + RPG + unplayed
  - "Palette Cleanser" — quick-hit + puzzle/casual
- Mixtape view shows games with descriptions and time estimates
- Nice-to-have, not critical path — build after auto-enrichment + mood-first UX

### 41. Smarter Bail
**Goal**: Bail should feel like a deliberate, informed decision.

- Better copy: "I'm never gonna finish this one" or "Life's too short"
- Bail reasons (optional): "Not my thing", "Too long", "Got bored", "Moved on"
- Bailed games section shows reason + "Reconsider?" option
- Stats: "You've bailed on 12 games worth $180. No judgment."

### 42. Search-to-Add Enhancement — Partially Complete (see Phase 2 item 35)
Basic search-to-add is done: when search finds no results, shows "Add [query] to your pile?" CTA that opens AddGameModal.

**Remaining work** (nice-to-have):
- Show RAWG results BELOW library results as user types (live autocomplete)
- Separated by a divider: "Your Library" results above, "Add from RAWG" below
- One click adds from RAWG with auto-enrichment, pre-filling cover art, genres, metacritic, HLTB, description

### 43. Playtime Roasts & Insights
**Goal**: Use playtime data to give users personality-driven nudges.

- High playtime detection: flag games with 100h+, 500h+, 1000h+ with escalating roasts
- "Comfort game" detection: games with high playtime but still in backlog
- "Time sink analysis": "You've spent 3000h across 3 games. Your other 97 games are jealous."
- Weekly/monthly playtime comparison if Steam hours refresh is used

### 44. Affiliate Revenue
**Goal**: Earn commission on deal clicks.

- **CheapShark**: Already integrated. Has affiliate program — append store redirect ID to deal URLs. Free, simple. Covers Steam, Humble, Fanatical, GOG, etc.
- **IsThereAnyDeal (ITAD)**: Better affiliate support, more stores, higher commission rates. API requires key (free). Better data quality. Worth migrating to if we outgrow CheapShark.
- **GG.deals**: Another option with affiliate program.
- Recommendation: Start with CheapShark affiliate (already integrated, just need account + URL param). Migrate to ITAD later if volume justifies it.
- Transparent: "Links may earn us a small commission" footnote
- Track click-throughs (optional analytics)

### 45. Competitive Audit ✅

#### The Landscape

| Tool | What It Is | Strengths | Weaknesses |
|------|-----------|-----------|------------|
| **Backloggd** | Letterboxd for games. Social reviews, ratings, curated lists, game journals. | Beautiful UI. Strong community. Great for logging what you've played and reading reviews. Detailed game pages with screenshots, DLC tracking. | Zero "what should I play?" features. No import automation — every game is manual search + add. No mood/time matching. It's about *recording*, not *clearing*. No personality. |
| **HowLongToBeat** | The definitive source for game completion times. Also has a basic backlog tracker. | Best-in-class time data. Large community submitting playtimes. Backlog list with % completion tracking. | The backlog feature is an afterthought — flat list, no recommendations, no mood matching, no personality. UI feels 2010. Adding games is manual. No import from platforms. Time data is great but they don't *do* anything with it to help you decide. |
| **GG.deals** | Price comparison and deal tracker. Wishlists, price history, collection management. | Best deal data. Price history charts. Alerts. Covers every store. Strong affiliate model. | Not a backlog tool at all. Tracks what you want to *buy*, not what you should *play*. No playtime data, no mood matching, no status tracking beyond owned/wishlisted. |
| **Playnite** | Open-source desktop app that unifies all launchers into one library. | Unifies Steam, Epic, GOG, Ubisoft, EA, emulators — everything. Highly customizable (themes, plugins, metadata scrapers). Launches games directly. | Desktop-only (Windows). No web/mobile. No cloud. No "what to play" intelligence. It's a launcher/organizer, not a motivator. Power-user tool — setup requires effort. |
| **GOG Galaxy** | CDProjekt's multi-platform game launcher. | Official integrations with PSN, Xbox, Steam, Epic, etc. Clean UI. Game time tracking across platforms. | Development appears stalled/slow. Community plugins break regularly. No backlog management beyond "owned" lists. No recommendations, no personality. Just a unified library view. |
| **Grouvee** | GoodReads for games. Shelves, reviews, status tracking. | Simple shelf metaphor (Playing, Played, Backlog, Wishlist). Community reviews. | Tiny community. Basic UI. No enrichment, no import automation, no mood matching, no personality. Feels abandoned. |
| **Infinite Backlog** | Web-based backlog manager with HLTB integration. | HLTB times inline. Backlog time estimates. Some prioritization features. | Basic UI, no personality, no mood matching, no auto-import. Functional but not compelling. Nothing that makes you want to share it. |

#### What They ALL Do That We Don't (Yet)
- **Social/community features**: Reviews, friend comparisons, public profiles (Backloggd, Grouvee)
- **Broader platform coverage**: Playnite and GOG Galaxy connect to 10+ platforms natively (we have Steam, Xbox, PlayStation, CSV)
- **Deal price history charts**: GG.deals tracks price over time, not just current price
- **Game database depth**: Backloggd has detailed game pages (DLC, editions, platforms, screenshots, release dates)

#### What We Do That NONE Of Them Do
1. **Mood-first discovery**: "I have 45 min, want something chill" → matching games. Nobody does this.
2. **Personality-driven experience**: Roasts, archetypes, shame-as-motivation. Every other tool is sterile/clinical.
3. **Auto-enrichment with zero user effort**: Import → we fill in descriptions, mood tags, time estimates, session tiers. Others make you tag everything yourself.
4. **Completion celebration**: Confetti, stats impact, star rating, personality copy. Others just flip a status flag.
5. **Reroll with abuse protection**: Dramatic game picker with escalating sass. Nobody has this.
6. **Player archetypes**: "You're The Hoarder" with behavioral analysis. Nobody does personality profiling of your gaming habits.
7. **Playtime roasts**: Game-specific personality comments on excessive hours. Zero competitors do this.
8. **Shareable shame stats**: "I have 347 unplayed games worth $4,200" formatted for Twitter/Reddit/Discord.

#### The Whitespace We Own
**The "what should I play right now?" problem.** Every existing tool helps you *catalog* games. None of them help you *decide* what to play tonight. The closest is HLTB giving you time estimates, but they don't combine that with mood, don't auto-tag anything, and don't have any opinion about it.

Our whitespace is: **opinionated, personality-driven backlog matchmaking with zero setup effort.**

The user imports their Steam library → within seconds, every game has a description, mood tags, session length, and the app can answer "what should I play?" based on how they feel right now. No other tool does this.

#### One-Line Value Prop
> **"Import your pile, tell us your mood, we'll find your game."** Zero tagging, zero organizing — we do the work so you can just play.

#### Where We're Vulnerable
- **No social layer**: Can't see friends' piles, no community. This is fine for MVP but matters for retention.
- **Platform coverage**: Steam, PlayStation, and Xbox/Game Pass. No Nintendo, no Epic, no GOG. Playnite wins on breadth.
- **Game database**: We depend on RAWG which can be spotty. Backloggd has richer game pages.
- **Deal data**: CheapShark is good but GG.deals is better. Not critical for MVP.

---

### 46. MVP Definition ✅
**Goal**: Define the minimum feature set for "send this link to friends" moment.

#### The "Ready Ready" Checklist

MVP is ready when a friend can:
1. **Land on pileofsha.me and immediately understand what it is** (3 seconds)
2. **Import their Steam library in under 60 seconds** (already works ✅)
3. **See their games with descriptions, mood tags, and time estimates** without manually tagging anything (auto-enrichment runs on import ✅)
4. **Ask "what should I play?" and get a good answer** based on mood + time (reroll modes work ✅, but the mood-first hero UX would make this stickier — **NICE TO HAVE**)
5. **Clear a game and feel something** (celebration works ✅)
6. **See their stats and laugh** (archetypes, shame stats, playtime roasts — ✅)
7. **Share their pile stats somewhere** and it reads well (Twitter/Reddit/Discord sharing — ✅)
8. **Come back on their phone and it works** (responsive + PWA — ✅)

#### What's Blocking MVP Right Now

| Blocker | Status | Effort | Why It Matters |
|---------|--------|--------|----------------|
| **Auto-enrich on import** | ✅ Done | Small | `useAutoEnrich` hook watches for unenriched games, processes in background with rate limiting. `EnrichmentIndicator` shows progress. |
| **Play Next onboarding** | ✅ Done | Medium | Smart suggestion picks a game from library (scored by enrichment, metacritic, HLTB, cover art). One-click "Add to Play Next" button. Randomized from top 5 candidates. |
| **Grid view → detail panel** | ✅ Done | Medium | Tapping grid card opens `GameDetailModal` (slide-up on mobile, centered on desktop). Wraps `GameCard` in `forceExpanded` mode. Full detail experience: descriptions, mood tags, deals, editing, celebration flow. |
| **Status badge discoverability** | ✅ Done | Small | Pulse animation + "tap to advance →" text hint on first cards. Persists until user taps a status badge (localStorage flag). |
| **Enrichment reliability** | 🟡 Partial | Medium | RAWG search sometimes returns wrong game (e.g., "Portal" might match a random indie). HLTB is fuzzy-match. Need to test with real libraries and see failure rate. |
| **First-time experience** | ✅ Done | Small | OnboardingWelcome 2-step flow (item 53). EnrichmentIndicator shows progress. Play Next suggests games. Status badge has hints. |
| **Accessibility basics** | ✅ Done | Medium | Focus trapping in modals, Escape-to-close, role/aria attributes, keyboard-accessible cards, form labels. |
| **Terminology consistency** | ✅ Done | Small | Locked: Play Next, What Should I Play?, Moods (not Vibes), Session length (not Time tier), Shelf (not Category). |
| **Mobile polish** | 🟡 Mostly OK | Small | Needs a pass on the expanded card view on small screens. FilterBar dropdowns may overflow. |

#### What's NOT Required for MVP
- ❌ Mood-first hero UX redesign (nice, but current reroll is good enough)
- ❌ Shelf view / visual bookshelf (post-MVP)
- ❌ Mixtapes / smart playlists (post-MVP)
- ❌ Social features / public profiles (post-MVP)
- ~~❌ Xbox/Nintendo/Epic import~~ — Xbox/Game Pass shipped (item 14). Nintendo and Epic still post-MVP.
- ❌ Affiliate revenue (figure out later)
- ❌ Smarter bail with reasons (current bail flow works)
- ~~❌ Search-to-add from RAWG autocomplete~~ — basic version shipped (item 35). Full RAWG autocomplete still post-MVP.
- ❌ Drag-to-reorder (nice but not essential)
- ❌ Server-side game database cache (optimization, not MVP)

#### MVP Build Order — All Complete ✅

All 10 original MVP build items have been shipped:
1. ✅ Auto-enrich on import (useAutoEnrich hook + EnrichmentIndicator)
2. ✅ Play Next onboarding (smart suggestion with scoring)
3. ✅ Grid view detail panel (GameDetailModal)
4. ✅ Status badge discoverability (pulse animation + tap hint)
5. ✅ Terminology consolidation (Moods, Session Length, Shelf)
6. ✅ Accessibility batch (focus trapping, keyboard nav, ARIA)
7. ✅ First-time UX polish (OnboardingWelcome flow)
8. 🟡 Enrichment reliability audit — still needs real-world testing at scale
9. 🟡 Mobile pass — mostly OK, expanded card + FilterBar need small-screen pass
10. ✅ Deployed and live at pileofsha.me

#### The "Wow Moment" That Makes Someone Share
It's not one feature — it's the sequence: **Import 200 games → see them all enriched with descriptions and mood tags in 2 minutes → hit "🎲 Get Playing" → get a game recommendation with a dramatic reveal → clear it → confetti + "You've cleared 1 of 200. Only 199 to go."**

That sequence, end-to-end, is something no other tool does. If that works smoothly, people will share it.

#### Competitive Reality Check (April 2026)

We do NOT own the "mood-based game picking" whitespace. Real competitors exist:
- **Backlog Roulette** (backlogrouletteapp.com) — genre/mood + completion time filters. Steam import. Premium tier.
- **Backlog Clearer** (backlogclearer.com) — mood-weighted selection, badges, streaks, leaderboards. Free.
- **Backlog Boss** (github.com/MydKnight/backlog-boss) — AI/LLM taste-aware recommendations. Self-hosted Docker. Most technically ambitious.
- **DeckFilter** (deckfilter.app) — mobile mood + availability filtering. Steam Deck focused.
- **MyBacklog.gg** — recommendation engine based on ratings. Multi-platform import.
- **Pick a Game** (pickaga.me) — advanced Steam filters, HLTB, presets for quick sessions.

**What we actually own**: the COMBINATION of personality (roasts, archetypes, shame) + zero-effort enrichment (auto-infer everything) + celebration (confetti + stats) + multi-platform web app. Nobody else has voice. Nobody else auto-enriches. Nobody else celebrates completions.

**Revised positioning**: "The only backlog tool with opinions."

#### Broader Competitive Landscape (April 2026, external analysis)

**Competitor groups:**
1. **Social catalog / review worlds**: Backloggd, Grouvee, Infinite Backlog, Stash, GG. For people who like cataloging, reviewing, collecting stats, following others. Not our lane.
2. **Utility trackers**: GameTrack, IGN Playlist, "Backlog" app. Closest feature overlap. GameTrack pitches "track, manage, discover what to play next." IGN Playlist has HLTB integration and "beat your backlog" framing. Polished but no personality.
3. **Recommendation engines**: Playbacklog (playbacklog.app). Closest philosophical overlap. "Personalized game recommendations based on your library and preferences, analyzes gaming patterns." Uncomfortably adjacent to our "help me decide" territory.

**Our actual positioning vs. all of these:**
Inventory Full is not a game tracker. It is a decision-and-momentum system for people with overloaded libraries. The product should be ruthlessly optimized around: deciding what to play now, staying in motion on current games, explicitly releasing games not worth saving, showing recovered value/payback, and creating a loop that feels rewarding not managerial.

**The moat is positioning + tone, not product defensibility yet.** Any competitor can add "we help you decide" messaging on a Tuesday. The moat has to come from:
1. **Better decision quality** — inference-based recommendations using playtime patterns, drop-off risk, completion likelihood, session history. Not just random filters.
2. **Better momentum design** — nudges, return loops, progress visibility. "You're 12h into Hades, one more session might clear it."
3. **Better payback/value framing** — Backlog Payback is unique. Nobody else owns "recovering value from what you already bought."
4. **Lower-friction triage** — import-to-playing speed. Get from 200 games to "play this now" in under 2 minutes.
5. **More humane tone** — already strongest differentiator. The line between "fun help" and "you've turned games into homework" is real.

**Strategic danger:** Becoming "another tracker with nicer tone." Every tracker feature (shelves, sorting, stats, social) moves toward commodity. Every decision/momentum feature moves toward moat.

**Priority shift:** Stop building tracker features. Double down on the decision + momentum loop. Personality infrastructure (themes, archetypes, share cards) is good but doesn't widen the moat. The next sprint should be moat work.

#### Product Thesis (Locked, April 2026)

**Inventory Full should shorten the distance between wanting to play and actually playing.**

Not a tracker. Not a social catalog. Not a stats playground. A lightweight decision and progress tool for overloaded libraries. It helps you decide what to play now based on mood, available time, and your own shelves, then gets out of the way.

**The key question every feature must answer:** Can someone open Inventory Full and get to "play this tonight" in under 30-60 seconds?

**Design principle:** Every extra minute spent in Inventory Full should justify itself against a minute that could have been spent playing.

**Anti-overgamification stance:** We are not building a guilt casino. The app should not become a new backlog item. No streak obsession, no endless feed behavior, no productivity dungeon. Light triage layer, decision engine, progress mirror, then get out of the way.

#### Competitor "Beat Them At" Matrix

| Competitor | Their Game | Don't Compete On | Beat Them At |
|---|---|---|---|
| **Backloggd** | Letterboxd for games: social logging, reviews, journals | Social graph, reviews, community, catalog identity | Faster decisions, less app-time, better "what tonight?", anti-homework posture |
| **GameTrack** | Polished general-purpose tracker | Breadth, general-purpose completeness | Contextual mood+time decisions, minimal interaction, "decide then leave", Backlog Payback |
| **IGN Playlist** | "Beat your backlog" + list/creator ecosystem | Media ecosystem reach, list infrastructure, mass-market breadth | Precision for owned-library decisions, time/mood matching, less noise |
| **Stash** | Tracker + gamer social network | Social engagement, collection flexing, "gamer network" | Lower cognitive overhead, not becoming its own hobby, anti-overwhelm |
| **Infinite Backlog** | Deep collection tracking + achievements + community | Depth, achievement data density, power-user collector appeal | Simplicity of action, triage speed, decision quality with minimal effort |
| **Playbacklog** | Recommendation engine based on library patterns | Pattern analysis depth | Personality, value recovery framing, humane tone, zero-setup enrichment |

#### Next Priorities (Moat Work)

**Build order based on strategic value:**

1. **Decision engine refinement** — mood + time + shelf quick-pick flow. Make outputs feel trustworthy. Fast reroll/refine without starting over. This is the wedge.
2. **Continue / revive / let-go triage** — not just "what should I start?" but "what should I continue?", "what's worth reviving?", "what should I release?" Distinguish short-session fit from high-commitment fit. Identify stalled-but-worth-it games.
3. **"Leave the app" optimization** — fewer taps, less config, clear "I'm good, go play" moment. Session-start quick-pick flow. Summaries over rabbit holes.
4. **Backlog Payback refinement** — calm payoff, not gamified addiction. Mirror of recovered value, reminder that owned games contain payoff, satisfying "getting something back" layer. Not min-maxing collection like a tax shelter with boss fights.
5. **Humane triage language** — not every game deserves saving, not every purchase deserves completion, not every unfinished title is a failure. Language around letting go, removing guilt from pausing or abandoning.

**Explicitly de-prioritized (unless extremely cheap):**
- Deep social features (Backloggd/Stash already there)
- Rich review/journaling systems (not central to wedge)
- Achievement rabbit holes (Infinite Backlog serves that user)
- Over-detailed dashboarding (don't build backlog operations command center)
- Discovery beyond owned library (careful: "discover new games" works against "play what you own")

#### Language to Lean Into vs. Away From

| Lean Into | Lean Away From |
|---|---|
| decide | score |
| continue | streak |
| make progress | rank |
| pick the right game for right now | hero tier |
| recover value | completion hunter |
| clear space | crush your backlog |

---

## Phase 4 — Future

### 45. Drag-to-Reorder Play Next Queue
- dnd-kit installed but not wired up
- Also need sorting presets: by rating, by time to beat, by how long in pile, by community popularity

### 46. Shelves as Playlists Refactor
- Current "categories" (The Pile, etc.) are organizational buckets that don't mean much
- Shelves should be playlists: ordered lists of games to play through in sequence
- Genres/tags (RPG, FPS, roguelike) replace the current "category" concept — auto-inferred from RAWG
- The default shelf is "The Pile" (Pile of Shame) — everything imports here
- Users can create custom shelves ("My RPG Marathon", "Quick Hits for Lunch Break")
- Auto-generated shelves from genre clusters ("Your RPGs", "Your Indies")
- "You're Objectively Wrong Not To Have Played This" — auto-generated from metacritic 90+

### 47. Wire Up Duplicate Game Nudges
- `getDupeNudge` function written but not integrated

### 48. Social Features
- Public profile pages / shareable pile
- Compare piles with friends
- Community challenges ("Clear 5 games this month")
- Discord bot integration

### 48b. Notifications
- "You haven't touched [game] in 30 days" nudges
- Weekly shame digest email

### 49. Platform Integrations
- Nintendo (no API — manual only)
- GOG (GOG Galaxy DB or direct API)
- Epic Games (EGS unofficial API or web scraping)

### 49b. Cross-Platform Game Launching
**Goal:** Let users launch games directly from Inventory Full into the right app on the right device.

**What works now:**
- ✅ Steam desktop: `steam://run/{appid}` — already built in GameCard expanded view

**To build:**
- Steam Link (mobile): Same `steam://run/{appid}` protocol works if Steam Link app is installed. Detect mobile user agent and show launch button on mobile too. Priority: HIGH — easy win.
- Xbox / Game Pass (desktop): Try `ms-xbl-{titleId}://` or `xbox://` protocol links. Worth attempting — may work for Game Pass PC app. Priority: MEDIUM — experimental, worth a spike.
- Xbox (mobile): Xbox app deep linking — investigate `xbox://` on mobile. Priority: LOW.
- PlayStation Remote Play (mobile): No URL scheme for launching specific games. PS App can link to store pages but can't trigger Remote Play for a specific title. Sony's ecosystem is locked down. Priority: WATCH — monitor for API changes but don't invest time now.
- PlayStation (desktop): No PC launcher exists. Dead end. Priority: NONE.

**API watch list:** Keep eyes on Sony and Microsoft developer portals for any new deep linking or remote play APIs. Unlikely to change soon but worth periodic checks.

### 49c. Add to Home Screen (PWA) Prompt
**Status:** PWA manifest already configured (`display: 'standalone'`). Add to Home Screen works on iOS Safari and Android Chrome RIGHT NOW.

**To build:**
- Subtle one-time prompt for iOS mobile users: small banner or settings panel hint saying "Add to your home screen for quick access" with dismiss. Not a popup — respect the gravity principle.
- Android: Chrome handles this with its own install prompt. We may be able to hook into `beforeinstallprompt` event for a custom prompt.
- Detection: use `navigator.standalone` (iOS) or `matchMedia('(display-mode: standalone)')` to detect if already installed and suppress the prompt.
- Priority: LOW — nice for power users, not a growth lever.

### 50. Game Database (Server-Side)
- Cache enrichment results server-side (Supabase)
- Once we've enriched a game for one user, serve cached data to the next user
- Builds a shared game database over time
- Reduces API calls, faster enrichment for new users

### 51b. Bot Proofing & Rate Limiting
- Rate limiting on API routes (Steam import, PSN, RAWG, deals, HLTB) — prevent abuse
- Consider Vercel's built-in rate limiting (vercel.json rewrites with rate limit headers)
- Cloudflare free tier as a CDN/WAF layer if bot traffic becomes a problem
- CAPTCHA (Turnstile by Cloudflare, not reCAPTCHA — lighter, more privacy-friendly) as last resort on import flows
- Monitor via GA for suspicious traffic patterns (high import volume from single IPs)
- Supabase has built-in auth rate limiting already (login attempts)
- Priority: LOW until traffic warrants it. Build the pipes, monitor, react.

### 51. Legal Compliance Pages ✅
**Required even without cookies:**
- **Privacy Policy** — must disclose: data collected (emails via Supabase auth, Steam IDs, PSN tokens temporarily, IP addresses via server logs), purposes, third-party sharing (Supabase, RAWG API, CheapShark, HLTB), user rights, data retention, contact info
- **Terms of Service** — usage terms, account termination, liability limitations, intellectual property, user-generated content (notes, ratings)
- No cookie banner needed if we genuinely use no cookies (Supabase auth may use localStorage, not cookies — verify)
- Both pages should be accessible from footer on every page
- Use plain language, not legalese — consistent with our voice
- Consider using a generator (Termly, PrivacyPolicies.com) as a starting template, then customize
- **Key disclosures needed:**
  - Steam Web API data (playtime, game list) — stored in localStorage
  - PSN token (ephemeral, not stored server-side)
  - CheapShark/RAWG/HLTB — external API calls with game names
  - Supabase — email + synced library data
  - No analytics/tracking currently (add disclosure if we add any)
  - Affiliate links (CheapShark) — must disclose commission potential

---

## Phase 5 — Multi-Vertical Expansion (Post-Gaming MVP)

**Thesis**: The "what should I [verb] right now?" problem exists everywhere digital backlogs accumulate. The core engine (mood matching, reroll, celebration, archetypes, enrichment pipeline, share formatting) is vertical-agnostic. The data sources are vertical-specific.

### Architecture Strategy
**Option C now, designed for Option B later.** Don't build for 6 verticals before validating one. But when expanding, abstract the enrichment pipeline to accept "source adapters" (RAWG for games, TMDB for movies, Google Books for books) and vertical-specific mood taxonomies. The reroll engine, celebration flow, and archetype system are already content-agnostic in logic.

### Expansion Priority (based on competitive research April 2026)

| Priority | Vertical | Whitespace | Competition | Data Sources |
|----------|----------|-----------|-------------|-------------|
| **1** | **YouTube Watch Later** | Wide open. Only Chrome extensions exist (organizers/deleters). Nobody does mood/time picking from your queue. | None with personality or intelligence | YouTube Data API v3 |
| **2** | **Music (Albums)** | Completely unserved. No tool manages a listening backlog of saved albums. | Nothing exists | Spotify API, Apple Music API |
| **3** | **Books / TBR** | Partially served. StoryGraph has mood/pace matching but no personality. Goodreads is a catalog. | StoryGraph (mood matching, no personality). Goodreads (dominant but static). | Google Books API, Open Library. Goodreads API deprecated. |
| **4** | **Movies/TV** | Competitive but personality gap. Watchworthy + Boredflix do mood matching. JustWatch unifies streaming. None have shame/archetypes. | Watchworthy, Boredflix, JustWatch, Movie Tracker | TMDB API (excellent, free), JustWatch API |
| **5** | **Podcasts** | Unserved but unclear if shame/backlog resonates for podcasts | None | RSS feeds, podcast directory APIs |

### What Transfers Across Verticals (Reusable Core)
- Mood-first discovery UX ("I have X time, I want Y mood")
- Reroll / "Get [Watching/Reading/Listening]" with modes
- Completion celebration (confetti, stats impact, rating)
- Player/viewer/reader archetype system
- Shame stats + sharing (Twitter/Reddit/Discord formatting)
- Status cycle (backlog → up next → in progress → done → bailed)
- Enrichment pipeline pattern (fetch metadata → infer mood → infer time commitment)

### What's Vertical-Specific
- Import sources and APIs
- Mood taxonomy (gaming moods ≠ movie moods ≠ book moods)
- Time tier definitions (a "quick" game ≠ a "quick" movie ≠ a "quick" book)
- Enrichment sources (RAWG vs TMDB vs Google Books)
- Roast/personality copy (gaming roasts don't work for books)
- Source/platform icons and labels

### Additional Verticals to Explore
*(See also "Beyond Digital Media" in Blue Sky Wishlist for analog verticals.)*
- **Online courses** (Udemy, Coursera, Skillshare) — same buy-and-guilt psychology as games. Strong shame parallel.
- **Read Later articles** (Pocket, Instapaper) — 500 saved articles, read 12. Universal.
- **Side projects** (GitHub repos started and abandoned) — developer-specific but deeply relatable.
- **Saved recipes** (Pinterest, Instagram saves) — saved 200 recipes, cooked 3.

### The Music Whitespace Is Real
Not just "albums you haven't listened to." The deeper problem: algorithms push you into discovery loops that pull you AWAY from artists you already love. People find out a favorite artist released 3 albums they never encountered because the algo never surfaced them. We can help people get unstuck from algorithmic tunnel vision and reconnect with music they actually chose to save. That's a real problem meeting a real solution.

### Podcast Angle
People's podcast queues fill up with new episodes daily. They triage to "latest episode" and the backlog of older episodes they intended to listen to grows forever. We can dig gems out of what they intended to listen to but never did. Worth exploring.

### Domain Strategy
- `pileofsha.me` — gaming (current, flagship)
- Subpaths for expansion: `pileofsha.me/watch`, `pileofsha.me/read`, `pileofsha.me/listen`
- No extra domains at first phase. Keep it simple.
- Shared auth across all piles via Supabase
- Cross-pile stats: "You have 847 unfinished things across 4 piles"
- Nav menu will become necessary when multiple verticals exist

### When to Start
- Not until gaming MVP is validated (users sharing, returning, clearing games)
- YouTube Watch Later is the first attack vector (widest whitespace, zero competition)
- Music is second (Spotify API is developer-friendly, real problem to solve)
- Don't touch Movies/TV until we have a clear differentiator beyond personality (Watchworthy is good)
- We own gaming first and foremost. We're not painting into a corner. We're putting down borders and saying "we own this corner." Then we annex new corners.

### User Preference Profiles (Feature to Build)
- Users can enrich their own profile so we know more about them
- Favorite genres, mood preferences, time availability patterns
- Informs Play Next suggestions, reroll weighting, enrichment prioritization
- The better we know them, the more dynamic we can make celebrations, roasts, recommendations
- Transfers across verticals: "you like chill + story-rich" applies to games, movies, and books
- Start simple: 3-5 preference questions on first import. Refine over time from behavior.
- This carves moat. Better personalization = harder to leave.

### Wishlist / Deal Alerts (Feature to Build)
- We maintain a wishlist for users (games they want but don't own yet)
- Deal alerts when wishlisted games go on sale
- Steam and other platforms don't have to be the only ones offering this function
- Yes, this adds more games to conquer. But it also generates affiliate revenue and users will love it.
- We're working the way our users already think. That's good user-centered design.
- Creates a natural funnel: wishlist → buy → pile → play → clear

---

## Philosophy & Psychology

### Why We Exist
Pile of Shame solves analysis paralysis. Our users aren't lazy. They're overwhelmed. They have executive function disruption around entertainment choices. Too many options leads to choosing nothing. We break that cycle.

### Our Approach to Shame
Shame is in our name. We get the emotional state. We don't attack it. We heal it. We solve it. We steer when users can't, in ways that aren't aggressive, hostile, or unwelcome.

Real psychology informs how we treat our users:
- Analysis paralysis (Schwartz, "The Paradox of Choice")
- Decision fatigue and executive function
- Commitment avoidance and fear of missing out (FOMO)
- The psychology of collecting vs. experiencing
- Gamification: variable reward schedules, loss aversion, progress tracking

We can really check psychology research around these topics and have real science inform how we treat our users, so we can treat them better than any other tool would dream of doing. This isn't ambitious. It's practical. It's logical. Follow what psychology tells us about how our users operate and leverage that TO HELP THEM.

### Onboarding Psychology
The user's first 5 minutes determine everything. They need to:
1. Feel understood ("you've got a pile, we get it")
2. See their games enriched without effort ("zero work, all the info")
3. Make one decision easily ("how about this one? 10k positive reviews")
4. Feel rewarded for that decision ("you did the hard part: deciding")

We make committing frictionless. We convince the user they've committed before they even realized it, or had time to question it. The deciding has happened before they had time to second-guess. Mini celebrations reward and gamify taking action.

### Ethical Boundaries
- We collect only data users consent to share
- Psychological insights serve the user, never exploit them
- Personalization improves their experience, not our metrics
- We're transparent about affiliate links and data usage
- Light touch first on behavioral analysis. Test the waters. Only go deeper if it clearly benefits users.

### Reference Documents
- `.claude/rules/voice-and-tone.md` — copy/tone guidelines, banned patterns, terminology
- `.claude/rules/user-persona.md` — detailed personas, sub-personas, psychology, design principles

---

## Blue Sky Wishlist (Ripe for Exploration)

Ideas we haven't figured out how to build yet, but are worth exploring when we can:

### Gaming Features
- **"You're objectively wrong not to have played this" shelf** — auto-generated from metacritic 90+, overwhelmingly positive Steam reviews, and cultural significance. "Hades is sitting in your pile. That's a crime."
- **Archetype visuals** — tarot-style cards or illustrated portraits for each archetype. Jungian/esoteric flavor. Shareable images.
- **Comfort game detection** — flag games with 500+ hours that users keep returning to. Celebrate the comfort game while gently nudging toward something new.
- **"Speed run your pile" mode** — aggressive session: give each game 30 minutes. Keep or bail. Clear 10 decisions in an evening.
- **Community challenges** — "Clear 5 games this month" with leaderboards. Cross-pollinate with Backlog Clearer's streak/badge model but with our personality.
- **Purchase shame timeline** — "You bought Disco Elysium on Dec 23, 2021. That was 4 years ago. It's a 30-hour game. You could have beaten it 48 times by now."
- **AI game matchmaker** — use LLM to explain WHY a specific game matches the user's mood/preferences, like Backlog Boss does but without requiring self-hosting
- **Sorting presets for shelves** — sort by rating, by community popularity, by time to complete, by how long it's been in your pile. Standard and essentially required.
- **Mini celebrations for milestones** — first game added, first Play Next pick, first clear, 10th clear, 50th clear. Each with escalating personality.
- **Auto-import wishlists on library import** — when a user imports their Steam library and we save their linkedSteamId, automatically fetch their wishlist too. No extra modal. The API already supports `action=wishlist`. Just chain the call after library import completes, add games with `isWishlisted: true`, and show a combined toast. PSN can't do this (token is ephemeral), but Steam can. Xbox could too if we store the gamertag.
- **Spoiler-aware media consumption** — the cultural shelf life problem. You intended to read/watch/play something 3 years ago. By now it's been memed to death and you already know the beats. At some point the shame shifts from "I should experience this" to "I should just get the gist and move on." Offer a graceful exit: "You've had this for 3 years. Want the 5-minute version instead?" Could integrate with AI summarization. This applies across verticals (books, shows, games with heavy narrative). Related to the "bail with dignity" philosophy. Not Cliffs Notes exactly. More like: "you're clearly never doing this. Here's what you missed. Now you can talk about it at dinner."
- **Remote game launch / deep-linking** — click "Get Playing" and have Steam, Game Pass, or PS Remote Play actually launch the game. Steam has `steam://rungameid/` protocol. Xbox Game Pass has `ms-xbl-*://` deep links. PS5 remote play is harder. Even partial support (Steam on desktop) would be magical. Blue sky but worth exploring.
- **Steam for Mac preference** — users who primarily play Steam on Mac should be able to set a platform preference that filters to Mac-compatible titles. Steam API has platform data.
- **Spotify playlist matching** — suggest public Spotify playlists that match the vibe/mood of the game you're about to play. Could be as simple as searching Spotify for "[game name] soundtrack" or "[mood] gaming playlist." Respectful of soundtrack creators — supplement, not replace.
- **Trophy Case view** — dedicated shelf/view for showcasing achievements and trophies across platforms. GameAchievements type already exists. Could be a visual showcase similar to the planned shelf view. Makes users feel good about what they've accomplished.
- **Fake error/glitch modal for theme discovery** — whimsical easter egg: a "you have glitched into dino mode" style fake error that reveals hidden themes. An easter egg people might never find, "and that would be kinda funny."
- **Webring as real community tool** — the 90s mode webring could be a real cross-promotion feature. "Show some love kinda deal." Affiliate/goodwill cross-promotion with other gaming sites/tools.
- **Search bar collapse** — search bar sits next to "Add a Game" and expands into input only when clicked. Saves vertical pixels, especially on mobile.
- **Game list pagination** — start with 20 games visible, option to show 50, 100, or all. Performance + UX win for large libraries.
- **Energy matching by time of day** — suggest different game types based on time of day (morning = energetic, evening = wind-down). Concerns about VPNs and accuracy, but worth exploring as opt-in.
- **Celebrate bail as a healthy boundary** — bailing deserves a mini-celebration, not confetti but acknowledgment. "You drew a line. That's a choice." Reframe bail as a positive act of self-knowledge. 🙌 toast already implemented in Just 5 Minutes triage.

### Naming & Brand Considerations
- **Domain exploration** — `pileofsha.me` is clever but not memorable, doesn't roll off the tongue. Exploring alternatives: `backlog.lol`, `getplaying.app`, `unplayed.lol`, `playalready.lol`, `whatdoiplay.com`. Cheap TLDs: `.lol` (~$2/yr), `.wtf` (~$5/yr), `.app` (~$13/yr). `.gg` is ideal but $50+/yr.
- **Name sensitivity** — "Pile of Shame" as a name could be problematic given shame sensitivity in the target audience. It's tongue-in-cheek and self-referential enough that most users will get it, but worth being aware of. "The tightrope has effect."
- **Existing iOS app** — "Pile of Shame - Game Tracker" exists on the App Store (id6758886606). Trademark/competitive concern worth monitoring.

### Monetization & Marketing
- **Gaming-specific tip language** — not "buy me a coffee." Something different: "grab me a slice" 🍕, "buy me an ice cream" 🍦. Simple but a little different. Avoid "support pile of shame" which reads like "support the idea of shame."
- **Pick-your-price monthly membership** — users pick their own monthly price to keep tipping if the service is helping. Not quite freemium, more like patronage.
- **Email collection + marketing consent** — proper email capture with consent for marketing. Bells and whistles of a commercialized app.
- **30-second landing page explainer** — marketing-style landing page separate from the app itself. Needed for full rollout to explain the value prop instantly.
- **Connected accounts visibility** — clear UX showing which platform libraries are imported. "How can I see if I have my Steam and PS libraries imported?" Settings now shows this.

### Beyond Digital Media (The Analog Pile)
The core insight: shame piles aren't just digital. The psychology is identical whether it's 200 unplayed games or a chair covered in unfolded laundry. What we learn building the gaming tool (shame as motivation, celebration for action, breaking paralysis) could translate to real-world analog problems.

Speculative verticals worth watching:
- **The Laundry Chair** — habit tracking meets shame motivation. That chair in your home with all the unfolded clothes on it. Real. Universal. Potentially fixable. Not with this app, but with what we learn building it.
- **The Gym Habit** — maintaining exercise routines. Same commitment avoidance psychology as gaming backlogs. "You said you'd go 4 times this week. You went once. That's 25% completion rate. The Dabbler archetype applies here too."
- **The Cleaning Schedule** — household maintenance pile. Everyone has rooms they avoid cleaning. Same paralysis, same shame, same "I'll do it tomorrow."
- **Photo Library Cleanup** — cloud storage crunch is real. People pay $3-10/month for storage filled with screenshots, duplicates, and photos of whiteboards from 2019. Help people organize 70% of it properly, trim the junk, and potentially reduce their cloud storage tier. If you save someone $3/month, you're literally giving them money. That's the definition of value.
- **Bookmarks** — does anyone even use bookmarks anymore? Probably not in the traditional sense. But "saved for later" across platforms (Reddit saves, Twitter bookmarks, Instagram saves, Pocket, Instapaper) is a massive unmanaged pile. 500 saved articles, read 12.
- **Online Courses** — Udemy, Coursera, Skillshare. Same buy-and-guilt psychology as games. "You own 47 courses. You've completed 2. Your learning pile is worth $800."
- **Side Projects** — GitHub repos started and abandoned. Developer-specific but deeply relatable. "You have 23 repos with one commit. That's 23 good ideas you ghosted."
- **Saved Recipes** — Pinterest, Instagram saves. "Saved 200 recipes, cooked 3." The cooking pile of shame.

### The Bigger Vision
None of these require building right now. But the engine we're building (mood matching, shame-as-motivation, celebration loops, archetype profiling, zero-effort enrichment) is fundamentally about helping overwhelmed people take action on accumulated intentions. Gaming is where we prove it works. The framework transfers.

### External Feedback (April 2026)

**Shareable Stats Cards Design:**
- Theme-matched card designs: Polaroid for 90s mode, Receipt (thermal printer) for 80s/Neon, 8-bit sprite for Dino, clean minimal for default
- OpenGraph images should auto-update to show current Level + Last Cleared Game when sharing Cleared list URL
- "Anti-Annoyance Rule": Only offer share for Big Moments — beating a 40+ hour game, new Backlog Buster Level, hitting a Reclaimed Value milestone ($500+)
- Avoid "AI slop" — no over-designed achievement cards that look like mobile game ads

**Naming Recommendations (from early external analysis — superseded by Final Decision Phase below):**
- ~~Best brand name candidates: 1) Playback, 2) Inventory Full, 3) Dead Save Society~~ — Playback was later eliminated (direct competitor at playbacklog.app). Inventory Full and Dead Save Society advanced to finals.
- Best value proposition phrase: "Backlog Payback" — confirmed across all rounds
- ~~Recommended brand architecture: **Playback** (brand) + **Backlog Payback** (core feature/value system) + Dead Save Society (community/editorial layer)~~ — see updated brand systems in Final Decision Phase
- "Continue Club" diagnosed as "linguistically toddler milk-scented" — spirit is right, phrase is not
- Key insight: separate the app name job (ownable, memorable) from the promise/mechanic job (explains value)

### Naming & Brand Architecture — Final Decision Phase

**Status: DONE — Inventory Full. Domain: `inventoryfull.gg` registered on Porkbun ($51.80/yr). Gmail: inventoryfull.gg@gmail.com.**

**The Core Insight:**
"You are not lazy. You are overloaded." The name must signal empathy and action, not storage or shame. We're a behavioral tool, not a library.

**What's Locked (regardless of brand name):**
- **Backlog Payback** = core value metric/feature name. Confirmed across all analysis rounds.
- **pileofsha.me** = permanent redirect / easter egg. Cultural recognition stays forever.
- **backlog.quest** = supporting/campaign URL, not the main brand. Good thematic fit but not fresh enough for flagship.

**The Final Three (ranked after 4 rounds of analysis):**

**#1: Inventory Full** — The Smart Pick (FRONTRUNNER)
- Best emotional intelligence. "You are not lazy. You are overloaded."
- Names the pain in gamer-native language everyone instantly gets
- Best UI/copy language built in: Clear Space, Overflow, Open Slots, Priority Loadout
- Personality: warm, witty, non-judgmental. "Let's make this manageable."
- Risk: lives in problem state — product must show transformation fast (we already do this)
- Domains to check: `inventoryfull.app`, `inventoryfull.gg`, `getinventoryfull.com`, `playinventoryfull.com`, `inventoryfull.games`
- Brand system: **Inventory Full** + **Backlog Payback** (feature) + **Mission Clear** (celebration) + `backlog.quest` (campaign)

**#2: Dead Save Society** — The Bold Pick
- Most memorable, most shareable, most "I want to tell someone about this"
- Strongest worldbuilding: Society Rank, Resurrections, "Worth Saving," Revive
- Personality: confident, flavorful, cool, a little dramatic. Most swagger.
- Risk: needs confident design to avoid feeling like community project vs product
- Domains to check: `deadsavesociety.com`, `joindeadsavesociety.com`, `deadsave.club`
- Brand system: **Dead Save Society** + **Backlog Payback** (feature) + **Revive** (action verb)

**#3: ClearQuest** — The Safe Pick
- Easiest to explain, cleanest onboarding, most "normal app" feel
- But IBM Rational ClearQuest is a real SEO collision
- Also the most replaceable — doesn't carve moat
- Domains to check: `getclearquest.com`, `clearquest.app`, `clearquest.games`
- Brand system: **ClearQuest** + **Backlog Payback** (feature) + **Quest Clear** (state)

**Names ELIMINATED (all rounds):**
- Playback — direct competitor at playbacklog.app
- Runback — "backtracking chore smell. Not heroic."
- Reclaim — too generic, domain competition
- Dust Off — warm but not distinctive enough
- Unfinished Business — existing web presence
- Hoard — heavily used across gaming
- Delve — SEO dominated by WoW mechanic
- Continue Club — "linguistically toddler milk-scented"
- Unplayed.gg — taken
- QuestLog.gg — taken
- Backlog.quest — taken (but worth checking as campaign URL)

**Brand Mythology (lives underneath any name):**
- **The Dragon Metaphor:** "The dragon isn't the hoard — the dragon is *guarding* the hoard. The dragon is that paralysis loop sitting between you and your own gold."
- **Kairos:** Greek god of the fleeting moment. Every time you scroll past something incredible and boot up Rocket League instead, Kairos just passed you.

**Decision Framework:**
- Feel understood → **Inventory Full**
- Feel cool → **Dead Save Society**
- Just ship it → **ClearQuest** (but you'll rebrand in 6 months)

**The Brand System (LOCKED):**
- **Brand:** Inventory Full
- **Domain:** `inventoryfull.gg` (Porkbun, $51.80/yr)
- **Tagline:** Your backlog is full. Your time doesn't have to be.
- **Hero copy layer:** "Be the hero of your own library." (used in marketing/copy, not the brand name)
- **Core feature:** Backlog Payback
- **CTA:** Clear some space
- **Celebration state:** Mission Clear
- **Campaign URL:** `backlog.quest` (if available, optional)
- **Easter egg redirect:** `pileofsha.me` → `inventoryfull.gg`
- **Brand metaphor:** RPG encumbrance. Every gamer has stood in a menu dropping cheese wheels to keep moving. That's the backlog condition.

**In-app terminology (to adopt during branding pass):**
- Backlog Payback = recovered value feature
- Clear Space = main CTA
- Overflow = backlog pressure indicator
- Open Slots = room created in play plan
- Priority Loadout = selected current games

**Action items:**
1. ✅ Domain search and naming decision complete
2. ✅ `inventoryfull.gg` registered on Porkbun (2026-04-02)
3. ✅ `inventoryfull.gg@gmail.com` created for WHOIS / support
4. TODO: Branding pass on app (rename, update copy, adjust metadata)
5. TODO: Point `inventoryfull.gg` DNS to Vercel (CNAME record)
6. TODO: Set up `pileofsha.me` → `inventoryfull.gg` redirect
7. TODO: Update OG image, share cards, and social metadata with new brand
8. TODO: Update manifest.ts, privacy/terms pages with new brand name

---

## Key Design Tokens
- BG: `#0a0a0f`, Cards: `#111118`, Elevated: `#1e293b`
- Text: `#f8fafc` / `#e2e8f0` / `#b0bec9` / `#8896a7` / `#6b7d8f` (bumped for legibility)
- Borders: `#232333` / `#3d4f63` (bumped for visibility)
- Accents: purple `#a78bfa`, pink `#f9a8d4`
- Card radius: 12px, padding: 12px 14px, max-width: 960px
