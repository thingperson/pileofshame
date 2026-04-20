# Scale-Up Costs — 2026-04-20

Pricing research for every service Inventory Full depends on, projected at 100 / 1k / 5k / 10k / 50k MAU. Companion to `scale-up-plan.md` (playbook) — this one is the spreadsheet.

All pricing pulled from live pricing pages on 2026-04-20. See references at bottom.

---

## 1. Current service inventory

Verified against `package.json`, `docs/ROADMAP.md` env var section, and `lib/`.

| Service | Plan today | Free tier limits | Monthly cost today |
|---|---|---|---|
| **Vercel** | Hobby | 100GB fast data transfer, 1M function invocations, 4 CPU-hrs, 1M edge requests | $0 |
| **Supabase** | Free | 500MB DB, 50K MAU, 5GB egress, 1GB storage, paused after 7 days inactivity | $0 |
| **RAWG** | Free | 20K requests/mo (non-commercial, requires backlink) | $0 |
| **HowLongToBeat** | Direct HTTP (no dep) | No official tier — informal rate limits, scraping risk | $0 |
| **OpenXBL** | Free | 150 req/hr | $0 |
| **Sentry** | Developer | 5K errors/mo, 1 user | $0 |
| **UptimeRobot** | Free | 50 monitors, 5-min interval | $0 |
| **Google Analytics 4** | Free | Effectively unlimited for our volume | $0 |
| **PSN public GraphQL** | No auth | User's own token passes through; rate-limited per user | $0 |
| **Steam Web API** | Public endpoints | No key needed for public library data | $0 |
| **Domain (inventoryfull.gg)** | Annual | — | ~$1.25/mo amortized |
| **Resend** (planned, SMTP for Supabase auth) | Free | 3K emails/mo, 1 domain | $0 |

**Current run-rate: ~$1.25/mo** (domain only).

---

## 2. Projected costs at MAU milestones

Assumptions (kept conservative, documented so they can be revised):

- **Avg library size per user:** 150 games.
- **RAWG enrichment:** ~30% cache miss on import (others hit shared L2 `game_metadata` table). At scale that ratio drops — the cache compounds.
- **Sessions per MAU per month:** ~6 (a pick-and-go user returns weekly-ish; `less time in app = success` keeps this low).
- **Page weight:** ~800KB per session including OG asset fetches.
- **Cloud sync adoption:** 20% of MAU opt in. The rest are localStorage-only and cost nothing on the DB side.
- **Sentry errors:** ~1 per 200 sessions at steady state.
- **Imports per MAU per month:** 0.3 (most users import once, occasional refresh).

| Service | 100 MAU | 1k MAU | 5k MAU | 10k MAU | 50k MAU |
|---|---|---|---|---|---|
| Vercel (bandwidth + functions) | $0 | $0 | $0 (just fits Hobby) | **$20** (Pro needed) | ~$40 (Pro + ~50GB overage) |
| Supabase | $0 | $0 | $0 | **$25** (Pro, 10k > 50k MAU limit buffer) | ~$35 (Pro + MAU + egress overage) |
| RAWG | $0 (≈450 req/mo) | $0 (≈4.5k req/mo) | $0 (≈22k req/mo, caching kicks in — borderline) | **$149** (Business) | $149 or custom |
| HLTB | $0 | $0 | $0 (cache L2 this hard) | $0 | $0 (or mitigation cost) |
| OpenXBL | $0 | $0 | $0 (spiky but 150/hr still holds) | possible paid tier (~$10–30) | likely paid tier |
| Sentry | $0 | $0 (≤5k errors) | **$26** (Team, annual) | $26 | ~$40 (Team + overage) |
| UptimeRobot | $0 | $0 | $0 | $0 | $0 |
| GA4 | $0 | $0 | $0 | $0 | $0 |
| Resend (transactional only) | $0 | $0 (≤3k) | $0 (≤3k: auth emails stay low because most users stay in guest mode) | ~$20 (Pro if cloud sync uptake grows) | $20 |
| Domain | $1.25 | $1.25 | $1.25 | $1.25 | $1.25 |
| **TOTAL** | **~$1** | **~$1** | **~$27** | **~$241** | **~$285–320** |

### Math for the two big jumps

**5k → 10k MAU:** three services graduate at once.

- **Supabase Free → Pro** ($25/mo): Free tier caps at 50k MAU *lifetime* auth users; at 10k *active* MAU with 20% opt-in cloud sync that's ~2k cloud profiles, which fits free DB size, but traffic-day egress starts biting. Upgrade is defensive, not strictly forced.
- **Vercel Hobby → Pro** ($20/mo): 10k MAU × 6 sessions × 800KB ≈ 48GB/mo — under 100GB. BUT Hobby has no overage runway; one viral day pushes us over and the site degrades. Pro is insurance.
- **RAWG Free → Business** ($149/mo): this is the sharp one. Free tier is *non-commercial only* per their terms. The moment monetization ships we're out of ToS on free. Also the 20k/mo limit gets tight once new users import games outside our L2 cache.

**Cost per user at 10k MAU: ~$0.024/mo.** Below Vercel Pro's per-seat cost for a team. Still under most SaaS ARPU thresholds — but *above zero*, which is the monetization trigger.

**50k MAU:** RAWG Enterprise conversation opens, Sentry Team hits overage, Vercel Pro + Supabase Pro take ~50GB combined bandwidth overage. Realistic run-rate $285–320 before optimizations.

---

## 3. Bottleneck services — what breaks first, what costs most

### Breaks free tier first: **RAWG + Sentry (tie)**

- **RAWG:** 20k req/mo cap. Hits around 2k–4k MAU depending on import mix. Worse: the *non-commercial* license clause is a hard legal line the moment we show affiliate revenue or a paid tier.
- **Sentry:** 5k errors/mo. A single bad deploy to a 2k-MAU audience can blow this in a day.

### Becomes expensive fastest: **RAWG**

Jump from $0 → $149/mo with no middle tier. That's the single biggest bill at 10k MAU and it's non-negotiable the moment commercial intent shows up. Every other service scales smoothly; RAWG is a cliff.

### Mitigation map

| Bottleneck | Mitigation | Effort |
|---|---|---|
| RAWG quota + license | L2 cache in Supabase `game_metadata` is already live. Pre-seed top 10k titles. Consider IGDB as secondary source. | Medium — seed script + fallback logic |
| HLTB scrape fragility | Aggressive cache-and-forget in Supabase. Only re-enrich on explicit user action. | Low — already partially done |
| Sentry errors | Lower sample rate in `sentry.client.config.ts` (e.g., 0.25). Filter noisy errors (expected network failures) in `beforeSend`. | Low — one-session task |
| Vercel function invocations | Keep imports on edge runtime where possible. Don't call functions on idle tabs. | Low — current path |
| Supabase egress | Push cover art to Vercel image optimization / Cloudflare in front. Cache client-side. | Medium |
| OpenXBL 150/hr | Per-user token model means limit is per our server IP. Queue imports, back off on 429. | Medium if we hit it |

---

## 4. Cost optimization playbook — before monetization

Concrete moves, ordered by ROI.

1. **L2 metadata cache hit-rate target: 90%+.** Every cache hit is a RAWG call we didn't make. Add a daily seed job that pre-warms the cache for top imported titles seen in the last 7 days. One Supabase scheduled function.
2. **Sentry sample rate at 0.1 in prod** for traces, 1.0 for errors, and tight `beforeSend` filters for expected network errors (PSN timeouts, HLTB 403s). Keeps us well under 5k/mo through 5k MAU.
3. **GA4 event budgeting.** We already have `docs/INSTRUMENTATION.md`. Audit event volume quarterly — GA4 is free at our scale but verbose event payloads bloat analysis.
4. **Supabase RLS efficiency.** Every `cloudSync` query should use indexed columns. No full-table scans. Cover the common read paths (`user_id`, `game_id`) with composite indexes.
5. **Vercel cold-start mitigation.** Keep OG image fonts cached via module-level const, not per-request fetch. Avoid dynamic imports in hot paths. Current edge runtime use is correct.
6. **HLTB pre-seeding.** Top 1,000 games account for ~60% of imports (long-tail inventory). Seed those once; eliminate the scrape dependency for the common case.
7. **Image proxying.** Move cover art through Vercel's image CDN or Cloudflare. Drops Supabase egress significantly once storage usage grows.
8. **Disable Sentry performance monitoring** unless actively debugging. Traces are the expensive line item, not errors.

Run all eight and the 10k MAU run-rate drops from ~$241 to ~$70 (Vercel Pro + Supabase Pro + domain + Resend Pro), assuming RAWG stays within Business — the one we can't shrink.

---

## 5. Monetization trigger thresholds

Paired with the separate monetization spec. These are the numbers.

| Milestone | Cost/mo | Cost per MAU | Action |
|---|---|---|---|
| **0 – 2k MAU** | $0–$1 | $0 | Stay free. Axiom holds: less time in app = success. No monetization. |
| **2k – 5k MAU** | $1–$27 | <$0.01 | Stay free. Sentry to Team if error volume demands it — that's the only paid upgrade. |
| **5k MAU hard floor** | $27+ | ~$0.005 | **Ship monetization infrastructure (not the charge yet).** Stripe integration, pricing page draft, tier definition. |
| **10k MAU OR RAWG commercial trip** | $150–$241 | $0.015–$0.024 | **Monetization live.** Whichever triggers first. RAWG license is the hard line even if MAU is lower. |
| **25k MAU** | ~$260 | ~$0.010 | Validate unit economics. If free-tier conversion is <2% paid, revisit pricing or product. |
| **50k MAU** | ~$285–$320 | ~$0.006 | Team plan conversations (Supabase Team $599, Vercel Enterprise) — only if infra strain demands, not reflexively. |

**The monetization trigger is 5k MAU OR RAWG commercial-use license violation, whichever hits first.** The second one could hit at 2k MAU the moment we ship a Stripe button. Plan accordingly.

---

## References

- Vercel pricing: https://vercel.com/pricing
- Supabase pricing: https://supabase.com/pricing
- RAWG API pricing: https://rawg.io/apidocs
- Sentry pricing: https://sentry.io/pricing/
- Resend pricing: https://resend.com/pricing
- OpenXBL pricing: https://xbl.io/about
- UptimeRobot pricing: https://uptimerobot.com/pricing/
- Supabase Pro details: https://uibakery.io/blog/supabase-pricing (cross-reference)
