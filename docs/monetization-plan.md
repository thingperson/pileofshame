# Monetization plan — Inventory Full

*Written 2026-05-04 (May-4 session). Lives alongside `merch-plan.md` and `b2b-studios-spec.md`. Not a build doc — a "what we'll do, when, and what we won't do" reference.*

---

## Anchor principles

1. **Free forever for the core product.** The picker, archetypes, library import, status tracking — all stay free, no account, no gating, no premium tier behind a paywall. Anything that gates the core product violates the thesis.
2. **No ads. No third-party data sharing. No cross-site tracking.** Per `legal-compliance.md`. Hard line.
3. **Monetization must align with the user's interest, not extract from them.** The user gets value before money changes hands. Tip jars, supporter recognition, merch they want, B2B aggregate analytics — these all align. Subscriptions, paywalled features, sponsored game placements, ads — these all extract.
4. **Time-in-app does not equal money.** Don't build engagement loops because they convert. The thesis is the brand.

---

## Active streams (ranked by "ship soonest")

### 1. Tip jar (Ko-fi) — LIVE, needs progress bar

**Status:** Live at `ko-fi.com/inventoryfull`. Linked from landing footer (`app/page.tsx:1023`).

**Next move: add the goal-progress widget.**

Ko-fi supports a public monthly goal with a progress bar. Setup:

1. In the Ko-fi dashboard → "Goals" → set a monthly goal (recommended: $60/mo "servers + dev tools").
2. Ko-fi gives you embed code for a progress widget.
3. Embed it on the about page (`app/about/page.tsx`) and optionally on the landing footer.

**Display copy candidates:**
- *"Servers funded this month: $X / $60"*
- *"Tips covering this month's hosting: $X / $60"*

**Why now:** public goal-meter signals that tipping matters and creates social proof of support without requiring users to be there. Costs nothing to ship. Trivial.

**Ko-fi cut:** 0% on free tier. They make their margin on Gold-tier upgrades you don't need yet. Stay on free tier.

---

### 2. Supporter tiers (Ko-fi memberships) — SHIP AFTER FIRST $25 TIP

Three tiers. None of them gate base product features. All are recognition + creative ownership, not access.

**Tier A — Supporter ($5+ one-time tip)**
- Small "supporter" badge on their archetype card (visible only on their own card and in shared social images, not as a public ranking)
- Listed on a public `/supporters` page on the site (with their consent — opt-in)
- Cheap, fast, easy. Ship first.

**Tier B — Theme Naming ($25+ one-time tip)**
- Tipper proposes a theme name
- We design + ship the theme in a future release with credits ("Theme: Astrid's Twilight, by @astrid")
- Limit: 4 named themes per year (we have to actually build each one)
- Quality bar: themes must fit the IF brand voice. Politely decline + refund any name that doesn't fit. Set this expectation publicly.

**Tier C — Theme Co-Design ($100+ one-time tip)**
- Tipper picks a vibe / palette / inspiration; we build the theme around it
- Their name in credits permanently
- Collaborative — slack/email exchange with sketches before commit
- Limit: 2 per year

**Why this works:**
- The base themes (dark, light, 90s, dino, etc.) all stay free for everyone forever.
- Named themes are recognition, not feature access. Zero scarcity for users who don't tip.
- Inverse of FOMO: you don't lose anything by not tipping. Tippers gain *meaning*, not utility.

**Why we wait until first organic $5 tip:** putting a $25 tier wishlist on the page when no one has tipped a single dollar is theatre. First tip happens → we have signal someone wants to support → ship the tiers.

---

### 3. Archetype merch — ROADMAP READY, GATED ON ~50 ACTIVES OR FIRST ORGANIC MENTION

Spec is at [docs/merch-plan.md](merch-plan.md). 10-step roadmap, Printful + Shopify on `shop.inventoryfull.gg`. Hero art is the unused `notes/new archetype images apr24/` character set, NOT the H2 sprites (wrong scale for apparel).

Launch SKUs: heavyweight tee ($34), 12×18 art print ($22), 3-sticker pack ($12).

**Mascot opportunity (added 2026-05-05):**

ChatGPT-generated character art evaluated for mascot use. The bot character ("Fantabulous" placeholder name in the GPT mockup) has potential as:
- Discord bot avatar (literal use case — needs a face)
- Sticker pack co-star
- Possible secondary merch (separate from archetype line)

But: the mascot CONFLICTS with the archetype-as-personality framing if elevated to brand status. Brady's brand puts the user's archetype at center; a brand mascot could compete. Recommendation: use the bot character as the **Discord bot's face only**, keep it OUT of the main-app brand surface, evaluate sticker addition once tee + print are proven. Do not adopt as the IF mascot.

---

### 4. Affiliate links (deals on cleared games) — PARKED UNTIL ≥1k MAU

Spec lives in handoff notes. Direction: opt-in toggle ("Show me deals on similar games to ones I've cleared"), only surfaces affiliate-tagged links on cleared games (not unowned ones), FTC-disclosed in Privacy Policy + on the surface itself.

Brady has agreed historically that this would be ethically built and FTC-covered. Block: never found a good affiliate program with quality terms. Re-evaluate when MAU justifies the policy lift.

---

### 5. B2B studios analytics — PARKED UNTIL ≥5k MAU

Spec at [docs/b2b-studios-spec.md](b2b-studios-spec.md). Aggregate-only, opt-in, k-anonymity floor of 50. Quarterly report tier first ($Y per report), self-serve dashboard tier later. Aligned with thesis (we both want their game played).

---

## Hard NOs (do not build)

- **Subscription tier with feature gating.** "Pro" picker, "Pro" stats, "Pro" filters — no.
- **Sponsored game placements.** That's an ad network, not a tool.
- **Paid promotion within the picker.** Same.
- **Lifetime "founder" deal.** Creates obligation we may not honor in 5 years.
- **Patron-only Discord channels with feature access.** Patron lounge for vibes is fine; gating PRODUCT support there is not.
- **Cross-promotion of other apps for revenue.** Wrong shape.

---

## What needs to be true before each next step

| Stream | Trigger to act |
|---|---|
| Ko-fi progress widget | Now (next session) |
| Supporter Tier A | First $5 tip arrives organically |
| Tier B + C | After Tier A live and at least one $5 tipper exists |
| Merch launch | ~50 actives OR first organic external mention (e.g. real Reddit/Twitter share by stranger) |
| Affiliate | ≥1k MAU + good affiliate program found + Privacy Policy + FTC disclosure ready |
| B2B | ≥5k MAU + 30%+ users opted in to anonymized aggregation + 3 design-partner studios willing |

---

*Last updated 2026-05-05 to add mascot evaluation + tier-A/B/C structure.*
