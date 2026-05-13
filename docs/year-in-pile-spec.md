# Year in Pile — build-ready spec

*Written 2026-05-13. Implementation target: Dec 1, 2026 launch. One-time $5 unlock per user per year. Free card is the acquisition funnel; paid card is the keepsake. Reuses share-card infra; new tables in Supabase + Stripe one-time Checkout.*

---

## 1. The pitch

**Your year, in piles.** A reflective wrap-up of what you actually played, what you finally let go of, and which archetype you became — built from the same data the app's been quietly keeping all year. Free version is a square share card. Paid version is a scrollable, animated walkthrough you keep.

This is not a stats page. A stats page lives in /stats and answers "what do I have?" Year in Pile answers a different question: *"what kind of year did I have with games?"* — once, in December, with a beginning, a middle, and a credits roll.

Why it works for our user (per `user-psychology.md`):

- **Reflection without prescription.** Year in Pile shows what already happened. It doesn't tell the user what to play next, doesn't surface alternatives, doesn't recommend anything. Zero new decisions. (Iyengar/Schwartz.)
- **Loss-reframing baked in.** Every "Moved On" gets celebrated alongside every "Completed." We are the only year-in-review that treats letting go as an achievement. That's the single most defensible thing in this spec. (Kahneman, and `voice-charter.md` Moved On canon.)
- **Identity anchor, not score.** The closing beat is the user's archetype for the year — a Jungian/horoscope-flavored mirror, not a rank. (Oyserman identity-based motivation.)
- **It terminates.** Wrapped doesn't keep you in the app. You see it, you share it, you close the tab. Aligned with the "less time = success" axiom.

---

## 2. Free vs paid — the split

The split is locked. Don't enumerate options in implementation; just build this.

### Free — one card, instant, shareable

A single 1200×1200 (square, IG/Bluesky-friendly) OG image, plus a 1200×630 (Twitter/OG) variant. Generated server-side, cached. No login required for users with localStorage data; cloud-synced users get richer numbers.

Five stats, all on one card:

1. **Games completed this year** — big number, top-left.
2. **Games moved on from this year** — equal visual weight to completed. This is the locked moment.
3. **Hours played** (Steam/Xbox/PSN where available; "—" gracefully if no platform with playtime).
4. **Your 2026 archetype** — single archetype name + icon. Computed from year's activity only.
5. **One closing line** — voice-driven, archetype-specific (see §10).

Footer: small `inventoryfull.gg/year` + lockup. That's the watermark.

That's the whole free card. Resist the temptation to add a 6th stat. The constraint *is* the share unit.

### Paid — $5 unlock, scrollable walkthrough, exportable

A full-screen, Wrapped-style sequence at `/year/2026` (entitlement-gated). 11 beats. Each beat is a single full-bleed screen with one stat or moment, advances on tap/click, ~3s per beat if auto-played. Total runtime ~35–45s. At the end, the share card from the free tier is regenerated *with paid styling* (subtle "supporter" mark, full archetype art instead of icon) and offered for download/share.

The 11 beats:

1. **Cold open.** *"You played games this year. We watched."* (Beat to set the tone — see voice.)
2. **The score.** Completed + Moved On counts, side-by-side, equal weight. Big.
3. **Hours played.** With a context line: "That's [n] full nights" or "[n] cross-country flights."
4. **Your most-played game.** Title + cover + hours. One line about what that says.
5. **The one that stuck.** Game you spent the most consecutive weeks playing (longest run between first `playing` and `played`/`bailed`).
6. **The one you let go.** Most recently Moved On game, with the canon line *"Moving on is deciding too."*
7. **Genre fingerprint.** Top 3 genres of completed games as a small stacked bar. Title: *"What you actually finished."*
8. **The pile diet.** Backlog size Jan 1 vs Dec 31. Number, direction, plain-language ("smaller by 14" or "bigger by 9 — that's fine").
9. **Recovered value.** Estimated $ value of games completed this year (cover prices × completions). The Backlog Payback moment.
10. **Your 2026 archetype.** Full archetype art (PNG sprite), title, 2-sentence description tuned for the year.
11. **Share screen.** Free-style card with paid styling, three buttons: copy link, native share, download PNG.

Paid-only features baked into the walkthrough:

- **Animations** — each stat number tickers up; backgrounds shift; archetype art reveals on beat 10. None of this exists on the free card.
- **Audio** — optional, off by default. One short stinger per major beat. (Cut if Phase 4 is tight; not load-bearing.)
- **Per-archetype theming** — beat 10's background, color palette, and closing line all change with the archetype.
- **Export the deck** — single PNG (the share card) + an MP4 of the walkthrough auto-rendered server-side. The MP4 is the killer share asset; people post Spotify Wrapped *videos*, not screenshots.

### The upgrade moment

After the free card renders, one button below it: **"See the full year — $5."** That's it. No modal interception, no nag, no countdown. The button reveals price and a one-liner: *"Eleven beats, your archetype in full, downloadable. One-time, this year only."*

If they click and don't buy, the free card is still theirs. No darkening, no second-chance modal. This matters — we are not extracting.

---

## 3. The data — what we can actually compute

Audit of `lib/store.ts`, `lib/types.ts`, and existing helpers.

### What's stored on every Game

`status`, `addedAt`, `updatedAt`, `completedAt`, `hoursPlayed`, `source` (platform), `genres`, `coverUrl`, `metacritic`, `hltbMain`, `rating`, `vibes`, `moodTags`, `releaseYear`, `isNonFinishable`, `category`, `notes`.

### What's NOT timestamped (this is the critical gap)

We have `addedAt`, `updatedAt`, `completedAt`. We do **not** have:

- Timestamp when status moved Backlog → Up Next
- Timestamp when status moved Up Next → Playing Now
- Timestamp when status moved to Moved On (`bailed`)
- Skip history with dates
- Reroll history with dates

`updatedAt` is the only stamp on status changes, and it's overwritten on every subsequent edit. **For Year in Pile to compute "Moved On this year" we need a status event log.** See §7 — this is the data-layer work in Phase 1.

### Stat-by-stat availability matrix

| Stat | Source | Local (no account) | Synced (Supabase) | Retroactive? |
|---|---|---|---|---|
| Completed count (year) | `games.filter(completedAt in 2026)` | YES — `completedAt` exists today | YES | YES — already stamped |
| Moved On count (year) | needs new event log | partial — can use `updatedAt` as best-effort | YES once event log ships | NO for pre-event-log activity; best-effort using `updatedAt` |
| Hours played (year) | platform deltas (Steam) | partial — current `hoursPlayed` total only, not delta | better with periodic snapshots | NO for retroactive deltas (we don't have Jan 1 snapshot). Workaround: show "total hours" not "year hours" for first run, label it accurately. |
| Most-played game | `hoursPlayed` rank | YES | YES | YES — but it's lifetime, not year. Label honestly. |
| Longest run | needs event log | NO (best-effort using updatedAt) | YES once event log ships | NO |
| Genre fingerprint | `completedAt in year` ∩ `genres` | YES | YES | YES |
| Pile diet (Jan→Dec) | needs `addedAt` of each game | YES — `addedAt` exists | YES | YES — addedAt was always stamped |
| Recovered value | metacritic-weighted cover-price heuristic (already in `statsHelpers.ts`) | YES | YES | YES |
| Archetype (year) | rerun `archetypes.ts` on year-filtered games | YES | YES | YES |

### Handling the partial first year

December 2026 will be most users' first year, and many joined in May. The spec must not pretend otherwise. Three rules:

1. **Honest framing.** Cold-open subtitle adjusts: if user's earliest `addedAt` is after Mar 1, 2026, the headline is *"Your time with Inventory Full, 2026"* not *"Your 2026."* Voice line: *"Half a year. Still counts."*
2. **Stats that don't apply just don't render.** No "0 hours played" embarrassment. If we can't compute a beat, skip it. Walkthrough adapts from 11 beats down to whatever's real.
3. **Hours played caveat.** First-year users see *lifetime* hours from platform imports with the label "Hours in your library" — not "hours this year." We can't fake a Jan 1 snapshot. Year 2 onward, we have the snapshot and can show true year-deltas.

### The "we should have started logging this on Jan 1" problem

We didn't start logging status events. For the December 2026 launch we accept this. Year 1 is intentionally lighter on the event-driven stats; Year 2 will have a full event log. **Phase 1 work includes shipping the event log immediately so Dec 2026 captures at least the last ~2 months of clean events** — better than nothing for "Moved On this year" if the alternative is `updatedAt` heuristics.

---

## 4. UX flow

### Entry points

1. **Landing banner**, Nov 24 → Jan 7 only. Single line above the fold: *"Your 2026 in piles is ready. ›"* — tappable strip, dismissible. Disappears after view.
2. **In-app banner** on `/` for signed-in or has-data users, same window.
3. **Email** if and only if user has opted into email (we don't have email send yet — gate this; it's a Phase 4 stretch if Resend is wired).
4. **Direct URL** `/year/2026` always works. Sharing is a primary loop.

No push notifications. No re-prompts.

### Free flow (the hot path)

1. User taps banner → `/year/2026`.
2. Loading state: 1–2s skeleton, computing.
3. Free card renders (square, full-bleed on mobile). Three buttons below: **Share**, **Download**, **See the full year — $5**.
4. Share button uses native share sheet on mobile, falls back to copy-link + "shared to Twitter/Bluesky" prefills on desktop.
5. Done. They close the tab.

### Paid flow

1. User taps **See the full year**.
2. Sheet: price ($5), one-line description, **Pay with card** button.
3. Stripe Checkout (hosted). On success → redirect to `/year/2026?unlocked=1`.
4. Walkthrough auto-starts at beat 1. Tap-to-advance, or auto-advance with progress bar at top (Wrapped-pattern).
5. Beat 11 = share screen. Three buttons: copy link, share, download MP4.
6. Walkthrough is replayable forever via `/year/2026` once unlocked.

### Post-purchase

- Entitlement persisted both server-side (Supabase) and client-side (localStorage token).
- Receipt sent by Stripe; no app-side email needed.
- If user clears localStorage and isn't logged in, they lose the entitlement (document this, see §7 risk).

---

## 5. Acquisition / virality

This is the marketing line item disguised as a feature. Every share is the funnel.

- **Watermark.** Bottom-right of every card: small `inventoryfull.gg` wordmark + `/year`. Not obnoxious; visible. Same treatment as existing pile/clear cards.
- **The MP4 export** (paid only). Spotify Wrapped's virality is largely driven by people posting *video* to stories. Our MP4 is a 30-second vertical 1080×1920 render of the walkthrough beats. This is the single biggest acquisition lever in the spec.
- **Public landing for non-users.** `/year` (no year — the redirect) shows an anonymized demo card with one line: *"You'd have one too. Takes 2 minutes — import your library."* CTA goes to the existing import flow.
- **Pre-fill social posts.** Bluesky and Twitter share intents pre-filled with: *"my 2026 in piles. [archetype] year. [link]"* — short, lowercase, on-voice. Instagram doesn't support URL pre-fill; we just download-the-PNG for them.
- **Discord embed.** OG card renders correctly when the share link is pasted in Discord. (Existing infra handles this.)
- **No referral codes, no "share to unlock", no points.** That cheapens the share. People share Wrapped because it's about them, not because they get something. Don't ruin that.

---

## 6. Pricing — $5 one-time, this year only

**Picked: $5.**

Reasoning:

- One-time-per-year is a different psychological category than subscription. Letterboxd Pro at $20/yr is annual; Strava at $80/yr is annual. Year in Pile is closer to **a holiday card you buy once** — $5 is the price of a card at Indigo. That mental model fits.
- $5 is at the threshold where credit-card friction beats price friction. People don't deliberate on $5.
- Cosmetic skins in F2P games are $5–10 routinely. Our buyer is the same gamer who has done that 50 times.
- $10 doubles the revenue per conversion but probably halves the conversion rate at this audience size. At our launch MAU, **conversion volume matters more than ARPU.** We need shares (volume), not margin.
- **The free card already gives them the share.** They are paying for the keepsake, not the brag. $5 fits keepsake; $10 starts to feel like we are charging for what should have been free.

If we sustain to Year 3+ and have meaningful price-elasticity data, revisit. For Dec 2026 and Dec 2027: $5 flat.

No "early bird" discount. No bundles. No tiers. One SKU, one price, one click.

---

## 7. Technical scope

### Data layer (Phase 1)

New file `lib/statusEvents.ts`:

- Append-only event log in localStorage, key `if-status-events`. Each event: `{ id, gameId, from, to, at }`.
- `recordStatusEvent(gameId, from, to)` — called from `store.ts` everywhere status changes (cycleStatus, setBailed, unBail, shelveGame, playAgain). Existing call sites: 5.
- Cap at 5000 events, FIFO eviction (year-in-pile only needs ~365 days).
- Sync to Supabase `status_events` table for synced users (mirror schema).

New file `lib/yearInPile.ts`:

- `computeYearInPile(games, events, year)` — returns the structured beat data (counts, top game, archetype, etc.). Pure function. Year-filterable.
- `getYearArchetype(games, events, year)` — reuses `lib/archetypes.ts` logic but with a year-filtered subset.

Tests: snapshot test against a fixture library (Playwright e2e + a small dataset).

### Supabase

New table `year_in_pile_unlocks`:

```
{
  user_id uuid (nullable for guests),
  guest_token text (nullable for accounts),
  year int,
  unlocked_at timestamptz,
  stripe_payment_intent text,
  primary key (coalesce(user_id::text, guest_token), year)
}
```

New table `status_events` (for synced users only):

```
{ id uuid, user_id uuid, game_id uuid, from text, to text, at timestamptz }
```

RLS: users can only read/write their own rows. Standard.

### Stripe

- One-time Stripe Checkout, no subscription, no customer portal needed.
- Webhook → Supabase `year_in_pile_unlocks` insert.
- Guest path: on success, mint a signed token, store in URL + localStorage. (Slightly fragile — if they clear local storage and never logged in, they lose the unlock. Document on the success screen: *"Save your account to keep this forever.")
- **Apply for Stripe account immediately.** Account verification can take 1–7 days for new accounts. Start Phase 1.

### Routes

- `app/year/[year]/page.tsx` — the walkthrough (client component; reads from store + entitlement).
- `app/year/page.tsx` — public demo for the not-yet-user.
- `app/api/year-in-pile/route.tsx` — OG image generator. Reuses patterns from `app/api/share-card/route.tsx`. Renders both 1200×1200 and 1200×630 variants based on query params.
- `app/api/year-in-pile/video/route.ts` — server-rendered MP4 of the walkthrough. **This is the one new piece of infra.** Two options: (a) `@vercel/og` doesn't do video; we'd need ffmpeg via a Vercel function with a slower runtime, or (b) generate the MP4 client-side via `MediaRecorder` API recording a canvas/DOM animation. Option (b) is simpler, ships first, accepts that older browsers won't support it. Pick (b) for Phase 3; add server-side as a Year 2 upgrade.
- `app/api/stripe/year-in-pile-webhook/route.ts` — Stripe webhook handler.
- `app/api/stripe/year-in-pile-checkout/route.ts` — creates the Checkout session.

### Reusing existing infra

- `app/api/share-card/route.tsx` — copy the patterns, don't extend the existing route. Year card has different stats and theming; don't bloat the existing route.
- `lib/archetypes.ts` — call existing logic with a year-filtered game list. Don't fork.
- `components/CompletionCelebration.tsx` — the animation timings and confetti patterns are the closest reference for the walkthrough beats. Steal the choreography.

---

## 8. Build timeline

Working backward from Dec 1, 2026. Solo dev. Day job in parallel.

### Phase 1 — Data + free card (Sep 7 → Oct 11, ~5 weeks)

- Ship `lib/statusEvents.ts` and wire into store. (1 week — small, careful)
- Ship Supabase `status_events` + `year_in_pile_unlocks` tables + RLS. (3 days)
- Ship `lib/yearInPile.ts` computation, year-filtered archetype. (1 week)
- Ship `app/api/year-in-pile/route.tsx` (free OG card). (1 week)
- Ship `app/year/[year]/page.tsx` free-card view + share buttons. (1 week)
- **Apply for Stripe.** Do this on Sep 7. Wait for approval in parallel.

**Phase 1 gate:** internal test passes — Brady's own library renders a believable free card. Voice charter passes on the closing line. Five sample libraries (different archetypes) render distinctly.

### Phase 2 — Paid walkthrough + Stripe (Oct 12 → Nov 8, ~4 weeks)

- Ship walkthrough beats 1–10 as a route, no payment gate yet. (2 weeks)
- Ship Stripe Checkout + webhook + entitlement check. (1 week)
- Ship per-archetype theming on beat 10. (3 days)
- Ship voice copy pass against `voice-charter.md`. (2 days)

**Phase 2 gate:** Brady pays $5 on his own account, walkthrough unlocks, replay works after browser restart.

### Phase 3 — Share flow + virality polish (Nov 9 → Nov 22, ~2 weeks)

- Ship MP4 export (client-side `MediaRecorder`). (1 week)
- Ship public `/year` landing for non-users. (3 days)
- Ship landing banner Nov 24 trigger. (2 days)
- Ship pre-filled share intents. (2 days)

**Phase 3 gate:** end-to-end test on real iOS Safari, Android Chrome, desktop. MP4 downloads work. Share intents fire.

### Phase 4 — Launch window + iteration (Nov 23 → Dec 7, then ongoing)

- Nov 24: banner live, soft soft-launch (no announcement yet — let it leak).
- Dec 1: post on Bluesky, Reddit, Discord, Mastodon. Drop the public demo URL.
- Dec 1–7: monitor Sentry, conversion rate, share rate. Hot-fix only.
- Dec 8–Jan 7: leave it running. Banner sunsets Jan 7. The route stays live forever.

### What ships if we slip

If Phase 3 slips into late November, **cut the MP4 export.** Static PNG share is good enough for v1. The MP4 becomes a Year 2 upgrade. Do not cut: Stripe, walkthrough beats 1–10, free card.

---

## 9. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Stripe account verification > 2 weeks | High | Apply Sep 7. If still pending Oct 26, switch to Ko-fi Shop (one-time payments work there; fewer features, faster setup). |
| First-year partial data feels thin | Med | Honest framing in the cold open ("Half a year. Still counts."); skip beats we can't compute; this is solvable with copy. |
| Free card too good → no paid conversion | Med | The free card is one card. The paid version is 11 beats + animation + archetype art + MP4. These don't substitute for each other. Tested in Phase 2 gate. |
| Free card too thin → no shares | Med | The free card has the archetype, the moved-on count, and a voice closer. That's the share-worthy part. Verify in Phase 1 gate with 5 sample libraries. |
| December competes with Spotify Wrapped | Low-Med | Stagger: launch Dec 1, Spotify usually drops late Nov/early Dec. We're in the same conversation, not blocked by it. Position as gaming-Wrapped, not Wrapped-clone. |
| Privacy: card reveals library | Med | Share is opt-in, always. No auto-public. Card never includes individual game titles unless the user generates and posts it themselves. The walkthrough is private until they share. |
| Guest unlock lost on localStorage clear | Low | Document on success screen. Encourage account creation. Acceptable for a $5 one-time product. |
| MP4 generation breaks on older browsers | Low | Feature-detect `MediaRecorder`. If unsupported, hide MP4 button, show PNG-only. |
| Status event log retroactive gap | Low | Honest: "Moved On this year" uses event log from Phase 1 ship-date forward + `updatedAt` best-effort for earlier. Year 2 is clean. |
| Webhook signature failure → unlock not applied | Med | Standard Stripe retry; on failure, manual reconciliation from dashboard. Add a "didn't unlock?" support email link on the success screen. |

---

## 10. Voice samples

All draft, all matched against `voice-charter.md`. The walkthrough is intentionally terse — Wrapped beats are short.

### Cold open (beat 1)
- "You played games this year. We watched."
- *(first-year variant)* "Half a year. Still counts."

### The score (beat 2)
- "[N] finished. [N] moved on. Both count."

### Hours played (beat 3)
- "[N] hours. That's [n] full nights you weren't doomscrolling. Good."
- *(short year)* "[N] hours. Not bad for half a year."

### Most-played game (beat 4)
- "[Game]. [N] hours. You knew what you wanted."
- *(if hours are absurd)* "[Game]. [N] hours. Healthy. Definitely healthy."

### The one that stuck (beat 5)
- "[Game] held you for [N] weeks straight. The pile didn't stand a chance."

### The one you let go (beat 6, locked frame)
- "[Game]. You moved on. Moving on is deciding too."

### Genre fingerprint (beat 7)
- "What you actually finished:" + bars.
- *(if one genre dominates)* "Mostly [genre]. Mostly is fine."

### The pile diet (beat 8)
- *(smaller)* "Your pile is [N] games smaller. You did that."
- *(bigger)* "Your pile is [N] games bigger. The sales got you. They got everyone."
- *(same)* "Same size as January. You held the line."

### Recovered value (beat 9)
- "[$N] of games — played, not shelved. Receipts."

### Archetype (beat 10, per-archetype)
- *(The Completionist)* "You finish what you start. Boring people call that a virtue."
- *(The Drifter)* "You started a lot. You finished some. Movement is its own thing."
- *(The Hoarder)* "Your backlog has a backlog. We respect the commitment."
- *(default)* "[Archetype]. That's your year."

### Share screen (beat 11)
- "Share it. Or don't. It's your year."

### Upgrade button (free card)
- "See the full year — $5."
- Sub: "Eleven beats, your archetype in full, downloadable. One-time, this year only."

### Post-purchase confirmation
- "You're in. Save your account to keep this forever."

### Public landing (`/year`, non-user)
- H1: "your 2026, in piles."
- Sub: "import your library. takes 2 minutes. we'll do the math."

### Share intent pre-fill (Bluesky/Twitter)
- "my 2026 in piles. [archetype] year. [link]"

### Banner (landing strip, Nov 24+)
- "your 2026 in piles is ready. ›"

---

## 11. What this spec does NOT cover

Out of scope for Dec 2026 — flag for future:

- Year-over-year comparison (needs Year 2 data).
- Friends comparison / leaderboard — violates privacy posture, hard no.
- Spotify-style "audio aura" gimmick — not credible for gaming, skip.
- Email send of the card — depends on Resend wiring, see `marketing-recipients-spec.md`. Add when email is live.
- Localization — English only for v1.
- Refunds — Stripe's default policy applies; no app-side flow. If a user emails, refund manually.

---

## 12. Open questions for Brady before build starts

1. **Stripe vs Ko-fi for payment.** Stripe is cleaner, faster checkout, better webhooks. Ko-fi is already set up. Recommendation: Stripe — but if Stripe verification stalls, fall back.
2. **MP4 export — ship in v1 or punt to Year 2?** Spec recommends ship-if-time; cut-if-tight. Confirm.
3. **Is Dec 1 firm, or is Dec 8 acceptable?** Spotify Wrapped usually drops late Nov/early Dec; if we want to ride the conversation, Dec 1–3 is the window. If we want our own air, Dec 15. Spec assumes Dec 1.
4. **Public `/year` demo card — anonymized real data, or fully fabricated?** Recommendation: fabricated. Avoid the "is this me?" problem.
5. **Email opt-in for next year's Year in Pile reminder?** A single checkbox on the share screen: "remind me next December." Low-cost, builds the list. Recommendation: ship in Phase 3 if Resend is wired by then; otherwise punt.

---

*Spec locked 2026-05-13. Next session implements Phase 1.*
