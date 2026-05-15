# Competitive Landscape Refresh — Prompt

Paste this into a fresh Claude Code session inside the `getplaying` repo when it's time to refresh the competitive scan (roughly monthly).

---

## Task

You are refreshing the competitive landscape for **Inventory Full** (inventoryfull.gg). The prior scan lives at `docs/competitive-landscape-YYYY-MM-DD.md` (use the most recent dated file). Read it first. Then produce a new dated file `docs/competitive-landscape-<today>.md` that reflects changes since the prior scan.

## Context you need

**Product thesis.** Inventory Full solves game-library decision paralysis. User owns more games than they can play, can't decide, closes launcher. We pick ONE game from their owned library using mood + time. Success metric is **inverted — less time in our app = better outcome.** We win when they close the tab and go play.

**Locked architectural decisions (do not flag competitors for "catching up" on these — they are deliberate):**
- localStorage authoritative; Supabase opt-in cloud sync only
- guest mode is first-class; account never required
- no ads, no third-party data sharing, no cross-site tracking beyond GA4
- pick flow is 2 inputs maximum (mood + time); any new filter must displace one
- status cycle: Backlog → Up Next → Playing Now → Completed (or Moved On)
- one pick at a time, never a shortlist

**Solo-builder reality.** No marketing spend, no team, no PR budget. Our only durable edge is thesis discipline.

## What to refresh

### 1. Update the last-known competitor list
The prior scan included these; verify each is still live, check for new features or pricing changes, and note any that died or pivoted:

- **Direct pickers:** Backlog Roulette, Pick a Game (pickaga.me), Steam Roulette, Steam Randomizer, What Should I Steam, SteamRandomPicker, Playnite Random Game Picker + plugins, GameGenie, PlayNxt, Mood Twist AI
- **Adjacent trackers that could pivot:** Backloggd, Grouvee, Backloggery, Infinite Backlog, HowLongToBeat, GG| (ggapp.io), PlayTracker, GAMEYE, TrueAchievements
- **Launcher-native:** Steam Discovery Queue / "Recommended For You," Epic "Pick for me," Xbox homepage, PS curated rails
- **AI chatbot use case:** ChatGPT / Claude / Gemini "what should I play" — check for any library-integration apps or plugins that close the paste-in gap

For each survivor, note:
- Any new features shipped since last scan (check changelogs, Medium dev updates, X/Twitter accounts)
- Pricing changes
- Platform additions (especially mobile / cross-platform imports)
- Any positioning shift toward or away from paralysis-solving

### 2. Find new entrants
Search for net-new products since the last scan date:

Suggested queries (adapt to the year):
- "what should I play" game picker app <current year>
- AI game recommender backlog <current year>
- Steam library random picker <current year>
- video game backlog tracker launch <current year>
- game decision paralysis app
- "pick a game" from my library app

Also check:
- Product Hunt "games" category for the scan period
- r/gaming and r/pcgaming "I built" posts since last scan
- Hacker News Show HN threads referencing game backlogs

### 3. Flag deaths and pivots
Any competitor from the prior list that:
- Returns 404 / dead domain
- Announced shutdown
- Pivoted away from paralysis/backlog (e.g., became a social network, became an ad platform, got acquired)

Call these out in a short "Changes since last scan" section at the top of the new doc.

## Methodology requirements

- Use **WebSearch** liberally (multiple queries, parallel where possible).
- Use **WebFetch** on any competitor whose positioning looks thesis-adjacent (picker, mood/time inputs, owned-library scope) to get the real landing copy — not search summaries.
- Do **not** invent competitors from training data. If you can't verify a tool is currently live, say so.
- Cite source URLs inline or in a Sources section for anything new.

## Output

Produce a single markdown file at `docs/competitive-landscape-<today>.md` with this structure (same as prior scan):

1. **Changes since last scan** (new section at top — deaths, pivots, new entrants, notable feature launches)
2. **Direct competitors** (updated)
3. **Adjacent / indirect competitors** (updated)
4. **Overlap matrix** (add rows for new entrants, adjust Yes/No cells where reality changed)
5. **Threat assessment** (re-rate threat levels; explain what changed)
6. **Gaps we're filling that nobody else is** (honest — did any gap close since last scan?)
7. **Gaps nobody fills / open white space** (flag each against thesis)
8. **Reference / methodology** (sources, scan date, known limits)

Length target: 1500–2500 words. Be concise; no filler.

## Tone

Write for Brady — solo builder, low-BS. No self-flattery. If a competitor got materially better, say so plainly. If we lost a gap, say so plainly. The purpose of this doc is not marketing copy; it's a map Brady uses to decide where to spend the next month.

## When done

Return a ~200-word summary of: what changed since last scan, the biggest new threat (if any), any gap that closed, and any recommended move. Do not paste the full doc back — the caller will read the file.
