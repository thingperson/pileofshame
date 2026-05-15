# Psychology Red-Team — Round 3 — 2026-04-28

**Scope.** Cold-start surfaces flagged ⚪ Not Audited in round 1 and round 2: `OnboardingWelcome.tsx`, `GetStartedModal.tsx`, `ImportHub.tsx`, `FinishCheckNudge.tsx`. Pre-launch QA pass (~10 days from soft launch). Research only — no code changes.

**Bar.** Same rubric as rounds 1–2. North star *Enjoy your games again.* (Locked 2026-04-26.) Cold-start adversarial test: a user who hasn't imported yet should hit **import → pick → play** with the smallest possible cognitive tax. Surfaces that ask the user to learn the mental model, do account hygiene, or absorb marketing copy fail by definition.

---

## Surfaces — verdict table

| Surface | Verdict | One-line finding |
|---|---|---|
| `OnboardingWelcome.tsx` | ✅ Aligned | Cleanest cold-start surface in the app — single goal, two CTAs (one primary), confident voice, zero shame framing. |
| `GetStartedModal.tsx` | ⚠️ Drift | Naming + role confusion: file is now sign-in only but still named "GetStartedModal"; "Free forever" is a value prop the cold user didn't ask about; updates checkbox adds friction in the auth moment. |
| `ImportHub.tsx` | ⚠️ Drift | 8 platform options at once is choice overload at the worst possible moment (the user just committed to importing); unavailable platforms shown in-list dilute action; no recommended default ("Most start with Steam"). |
| `FinishCheckNudge.tsx` | ⚠️ Drift | Not strictly cold-start, but flagged: "That is a win sitting right there" is good; but a *third* button "Not now" alongside "Yes" / "Not yet" splits the binary, and the 130%+ branch reads as light surveillance ("You've got X hours in this. Most people finish in Y."). |

Legend: ✅ Aligned / ⚠️ Drift / ❌ Violates / ⚪ Not Audited.

**No ❌ violations.** Nothing here blocks launch. Findings are drift, not breaks.

---

## Surface findings (detail)

### `OnboardingWelcome.tsx` — ✅ Aligned

**File:** [components/OnboardingWelcome.tsx:19–64](components/OnboardingWelcome.tsx)

This is the model the rest should match. Audit against the 7-point rubric:

- **Choice load:** 1 primary action ("Import My Library"), 1 conditional secondary ("I Have Game Pass"), 1 escape hatch ("+ Add a Game Manually"). Visual hierarchy makes the primary obvious. Within Iyengar's choice-set ceiling.
- **Confidence vs hedge:** "Let's find your game." + "Import your library and we'll pick your first game in seconds." Imperative, time-bound, confident. No "maybe", no "feel free", no "you can".
- **Reactance / autonomy:** Help-language is correct here ("we'll pick your first game") — this is the marketing/onboarding zone the voice charter explicitly allows. No command voice. User opts in by clicking.
- **Loss aversion:** "in seconds" specifically defangs the import-feels-like-a-commitment risk. Good.
- **Cognitive load:** ~6 elements on screen total. Sweller-clean.
- **Action terminus:** Every CTA terminates in advancing toward a pick. No detours.
- **North-star fit:** "Let's find your game" implicitly says *you have games*. Returns the user to themselves. On-thesis.

**One small note, not a finding:** "Steam, PlayStation, Xbox, GOG, Playnite" is shown as supporting microcopy (line 39). Good — it answers "will my platform work?" without making the user click into ImportHub to find out. Keep.

---

### `GetStartedModal.tsx` — ⚠️ Drift

**File:** [components/GetStartedModal.tsx:9–13, 73–78, 123–133](components/GetStartedModal.tsx)

Three drift findings, ranked by severity.

**1. Name / role mismatch (governance, not user-facing).** Lines 9–13 show two `@deprecated` props — the modal used to be a "get started" choice between sample / import / sign-in, and is now sign-in-only. The filename and component name still say `GetStartedModal`. This is the kind of drift that compounds: the next person reading the codebase looking for "the get started flow" will find an auth modal and either misread it or break it. Voice charter §locked-terminology lives next door. Rename to `SignInModal` post-launch, log in DECISIONS.md.

**2. Updates-marketing-checkbox in the sign-in moment** ([line 123–133](components/GetStartedModal.tsx#L123)).
> "Email me when we ship something worth knowing. No spam."

Two problems. First, the user is here to *sign in to sync* (per the dialog label, line 54). The checkbox makes them make a second decision they didn't come for — Sweller cognitive load tax in a moment that's already a friction point. Second, the cold user has no relationship with us yet — asking permission to email them about future ships is asking for trust before they've experienced the product. The reasonable post-product moment to ask this is *after a successful first pick*, not in the sign-in modal that gates their first sync.

**Proposed fix.** Remove the updates checkbox from this modal entirely. Add a single "Email me when we ship something worth knowing" toggle to the post-completion surface (`CompletionCelebration.tsx`) where the user has just experienced value. Honors the legal-compliance.md test: *"did the user ask to see this, or are we showing it because we think they'd buy it?"* — right now, no.

**3. "Free forever" value-prop in the cold-start auth moment** ([line 76](components/GetStartedModal.tsx#L76)).
> "Keep your library across devices. Free forever."

"Free forever" answers a question the cold user hasn't asked yet. It implies a paid tier exists or could exist, which is *category* information about the product they're trying to use. For a user who just clicked "sign in" expecting to sign in, "free forever" is marketing noise in a fulfillment surface. Voice charter's marketing/fulfillment split applies — once the user has clicked sign-in they're in fulfillment mode.

**Before:** "Keep your library across devices. Free forever."
**After:** "Keep your library across devices."

Five-word fix. Same psychological reassurance (sync = good), drops the unrequested marketing claim.

---

### `ImportHub.tsx` — ⚠️ Drift

**File:** [components/ImportHub.tsx:15–73, 110–113](components/ImportHub.tsx)

This is the most consequential drift in the round-3 scope. The hub shows **8 platform rows at once** (Steam, Steam Wishlist, Xbox, Playnite, PlayStation, Epic, GOG, Switch — the last 3 marked unavailable). The user just clicked "Import My Library" expecting a clear path. Instead they hit a list-of-options that re-introduces the exact choice-overload problem the picker is built to solve, at the moment of highest commitment fragility (Kahneman: importing feels like work; the user is one wrong-feeling click from closing the tab).

**Breakdown by rubric:**

- **Choice load (Iyengar):** 8 visible options. Even with 3 disabled, the eye still scans them. The visible set should be: the user's most-likely platform, then a "more" disclosure for the rest. We don't know the most-likely platform without instrumentation (round-1 finding #3) — best proxy pre-instrumentation is **Steam first, then everything else**, since Steam is the largest PC library platform and the only one with a public API.
- **Confidence vs hedge:** "Connect a platform or upload an export file." (line 112) is hedged and abstract for a user who just said "Import My Library." A confident version: "Pick your platform." or "Where are your games?"
- **Cognitive load:** Three of the eight rows are disabled and labeled "MANUAL" with explanations like *"No public API. Use Playnite to export your Epic library"* (line 56). This is mental overhead the user doesn't need at decision-time — they're solving "where are my games" not "why doesn't Epic have an API." Disabled platforms should be hidden behind a "Don't see your platform?" disclosure, not in the primary list.
- **Action terminus:** All available rows terminate in their respective import modals — fine. But **the user can also close this modal without picking anything**, which is a stall point. No copy nudges them toward Steam-as-default.
- **Loss aversion:** Importing is the moment where loss-aversion bites hardest (the user fears the import will be slow, mess up their data, or expose something private). No copy here addresses any of it. ("Takes 30 seconds" appears on the PlayStation row but not the Steam row, where it would matter most.)
- **North-star fit:** Marginal. The hub is a means-to-an-end, but its current shape feels like account hygiene rather than "we're getting you to a game."

**Proposed fix (S, copy + ordering).**

1. Reorder so Steam is row 1 with a "Most start here" tag (treat as recommended-default per Sweller-style reduction of decision tax).
2. Hide disabled platforms behind a "Don't see your platform? →" disclosure that opens a sub-list explaining manual / Playnite paths.
3. Replace "Connect a platform or upload an export file." with *"Pick your platform. Steam takes about 20 seconds."* — names the time-cost, sets expectations, defangs loss-aversion.
4. (Optional, M) Add a *"Skip — try a sample library"* tertiary on the hub itself for users who want to feel the product before committing their real data. There's already a `SampleImportNudge` on landing; the hub doesn't surface that exit.

---

### `FinishCheckNudge.tsx` — ⚠️ Drift

**File:** [components/FinishCheckNudge.tsx:79–100, 234–266](components/FinishCheckNudge.tsx)

Not a strict cold-start surface (only fires on returning users with HLTB-completion ≥ 85% on a non-completed game), but in scope per the audit brief. Two findings.

**1. Three-button binary problem** (lines 234–266).
The nudge asks "Did you finish this?" — a yes/no question. The UI gives 3 buttons:
- "🎉 Yes, I finished it"
- "⏳ Not yet"
- "Not now"

"Not now" and "Not yet" are doing nearly the same job from a user's read — both defer. The technical difference (Not yet → moves to Playing Now; Not now → dismisses the nudge for the session) is invisible from the button labels. Two consequences:

- **Choice load (Iyengar):** the user has to decode three options where the question only has two real answers. Mild but real.
- **Reactance (Brehm/SDT):** "Not yet" silently moves the game to **Playing Now**, which is a status change the user didn't explicitly request from the button label. Reading "Not yet" as "I'll come back to it" and getting a status mutation is an autonomy violation — the system did something on the user's behalf they didn't ask for. The toast at line 160 (*"You're so close."*) softens it but doesn't fix it.

**Proposed fix.** Either:
- (a) Relabel "Not yet" to "🎮 Move to Playing Now" so the action matches the button, or
- (b) Drop "Not yet" entirely; let "Not now" be the only deferral and have the user manage status via the game card. (b) is more honest to the binary nature of the question.

**2. The 130%+ branch reads as surveillance** (lines 83–88).
> "You've got [hours] hours in this. Most people finish in [X]h."
> "Did you actually get through it? That would be worth celebrating."

For a user 30%+ over the average, this is well-meaning and probably accurate. The rhythm is also good — "That would be worth celebrating" is voice-aligned. The risk: framing the user's playtime against "most people" is a comparison they didn't ask for, and the implication ("you took longer than average") is a soft shame trigger for a population we said is shame-prone (Neff). The 100% and 85–99% branches don't have this comparison — they reference the user's data without grading it.

**Proposed fix.** Drop the comparison. Rewrite:
**Before:** "You've got 47 hours in this. Most people finish in 30h."
**After:** "47 hours deep on this one. Did you finish?"

Same information. Removes the comparison-to-average. Keeps the warmth. Voice-aligned.

---

## Cross-surface synthesis

### What rounds 1–3 now show, in aggregate

The three rounds together cover ~25 surfaces. The cold-start layer (this round) is in better shape than the celebration / stats / share-card layer (round 2). No ❌ in round 3, and `OnboardingWelcome` is the cleanest model in the app.

**The pattern:** drift accrues *between* surfaces and *at handoffs*, not within them. `OnboardingWelcome` says "Import My Library." The user clicks. The next thing they see is `ImportHub` showing 8 options — handoff loses momentum. `GetStartedModal` is named for one job, does another. `FinishCheckNudge` asks a yes/no and shows three buttons. Each surface reads okay in isolation; the joints between them are where commitment leaks.

This is consistent with round 2's system-level finding: the picker itself is clean, but the *surfaces around it* are pulling users sideways.

### Help-language split — clean

Per audit spec point 8: verify "we'll help" hasn't crept into pick fulfillment. Across all 4 round-3 surfaces, the only "we'll" appears in `OnboardingWelcome.tsx:25` ("we'll pick your first game in seconds"). Onboarding zone, charter-allowed. No leaks into pick fulfillment in this round's scope.

### Voice charter sweep

- **LinkedIn vocab:** none.
- **Em-dashes for drama:** none in copy (one in code comment, n/a).
- **Hedging in CTAs:** none.
- **Summary closers:** none.
- **Performative empathy:** none.
- **"That's not X, that's Y" reframes:** none.

Charter compliance is solid. The drift is structural / role / choice-load, not voice.

---

## Ranked interventions

Effort buckets: 15m, 30m, 1h, 2h, 4h+. Mission-fit: **core** = serves "Enjoy your games again" / **gov** = governance only / **nice** = polish. Pre-launch column: ✅ ship before launch / ⏸ post-launch is fine.

| # | Intervention | Surface | Effort | Impact (1–10) | Mission | Pre-launch? |
|---|---|---|---|---|---|---|
| 1 | Reorder ImportHub: Steam first with "Most start here" tag, hide unavailable platforms behind a "Don't see your platform?" disclosure | `ImportHub.tsx` | 30m | 8 | core | ✅ |
| 2 | Drop "Free forever" from `GetStartedModal` subhead — leave "Keep your library across devices." | `GetStartedModal.tsx` | 15m | 5 | core | ✅ |
| 3 | Replace `ImportHub` subhead "Connect a platform or upload an export file." with "Pick your platform. Steam takes about 20 seconds." | `ImportHub.tsx` | 15m | 6 | core | ✅ |
| 4 | Drop the average-comparison in `FinishCheckNudge` 130%+ branch ("Most people finish in Xh") — reframe to user's own data only | `FinishCheckNudge.tsx` | 15m | 4 | core | ✅ |
| 5 | Resolve `FinishCheckNudge` button-label ambiguity: relabel "Not yet" to "🎮 Move to Playing Now" OR drop the third option | `FinishCheckNudge.tsx` | 15m | 5 | core | ✅ |
| 6 | Move the "Email me when we ship" checkbox out of `GetStartedModal` and into the post-completion surface | `GetStartedModal.tsx` + `CompletionCelebration.tsx` | 1h | 6 | core | ⏸ (post-launch — moves consent to a more honest moment but no legal requirement to ship before launch) |
| 7 | Add a "Skip — try a sample library" tertiary in `ImportHub` so users hesitant to import real data have a no-commitment path | `ImportHub.tsx` | 30m | 4 | core | ⏸ |
| 8 | Rename `GetStartedModal` → `SignInModal` (file + component + usages); remove `@deprecated` props | `GetStartedModal.tsx` + callers | 1h | 2 | gov | ⏸ |

**Pre-launch total:** items 1–5 = ~1h 30m of work, all 15–30m chunks. Fits comfortably in Brady's 10-day window.
**Post-launch total:** items 6–8 = ~2h 30m. Governance + minor flow improvements; ship in the post-launch sprint.

---

## Audit gaps acknowledged

- `SampleImportNudge.tsx` was tagged ⚪ in round 1 and not in this round's scope — flag as round-4 or roll into a post-launch sweep.
- The individual provider modals (`SteamImportModal`, `XboxImportModal`, `PSNImportModal`, `PlayniteImportModal`) are downstream of `ImportHub` and weren't audited deeply this round. `PlayniteImportModal` had a ⚠️ in round 1 (error copy reading as user-blame). Worth a focused 30-minute pass before launch on the four import modals as a group.
- Still unmeasured (and the highest open question across all three rounds): **do returning users actually use the picker, or do they use TabNav as a catalogue?** Round 1 intervention #3 (instrumentation) remains the highest-leverage unstarted item. Pre-launch this is acceptable; post-launch it gates every product decision.

---

*Round 3 of the psychology-redteam skill. Round 1 + Round 2 in `docs/psychology-redteam-2026-04-27.md`. Charter at `.claude/rules/voice-charter.md`. Research at `.claude/rules/user-psychology.md`.*
