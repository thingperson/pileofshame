# Instrumentation Plan — Inventory Full

Draft v1 — Apr 9, 2026. Not yet implemented. Review before building.

## The question this doc answers

How do we know the product is actually working when real users start using it, without building behavioral surveillance we don't want and can't legally ship under our own privacy policy?

## The core loop we need to measure

From `.claude/rules/deploy-gates.md`:

> **Import → Tell us your mood → We find your game → Play → Celebrate**

Every metric in this doc should map back to one of those five steps. If a metric doesn't help us answer "did the user get from 'I want to play something' to actually playing in under 60 seconds," we don't collect it.

## Legal guardrails (non-negotiable)

From `.claude/rules/legal-compliance.md`:

1. No behavioral targeting of purchases.
2. No third-party data sharing, even anonymized.
3. No cross-site tracking beyond GA4 (which is already disclosed in the privacy policy).
4. No storing new categories of user data without updating the privacy policy first.
5. No server-side persistence of game identifiers tied to a user ID, unless the user has opted into cloud sync. Local-only users' activity must stay on their device.

These constrain everything below. If a metric requires violating any of them, we don't collect it.

---

## The five metrics that matter

These are the only metrics we build toward first. If we nail these, we can add more later. If we can't answer these, we are flying blind.

### 1. Time to first pick (TTFP)

**Question:** how long does a new user take, from landing on the site, to getting their first game recommendation?

**What it tells us:** whether onboarding is actually short. This is the headline metric for the whole product thesis. If TTFP creeps above 60 seconds for median users, the onboarding story is broken.

**How to measure without tracking individuals:**
- Client-side timestamp at `landing_viewed` and `first_reroll_opened`.
- Send a single anonymous event to GA4 with the delta in seconds. No user ID, no game ID, no import method.
- Bucket the delta (0-10s, 10-30s, 30-60s, 60-120s, 120s+) so GA4 sees a bucket label, not a raw number that could be a fingerprint.

**Privacy cost:** zero new data. GA4 already receives events; we're just adding one.
**Policy update needed:** no.

### 2. Pick-to-launch rate (PTL)

**Question:** of the picks we show, how often does the user actually press the Launch button?

**What it tells us:** whether the picker is finding games users genuinely want to play. Low PTL means the recommendation engine is suggesting stuff that looks wrong. High PTL means the engine is trusted.

**How to measure:**
- Count `pick_shown` events and `launch_clicked` events. The ratio is PTL.
- No game identifiers, no user identifiers, no mood tags attached to the event.
- Optional: break down by "entry point" (Quick Session vs Deep Cut vs Keep Playing vs Anything) since that's product-level configuration, not user behavior.

**Privacy cost:** zero new data.
**Policy update needed:** no.

### 3. Skip before pick (SBP)

**Question:** how many times does a user reroll before accepting a pick?

**What it tells us:** where friction is. A user rerolling 6 times before launching is either being served bad picks or is avoiding commitment. Both are fixable, but only if we can see it.

**How to measure:**
- Count `reroll_clicked` events between `pick_shown` and `launch_clicked`.
- Report the distribution (0 rerolls, 1-2, 3-5, 6+).
- No per-game data.

**Privacy cost:** zero new data.
**Policy update needed:** no.

### 4. Return after completion (RAC)

**Question:** do users come back after clearing a game?

**What it tells us:** whether the completion celebration + share loop actually pulls users back for another cycle. This is the retention signal that matters for the product thesis (pick → commit → resume → finish → share → return).

**How to measure:**
- When a completion fires, set a client-side flag with a timestamp.
- On next session, check how long it's been since the last completion.
- Send a bucket event: same-day, next-day, within-a-week, within-a-month, never.
- No game name, no user ID.

**Privacy cost:** we'd need to persist a single timestamp client-side. Already stored locally in the zustand library. No new data.
**Policy update needed:** no.

### 5. Share card conversion (SCC)

**Question:** of the users who see the share composer, how many actually generate a share?

**What it tells us:** whether the composer is worth the real estate. This one matters for growth, not retention, because shares are how the product spreads.

**How to measure:**
- Count `share_composer_opened` and `share_generated` events.
- The ratio is SCC.
- Already implicitly visible via the `share_cards` Supabase table row count vs composer open events.

**Privacy cost:** zero new data.
**Policy update needed:** no.

---

## What we will NOT instrument

Explicitly ruled out. If someone suggests adding these later, push back.

### Per-game analytics
We do not track which specific games users launch, skip, or complete. That's behavioral profiling, tied to commercial value (publishers would want this data), and would require privacy policy updates plus consent UI. Not worth it at this scale and against our stated thesis.

### User identifiers beyond GA4 session ID
GA4 handles its own session cookies under the disclosed privacy policy. We do not add our own user ID to analytics events, even for signed-in users. If we ever need to join telemetry to a user account, that's a new feature that requires its own consent flow.

### Playtime tracking
We do not track actual playtime inside games. Steam already does that and we ingest it via their API with user consent. We do not estimate, infer, or observe additional playtime.

### Mood preferences as user attributes
We do not send "this user prefers Chill mode" as an analytics dimension. That's a behavioral profile.

### A/B test infrastructure with user bucketing
Not yet. If we need to A/B test onboarding variants, we do it at the route level (50/50 by URL hash) without persisting which user saw what. No server-side bucket assignment.

### Heatmaps, session replay, or form analytics
None of these tools get added. They capture far more than we need and most operate by storing raw interaction streams on third-party servers. Hard no until we rewrite the privacy policy from scratch to accommodate them, which we are not doing.

---

## Implementation sketch

### Phase 1 — just GA4 custom events (this week if we ship it)

Add a tiny helper in `lib/analytics.ts`:

```ts
export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', name, props || {});
}
```

Then call it from the five measurement points:

1. `app/page.tsx` landing mount → `trackEvent('landing_viewed')`
2. `handleOpenReroll` → `trackEvent('reroll_opened', { entry: type })`
3. After a pick renders → `trackEvent('pick_shown')`
4. Launch button click → `trackEvent('launch_clicked')`
5. Completion fires → `trackEvent('game_completed')`
6. Share composer open → `trackEvent('share_composer_opened')`
7. Share generate → `trackEvent('share_generated')`

That's 7 event types, all anonymous, all mapping to product-level questions. GA4 will do the bucketing and reporting.

**Effort:** a few hours.
**Risk:** near zero, GA4 is already approved by the privacy policy.
**Value:** we can answer all 5 metrics within a week of shipping.

### Phase 2 — a dashboard we control (later)

Once we have a month of GA4 data and know which metrics actually move, build a small stats endpoint we own. But GA4 can carry us for a while; don't over-engineer.

### Phase 3 — user opt-in for anything deeper

If we ever need per-game data (e.g., to figure out whether Rocket League is the most-skipped recommendation), we add an explicit "help improve the picker" consent toggle in settings. Off by default. Only fires when on. Data stays with us, never shared.

---

## The scaling milestones this feeds

From the SCALING.md doc (not yet written — TODO for the scaling audit session):

- **10 users:** we can eyeball the 5 metrics from GA4 in 2 minutes. No infra needed.
- **50 users:** GA4 dashboards are enough. Add a simple weekly gut-check ritual — "is TTFP still under 60s?"
- **200 users:** start thinking about Phase 2 dashboard. Consider whether any metric is misleading us.
- **1000 users:** GA4 will start to feel thin for product debugging. Build Phase 2.
- **5000 users:** if we have not shipped Phase 3 consent flow yet, do it now, because we will want richer data and that requires explicit opt-in.

---

## The weekly ritual

One line from ChatGPT's Apr 8 review is worth pinning here:

> "Every week, ask one hard question: Did we make it easier for someone to start a game they already own?"

If the TTFP metric is trending down week over week, the answer is yes. If it's flat or creeping up, the answer is no and we have to find the friction that week.

TTFP is the health check. The other four metrics tell us WHY.

---

## Open questions for Brady

These need decisions before Phase 1 ships:

1. Are you OK with the 7-event GA4 list above, given it's fully anonymous? If yes, I can wire it up in a single PR that also includes a brief privacy policy line confirming what's being measured.
2. Do you want a weekly summary mode — a tiny in-app "state of the loop" view for yourself only, that reads the last 7 days of GA4 data — or do you want to just check GA4 directly?
3. Should pick entry type (Quick Session / Deep Cut / Keep Playing / Anything) be a dimension on `pick_shown` events? It's product config, not user behavior, but it's the one dimension that would help us debug which picker modes work best.
