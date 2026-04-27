# Psychology Red-Team — 2026-04-27

**Run by:** psychology-redteam skill (first invocation, dogfood pass).
**Adversarial bar:** treat every surface guilty until research says otherwise. Soft verdicts get pushed back.
**Scope this round:** ~12 of ~22 listed surfaces audited deeply by subagent; gaps re-graded by main thread; remaining surfaces flagged for round 2 if findings warrant.

---

## Rubric

**User profile.** Library owner with dozens to hundreds of games. Sits down to play, browses for 20 minutes, closes the launcher, does something else. Has analysis paralysis, sunk-cost guilt, mild internalized shame, and commitment avoidance — every unstarted game is a 20+ hour bet they're afraid to lose. They want to play and can't decide. Not lazy, not catalogue-curious.

**North star (locked 2026-04-26).** *Enjoy your games again.* Return them to a game they already chose, already paid for, already loved. If a surface makes Inventory Full a new thing to manage, it fails the test.

**Axiom.** Sub-60 seconds from "I want to play" → game running.

---

## Surfaces — verdict table

| Surface | Verdict | One-line finding |
|---|---|---|
| LandingPage.tsx | ⚠️ Mixed | Hero copy on-axiom; floating decorative SVGs and density of below-fold content add cognitive load before the user has decided. (Not audited deeply this round — round 2 candidate.) |
| About page | ⚪ Not audited | Round 2. |
| Root OG / Clear OG / Pile OG | ⚪ Not audited | Round 2. |
| OnboardingWelcome.tsx | ⚪ Not audited | Round 2. |
| GetStartedModal.tsx | ⚪ Not audited | Round 2. |
| SampleImportNudge.tsx | ⚪ Not audited | Round 2. |
| ImportHub.tsx | ⚪ Not audited | Round 2. |
| PlayniteImportModal.tsx | ⚠️ Mixed | Error copy reads as user-blame ("Make sure it's a Playnite CSV export"); success toast doesn't carry momentum into pick flow. |
| **Reroll.tsx (pick flow core)** | **❌ Fights** | **Locked 2-input rule (mood + time) has drifted to 3 visible inputs (mode + mood filter + energy) plus 2 collapsible drawers. Comment at line 65 acknowledges the design choice but doesn't acknowledge the axiom violation.** |
| JustFiveMinutes.tsx | ⚠️ Mixed | Empty-state copy at line 75 ("Add some first!") is shame-coded; 5-min duration is system-imposed, not user-chosen. |
| GameDetailModal.tsx | ✅ Serves | Modal is *about* the game, not selling alternatives. Respects the pick. |
| GameCard.tsx | ⚪ Not audited deeply | ~1000 lines, status transitions are the core action surface. Round 2 priority. |
| GridCard.tsx | ✅ Serves | Lookup-shaped card. Doesn't seduce. |
| TabNav.tsx | ⚠️ Hidden risk | Surface itself is clean, but its existence enables the "browse the pile manually" path that bypasses the picker entirely. The catalogue-tool failure mode lives here. |
| ArchetypeCard.tsx | ⚠️ Mixed | "Read me again (n/total)" CTA is mechanical; whole archetype apparatus is personality flavor — does not reduce decision load, may consume attention budget that should be going to the picker. |
| CompletionCelebration.tsx | ⚪ Not audited | 785 lines. Round 2 priority. |
| FinishCheckNudge.tsx | ⚪ Not audited | Round 2. |
| AuthButton.tsx | ⚠️ Mixed | "Continue without syncing" opt-out is gated on `hasLocalGames` (line 164). Real but the hyperbolic "dark pattern" framing the subagent used is overcooked — the panel only opens after a click on sign-in. UX glitch, not a forced gate. |
| CloudSync.tsx | ⚠️ Mixed | Silent localStorage clear on user-switch (line 34) trips loss aversion if it ever happens on a shared device. |
| Stats / share-card composer | ⚪ Not audited | Round 2. Highest catalogue-creep risk surface. |
| Empty / error states (audited subset) | ❌ Fights | "Add some first" / "Make sure it's X" patterns deflect to user action and read as condescension to a 200-game library owner. |

Legend: ✅ Serves the user / ⚠️ Mixed / ❌ Fights the user / ⚪ Not audited this round.

---

## Surface findings (detail)

### Reroll.tsx — the load-bearing finding

**File:** [components/Reroll.tsx:60–76, 65–68 comment, 440–442](components/Reroll.tsx)

The locked rule from `AGENTS.md`: *"Pick flow stays at 2 inputs (mood + time). Any new filter must displace one, not add."* Verifying against current code:

```
- mode (RerollMode)              ← input 1
- moodFilters (MoodTag[])        ← input 2
- energy (EnergyLevel)           ← input 3
- showMoreWays (collapsible)     ← input 4 (one tap away)
- showVibes (collapsible)        ← input 5 (one tap away)
```

Comment at line 65–68 acknowledges the layering ("modal opens at 2 CTAs + energy pills; secondary choices are one tap away") and treats it as defensible by gating drawers behind toggles. The default visible state is still mode + mood + energy = **3 inputs**.

This is the kind of slow drift Sweller's cognitive load research warns about most. Each input is justifiable on its own. The aggregate is over the documented ceiling. The user we built this for has working memory we already taxed by them having 200 games.

The instinct to read this as "but it's collapsed by default" misses the point: the user still sees the energy pills *plus* the mood pills *plus* the mode toggle in the default state. The collapsibles are the polite-feature problem on top.

**Compounding finding:** "energy" replaced "time." The `voice-and-tone.md` spec and AGENTS.md still say *time*. The product says *energy*. These read similarly but they're different abstractions — time is an external constraint the user knows ("I have 30 min"); energy is a self-assessment ("am I a Low or Medium right now"). The latter is one more cognitive ask of a depleted user. Worth a separate decision: is this a deliberate evolution that should be documented, or drift?

### Empty / error states — confirmed shame-coding

Two specific lines, both in the picker flow where the user is actively trying to pick:

- `JustFiveMinutes.tsx:75` — `'No games in your pile to try. Add some first!'`
- `Reroll.tsx` (zero-result path) — `'No games match this mode. Add some games first.'`

For a user with 200 games who just hit a filter that returned zero, "Add some first" isn't just unhelpful — it implies the user did the prep wrong. This is the exact pattern the empathy principle (`.claude/rules/user-psychology.md` §4 + Neff 2003 self-compassion) was set against. Real fix: name the constraint, not the user's failure. *"Nothing in your unplayed games matches that filter. Try removing it."* same length, no blame.

### TabNav — the unexamined exit door

TabNav is well-built. Each tab is clean, keyboard-navigable, status counts visible. The problem isn't the surface, it's what the surface *enables*: a returning user can open Inventory Full, click "Backlog" tab, scroll their library, and never touch the picker. In that mode the app is functionally Backloggd with prettier theming.

The product thesis says "we pick, you play." If returning-user behavior is mostly TabNav-browsing, we're not delivering the thesis — we're providing a catalogue tool with an optional picker bolted on. **This is unmeasurable without instrumentation we don't have.** The Apr 9 instrumentation plan was drafted but its ship status is unclear from this session's resume.

This is the single most important uncertain question in the audit, and it cannot be answered from code review. Flagged as research gap below.

### AuthButton — real finding, hyperbolic framing

[components/AuthButton.tsx:164–174](components/AuthButton.tsx). The "Continue without syncing" button is conditional on `hasLocalGames`. A user who triggers the sign-in panel from a fresh device with no local data sees no gracious exit. The original audit called this a "dark pattern violating Self-Determination Theory." That framing overcooks it — the panel only opens on user click, so the user opted in. It's an ungraceful exit, not a forced gate. Real, ship-worthy fix; not the existential finding the subagent cast it as.

---

## Time-cost (estimated)

The original audit hijacked this section into intervention paths. Re-doing properly. These are *estimates from code reading*, not measured. Numbers below assume no auth, optimistic network, current copy density.

| Path | Estimate | Vs. 60s axiom |
|---|---|---|
| New user, sample import → first pick | ~25–40s | ✅ Within axiom |
| New user, real Steam import (paste profile URL → wait for fetch + enrichment → mood/energy → pick) | ~90–180s | ❌ Exceeds. Steam profile fetch + enrichment is the time tax; plausibly mitigated by streaming the first pick before enrichment finishes (unverified). |
| Returning user, mood pick → reroll → play | ~20–35s in-app, **+ ~30–90s out-of-app** to pivot to launcher and start the actual game | ⚠️ In-app fine; the **out-of-app friction is the missing variable in the 60s axiom.** |
| Returning user, manual TabNav browsing (skipping picker) | <5s | 🚨 **Fast = bad.** If browsing is faster than picking, we've made browsing the path of least resistance. The picker has to feel as fast or faster, *plus* land somewhere meaningful, or rational users will bypass it. |

**The honest reading of the axiom.** "Sub-60 seconds from 'I want to play' to game running" is not a web-app metric. It's a full-loop metric. Even a perfect in-app experience runs out of clock when the user has to alt-tab to a launcher, find the game, and click play. The 60s axiom is dead-on-arrival on web for a meaningful share of users.

---

## Distribution channels

The original audit graded this "✅ aligned, ✅ aligned, ✅ aligned" against LAUNCH_BIBLE copy. That's a copy-fit check, not a channel review. Re-doing.

**Where paralysis happens.**
- Couch with a controller, TV on. (Console / Steam Deck.)
- Phone in bed at 11pm thinking about what to play tomorrow.
- Desk, Steam open, browsing the library tab.

**Where Inventory Full lives.** Web. Desktop browser primary, mobile responsive secondary. PWA-installable, but unclear how many users discover that.

**The friction tax for the actual paralysis moment.**

| Moment | Required steps | Friction count |
|---|---|---|
| At Steam library, paralysed | switch tab → IF → mood + energy → pick → return to Steam → find game → launch | 7 steps |
| On couch with controller | reach for phone → unlock → browser → IF (or PWA) → pick → put phone down → console → find game → launch | 9 steps |
| In bed at 11pm | already on phone → IF → pick (informational only — can't launch from bed) | 3 steps but no payoff |

Findings:

1. **The picker is in the wrong place.** The user is at Steam when they get paralysed. We are not at Steam. A Steam community page, a Deck PWA pinned to the home grid, or a tiny native overlay would put the picker where the moment of paralysis happens. This is core, not polish.

2. **Mobile is informational-only.** A user who picks on their phone has nowhere to go. The "less time in app" promise is undermined when the only thing the user can do is bookmark the pick mentally. Worth investigating: can we deep-link to Steam launcher / Xbox app / PSN remote-launch on mobile? Some yes, some no, varying by platform.

3. **Steam Deck has unique alignment.** The Deck is a web-PWA-friendly device with its own browser, and Deck users are disproportionately the user we built this for (sale-buying, big libraries, decision paralysis). r/SteamDeck is on the LAUNCH_BIBLE post list but only as a follow-up sub. The Deck-as-primary-channel question deserves more weight than a follow-up Reddit post.

**Recommendation:** the launch plan is web-first because that's what's built. That's fine for launch. The post-launch question — *"how do we get the picker to the moment of paralysis"* — is the most important strategic question this audit surfaces, and it's not on any roadmap I can see.

---

## Research gaps

Claims the product makes that aren't backed by the six foundations in `.claude/rules/user-psychology.md`. Specific sources to ingest, not vague calls for more research.

### 1. The "energy" abstraction (replacing "time")
**Claim:** A self-reported energy level (Low / Medium / High) is a meaningful filter that helps the user pick.
**Backed by:** Nothing in the current rules file. Research file says *time*, product says *energy*.
**Ingest:**
- Loewenstein, G. (1996). "Out of Control: Visceral Influences on Behavior" — *Organizational Behavior and Human Decision Processes*. Why hot/cold cognitive states matter more for present-moment choice than slow self-categorization.
- Mischel, W. & Shoda, Y. (1995). "A cognitive-affective system theory of personality" — *Psychological Review*. Whether self-reported state predicts behavior reliably across time.
- *Practical:* run a 2-cohort A/B comparing time-tier ("how long do you have?") vs energy-tier ("how are you feeling?") on commit-to-play rate.

### 2. Returning-user behavior — picker vs TabNav
**Claim:** Returning users use the picker.
**Backed by:** Nothing measured. Pure assumption.
**Ingest:** This is not a literature gap — it's an instrumentation gap. The Apr 9 plan needs to ship before launch if we want to know whether we built a decision tool or a catalogue tool. Specific events to fire: `session_start`, `picker_opened`, `tab_clicked` with tab name, `pick_delivered`, `pick_accepted`, `pick_rerolled`, `game_launched_externally` (proxy: clicked through to Steam / launcher link). Compute: % of sessions where the picker is touched at all.

### 3. Share cards as virality vs distraction
**Claim:** Share cards drive new-user acquisition without converting the existing user into a "performer."
**Backed by:**
- Loosely supported by Cialdini's social proof / Berger's STEPPS.
**Ingest:**
- Berger, J. (2013). *Contagious: Why Things Catch On*. STEPPS framework — does our share card hit Practical Value (helps friend) or Social Currency (makes sharer look good)? The first survives, the second decays once novelty wears off.
- Hu, Y. et al. (2014). "What we instagram" — *Proc. ICWSM*. Whether the share-creation moment pulls users *back into* the app on a non-pick session, which would violate the less-time-in-app axiom.

### 4. Archetypes — gamification under a different name?
**Claim:** Archetypes are personality flavor that adds warmth without becoming engagement bait.
**Backed by:** No empirical source in the rules file.
**Ingest:**
- Deci, E. & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination*. Whether identity-affirming feedback (you are *the Deep Diver*) increases the desired behavior (playing a game) or substitutes for it (looking at archetypes instead of playing).
- Memory note saved earlier: "Archetypes are intentional — personality, not creep." That's the *intent.* The research question is whether the user behavior matches the intent.

### 5. The "60-second axiom" itself
**Claim:** Less than 60 seconds is the right ceiling for "I want to play → playing."
**Backed by:** This is a derived rule from cognitive load + action bias, but the specific 60s number is an internal axiom, not a sourced figure.
**Ingest:**
- Nielsen, J. (1993). "Response Times: The 3 Important Limits" — *Usability Engineering*. The classic 0.1s / 1s / 10s thresholds and why 60s is well past the engagement boundary, not at it.
- The implication: 60s is *not* aggressive enough. The real ceiling for "decision moment → action" might be closer to 10–20 seconds, with 60s being the outer envelope including external launcher pivot.

---

## Verdict

The pick flow is conceptually correct and most surfaces in isolation are research-aligned. The product is **not** broken at the thesis level. The single load-bearing risk is **input creep in the picker itself**: the locked 2-input ceiling (mood + time) has drifted to 3 visible inputs (mode + mood + energy) plus 2 collapsibles, and the *time → energy* substitution shipped without being interrogated against the cognitive-load research it inherits. Every other finding in this audit — error-state shame-coding, AuthButton's missing exit, the 5-minute timer being system-imposed — is real but downstream. The thing to fix first is **the picker itself drifting back into the choice-overload it was built to solve**, because every other improvement we ship rides on the picker holding the line.

Tied for second place strategically (and bigger than the picker fix in lifetime impact, but harder to address before launch): **the picker is in the wrong place.** It lives on web; the user gets paralysed at Steam, on the couch, on a Deck. A web-only product with a sub-60s axiom is internally inconsistent. This is post-launch work, but it should be on the roadmap with the same gravity as a feature, not parked as polish.

---

## Ranked interventions

Ordered by impact-per-effort. Effort: S = ≤2h, M = ≤1d, L = multi-day. Impact: 1–10. Mission-fit: **core** (serves "Enjoy your games again") or **nice-to-have**.

1. **Rebaseline the picker against the 2-input rule.** Decide explicitly: is "energy" a replacement for "time" (then update AGENTS.md + voice-and-tone.md), or has the picker drifted? If drifted, pick *one* of mood/energy/mode to remove or merge. Default visible state should be 2 inputs, not 3. Effort: M (decision is the work). Impact: 9. Mission-fit: **core**. **Uncomfortable: this likely means killing the mode toggle as a default-visible input or merging energy into time.**

2. **Strip user-blame from empty/error states in the picker flow.** Two lines, ~10 minutes of code: `JustFiveMinutes.tsx:75` and the Reroll zero-result path. Replace "Add some first" with constraint-naming copy. Effort: S. Impact: 6 on rare paths but high psychological weight when it fires. Mission-fit: **core**.

3. **Ship the instrumentation needed to answer "do returning users use the picker."** Without this, the audit's biggest open question (catalogue creep on TabNav) stays unanswerable. Probably the highest-leverage thing in the doc, but it's investment, not a copy fix. Effort: M. Impact: 10 (unlocks every future product decision). Mission-fit: **core**. **Uncomfortable: it admits we shipped a thesis we can't yet prove from data.**

4. **Audit the share-card / archetype apparatus against the "less time in app" axiom.** Pull data once #3 ships: are share-card creators returning to look at their card, or sharing once and moving on? If the former, the share card is an engagement feature in a less-time-in-app product, which is the exact failure mode the brand-messaging file warns about. Effort: S to flag, L to remediate if confirmed. Impact: 7 conditional on data. Mission-fit: **core**. **Uncomfortable: it reopens whether share cards belong in a product whose thesis is "close the app."**

5. **Add the AuthButton "Continue without syncing" exit unconditionally.** Five-minute fix. Lower priority than the picker but visible to every new user who taps sign-in. Effort: S. Impact: 4. Mission-fit: nice-to-have.

6. **Surface the time-cost truth in launch copy.** LAUNCH_BIBLE positions the app as the answer to "I want to play." The truth is the app *plus* a launcher pivot. Either soften the claim or commit to native channel work (Deck PWA pinned, deep links to launchers). Effort: S to soften copy, L to ship native paths. Impact: 5 on copy fix; 9 on channel work post-launch. Mission-fit: **core**.

7. **Document the time → energy substitution as a decision (or revert).** Either way, get it into `docs/DECISIONS.md` so the next reviewer doesn't flag the same drift. Effort: S. Impact: 3 (governance, not user-facing). Mission-fit: nice-to-have.

8. **Confirm Steam Deck as a primary, not follow-up, channel for launch and post-launch.** The Deck audience overlaps the user profile so heavily that treating it as a follow-up Reddit sub is leaving leverage on the table. Effort: S to plan, L to ship a Deck-pinned PWA experience. Impact: 8 on long-term distribution. Mission-fit: **core**.

9. **Round 2 audit on the surfaces skipped this pass.** OnboardingWelcome, GetStartedModal, ImportHub, CompletionCelebration (785 lines), FinishCheckNudge, GameCard's status transitions, stats page. The first three are the cold-start path; CompletionCelebration is the moment we want users to come back for; the stats page is the highest catalogue-creep risk. Effort: M. Impact: 6.

10. **Make the JustFiveMinutes timer user-chosen.** Show 5/10/20 options before starting. Converts "system-imposed constraint" → "commitment I made," which is the autonomy preservation the SDT research calls for. Effort: M. Impact: 4. Mission-fit: nice-to-have.

---

## Audit gaps acknowledged

This was a partial audit. Not a hidden one. The skipped surfaces in the verdict table are not "passing by default" — they're not yet examined. The verdict above is calibrated to the surfaces that *were* read, with the picker creep finding being the load-bearing risk. A round-2 pass on the cold-start surfaces (Onboarding, GetStarted, ImportHub) and on CompletionCelebration + stats is the natural next step before launch.

The most consequential question this audit cannot answer from code alone: *what do returning users actually do when they open the app?* That's intervention #3.

---

*First run of psychology-redteam skill. The skill itself is at `.claude/skills/psychology-redteam/SKILL.md`. Iterating the skill based on this run is in scope for the closer.*

---

# Round 2 — surfaces skipped in Round 1

Run later the same day. Covers LandingPage, CompletionCelebration, the three OG routes (root / clear / pile), the stats page apparatus, and the share-card composer embedded inside the celebration flow. Same rubric as Round 1.

## Round 2 — verdict table

| Surface | Verdict | One-line finding |
|---|---|---|
| LandingPage.tsx | ✅ Serves | Hero copy on-axiom; floating decorative SVGs add cognitive load below the fold but the above-fold pitch holds. |
| CompletionCelebration.tsx | ⚠️ Mixed | Clean exit ("Onward. Back to the pile") but the share composer embedded mid-flow pulls user energy from "go play" into "post on social." |
| app/opengraph-image.tsx (root) | ✅ Serves | Communicates "we pick, you play" with feature pills; no stats-flex. |
| app/clear/[id]/opengraph-image.tsx | ✅ Serves | Celebration-centric, not stats-flex. Personal-behavior subtitle templates respect the brand axiom. |
| app/pile/[id]/opengraph-image.tsx | ⚠️ Mixed | Archetype-led card. Reads as "here's my gaming archetype" rather than "here's a game I played" — fine if it doesn't displace clear-card sharing. |
| Stats page + StatsPanel.tsx | ⚠️ Mixed | Three subsystems individually defensible (Decision Engine, Value Calculator, rerollable archetype) but together create reasons to *return and browse* over *return and pick*. No "go pick" CTA. |
| Share-card composer (inside celebration) | ❌ Fights | Embedded mid-flow; opt-out not opt-in; pulls a "ready for the next game" moment into a "post on social media" funnel. |

## Round 2 — surface findings (detail)

### LandingPage.tsx

**File:** [components/LandingPage.tsx:29–67, 286–319](components/LandingPage.tsx)

Hero copy is on-axiom ("We'll help you pick. You do the playing."). Six animated SVG decorations behind the fold (ring, diamond, dots, triangle, cross, hexagon) add ambient cognitive load — fine for a marketing page, worth flagging if mobile performance starts to lag. Below-fold content includes some redundant CTAs and decorative copy that taxes the scroll-decision window. Lines 215–218 acknowledge an earlier trim (How it works / Not another tracker moved to /about), so the surface is already lighter than it was. Not a load-bearing finding.

### CompletionCelebration.tsx

**File:** [components/CompletionCelebration.tsx:223–491, 519, 743](components/CompletionCelebration.tsx)

Exit is clean. `handleClose()` (line 519) ends with two CTAs: "Show Me My Cleared List" and "Onward. Back to the pile." The latter is the right button — it resumes the picking loop. The problem is *what sits before the exit*: the share-card composer (lines 223–491) is embedded in the celebration stage, between the rating widget and the exit. The user is in "I just finished a game" energy and the composer asks them to toggle stats, reroll flavor text, and create a URL to post on Twitter / Reddit. The placement is the problem — minimalism (only 2 share-worthy stats per the comment at line 241) is fine, but mid-flow opt-out delivery isn't.

### Root OG, Clear OG (✅ findings)

Both surfaces communicate the thesis directly. Root OG ([app/opengraph-image.tsx:144, 159, 171–192](app/opengraph-image.tsx)) leads with "Can't decide what to play? Yeah, we know." + feature pills (Steam + Xbox + PS, Mood Matching, Free) + the locked tagline. No stats. Clear OG's `pickSubtitle()` ([app/clear/[id]/opengraph-image.tsx:88–104](app/clear/[id]/opengraph-image.tsx)) rotates personal-behavior templates (faster-than-average, dollar reclaimed, count milestone) over comparison/leaderboard framing. Both surfaces honor "we pick, you play."

### Pile OG (archetype reveal)

**File:** [app/pile/[id]/opengraph-image.tsx:232–308](app/pile/[id]/opengraph-image.tsx)

Card leads with archetype name + descriptor + persona sprite, with game count + flavor + "cleared by [name]" attribution. The card itself is well-crafted; the question is its position in the share hierarchy. If users share archetype reveals more than game clears, the public face of the brand becomes "we tell you who you are" rather than "we picked, they played." Brady's call: both shares stay, no conflict — the archetype is character work and "look what kind of gamer Inventory Full says I am" is a real shareable moment. Worth instrumenting share volume per type once #3 (instrumentation) ships.

### Stats page + StatsPanel.tsx

**File:** `app/stats/page.tsx` + [components/StatsPanel.tsx:51–126, 185–246, 348–350, 369–439](components/StatsPanel.tsx)

Three subsystems, each a borderline call:

- **Decision Engine** ([StatsPanel.tsx:51–126](components/StatsPanel.tsx#L51)) — analyzes `topGenres`, `skipGenres`, `sweetSpot` timing and reflects patterns back. Risk: trains users to filter themselves ("the engine says I like roguelikes, so I'll only pick roguelikes"). Brady's call: keep it. Users don't critically self-analyze; mirroring back is character work.
- **Value Calculator** (lines 185–246) — fetches retail prices + HLTB, surfaces "$X unplayed" and "Yh in backlog." Risk: "$4,200 unplayed" framing is debt/guilt language; quantifying loss can amplify avoidance. Brady's call: reframe as opportunity language ("$4,200 of fun ready to be won back"). Logged in ROADMAP.
- **Rerollable archetype** (lines 348–350) — `handleRerollArchetype()` cycles through 36 matched archetypes. Risk: engagement-for-engagement; doesn't change a single pick decision. Brady's call: keep it as character expression, instrument reroll volume to confirm it reads as novelty (1–3 per session) not stickiness (10+).

The teaser strip (lines 369–439) is the right shape: glanceable progress, opt-in to expand. The missing piece is a "Pick something" CTA from the bottom of the stats page so users have a clear path back to the picker. Logged in ROADMAP.

### Share-card composer (inside CompletionCelebration)

**File:** [CompletionCelebration.tsx:223–491](components/CompletionCelebration.tsx#L223)

The most aggressive catalogue-creep surface in the app. The composer:
- Lives in the celebrate stage at line 743, between the rating widget and the exit buttons.
- Is opt-out: visible by default, requires the user to scroll past or click "Back to the pile" to *leave* it. Not "click Share to *stay*."
- Includes flavor-text rerolling (line 281, `rerollFlavor()`), 2 stat toggles (lines 392–411), a Create-and-copy button (line 425), and three social-launch buttons (Twitter / Reddit / Copy Link, lines 449–485).
- Funnels the user from "I cleared a game" → "I made a card" → "I'm posting it" → external social media.

The user came to play a game. They did. The celebration says "go back to the pile." But the composer says "first, tell people." For a user with decision paralysis and commitment avoidance, the friction of "should I share this?" might be enough to keep them in the app longer than they intended, or to never return to the picker tonight. This is the clearest violation of the less-time-in-app axiom in the round 2 audit.

Brady's call: log as ROADMAP item to move the composer from opt-out (inline, mid-flow) to opt-in (a button that opens the composer if the user wants). Already in ROADMAP.

## Round 2 — cross-surface synthesis

### Catalogue-creep audit

The app shows early signs of catalogue-creep accrual, but the core picker remains clean. The risk lives in surfaces *around* the picker:

1. **Stats page apparatus** — Decision Engine + Value Calculator + rerollable archetype create reasons to *return and browse* rather than *return and pick*. Three subsystems in one page; a returning user can spend ten minutes on stats without touching the picker.
2. **Archetype apparatus** — designed as personality flavor (per intent), but rerollability turns it into engagement-for-engagement.
3. **Share-card apparatus** — embedded mid-celebration, opt-out, three social-launch buttons. Most aggressive creep surface.
4. **TabNav (round 1 finding)** — escape hatch from the picker. Browsing the Backlog tab manually behaves identically to a catalogue tool.

**Round 2 verdict on catalogue creep:** the app is a decision tool with personality flavor *on its way to becoming* a personality engine + catalogue management system. Not yet there. Brady's calls (keep Decision Engine + archetype reroll + both share types, reframe value-calc + add go-pick CTA + move share composer to opt-in) keep the character work intact while addressing the structural issues. The picker itself is clean (post-rebaseline).

### Completion-to-return loop

Multiple loops, most of them wrong:

- **Right loop:** "I cleared. I want to play again. I open IF. I pick." Short, picker-terminated. Celebration's "Back to the pile" CTA serves it.
- **Wrong loop #1:** "I cleared. I want to see my updated stats. I scroll the stats page. I close the tab without picking." Sticky stats page + missing "go pick" CTA.
- **Wrong loop #2:** "I cleared. I want to share. I create the card, post on Twitter, get distracted by other tweets, never come back to pick." Composer placement.
- **Wrong loop #3 (TabNav, round 1):** "I want to play. I open IF. I click Backlog. I scroll. I close the tab without picking." Browsing as decision-paralysis cosplay.

Right loop is *correct* by design and lives in the celebration's exit CTA. The wrong loops aren't disasters — they're soft pulls — but they're worth instrumenting.

### Round-1 finding revalidation

Round 1's load-bearing finding (picker input creep is the #1 risk) is **strengthened** by Round 2, with a bigger systemic concern uncovered:

The picker drift is the real risk *for the pick flow itself.* But the surfaces *around* the picker are now pulling users *away* from it. The app is training returning users to treat the picker as one option among many — stats, archetype, share, TabNav are all more *comfortable* than the picker because they don't require a commitment to play.

**The bigger problem is system-level, not picker-level.** The round 1 fix (rebaseline picker to default-2 inputs) is necessary but insufficient. The round 2 findings (share composer placement, stats page reframes, instrumentation gap) close the system-level gaps.

Round 1's intervention #3 (instrumentation) is the highest-leverage thing in the entire two-round audit. Without it, every other change in this doc is a hunch.
