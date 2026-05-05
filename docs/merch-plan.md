# Inventory Full — Merch Plan (POD)

*Drafted 2026-05-04. Planning doc only. Not a build.*

## Executive summary

1. Merch ships as **brand glue**, not revenue. Zero users today. The goal is to give the day-1 community something to wear and to make the archetype IP feel like real characters.
2. Recommend **Printful + Shopify** (custom storefront at `shop.inventoryfull.gg`). Cotton Bureau is the second choice if you want zero infra and limited drops.
3. Launch SKUs: **heavyweight tee, art print, sticker pack.** Three products, one archetype family per drop. No hoodies until the tee proves out.
4. Use the **`notes/new archetype images apr24/`** illustrations as the hero art, not the H2 sprites. Different job. (See §5.)
5. Pushback up front: **don't ship merch until you have ~50 active users and one external mention.** Selling a hoodie to nobody is worse than not having merch — see Risks.

---

## Pushback before we go further

Brady, two of the assumptions baked into the brief deserve a stress-test:

**1. "Merch should ship soon."** Right now there are no users. Merch's job is to convert *fans* into *signal* (people walking around in your art). Without fans, a store is a vanity surface that costs setup time and runs the risk of looking dead ("0 sold" is a worse signal than "no store"). Recommend: **build the plan now, set up the storefront skeleton, but don't go live until first 50–100 active users or first external mention (HN, Reddit, Polygon-adjacent).** This plan is structured so the work is parked-and-ready, not pushed prematurely.

**2. "Use the H2 sprites."** The H2 sprites are *512×512 painted-pixel chibi mascots*. They're great for OG cards and in-app share moments. They're weak for apparel — at chest scale they read as small icons, not designs. The **apr24 character set** is dramatically better merch art: full-figure painted-pixel illustrations of each archetype with floating HUD badges. They look like trading-card characters. That's what people will actually wear. The H2 sprites become secondary use (sticker pack, mug ring).

If you disagree, fine — but the merch tier of the brand should match the apr24 art's quality, not be capped by the H2 mascots.

---

## Art inventory (what's actually available)

**Already shipped, in the app:**
- `public/sprites/h2/` — 38 PNGs, 512×512, painted-pixel chibi style. Used in OG cards. Tight, mascot-feel, low detail at apparel scale.

**Sitting in `notes/`, not yet used in product:**
- `notes/new archetype images apr24/` — 24 PNG character illustrations, ~1024px, painted-pixel style, full character + floating UI HUD elements (stat badges, route maps, status checklists, archetype-themed gear). Examples confirmed:
  - **Endurance Runner** — bearded hiker with backpack, "68 HRS PLAY TIME" badge, "BACKLOG ULTRA 068", "STORY ROUTE" map, route elevation chart
  - **Night Owl** — hooded owl with handheld console at "11:42 PM", "ONE MORE CHAPTER", "STILL AWAKE ∞" sleep meter
  - **Bargain Hunter** — raccoon with sale flyers, cart of bundle games, "75% OFF", "DEAL ACQUIRED", "COUPONS x99"
  - **PS Purist** — armored white/blue hero with PS5 + DualSense, "70%+ PS MAIN PLATFORM", trophy bar
  - **Genre Addict (Triangle bias)** — hooded figure with "FAVORITE TYPE: TRIANGLE 42%+", "PREFERENCE LOCKED 99.8%"
  - **Redeemer** — mechanic-styled character with "BACKLOG 248 / CLEARED 97", clipboard checklist of cleared games
  - **Sumfinder/Wishful Thinker** — wizard with "WISHLIST +1 ALWAYS NEXT", "MAYBE THIS ONE", "PENDING DESTINY"
  
  These are far more apparel-suitable. Identifying which goes with which archetype slug is a 30-min job (see Step 2 below).

- `notes/bundle-wave2*/` — UI sprite chrome (status badges, skip reasons). **Not merch material.** Skip.

- `notes/inventory-full-notes/` — `.md` notes, not art.

**Net:** you have one premium illustrated set sitting unused. Use it.

---

## 1. Platform recommendation

**Recommend: Printful + Shopify (custom storefront).**

Quick comparison:

| Platform | Garment quality | Global ship | Storefront control | Margin/$30 tee | Setup |
|---|---|---|---|---|---|
| **Printful + Shopify** | High — Bella+Canvas 3001, Comfort Colors, Stanley/Stella for EU | US + EU + CA fulfilment centers | Full — your domain, your data | ~$8–11 | 1–2 afternoons |
| **Cotton Bureau** | Highest — Triblends, Next Level, Tultex; print quality is best in class | US-strong, decent EU | Limited — they own the URL, brand is co-mingled | ~$6–8 | 1 afternoon |
| **Printify** | Variable — many providers, quality depends on which you pick | Good but provider-dependent | Full via Shopify | ~$10–13 | 1–2 afternoons |
| **Spring (Teespring)** | Mid — okay tees, mediocre prints | Decent | Their domain, weak control | ~$5–7 | <1 hour |
| **Cloudprinter** | Strong for prints/posters; not really apparel | EU-strong | API-first, more dev work | n/a | 1+ week of dev |
| **Redbubble** | Low — base garments are thin, prints fade | Good | None — their marketplace, their rules | $3–5 | 30 min |

**Why Printful + Shopify:**
- DTG (direct-to-garment) on Bella+Canvas 3001 + Comfort Colors 1717 = the quality bar for indie merch. Will not feel like a Redbubble tee.
- Your domain, your customer email, your brand. You can put `shop.inventoryfull.gg` on the about page without sending people to a cluttered Cotton Bureau page next to 500 other indie shirts.
- EU and Canada fulfillment centers — CA users (you, me) and EU users get reasonable shipping.
- Standard Shopify Lite plan is $9/mo; Printful is free until orders. Total monthly burn: under $15.
- You already speak Stripe. Shopify wraps Stripe-equivalent checkout cleanly.

**Second choice: Cotton Bureau.** If the Shopify+Printful setup feels like too much overhead for a no-revenue side project, Cotton Bureau lets you upload art, set retail price, and they handle everything for a per-unit cut. Garment + print quality is honestly *better* than Printful. The tradeoff is brand control: customers go to cottonbureau.com/p/whatever, your domain isn't on the hangtag, you can't bundle stickers with a tee, and you can't run a coupon for your Discord. Acceptable for a "drop" model where you launch a single tee and forget it.

**Skip:**
- **Redbubble** — base quality damages the brand. Hard no.
- **Spring** — same. The print quality on archetype illustrations would muddy the linework.
- **Printify** — usable, but the supplier-by-supplier QA chase is a tax. Printful is more turnkey at similar margin.

---

## 2. SKU mix (launch)

**Three SKUs. One archetype family per drop.**

### A. Heavyweight tee — *the anchor*
- **Garment:** Comfort Colors 1717 (6.1oz, garment-dyed, soft, the indie-merch standard) for US; Stanley/Stella Creator 2.0 (organic, EU printer) for EU.
- **Print:** DTG, full color (the apr24 art is too color-rich for screen-print without losing detail).
- **Colors:** Two darks only — *Pepper* (washed black) and *Blue Jean* (washed indigo). The apr24 art is luminous on dark; on white the floating HUD badges fight the shirt. Pick what serves the art.
- **Sizes:** S–3XL.
- **Why:** The default merch unit. If anyone buys merch, it's a tee.

### B. 12×18 art print — *the no-fit, no-size, low-friction unit*
- Matte heavyweight stock (Printful "Enhanced Matte Paper").
- One archetype per print. The apr24 art is *born* to be a print — the floating HUD badges look like trading-card chrome.
- No frame. People who care will frame it.
- **Why:** Sized for a desk/wall above a PC. Mid-30s gamers sit at PCs. This is the SKU for the user who likes you but won't wear merch.

### C. Die-cut sticker pack (3 stickers) — *the low-stakes commitment*
- 3" die-cut vinyl, glossy.
- Uses the **H2 sprites** (not the apr24 art). The H2 sprites are perfect at sticker scale — chibi, readable, recognizable at a glance.
- Pack of 3 = "your top 3 archetypes." Curated bundles per drop (e.g. "The Roast Pack: Hoarder, Wishful Thinker, Bargain Hunter").
- **Why:** Sub-$10 entry point. Easy gift. Stacks well with a tee in checkout. Gives the H2 art a proper home.

### Skip at launch (reasoning)

- **Hoodie** — DTG hoodies are heavy, prints are softer, return rates are higher. Wait for a tee winner before printing it on a $50 garment.
- **Mug** — Print-on-mug works but the apr24 art wraps poorly on a curved surface (HUD badges crop). Possible phase-2 with a redesigned wraparound, not a square crop.
- **Phone case** — Carrier/model fragmentation, low margin, plastic. Off-brand.
- **Pin** — Enamel pins are great for this art but they require inventory. Hard no for now per brief.
- **Hat** — Embroidery/decoration on POD hats is mediocre quality. Off-brand.

---

## 3. Storefront approach

**Recommend: (a) Standalone storefront at `shop.inventoryfull.gg` via Shopify + Printful.**

- Subdomain keeps the main app clean. `inventoryfull.gg` stays the product. `shop.inventoryfull.gg` is the merch.
- Shopify gives you abandoned-cart, discount codes, gift cards, customer accounts — all free with Lite. You'll want all of these eventually.
- Custom theme: the **Dawn** free theme is fine. Strip it down to one collection page + product pages. Match the dark theme + warm-purple accent of the main app. Total CSS work: 2–3 hours.
- One CTA on `app/about/page.tsx`: "Wear the pile" → `shop.inventoryfull.gg`. That's it. No persistent nav item until merch earns it.

**Why not Stripe Payment Links (option c):** They're great until you have inventory variants (size × color × archetype), at which point you're rebuilding Shopify badly in a Notion page. The minute you have 3 SKUs × 3 sizes × 2 colors, Payment Links break.

**Why not Cotton Bureau-only (option b):** Loses brand control, can't bundle, can't run Discord-only discount codes, and the art you uploaded sits in a marketplace next to everyone else's.

---

## 4. Pricing

Working backwards from Printful base costs (rough, US-shipped):

| SKU | Base cost | Suggested retail | Your margin |
|---|---|---|---|
| Comfort Colors 1717 tee, DTG full-color | $19–22 | **$34** | $12–15 |
| 12×18 matte art print | $9 | **$22** | $13 |
| Die-cut sticker pack (3) | $6 | **$12** | $6 |
| Tee + sticker bundle | $25 base | **$40** | $15 |

**Why these numbers:**
- $34 tee is the "indie boutique" zone — above Redbubble ($24), below Tom Bihn / Cotton Bureau premium ($38–42). Mid-30s gamers will pay it for art they like; they will not pay $48.
- $22 print is impulse-buy territory for the demo.
- $12 sticker pack is the "I don't need anything but I want to support this" tier.

Free shipping over $40 to push the bundle. Or don't — Printful's calculated shipping is already reasonable.

---

## 5. Art adaptation

**The H2 sprites: keep at sticker scale only.** 512×512 painted-pixel chibi will print fine on a 3" sticker (≈216 DPI). On a tee chest print it would either pixelate (if scaled up sharp) or smear (if upscaled smooth). Wrong tool.

**The apr24 illustrations: print-ready or near-it.** Resolution looks ~1024–1280px square. For a 12×14" chest print at 150 DPI, you want ~2100×2100px. Two paths:

1. **Ship as-is, accept slight softness.** DTG at 150 DPI on Comfort Colors will render ~1024px square as a 6.8×6.8" print. That's *small* for a chest print. Workable but undersized.
2. **Upscale via Topaz Gigapixel or Photoshop Preserve Details 2.0 to 2400×2400.** Painted-pixel art upscales reasonably with the right preset (NOT bicubic — use Preserve Details + reduce noise low). Cost: free (you have Adobe). Time: 30 min per art piece.

**Recommend path 2.** The art deserves it.

**Color count / DTG specifics:** DTG handles full-color fine. No transparency issues — Printful auto-handles PNG alpha. The floating HUD badges with thin strokes (1–2px in source) will be the failure point if anything is — confirm on the test print that "75% OFF" remains legible at apparel scale. If not, you may need to bump stroke weights in Photoshop before upload.

**Vector?** Don't commission it. The art is painted-pixel by intent — vectorizing kills the texture that makes it readable as game-character art. If anything, you'd commission *higher-res* painted-pixel renders, not vectors. That's a phase-2 expense, not a launch one.

---

## 6. Legal / compliance

### FTC
- **No required disclosures** for selling your own merch. FTC affiliate-disclosure rules (`§255`) apply when you're promoting *someone else's* product for compensation. Selling your own product is just commerce.
- **Do disclose**: any post you make on social media that *links to your shop* should make clear it's your own product. Best practice: just say "we made shirts" — that's legally clean and matches the voice anyway. Avoid pretending merch posts are organic discovery.

### Privacy Policy (`app/privacy/page.tsx`) — **needs update before launch**
Selling merch via Shopify materially changes the data picture, even though Shopify (not you) is the data controller for purchases. Triggers from `.claude/rules/legal-compliance.md`:

- New third-party recipient of user data: Shopify (and Printful as sub-processor). The policy needs a section: *"If you purchase merchandise from `shop.inventoryfull.gg`, your name, shipping address, email, and payment details are processed by Shopify (our merch host) and Printful (our fulfillment partner). We do not store credit card information."*
- The merch storefront is a separate origin (subdomain) — clarify cookies/tracking are separate from the main app. Ideally Shopify's analytics are kept default-only.
- Disclose abandoned-cart emails (Shopify default) — these *do* email people based on behavior, which intersects the rule's "pushing content the user didn't request" trigger. Keep it opt-in at checkout, not opt-out.

### Terms (`app/terms/page.tsx`) — **needs minor addition**
Add a section: *"Merchandise sales from shop.inventoryfull.gg are governed by Shopify's terms of service and our store policies (returns, shipping). Inventory Full the app and Inventory Full merchandise are operated by the same entity but separate transaction stacks."*

You don't need a full retail Terms — Shopify's checkout TOS covers most of it. You need a refund/return policy page on the shop (Printful's POD policy is the source of truth: defects/wrong size = replace; change-of-mind = no return on POD).

### COPPA / international
- Shopify's checkout includes age gating in the regions it's required.
- GST/VAT: Shopify auto-handles this for EU/UK/CA/AU at the merchant's cost. Build it into the $34 price (or surface at checkout — Shopify default).
- **You'll need a Canadian business number for HST collection** if you cross $30k revenue. You won't, near-term. But know it exists.

### Policy update timing
Per `legal-compliance.md`: **policy updates ship BEFORE or WITH the storefront, never after.** Step 7 in the roadmap is the policy update. Step 8 is launch.

---

## 7. Roadmap (10 steps, each = 1 afternoon)

> Steps 1–6 are "build it cold and park it." Steps 7–10 wait until user-base trigger fires (50 actives or first external mention).

**Step 1 — Decide and register (1 afternoon).**
Confirm Printful + Shopify path. Register Shopify Lite ($9/mo, cancel-anytime). Register Printful (free). Register `shop.inventoryfull.gg` subdomain in Vercel DNS pointing to Shopify.

**Step 2 — Map the apr24 art to archetypes (1 afternoon).**
The apr24 folder has UUID filenames and 24 images. Open each, match to archetype, rename to `<archetype-slug>-hero.png`. Move to a new `assets/merch-source/` folder (gitignored — keep raw art out of public/). Identify the 5 strongest pieces for launch (suggest: Endurance Runner, Night Owl, Bargain Hunter, Redeemer, Hoarder — heavy on roast tone, popular archetypes per the registry).

**Step 3 — Upscale + clean the launch 5 (1 afternoon).**
Photoshop Preserve Details 2.0 → 2400×2400. Manually clean any HUD-badge stroke that thinned out. Export final print masters as PNG with transparency.

**Step 4 — Sticker pack art (1 afternoon).**
Pull 9 H2 sprites (the 9 most-shipped archetypes — check Sentry / GA4 for which `/archetype/[slug]` pages get the most landings). Group into 3 packs of 3 ("Roast", "Respect", "Theme") with naming consistent with voice charter. Export at 1500×1500 each.

**Step 5 — Build Printful products (1 afternoon).**
Connect Printful → Shopify. For each of the 5 archetypes: create 1 tee variant (2 colors × 6 sizes = 12 product variants), 1 print, 1 sticker pack (×3 packs). Total: ~80 SKU rows. Use Printful's mockup generator for product images — order one real sample of one tee + one print to verify before launch.

**Step 6 — Storefront skin (1 afternoon).**
Shopify Dawn theme. Match dark theme + warm purple accent. Strip nav to: Home / Shop / About (links back to inventoryfull.gg). One collection page, one about-the-art page (this is where you put the voice — *"We made these for the people who built piles. Wear yours."*). Mobile check.

**Step 7 — Privacy + Terms updates (1 afternoon).**
Update `app/privacy/page.tsx` and `app/terms/page.tsx` per §6 above. Update "Last updated" dates. Deploy. **This must ship before the store opens.**

— PARK HERE. WAIT FOR TRIGGER. —

**Step 8 — Soft launch (1 afternoon).**
Trigger fires (you have an audience). Order one test tee + test print to your house. Confirm quality. Then: open the store. Add a single "Wear the pile" link to the about page. Post once on Discord, once on Bluesky/Twitter. Voice: *"We made shirts. Same energy as the app."* Don't push. Watch for 7 days.

**Step 9 — Iterate based on signal (1 afternoon, week 2).**
Check what sold (or didn't). If tees move, expand to 5 more archetypes. If prints move, add 18×24. If nothing moves, don't expand — the audience told you. Keep the store live but stop building.

**Step 10 — Phase-2 decision gate (1 afternoon, month 2).**
If merch is moving (>10 sales/mo), evaluate hoodies, mugs, enamel pins (the latter requires inventory — separate decision). If not, leave the store as-is, treat it as brand glue.

---

## 8. Marketing the launch

**Smallest possible push:**

1. **Discord post.** 4 sentences. *"We made shirts. The art is the apr24 archetype set we've been sitting on. Three things at launch — tee, print, sticker pack. shop.inventoryfull.gg."*
2. **One social post (Bluesky and/or Twitter).** Hero image of one archetype tee on a model. Same copy, shorter.
3. **One line on the about page.** *"Wear the pile."* → links to shop.
4. **Nothing in-app for now.** No banner, no popup, no nav item. The product is the product. Merch is for people who already love it. Adding shop CTAs to the app would *increase time-in-app without serving the play loop* — direct violation of the product axiom (`AGENTS.md` §locked decisions, `deploy-gates.md` §4).

**What you do NOT do at launch:**
- No paid ads.
- No "limited drop" countdown timer.
- No influencer outreach.
- No newsletter (you don't have one yet).
- No Reddit posts (will read as self-promo and torch goodwill).

If this push moves zero units, that's data, not failure. The store stays up.

---

## 9. Risks / what we are NOT doing

- **NOT shipping before audience exists.** Restated for emphasis.
- **NOT compromising garment quality for margin.** A $24 Spring tee in the user's hands damages the brand more than a $34 Comfort Colors tee they didn't buy.
- **NOT entering the marketplace model (Redbubble, Etsy POD).** Brand control matters more than the long-tail discovery.
- **NOT putting merch CTAs in the app.** Violates the "less time in app = success" axiom. Merch lives at the about-page edge of the brand.
- **NOT producing inventory-bearing items at launch.** No pins, no embroidered hats, no hoodie pre-orders. POD only.
- **NOT bundling user data with merch.** No "your archetype tee, auto-printed from your library." Cute idea, becomes a behavioral-data-to-purchase pipeline that triggers `legal-compliance.md` §grey areas. Skip.
- **NOT writing a separate merch-site Privacy Policy.** Update the existing one. One source of truth.
- **Risk: archetype IP.** The apr24 art is from ChatGPT (per Brady's note in the brief). Generative AI ownership for commercial use is contested; OpenAI's ToS currently grant the user output rights, but case law is evolving. Phase-2 mitigation: commission a human artist to redraw the top sellers for a "definitive edition" run, both for legal cleanness and as a "v2" marketing beat.

---

## 10. Phase 2 (parking lot)

Don't think about these until tees prove out. Listed for completeness.

- **Hoodies** (Independent Trading Co. SS4500 via Printful — the indie-merch standard).
- **Mugs** with a wraparound design (custom illustration, not the square HUD art).
- **Enamel pins** (inventory item — requires upfront ~$300–500 for a run of 100, fulfilled via PinSource or similar). One pin per archetype, sold as collectibles.
- **Trading cards** of all 40 archetypes (the apr24 art is *literally* trading-card composed). MakePlayingCards run. High-effort, high-cool-factor. Phase-3.
- **"Pick my game" toy** — physical version of the picker (a die or randomizer object). Cute but distant.
- **Limited drops keyed to milestones.** *"100k cleared games"* commemorative tee, etc. Only after the platform has milestones worth commemorating.
- **Affiliate / Discord-only codes.** Reward Discord regulars with 15% off. After community exists.
- **Human-illustrated v2 of top 5 archetypes.** Mitigates AI-art legal risk; serves as a marketing relaunch beat.

---

## Appendix: Voice samples for shop copy (draft only, not approved)

For the about-the-art page on the shop:

> Inventory Full helps you decide what to play. The archetypes are how we describe who you are when you sit down at the pile.
>
> We had 24 paintings sitting in a folder. They deserved better than a folder. So they're shirts now. Wear the one that roasts you the worst.

For the launch post:

> we made shirts. they're the archetype paintings, finally. tee, print, sticker pack. one drop. shop.inventoryfull.gg.

(Both pass the charter: lowercase tagline-friendly, roast-with-warmth, no LinkedIn vocab, no triple-adjective lists, sentence-length variance.)

---

*End of plan. ~720 lines target, came in under. If anything reads soft, push back — Brady prefers pushback over yes-manning.*
