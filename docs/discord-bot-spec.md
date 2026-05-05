# Inventory Full — Discord Bot Spec

*Written 2026-05-04. Plan, not a build. No prior bot spec found in `docs/` or `notes/`; this is canonical.*

---

## TL;DR — Status: SOON, not LATER (revised 2026-05-05)

Original spec recommended waiting for ~25 Discord members. **Revised after Brady review:** the bot is cheaper to build than expected (~3 days, ~$0–2/mo hosting on Fly.io) AND the lead feature `/pick` is no-OAuth and works in any gaming Discord — meaning the bot can drive members to OUR server instead of the other way around. That flips the threshold logic.

**New recommendation:** build Tier 1 (`/pick` + `/archetype` + clear-celebration webhook) when there's a clear ~3-day window of focused time. Don't gate on community size; gate on Brady having uninterrupted time. Skip Tier 2 (OAuth/library access) until 1k WAU.

The lead distribution feature is `/pick`. Other gaming Discords install the bot for the random-pick utility; members discover Inventory Full through the embed footer. This is bottom-up distribution that doesn't require us to have a community first.

**Avatar manipulation:** confirmed not possible. Discord locks bot avatar control. Workaround is archetype roles + a downloadable archetype PNG sized for Discord. See section 4.

---

## 1. Mission statement

The Inventory Full bot exists to celebrate playing, not to add a new thing to manage. Same anti-overgamification stance as the app: less time interacting with the bot is a feature, not a bug. The bot's job is to deliver a single warm moment — a pick, an archetype reveal, a clear celebration — and then get out of the way so the user can go play. It is not a leaderboard, not a daily-streak engine, not a Discord engagement loop. If a feature would make people spend more time in chat instead of in a game, it doesn't ship.

---

## 2. Tier 1 — ship-now value, no OAuth, low cost

Three commands and one webhook. All ship in under a week.

### `/pick [length] [mood]`

**Syntax:** `/pick length:short mood:cozy`
- `length`: `short` (~20 min) | `medium` (~1–2 hrs) | `long` (2+ hrs) — optional
- `mood`: `cozy` | `tense` | `mindless` | `story` | `competitive` | `creative` — optional

**Behavior:** Bot responds with one game from a curated pool of ~300 well-loved titles tagged by length + mood. Embed shows title, cover, one-line description, "Why this:" line, and a single button: **Reroll**. No filters, no shortlist, no "top 5." One pick. If the user rerolls, prior pick goes on a 24-hour cooldown for that user.

**Why it matters:** This is the lead distribution feature. Any gaming Discord can install the bot and members get a no-OAuth, mid-conversation game pick. It's the bot's entire pitch in one command. It works without anyone signing up for Inventory Full — which is the point. The footer of every pick reads: *Built by inventoryfull.gg — your library, sorted.*

**Implementation note:** Curated JSON list shipped with the bot, ~300 entries with `{ title, igdb_id, length, moods[], tagline }`. No DB read on the hot path. Cover URLs cached. Rebuild the list quarterly from RAWG/HLTB.

**Sample copy:**
> **Tonight: Outer Wilds.**
> 4-hour first session, mind-bending mystery box. You don't level up — you learn.
> *[Reroll]*

---

### `/archetype <slug>`

**Syntax:** `/archetype the-juggler` (autocomplete pulls from the 16+ slugs in `lib/archetypeRegistry.ts`)

**Behavior:** Bot posts the archetype's share card (the OG image from `app/archetype/[slug]/opengraph-image.tsx`) plus a one-line flavor blurb and a CTA: *"Get yours at inventoryfull.gg/archetype"*.

**Why it matters:** Archetypes are the single most viral thing the app has made. Letting people drop them in chat without leaving Discord = free distribution. Every post is a billboard.

**Implementation note:** The OG endpoint is already public. Bot fetches the URL and embeds it. Zero new server work.

---

### `/whatshouldweplay [mode]` *(group pick)*

**Syntax:** `/whatshouldweplay mode:co-op`
- `mode`: `co-op` | `versus` | `party` | `couch`

**Behavior:** Game-night planner. One pick from a curated multiplayer pool. Same one-pick discipline as `/pick`. Reroll button. Optionally accepts `players:4` to filter by minimum player count.

**Why it matters:** This is the second leverage feature. Game-night Discords (the kind that already exist with hundreds of members) install the bot for THIS, then get `/pick` and `/archetype` along with it.

**Implementation note:** Same curated-JSON pattern as `/pick`, separate pool with multiplayer metadata.

---

### Webhook: clear celebrations to a #cleared channel

**Behavior:** When a logged-in Inventory Full user marks a game Completed or Moved On AND has the Discord webhook enabled in their account settings, the app POSTs to a server-specific webhook URL. Bot relays a clean embed: archetype sprite, game title, status (Completed / Moved On), one-line warm message.

**Why it matters:** Public progress = social momentum without obligation. Unlike a streak, missing a day doesn't punish you — there's just nothing to post. Aligns with the thesis: action gets celebrated, inaction is invisible.

**Implementation note:** Standard Discord webhook integration. URL stored in Supabase, opt-in only. No data leaves the user's account without explicit setup.

**Sample copy (Completed):**
> **Sara cleared Hades.**
> 38 hours. She committed. She finished. That's the whole game.

**Sample copy (Moved On):**
> **Sara moved on from Disco Elysium.**
> Moving on is deciding too. It's not going anywhere.

---

## 3. Tier 2 — OAuth + library access

Higher value, higher build cost. Defer until Tier 1 is shipped and used.

### `/myarchetype`

**What it does:** Computes the user's archetype from their actual Inventory Full library and posts the share card in chat. Requires linking Discord ID to Inventory Full account (OAuth via the app's existing Supabase auth, plus a Discord-side `/link` flow).

**Why it's worth the lift:** This is the conversion vector. A Discord member sees `/archetype the-juggler` in chat, runs `/myarchetype`, gets prompted to link their library, lands in the app. Bot becomes a top-of-funnel.

**Complexity:** Medium. Discord OAuth + state token + a `/link` page on inventoryfull.gg that ties Discord ID to user record. ~3–4 days.

---

### `/recommend`

**What it does:** A `/pick` from the user's actual Inventory Full library, in Discord. Single game, mood + length filters, reroll button.

**Why it's worth the lift:** This is what differentiates Inventory Full from every other "random game" bot. The pitch in one command: *we already know your library, you don't have to type a thing.*

**Complexity:** Medium. Requires linked account + read access to the user's library via authenticated API call. ~2 days on top of `/myarchetype` plumbing.

---

### `/duel @friend <game>`

**What it does:** Two linked users race to clear a chosen game off either user's backlog. Bot polls completion status periodically and announces the winner. Loser pays a forfeit chosen at duel time (text-only — bot just announces).

**Why it's worth the lift:** It's the only feature in the spec that creates a reason for two people to commit to playing on a deadline. Loss aversion harnessed for action, not for shame.

**Complexity:** High. Requires both users linked, cross-user library access scope, scheduled polling job, race-condition handling on near-simultaneous completion. ~1 week. **Ship last, or never.** Feels good on paper; risk is it becomes the "engagement loop" the thesis prohibits.

---

## 4. Avatar / profile magic — feasibility

Brady asked: can the bot magically put someone's archetype into their avatar? Honest answer:

| What | Possible? | Notes |
|---|---|---|
| Bot changes a user's account avatar | **No** | Discord API does not expose this to bots. Period. |
| Bot changes a user's per-server profile picture (Nitro) | **No** | User-controlled only. No bot endpoint. |
| Bot assigns a role with an archetype-colored badge + role icon | **Yes** | Server boost level 2+ unlocks role icons. Each archetype = one role. Closest thing to "magical." |
| Bot tints username via role color | **Yes** | Works on every server. Subtle but free. |
| Bot DMs the user a downloadable archetype avatar PNG (256×256) sized for Discord | **Yes** | We already render archetype sprites; trivial to crop to a circle PNG and attach. User sets it themselves. |

**Recommended build:** Two of these together —
1. **Archetype roles with colored names + role icons** (server-level visual identity)
2. **Downloadable archetype avatar via `/myarchetype` followup button** ("Want this as your avatar? *[Download PNG]*")

Skip the role-icon feature for servers that aren't boosted; just use color.

**Do not promise** "we'll change your avatar." That promise can't be kept and will burn trust. Pitch it as: *"Claim your archetype — get a colored name and a matching avatar to set yourself."*

---

## 5. Distribution — what makes a server admin install this

Ruthless answer: **`/pick` is the lead feature.** Every other command is a bonus.

A server admin installs a Discord bot for one of three reasons: it solves a recurring conversation friction, it's funny enough to share, or it's already installed in a friend's server. `/pick` solves the most common gaming-Discord conversation: *"what should we play tonight?"* It doesn't require anyone to sign up, link an account, or learn a system. One slash command, one game, done.

Secondary wedge: `/whatshouldweplay` for game-night servers. Tertiary: `/archetype` for the share/laugh value.

**Drop:** any "archetype of the day" announcement feature. Auto-posting in a channel is noise, not value, and trips the "engagement loop" wire.

**Distribution play once Tier 1 ships:**
1. Submit to top.gg and discord.bots.gg (free)
2. DM 10 mid-size gaming Discords with a one-line pitch: *"`/pick` — random game, mid-conversation, no signup. Mind if we drop it in?"*
3. Add an "Add to Discord" button on inventoryfull.gg

---

## 6. Hosting + cost

Discord bots that use the gateway (real-time presence, message events) need a persistent process. Slash-command-only bots can run on serverless via the Interactions Webhook URL — the entire Tier 1 plan is slash-command-only, so we can use either.

| Option | Free tier | Realistic ≤100 servers, ≤10k cmds/mo | Setup friction |
|---|---|---|---|
| **Fly.io** | 3 shared-cpu-1x VMs free | $0 indefinitely at this scale | Low. `flyctl deploy` from a Node repo. |
| Railway | $5 credit, sleeps after | ~$5/mo (always-on) | Lowest. Git push → live. |
| Cloudflare Workers + Interactions Webhook | 100k req/day free | $0 | Highest. Discord verifies signed requests; cold starts are a thing. Best if you commit to webhook-only. |
| DigitalOcean droplet | None | $6/mo | High. You manage the box. |
| Hetzner | None | ~$4/mo (€3.79) | High. EU latency from NA users is fine for slash commands. |

**Recommendation: Fly.io free tier.** Reasoning:
- Free at this scale, even with growth
- Real Node process (no Workers cold-start gotchas)
- One-line deploys; matches your "no CLI ceremony" preference
- Easy to migrate to paid tier ($1.94/mo for a 256MB always-on machine) if free hits limits

**Discord application registration:** free.

**Total realistic monthly cost for Tier 1 at small scale: $0.** Add ~$2/mo if you upgrade Fly to a dedicated machine for stability. Sentry for the bot reuses your existing org — no extra cost.

---

## 7. Build effort estimates

Solo-builder hours, focused work, no scope creep.

| Tier | Scope | Estimate |
|---|---|---|
| **Tier 1 MVP** | `/pick`, `/archetype`, curated JSON, Fly.io deploy, basic embed styling | **3 days** |
| **Tier 1 full** | Add `/whatshouldweplay`, clear-celebration webhook, Inventory Full settings UI for webhook opt-in, archetype role auto-assign on `/archetype` claim | **+4 days (1 week total)** |
| **Tier 2 — `/myarchetype` + `/recommend`** | Discord OAuth, `/link` page, library API endpoint with token auth | **+5 days** |
| **Tier 2 — `/duel`** | Cross-user scopes, polling job, race handling | **+5 days, optional** |

---

## 8. Build order

1. **Wait.** See the TL;DR threshold. If unmet, stop here.
2. **Day 1–3: Tier 1 MVP.** `/pick` + `/archetype` only. Ship to your own server. Use it for a week. If `/pick` doesn't get used, the rest doesn't matter.
3. **Day 4–7: Tier 1 full.** Add `/whatshouldweplay`, webhook celebrations, role auto-assign.
4. **Distribution sprint (1 week, parallel to using the bot):** top.gg listing, DM outreach, "Add to Discord" button on the site.
5. **30 days post-launch: re-evaluate.** If the bot is in 5+ servers and seeing daily `/pick` use, build Tier 2 `/myarchetype` + `/recommend`. If it isn't, the bot is a curiosity and Tier 2 is wasted effort.
6. **Defer `/duel` indefinitely** unless a specific server requests it.

---

## 9. Risks and "do not build"

Hard nos. These align with `.claude/rules/legal-compliance.md` and the app's anti-engagement-loop thesis.

- **No reading user messages.** The bot uses slash commands and webhooks only. Never request `MESSAGE_CONTENT` intent. (Discord's policy + ours.)
- **No auto-DMs based on behavior.** "We noticed you haven't played in a while" = exactly the shame loop the app is built to kill. Outbound messages only when the user explicitly invokes a command.
- **No daily streak feature.** Punishing users for missing a day inverts the thesis.
- **No leaderboards by playtime or completions.** Competitive backlog clearing turns playing into a metric. Fights the product.
- **No "archetype of the day" auto-announcements.** Noise; channel pollution; engagement bait.
- **No bot-driven economy / XP / levels.** This is gaming Discord cancer. Don't.
- **No scraping of Steam/PSN profiles via the bot.** Library data goes through the user's authenticated Inventory Full account or it doesn't go at all.
- **No third-party data sharing.** Discord ID maps to Inventory Full user ID, stored in our Supabase, never sent anywhere else.
- **PSN/Xbox/Steam tokens never touch the bot process.** Library access is read-only via our own API, behind our own auth.

Privacy Policy update is required before Tier 2 ships (storing Discord IDs against accounts is new data scope).

---

## 10. Open questions for Brady

Decide these before any code starts:

1. **Threshold trigger.** Agree with the 25-member / 1k-WAU delay rule? If you want to build sooner, what's the rationale?
2. **Curated `/pick` pool — who curates?** 300 hand-picked games is the fastest path. Alternative: pull from RAWG top-rated + HLTB. Hand-picked is better; takes ~4 hours.
3. **Archetype roles — opt-in or auto-assign on `/myarchetype`?** Auto-assign is friction-free but spawns 16+ roles in the server. Some admins will hate that. Recommend opt-in with a confirmation button.
4. **Webhook celebrations — server-wide channel or per-user?** Server-wide #cleared channel is more social. Per-user DM is more private. Recommend server-wide as default, DM as opt-in.
5. **Inventory Full account-side: where do Discord settings live?** Likely a new Settings → Integrations panel. Confirm scope is OK.
6. **Bot name and avatar.** "Inventory Full" or something else? "Pile" as a nickname has been floated. Decide before registration — renaming a Discord app is fine but the username is sticky.
7. **Distribution — willing to DM 10 server admins in week 1?** The bot lives or dies on this. If not, defer the build further.

---

*End of spec.*
