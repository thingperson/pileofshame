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

### Landing Page (HIGH)
- Design doc: `docs/landing-page-plan.md`
- Hero section with CTA
- How-it-works breakdown (3 steps)
- Before/after comparison
- Social proof section
- Show for visitors with empty library, redirect to app when library exists

### Enrichment Reliability Audit (HIGH)
- Name normalization shipped ✅
- Result scoring shipped ✅
- Still needed: test accuracy at scale with large libraries (200+ games)
- Still needed: retry logic for failed enrichments
- Still needed: verify edge cases (DLC names, remasters, numbered sequels)

### Accessibility Hardening (MEDIUM)
- Cozy theme text-faint/dim contrast fixed ✅
- Minimal theme opacity bumped ✅
- Still needed: aria-hidden on emoji icons in GameCard
- Still needed: visual labels on AddGameModal selects
- Still needed: close button accessibility in Reroll modal

---

## NEXT SPRINT — May 2026

### Decision Engine V3 (HIGH)
- "Why not this?" skip feedback (optional 1-tap reason: too long, not in mood, played recently)
- Energy matching (user picks energy level 1-5 before roll)
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

### Phase 3: Social & Sharing (LOW priority for now)
- Public profile route (/u/username)
- OG link previews for shared profiles
- Share card redesign
- Friend comparisons ("your pile vs. theirs")

### Phase 4: Smart Notifications (LOW)
- Email digest: "You haven't played in 3 days"
- Deal alerts for games in your pile (price drops)
- See: `.claude/plans/future-notifications-email.md`

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
