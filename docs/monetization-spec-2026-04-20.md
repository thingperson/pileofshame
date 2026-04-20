# Monetization Spec — Inventory Full

**Date:** 2026-04-20
**Status:** Draft for Brady's review
**Scope:** Cover-costs-first monetization plan. Respect hard privacy lines. Core loop stays free forever.

---

## Context

Inventory Full is free today. Hosting, Supabase, RAWG, OpenXBL, Sentry, and domain fees come out of Brady's pocket. The app's thesis ("less time in app = success") makes most SaaS monetization patterns actively hostile to the product: we cannot run ads, cannot sell data, cannot gate the core loop, and cannot add engagement drivers just to juice retention.

What we CAN do: be honest, be small, let people who like the app kick in a few dollars so it survives. Everything below is built around that.

---

## 1. How comparable apps charge

Researched pricing on every tracker-class app I could find. All prices USD unless noted.

### Backloggd — games, direct analog
- Model: Patreon "Backer" tier, **$3/month minimum** (pay-what-you-want above that).
- Free tier: all current features, including tracking, reviews, lists, logs.
- Paid perks: ad-free (site has display ads), profile badge, access to an "all-time stats" page, early beta access, exclusive Discord channel/role.
- Takeaway: explicitly framed as "supporting the site's development costs." No feature gating that threatens the core value. [1][2]

### Grouvee — games, direct analog
- Model: "Grouvee Gold." **$2/month or $20/year.**
- Free tier: full tracking, lists, ratings, reviews.
- Paid perks: removes banner ads, profile badge, gold ring on avatar, early access to new features.
- Takeaway: same pattern as Backloggd. Free app monetized by ads; premium removes ads + cosmetic status. [3]

### HowLongToBeat — games, completion time DB
- Model: no public paid tier. Monetized via display ads and referral/affiliate links on store buttons.
- Free tier: everything.
- Takeaway: proves an ad+affiliate-only model can sustain a large niche gaming site without subscriptions. (Ads are off-limits for us; affiliate side is directly relevant.) [4]

### IsThereAnyDeal — deals aggregator
- Model: **zero ads, zero subscription.** Funded entirely by affiliate commissions on retailer click-throughs.
- Free tier: full product.
- Paid perks: none — no premium tier exists.
- Takeaway: a respected privacy-first product in our adjacent space has proven affiliate-only is viable at scale. Gold-standard reference for our posture. [5]

### Letterboxd — films, the aspirational analog
- Model: three tiers. Free / **Pro $19/year** / **Patron $49/year.**
- Free tier: logging, reviews, lists, social follow, stats (basic).
- Pro: no ads, advanced filters, streaming availability, cloneable lists, extra list slots, personal stats dashboards.
- Patron: everything in Pro + higher stats resolution, Patron badge, priority support, "supporting the site" framing.
- Takeaway: the industry's most loved consumer-tier pricing. Pro is feature-useful; Patron is largely a "love the product, pay more" tier. Two-tier paid works for them because the free tier is genuinely complete. [6][7]

### Trakt.tv — TV tracking
- Model: free + **VIP**. VIP renews at $60/year ($5/month) as of June 2025, after a 300% hike from legacy pricing.
- Paid perks: Plex/Emby sync, broader auto-tracking integrations, higher API limits, no ads.
- Takeaway: raising prices on a captive user base is unpopular. Trakt's backlash is a warning — if we ever charge, grandfather early supporters and don't hike without value. [8][9]

### Serializd — TV, Letterboxd-for-shows
- Model: free + premium at **$19/year.**
- Paid perks: ad removal, personalized stats, username changes, streaming availability search.
- Takeaway: single flat tier, Letterboxd-Pro-priced, same playbook. [10]

### Common pattern
Every successful tracker app in our category lands in roughly the same place: **free tier is complete; paid tier is $20–$60/year and mostly removes ads + adds stats + status signaling.** The genuinely useful gated feature across all of them is **advanced stats/dashboards.** Ad removal is the second most common gate, but we don't run ads, so that's moot for us.

---

## 2. Proposed tier structure for Inventory Full

Two tiers. No third tier until traffic and revenue both justify it.

### Free (forever)
- Full import from Steam, PSN, Xbox, Switch, manual entry.
- All 36 archetypes, all filtering, all picks, all rerolls.
- Status cycle, Moved On, completions, share cards.
- Cloud sync (Supabase), guest mode, export/import.
- 4 themes: **Dark, Light, Dino, 90s.**
- Deal link on any owned/wishlisted game (affiliate-tagged, disclosed).
- **Target persona:** everyone. Students, new users, casual returnees, anyone under financial strain. The product's social promise is that you can use it free, forever, without a catch.

### Supporter — $3/month or $24/year ($2/mo effective)
- Everything in Free.
- 9 additional themes (ULTRA, Synthwave, Void, etc. — see §4).
- "Focus Mode" (see §3): strip-down option that removes non-essential UI.
- Advanced stats dashboard: completion rate trendlines, archetype drift over time, time-to-completion distribution, "favorite decade" style aggregates. All client-side, all opt-in.
- Supporter badge on share cards (small, tasteful).
- Priority email response (SLA: whenever Brady can — honest framing).
- Early access to new archetypes/themes before they ship free.
- **Target persona:** users who have been in the app 30+ days, cleared at least one game, and feel the product is worth a coffee a month. Not power users — grateful users.

**Rationale for $3/$24:**
- Matches Backloggd's floor ($3/mo Patreon), undercuts Letterboxd Pro ($19/yr vs our $24/yr) — but Letterboxd is a network effect giant; we can't charge more than them.
- Annual at $24 nets ~$20 after Stripe fees. Monthly at $3 nets ~$2.50. Round numbers the user doesn't resent.
- $2/mo effective annual price signals "coffee, not subscription." Keeps guilt low.
- At 200 annual supporters we cover current infra costs (~$40/mo Vercel + Supabase + domain + RAWG/OpenXBL headroom). That's the target.

### Why no third tier
A Patron-style "pay more to love us" tier is tempting but:
1. Adds decision burden at checkout (choice overload applies to us too).
2. Signals we're chasing revenue, not costs. Bad brand fit.
3. Brady is solo — the support burden of a top tier ("priority" anything) is real.

Revisit at 1k+ Supporters, not before.

---

## 3. The "pay to remove features" concept — Focus Mode

This is the most interesting idea on the table and it's directly aligned with the thesis. Offer it inside Supporter (not as a separate tier).

### What it is
A user setting called **Focus Mode** that strips the app down to the smallest possible surface:
- Hides themes picker.
- Hides stats, archetypes drift, completion celebrations (except the essential "I Beat It" flow).
- Hides share cards UI (share still works via direct URL).
- Hides archetype names/explanations on GameCard — just shows the pick.
- Hides deals/affiliate links.
- Hides all onboarding nudges permanently.
- Mood + time inputs only. Pick. Play. Done.

Reroll, pick, status cycle, Moved On — core loop — all remain.

### Why a user would pay for this
Precedent: **Bear, iA Writer, Freedom, Opal, one sec** — all sell "less" as a feature to users with attention/decision fatigue. Our target persona has documented decision paralysis (`.claude/rules/user-psychology.md` §1–3); Focus Mode is the logical endpoint of the choice-overload research applied to our own UI. Every non-essential element we add for engaged users taxes the cognitively-depleted ones.

Cognitive load theory (Sweller, 1988): working memory is finite and shared. UI chrome competes with decision-making for the same pool. Users who subscribe for Focus Mode are paying to lower the tax.

### Why it's Supporter-tier, not separate
- A separate "minimalist tier" would fragment users into incompatible modes, complicate bug triage, and force a weird messaging matrix.
- Bundling means the message is coherent: "Supporter gets you more customization (themes) AND less noise (Focus). Your app, your call."
- It reframes Supporter away from "status signaling" toward genuine product value. Ethically cleaner.

### Implementation flag
Single store field: `settings.focusMode: boolean`. Zustand store change, conditional renders in ~6–8 components. Ship behind the Supporter gate but leave the code path available to guests in dev builds so Brady can dogfood.

---

## 4. Premium themes

Current count: 13 themes. Proposed split:

### Free (4 themes — core identity)
- **Dark** — default, baseline.
- **Light** — accessibility parity with Dark.
- **Dino** — playful, widely loved, part of brand identity.
- **90s** — retro hook, tends to win screenshot shares.

Rationale: these four cover the main aesthetic axes (serious dark / serious light / playful / nostalgic). A guest with zero dollars gets a personality-complete product.

### Supporter (9 themes)
- **ULTRA, Synthwave, Void** — high-effort visual themes that are the showcase "wow" options.
- **Remaining six** (Brady to assign): gate the ones that are most design-expensive or niche-appeal. Avoid gating anything that's been a fan favorite in feedback.

### Rationale
- Themes are low-harm to gate: they're cosmetic, not functional. Gating them does not violate "core loop stays free."
- Psychology: themes are the closest thing to status signaling we have. Letting Supporters flex a rare theme is a fair value exchange for $3/mo.
- Rotation idea: cycle one Supporter theme into Free every 3–6 months ("Theme of the Season" style). Signals goodwill, surfaces paid options to free users organically.

### What NOT to do
- Don't gate Dark or Light. Accessibility tools are not paywall material.
- Don't add a theme creator/uploader behind a paywall. That's a feature expansion, not monetization, and it contradicts the "we pick, you play" posture by inviting catalogue-style behavior.

---

## 5. Affiliate links

This is our primary revenue tool and the only one that scales without subscriptions.

### Which programs
Ranked by fit with our rules (owned/wishlisted games only) and commission attractiveness:

1. **Fanatical** — $2–$5 flat per game sale, 30-day cookie. Good catalogue overlap with Steam libraries. [11]
2. **Humble Bundle** — 10% commission, 7-day cookie (short). High catalogue overlap. [11]
3. **Green Man Gaming** — up to 5% scaling with volume, 30-day cookie, 10% on bundles. Good for wishlist deals. [11][12]
4. **GOG** — via their affiliate network; solid for DRM-free crowd, smaller catalogue.
5. **IsThereAnyDeal's aggregate feed** — can piggyback their affiliate infrastructure rather than managing each merchant individually. Worth evaluating their API terms. [5]

**Steam has no public affiliate program.** Steam links remain organic (no commission, no tracking).

### Where affiliate links appear
Hard rule, enforced in code: **affiliate links only render on games the user already owns (in their imported library) or has explicitly wishlisted.** No affiliate link ever appears on a game we're suggesting they buy. This is the line between "helping you play what you own" and "selling you new things" (see `.claude/rules/legal-compliance.md`).

Specific surfaces:
- GameCard deal badge when an owned game is currently discounted (via ITAD data).
- "Restock" button on a Completed game's share card (owned, so user can gift/regift).
- Wishlist digest email (opt-in only, separate consent).

### FTC disclosure
Must be:
- Short.
- Visible in the same viewport as the link (not hidden in a footer).
- Plain English.

Proposed language, placed immediately adjacent to any affiliate button: **"Affiliate link — we get a small cut if you buy. No extra cost to you."**

Also add a paragraph to `app/privacy/page.tsx` and `app/terms/page.tsx` covering affiliate participation, with a specific list of merchants we work with. Update "Last updated" date. Ship policy changes BEFORE or WITH the affiliate feature.

### What we will NOT do
- No affiliate links on pick-flow surfaces (games we're recommending they play).
- No affiliate links on unowned-game discovery (we don't do discovery).
- No affiliate tags injected into Steam URLs (no program exists and it would violate trust).
- No click-tracking beyond what the affiliate network requires. No pixel, no cross-site.

---

## 6. Scale triggers — when to ship each tier

Current-state numbers (Brady to confirm actuals): ~free tier headroom on Vercel/Supabase/RAWG/OpenXBL. Ballpark infra cost < $50/mo today.

### Trigger 1: ship affiliate links
**When:** at any time. Zero cost to add. Requires only policy update + `<DealBadge>` component.
**Why now:** doesn't require a paywall, doesn't gate features, respects all rules.
**Expected revenue:** low. At 1k MAU with ~2% conversion on owned-game deals at ~$3 avg commission: ~$60/mo. Not transformative, but trivially positive.

### Trigger 2: ship Supporter tier
**When:** any of the following fires:
- Infra costs hit $100/mo (currently ~$40–50/mo), OR
- Sustained 5k+ MAU for 30 days, OR
- Brady receives 3+ unsolicited "can I pay you?" messages.

**Why those triggers:** revenue needs to be meaningfully ahead of effort. Stripe + Supabase Edge Functions + tier gating + support load is a ~2-week build and ongoing tax. Not worth it at 500 MAU. At 5k+, a 2% conversion at $24/yr is ~$200/mo — covers infra with margin.

### Trigger 3: Focus Mode + Premium Themes
**Ship simultaneously with Supporter.** These ARE the Supporter value prop. Splitting launches would be weaker marketing and confuse the tier's identity.

### Trigger 4: third tier / Patron-style
**When:** 1,000+ active Supporters AND Brady has identifiable unmet demand ("I want to pay more" signals). Not before. Revisit no sooner than 12 months post-Supporter launch.

### Trigger 5: hire / contract help
**When:** sustained MRR covers hosting + ~20 hrs/month of contract design or dev. Not a pricing question, but a sanity check that monetization is serving the product, not the other way around.

---

## 7. Open questions & tensions with the thesis

Honest flags. Not all of these resolve cleanly.

### Tension 1: paid stats contradicts "less time in app"
Advanced stats dashboards are the single most-gated feature across every comp. But stats are exactly the kind of feature that pulls users INTO the app to browse, not out to play. Mitigation: keep stats surfaced as a separate route (`/stats`), never on the landing pick flow. Users who want them can find them; users who want to just pick a game don't see them. Still uncomfortable. May be worth cutting stats from Supporter entirely and leaning harder on Focus Mode + themes.

### Tension 2: Supporter badge on share cards is mild vanity
Status signaling is engagement bait. Mitigation: make the badge tiny, off by default, opt-in in Supporter settings.

### Tension 3: affiliate links incentivize us to surface deals
Even restricted to owned/wishlisted, a deal badge is still "content the app is showing you to prompt a purchase." It walks up to a line. Mitigation: the user opens the GameCard themselves; we don't push notifications, don't email digests without explicit opt-in, and we don't rank or re-order picks based on affiliate availability. The affiliate link is information they asked for by opening a card, not content we pushed. Document this constraint in code comments so future me doesn't drift.

### Tension 4: monetization incentives diverge from product goals
Once there's revenue, there's pressure to increase it. Every tracker comp in §1 started small and expanded paid features over time. Guardrail: any future paid feature must pass §1–4 in `.claude/rules/legal-compliance.md` AND must be something the user would ask for, not something we push. If a proposed feature exists to drive conversion rather than to serve the user, it fails the axiom in `AGENTS.md`.

### Tension 5: cover-costs-first is not a business plan
Brady knows this. Worth stating for the record: this spec covers hosting and survival, not income replacement. If Inventory Full needs to become Brady's job, the model changes, and most of §2 needs rethinking. Don't try to "accidentally" build that here — do it deliberately or not at all.

### Open question: iOS/Android IAP
If we ever ship a native wrapper, Apple/Google take 15–30% and forbid pointing to web-based payment. Letterboxd handles this by charging via Paddle on web and letting the apps charge at IAP rates. Out of scope until we ship native. Flag for future.

### Open question: regional pricing
$24/year USD is meaningful money in some markets. Stripe supports PPP pricing. Worth enabling at launch to keep the "forever free-able" promise real globally. Low effort, high goodwill.

---

## 8. References

1. [Backloggd — About](https://backloggd.com/about/)
2. [Backloggd — Patreon](https://www.patreon.com/cw/backloggd)
3. [Grouvee Gold](https://www.grouvee.com/subscription/)
4. [HowLongToBeat — AlternativeTo overview](https://alternativeto.net/software/howlongtobeat/about/)
5. [IsThereAnyDeal — Privacy/Affiliate notes](https://isthereanydeal.com/legal/privacy/)
6. [Letterboxd Pro](https://letterboxd.com/about/pro/)
7. [Letterboxd Pro vs. Patron — Five Star Insider](https://www.fivestarinsider.com/letterboxd-pro-vs-patron/)
8. [Trakt VIP pricing](https://trakt.tv/vip)
9. [Trakt VIP price hike backlash — Neowin, 2025](https://www.neowin.net/news/trakt-vip-receives-up-to-300-price-hike-going-back-on-promise-to-honor-legacy-subs/)
10. [Serializd FAQ / premium](https://www.serializd.com/about)
11. [Fanatical affiliate — UpPromote directory](https://uppromote.com/affiliate-program-directory/fanatical/)
12. [Green Man Gaming affiliate program](https://www.greenmangaming.com/affiliates/)

Internal:
- `.claude/rules/legal-compliance.md`
- `.claude/rules/user-psychology.md`
- `AGENTS.md` (thesis, axioms)

---

## ⚠️ HARD BLOCKER — RAWG commercial plan (added 2026-04-20)

**Before shipping any revenue feature from this spec (Supporter tier, affiliate links, paid themes, anything monetized), sign up for the RAWG Business plan (~$149/mo).**

Reason: RAWG's free tier is non-commercial only. The day we accept revenue tied to this product, continued free-tier use violates their ToS — independent of MAU.

See `docs/DECISIONS.md` 2026-04-20 entry and `docs/scale-up-costs-2026-04-20.md` for full context.

Practical implication: this $149/mo floor is the hurdle any revenue surface must clear. Cover-costs-first posture means the FIRST monetization surface needs to reasonably project past that floor, or we shouldn't ship it yet.
