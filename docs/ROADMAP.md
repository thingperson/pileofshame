# Inventory Full — Roadmap

**Mission**: Stop stalling. Get playing.
**Core loop**: Import games -> Tell us your mood -> We pick your game -> Track progress -> Celebrate completion.
**Primary use case**: Mobile companion. Phone in hand, sitting in front of your console or PC. The app offloads decision pressure and gets you in the game. Design for that moment first.

---

## SHIPPED (April 2026)

### Decision Engine V1 + V2
- Weighted random selection (metacritic, enrichment, backlog age, hours played) ✅
- Mood mode with 10 mood tag filters (AND logic) ✅
- Skip memory (0.2x weight penalty for session-skipped games) ✅
- Forced choice after 10 rolls (last 3 picks shown) ✅
- "Why this game?" explainer with pick reasons ✅
- Time-of-day awareness (evening boosts chill, late-night boosts quick-hit) ✅
- Genre balance (penalizes same-genre picks in a row) ✅
- "Ignore this title" toggle — ignored games excluded from reroll, 45% opacity in backlog ✅
- Just 5 Minutes mode — ultra-short session picker for quick-hit games ✅

### Import Pipeline
- Steam library import (API-based) ✅
- Steam wishlist import ✅
- Xbox import (gamertag-based) ✅
- PlayStation import (PSN ID) ✅
- Playnite CSV import ✅
- Manual add with RAWG search ✅
- Search-to-add flow (search bar offers "Add to pile" when game not found) ✅

### Enrichment Pipeline
- RAWG: cover art, metacritic, genres, description ✅
- HLTB: main story hours, completionist hours (direct API integration, no npm dependency) ✅
- Auto mood tag inference from genres + game overrides ✅
- Time tier inference from HLTB data ✅
- Non-finishable game detection (MMOs, sandboxes, multiplayer-only) ✅
- Name normalization before API calls (strips edition suffixes) ✅
- Result scoring (picks best RAWG match, not just first result) ✅

### UI / UX
- Tab navigation (Backlog, Up Next, Playing Now, Completed, Moved On) with ARIA tabs ✅
- List + grid view toggle (grid default for new users) ✅
- Backlog sort picker (Best for You, A-Z, newest, oldest, playtime) ✅
- Auto tab-switch when game status changes ✅
- Completion celebration (confetti, affirmations) ✅
- Jump Back In cheat sheets (genre tips + 20+ game-specific tip sets) ✅
- Progress nudges ("One more session might finish this") ✅
- Post-import summary with breakdown ✅
- Onboarding welcome state ✅
- Sample library (40+ games for try-before-import onboarding) ✅
- Landing page with hero illustration, mono brand banner, logomark ✅
- Landing page "Get Started" modal (sign-in, import, sample data — single entry point) ✅
- /about page (landing content for returning users, no import CTAs) ✅
- Landing page sign-in affordance for returning users ✅
- Bold "Inventory Full" brand header with logomark ✅
- Stats link promoted to header toolbar ✅
- Stats share buttons (X, Reddit, Copy for Discord) on value calculator ✅
- Milestone toasts (1/5/10/25/50 games cleared + decisions made) ✅
- Behavioral archetypes — 20+ player personality types based on library composition ✅
- Achievement showcase — Xbox/PSN achievement counts on game cards ✅
- iOS Safari reroll fix (85dvh + sticky action buttons) ✅
- Mobile UX pass (bottom-sheet reroll, tap targets, viewport fix) ✅
- PDF feedback fixes (em dashes, card spacing, action button clarity, status label cleanup) ✅
- "Move to Up Next" / "Back to Backlog" progression labels (was arrows) ✅
- Hide redundant status badge when already on that tab ✅
- Deep Cut description rewritten to "A game buried in your backlog you may have forgotten about" ✅
- "Closest to Done" sort fixed (was falling through to A-Z during enrichment) ✅
- Theme picker now closes settings menu on selection ✅
- Sample banner "Clear" → "Dismiss" (no longer wipes library) ✅
- iOS Home Screen icon cropped to fill frame (was tiny due to source padding) ✅
- Just 5 Minutes card renders as bottom-sheet overlay (was crammed into button row) ✅
- Reroll no-repeat: tracks shown games per session, prevents same game appearing twice ✅
- "Almost Done" reroll mode: filters to games within 20% of HLTB completion ✅
- Post-accept nudge: 3s motivational overlay after "Let's Go" with session estimate + Steam launch ✅
- PS+ Sub Shuffle: `/api/psplus` fetches 427 games from Sony public GraphQL, unified with Game Pass in service tabs ✅
- Sentry error monitoring + global error boundary + `/api/health` endpoint ✅
- Custom 404 page + app-level error boundary with Sentry reporting ✅
- Favicon: DALL-E red "IF" bag icon, reads clearly at 16px in Chrome tabs ✅
- PWA icons regenerated from new favicon source (192px, 512px, apple-icon) ✅
- Sparkle icon variant saved as `icon-*-sparkle.png` (intentional second render, not wired to manifest) ✅
- Safari SVG fix: explicit width/height on FeatureCard icons (Safari collapses className-only SVGs in flex) ✅
- HLTB direct API integration (replaced broken npm packages with /api/find + token auth + honeypot) ✅
- Asset cleanup: removed unused concept art, organized icon files, gitignored scratch folders ✅
- Reroll modal UX: section labels ("How much time?" / "I want something that feels..."), bigger text across all surfaces ✅
- Comfortable text size toggle in Settings (112.5% root font scale, persisted via localStorage) ✅
- Favicon transparent background (bag floats on tab bar like other sites) ✅
- PageSpeed fix: landing page images converted to WebP (5MB → 85KB, 98% reduction) ✅
- Skip feedback ("Why'd you skip?"): optional pill row after skips (not-in-mood, too-long, played-recently, hit-a-wall, not-interested) ✅
- Energy matching: Low/Medium/High selector in reroll, replaces time-of-day weights, auto-defaults by clock ✅
- Decision history recording: every accept/skip logged to localStorage for future behavioral learning ✅
- Nudge card compact mode: StalledGameNudge + FinishCheckNudge collapsed by default, expandable ✅
- Typography pass: all text-[10px]/text-[11px] bumped to text-xs minimum across 25+ components ✅

### Themes
- Dark (default) ✅
- Light ✅
- 90s (full easter egg: marquee, cursor trails, guestbook, visitor counter) ✅
- 80s (synthwave gradients) ✅
- Future, Ultra, Void ✅
- Dino: DALL-E illustrated mascot banner + landscape background ✅
- Weird: Comic Sans, glitch effects, card rotation, chromatic aberration ✅
- Cozy (warm golden cream, Nunito font, soft radius) ✅
- Minimal (near-black, opacity text, red-only accent, dividers only) ✅
- Tropical (vibrant mint/coral/maize on deep teal) ✅
- Campfire (deep forest charcoal, warm orange/saffron accents) ✅
- 13 themes total across all palettes ✅
- 12 per-theme DALL-E prompt files for future asset generation ✅

### Auth & Onboarding
- AuthButton: clean sign-in dropdown (Discord/Google/email, no fluff copy) ✅
- "Continue without syncing" option for local-storage users ✅
- GetStartedModal: unified entry point for new users (sign-in or skip) ✅
- Onboarding tightening (Apr 8): action-first modal, auto-reroll on sample, import-to-play CTA ✅
  - GetStartedModal flipped: import/sample above the fold, auth below "want to sync?" divider ✅
  - Sample data auto-opens reroll picker after 800ms (instant core loop) ✅
  - PostImportSummary "Got it" → "What Should I Play?" primary CTA + "Browse my library" secondary ✅

### Infrastructure
- Supabase auth + cloud sync ✅
- Google + GitHub OAuth ✅
- OG image for Discord/Twitter/SMS unfurls (v3: hero illustration, landing headline, Outfit + JetBrains Mono fonts, purple glow) ✅
- GA4 analytics (reroll, commit, import events) ✅
- PWA manifest + 192/512px icons + apple-icon fix ✅
- Token efficiency restructure (plan file 94% reduction, path-scoped rules) ✅

---

## CURRENT SPRINT — April 2026

### Xbox Import + Game Pass (HIGH — Priority 1)
- OpenXBL API key in `.env.local` ✅ — verified working (gamertag search returns results)
- API key tested against real endpoint (Major Nelson lookup) ✅
- Free tier: 150 req/hr, no credit card, covers all endpoints we need
- **Game Pass Browse component built** — `components/GamePassBrowse.tsx` exists ✅
- **Game Pass catalog endpoint verified** — returns 500+ product IDs ✅
- **PS+ catalog built** — `/api/psplus` route fetches 427 games from Sony public GraphQL ✅
- **Sub Shuffle unified** — GamePassBrowse now supports both Game Pass and PS+ via service tabs ✅
- Xbox import tested against real account (gamertag "Hugstrom") — working ✅
- OPENXBL_API_KEY confirmed in Vercel env vars ✅

### Landing Page — SHIPPED ✅
- Hero illustration + bold brand banner with logomark ✅
- Mono banner, transparent hero, tighter spacing ✅
- "Get Started" hero CTA → GetStartedModal with all entry paths ✅
- "It's really just three things:" H2 (revised from "Three steps. We do the hard part.") ✅
- Hero subhead: "Can't decide what to play? Yeah, we know." ✅
- "Already have an account?" sign-in affordance for returning users ✅
- Shows for visitors with empty library, redirects to app when library exists ✅
- Design doc: `docs/landing-page-plan.md`

### Custom Icon Set (ON HOLD — exploring alternatives)
- DALL-E icons look great at large sizes but illegible below ~36px (too much illustrated detail)
- **Current decision: emojis on production, icon experiments on `icon-preview` branch**
- 20+ DALL-E assets in `public/icons/` on icon-preview branch (all mood + status + 2 reroll modes)
- Preview branch has full wiring (CustomIcon component, iconMap, Reroll + page.tsx integration)
- Exploring alternatives: Recraft.ai (icon-specific AI), SVG icon libraries (Phosphor/Lucide), Figma manual
- See: `docs/IDEAS.md` → "Icon Generation Strategy" for full tool comparison
- Still needed if pursuing custom icons: flat/bold silhouette style, 2-3 colors max, test at 16px before accepting

### Enrichment Reliability Audit (MEDIUM)
- Name normalization shipped ✅
- Result scoring shipped ✅
- RAWG in-memory cache (1hr TTL, 500 entries) + Cache-Control headers ✅
- Supabase `game_metadata` L2 cache (persistent, shared across users, write-through from RAWG) ✅
- API rate limiting on /api/rawg (60/min), /api/hltb (30/min), /api/deals (40/min) per IP ✅
- Enrichment retry logic (1 retry with 2s delay on 429/5xx) ✅
- Broken image fallback (onError → gamepad emoji) ✅
- 200+ game library working without issues ✅
- Still watch: edge cases (DLC names, remasters, numbered sequels) — no formal audit yet

### "Best for You" Sort Upgrade — SHIPPED ✅
- Added completion proximity scoring (HLTB progress inference: 85%+ = huge boost) ✅
- Added backlog age signal (365d+ = forgotten gem boost) ✅
- Tiered metacritic scoring (replaces flat linear scale) ✅
- Rebalanced weights: genre 30, metacritic 20, completion 20, hours 15, age 10, enrichment 5 ✅

### HLTB Progress Inference + Behavioral Nudges — SHIPPED ✅
- "~Xh left" badge on GridCard + GameCard (shows when remaining ≤ 8h) ✅
- Green 🏁 at 85%+ progress, amber ⏳ below that ✅
- "Closest to Done" sort option in backlog picker ✅
- Sub Shuffle button logos upgraded (GP / PS+ text badges, readable) ✅
- Stalled game nudge card: "Pick up where you left off?" ✅
  - Detects games with 2+ hours, 14+ days stale, not completed
  - Genre-aware messaging (story-rich, difficult, open world, general)
  - 1 per session, rotates, backs off after 3 dismissals per game
- "Did you finish this?" nudge for 85%+ HLTB games ✅
  - Detects games at 85%+ completion, asks if they finished
  - YES: auto-mark Cleared + trigger celebration
  - NO: move to Playing Now with encouragement
  - Separate from stalled nudge, backs off after 3 dismissals
- See: `docs/IDEAS.md` + `docs/behavioral-learning-framework.md`

### Skip Tracking — SHIPPED ✅
- Persistent skip memory across sessions (localStorage) ✅
- 1-2 skips: no penalty ✅
- 3-4 skips: 50% weight reduction in decision engine ✅
- 5+ skips: soft-ignore (hidden from picker, stays in library) ✅
- 💤 indicator on cards for soft-ignored games ✅
- Reset skip count from game detail view ✅
- See: `docs/behavioral-learning-framework.md`

### UX Feedback Sweep (April 6 PDF) — SHIPPED ✅
- All 16 items from Brady's UX review addressed
- Playing Now cap (3 games, enforced across all entry points) ✅
- Tab auto-follow on game move + nudge actions ✅
- Nudge cards restricted to Backlog tab only ✅
- "Move this game to:" label on stalled nudge buttons ✅
- List view: platform badge hidden on mobile for title space ✅
- Mobile tab label "Playing" → "Now" ✅
- Sample library banner auto-dismiss after first action ✅
- Library status pill (Sample / Your Library / Synced as [name]) ✅
- + button removed, merged into search bar as add icon ✅
- ViewToggle added to top of game list (was bottom-only) ✅
- Stats button visible on mobile ✅
- Header click resets to Backlog + scrolls to top ✅
- /about page built (landing content, no import CTAs) ✅
- Landing page sign-in affordance for returning users ✅
- See: `docs/IDEAS.md` UX Feedback section for full detail

### Accessibility Hardening — SHIPPED ✅
- Cozy theme text-faint/dim contrast fixed ✅
- Minimal theme opacity bumped ✅
- Reroll modal close button with aria-label ✅
- Status button aria-labels on GridCard ✅
- Reroll mode button aria-labels ✅

### Decision Engine V2 Refinements (MEDIUM)
- Mood-first quick-pick flow
- Genre balance tuning
- Time-of-day awareness tuning

### Visual Identity Pass (MEDIUM)
- Custom icon set replacing emojis (in progress — see Custom Icon Set above)
- Extend geometric element system beyond landing page into main app (reroll modal, stats, empty states)
- Consider spot illustrations for key moments (import complete, first recommendation, completion)
- One strong visual mark > 20 decorative elements — find the ONE thing
- Must not clutter — personality without noise

### Infrastructure Prep (MEDIUM) — SHIPPED ✅
- Sentry error monitoring wired up (free tier, production-only, no PII) ✅
- Global error boundary (`app/global-error.tsx`) catches root layout errors ✅
- Health endpoint (`/api/health`) for uptime monitoring ✅
- instrumentation.ts for server/edge Sentry init ✅
- Sentry DSN configured in Vercel, first event received ✅
- UptimeRobot monitoring `/api/health` every 5 min ✅

---

## NEXT SPRINT

### Decision Engine V3 (HIGH)
- ~~"Ignore this title" / negative weighting~~ — **SHIPPED**
- ~~Skip tracking~~ — **SHIPPED** (persistent skip memory, soft-ignore after 5)
- ~~Stalled game detection~~ — **SHIPPED** (nudge card + "Did you finish?" prompt)
- **Full V3 spec written** — see `docs/decision-engine-v3-spec.md`
- ~~"Almost Done" reroll mode~~ — **SHIPPED** (filters to games within 20% of HLTB completion) ✅
- ~~Post-recommendation nudge~~ — **SHIPPED** (3s motivational overlay after "Let's Go", with session estimate + Steam launch link) ✅
- Genre cooldown / fatigue: 0.6x weight penalty for same genre within 7d of completion, 0.8x at 7-14d, tracks last 3 completions ✅
- ~~"Why'd you skip?" feedback~~ — **SHIPPED** (optional pill row after skips, feeds back into weights: too-long penalizes marathon, hit-a-wall suppresses 7d, not-interested soft-ignores at 2+) ✅
- ~~Energy matching~~ — **SHIPPED** (Low/Medium/High selector replaces time-of-day, auto-defaults by clock, multiplicative mood+tier weighting) ✅
- Decision history recording — **SHIPPED** (logs accept/skip with full context to localStorage, rolling 100 entries, prep for behavioral learning) ✅
- ~~Behavioral learning~~ — **SHIPPED** (genre affinity + time tier preference weights from decision history, Shannon entropy variety factor, cold start dampening, Stats UI with reset) ✅
- **Decision Engine V3 is COMPLETE.** All 6 features shipped.
- TypeScript interfaces, localStorage schemas, weight tables, and testing plans in spec doc

### Jump Back In V3 (MEDIUM)
- Story progress estimation from HLTB chapter data (if available)
- Supabase cache table for game tips (avoid re-fetching)
- Pre-seed tips for top 200 most-imported games
- **Verified Re-entry Packs (top 50)**: manually curated controls + story-so-far + last milestone for the most-imported games. Prove the format before automating. (from Gemini review)
  - First pack shipped: Clair Obscur: Expedition 33 (4 milestones, `lib/reentryPacks.ts`) ✅
  - Format proven: milestone-aware tips change based on hours played, falls back to genre tips for games without packs
  - Next: 9 more packs toward top 10 (covering sample library games first, then AAA, then sleepers)
- **Full AI recap pipeline (FUTURE)**: milestone-gated RAG with spoiler safety. Only if verified packs prove value and we have budget. See `docs/IDEAS.md` → Gemini Feedback for architecture notes.

### Mobile Polish (MEDIUM) — SHIPPED ✅
- Touch target audit pass (44px+ on all interactive elements, responsive padding) ✅
- Swipe gestures for tab switching (50px threshold, horizontal bias detection) ✅
- Cozy + Minimal theme WCAG contrast fixes ✅
- Mobile Google login testing (real device) — still needed

### Share & Polish (MEDIUM — from external feedback review)
- PWA install prompt in Settings menu (uses beforeinstallprompt API) ✅
- Bail animation: 300ms scale-down + fade on bail action ✅
- Auth avatar mobile squish fix (shrink-0 + gap-0 on mobile) ✅
- ImportHub `role="dialog"` + aria-modal accessibility fix ✅
- Composable share cards: dynamic OG images, unique URLs, unfurl in Discord/Slack/Twitter ✅
  - `/clear/[id]` landing page with "Less shame. More game." CTA ✅
  - `/clear/[id]/opengraph-image` dynamic 1200x630 PNG with cover art, stats, flavor text ✅
  - Composable checkboxes in celebration modal (hours, HLTB compare, pile time, stats) ✅
  - Supabase `share_cards` table with public read RLS ✅
  - Composable rating toggle (auto-enables on rate, controls star visibility on card) ✅
  - "What goes in the slot" recommendations removed from celebration modal (too pushy) ✅
  - Share composer opens by default (no scary "Share" button to click) ✅
  - Contextual notes placeholders by game status ✅
  - Status cycle locked: Backlog → Up Next → Playing Now → Completed → Moved On ✅
  - "bail" retired from all user-facing copy; action verb = "Not for me", destination state = "Moved On" ✅
  - Component sweep: all toasts, labels, help modal, tabs unified to locked vocabulary ✅
  - Internal identifiers (`canBail`, `setBailed`, `showBailed`) left as-is (refactor deferred) ✅
- Game card detail UX cleanup ✅
  - Removed Shelf/Session dropdowns (less decision paralysis) ✅
  - Removed time tier icon + platform source badge from card header (noise reduction) ✅
  - "Launch" → "Launch in Steam" (platform-aware, tells user what click does) ✅
  - "Ignore" → "Don't suggest" (clearer intent) ✅
  - "Remove" → "Delete from library" (distinct from close, with confirmation) ✅
  - Skip feedback timer 4s → 8s (was disappearing before users could read/click) ✅
- ~~"Inventory Weight" visual~~ — SCRAPPED (Apr 8). Persistent progress viz fights readability and changes too slowly to feel rewarding. Replaced by milestone celebrations at 50/75/100% cleared (not yet built).
- Themed share "Postcards": match active theme for social sharing

---

## FUTURE PHASES

### Phase 3: User Insights & Self-Reflection
- Personal gaming data breakdowns (genre distribution, play patterns, decision history)
- "Your gaming personality" profile built from behavior over time
- Auto-clustering similar user types for better recommendations at scale
- Natural lock-in through accumulated self-knowledge (not gamification)
- From user feedback: "I like data breakdowns on my own behaviour over time"

### Phase 4: Social & Sharing (LOW priority for now)
- Public profile route (/u/username)
- OG link previews for shared profiles
- Share image cards (PNG generation via /api/share-card exists but UI stripped — restore when prioritized)
- Friend comparisons ("your pile vs. theirs")

### Phase 5: Smart Notifications (LOW)
- Email digest: "You haven't played in 3 days"
- Deal alerts for games in your pile (price drops)
- See: `.claude/plans/future-notifications-email.md`

### Phase 6: Native Mobile App (FUTURE — not started)
- Enhanced PWA first (offline library, install prompt, push notifications)
- Capacitor or Expo wrapper for app store presence if PWA isn't enough
- Full React Native rewrite only if wrapper feels too janky
- Apple Developer ($99/yr) + Google Play Console ($25) needed
- See: `docs/IDEAS.md` → "Native Mobile App Planning" section

### Research — Decision Paralysis & Choice Architecture
- Formal study of choice overload interventions (Schwartz, Iyengar)
- What streaming platforms learned (Netflix browse-to-watch ratio, Spotify Discover Weekly)
- Failed approaches: Steam discovery queue, Google Play "play next"
- Pattern languages from outside gaming (meal planning, reading lists, streaming)
- Has anyone measured the "entertainment backlog" userbase size?

### Parking Lot (ideas, not committed)
- Drag-to-reorder Up Next (dnd-kit installed)
- DealBadge rebuild (DLC/sequel deals with intent logic)
- Multiplayer matchmaking ("we both own this, let's play")
- Steam Deck compatibility indicators
- Achievement hunting mode

---

## REVIEWS & AUDITS

| Review | Last Run | Status | Frequency |
|--------|----------|--------|-----------|
| Voice/AI lingo sweep | Apr 9, 2026 | Clean — landing hero, H2, Step 3 rewrite, about page mirror all swept. "bail" retired, em-dash rule enforced. | Every deploy with new copy |
| Accessibility audit | Apr 8, 2026 | ImportHub role="dialog" + aria-modal added. All prior items still resolved. | Monthly |
| Feature creep audit | Apr 9, 2026 | Healthy. Semantic audit + component sweep are vocabulary cleanup, not new features. Core loop unchanged. | Quarterly |
| Mobile responsiveness | Apr 8, 2026 | Share card builder tested at 375px. Game detail modal tested — Launch button, action row all fit without Shelf/Session dropdowns. | Monthly |
| Enrichment accuracy | Apr 8, 2026 | Supabase L2 cache live. Three-tier caching (memory → Supabase → API). Rate limiting on all API routes. | Quarterly |
| Legal/privacy compliance | Apr 8, 2026 | game_metadata table is public game data only (no user data, no RLS needed). Rate limiting is server-side per-IP, no PII stored. No Privacy Policy update needed. | Before any feature touching user data, deals, or profiling |
| Info density sweep | Apr 8, 2026 | Fixed: nudge cards collapsed by default. Typography: 10px/11px bumped to 12px+ across 25 components. Import summary modal now drives action (CTA + secondary dismiss). | Periodic — Brady audits visually, Claude flags code-side |
| PageSpeed / performance | Apr 7, 2026 | Landing page images converted to WebP (5MB → 85KB). Sentry preconnect + LCP preload added. Retest needed. | After image/asset changes |

### Legal Guardrails (Locked, April 2026)

Any feature that touches the following areas **must be reviewed against this checklist before building**:

**Hard lines — never cross these:**
- Never sell, rent, or share user data with third parties
- Never let advertisers or publishers target specific users through our platform
- Never track users across external sites or apps
- Never collect data without disclosure in the Privacy Policy
- Never market to users under 13
- Never store PSN tokens, passwords, or auth credentials server-side

**Requires disclosure update before shipping:**
- Any new third-party API that receives user data (even game names)
- Any new behavioral profiling or automated categorization
- Any affiliate link or revenue-generating referral
- Any new analytics or tracking beyond current GA4 scope
- Any data that moves from client-side to server-side storage

**The distinction that keeps us clean:**
We do *personalized recommendations* (using a user's own data to help them), not *targeted advertising* (using a user's data to let third parties reach them). Every feature must stay on the recommendation side of that line. If a feature starts to feel like "we're using their data to sell them something," it fails review.

**FTC/Competition Bureau requirements (when affiliate revenue goes live):**
- Clear disclosure on any page with affiliate links
- Never inflate or misrepresent pricing
- Never recommend games to buy — only show deals on games they already own or wishlisted

---

## ENVIRONMENT VARIABLES

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + .env.local | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + .env.local | Supabase anon key (public, client-side auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + .env.local | Supabase service role key (secret, server-side only — powers game_metadata L2 cache) |
| `RAWG_API_KEY` | Vercel + .env.local | RAWG game data API |
| `OPENXBL_API_KEY` | Vercel + .env.local | OpenXBL Xbox import API |
| `SENTRY_DSN` | Vercel | Sentry error monitoring (production only) |

**Finding the Supabase service role key:** Project Settings → API → Project API keys → `service_role` (click Reveal). It's auto-generated with the project — you don't create it.

## KEY DOCS

- `docs/IDEAS.md` — Running brainstorm dump (raw ideas, rambles, half-formed thoughts)
- `docs/decision-engine-plan-2026-04-03.md` — Decision engine V2 feature specs
- `docs/decision-engine-v3-spec.md` — Decision engine V3 comprehensive spec (6 features, TypeScript schemas, weight tables)
- `docs/feature-creep-audit-2026-04-03.md` — Scope audit results
- `docs/landing-page-plan.md` — Landing page design
- `docs/theme-ideas.md` — Theme specifications
- `.claude/rules/voice-and-tone.md` — Brand voice guardrails
- `.claude/rules/brand-messaging.md` — Brand messaging pillars and terminology
- `.claude/rules/legal-compliance.md` — Legal/privacy feature review framework
- `.claude/rules/deploy-gates.md` — Mandatory pre-push checks
- `.claude/plans/brand-social-kit.md` — Social presence plan
- `.claude/plans/psychology-informed-features.md` — Psychology-backed feature rationale
- `.claude/plans/future-notifications-email.md` — Email/notification roadmap
- `docs/scale-up-plan.md` — Infrastructure scaling playbook + emergency viral plan
- `docs/DECISIONS.md` — Why decisions were made (the "hit by a bus" doc)
- `docs/marketing-prep.md` — Channel strategy, email scaffold, pre-launch checklist

## USER FEEDBACK LOG

| Date | Source | User | Key Feedback | Status |
|------|--------|------|-------------|--------|
| Apr 4, 2026 | Discord | Nate (ex-Xbox) | Xbox import broken (no API key), wants "ignore title" + behavioral learning | API key added ✅, ignore title shipped ✅, behavioral learning roadmapped |
| Apr 5, 2026 | PDF | Brady | 12 issues: em dashes, card spacing, action clarity, hero too big, below fold, Deep Cut label, broken images | Most fixed ✅, Sub Shuffle PS+ and platform logos still pending |
| Apr 7, 2026 | Text | Gemini | Jump Back In is strongest USP, share cards on completion, PWA install prompt, bail animation, avatar squish bug, "Inventory Weight" viz | Good points extracted → docs/IDEAS.md, quick wins roadmapped |
| Apr 7, 2026 | Text | ChatGPT | Landing promise vs product shape gap, sample demo underplayed, "Why this pick?" needed (already built), skip training needed (already built), readiness filters, moat is engine not tracking | Strategic points captured → docs/IDEAS.md, confirmed existing features cover most suggestions |
| Apr 8, 2026 | Text | ChatGPT (R2) | Screenshot-based review. Import summary omits Now Playing count (bug), enrichment messaging unclear, "Zero decisions" overpromises, stats need confidence framing, chip states unclear. "Play initiation engine" positioning. Moat = recommendation trust + voice. | Bugs fixed: import summary ✅, enrichment copy ✅, landing copy ✅. Design items logged. |
| Apr 8, 2026 | Text | ChatGPT (R3) | Detail page review. Jump Back In tips wrong for Slay the Spire (genre fallback gave RPG advice), action taxonomy fuzzy, "Give up" language too blunt, notes box needs prompts, content quality = trust. "Believable bridge between owning and playing." | Slay the Spire tips added ✅. Trust/content quality items logged → docs/IDEAS.md. |
