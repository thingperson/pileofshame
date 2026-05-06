# Session Resume — 2026-05-05 (Monday evening into early Tuesday, PDT)

⚡ **START HERE.** This session ran late evening 2026-05-04 into early morning 2026-05-05 PDT — one continuous chat across the date roll. For Saturday-into-Sunday's distribution-vector + H2-sprite-OG context, see [`session-resume-2026-05-03.md`](session-resume-2026-05-03.md).

**Type:** Polish + planning sprint. 8 commits all on `main`. Roughly equal split between code (voice sweep, archetype expansion, OG fixes, share-clipboard fix, missing sprites, Safari icon fix, Discord-in-footers, email unsub, archetype-page H2 swap) and planning docs (5 specs banked: merch, Discord bot, B2B, monetization, distribution + Pip character bible).

## Active sprint / current focus

Soft launch is live; we're in the slow-build distribution phase. This session's through-line: tighten the surfaces strangers will land on, then write the strategy docs so future-Brady doesn't re-derive them from scratch.

## What shipped this session (8 commits, all live)

In order on `main`:

- **`8ead582` — feat: distribution polish.** Discord link added to landing/about/stats/archetype-share footers. 2 of 3 H2 archetypes wired: `Grind Ghost` (≥200 hrs in one game, roast) and `Late Bloomer` (cleared a game owned 2+ years, respect). `retroKids` deferred — needs release-year enrichment. Archetype share page swapped from lo-fi `PixelSprite` to H2 PNG (visual continuity with OG card, resolves "two outputs from one URL"). OG title size cap 96 → 76 + gap 24 → 32 (no more "INFINITE PLAYER" crowding). OG metadata strengthened with CTA: title "I'm X. What's your gaming archetype?" (48 chars) + description ending "Find yours at inventoryfull.gg. Free, no signup." (~128 chars). Email unsubscribe wired defensively: `/api/unsubscribe` HMAC-token POST + `/unsubscribe` page (auto-POST, JS-required) + `lib/unsubscribe.ts` helpers. `UNSUBSCRIBE_SECRET` env set in Vercel (Production + Preview). Safari icon fix: replaced `currentColor` + inline `style={{ color: 'var(...)' }}` with direct `var(...)` in `fill`/`stroke`. `scripts/copy-h2-sprites.sh` saved per the 05-03 gotcha.
- **`d894108` — voice: copy sweep from May-4 design feedback.** 12 strings touched. Landing ("It's really just three things" → "Three steps. The third one is 'play'."; "Free, no account required" → "Free. No account. No hassle. We barely want your email."), sample import nudge, sample-library banner, library subtitle, empty-Backlog state, Show-more (Backlog only) → "Show {N} more skeletons in the closet", import error toasts ("Steam ghosted us / PSN didn't pick up / Xbox is dodging the call"). Locked terminology and dice-metaphor suggestions excluded per voice charter.
- **`fc286cc` — docs: planning round 1.** `docs/merch-plan.md`, `docs/discord-bot-spec.md`, `docs/b2b-studios-spec.md`, `docs/marketing-recipients-spec.md`. All have explicit "what needs to be true before we build this" gates.
- **`6507c94` — docs: planning round 2 + Discord priority bump.** `docs/INDEX.md` (top-level pointer for future sessions), `docs/monetization-plan.md` (tip jar progress widget plan + supporter tier A/B/C structure + mascot evaluation), `docs/distribution-plan.md` (subreddit ranking r/SideProject → r/patientgamers → r/gamingsuggestions, with a r/SideProject post draft, plus Twitter/Bluesky cadence and channel-readiness table). Discord bot threshold revised: build when 3-day window exists, not when membership crosses 25. AGENTS.md links to INDEX.
- **`8397b99` — docs: Pip bot character spec.** Names the bot "Pip." Pip is NOT the IF mascot — sidekick, occasional in-app appearances, opt-out toggle. 23 numbered GPT prompts for further generation grouped by use case.
- **`273783f` — fix(share): drop text payload from archetype navigator.share.** Was duplicating into clipboard. Brady spotted it in his Twitter compose flow.
- **`5153d4b` — fix(archetypes): 3 missing H2 PNGs added.** Wired the trigger logic in `8ead582` but forgot to copy the painted-pixel sprites (`lateBloomer.png`, `grindGhost.png`, `retroKids.png`) into `public/sprites/h2/`. retroKids ships even without trigger so re-wiring is a 3-line edit when release-year enrichment lands.

5 entries appended to `docs/DECISIONS.md` covering: navigator.share text drop, Pip's NOT-mascot role, Discord bot threshold flip, archetype page H2 swap (supersedes 05-02's "hybrid acceptable" for THAT surface), retroKids deferral.

## In-progress / uncommitted

None. Working tree clean. All 8 commits pushed.

## Verify on next session start

- **Latest deploy is `5153d4b`.** Confirm with `curl -sI https://inventoryfull.gg/ | grep x-vercel-id`.
- **`/archetype/late-bloomer` and `/archetype/grind-ghost` render the painted H2 sprite** (not a 404 image). These slugs are brand new — Twitter unfurl should work first try with no cache trick.
- **Existing archetype slugs unfurl correctly on Twitter only with `?v=N` cache-bust.** Twitter cached older versions before the 05-04 fixes shipped. Cache TTL ~7 days. Brady knows; documented as part of the distribution plan.
- **`UNSUBSCRIBE_SECRET` env var is set in Vercel** (Production + Preview, NOT Development per Vercel's sensitive-env restriction). Locally the unsub route returns 503, that's fine.
- **Sentry: `JAVASCRIPT-NEXTJS-7/-8/-9`** are the same minified `'update'` pattern, all 0-users, all bot/unfurler-triggered (started during opengraph.xyz testing). If real user count appears, dig in. Until then ignore or bulk-mute the pattern.

## Rotting gotchas accumulated

- **`scripts/copy-h2-sprites.sh` doesn't handle the `bundle-archetype-h2/<slug>/archetype-<slug>@4x.png` filename pattern.** It was written for the previous bundle (bare keys + 3 aliases). The May-4-5 manual copy of late-bloomer / grind-ghost / retro-kids worked one-off; if H2 sprites get re-bundled in this format again, update the script (strip `archetype-` prefix, drop `@4x` suffix, kebab-to-camelCase the rest).
- **Archetype share page H2 swap is asymmetric with in-app card.** Page = H2; in-app `ArchetypeCard.tsx` thumbnail = lo-fi PixelSprite. Intentional per `DECISIONS.md` 2026-05-04 entry, but if a designer ever screenshots both side-by-side it'll look like a bug. Worth knowing.
- **Email unsubscribe's auth-user path is unfinished.** Route only flips `email_subscribers.unsubscribed_at`. Auth users with `profiles.wants_updates=true` manage via in-app toggle today. When Resend lands, extend `/api/unsubscribe` to do an admin lookup against `auth.users` by email. Comment in the route flags this.
- **No release-year enrichment.** Blocking `retroKids` archetype trigger. RAWG returns `released` field; we don't pull it. Adding it = ~30 min of work in `lib/enrichment.ts` (new field on `Game`, populate on enrichment, backfill via re-enrichment cycle). Worth doing whenever the in-flight queue is dry.

## Wave 2 — early-AM 2026-05-05 follow-on session (~03:30–04:15 PDT)

Three commits, all live on `main`. Working tree clean at close.

### Shipped (in commit order)

- **`39f8797` — feat(modal): "Why we picked this", humble HLTB framing, Discord affordance.** "WHY WE PICKED THIS" small-caps label above the descriptor in modal context only when confidence is `curated`/`scored` (weak fallbacks render unlabeled). HLTB nudges reframed as crowd data, not personal prediction, across THREE surfaces: (1) modal/expanded card chip in `GameCard.tsx:823` ("Most are done by now" / "~Xh to typical finish", scoped to `status === 'playing'`); (2) JumpBackIn block `GameCard.tsx:141,146` ("Most finish within ~Xh from here. Could be your last session." / "~Xh more for most players. Past the typical halfway mark."); (3) GridCard chip `GridCard.tsx:187` ("🏁 Near typical finish" / "⏳ ~Xh to typical", also gated to `status === 'playing'`). Title attributes spell out the variance disclaimer everywhere. `FinishCheckNudge.tsx:95` deliberately untouched — its assertion may be load-bearing as a finish-check prompt. "💬 Stuck? Ask the Discord →" ghost link below Notes auto-saves indicator, modal + Playing Now only.
- **`ec4a9cd` — feat: rename picker CTA "What Should I Play?" → "Pick My Game" + keyboard shortcuts.** Hero CTA, post-import CTA, Reroll modal header + dialog `aria-label`, JSON-LD feature list, and the locked terminology row in `voice-and-tone.md` all swapped. Old label demoted to "do not use" column. New `hooks/useKeyboardShortcuts.ts` page-level handler: `R` opens picker (via `handleOpenReroll('anything')`), `1-4` switch tabs (backlog / up-next / now-playing / completed), `/` focuses search via `inventory-full:focus-search` custom event the InlineSearch component listens for. Esc-to-close already worked on modals app-wide. Guards: modal-open blocks all shortcuts; editing context (input/textarea/contenteditable) blocks `R` + `1-4` but not `/`. All four key paths verified in preview (sent KeyboardEvent with each key, confirmed dialog/tab/focus state changes). Decision logged in `DECISIONS.md` with full Iyengar/Brehm/SDT/Loewenstein rationale + rejected alternatives ("Decide for me", "Just pick one", "We pick. You play.").
- **`5a65eee` — docs(planning): testing-agents spec.** New `docs/testing-agents-spec.md` (PLANNING status) capturing Brady's late-night ask about standing up testing agents that run with regularity. Two-agent design (forward-looking "won't suck" Agent A, backward-looking "canon keeper" Agent B), DECISIONS.md-as-baseline insight, inventory of existing skills, cadence options, 5 open questions, 4-phase next-session plan (recon → decision → build → first-run validation). Linked from `docs/INDEX.md`. Trigger to act: 30–60 min focused session.

### Verify on next session start

- **Latest deploy is `5a65eee`.** Vercel auto-deploy. Confirm with `curl -sI https://inventoryfull.gg/ | grep x-vercel-id`.
- **Hero CTA reads "Pick My Game"** on the live site (the rename is the most user-visible change).
- **Press `R` on the live site with no modal open → picker should open.** Testing in dev with synthetic KeyboardEvents passed; validate against a real keypress in production.
- **Playing Now game with HLTB data** should show "🏁 Near typical finish" on the card chip and "Most finish within ~Xh from here. Could be your last session." in the JumpBackIn block when expanded.

### Wave 2 rotting gotchas

- **`hooks/useKeyboardShortcuts.ts` listens at `document` level on every page-load.** The handler is cheap (mostly key-string match + early returns), but if we add more shortcuts later we should batch them in this hook rather than spawning sibling listeners. The pattern of "InlineSearch listens for `inventory-full:focus-search`" is the right escape valve for shortcuts that need to reach into a child component's local state — copy it for any future cases.
- **`FinishCheckNudge.tsx:95` is the one HLTB-prediction site that still asserts user state.** Intentionally left this session. If a designer reviews and flags it, the fix pattern is the same as the other three sites — swap "Only ~Xh left" for crowd-attributed copy. But the prompt's job is to *check* whether they're nearly done, so the assertion is structurally different from a passive nudge.
- **GridCard chip is now gated to `status === 'playing'`.** Before, it fired for any game with `hoursPlayed > 0` and HLTB data within 8 hours of completion. The gating is correct (the chip claims live progress, which only makes sense for games being actively played) but it's a behavior change worth knowing — if Brady screenshots a Backlog or Completed game expecting the chip and it's gone, this is why.

### Open design questions — updated for next session

(Picker label swap and keyboard shortcuts moved off the list — both shipped this session.)

- **Game detail modal redesign — remaining items.** Quick wins shipped (Why we picked, humble HLTB, Discord affordance). Still owed: verify destructive-action collapse is current (recon suggests partial), adaptive primary CTA (platform/device/status aware — current status-aware buttons are partial; needs design pass), "more like this from your library" on Completed only. Real surgery — own session.
- **Testing agents.** Full spec at [`docs/testing-agents-spec.md`](testing-agents-spec.md). Brady greenlit pursuing this as a dedicated future session. The spec is the brief; don't restart the design conversation.
- **Roll modal hierarchy.** Collapse filters to one-line summary by default, gate "why'd you skip?" until after a skip, demote "Roll Again" to ghost button. Smaller surgery; pairs with modal redesign.
- **Stats hero metric pattern.** Cleared count + value reclaimed (ROI framing — "money you sunk into games you've now played"). Move "Share Your Type" up. Delete duplicate post/repost/copy buttons.
- **Moved On undo toast.** 5s undo, NOT on Cleared (celebration is sacred). Industry-standard UX pattern + reinforces "Moving on is deciding too" framing.
- **Ko-fi progress widget reality check.** Free-tier Ko-fi doesn't have an embeddable progress widget anymore (Gold-only or removed). Options: link to the public goal page, or build our own component scraping the goal page server-side. Option 3 (do nothing while we're at $0/$60) is currently the pragmatic call.

### Health snapshot — updated

- Build state: green at `5a65eee`. `npm run build` clean after each commit.
- `main` tip: `5a65eee docs(planning): testing-agents spec — design, cadence, next-session plan`.
- Known bugs: none introduced. Twitter unfurl cache still a Twitter problem.
- Production deploy: live at `5a65eee` as of session close (~04:15 AM PDT 2026-05-05). Vercel auto-deploy.
- Supabase migrations: no schema changes this session.
- Free-tier proximity: unchanged. New code is one tiny hook + textual edits.

---

*Session ended 2026-05-05 ~01:30 AM PDT (Wave 1) and ~04:15 AM PDT (Wave 2).*

---

## Wave 3 — Tuesday morning 2026-05-05 PDT (~10:15 AM – 12:30 PM)

Five commits, all live on `main`. Working tree clean at close. Through-line: testing-agents recon → autonomous build of Agents A + B → /deploy refactor → modal redesign specs banked → docs tidy.

### Shipped (in commit order)

- **`cdc6563` — fix(skills): pre-push-review terminology table was inverted.** Critical recon find: skill was telling Claude to use *retired* terms ("Play Next not Up Next", "Bailed not Dropped", "Cleared not Completed", "What Should I Play?", "Moods not Vibes"). All five reversals were locked decisions Brady had already made (status cycle 2026-04-09, picker rename 2026-05-05). Skill now points at voice-charter.md as canonical gate, has correct terminology table, and lists retired terms as flags-on-reintroduction. Stale plan-doc reference replaced with session-resume + DECISIONS.md flow. Frontmatter advertises auto-invoke trigger. `regress-watch/assertions.md` "What Should I Play?" reference also fixed.
- **`0a16130` — feat(hooks): non-blocking git pre-push hook (Agent A trigger).** Nags when diff touches `components/`, `app/`, `lib/`, or `.claude/rules/`. Source tracked at `scripts/hooks/pre-push`. Install via `bash scripts/hooks/install.sh`. Local install done. Self-validated when its own commit triggered the nag. `deploy-gates.md` documents the install. Hook is informational only — does not gate the push.
- **`59cfc48` — feat(skills): regress-watch decisions-audit mode (Agent B).** Six `decision-*` assertions encoding LOCKED entries: status-cycle-locked, picker-cta-pick-my-game, moving-on-canon, pick-flow-two-inputs, playing-now-cap-3, tagline-canon. New mode reads DECISIONS.md, classifies each as Holds / Drift unauthorized / Drift authorized / Can't tell, writes weekly output to `docs/audits/`. Skill frontmatter added (was missing — CLI showed just "Regress Watch"). New "How to add a new decision-* assertion" guide in assertions.md.
- **`00f2688` — docs(planning): modal-redesign + smaller-surgeries specs.** Three Explore subagents recon'd the modal redesign remaining items. Output:
  - `docs/modal-redesign-spec.md` — Item 1 (destructive-action collapse, ~40-60 LOC, recommend disclosing Delete + Don't suggest only — keep Bail at top tier per Moving On canon), Item 2 (adaptive primary CTA, full platform×device matrix, ~340 LOC across 4 phases), Item 3 (more like this from your library, ~110 LOC, weighted similarity heuristic).
  - `docs/smaller-surgeries.md` — six lined-up surgeries: roll modal hierarchy, stats hero (value reclaimed framing), Moved On undo toast, retroKids release-year enrichment, FinishCheckNudge (parked), Ko-fi widget (parked at do-nothing).
  - INDEX.md updated to point at both.
- **`fe20dab` — feat(skills): /deploy as scope-aware orchestrator.** Brady's strategic question: should pre-push gates live in /deploy or /session-close, and is consolidating bloat or smart? Answer: smart, IF /deploy detects scope and delegates rather than forcing every gate on every push. Step 1 = scope detection (bucket diff into user-facing / server / schema / rules / config / scripts). Step 2 = Full vs Quick mode with explicit "use when" criteria. Inline voice-sweep logic deleted (was duplicating pre-push-review against retired voice-and-tone.md patterns) — now delegates to /pre-push-review. New Step 4 = post-push verify (curl x-vercel-id twice, smoke-check, glance Sentry). Stale paths purged (partitioned-fluttering-flurry.md, user-persona.md). Boundaries section: /deploy is NOT /session-close, NOT regress-watch decisions-audit.

### Scheduled

- **Weekly Agent B cron** via `anthropic-skills:schedule` → task `inventory-full-decisions-audit-weekly`. Fires every Monday ~08:09 AM PDT. Writes `docs/audits/audit-YYYY-MM-DD.md`. First fire: Monday 2026-05-11. Lives in `/Users/bradywhitteker/.claude/scheduled-tasks/`.
- **Recommended:** manually fire once via Scheduled sidebar "Run now" before the first auto-run, to pre-approve tool permissions (Read, Write, Bash). Future runs then don't pause on prompts.

### Verify on next session start

- **Latest deploy is `fe20dab`.** No app code touched in Wave 3 — all changes are skills, hooks, scheduled tasks, and docs. Vercel deploy unchanged from `5a65eee` (Wave 2 production state). Site behavior is identical to Wave 2.
- **Pre-push hook is installed.** Test: `git push` after touching a `components/` file should print the nag block. Hook is informational; does not block push.
- **Weekly audit task exists.** Verify in Scheduled sidebar (left rail). Should show "inventory-full-decisions-audit-weekly" with next fire = next Monday ~08:09 AM PDT.

### Wave 3 rotting gotchas

- **Tool permissions for the weekly audit are unapproved.** First auto-run (Monday) will likely prompt for Read/Write/Bash permissions. If Brady misses the prompt, the audit pauses indefinitely. Mitigate by clicking "Run now" once in the Scheduled sidebar this week — approvals stick to the task.
- **Agent B output volume.** With 6 `decision-*` assertions, the weekly audit doc will be small (~30 lines). If we add many more, format may need a short summary header so Brady doesn't have to scan a wall of ✅. Watch when audit doc grows past ~100 lines.
- **`/deploy` skill description-vs-behavior gap.** The new `/deploy` says it does post-push verify, but in practice the post-push curl needs ~60-90s wait between fires. If Brady invokes `/deploy` and walks away, the verify step may not complete cleanly. Acceptable for now — flag for revisit if it bites.

### Open design questions — updated for next session

- **Modal redesign (3 items).** Specs banked in `docs/modal-redesign-spec.md`. Recommended order: Item 2 Phase 1 (extract launch logic) → Item 1 (disclosure) → Item 2 Phases 2–4 → Item 3.
- **Smaller surgeries (6 items).** Queue in `docs/smaller-surgeries.md`. Pick any when window opens. Roll-modal hierarchy is the most user-visible polish.
- **First weekly audit validation.** After Monday 2026-05-11 fires, read the output. If false-positive rate is high or assertions are too literal, refine.

### Health snapshot — updated

- Build state: green at `fe20dab`. Last app-code build was `5a65eee` (Wave 2, Vercel green).
- `main` tip: `fe20dab feat(skills): /deploy as scope-aware orchestrator`.
- Known bugs: none introduced this wave (all skill/docs/hook changes).
- Production deploy: live at `5a65eee` from Wave 2. Wave 3 didn't touch app code.
- Supabase migrations: no schema changes.
- Free-tier proximity: unchanged.
- Scheduled tasks: 1 (Agent B weekly).

---

*Session ended 2026-05-05 ~12:30 PM PDT (Wave 3).*

---

## Wave 4 — Tuesday afternoon 2026-05-05 PDT (~14:30 – 16:00)

Five commits, all live on `main`. Working tree clean at close. Through-line: extending the testing-agents work into a full meta-tooling layer (asset-check skill, lint gate, audit-scope rule, on-the-horizon planning), then wiring Playwright MCP at project scope.

### Shipped (in commit order)

- **`2acc87d` — docs(rules): user-agency + visual-assets rules to AGENTS.md.** Two new behavioral rules from a Claude Insights / Claude Chat audit. User Agency added as locked decision #7 (never auto-assign status from heuristics; imports default neutral; cites Xbox + Steam HLTB violations). Visual Assets & Branding new section before Evergreen gotchas (always brand SVG from `public/if-logos/`, read source before describing comps, verify PNG copy before declaring archetype work done — cites Bungee, dino mascot, missing late-bloomer/grindGhost/retroKids slips). Skipped Accessibility & Contrast and Session Close Ritual since both already in AGENTS.md.
- **`32e6552` — feat(skills): asset-check.** New `/asset-check` skill catches recurring visual slips: wordmark font substitutes (Bungee), missing archetype PNGs, hallucinated comp descriptions, contrast misses on theme/palette changes. Six steps, named-bug pattern, hands off to `/accessibility-review` and `/theme-check` for broader audits. Cites real paths (`public/if-logos/`, `public/sprites/h2/`) — insights report's `public/brand/` doesn't exist.
- **`d0d9ab1` — feat(hooks): pre-push lint gate (blocking).** Extended `.git/hooks/pre-push` (canonical `scripts/hooks/pre-push`) with a blocking eslint step. Fires only when TS/TSX/JS/JSX in components/, app/, lib/, hooks/ changes. Skips for docs/skills/scripts diffs. Output on failure: tails 30 lines + path to full log at `/tmp/inventory-full-lint.log`. Rationale: eslint catches what Vercel's build catches, but earlier — saves the broken-deploy round-trip. Voice/a11y nag stays informational; lint is the ONE blocking gate.
- **`60a6e31` — docs: audit-scope rule + on-the-horizon planning doc.** AGENTS.md gains "Audit / critique behavior" section: list surfaces + name lens + wait for confirmation before deep audits (cites psychology audit overcooking dark-pattern framing + launch-prep misreading a share-card comp). New `docs/on-the-horizon.md` banks three larger workflow builds with triggers, MCP needs, risks, LOC estimates: (1) Autonomous Visual Regression Loop, (2) Parallel Sprint Agents With Test Gates, (3) Self-Healing Site Integrity Agent. Each explicitly "not next-up" — sits behind modal redesign + smaller surgeries + testing-agents Phase 4. INDEX.md updated.
- **`528da01` — chore: add Playwright MCP at project scope.** New `.mcp.json` at repo root with Playwright wired via `npx @playwright/mcp@latest`. Took 4 paths to find the right one: (1) CCD Connectors UI doesn't list Playwright, (2) remote marketplace MCPs are Anthropic-managed and Playwright isn't there, (3) `npm install -g @anthropic-ai/claude-code` failed on Brady's fnm setup with `claude not found` after install, (4) project-scope `.mcp.json` was the working path. CCD reads `.mcp.json` directly and prompts for approval on first session start. Verified `npx @playwright/mcp@latest --help` resolves cleanly before committing.

### Banked (not shipped, ready when triggered)

- `docs/on-the-horizon.md` (3 builds with explicit triggers).
- 3 DECISIONS.md entries appended this Wave covering testing agents, /deploy refactor, and Playwright add (visible at top of DECISIONS.md as the newest cluster).

### Verify on next session start

- **Latest deploy is `5a65eee` (Wave 2). NO app code touched in Waves 3 or 4.** Production behavior identical to yesterday. Site at https://inventoryfull.gg is unchanged.
- **Playwright MCP is in `.mcp.json`.** On next CCD session start, you'll see an approval prompt for the project-scoped MCP. **Click approve.** Then ask "is playwright loaded?" and Claude will check the deferred-tool registry. First load downloads ~30–60s (cached after).
- **Pre-push lint gate is live.** Test: stage a TS file with an eslint error and try to push. The hook should block with the lint output. The non-blocking voice/a11y nag is unchanged.
- **Weekly Agent B audit is scheduled** for Monday 2026-05-11 ~08:09 AM PDT. **Click "Run now" once in the CCD Scheduled sidebar before then** to pre-approve Read/Write/Bash permissions. Otherwise the first auto-run pauses on prompts.

### Wave 4 rotting gotchas

- **MCP tooling has THREE config systems on this machine:** CCD Extensions (`.mcpb` bundles, `Claude Extensions/` dir), remote marketplace (Anthropic-managed, UUID-keyed in deferred-tools), and Claude Code-style mcpServers (project `.mcp.json` or user `~/.claude.json`). Future MCP installs: try CCD UI first; if not present, project `.mcp.json` next; user `~/.claude.json` as last resort (currently has no `mcpServers` key — touching it risks corrupting 23KB of session state).
- **Claude Code CLI install path is unresolved.** `npm install -g @anthropic-ai/claude-code` failed with OS-level rejection on Brady's fnm setup. Didn't dig further since `.mcp.json` worked. If a future need requires the CLI (e.g. `claude mcp add` for user-scope additions), this'll resurface.
- **`asset-check` skill hasn't been invoked yet.** First real run will reveal whether the named-bug catalog is too narrow or too broad. Run when next visual change is in scope; iterate from there.
- **/deploy "surface contradictions" step (2.5) is informal.** Branch points (when to ask vs. flag-and-continue) aren't specified. If a real contradiction surfaces during a `/deploy` invocation and the skill auto-decides instead of asking, that's a refinement opportunity.

### Open design questions — updated for next session

- **Playwright wiring validation.** After approval prompt + first session load, confirm Playwright tools appear in the deferred-tool registry. If they don't, debug.
- **First weekly Agent B audit.** Monday 2026-05-11 — read the output, refine assertions if false-positive rate is high.
- **Modal redesign + smaller surgeries** — full queue still banked, untouched. See `docs/modal-redesign-spec.md` and `docs/smaller-surgeries.md`. Recommended order unchanged: Modal Item 2 Phase 1 (extract launch logic, ~30 min, reversible) → Item 1 (disclosure) → Item 2 Phases 2–4 → Item 3.

### Health snapshot — updated

- Build state: green at `528da01`. No app code touched in Wave 4 (skills/hooks/docs/config only).
- `main` tip after this session-close push will include the 3 DECISIONS entries + this Wave 4 append.
- Known bugs: none introduced.
- Production deploy: live at `5a65eee` from Wave 2. Wave 3 + Wave 4 didn't touch app code.
- Supabase migrations: no schema changes.
- Free-tier proximity: unchanged.
- Scheduled tasks: 1 (Agent B weekly) — pending pre-approval before first auto-fire.
- MCPs (post-Brady-trim): Sentry, Supabase, Drive, Claude Preview, Claude in Chrome, scheduled-tasks, computer-use, ccd_directory/session_mgmt, mcp-registry; PLUS pending Playwright on next start. Trimmed this session: Vercel/v0/Stagewise hybrid, Canva, Mermaid (note: Mermaid + Context7 reconnected briefly, may have been re-enabled).

---

*Session ended 2026-05-05 ~16:00 PM PDT (Wave 4 — full meta-tooling day).*

---

## Wave 5 — Tuesday late afternoon 2026-05-05 PDT (~16:38–17:15)

Nine commits, all live on `main`. Working tree clean at close. Through-line: cleared the entire modal redesign spec + all active smaller surgeries in one sprint using parallel subagents.

### Shipped (in commit order)

- **`1a2b7d4` — fix(e2e): smoke test → "Pick My Game".** CI was failing because the e2e test still looked for the retired "What Should I Play?" button label. One-line fix.
- **`62e1edf` — refactor(modal): extract Steam launch → lib/launch.ts.** Modal Item 2 Phase 1. New `getLaunchTarget(game)` utility returns `{url, label, title} | null`. GameCard consumes it. No behavior change — just the seam for future platforms.
- **`368f674` — feat(archetypes): retroKids release-year enrichment.** `releaseYear?: number` on Game type, populated from RAWG `released` field during enrichment. retroKids fires at ≥40% pre-2011 games (min 5 with data). Sprite was already in `public/sprites/h2/`.
- **`6103117` — fix(hooks): scope lint to changed files, non-blocking.** Pre-push lint was (a) running full-project including `notes/` scratch and (b) blocking on pre-existing React Compiler errors in GameCard. Now scoped to changed files only and informational. CI is the hard gate.
- **`59ab238` — feat(reroll): post-pick hierarchy.** Filters collapse to one-line summary on subsequent rolls. "Roll Again" demoted to ghost link below "Let's go". First roll stays expanded.
- **`98897ce` — feat(modal): destructive-action disclosure + Moved On undo toast.** Modal Item 1: Delete + Don't Suggest behind "··· More actions". Bail stays visible (Moving On canon). Toast component extended with optional action button; bail now shows 5s undo that restores previous status.
- **`9c927b6` — feat(stats): hero metric + share consolidation.** Cleared count as big number, "≈$N reclaimed from your pile" at $15/game, Share Your Type moved above fold. Duplicate share buttons removed (3 → 2 affordances).
- **`c436e3e` — feat(modal): "From your shelf" similar games.** New `lib/similarity.ts` with weighted heuristic. Horizontal scroll strip of up to 5 similar completed games on the Completed modal only (Iyengar-gated).
- **`6319c34` — feat(launch): Xbox + PSN adaptive launch (Phase 2).** `xboxTitleId` and `psnProductId` added to Game type. Import modals now store the IDs (were previously dropped). `lib/launch.ts` dispatches Xbox protocol URI (desktop/Android) or store URL (iOS), PSN links to PS Store.

### Verify on next session start

- **Latest deploy is `6319c34`.** All app code changes this wave = first real deploy since Wave 2's `5a65eee`. Confirm with `curl -sI https://inventoryfull.gg/ | grep x-vercel-id`.
- **Pick My Game CTA** on live site (validates the e2e fix + prior rename).
- **Press `R`** on live site with a sample library loaded → picker opens (keyboard shortcut from Wave 2 still wired).
- **Stats page** shows cleared count + value reclaimed hero (only visible if user has ≥1 completed game).
- **Completed game modal** shows "From your shelf" strip (only if ≥2 completions exist).
- **Move On a game** → toast with ↩ Undo button appears for 5s.
- **CI should be green** at `6319c34` — the e2e fix in `1a2b7d4` resolved the prior failure.

### Wave 5 rotting gotchas

- **Xbox `titleId` format uncertainty.** OpenXBL returns `titleId` but the `xbox://launch/{titleId}` protocol may expect a different ID format (product ID vs title ID). Needs real-device validation. If it doesn't work, the store URL fallback is always safe.
- **PSN `productId` ≠ concept ID.** The PS Store URL pattern `store.playstation.com/concept/{id}` uses concept IDs. The purchased-games API returns `productId` which may or may not be the same. Needs a real PSN user to test. If URLs 404, we can try `/product/` instead of `/concept/`.
- **Similar games strip is non-interactive.** Thumbnails are display-only (no click-to-open). Adding cross-modal navigation would require prop threading through GameDetailModal. Acceptable for v1; revisit if users expect tappable cards.
- **Stats value-reclaimed uses flat $15/game.** No real price data. Acceptable floor estimate but will feel wrong for users with mostly $60 AAA titles or mostly $1 bundle games. Future: pull price from RAWG or allow manual entry.
- **Toast `pointer-events-auto` added.** The toast container is `pointer-events-none` by design; individual toasts with actions now override to `pointer-events-auto`. If future toasts without actions need click-through, this is fine. If a toast somehow blocks something beneath it, this is why.

### Open design questions — updated

- **Modal Item 2 Phases 3–4** (Epic/GOG/Switch) — deferred. No ID source exists for these platforms. RAWG `stores` array is the most likely enrichment path but adds complexity for low user-count platforms. Trigger: someone asks, or RAWG enrichment gets a general overhaul.
- **Similar games interactivity.** Currently display-only. If users tap and expect navigation, add an `onOpenGame` prop to GameCard/GameDetailModal.
- **GameCard React Compiler errors.** 4 pre-existing `preserve-manual-memoization` errors. Not urgent (doesn't affect runtime) but blocks re-promoting lint to blocking. Fix = refactor the 120-line `handleStatusClick` useCallback or accept the compiler skip.

### Health snapshot — updated

- Build state: green at `6319c34`. `npm run build` + `npm run test:e2e` both pass.
- `main` tip: `6319c34 feat(launch): Xbox + PSN adaptive launch (Modal Item 2 Phase 2)`.
- Known bugs: Xbox/PSN launch URLs unvalidated on real devices (may 404 — see gotchas).
- Production deploy: live at `6319c34` as of session close. Vercel auto-deploy.
- Supabase migrations: no schema changes.
- Free-tier proximity: unchanged. New code is pure client-side logic + tiny API route edits.

---

*Session ended 2026-05-05 ~17:15 PM PDT (Wave 5 — feature sprint, modal redesign complete).*
