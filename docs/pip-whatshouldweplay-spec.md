# /whatshouldweplay — Pip Phase 2 Spec

**Status:** Spec only. Not yet implemented.
**Author:** Spec drafted 2026-05-13.
**Target:** Pip bot, `bot/`, Phase 2.
**Estimated build:** 4–6 hours (revised from Brady's note of 3–4h — see §8).

---

## 0. One-paragraph summary

`/whatshouldweplay` is a time-boxed group pick. The initiator runs the slash command; Pip drops a public embed with **three** candidate games drawn from the same curated pool as `/pick`, time-boxed to 60 seconds. Anyone in the channel can vote with a button click. Highest count at timeout wins, ties broken by deterministic re-roll on the tied subset, single-voter "consensus" wins immediately. The end state is a single confident pick announcement with a "get playing." link — same payoff shape as `/pick`, adapted for groups. Stateless across restarts; in-memory only.

This is the "we pick, you play" thesis applied to a group: **less debating, one outcome, ship them out of Discord and into a game.**

---

## 1. UX flow

### Step 0 — Initiator types

```
/whatshouldweplay length:Medium mood:Chill
```

All parameters optional. No `length` and no `mood` = unconstrained pool draw.

### Step 1 — Poll opens (public reply, ~immediately)

Pip replies in-channel with an embed showing three candidates and three vote buttons. The reply is **not ephemeral** — everyone needs to see it.

**Embed (sample):**

> 🎲 **Three games. 60 seconds. Vote.**
>
> **1. Hades** — ~25h · Intense, Atmospheric
> Greek mythology roguelike. Tight runs, real story, gets out of your way.
>
> **2. Stardew Valley** — ~60h · Chill, Creative
> Inherit a farm, slowly rebuild a life. Easy to load, hard to put down.
>
> **3. Vampire Survivors** — ~15h · Brain Off, Intense
> 20-minute runs, dopamine on tap. Costs less than a coffee.
>
> _Medium session · Chill_
>
> Tap a number. Most votes wins. Tie = we re-roll between the tied games.

**Buttons (row 1):** `1` `2` `3` (Primary style, just the number)
**Buttons (row 2):** `🎲 Re-roll the three` (Secondary, initiator-only) · `End now` (Secondary, initiator-only)

Footer: `Built by inventoryfull.gg · Closes in 60s`

### Step 2 — Voting (60 seconds)

Each click updates an in-memory tally. Pip acknowledges every vote with an **ephemeral** reply (only the voter sees it) so the public embed stays clean:

> Locked in **Hades**. You can change your mind — tap a different number before time's up.

If they re-vote, their previous vote is reassigned (one vote per user, latest wins). Ephemeral copy:

> Switched to **Stardew Valley**.

The public embed is updated **once at 15 seconds remaining** with a soft warning and live counts, not on every vote (avoids rate-limit thrash + reduces visual noise that drives more debating):

> ⏳ **15 seconds.** Hades: 2 · Stardew: 1 · Vampire Survivors: 0

### Step 3 — Resolution (at timeout or early-end)

**Case A — Clear winner (any single option leads):**

Public message edit replaces the poll:

> 🎲 **Tonight's pick: Stardew Valley.**
> ~60h · Chill, Creative
> Inherit a farm, slowly rebuild a life. Easy to load, hard to put down.
>
> _Voted by 4 · less debating, more playing._

Buttons: `get playing.` (Link → inventoryfull.gg). No re-roll. The decision is decisive.

**Case B — Tie (2 or 3 options tied):**

Pip deterministically picks one from the tied subset (seeded on interaction ID + tick count to avoid "looks rigged" suspicion across re-tries) and announces:

> 🎲 **Tied. Pip breaks it: Hades.**
> ~25h · Intense, Atmospheric
> Greek mythology roguelike. Tight runs, real story, gets out of your way.
>
> _Tie between Hades and Vampire Survivors · go play._

**Case C — Zero votes:**

> 🎲 **Nobody voted. Pip picks: Hades.**
> ~25h · Intense, Atmospheric
> Greek mythology roguelike. Tight runs, real story, gets out of your way.
>
> _Stalemate is still a decision._

**Case D — One voter:**

Their pick wins. Same announcement format as Case A with `_Voted by 1 · that counts._` footer.

### Step 4 — Initiator overrides

- **`🎲 Re-roll the three`** (initiator only, available until first vote is cast): swaps in three new candidates, resets the 60s timer. Hard-capped at **2 re-rolls per poll** to prevent infinite browsing — after that the button greys out. (Choice-overload guardrail; see §3.)
- **`End now`** (initiator only, available always): force-resolves immediately using current tally with Case A/B/C/D rules.

### Step 5 — Done

The embed is final. No threading, no "what next?" prompt. The link button is the only forward path, and it leads out of Discord.

---

## 2. State management

### What needs to live in memory

Per active poll:
```ts
interface ActivePoll {
  pollId: string;              // interaction.id of the slash command
  channelId: string;
  initiatorId: string;
  candidates: PoolEntry[];     // exactly 3
  votes: Map<userId, 0|1|2>;   // candidate index
  rerollsUsed: number;
  expiresAt: number;           // Date.now() + 60_000
  timeoutHandle: NodeJS.Timeout;
  warningHandle: NodeJS.Timeout;
  messageId: string;           // for edit at resolution
  filterLength?: LengthTier;
  filterMood?: string;
}
```

Stored in a module-level `Map<pollId, ActivePoll>` in `src/commands/whatshouldweplay.ts`.

### Tradeoffs of in-memory state (justifying the choice)

**Costs:**
- Lost on bot restart. A poll mid-flight when Pip restarts dies silently — the buttons keep working visually but vote handlers can't find the poll. Mitigation: when a button click hits an unknown poll ID, reply ephemerally: *"This poll expired. Run `/whatshouldweplay` again."*
- Single-instance only. If we ever shard or scale to multiple Fly machines, votes get split across instances. Pip is currently single-instance (`min_machines_running = 1`), so this is fine through Phase 2.
- No cross-shard. Same problem; same answer.

**Why it's the right call for v1:**
- A poll lives **60 seconds**. The blast radius of a restart mid-poll is one dead poll. Acceptable.
- Adding Fly KV or Redis introduces a network round-trip on every vote click, latency users feel.
- No DB matches the existing architecture decision documented in `bot/README.md` ("No DB. Adding state... is a phase-2 decision, probably Fly KV when we get there").

### When we'd graduate to Fly KV / Redis

Trigger conditions (any one):
1. We add `/pick` cooldowns and need persistent rate-limit counters anyway (shared infra cost goes to zero).
2. We shard Pip across multiple Fly machines.
3. We add persistent poll history or analytics (out of scope — see §10).

### Cleanup / eviction

- **Primary:** `setTimeout` 60s after poll open → resolve and `polls.delete(pollId)`.
- **Backstop:** on every new poll, sweep the map for entries with `expiresAt < Date.now() - 5 * 60_000` (5-minute grace) and delete. Cheap O(n) on a map that should never exceed dozens of entries.
- **Memory bound:** at 256MB Fly tier with ~200 bytes per poll, we'd need ~1M concurrent polls to OOM. Not a real risk.

### Concurrency safety

Node is single-threaded for our purposes; no locks needed. Button interactions are dispatched serially per the gateway. The only race is "vote arrives at the same millisecond as timeout fires" — handle by checking `polls.has(pollId)` at the top of every button handler and bailing with the expired-poll ephemeral if missing.

---

## 3. Vote mechanics — pattern choice

Three patterns Brady flagged:

### (a) Bot suggests N games, users react/vote — **RECOMMENDED**
- ✅ Visibility: everyone sees the same shortlist; consensus has something to converge on.
- ✅ Speed: one click per voter, time-boxed.
- ✅ Low cognitive load if N is small.
- ⚠️ Tensions choice-overload research — must cap N tight.

### (b) Each user submits a pick, bot picks one
- ❌ Requires every voter to know the pool or type a title. High friction, autocomplete on 300 games gets messy.
- ❌ Submission phase doesn't time-box well — "still waiting on Jess" purgatory.
- ❌ Output of "Pip picked randomly from what you all said" doesn't feel collaborative; feels like a coin flip with extra steps.

### (c) Bot picks ONE, group thumbs-up/down, re-roll on majority-no
- ✅ Closest to `/pick` ergonomics and the solo thesis.
- ❌ Loses the "discuss the options" social moment that's literally the use case. The whole point is people *want* to weigh in.
- ❌ Veto culture: one loud person yells "no" and re-rolls; group churn.
- ❌ Re-roll-until-everyone-agrees is the failure mode `/whatshouldweplay` is trying to fix.

### Verdict: (a) with N = 3

**Reconciling with `.claude/rules/user-psychology.md`:**

The solo thesis ("no shortlists, one pick") draws on Iyengar & Lepper (24-jam study, ~10× drop in action), Schwartz (more options → more regret), and Sweller (working memory ~4 chunks). Adapting these for groups:

- **Iyengar/Lepper:** the demotivation effect is observable from 24 → 6 options. Three is well below the threshold where choice paralysis kicks in. Three options is one chunk of working memory, not three.
- **Schwartz:** post-decision regret rises with the size of the rejected set. Rejecting 2 unseen alternatives is psychologically trivial vs. rejecting 297 alternatives from the full pool.
- **Sweller:** group voting *adds* a coordination cost the solo flow doesn't have. Capping at 3 keeps total load (read 3 lines + click 1 button) under the 4-chunk ceiling.

**Why 3 not 5:** 5 mirrors the jam-study experimental conditions where choice overload starts to manifest. 3 is the canonical "few enough to hold all at once" number used in HCI research for menu choices. Also: 3 fits cleanly in one Discord action row (5 buttons max per row; we want headroom for re-roll/end controls).

**Why not 2:** binary choice flattens to coin-flip energy. 3 feels like a real pick.

**Hard rules derived:**
- N is fixed at 3. Don't make it configurable. Configurability is exactly the cognitive load we're trying to remove.
- Re-rolls hard-capped at 2 per poll. Otherwise we recreate the "browse forever" problem.
- No "see more options" affordance. Ever.
- Tie-break is decisive (Pip picks). No second-round vote.

---

## 4. Input parameters

Match `/pick` for muscle memory:

```ts
/whatshouldweplay
  length: small | medium | large       (optional)
  mood: chill | intense | story-rich | brain-off | atmospheric | strategic | creative | spooky | emotional (optional)
```

**Deliberately NOT added:**
- ❌ `group_size` — Discord doesn't reliably know who's "in" the voice channel from a text command, and adding it as a typed param is friction for negligible value. The number of voters reveals itself.
- ❌ `vibe` separate from `mood` — duplicate axis.
- ❌ `multiplayer_only` toggle — see §6. Single-player games can be group-watched; over-filtering kills the pool.
- ❌ `timer` override — 60s is the answer. Configurability invites debate about the timer itself.

**Filters apply to the candidate draw, not to votes.** The three games shown all match the filters; voters can't see games that were filtered out. This is intentional — surfacing filtered-out options reintroduces choice.

**Pool draw rules:**
- Apply length + mood filters to pool.
- If filtered pool has fewer than 3 entries, drop the mood filter first, then the length filter. Surface a quiet note in the embed footer: *"Loosened the mood filter — pool was thin."*
- If still < 3 (shouldn't happen at 300-game pool), reply with the no-match line from `embed.ts`.
- Draw 3 distinct random entries. No duplicates across the three candidates.

---

## 5. Timeouts and edge cases

| Scenario | Behavior |
|---|---|
| 0 voters at timeout | Pip picks one of the three (seeded random). Case C copy. |
| 1 voter | That voter's pick wins. Case D copy. |
| 2-way tie | Deterministic seeded re-pick from tied subset. Case B copy. |
| 3-way tie | Same as 2-way: seeded re-pick from all three. |
| Channel goes quiet 5+ min | Doesn't happen — timer is 60s. Backstop sweep cleans the map. |
| 30 people in channel | Fine. Each person gets one vote (Map by user ID), interaction rate is well under Discord's 30 req/sec per-bot limit. Public embed update happens at most twice (at 15s warning + resolution), not on every vote. |
| Initiator leaves Discord / blocks bot | Poll continues; initiator-only buttons (`re-roll`, `end now`) silently grey-handled with "Only the initiator can do that" ephemeral if anyone else clicks. If the initiator's gone, those buttons just go unused — timer still fires. |
| Same user runs `/whatshouldweplay` twice in same channel | Both polls run concurrently. Different `pollId`s, different button `customId`s. Confusing for the channel but technically supported; no extra logic needed. |
| Bot restart mid-poll | All in-flight polls die. Button clicks reply ephemeral: *"This poll expired. Run `/whatshouldweplay` again."* |
| User who voted leaves channel | Vote stays. We don't reconcile membership — would require gateway intent we don't have. |
| Discord interaction token expires (15 min) | Won't matter — poll resolves in 60s. The followup edit happens well inside the token window. |
| Initiator clicks `End now` before any vote | Falls through to Case C (zero votes). |
| Filter combo yields empty pool | Reply ephemerally with `noMatchLine(seed)` from `embed.ts`. No poll opens. |

---

## 6. Data source

**Use the same `data/pick-pool.json`** as `/pick`. No separate pool. Rationale:

- The whole point of growing the pool to ~300 is that one curated list serves both modes.
- A "multiplayer-only" pool would be ~30 games — too thin for 3-of-3 draws with mood + length filters applied.
- Single-player games are legitimately groupable: people watch each other play *Disco Elysium* on Discord screen-share all the time. Over-filtering for "couch co-op" misreads the actual use case.

**Optional metadata for later (not v1):**

Add an optional `coopHint` field to the pool schema:
```json
{
  "title": "It Takes Two",
  "coopHint": "couch-coop"   // or "online-coop" or "screen-share" or undefined
}
```

If present, render in the candidate line as a small tag (e.g. `· couch coop`). Don't filter on it. This is a passive signal, not an active filter — keeps cognitive load flat. Defer to a follow-up PR; v1 ships without it.

---

## 7. Voice copy candidates

All pass voice-charter.md (read aloud, no hedging, no LinkedIn vocab, no em dashes for drama).

### Poll-open headers (rotate by seed)
1. `"Three games. 60 seconds. Vote."`
2. `"Pile picked three. You pick one."`
3. `"We narrowed it. You decide."`
4. `"Three options. Tap one. Go play."`

### Vote-registered ephemeral lines
1. `"Locked in **{game}**. Change your mind before time's up if you want."`
2. `"**{game}** it is. Or change it. You've got time."`
3. `"Voted: **{game}**."`
4. `"**{game}**. Got it."`
5. `"Switched to **{game}**."` (for vote changes only)

### 15-second warning (public embed update)
1. `"⏳ **15 seconds.** {tally}"`
2. `"⏳ **Almost.** {tally}"`
3. `"⏳ **15s left.** {tally}"`

### Pick announced (winner)
1. `"🎲 **Tonight's pick: {game}.**"`
2. `"🎲 **You picked {game}.** Go."`
3. `"🎲 **{game}.** Sorted."`
4. `"🎲 **{game} wins.** Less debating, more playing."`

### Tie-break announced
1. `"🎲 **Tied. Pip breaks it: {game}.**"`
2. `"🎲 **Couldn't decide. {game} it is.**"`
3. `"🎲 **Split vote. Pip picks {game}.**"`

### Re-roll triggered (initiator)
1. `"Three new games. 60 fresh seconds."`
2. `"Re-rolled. Last shot."` (if `rerollsUsed === 2`)
3. `"New three. Vote."`

### Initiator-only button error (someone else clicks re-roll/end)
1. `"Only the person who started this can do that."`
2. `"That one's for the initiator."`

### Footer
- During poll: `Built by inventoryfull.gg · Closes in {n}s`
- After resolution: `Built by inventoryfull.gg`

All headers/lines live in a `WHATSHOULDWEPLAY_HEADERS`, `WHATSHOULDWEPLAY_TIE_LINES`, etc. exports added to `src/embed.ts`. Reuse `brandedEmbed()`. Don't duplicate the color/footer setup.

---

## 8. Estimated build time

Brady's note said 3–4 hours. Revised: **4–6 hours.**

Rough breakdown:
- Command scaffolding (data + execute + register): 30 min
- Pool draw + filter loosening logic: 30 min
- In-memory poll state + cleanup: 45 min
- Button handlers (vote, re-roll, end-now): 1 hr
- Timer + 15s warning logic + edit message: 45 min
- Tie-break determinism + Cases A–D resolution copy: 45 min
- Voice copy variants in `embed.ts`: 20 min
- Edge cases (expired polls, initiator-only guards, vote changes): 45 min
- Dev-guild testing + manual scenarios: 1 hr

The 3–4 hr estimate likely undercounts the test loop. Multi-user button voting is annoying to test alone — Brady will need to either hop between two Discord accounts or pull in one collaborator.

---

## 9. Open questions for Brady

1. **Re-roll cap: 2 hard cap, or unlimited until first vote lands?** Spec assumes 2 hard. Unlimited-until-first-vote is also defensible but invites the "let's keep rolling until we see something good" failure mode.
2. **Should the winning announcement @-mention the voters?** Pro: feels rewarding, increases stickiness. Con: pings, notification fatigue, can feel intrusive in big channels. Spec assumes no.
3. **Initiator-only `End now`, or anyone-can-end after 30s?** Spec assumes initiator-only. The anyone-can-end variant is more democratic but invites trolling.
4. **Show vote counts live, or only at 15s warning + resolution?** Spec assumes only-at-warning (reduces rate-limit thrash and bandwagon voting). Live counts feel more alive but bias late voters toward the leader.
5. **Do we need a `coopHint` tag in the pool schema for v1, or punt entirely?** Spec assumes punt. Adding it to 300 entries by hand is a curation cost.

---

## 10. Non-goals (explicit deferrals)

- ❌ Persistent poll history ("show me last week's picks")
- ❌ Leaderboards / "most-voted game in your server"
- ❌ Cross-channel or cross-server polls
- ❌ "Schedule a poll for tonight at 8pm"
- ❌ Webhooks back to the web app on resolution
- ❌ Account linking — voters are anonymous Discord IDs only, never linked to IF accounts (legal-compliance.md: stateless, no PII)
- ❌ "Play together" matchmaking / lobby creation
- ❌ Editing the candidate list mid-poll (suggest a 4th, swap one out, etc.)
- ❌ Per-user filters ("Jess only wants chill games")
- ❌ Weighted voting (server admins get 2 votes, etc.)
- ❌ Threaded discussion under the poll
- ❌ DMs to non-voters reminding them to vote
- ❌ Multi-language support
- ❌ Custom emoji on vote buttons (just use `1` `2` `3`)
- ❌ Configurable timer
- ❌ Configurable N (always 3)

Each non-goal exists because it either (a) reintroduces choice overload, (b) extends time-in-Discord at the expense of time-playing, (c) requires persistent state we don't have, or (d) crosses a legal-compliance line (PII, account linking).

---

## 11. Implementation checklist for the next session

When you sit down to build:

- [ ] `bot/src/commands/whatshouldweplay.ts` — command file, follows `pick.ts` shape.
- [ ] Add `WHATSHOULDWEPLAY_HEADERS`, `WHATSHOULDWEPLAY_TIE_LINES`, `WHATSHOULDWEPLAY_VOTE_LINES`, etc. to `src/embed.ts`.
- [ ] Register in `src/index.ts` COMMANDS map and button dispatcher (the dispatcher already routes by `customId` prefix; use `wsp:vote:`, `wsp:reroll:`, `wsp:end:`).
- [ ] `npm run register` to push command to dev guild.
- [ ] Manual test matrix: 0 votes, 1 vote, clear winner, 2-way tie, 3-way tie, re-roll, end-now, vote change, initiator-leaves, two concurrent polls in one channel, restart mid-poll.
- [ ] Verify embed copy reads cleanly aloud (voice charter §test).
- [ ] Update `bot/README.md` Phase 1 → Phase 2 commands list.
- [ ] Update `docs/DECISIONS.md` with a 2026-MM-DD entry locking N=3, timer=60s, re-roll cap=2.
- [ ] No `npm install` of new deps — discord.js v14 has everything (ButtonBuilder, ActionRowBuilder, setTimeout/clearTimeout from node:timers).

---

## 12. Why this spec is correct

Three things to verify if you're reviewing this before build:

1. **N=3 with hard re-roll cap of 2** is the choice-overload reconciliation. If a reviewer wants to bump to 5 or remove the cap, push back — cite Iyengar/Schwartz/Sweller.
2. **60-second hard timer, no extension button** is the commitment-avoidance reconciliation. The whole product thesis is "stop debating, go play." A timer that can be extended is a debate that can be extended.
3. **Tie-break is decisive, not a second vote.** Re-voting on a tie recreates the original problem. Pip's authority to break ties IS the value — same as `/pick` picking one game from the pool. The group delegates the decision when they invoke the command.

If any of those three get loosened during build, the command stops doing its actual job. Lock them.
