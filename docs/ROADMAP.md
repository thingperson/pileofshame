# Inventory Full — Roadmap

**Mission**: Stop scrolling your library. Start playing.
**Core loop**: Import games -> Tell us your mood -> We pick your game -> Track progress -> Celebrate completion.

---

## SHIPPED (April 2026)

### Decision Engine V1 + V2
- Weighted random selection (metacritic, enrichment, backlog age, hours played) ✅
- Mood mode with 10 mood tag filters (AND logic) ✅
- Skip memory (0.2x weight penalty for session-skipped games) ✅
- Forced choice after 10 rolls ✅
- "Why this game?" explainer with pick reasons ✅
- Time-of-day awareness (evening boosts chill, late-night boosts quick-hit) ✅
- Genre balance (penalizes same-genre picks in a row) ✅

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
- HLTB: main story hours, completionist hours ✅
- Auto mood tag inference from genres + game overrides ✅
- Time tier inference from HLTB data ✅
- Non-finishable game detection (MMOs, sandboxes, multiplayer-only) ✅
- Name normalization before API calls (strips edition suffixes) ✅
- Result scoring (picks best RAWG match, not just first result) ✅

### UI / UX
- Tab navigation (Backlog, Up Next, Now Playing, Completed) with ARIA tabs ✅
- List + grid view toggle ✅
- Backlog sort picker (Best for You, A-Z, newest, oldest, playtime) ✅
- Auto tab-switch when game status changes ✅
- Completion celebration (confetti, affirmations) ✅
- Jump Back In cheat sheets (genre tips + 20+ game-specific tip sets) ✅
- Progress nudges ("One more session might finish this") ✅
- Post-import summary with breakdown ✅
- Onboarding welcome state ✅

### Themes
- Dark (default) ✅
- Light ✅
- 90s (full easter egg: marquee, cursor trails, guestbook, visitor counter) ✅
- 80s (synthwave gradients) ✅
- Future, Dino, Weird, Ultra, Void ✅
- Cozy (warm golden cream, Nunito font, soft radius) ✅
- Minimal (near-black, opacity text, dividers only) ✅

### Infrastructure
- Supabase auth + cloud sync ✅
- Google + GitHub OAuth ✅
- OG image for Discord/Twitter unfurls ✅
- GA4 analytics (reroll, commit, import events) ✅
- PWA manifest ✅

---

## CURRENT SPRINT — April 2026

### Xbox Import + Game Pass (HIGH — Priority 1)
- Bug: OpenXBL API key not configured → users see error on Xbox import
- Sign up at xbl.io, add `OPENXBL_API_KEY` to `.env.local` + Vercel env vars
- Test import flow against real Xbox account
- Free tier: 150 req/hr, no credit card, covers all endpoints we need
- **Game Pass catalog feature**: OpenXBL has Game Pass endpoints on free tier
  - Import Game Pass catalog as browsable pool
  - "I have Game Pass" mode: recommend from available catalog based on mood/time
  - Hybrid: overlay Game Pass catalog with play history (what you've tried + what's available)
  - Solves: "I have 400 free games and can't pick one" — stronger version of the core problem

### Landing Page (HIGH — Priority 2)
- Design doc: `docs/landing-page-plan.md`
- Hero section with CTA
- How-it-works breakdown (3 steps)
- Before/after comparison
- Key copy discovered in Discord conversation (Apr 4):
  - "Treat it like a condition that needs healing"
  - "We nudged you to play. If you don't like it, blame us."
  - "Celebrating bailing on a game — that's a decision. That's a win."
  - The identity pressure angle: it's not about what's good, it's what you *chose*
- Show for visitors with empty library, redirect to app when library exists

### Enrichment Reliability Audit (MEDIUM)
- Name normalization shipped ✅
- Result scoring shipped ✅
- Still needed: test accuracy at scale with large libraries (200+ games)
- Still needed: retry logic for failed enrichments
- Still needed: verify edge cases (DLC names, remasters, numbered sequels)

### Accessibility Hardening (MEDIUM)
- Cozy theme text-faint/dim contrast fixed ✅
- Minimal theme opacity bumped ✅
- Still needed: close button accessibility in Reroll modal

### Visual Identity Pass (MEDIUM)
- Extend geometric element system beyond landing page into main app (reroll modal, stats, empty states)
- Explore custom illustrated mascot/icon (backpack with controller, consistent style)
- Consider spot illustrations for key moments (import complete, first recommendation, completion)
- One strong visual mark > 20 decorative elements — find the ONE thing
- AI generation possible for spot illustrations if done tastefully (not hero art)
- Must not clutter — personality without noise

### Infrastructure Prep (MEDIUM)
- Sentry error monitoring (free tier — rough in now, refine later)
- Uptime monitoring (BetterUptime or UptimeRobot free tier)
- Goal: have these ready to activate, not scramble when traffic arrives

---

## NEXT SPRINT

### Decision Engine V3 (HIGH)
- **"Ignore this title" / negative weighting** — if user bails, stop suggesting (from user feedback)
- "Why not this?" skip feedback (optional 1-tap reason: too long, not in mood, played recently)
- Energy matching (user picks energy level 1-5 before roll)
- **Behavioral learning over time** — engine gets smarter about *this user* based on decisions
- Post-recommendation nudge (after "Let's go": motivational push + launch link)
- See: `docs/decision-engine-plan-2026-04-03.md` items 4-8

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
- Share card redesign
- Friend comparisons ("your pile vs. theirs")

### Phase 5: Smart Notifications (LOW)
- Email digest: "You haven't played in 3 days"
- Deal alerts for games in your pile (price drops)
- See: `.claude/plans/future-notifications-email.md`

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
| Voice/AI lingo sweep | Apr 3, 2026 | Clean (6 minor fixes applied) | Every deploy with new copy |
| Accessibility audit | Apr 3, 2026 | 2 critical fixed, 3 major open | Monthly |
| Feature creep audit | Apr 3, 2026 | Healthy with watchlist | Quarterly |
| Mobile responsiveness | Apr 2, 2026 | Clean | Monthly |
| Enrichment accuracy | Apr 3, 2026 | Normalization shipped, scale test pending | After next large import |
| Legal/privacy compliance | Apr 4, 2026 | Clean — policies updated, no grey areas | Before any feature touching user data, deals, or profiling |

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

- `docs/decision-engine-plan-2026-04-03.md` — Decision engine feature specs
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
| Apr 4, 2026 | Discord | Nate (ex-Xbox) | Xbox import broken (no API key), wants "ignore title" + behavioral learning | Xbox fix queued as Priority 1, features roadmapped |
