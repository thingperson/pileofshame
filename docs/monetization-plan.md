# Monetization plan — Inventory Full

*Written 2026-05-04 (May-4 session). Amended 2026-05-13 (launch-day retrospective) — see "Amendments" section at the bottom for what changed and why. Lives alongside `merch-plan.md` and `b2b-studios-spec.md`. Not a build doc — a "what we'll do, when, and what we won't do" reference.*

---

## Anchor principles

1. **Free forever for the core product.** The picker, archetypes, library import, status tracking — all stay free, no account, no gating. Anything that gates *core functionality* violates the thesis. *Cosmetic* premium (themes, extra art variants, profile flair) is NOT core-gating and is allowed — see the Cosmetic Premium stream below.
2. **No ads. No third-party data sharing. No cross-site tracking.** Per `legal-compliance.md`. Hard line.
3. **Monetization must align with the user's interest, not extract from them.** The user gets value before money changes hands. Tip jars, supporter recognition, merch they want, B2B aggregate analytics — these all align. Subscriptions, paywalled features, sponsored game placements, ads — these all extract.
4. **Time-in-app does not equal money.** Don't build engagement loops because they convert. The thesis is the brand.

---

## Active streams (ranked by "ship soonest")

### 1. Tip jar (Ko-fi) — LIVE, no scoreboard

**Status:** Live at `ko-fi.com/inventoryfull`. Linked from landing footer (`app/page.tsx:1023`).

**Next move: nothing right now.** Originally specced a "$X of $Y monthly goal" widget. Amended 2026-05-13: a public `$0 / $60` reads as a sad scoreboard at zero users. Skip the widget. Plain Ko-fi link with copy along the lines of *"Tips keep this free. If we picked you something good, throw a buck in."* — no number, no leaderboard, no pressure.

If tips eventually start coming in at meaningful volume, *then* consider a progress widget. Until then, the absence of a counter is better optics than a zeroed-out one.

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

**Trigger to ship — amended 2026-05-13:** Original spec said "first organic $5 tip." That trigger was circular: zero visible monetization → no organic tip → trigger never fires. Replaced with "**sustained return-visit audience signal**" — a successful launch post landing with comments, organic mentions, or a week of repeat-visitor traffic. That signals "people care, give them a way to pay" without waiting for a tip we've engineered to never arrive.

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

### 4. Affiliate links (deals on wishlisted / completed) — PARKED UNTIL RAWG-COST-COVERABLE

Direction: only surfaces affiliate-tagged links on games the user already owns or wishlisted, or DLC for games marked Completed / Playing Now. Never on suggested-new-purchase games. FTC-disclosed in Privacy Policy + on the surface itself.

**Gate amended 2026-05-13:** original spec said "≥1k MAU." That number was unexamined. The real economic gate is **RAWG's $149/mo non-commercial-tier escape cost**. The moment we accept affiliate revenue, RAWG free tier becomes a ToS violation; we must upgrade.

Revenue math at realistic conversion (2% of MAU × $3 avg commission):
- 1,000 MAU → $60/mo revenue minus $149 RAWG = **−$89/mo**
- ~2,500 MAU → ~$150/mo revenue ≈ breakeven on RAWG
- 10,000 MAU → ~$600/mo revenue − $149 = **+$451/mo**

New gate: **(a) affiliate revenue projected to cover RAWG commercial OR (b) a free-for-commercial metadata alternative confirmed (Steam Web API + ITAD only is one path; emailing RAWG about a sub-$149 tier is another).** Net effect is roughly ~2.5k MAU under default conditions, sooner if we find a metadata workaround.

**Affiliate partner shortlist (skip CJ — wrong network for our merchants):**
- Fanatical (direct) — $2–5 flat per sale, 30-day cookie
- Humble Bundle (direct) — 10% commission
- Green Man Gaming (direct) — up to 5% scaling, 30-day cookie
- GOG — via AdTraction (their current platform) or `affiliate@gog.com` email; 6%, 7-day cookie, 70-day payout delay
- Steam — no affiliate program exists. Steam links remain organic.

**Existing infra:** `app/api/deals/route.ts` is wired to ITAD with our registered API key. The `prices` action is live (used for backlog value calc); the `search` and `batch` deal-surface actions are dead-code-ready for UI. Previous deal UI (DealBadge in CompletionCelebration) was correctly stripped in commit `d77a533` for surfacing deals on non-owned games — a legal-compliance violation. Future UI is net-new but small (~2 hr per surface).

---

### 5. Cosmetic Premium Subscription — NEW (added 2026-05-13)

Monthly or annual subscription for **cosmetic-only** perks. Core product stays 100% free. Letterboxd Pro is the explicit analog — same model, same niche-utility scale.

**Pricing target:** $4/mo or $40/yr (yearly = 2 months free, drives annual lock-in).

**Perks (none gate core features):**
- Exclusive themes beyond the free rotation (currently free: dark, light, 90s, dino, weird, etc.)
- Premium archetype variants — alternate art for the 36 base archetypes, "supporter pip" badge on the archetype card
- Exclusive Pip variants — Pip mascot outfits, seasonal Pip art on share cards
- Profile flair — banner color, share-card watermark variants, custom color accent
- Early access window — new features land for supporters 1–2 weeks before free
- Cosmetic-only — no extra filters, no extra stats pages, no extra integrations. If it sharpens decision-making, it's free.

**Why now (vs the original "wait for first organic tip" framing):** the one-time supporter model (tiers A/B/C above) waits for a signal that won't arrive without something visible to convert to. A cosmetic subscription is **the visible thing** that gives supporters somewhere to put their money. Sub is ship-ready alongside or just after launch, not gated on tip count.

**Why this doesn't violate Anchor Principle #1:** core picker + archetypes + import + status tracking + library + share cards (base) all stay free forever. Subscription unlocks only cosmetic *expressions* of what's already there. A free-tier user gets the same decisions, the same picks, the same closure as a paid one.

**Tech requirements (Phase 1, ~1 week focused build):**
- Stripe Checkout (subscription mode, $4/mo or $40/yr)
- Supabase `supporters` table — `{ user_id, stripe_customer_id, subscription_status, current_period_end }`
- `isSupporter` boolean check in store + Stripe webhook for status sync
- 2–3 cosmetic perks shipped at v1 (exclusive theme, premium archetype variant, supporter pip badge)

**Revenue projection (1–2% conversion of MAU):**
- 1k MAU → 10–20 subs × $4 = $40–80/mo
- 10k MAU → 100–200 subs = $400–800/mo
- 100k MAU → 1k–2k subs = $4k–8k/mo

**Trigger to ship:** post-launch, after first audience signal lands. Earlier than affiliate (no RAWG-commercial gate — subscription revenue isn't tied to RAWG data the same way affiliate is, though we should still verify with RAWG support to be safe — see RAWG email draft in session notes 2026-05-13).

---

### 6. Year-in-Pile (Wrapped-style) — NEW (added 2026-05-13)

Annual paid moment. December launch. Free version is a small shareable card; **paid one-time unlock** ($5 or $10 — TBD in spec) is the deep version with detailed stats, animations, custom themes, exportable.

Spec: see [`docs/year-in-pile-spec.md`](year-in-pile-spec.md) (drafted parallel to this amendment).

**Why this is the strongest near-term bet, in three lines:**
1. Spotify Wrapped is the proven model — people pay for vanity stat moments in ways they don't pay for productivity tools
2. Inherently shareable — every share is acquisition. The free card seeds the funnel.
3. Reuses existing share-card infra (`next/og`, archetype reveal, completion celebration patterns). Asset re-arrangement, not greenfield engineering.

**Build window:** Sep–Nov 2026 development, Dec 1–7 launch.

**Trigger:** start building Sep 2026 unconditionally. December launch deadline is fixed by Spotify Wrapped's cultural slot; missing the December window pushes 12 months.

---

### 7. B2B studios analytics — PARKED UNTIL ≥5k MAU

Spec at [docs/b2b-studios-spec.md](b2b-studios-spec.md). Aggregate-only, opt-in, k-anonymity floor of 50. Quarterly report tier first ($Y per report), self-serve dashboard tier later. Aligned with thesis (we both want their game played).

---

## Hard NOs (do not build)

- **Subscription that gates the CORE EXPERIENCE.** "Pro" picker, "Pro" stats, "Pro" filters, "Pro" archetype assignment, "Pro" import — no. Anything that changes the decision-making capability of the product is core. Cosmetic subscriptions are explicitly *allowed* and live under stream #5 — they don't gate the thesis. *Amended 2026-05-13 — the original blanket "no subscriptions" was overzealous and internally contradicted Letterboxd Pro cited as our analog elsewhere in the docs.*
- **Sponsored game placements.** That's an ad network, not a tool.
- **Paid promotion within the picker.** Same.
- **Lifetime "founder" deal.** Creates obligation we may not honor in 5 years.
- **Patron-only Discord channels with feature access.** Patron lounge for vibes is fine; gating PRODUCT support there is not.
- **Cross-promotion of other apps for revenue.** Wrong shape.
- **Behavioral targeting on unowned games.** Affiliate links only render on owned/wishlisted/completed-DLC. See `legal-compliance.md`.

---

## What needs to be true before each next step

| Stream | Trigger to act |
|---|---|
| ~~Ko-fi progress widget~~ | ~~Dropped 2026-05-13~~ |
| Supporter Tier A | Sustained return-visit audience signal (post-launch) — *amended from "first organic $5 tip" 2026-05-13* |
| Tier B + C | After Tier A live and at least one $5 tipper exists |
| Merch launch | ~50 actives OR first organic external mention (e.g. real Reddit/Twitter share by stranger) |
| **Cosmetic Premium subscription** | **Post-launch, after first audience signal — NEW 2026-05-13** |
| Affiliate | RAWG-cost-coverable revenue (~2.5k MAU) OR free-for-commercial metadata path confirmed + Privacy Policy + FTC disclosure ready — *amended from "≥1k MAU" 2026-05-13* |
| **Year-in-Pile premium** | **Build starts Sep 2026, ships Dec 1 2026 (fixed deadline) — NEW 2026-05-13** |
| B2B | ≥5k MAU + 30%+ users opted in to anonymized aggregation + 3 design-partner studios willing |

---

*Last updated 2026-05-05 to add mascot evaluation + tier-A/B/C structure.*

---

## Amendments — 2026-05-13 (launch-day retrospective)

During the r/SideProject launch session, the original 2026-05-04 plan was audited for internal consistency. Several contradictions and unexamined assumptions surfaced and were corrected in-place. Captured here for future-session traceability.

### What changed

1. **Anchor Principle #1 narrowed.** Original read "no premium tier behind a paywall." Now reads "no *core-functionality* gating; cosmetic premium is allowed." This resolves a contradiction where the plan hard-NO'd subscriptions while citing Letterboxd Pro (a subscription model) as the aspirational analog elsewhere.
2. **Ko-fi progress widget dropped.** Original next-session task. Realization: a public `$0 / $60` scoreboard at zero users reads as a sad meter. Removed; plain Ko-fi link with no number is better optics until tips start arriving.
3. **Supporter Tier B/C trigger fixed.** Original: "first organic $5 tip arrives." Recognized as circular — with no visible monetization, no organic tip arrives, trigger never fires. New trigger: "sustained return-visit audience signal."
4. **Cosmetic Premium Subscription added as Stream #5.** Letterboxd-Pro-style. $4/mo or $40/yr. Cosmetic perks only. Resolves the "we have nowhere for fans to put money" problem the original plan had.
5. **Year-in-Pile (Wrapped) added as Stream #6.** Annual paid moment, December launch deadline. Identified as the single strongest near-term monetization bet (proven seasonal pattern + inherently viral + reuses share-card infra). Separate spec at `docs/year-in-pile-spec.md`.
6. **Affiliate gate corrected.** Original "≥1k MAU." Real economic gate is RAWG's $149/mo commercial license cost. Math: revenue ≈ 2% × MAU × $3 commission, so breakeven against RAWG is ~2.5k MAU. New gate accommodates either reaching that MAU or finding a metadata-cost workaround.
7. **Affiliate partner list specified.** Skip CJ (wrong network). Direct: Fanatical, Humble, GMG. GOG via AdTraction. Steam unavailable.
8. **IGDB ruled out as RAWG escape.** Web-search verified 2026-05-13: IGDB also requires commercial agreement past free tier (same gate, different gatekeeper). Migration would not save the $149 floor.

### What didn't change

- The mission stays: monetization must align with user interest, not extract from them
- The hard lines: no ads, no third-party data sharing, no cross-site tracking, no behavioral targeting on unowned games
- The free-forever core
- B2B studios stream (still parked at ≥5k MAU)
- Merch stream (still gated on ~50 actives OR first organic mention)

### Open follow-ups from this session

- [ ] Email RAWG support requesting a sub-$149 commercial tier for solo-dev / sub-10k-MAU apps. Draft prepared 2026-05-13 in session notes.
- [ ] Verify Stripe / Supabase wiring path for the Cosmetic Premium subscription before committing to a Phase 1 build sprint.
- [ ] Confirm with RAWG that donation-style subscriber revenue (cosmetic-only, no data-tied commercial use) doesn't trip their non-commercial ToS.

*Amendments authored 2026-05-13. Future sessions: treat this section as the source of truth where it differs from the original 2026-05-04 body — Brady has agreed to these corrections in conversation.*
