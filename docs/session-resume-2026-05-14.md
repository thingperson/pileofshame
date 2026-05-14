# Session Resume — 2026-05-14 (Wednesday, PDT)

**START HERE:** Pip bot pool expanded 20 → 344 games. Franchise version dedup and mood pre-classification shipped for web app picker.

Prior context: `docs/session-resume-2026-05-13.md`

---

## What shipped this session

1. **Pip bot pick pool: 20 → 344 games** — Created `bot/scripts/build-pool.ts` (RAWG API fetcher + HLTB scraper) and `bot/scripts/assemble-pool.ts` (merges subagent-drafted blurbs, supplemental hand-picks, Game Awards nominees, mood-gap fills). Full 9-mood x 3-length-tier coverage matrix with no dead cells. Commit `423562a`.

2. **Franchise version dedup** (`lib/franchiseDedup.ts`) — Annual franchise games (FIFA/EA FC, Madden, NHL, NBA 2K, MLB The Show, WWE 2K, F1, Football Manager, CS) are grouped; only the newest version the user owns is eligible for picks. Distinct franchises (Souls, Civ, FF, Zelda, Slay the Spire) deliberately untouched. Wired into `getEligibleGames()` in `lib/reroll.ts`. Commit `f4ee0fb`.

3. **Mood pre-classification** (`lib/curatedMoods.ts`) — 344 curated mood assignments from the bot pool now seed `inferMoodTags()` as a fallback between hand-tuned `GAME_MOOD_OVERRIDES` (52 titles) and genre auto-mapping. Games like Factorio→creative, Bloodborne→spooky, Dave the Diver→chill get correct moods on import without waiting for genre inference. Brain-off (bot) mapped to brainless (web app). Commit `f4ee0fb`.

## Pool composition

- 20 original hand-curated entries (blurbs preserved)
- 177 from RAWG API (metacritic ≥75, multi-genre sweeps)
- 117 supplemental (Game Awards 2023-2024 nominees, mood-gap fills, indie gems)
- 6 mood overrides fixing auto-mapping errors (Bloodborne, Diablo, Animal Crossing, etc.)

**Coverage matrix (mood x length tier):**
| Mood | Small | Medium | Large |
|------|-------|--------|-------|
| chill | 26 | 13 | 10 |
| intense | 76 | 85 | 23 |
| story-rich | 51 | 74 | 36 |
| brain-off | 26 | 25 | 8 |
| atmospheric | 71 | 68 | 27 |
| strategic | 16 | 48 | 28 |
| creative | 16 | 16 | 11 |
| emotional | 23 | 8 | 3 |
| spooky | 11 | 17 | 5 |

## Pending: bot deploy

Bot pool is on main but the Fly.io image hasn't been rebuilt. Brady needs to run `fly deploy` from `bot/` (CLI required — dashboard can't push new code, only restart existing image). Install: `brew install flyctl && fly auth login`.

## Health snapshot

- **Build:** Clean (verified after both commits)
- **Main tip:** `f4ee0fb`
- **Known bugs:** Pre-existing HLTB token fetch 404s, NinetiesMode lint warnings
- **Git:** Clean, all changes pushed

## Engineering backlog (updated priority)

1. ~~Pip bot pool 20 → 300~~ — **DONE** (344 games)
2. Landing page one-liner cleanup (§11 audit) — pending
3. Platform pages (`/steam-backlog-picker`, `/xbox-backlog-picker`, `/playstation-backlog-picker`) — pending
4. Resend transactional email wiring — pending
5. Product Hunt metadata (screenshots, video) — pending

## Distribution queue

| Step | Status |
|------|--------|
| r/SideProject | POSTED (2026-05-13) |
| r/patientgamers | Window opens ~2026-05-20 |
| AlternativeTo | Window opens ~2026-05-20 |
| Product Hunt | Needs video + 5 screenshots |
| Show HN | After PH week |

## Reviews overdue

- **Voice sweep on landing** — §11 audit flagged "subhead still redundant" and "Skip the overthinking" header. Not run since pre-launch.
- **Psychology audit on new pages** — `/why-deciding-is-hard` and `/alternatives` haven't been audited against psychology rules since shipping.
- **Accessibility pass on new pages** — manifesto, alternatives, archetype pages not contrast/keyboard checked.
- **Legal/privacy periodic check** — last run mid-April. No new data collection since, but periodic is good hygiene.

## Carry-forward

- Pip bot avatar (still Discord default)
- Sentry `pip` project (DSN not set)
- Pip-as-archetype on share/clear cards
- Game-specific trophy Pips (20 prompts written, not generated)
- Pre-seeding metadata cache (top 500 Steam games)
- Reddit feedback items: list view mobile, "More ways to play" UX, "Not for me" vs "Don't suggest" vs "Delete" confusion

---

*Updated 2026-05-14 ~08:45 PDT*
