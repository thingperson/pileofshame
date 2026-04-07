# Inventory Full — Roadmap

**Mission**: Stop scrolling your library. Start playing.
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
- Tab navigation (Backlog, Up Next, Now Playing, Completed) with ARIA tabs ✅
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
- HLTB direct API integration (replaced broken npm packages with /api/find + token auth + honeypot) ✅
- Asset cleanup: removed unused concept art, organized icon files, gitignored scratch folders ✅

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
- Still needed: test Xbox import flow against real Xbox account (gamertag with public profile)
- OPENXBL_API_KEY confirmed in Vercel env vars ✅

### Landing Page — SHIPPED ✅
- Hero illustration + bold brand banner with logomark ✅
- Mono banner, transparent hero, tighter spacing ✅
- Shows for visitors with empty library, redirects to app when library exists ✅
- Design doc: `docs/landing-page-plan.md`
- Key copy discovered in Discord conversation (Apr 4):
  - "Treat it like a condition that needs healing"
  - "We nudged you to play. If you don't like it, blame us."
  - "Celebrating bailing on a game — that's a decision. That's a win."
  - The identity pressure angle: it's not about what's good, it's what you *chose*

### Custom Icon Set (HIGH — Priority 2)
- Colored icon brief finalized: `docs/dalle-prompts/14-icon-colored-final.md`
- 29 icons total: status (5), mood tags (10), reroll modes (4), time tiers (5), nav (5 optional)
- DALL-E generation in progress — 20+ assets in `public/icons/` (all mood + status + 2 reroll modes done)
- Preview branch `icon-preview` wired into Reroll modal + main page shortcut buttons
- Using plain `<img>` tags (source files pre-optimized at 128x128, ~7KB each)
- Still needed: 3 reroll mode icons (deep-cut, continue, almost-done), nav icons
- Naming convention defined in brief

### Enrichment Reliability Audit (MEDIUM)
- Name normalization shipped ✅
- Result scoring shipped ✅
- RAWG in-memory cache (1hr TTL, 500 entries) + Cache-Control headers ✅
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
  - NO: move to Now Playing with encouragement
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
- Now Playing cap (3 games, enforced across all entry points) ✅
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
- Remaining V3 features (specced, not yet built):
  4. "Why'd you skip?" feedback (3-4h, optional 1-tap reason: too long, not in mood, etc.)
  5. Energy matching (3-4h, Low/Medium/High selector with time-of-day defaults)
  6. Behavioral learning (8-12h, decision history, genre affinity, time tier preference)
- TypeScript interfaces, localStorage schemas, weight tables, and testing plans in spec doc

### Jump Back In V3 (MEDIUM)
- Story progress estimation from HLTB chapter data (if available)
- Supabase cache table for game tips (avoid re-fetching)
- Pre-seed tips for top 200 most-imported games

### Mobile Polish (MEDIUM)
- Mobile Google login testing (real device)
- Touch target audit pass
- Swipe gestures for tab switching

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
| Voice/AI lingo sweep | Apr 7, 2026 | Clean — 404 page, error pages, post-accept nudge copy, Sub Shuffle quips all reviewed | Every deploy with new copy |
| Accessibility audit | Apr 6, 2026 | All critical/major items resolved. Reroll close btn ✅, mode btn labels ✅, status aria-labels ✅, contrast ✅ | Monthly |
| Feature creep audit | Apr 7, 2026 | Healthy. 3 new pages (404, error, global-error) are edge-case only. Genre cooldown is invisible. Zero new happy-path UI elements. 13 themes = maintenance watch. | Quarterly |
| Mobile responsiveness | Apr 6, 2026 | Tab labels fixed, mode buttons scroll OK, cards render clean at 375px, nudge cards stack cleanly | Monthly |
| Enrichment accuracy | Apr 7, 2026 | HLTB direct API integration replaced broken npm packages. All test games returning data. RAWG cache + retry still solid. | Quarterly |
| Legal/privacy compliance | Apr 7, 2026 | Sentry added to Privacy Policy (third-party services + cookies/tracking sections). Genre cooldown is localStorage only. | Before any feature touching user data, deals, or profiling |
| Info density sweep | Apr 7, 2026 | Flagged: nudge cards too tall (compact by default), import summary should be one-time modal. Logged in IDEAS.md. | Periodic — Brady audits visually, Claude flags code-side |

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

## KEY DOCS

- `docs/IDEAS.md` — Running brainstorm dump (raw ideas, rambles, half-formed thoughts)
- `docs/decision-engine-plan-2026-04-03.md` — Decision engine V2 feature specs
- `docs/decision-engine-v3-spec.md` — Decision engine V3 comprehensive spec (6 features, TypeScript schemas, weight tables)
- `docs/feature-creep-audit-2026-04-03.md` — Scope audit results
- `docs/landing-page-plan.md` — Landing page design
- `docs/theme-ideas.md` — Theme specifications
- `.claude/rules/voice-and-tone.md` — Brand voice guardrails
- `.claude/plans/brand-social-kit.md` — Social presence plan
- `.claude/plans/psychology-informed-features.md` — Psychology-backed feature rationale
- `.claude/plans/future-notifications-email.md` — Email/notification roadmap
- `docs/scale-up-plan.md` — Infrastructure scaling playbook + emergency viral plan
- `docs/marketing-prep.md` — Channel strategy, email scaffold, pre-launch checklist

## USER FEEDBACK LOG

| Date | Source | User | Key Feedback | Status |
|------|--------|------|-------------|--------|
| Apr 4, 2026 | Discord | Nate (ex-Xbox) | Xbox import broken (no API key), wants "ignore title" + behavioral learning | API key added ✅, ignore title shipped ✅, behavioral learning roadmapped |
| Apr 5, 2026 | PDF | Brady | 12 issues: em dashes, card spacing, action clarity, hero too big, below fold, Deep Cut label, broken images | Most fixed ✅, Sub Shuffle PS+ and platform logos still pending |
