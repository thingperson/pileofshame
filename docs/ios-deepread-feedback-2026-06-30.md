# Inbound feedback — from the iOS deep-read (2026-06-30)

The iOS companion project (`inventoryfull-ios`) ran a full 6-agent deep read of THIS repo to port the
product faithfully, then put every load-bearing finding through an adversarial verifier (≈95%
citation-confidence). This note hands back what surfaced that this project should act on — things its
own sessions may not currently be aware of. Citations are `file:line` in this repo, verified.

> Not a code change. A findings handoff. Triage as you see fit.

## A. Bugs / inconsistencies / just-wrong (fix these)
1. **DEAD CODE — `getCompletionRecommendations`** (`lib/recommendations.ts:15`) has **zero importers
   repo-wide** (grep-confirmed: the only hit is its own definition). It's a genuinely good
   completion-flow feature, written but never wired. Decide: wire it into the completion celebration,
   or delete it. As-is it misleads — a reader took it for shipped.
2. **MISLEADING "auto-status" labels.** `components/PostImportSummary.tsx` (and the breakdown computed
   in `app/page.tsx:393-401`) use copy/comments like "auto-moved to Up Next" / "auto-completed" /
   "We guessed N games are already beaten." It's actually **display-only** — it reads *existing*
   statuses; every real import writes `'buried'` (`lib/smartSort.ts:151` returns `'buried'` regardless
   of achievements). But the labels READ like you're auto-assigning status, which would violate your own
   sacred "never auto-assign status" rule. Fix the wording/comments so neither users nor future agents
   misread it. (This exact phrasing triggered a false alarm in our verification.)
3. **ORPHANS / TODOs.** `lib/pixel/data/personas.json` has sprites `dinoRider` and `retroKids` not
   referenced by `archetypeRegistry`. `components/GameCard.tsx:898` reuses `skipTooLong` as a
   placeholder stat icon (a "wave 2.1" TODO). Finish or remove.
4. **WORKTREE CRUFT.** `.claude/worktrees/` carries multiple stale worktrees
   (`flamboyant-jennings-8f7e1d`, `great-grothendieck-cbb031`, `strange-poincare-905da8`) with full
   duplicate copies of `.claude/plans`, `AGENTS.md`, skills, even an old `session-resume`. If defunct,
   prune them — they double up in every repo-wide search and confuse tooling/agents.
5. **DOC↔REALITY DRIFT.** Several roadmap/doc items describe as "planned" things that shipped (or list
   shipped features as deferred). You have the testing-agents pattern — consider a periodic
   "reconcile docs to reality" audit so specs stay trustworthy.

## B. Time-sensitive (this one has a deadline and is unrecoverable)
6. **STATUS-EVENT LOG IS MISSING but Year-in-Pile depends on it.** `docs/year-in-pile-spec.md` itself
   notes you "didn't start logging status events" and need an append-only status-event log — and no
   such log exists in the repo today. Year-in-Pile targets **Dec 1 2026**. Every day without event
   logging = Year-1 "Wrapped" data that can **never** be backfilled. **Strong recommendation: ship the
   append-only status-event log NOW** (before the Wrapped UI), on web AND design it into iOS, so both
   platforms accumulate a full year. This is the single highest-leverage, most-perishable item in the
   whole repo.

## C. Good ideas at risk of being lost (buried in IDEAS/BLUE_SKY, on no roadmap)
- **One Game Mode** — voluntary straitjacket; the most original monetization idea here, never specced.
  `docs/IDEAS.md:658-668`.
- **Spoiler-aware "5-minute version" graceful exit** — novel anti-shame feature. `docs/archive/BLUE_SKY.md:61`.
- **Auto-import Steam wishlist on library import** — the API already supports `action=wishlist`; just
  chain it. `docs/archive/BLUE_SKY.md:60`.
- **Series detection / play-in-order.** `docs/IDEAS.md:135`.
- **"You're objectively wrong not to have played this" shelf** (metacritic 90+). `docs/archive/BLUE_SKY.md:51`.
- **Comfort-game departure as a shareable behavioral metric.** `docs/IDEAS.md:596`.
- **The "how did it know" inferred picker** — you call it the long-term moat but it's parked "after
  launch data." Don't let it die in the launch crunch. `docs/ROADMAP.md:462`.
- **Dynamic AI enrichment** (`docs/specs/dynamic-enrichment.md` + `-impl.md`) — build-ready, ~$2/mo at
  2k DAU, and it fixes the "wrong genre tip" trust bug all three external reviewers flagged. High ROI;
  easy to let slip.

## D. Cross-platform reconciliation (decide consciously, don't let it drift)
- **Pricing model tension:** web = cosmetic subscription ($4/mo) + $5/yr Year-in-Pile; iOS = **$9.99
  one-time** bundling Year-in-Backlog. Intentional divergence, but unreconciled — and Apple forbids
  pointing to web payment from the app. Decide the parity story before either platform monetizes.
  `docs/monetization-plan.md:101` vs the iOS brief's one-time decision.
- **Data-integrity heads-up (iOS-side bug, affects YOUR users):** a known iOS merge bug (being fixed
  there) can drop web-only per-game fields (`category`/`priority`/`installed`) from the shared
  `library_data` blob when an iOS user edits a game that the web had categorized. Until iOS ships the
  fix, a web user's category/priority could be erased by an iOS edit. Flagging so you're not surprised.

## E. What's genuinely strong (protect it — don't "simplify" these away)
- The **psychology / voice / ethics spine** is exceptional. The red-team audits caught real drift
  (picker input-creep, catalogue-creep, silent status mutations), and "less time in app" is
  consistently defended. This is as much the moat as the engine.
- The **decision engine + four learning systems** (skip / skip-reasons / genre-cooldown / behavioral
  affinity with a Shannon-entropy variety clamp) are sophisticated and cleanly factored. iOS is porting
  them close to as-is.
- **Decision discipline** (a decision log that records *reversals*, the feature-creep-audit skill) is
  above the bar for a solo project. Keep it.

## F. Set up the cross-project bridge (your half — install steps)
The iOS repo just set up a reliable two-way bridge to this project via the **BradyOS Handoffs inbox**
(`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Handoffs/inbox/`). This one-time note reached
you directly (+ a pointer in today's `session-resume`); going forward the channel is the inbox. To wire
up getplaying's half so it's reliable both directions (no third folder needed):

**1. Inbound — add a SessionStart hook** that surfaces inbox items addressed to getplaying. Add this as
a second command object in the `SessionStart` hooks array in `.claude/settings.json` (alongside the
existing session-resume pointer):
```json
{
  "type": "command",
  "command": "INBOX=\"$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Handoffs/inbox\"; echo \"=== 📥 INBOUND HANDOFFS (to: getplaying) ===\"; if [ -d \"$INBOX\" ]; then n=0; for f in \"$INBOX\"/*.md; do [ -e \"$f\" ] || continue; if grep -qE '^to:.*getplaying' \"$f\" && ! grep -qE '^from:[[:space:]]*getplaying' \"$f\"; then echo \"  • ${f##*/}\"; n=$((n+1)); fi; done; [ \"$n\" -eq 0 ] && echo \"  (none new)\"; else echo \"  (no inbox dir)\"; fi",
  "timeout": 10,
  "statusMessage": "Checking handoffs inbox…"
}
```
After acting on an inbound item, move it out of the inbox (e.g. to `processed/`) so it stops re-surfacing.

**2. Outbound — add to your session-close ritual** (`.claude/skills/session-close/SKILL.md`): when a
session produces findings relevant to **inventory-full** (a shared-contract change, a bug/idea that
affects the iOS app), write an inbox file `from: getplaying` / `to: [inventory-full]` / `date` /
`title`, body = actionable findings only. iOS's SessionStart hook will surface it next session.

**3. Doc↔reality reconcile (auto in session-close):** add a first step to your session-close that
verifies docs still match reality — roadmap items marked planned that shipped, comments calling
something "deferred" that's now built, dead code presented as shipped (you have one — §A1 above). Fix
small drift inline; surface bigger gaps.

That mirrors exactly what the iOS repo just set up. One channel, reliable both ways, no third folder.

— handed off from the iOS deep-read, 2026-06-30
