# Metrics Radar — What We Track vs. What We Don't

**Purpose:** Make the retention/analytics blind spot explicit and actionable. This doc is the "what to greenlight at what MAU" switchboard — when usage grows, we don't guess, we flip the right switch.

**Premise:** Product decisions right now are feel-driven because cohort/retention data doesn't exist. Fine pre-launch, critical by 5k MAU. This doc catalogues the gap and defines the trigger points.

---

## Currently firing (GA4)

From grep of the codebase (not exhaustive — audit periodically):

- `reroll_accepted` / `reroll_skipped`
- `game_imported` with source (steam, xbox, psn, csv)
- `game_status_changed` (backlog → up next → playing → completed / moved on)
- `share_initiated` with destination (twitter, reddit, discord)
- Standard GA4: pageview, session, user, engagement time

## Currently NOT firing — the gap

### Retention / cohort
- **Cohort retention** — day-1 / day-7 / day-30 return rates by signup date
- **DAU / WAU / MAU ratios** — stickiness indicator
- **Churn signal** — last-seen date, idle users
- **Reactivation** — returning after 14+ days absent
- **Session depth** — events per session, time in app, multi-tab behavior

### Feature adoption
- **Archetype views** — how many users ever see their archetype; how many reroll; how many share
- **Theme usage** — which themes are actually chosen; abandonment rate per theme
- **Pick mode distribution** — Anything vs Quick Session vs Just 5 Mins vs Almost Done — are all four earning their slot?
- **Import funnel drop-off** — started vs completed imports, per source
- **Settings engagement** — how often users open settings, which accordion sections, what they change

### Core thesis (the inverted metric)
- **Time-to-pick** — landing → pick accepted, p50 / p90 / p99
- **Pick acceptance rate** — of picks shown, what % get "Let's Go"
- **Reroll count per session** — are users cycling endlessly (bad) or deciding fast (good)?
- **Play-confirmation signal** — currently none. Hard to prove they actually played. Proxies: Steam launch link clicked, status moved to Playing Now within 1h of pick, manually marked Completed.

### Outcome / loop completion
- **Time-to-completion** — pick → marked Completed
- **Abandonment rate** — pick → Moved On (within N days)
- **Completion cadence** — games cleared per month per user

### Onboarding
- **Import → first pick → first play** funnel, with drop-off %
- **Sample library → real import** conversion
- **Archetype reveal timing** — do users see it during onboarding or miss it?

### Error / quality signal
- Sentry is wired. But **silent failures** (bad enrichment results, empty reroll sets, HLTB misses) don't emit any signal. Users bounce without knowing why.

---

## MAU triggers — what to greenlight when

### 0–500 MAU (today)
**No changes.** Feel-driven is fine. Privacy posture stays simple. Don't over-instrument.

**One lightweight add:** event for `pick_accepted` with time-from-session-start. Free signal on the inverted-metric thesis.

### 500–2k MAU
Flip these on:

- **Cohort retention dashboard in GA4** (exists natively; needs user-property signup-date)
- **Supabase user query** for DAU/WAU/MAU via `auth.users.last_sign_in_at` (Supabase MCP will make this trivial)
- **Pick acceptance rate** event
- **Reroll count per session** event
- **Import funnel drop-off** event per source

### 2k–5k MAU
Start treating data as input:

- **Weekly metrics review** ritual — pick a Monday, look at last 7 days
- **Feature adoption audit** — archetype, themes, pick modes. Anything below 5% engagement gets scrutinized (but not auto-cut — archetypes are personality, remember)
- **Onboarding funnel** instrumented properly. This is the highest-leverage place to move a single number.
- **Reactivation signal** — passive event on return after 14d absence

### 5k–15k MAU
Active optimization:

- **A/B framework** decision — ship or skip. If ship, start with pick-modal copy variants.
- **Per-feature success metrics** — every new feature ships with its own event + a success criterion written down BEFORE launch
- **Heatmaps / session replay** — only if privacy-compatible (no PII captured). Budget check.
- **Supabase cost review** — at this scale, queries need RLS audit + index review

### 15k+ MAU
Product-org hygiene even for a solo builder:

- **Monthly metrics packet** — single page of top metrics, trends, surprises
- **Competitive re-scan** — run the refresh prompt from `docs/competitive-refresh-prompt.md`
- **Cost-per-user tracking** — paired with monetization trigger

---

## Data sources ranked by cost

| Source | Cost | Access |
|---|---|---|
| GA4 | Free (up to 10M events/mo) | Web UI + (eventually) BigQuery export |
| Supabase | Free until ~500 MAU, then scale pricing | Direct SQL; **Supabase MCP** once installed |
| Sentry | Free (5k errors/mo) | Web UI; **Sentry MCP** once installed |
| Vercel Analytics | Included | Web UI; **Vercel MCP** once installed |
| UptimeRobot | Free | Web UI |

**Implication:** once the three MCPs install (Supabase, Sentry, Vercel per `docs/mcp-install-2026-04-17.md`), I can pull a cross-source health snapshot in one command without leaving Claude Code.

---

## Manual Chrome/GA4 work I can do directly

Computer-use MCP is granted. When you want to inspect GA4 visually (e.g. add a custom dimension, create an exploration, set up a funnel report), ask and I'll do it in Chrome rather than you context-switching. Same for Supabase dashboard and Vercel analytics until the MCPs are wired.

---

## Dashboards to build (deferred, but spec'd)

These aren't urgent, but spec now so they're ready when MAU hits the trigger:

### Dashboard A: Core thesis health
- Time-to-pick (p50/p90)
- Pick acceptance rate
- Reroll count per session (distribution)
- One-session-to-play rate

### Dashboard B: Retention
- Cohort retention table (signup week × week 1/2/4/8)
- DAU/WAU/MAU + stickiness ratio
- Returning-user % over 30-day window

### Dashboard C: Feature adoption
- Archetype view/reroll/share rates
- Pick mode distribution
- Theme usage (% of sessions on each theme)
- Import source breakdown

### Dashboard D: Cost + scale
- Paired with `docs/scale-up-costs-2026-04-20.md` triggers
- Shows MAU against next cost threshold

---

## Actions — what to do now (all small)

- [ ] Add `pick_accepted_latency_ms` event — duration from session start to pick acceptance
- [ ] Add `reroll_count` property on `reroll_accepted` events — how many skips before accept
- [ ] Add `import_started` event paired with existing `game_imported` for funnel drop-off
- [ ] Add `archetype_viewed` / `archetype_rerolled` / `archetype_shared` events
- [ ] Once Supabase MCP is live: write a weekly-metrics SQL snapshot query and save to `docs/weekly-metrics-query.sql`

All five are 10–20 min each. Not urgent. Do them on the next instrumentation sprint.

---

## Open question

**Pick confirmation is unprovable.** We know they accepted the pick, not that they played. Options:
- Trust the signal (most users who accept probably play)
- Ask explicitly ("Did you play?" nudge next session) — adds session length, fights thesis
- Use status-change within N hours as a proxy (Playing Now → Completed within N days = definitely played)

Current stance: trust the signal + proxy via status change. Revisit at 5k MAU if behavior contradicts assumptions.
