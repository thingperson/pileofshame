# Inventory Full — Build History

Completed features, for historical reference. Phase 1 (MVP) and Phase 2 (Post-MVP) are both shipped. This doc exists so agents can look up what was built and when without loading current-state context.

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
