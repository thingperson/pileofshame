# Inventory Full for Studios — concept doc

**Status:** Parking-lot idea. Not for build. Revisit at ≥5,000 MAU.

## The pitch

Indie game studios pay for anonymized, aggregate completion analytics across our user base. They get data they can't get from Steam alone — specifically, *what happens after purchase* across the population of users who actually own and choose to play their game.

Sample insight a studio could buy:
> *Of 412 Inventory Full users who own Hades II, 73% have started it, 41% have cleared it. Median time-to-clear: 38h. Average rating: 4.6/5. Top mood tags users associate with it: "intense", "competitive". 18% of clears happened after a backlog stay >180 days.*

That's a different shape of data than Steam's "X% of players completed Achievement Y." It's about **how the game lives in someone's library** — bought, parked, cleared, regretted, replayed.

## Why it aligns with the thesis

Our thesis: people enjoy games they already own again. A studio learning that their game sits in 800 backlogs unplayed is *useful information* for them — they can run a re-engagement campaign, ship a re-launch patch, drop a discount. **More users completing more games = both our and their goal.**

We are not a marketing channel for unplayed games. We are an analytics surface for already-owned games. That's the line.

## What we'd sell

Three product shapes, ranked by ease:

### 1. Self-serve dashboard ($X/month per studio)

- Studio creates an account, claims their game(s) by Steam appid
- Sees aggregate stats only on users who own that game
- Cohort breakdowns (when added, current status, time-to-clear, rating distribution)
- Mood/genre association from our taggers
- Anonymized timeline (no individual user data)

### 2. Quarterly report ($Y per report)

- A PDF/email digest sent to studio quarterly
- More analysis-shaped, less raw
- Lower price, less ongoing cost on our side

### 3. Custom analysis ($Z per question)

- Studio pays us to answer a specific question
- E.g. "what % of Hades II players who have rated Hades 1 ≥4★ have cleared Hades II?"
- Premium price, only relevant once we have meaningful scale

Recommended start: **product 2 (quarterly report)**. Lower lift, less data infra needed, gates the relationship before commitment.

## Hard rules — what we will NEVER do

These are non-negotiable per `legal-compliance.md`:

1. **No individual user data leaves our system.** Ever. Aggregate-only. Minimum cohort size of (e.g.) 50 users before any data point is exposed — below threshold, the data doesn't show.
2. **No targeting individual users on behalf of a studio.** A studio cannot say "send my discount to users who own my game but haven't played it." That's the line that turns us into an ad network.
3. **No selling user emails.** Period. The aggregate stats only.
4. **Users can opt out.** Settings toggle: "Include my anonymized stats in studio analytics." Default? Open question — see below.
5. **Disclosure in Privacy Policy** before launch. New data category (commercial analytics) → Privacy Policy update is mandatory.

## Open questions

1. **Opt-in vs opt-out for analytics inclusion.** Opt-in is more legally clean and respects autonomy. Opt-out gives us scale faster. **Lean opt-in.** This is consistent with everything else we do.
2. **Which platforms do we support?** Steam appid claim is easiest. PSN/Xbox studios are smaller and harder to verify ownership of a game listing. Steam-only at launch.
3. **Studio verification.** How does a studio prove they're the rightful owner of a game listing? Probably: email from a domain matching their Steam developer page, manual review for small batch.
4. **Pricing.** Need to actually price this. Steam has 100+ million MAU and free analytics; we'd be competing on insight quality, not depth. Probably $50–$200/mo for the dashboard tier when we have enough users to be meaningful.

## Why we wait

- At <5k MAU, the cohort sizes per game are too small to be useful. A studio buying analytics on a game with 14 users in our system gets noise, not signal.
- At 5k+ MAU, hot games (Hades II, BG3, Elden Ring) might have 200–400 users each, which starts being meaningful for a quarterly report.
- At 50k+ MAU, the dashboard tier becomes viable.

## Why we eventually do it

- Aligned monetization. Studios want their games played; we want their games played; users want to enjoy games they own.
- Defensible business. Not an ad network, not a tracker, not a competitor to Steam Wishlist.
- Marketing-by-itself. A studio publicly citing our data ("Inventory Full users completed Hades II at 41%, the highest of any game in our network") is free distribution.

## What needs to be true before we build this

- [ ] ≥5k MAU (cohort math)
- [ ] Privacy Policy update drafted
- [ ] Opt-in toggle shipped + adopted by ≥30% of users (consent base must be meaningful)
- [ ] Manual outreach to 3 indie studios willing to be design partners for the first quarterly report
- [ ] Aggregation/threshold infrastructure (k-anonymity floor of 50)

When all five are true, build product 2 (quarterly report) first. Iterate from there.

---

*Locked spec, parking-lot. Last updated 2026-05-04.*
