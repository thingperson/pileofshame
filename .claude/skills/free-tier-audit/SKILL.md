---
name: free-tier-audit
description: Check proximity to free tier limits on all external services (Vercel, Supabase, RAWG, OpenXBL, Sentry, HLTB, ITAD). Run monthly or before expecting traffic spikes.
---

# Free Tier Audit

Check how close we are to hitting free tier limits on all external services. Reference `docs/scale-up-plan.md` for documented limits and upgrade paths.

## Procedure

### 1. Read Reference Documents

- Read `docs/scale-up-plan.md` for documented limits, trigger points, and upgrade paths
- Read `package.json` for current dependencies (Sentry SDK, etc.)
- Read `.env.example` or `.env.local` (if accessible) for which API keys are configured
- Read `next.config.ts` or `next.config.js` for any relevant configuration (image domains, rewrites, etc.)

### 2. Check Each Service

For each service, report: **Service Name**, **Current Plan**, **Key Limits**, **Estimated Headroom**, **Trigger Point (DAU)**, **Upgrade Path + Cost**.

#### Vercel (Hobby Plan)

| Limit | Value | How to Check |
|-------|-------|-------------|
| Bandwidth | 100GB/month | Vercel dashboard (can't check from CLI) |
| Serverless function execution | 100h/month | Vercel dashboard |
| Function timeout | 10s per invocation | Check API route complexity |
| Concurrent builds | 1 | Matters for deploy speed, not functionality |
| Team members | 1 (personal) | N/A for solo builder |

**Estimate headroom:**
- Check `npm run build` output for bundle sizes
- Check `.next/` output if available for static page sizes
- Estimate: ~500KB per page load average = ~200K page loads before bandwidth cap
- Each import flow hits serverless functions. At 500 DAU with 1 import each = 500 function calls/day = ~15K/month (well within limits)

**Trigger point:** ~1,000-2,000 DAU (bandwidth is the bottleneck)
**Upgrade:** Vercel Pro at $20/month (1TB bandwidth, 1000h functions)

#### Supabase (Free Plan)

| Limit | Value | How to Check |
|-------|-------|-------------|
| Database size | 500MB | Supabase dashboard |
| Monthly active users (auth) | 50K | Supabase dashboard |
| Bandwidth | 2GB/month | Supabase dashboard |
| File storage | 1GB | Supabase dashboard |
| Edge functions | 500K invocations/month | Supabase dashboard |
| Realtime connections | 200 concurrent | Supabase dashboard |

**Estimate headroom:**
- Each user's game library JSON: ~5-50KB depending on library size
- 1,000 users * 25KB avg = 25MB (5% of limit)
- Auth: 50K total users is generous for early stage

**Trigger point:** ~10K registered users (database size), ~50K total signups (auth limit)
**Upgrade:** Supabase Pro at $25/month (8GB DB, 100K auth, 250GB bandwidth)

**CLI check:** Grep codebase for Supabase client usage:
- Search for `supabase` imports in `lib/` and `app/api/`
- Check if RLS policies are configured
- Check if any large blob storage is happening

#### RAWG API (Free Plan)

| Limit | Value | How to Check |
|-------|-------|-------------|
| Requests | 20,000/month | RAWG dashboard |

**Estimate headroom:**
- Search codebase for RAWG API calls (grep for `rawg` or `api.rawg.io`)
- Check if in-memory caching exists (expected: 1hr TTL, 500 entries)
- Each game enrichment = 1-2 API calls (search + details)
- With caching: 500 unique games cached = 500 daily users importing 10 games each could hit limit in ~2-4 days without cache hits
- With good cache hit rate (80%+): ~4,000 unique games/month before limit

**Trigger point:** ~200-500 DAU (depending on cache hit rate)
**Upgrade:** RAWG paid at ~$5/month for 500K requests, or build Supabase cache layer

#### OpenXBL (Free Plan)

| Limit | Value | How to Check |
|-------|-------|-------------|
| Requests | 150/hour | OpenXBL dashboard |

**Estimate headroom:**
- Xbox imports are one-time per user (not continuous polling)
- Each Xbox import = 1-3 API calls (profile + games + achievements)
- 150/hour = max 50 Xbox imports per hour
- Most users import once and done

**Trigger point:** 50+ simultaneous Xbox imports in one hour (viral moment only)
**Upgrade:** OpenXBL paid plans start at ~$5/month

#### Sentry (Free Plan)

| Limit | Value | How to Check |
|-------|-------|-------------|
| Errors | 5,000/month | Sentry dashboard |
| Performance transactions | 10,000/month | Sentry dashboard |
| Attachments | 1GB | Sentry dashboard |

**Estimate headroom:**
- Check if Sentry SDK is installed: grep for `@sentry/nextjs` in package.json
- Check `sentry.client.config.ts` and `sentry.server.config.ts` for sample rates
- At 2% error rate with 500 DAU: ~300 errors/month (well within limits)
- Transaction sampling rate matters: check `tracesSampleRate` value

**Trigger point:** depends on error rate. At 1% with 5,000 DAU = ~1,500 errors/month (fine). At 5% with 5,000 DAU = ~7,500 (over limit).
**Upgrade:** Sentry Team at $26/month (50K errors, 100K transactions)

#### Google Analytics (Free)

| Limit | Value |
|-------|-------|
| Events | 10M/month (GA4 free) |
| Custom dimensions | 50 event-scoped, 25 user-scoped |
| Data retention | 14 months |

**Headroom:** Effectively unlimited for our scale. GA4 free tier handles millions of events.

**Trigger point:** N/A (would need massive scale to hit GA4 limits)
**Upgrade:** GA4 360 at $50K+/year (not relevant for us)

#### HLTB (HowLongToBeat)

| Limit | Value |
|-------|-------|
| Official API | None (scraping) |
| Rate limiting | Unknown, likely IP-based |

**Risk assessment:**
- Check codebase for HLTB integration: grep for `howlongtobeat` or `hltb`
- Scraping is inherently fragile. Could break with any site update.
- Rate limiting could kick in at scale

**Trigger point:** Unpredictable. Could be blocked at any user count.
**Mitigation:** Build Supabase cache for HLTB data (90-day TTL, rarely changes). Pre-seed top games.

#### IsThereAnyDeal (ITAD)

| Limit | Value | How to Check |
|-------|-------|-------------|
| API requests | Check ITAD dashboard | ITAD API key required |

**Estimate headroom:**
- Search codebase for ITAD integration: grep for `isthereanydeal` or `itad`
- If deal badges are client-side cached, API calls are limited to unique game lookups
- ITAD free tier is generous for hobbyist projects

**Trigger point:** Check their current published limits
**Upgrade:** Contact ITAD for higher tier

#### UptimeRobot (Free Plan)

| Limit | Value |
|-------|-------|
| Monitors | 50 |
| Check interval | 5 minutes |
| Alert contacts | 1 |

**Headroom:** We likely use 1-3 monitors. 50 is plenty.

**Trigger point:** N/A
**Upgrade:** UptimeRobot Pro at $7/month (more monitors, 1-min intervals)

### 3. Codebase Analysis

Run these searches to estimate actual API usage patterns:

```bash
# Find all external API calls
grep -r "fetch\|axios\|got" app/api/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules

# Find caching implementations
grep -r "cache\|TTL\|ttl\|Cache\|revalidate" lib/ app/api/ --include="*.ts"

# Find rate limiting
grep -r "rate.limit\|rateLimit\|throttle" lib/ app/api/ --include="*.ts"

# Check Sentry config
cat sentry.client.config.ts sentry.server.config.ts 2>/dev/null
```

### 4. Output Format

```
# Free Tier Audit Report — [Date]

## Summary Dashboard

| Service | Plan | Key Limit | Current Usage (est.) | Headroom | Trigger DAU |
|---------|------|-----------|---------------------|----------|-------------|
| Vercel | Hobby | 100GB BW | ~X GB/mo | XX% | ~X,XXX |
| Supabase | Free | 500MB DB | ~X MB | XX% | ~X,XXX |
| ... |

## Risk Ranking

1. **HIGH RISK**: [Services likely to hit limits first]
2. **MEDIUM RISK**: [Services with known growth path]
3. **LOW RISK**: [Services with generous limits]
4. **FRAGILE**: [Services with no official API / scraping]

## Recommended Actions (sorted by urgency)

1. [Most urgent action]
2. [Second most urgent]
...

## Total Upgrade Cost at Next Tier

| If we hit | Monthly cost increase | Services to upgrade |
|-----------|----------------------|---------------------|
| 500 DAU | +$X/month | [list] |
| 2,000 DAU | +$X/month | [list] |
| 10,000 DAU | +$X/month | [list] |
```

### 5. Cross-Reference

Compare findings against `docs/scale-up-plan.md`:
- Are the documented limits still accurate?
- Have any services changed their free tier offerings?
- Are there new services in the codebase not documented in the scale-up plan?
- Flag any discrepancies between the plan and reality.
