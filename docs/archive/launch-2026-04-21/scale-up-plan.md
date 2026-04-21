# Scale-Up Plan — Inventory Full

What to do when users start showing up. Not if, when. This is the playbook.

---

## Current Architecture (Free Tier)

| Service | Plan | Limit | Cost |
|---------|------|-------|------|
| **Vercel** | Hobby | 100GB bandwidth, 100 serverless fn invocations/day | $0 |
| **Supabase** | Free | 500MB DB, 50K auth users, 2GB bandwidth | $0 |
| **RAWG API** | Free | 20K requests/month | $0 |
| **HLTB** | Scraped | No official API, rate-limited | $0 |
| **Google Analytics** | Free | Unlimited | $0 |
| **Domain** | inventoryfull.gg | Annual renewal | ~$15/yr |

**Current monthly cost: ~$0**

---

## Trigger Points (When to Act)

### Tier 1: Early Traction (100-500 DAU)
**Signs**: Discord post gets shared, Reddit thread, a YouTuber mentions it
**Timeline to act**: 24-48 hours

**What breaks first:**
- RAWG API limit (20K/month = ~667/day). With 500 DAU each importing 50+ games, you burn through this in a day.
- HLTB scraping gets rate-limited or blocked
- Vercel serverless function cold starts slow down import flows

**Actions:**
1. **RAWG**: Upgrade to paid ($5/month for 500K requests) or cache aggressively in Supabase
2. **HLTB**: Build a Supabase cache table. Enrich once, store forever. Stop hitting HLTB after first lookup.
3. **Vercel**: Monitor function invocations. Hobby plan allows 100K/month. Should be fine at this tier.
4. **Supabase**: 500MB is generous for JSON blobs. Monitor with dashboard.

**Estimated cost at Tier 1: $5-20/month**

### Tier 2: Growing (500-5,000 DAU)
**Signs**: Organic Google traffic, App Store-style listing sites, gaming press mention
**Timeline to act**: 1-2 weeks

**What breaks:**
- Supabase free tier auth limit (50K total users)
- Vercel bandwidth (100GB is ~200K page loads with assets)
- RAWG enrichment queue creates API bottleneck
- Cold start latency on serverless becomes noticeable

**Actions:**
1. **Vercel Pro** ($20/month): 1TB bandwidth, faster builds, analytics
2. **Supabase Pro** ($25/month): 8GB DB, 100K auth users, 250GB bandwidth
3. **RAWG cache layer**: Store all enrichment results in Supabase. Only call RAWG for new/unknown games.
4. **HLTB cache**: Same as above but more critical. Pre-seed top 1,000 games.
5. **CDN for covers**: Proxy cover images through Vercel's image optimization or Cloudflare
6. **Error monitoring**: Add Sentry free tier ($0) for catching runtime errors at scale

**Estimated cost at Tier 2: $45-75/month**

### Tier 3: Viral Moment (5,000-50,000 DAU)
**Signs**: Front page of Reddit, major YouTuber review, Hacker News
**Timeline to act**: Hours

**What breaks:**
- Everything above, faster
- Supabase connection pooling limits
- Vercel edge function execution time limits
- Import APIs (Steam, Xbox, PSN) may rate-limit our server IP

**Actions:**
1. **Vercel Enterprise** ($150+/month) or migrate to self-hosted on Railway/Fly.io
2. **Supabase Team** ($599/month) or migrate to self-hosted Postgres
3. **Queue system**: Move imports off serverless into a background job queue (Inngest, Trigger.dev — both have free tiers)
4. **Rate limiting**: Add per-user rate limits on import endpoints
5. **Cloudflare**: Put in front of everything ($0 for basic plan, $20 for Pro)
6. **Read replicas**: Supabase supports read replicas on Team plan

**Estimated cost at Tier 3: $200-800/month**

---

## Caching Strategy (Pre-Build Now)

### What to cache and where

| Data | Cache Location | TTL | Priority |
|------|---------------|-----|----------|
| RAWG game metadata | Supabase `game_metadata` table | 30 days | HIGH |
| HLTB completion times | Supabase `game_metadata` table | 90 days (rarely changes) | HIGH |
| Cover image URLs | Already stored on game objects | Permanent | DONE |
| RAWG search results | In-memory (server-side) | 1 hour | MEDIUM |
| Steam profile lookups | Redis/Upstash (if needed) | 15 min | LOW |

### Supabase migration to add (when ready):

```sql
CREATE TABLE game_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rawg_slug TEXT UNIQUE,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  cover_url TEXT,
  metacritic INTEGER,
  genres TEXT[],
  description TEXT,
  hltb_main REAL,
  hltb_complete REAL,
  mood_tags TEXT[],
  is_non_finishable BOOLEAN DEFAULT FALSE,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  hltb_fetched_at TIMESTAMPTZ,
  CONSTRAINT unique_normalized UNIQUE (normalized_name)
);

CREATE INDEX idx_metadata_name ON game_metadata (normalized_name);
```

This separates "game knowledge" (shared across all users) from "user library" (per-user). Every enrichment lookup checks this table first, only hits APIs on miss.

---

## Import Scaling

### Current: Direct API calls from serverless functions
Each user import hits Steam/Xbox/PSN APIs directly from Vercel serverless.

### Scaling path:
1. **Short-term**: Add Upstash Redis ($0 free tier, 10K commands/day) for caching Steam profile lookups
2. **Medium-term**: Move imports to background jobs (Inngest free tier: 25K events/month)
3. **Long-term**: Dedicated import worker on Railway ($5/month) with its own rate limiting

### Rate limit targets:
- Steam API: 100K calls/day (generous, but shared IP on serverless is risky)
- Xbox API: Unclear limits, monitor
- PSN API: Unofficial, fragile — cache aggressively

---

## Monitoring (Add Now, Free)

1. **Vercel Analytics** (built-in on Pro, basic on Hobby)
   - Page views, unique visitors, top pages
   - Already have GA4 for events

2. **Sentry** (free tier: 5K errors/month)
   - `npm install @sentry/nextjs`
   - Catches runtime errors, slow transactions
   - Add BEFORE you need it

3. **Uptime monitoring**: BetterUptime free tier or UptimeRobot
   - Ping inventoryfull.gg every 5 min
   - Alert on downtime via Discord webhook

4. **Supabase dashboard**
   - DB size, auth users, API calls
   - Check weekly

---

## Emergency Playbook (If We Go Viral)

**Hour 1:**
- [ ] Check Vercel dashboard: bandwidth, function invocations
- [ ] Check Supabase dashboard: connections, DB size
- [ ] If hitting limits: upgrade Vercel to Pro ($20), Supabase to Pro ($25)

**Hour 2-6:**
- [ ] Add Cloudflare DNS (free) for caching static assets
- [ ] Disable auto-enrichment for new users (let them import, enrich later)
- [ ] Add simple rate limiting: max 3 imports per user per hour

**Day 1-3:**
- [ ] Build game_metadata cache table (SQL above)
- [ ] Migrate enrichment to check cache first
- [ ] Pre-seed cache with top 500 Steam games
- [ ] Monitor HLTB — if blocked, serve from cache only

**Week 1:**
- [ ] Evaluate sustained traffic vs. spike
- [ ] If sustained: commit to paid plans
- [ ] If spike: ride it out on upgraded free tiers, downgrade after

---

## Cost Projections

| DAU | Monthly Cost | Revenue Needed |
|-----|-------------|----------------|
| 0-100 | $0 | $0 (hobby project) |
| 100-500 | $5-20 | Tips cover it (Buy me a slice) |
| 500-2K | $45-75 | Need ~$75/mo from tips or sponsors |
| 2K-10K | $200-400 | Need monetization strategy |
| 10K+ | $500+ | Premium tier or sponsorship deals |

---

## Monetization Triggers

Don't monetize until you have a reason to. But be ready:

### Tier 1: Tips (NOW — already live)
- "Buy me a slice" link exists
- Ko-fi or Buy Me a Coffee page
- No pressure, just there

### Tier 2: Premium Theme Pack ($3 one-time)
- Trigger: 1,000+ registered users
- What: 3-5 exclusive themes (neon, retro-futurism, pastel, etc.)
- Implementation: Stripe Checkout + Supabase flag
- Complexity: Low (themes are CSS-only)

### Tier 3: Pro Features ($2/month or $15/year)
- Trigger: 5,000+ registered users
- What: Cloud sync across devices, priority enrichment, export to CSV
- What stays free: Everything core (import, reroll, tracking, celebration)
- Implementation: Stripe subscription + Supabase RLS policies

### Tier 4: Sponsorship
- Trigger: 10,000+ MAU
- What: "Powered by [game retailer]" in deal suggestions
- Non-intrusive: only show on relevant surfaces (backlog payback, deal badges)
- Revenue: $500-2,000/month depending on traffic

---

## Apr 14 2026 Reconciliation

The original plan above was written before several pieces shipped or got rethought. Reading it back, here's what's stale, what's new, and what got cheaper than expected.

### Already shipped (was "future" in original plan)
- ✅ **Sentry** — wired and live in production. Free tier, 5K errors/month ceiling. **Gap:** API route catches still log via `console.error`, not `Sentry.captureException`. Engineering blocker pending in MVP sprint.
- ✅ **Supabase game_metadata cache** — migration `002_game_metadata_cache.sql` shipped. Means RAWG/HLTB enrichment misses are the rare case, not the default.
- ✅ **HLTB cache** — same migration covers it. The "20K RAWG calls/month" math in Tier 1 is way too pessimistic now.
- ✅ **UptimeRobot on `/api/health`** — pinging every 5 min. **Gap:** the endpoint returns `ok` without probing Supabase or upstream. Pending engineering blocker.
- ✅ **Sample-onboarding PWA flow** — original plan didn't account for this. It bypasses imports entirely for first-time users, which significantly delays the Tier 1 RAWG-burn problem.
- ✅ **Milestone cron + ntfy alerts** (shipped Apr 14) — Brady's phone pings on user/share milestones. Replaces the "check Vercel dashboard hourly" implicit assumption in the Emergency Playbook.
- ✅ **Cookie banner with consent-gated GA** (shipped Apr 14) — original plan didn't address EU/UK opt-in. Gap closed.

### Newly identified gaps not in original plan
- ⚠️ **In-memory rate limiting** (`lib/rateLimit.ts`) — per serverless function instance. At 500+ concurrent users on Vercel, instances scale out and the limit becomes per-instance, not global. **Mitigation tier:** Upstash Redis at Tier 2 (~$0 free tier, 10K commands/day).
- ⚠️ **ITAD ID cache is in-memory** (`app/api/deals/route.ts` line 18) — `idCache = new Map()` lives per instance, dies on cold start. Every cold start re-pays the lookup cost. **Mitigation:** move to `game_metadata` table or Upstash. Low priority until ITAD becomes a bottleneck.
- ⚠️ **No fetch timeouts on external APIs** — RAWG/HLTB/PSN/Steam/Xbox/ITAD calls have no `AbortController`. A slow upstream pegs a serverless function until Vercel's 10s timeout. Single user can DoS our own infra. **Engineering blocker, current sprint.**
- ⚠️ **NPSSO tokens flow through Sentry breadcrumbs** — request body of POST `/api/psn` may include the token in error reports. Need `beforeSend` scrubber. **Engineering blocker, current sprint.**
- ⚠️ **PSN trophy pagination unbounded** — up to 20 sequential calls with 300ms sleeps. At Vercel Hobby's 10s timeout, a user with 1000+ trophies will fail the request and have a bad first impression. Cap at 5 pages (1000 trophies). **Engineering blocker, current sprint.**

### Cost ladder — reconciled with MVP-SPRINT.md

The original Tier 2 estimate ($45-75) was reasonable but the rationale ("Sentry $0, RAWG $5-20") doesn't apply post-cache. MVP-SPRINT.md is now the source of truth for cost tiers. Summary:

| MAU | Monthly | Notes |
|---|---|---|
| 0–10k | $0 | Hobby + Free everything covers it |
| 10k–25k | $40 | Vercel Pro + Resend paid (email infra) |
| 25k–50k | $91 | + Supabase Pro + Sentry Team |
| 50k–100k | $126 | + Upstash Redis + bandwidth |
| 100k+ | $226+ | Sponsorship and/or Pro tier carrying it |

**Differences from original Tier projections:**
- Tier 1 ($5-20) → effectively $0 thanks to caching. RAWG paid plan not needed.
- Tier 2 ($45-75) → $40 if email is the only addition. Lower if not yet sending marketing.
- Tier 3 ($200-800) → MVP-SPRINT puts this at $91-126 for 25-100k MAU. Original was assuming heavier infra moves than we'll actually need at that range.
- Tier 4 estimate ($500+ at 10k MAU) → too aggressive. Real ceiling is more like 25-50k before infra costs become real.

### Caching strategy — what actually shipped vs. what was planned

| Original plan | Reality |
|---|---|
| `game_metadata` table with all the columns above | ✅ Shipped (`002_game_metadata_cache.sql`) |
| In-memory RAWG search results (1hr TTL) | ❌ Not built. Cold-start re-fetches. Low priority. |
| Redis/Upstash for Steam profile lookups | ❌ Not built. Cold-start re-fetches. Move to Upstash at Tier 2. |
| Pre-seed cache with top 500 Steam games | ❌ Not built. Should add to launch checklist — meaningfully reduces first-import latency. |

**Pre-seed cache is worth doing before launch.** Even 100 most-popular Steam titles would cover most first-time imports' enrichment hits. ~30 min of work, big UX win on day-one demand spike.

### Emergency Playbook — corrections

Hour 1 list is fine. Hour 2-6:
- "Disable auto-enrichment for new users" → already cache-backed, less critical
- "Add simple rate limiting: max 3 imports per user per hour" → **rate limiting already exists per-route, but the per-instance limitation noted above means it won't fully hold at viral scale.** The real Hour 2-6 move at scale is Upstash Redis + global rate limit, not just disabling features.

### Monetization triggers — reconciled

Original plan's Tier 2 ($3 theme pack) and Tier 3 ($2/month Pro) align with MVP-SPRINT.md's monetization stance. Theme paywall is the obvious first move (Brady's note: "you'd be surprised what they say matters vs what gets their wallet out"). Build the toggle into the theme system so themes can be marked premium without a refactor — this should land as part of the next theme work, not a separate sprint.

### What this doc should become

Long-term: this doc is a hybrid of "current architecture" and "what we'll do later." When the sprint ends, split into:
- `docs/architecture.md` — current state of truth
- `docs/scale-playbook.md` — what to do when X happens

Today: not worth the file shuffle. Keep this section as the authoritative reconciliation until the sprint ships.
