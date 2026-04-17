# Decisions log

This file captures the **why** behind load-bearing decisions on Inventory Full. It is not a changelog — `git log` already does that. The goal is for future-Brady (and future-Claude) to reverse-engineer intent when a piece of code looks weird six months from now.

## How to use this file

- Append-only, reverse chronological (newest at top).
- One entry per decision. Keep it tight.
- Capture the **why** and what was **rejected**, not just what was chosen. The rejected alternatives are often more informative than the winner.
- Link to the commit or file if it helps, but don't duplicate the diff.
- It is okay to write an entry a few days after the fact. Better late than never.
- If a decision gets reversed later, don't delete the old entry — add a new one that supersedes it, and link back. The reversal reason matters too.

This doc is a starting point, created 2026-04-09 from what was fresh in the current session. Older decisions can be backfilled as they come up.

---

## 2026-04-17 — Tagline retagged: "Get playing." (supersedes "Stop stalling. Get playing.")

**Decision.** The primary tagline is now "Get playing." alone. Everywhere the longer "Stop stalling. Get playing." appeared — page titles, OG metadata, landing bottom CTA, about page, email templates, pile + clear share pages, root OG card — is updated to the short form. Supersedes the Apr 8 lock.

**Why.**
- **Redundant pain-naming.** The product name "Inventory Full" already names the backlog-overload pain. "Stop stalling" restated it and landed as scolding on a second pass.
- **Reactance.** Per `.claude/rules/user-psychology.md` §4, correction imperatives ("stop doing X") trigger more pushback than forward imperatives ("do Y") in commitment-avoidant users. "Get playing" is the forward form.
- **AI-tell cadence.** The symmetrical "two-words. two-words." structure is flagged in `.claude/rules/voice-and-tone.md` under banned structural patterns. Brady's gut kept catching it for that reason.
- **Meta-alignment.** The product's thesis is "remove barriers to playing." A tagline that removes two words to say the same thing is the product acting like itself.

**Rejected.**
- **Keep "Stop stalling. Get playing." everywhere.** The settled choice for 9 days, but the reasons above compounded.
- **Keep both, split by surface** (short form in-app, long form on landing). Rejected — two taglines is the problem the Apr 8 lock solved. Splitting by surface re-creates the drift.
- **Alternative rewrites** ("Less pile, more play", "Your pile, unlocked", etc.). None beat "Get playing." for brevity, clarity, or confidence. Stopped iterating when the short form tested best against the voice/psychology rules.

**How to apply this.** Any surface that needs a tagline uses "Get playing." If a longer brand line is needed (rare), pull a supporting line from `.claude/rules/brand-messaging.md` ("Your backlog's not gonna play itself." / "Less shame. More game.") — those are subheads, not alternative taglines.

**Evidence.** Sweep across `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/opengraph-image.tsx`, `app/clear/[id]/{page,opengraph-image}.tsx`, `app/pile/[id]/{page,opengraph-image}.tsx`, `components/LandingPage.tsx`, `docs/email-templates/magic-link.html`, plus rule docs `.claude/rules/brand-messaging.md` and `.claude/rules/user-psychology.md`, and roadmap/ideas docs. Commit landing 2026-04-17.

---

## 2026-04-13 — OG stats card: two-column layout, logo as hero, archetype-forward

**Decision.** The stats OG card (`app/pile/[id]/opengraph-image.tsx`) uses a two-column layout: 280px logomark + brand name + tagline stacked on the left (takes roughly half the card), archetype name/descriptor/flavor text/value pills stacked on the right. Peripheral chrome (games tracked, exploration %, compact stats line, CTA, URL) sits small at the edges. All user-selected content (archetype, flavor text, checked values) renders large and legibly.

**Why.** First pass had an 80px logo and dense 4-stat grid that nobody could read at share-card scale. Brady's feedback over 5 iterations drove the final sizing: the logo needed to be a hero element (320px → 280px after content sizing), the tagline "Stop stalling. Get playing." had to be legible (24px), and the user's selected content (archetype 48px, descriptor 26px, flavor 24px) should dominate over the peripheral stats (which people won't read at share size anyway).

**Rejected.**
- **Stats grid with 4 pill cards in a row.** Too small to read, wasted space on labels nobody scans in a thumbnail.
- **Logo in top-left corner at 80px.** Invisible. The logo has to function as the brand signal when someone glances at a Twitter/Discord unfurl.
- **Fit-everything-in-top-header layout.** Crammed the brand, exploration bar, and games count into a single header row — the brand got lost.

**Evidence.** Commits `9b90dd7`, `5abadf4`, `517ea90`, `e305ac6`. Iteration was rapid (5 pushes in one session) because OG images can't be tested in browser preview — each size change required a commit + deploy + unfurl check.

---

## 2026-04-12 — Stats share cards mirror clear card architecture at /pile/[id]

**Decision.** Stats share cards use the same architecture as completion share cards: Supabase table (`share_stats`), service-role API writes, 8-char nanoid URLs, server-rendered Satori OG images, public landing page. The route is `/pile/[id]` not `/stats/[id]`.

**Why.** The architecture is proven (clear cards have been live since Apr 8 with no issues). Reusing the same patterns means no new infrastructure, the same RLS model, and the same mental model for maintainability. `/pile/[id]` was chosen over `/stats/[id]` because "pile" is the brand term for a user's library and the card shows their pile's state, not abstract statistics.

**Rejected.**
- **Client-side only (screenshot approach).** Would not generate OG images for unfurls. The whole point is that pasting the link into Discord/Twitter/Slack shows a rich preview.
- **Encode stats in URL params.** Same rejection as clear cards: ugly URLs, leaky, breaks on Twitter's shortener.
- **`/stats/[id]`** — "stats" is generic. "pile" is the brand word.

**Evidence.** `supabase/migrations/004_share_stats.sql`, `app/api/share-stats/route.ts`, `app/pile/[id]/page.tsx`, `app/pile/[id]/opengraph-image.tsx`, `components/StatsShareComposer.tsx`.

---

## 2026-04-12 — Sample data onboarding: pulse CTA instead of auto-reroll

**Decision.** When users load sample data, the import summary modal is skipped entirely. Instead of auto-opening the reroll picker after 800ms (the Apr 8 behavior), the "What Should I Play?" button gets a pulse animation to draw attention without forcing the user into an interaction.

**Why.** Two separate problems. First: sample users don't care how many games were imported or what platforms they came from, so the import summary modal was noise. Second: the 800ms auto-reroll was too aggressive for sample users who haven't oriented themselves yet. They haven't built any ownership of the library, so launching the picker felt disorienting. The pulse splits the difference: it says "this is the main thing" without taking control away.

**Rejected.**
- **Keep import summary for sample users.** Zero value. They didn't import anything real.
- **Keep 800ms auto-reroll.** Too aggressive for users who haven't even looked at the app yet.
- **No highlighting at all.** Users wouldn't know what to do next. The button needs to stand out.

**Evidence.** `app/page.tsx` (isSampleLoad ref, pulseReroll state). Commit `2e20801`.

---

## 2026-04-12 — Celebration modal gets overflow-y-auto and close X button

**Decision.** The completion celebration modal changed from `overflow-hidden` to `overflow-y-auto` with `max-h-[85dvh]`, and a close X button was added at top right.

**Why.** On mobile, the modal content (rating stars, flavor text, share composer, action buttons) exceeded the viewport height. With `overflow-hidden`, the bottom buttons were clipped with no way to reach them or dismiss the modal. The X button is defense-in-depth: even if scrolling somehow fails, users have a clear escape. `85dvh` leaves room for the system UI chrome on mobile browsers.

**Rejected.**
- **Reduce content to fit.** The share composer is the main new feature and can't be cut.
- **Full-screen modal on mobile.** Loses the "card floating over the page" feel that makes the celebration feel like a moment.

**Evidence.** `components/CompletionCelebration.tsx`. Commit `7999878`.

---

## 2026-04-09 — Security posture: user-level deny-list only, no tooling overhead

**Decision.** Created `~/.claude/settings.json` with a narrow Read-deny list for credential files (`~/.ssh/**`, `~/.aws/**`, `~/.gnupg/**`, `~/.azure/**`, `~/.kube/**`, `~/.npmrc`, `~/.git-credentials`, `~/.config/gh/**`, `~/.netrc`, `~/.pypirc`, `.env` / `.env.*` at any depth). Nothing else.

**Why.** Reviewed an engagement-farming security tweet (dropped in `notes/Firefox.pdf`) that pushed a much heavier stack: Trail of Bits' `claude-code-plugins`, running everything in devcontainers, bash denies on `curl *.sh | sh`, IBM "197-day breach detection" stat, etc. Most of it was either cargo-culted or actively hostile to how this project actually works.

**Rejected.**
- **Trail of Bits plugin.** Overkill for a solo pre-revenue app. Adds a moving dependency for marginal defense. Revisit if/when a team or sensitive data shows up.
- **Devcontainers.** Would break the fnm + native Next.js workflow without fixing a problem Brady actually has.
- **Bash curl/`sh` denies.** Would break legitimate API debugging (psn, xbl.io, HLTB probes we run regularly) for zero real-world attack surface on this box.
- **Project-level denies.** Skipped intentionally — this is personal-machine hardening, not something to commit into the repo. User-level `~/.claude/settings.json` merges with project settings automatically, deny rules stack, most restrictive wins.

**Evidence.** `~/.claude/settings.json` created this session. Engagement-farming tweet archived at `notes/Firefox.pdf`.

---

## 2026-04-09 — Safari FeatureCard icons need explicit width/height attributes

**Decision.** All six FeatureCard SVGs in `components/LandingPage.tsx` (Mood, Clock, Timer, Party, Free, Lock) got explicit `width="20" height="20"` attributes in addition to the existing Tailwind `className="w-5 h-5"`. Step icons were left alone.

**Why.** Safari was collapsing the feature-card icons to 0×0. Brave rendered them fine. Root cause: when an SVG has no intrinsic size attributes and lives inside a `w-10 h-10 flex items-center justify-center` wrapper, Safari's flex layout resolves the child's intrinsic size first, sees `0×0`, and keeps it there — the Tailwind width/height classes on the SVG never get a chance. Explicit `width`/`height` attributes give Safari something to anchor on.

**Rejected.**
- **Just size the wrapper.** The wrapper was already sized. Safari was ignoring the child's className sizing, not the wrapper.
- **Use `<img src="...svg">`.** Loses the theming via `currentColor`.
- **Fix the step icons too.** They render in a different flex context without the collapsing behavior. Not broken, didn't touch them.

**Evidence.** Commit `10db53e`. Step icons vs FeatureCard icons in `components/LandingPage.tsx`.

---

## 2026-04-09 — Sparkle icon variant preserved as intentional second option, not a duplicate

**Decision.** The files that showed up as `public/icon-192 2.png` / `public/icon-512 2.png` were renamed to `icon-192-sparkle.png` / `icon-512-sparkle.png` and committed intentionally. They are not wired to the manifest — the clean set still ships. The sparkle set is available by hand for celebration moments, launch posts, etc.

**Why.** I initially called them iCloud sync duplicates (the " 2" suffix pattern looks exactly like iCloud collision artifacts). Brady pushed back: file sizes differed (27005 vs 18586, 145834 vs 102393). On inspection they were genuinely different renders — one clean, one with purple sparkle/starburst rays behind the controller. Both came from today's icon regen pass; the sparkle version was the 10:28 pass, the clean version was the 11:03 pass that overwrote the canonical filenames, and iCloud preserved the original under " 2".

**Rejected.**
- **Delete as duplicates.** Was my first instinct and it was wrong.
- **Swap the manifest to sparkle.** The clean version is the right default. Sparkle is too loud for a home-screen icon you see every day.

**Lesson for future me.** When files with similar names have different byte counts, that is a signal they are not copies. Check content, not just naming. Also: something regenerated the icons twice today without Brady touching them — next time icons move, investigate the pipeline before assuming iCloud.

**Evidence.** Commit `d0982d1`. `public/icon-*-sparkle.png`.

---

## 2026-04-09 — Sweep rule: user-facing strings get updated, internal identifiers don't

**Decision.** During the "bail" → "Moved On" component sweep, all user-visible strings, toasts, labels, placeholders, and help copy got updated. Internal code — `canBail`, `setBailed`, `showBailed`, the `bailed` status key — stayed as-is.

**Why.** Two different kinds of rename live under one request. User-facing copy is brand surface area and has to be consistent or the product feels drifted. Internal identifiers are a type-level refactor: renaming them means touching every file that imports the type, updating tests, risking import regressions, and getting zero user-visible benefit. The cost/benefit gap is huge. Fix what the user sees; leave the wiring alone until there's a reason to touch it.

**Rejected.**
- **Full rename including identifiers.** Would have touched ~dozen more files, risked breakage, delivered nothing a user notices.
- **Leave the strings and only change the obvious ones.** Would have left drift across toasts, caps, help modal, share card API. The whole point was to re-lock the vocabulary.

**How to apply this next time.** When a naming/voice decision gets made, the default sweep scope is **user-visible strings only**. Internal identifiers are a separate decision with a separate cost. Call it out explicitly so there's no ambiguity.

**Evidence.** Commit `e59d8f3`. `components/GameCard.tsx` still has `canBail`/`setBailed` props; toasts and placeholders all say "Moved On" / "Why'd you move on".

---

## 2026-04-09 — Em-dash rule is absolute in marketing copy

**Decision.** Em-dashes are banned from user-facing marketing copy. Use commas, periods, or line breaks instead. This applies even in conversational, spicy, brand-voice copy where an em-dash would "feel right."

**Why.** The rule was already in `.claude/rules/voice-and-tone.md` but I treated it as context-dependent and wrote "Perfect — we've got you." as a landing subhead option. Brady's correction was direct: "drop the em dash lol". The rule is not "avoid em-dashes in formal writing" — it's "don't write AI-sounding copy," and the em-dash is one of the highest-signal AI tells. There is no marketing context where it gets a pass.

**Rejected.**
- **Em-dash for dramatic pause in short punchy copy.** This is the exact thing the rule targets.
- **Replace with `—` via CSS so it's "technically not a character."** Not even trying that.

**How to apply this next time.** Any landing page, about page, hero, H2, CTA, feature card, or social post draft gets the voice sweep pre-commit. The avoid-AI-SKILL reference in `docs/avoid-AI-SKILL.md` is the canonical checklist. Grep for `—` in changed files before committing marketing copy.

**Evidence.** Commit `10db53e`. Brady's in-session correction.

---

## 2026-04-09 — Landing hero: "Can't decide what to play? Yeah, we know."

**Decision.** Replaced the four-sentence hero body on landing and about pages with a single line: **"Can't decide what to play? Yeah, we know."** H2 swapped from "Three steps. We do the hard part." to "It's really just three things:". Step 3 description rewritten around "We pick, you play. Clear it, drop it, or just move on? No judgement. Moving on is deciding too." The standalone nudge paragraph ("We nudge you to play. If you don't like the game, blame us and keep going.") was removed.

**Why.** The old four-liner ("Import your library. Tell us your mood. We pick the game. You hit play.") had a word-word-word-word rhythm that landed as staccato and AI-adjacent. Brady read it and the rhythm was the specific thing that bothered him. The new subhead leans fully into the empathy: name the problem, acknowledge it, done. It is deliberately not a feature pitch. The feature pitch is in the three steps below.

Brady picked option B over an option A ("Can't decide? Perfect, we got you."). Option A was less specific and the "Perfect" was the kind of reassurance-prefix that reads as AI. Brady's note on B: "bold and spicy and perfect. it lands perfect for who it needs to and doesn't for who it doesn't." The willingness to let the copy land with some people and not others is itself the decision — there's no attempt to be universally friendly.

The H2 swap is the same move at a different scale: "Three steps. We do the hard part." was telling the user what to feel. "It's really just three things:" is teasing the list instead of summarizing it, and the list does the work.

**Rejected.**
- **Keep the four-line block.** The rhythm was the problem. Tweaking words wouldn't fix it.
- **Option A ("Can't decide? Perfect, we got you.")** — Brady's B vote. Too generic, the reassurance-prefix reads as AI.
- **Keep the nudge paragraph.** Surrounding pitch copy already carries the point. The nudge was an extra beat the page didn't need.

**Evidence.** Commit `10db53e`. `components/LandingPage.tsx` and `app/about/page.tsx`.

---

## 2026-04-09 — Status cycle locked, "bail" retired from user copy

**Decision.** The game status cycle is locked to: **Backlog → Up Next → Playing Now → Completed → Moved On**. The word "bail" is retired from all user-facing copy. The button verb for the move-on action is "Not for me"; the destination state is "Moved On". The Playing Now tab icon is ▶️ (was 🔥 — 🔥 stays on the `deep-cut` time tier).

**Why.** Semantic audit found drift everywhere: "Now Playing" vs "Playing Now", "Bailed" vs "Moved On" vs "Dropped", tab icons not matching cap copy, help modal referencing filter toggles that don't exist. Lock the vocabulary now, sweep every surface once, and future additions inherit the locked terms.

Brady's reasoning on retiring "bail": *"bail is too 'lingo' it's like gnarly or rad or cowabunga. good character, but pigeonholed and alienating."* The word has a specific generational/subcultural read that narrows the audience without adding warmth. "Moved On" is neutral, compassionate, and carries the brand thesis (declining a game is a decision, not a failure) without leaning on slang.

The "Not for me" / "Moved On" split (action verb vs destination state) is intentional and not contradictory. The button is what you press; the shelf is where it ends up. Button tense and state tense are different jobs.

**Rejected.**
- **Keep "bail"** — it was the working word for months, it's tight, it has character. Rejected for being narrowing.
- **"Dropped"** — reads as failure in gaming contexts (dropped from ranked, etc.). Carries shame.
- **"Abandoned"** — too strong, too judgmental.
- **Renaming the internal `bailed` status key.** See the sweep-rule decision above — internal identifiers stay.
- **🔥 on Playing Now** — icon collided with the `deep-cut` time tier and felt like it was shouting. ▶️ is calmer and matches the literal meaning.

**Evidence.** Commits `ffbc343`, `5c15587`, `e59d8f3`, `10db53e`. `.claude/rules/brand-messaging.md` and `.claude/rules/voice-and-tone.md` document the locked cycle. The `deep-cut` time tier decision is parked — Brady is unsure what "Deep Cut" means as a session-tier name.

---

> **Entries below are backfilled on 2026-04-09 from two sources:** (a) the current-session memory files `apr5.md` → `apr8.md`, and (b) the prior session's memory files in `~/.claude/projects/.../Get-Playing--Project-Brief/memory/` (dated Apr 1-4). The session memory files summarize *what shipped* more than *why it shipped*, so these entries reconstruct the reasoning from context where I'm confident and flag gaps where I'm not. If the "why" on one of these ever matters for a new decision, verify against `git log` or ask Brady — the original in-session reasoning wasn't always captured.

---

## 2026-04-08 — Tagline locked: "Stop stalling. Get playing."

**Decision.** "Stop stalling. Get playing." is THE tagline. It goes on every surface: page titles, OG metadata, headers, footers, share cards. Supporting lines ("Your backlog's not gonna play itself.", "Less shame. More game.") are subheads or celebration-context only, never competing taglines.

**Why.** Before Apr 8 there were 5+ competing taglines drifting across different surfaces. A user landing on the home page saw one message, the share card said another, the OG metadata said a third. Picking one and banning the rest is worth more than any individual phrase being "better."

**Rejected.**
- **"Your backlog's not gonna play itself."** — Good line, now demoted to subhead. It names the pain but doesn't promise the fix.
- **"Less shame. More game."** — Kept, but only in celebration/share contexts. Too flippant as a first-touch line.
- **Rotate taglines by surface.** Would keep drift alive forever.

**How to apply this.** Any new surface that needs a tagline uses "Stop stalling. Get playing." If you want to write something else, you are probably writing a subhead, not a tagline. Subheads are fine but they do not get to claim top billing.

**Evidence.** `.claude/rules/brand-messaging.md` (primary tagline section). Apr 8 session memory.

---

## 2026-04-08 — Onboarding hierarchy: action first, auth second

**Decision.** The GetStartedModal shows import and sample options above the fold; auth ("want to sync?") lives below a divider. When a user picks "try with sample data", the reroll picker auto-opens after 800ms. The post-import summary modal's primary CTA is "What Should I Play?" not "Got it."

**Why.** Every extra step before the core loop is a place new users drop. The core loop is Import → Mood → Play. Auth is a sync convenience, not a requirement for the product to work. Putting auth above the fold implied it was a prerequisite; burying it below a divider makes the real path (import or sample, then play) visually dominant. The 800ms auto-reroll lets sample users experience the core loop without having to hunt for a button — they land on the app, see their library for a blink, then the reroll picker takes over and the app is already *doing the thing it's for*.

**Rejected.**
- **Auth above the fold.** Implied the product needed an account.
- **"Got it" as primary post-import CTA.** Dead-end. Users would close the modal and stare at the library.
- **Wait for the user to click into reroll on sample mode.** Required them to know reroll was the main thing. Most new users don't.

**How to apply this.** New onboarding surfaces inherit the rule: the path to playing a game is above the fold; everything else (auth, settings, explanations) is below. If a new surface buries the core loop, it's wrong.

**Evidence.** Apr 8 session memory "Onboarding tightening" section.

---

## 2026-04-08 — Shelf/Session dropdowns removed from game card

**Decision.** The per-game Shelf and Session dropdowns in the game-card detail view were deleted entirely, not hidden behind a setting.

**Why.** They were a power-user feature that added decision paralysis to a UI that exists to *reduce* decision paralysis. Every dropdown is a decision a user has to make. For 99% of users, the answer is "I don't know, just help me pick a game" — the dropdowns were surfacing organization the user didn't ask to do. The whole product thesis is that organizing your pile is the distraction that keeps you from playing it.

**Rejected.**
- **Hide behind an advanced toggle.** Keeps the complexity in the codebase forever for the 1% who might want it, and those users can still find it. No.
- **Keep but collapse by default.** Still visible, still a decision to make about whether to expand it.

**How to apply this.** Future features that let users *organize* instead of *play* get this same scrutiny. If a feature adds decisions without moving the user closer to launching a game, it's a candidate for deletion, not refinement.

**Evidence.** Apr 8 session memory "Game card detail UX cleanup" section.

---

## 2026-04-08 — Share cards stored server-side in Supabase, not URL-encoded

**Decision.** Share card payloads live in a `share_cards` Supabase table (public read RLS, service-role writes) behind an 8-char nanoid. The `/clear/[id]` landing page fetches the row; the `/clear/[id]/opengraph-image` route renders the dynamic PNG via Satori.

**Why.** URL-encoding the share card payload would produce an ugly, long link that breaks on Twitter's URL shortener, previews badly, and exposes the full payload in any log or analytics pipeline that captures referrers. An 8-char nanoid gives a clean `inventoryfull.gg/clear/abc12345` URL that is easy to share verbally, works inside SMS/tweets without truncation, and keeps the payload out of URL-level logs. The storage cost is trivial (small JSON rows on Supabase free tier).

**Rejected.**
- **URL-encoded payload.** Ugly, long, leaky.
- **Client-side hash fragment.** Wouldn't work for OG image generation, which needs a server-fetchable URL.

**Evidence.** `supabase/migrations/003_share_cards.sql`, `app/api/share/route.ts`, `app/clear/[id]/page.tsx`, `app/clear/[id]/opengraph-image.tsx`. Apr 8 session memory.

---

## 2026-04-07 — Energy matching replaces time-of-day signal

**Decision.** Mood/time pairing is now driven by an explicit Low / Medium / High **energy** picker, not by the current time of day.

**Why.** Time of day was a weak proxy for what it was trying to measure: "how much brain do I have for this right now?" Someone could be on the couch at 2pm with nothing left in the tank, or at 11pm fully wired. Asking the user directly ("what's your energy like?") gets a better signal in one question than inferring from the clock. It also removes a whole category of "but it's 3pm" edge cases from the recommendation logic.

**Rejected.**
- **Keep time-of-day.** Drifted against user reality too often.
- **Combine both** (time-of-day as prior, energy as override). Extra complexity for no meaningful win — energy alone is already the better signal.

**Note on gap.** The original in-session reasoning was not fully captured in memory. The "why" above is reconstructed from the product thesis. If this needs to be revisited, verify against the Apr 7 commit history.

**Evidence.** Apr 7 session memory, V3 decision engine #5.

---

## 2026-04-07 — Typography floor: 12px minimum across the app

**Decision.** Every 10px and 11px font-size in the codebase was bumped to 12px+ across 25+ components in one sweep.

**Why.** 10-11px is below most accessibility guidance for body text and gets punishing on high-DPI phones in outdoor light. The app is used on phones by people who are trying to decide what to play, which often means eyes-tired, end-of-day conditions. Readability is a quiet but cumulative quality gate — every individual 10px use looked "fine" in isolation, but the aggregate was making the app feel cramped.

**Rejected.**
- **Keep 10-11px for secondary metadata.** Would perpetuate the drift. A floor rule only works if it's a floor.
- **Add a user-controlled font-size toggle only.** Does nothing for the default experience most users see.

**How to apply this.** 12px is the floor. Do not introduce new 10px or 11px sizes unless there is a specific, reviewed reason. The comfortable text-size toggle (also shipped Apr 7) is an *additional* bump on top of the floor, not a replacement for it.

**Evidence.** Apr 7 session memory "Typography pass" section.

---

## 2026-04-06 — Playing Now cap is 3 games, enforced at every entry point

**Decision.** A user cannot have more than 3 games in the Playing Now state. The cap is enforced at every entry point: `moveGameForward`, Reroll, StalledGameNudge, FinishCheckNudge, JustFiveMinutes, playAgain. Hitting the cap surfaces a "pick one to finish or move on" nudge.

**Why.** Playing Now is supposed to mean "games I am *actually* playing right now." Without a cap, users drift into marking 10+ games as Playing Now, which defeats the purpose of the state — it turns into a soft wishlist and the shelf loses its meaning. Three is small enough to force a real choice and large enough to accommodate "main game + palate cleanser + something with a friend."

**Rejected.**
- **No cap.** Was the default and immediately drifted in testing.
- **Cap = 1.** Too restrictive. Real players genuinely rotate between 2-3 games.
- **Cap = 5.** Numerically within range but large enough to re-enable the drift problem.
- **Enforce the cap in one place.** Users can enter Playing Now from six different UI flows. Enforcing centrally was the only way to stop leaks.

**How to apply this.** If a new flow lets a user mark a game as Playing Now, it must go through the same cap check. No direct state writes. When in doubt, check the existing entry points as reference.

**Evidence.** Apr 6 session memory "Deploy 5" section.

---

## 2026-04-06 — Skip tracking thresholds: 3+ = penalty, 5+ = soft-ignore

**Decision.** When a user skips a game during reroll, the count is tracked in localStorage. At 3+ skips, the game gets a 50% weight penalty in future rolls. At 5+ skips, it is soft-ignored (eligible for the pool but almost never picked). A reset button appears in the game detail view at 3+ skips so users can undo accidental penalties. A 💤 indicator shows on soft-ignored cards.

**Why.** Without tracking, the reroll kept surfacing games the user had already rejected, which trained them to distrust the picker. Hard-hiding a game at 1 skip would feel over-eager — sometimes users skip because the mood doesn't fit *today*, not because they hate the game. The 3/5 two-step gives a soft signal first (penalty) and a strong signal second (soft-ignore), with an escape hatch if the user wants to give it another chance.

**Rejected.**
- **Hard-hide at first skip.** Too aggressive. Trains the user to be afraid of skipping.
- **Single threshold.** Loses the "soft signal first, strong signal second" behavior.
- **No reset affordance.** Users would feel trapped by their own accidental skips.

**How to apply this.** The 3/5 thresholds are tunable but changing them requires thinking about what the user is telling you with a skip. Don't change them just because "5 feels high" — verify against actual user behavior if/when data is available.

**Evidence.** `lib/skipTracking.ts`, `lib/reroll.ts`, `components/Reroll.tsx`. Apr 6 session memory.

---

## 2026-04-05 — .claude tooling: path-scoped rules and on-demand skills

**Decision.** Claude Code rules are path-scoped (loaded only when working in their area) and skills are on-demand (loaded only when explicitly invoked). The plan file was restructured for a 94% size reduction.

**Why.** The prior session crashed on an oversized context error. Everything that *could* be loaded *was* being loaded on every turn, which ate context and eventually crashed the session entirely. Path-scoped rules mean brand/voice rules only load when touching copy files, legal rules only load when touching data/feature files, etc. Skills are gated behind explicit invocation so the default context is small.

**Rejected.**
- **Keep everything global.** Crashed the session.
- **Shrink by deleting rules.** The rules are load-bearing — the problem wasn't their content, it was that they were all loading at once.
- **Lazy-load via summaries.** Summaries drift from reality. Full files scoped by path stays accurate.

**How to apply this.** New rules go in `.claude/rules/` with a path scope. New skills go in `.claude/skills/<name>/SKILL.md` and are invoked explicitly. Resist the urge to make things "always on" — that pattern is what crashed the session in the first place.

**Evidence.** `.claude/rules/`, `.claude/skills/`. Apr 5 session memory.

---

## 2026-04-04 — "Bailing on a game is a decision" becomes the brand thesis

**Decision.** The product officially celebrates the act of *deciding not to play a game*, not just the act of finishing it. The language evolved over the next weeks (Apr 8: "Give up" → "Not for me"; Apr 9: "bail" retired, "Moved On" locked), but the *principle* was crystallized in a Discord conversation between Brady and Nate on Apr 4.

**Why.** The origin is a raw, unfiltered quote from Brady explaining the app to Nate:

> *"celebrating bailing on a game — that's a decision that's been made. i'm not gonna play that or try. that's a win. that's progress"*

and:

> *"we help you make the decision so the identity pressure you may or may not be subconsciously feeling is lifted"*

This is the emotional payload of the entire product. Users who hoard games feel identity pressure — the "I should play this" that outlasts the desire to play it. Most tracker apps either ignore that pressure or amplify it with guilt mechanics. Inventory Full's differentiation is that it names the pressure and gives the user permission to put the game down.

**How to apply this.** Any feature that touches the move-on flow, the celebration flow, or any UI where a user declines a game should be measured against this principle: does it *lift* identity pressure, or does it *add* it? "Sure you want to quit?" adds pressure. "Moving on is deciding too." lifts it.

**Note on provenance.** These quotes came out of an unscripted DM conversation, not a brand doc. That's part of the point — the thesis is what Brady says when he's not trying to write marketing.

**Evidence.** `feedback_discord_nate_apr2026.md` in the prior-session memory. Downstream: Apr 8 "Not for me" label, Apr 9 "bail" retirement and "Moved On is deciding too" step-3 copy.

---

## 2026-04-03 — "What Should I Play?" must dominate the main page; everything else is secondary

**Decision.** The main page is not a dashboard. It is a decision surface. The "What Should I Play?" action gets the gravitational center of the page. Stats panel, Pile Collector, library value, daily burn rate, quick sort, shelves, filters — all secondary, collapsible, or below the fold.

**Why.** An external product review flagged that the main page was doing too many jobs at once, and the density was fighting the app's own thesis. The product's axiom is *"spend less time here, more time playing."* A dashboard with eight equal surfaces on first load makes the user spend orientation time parsing the UI before they can even start the action that would get them out of the app. That is a direct contradiction of the core loop.

**Rejected.**
- **Treat the dashboard as a destination.** Competitor apps (tracker-style) do this. It is the wrong pattern for this product because we don't *want* to be a destination.
- **A/B test layouts.** Not enough users yet for A/B anything. The decision is a principle, not a metric question.

**How to apply this.** When building any new main-page feature, ask: does it compete with "What Should I Play?" for attention? If yes, it belongs behind progressive disclosure (collapsible section, secondary tab, below the fold). The roll modal and celebration modal get high emotional register — the main page should either match that register around the decision action, or stay flat and let the action stand alone.

**Evidence.** `project_external_review_apr2026.md` in the prior-session memory.

---

## 2026-04-02 — Anti-gamification: the goal is to get users OFF the app

**Decision.** Inventory Full will not optimize for time-in-app, streaks, endless feeds, or any engagement mechanic that keeps a user scrolling instead of playing. Features that add app-time without adding play-time are treated as suspect and reviewed against the core loop.

**Why.** This is the philosophical spine of the product and it is counter to almost every instinct the software industry teaches. Most apps are measured on DAU and session length, and gamification is the standard lever to improve both. For this product, those metrics would mean the product is failing — a user who spends twenty minutes in Inventory Full and then watches YouTube instead of playing a game is a user the product failed. The success metric is the opposite: user opens app, makes a decision, closes app, plays a game, comes back only when they need the next decision.

Brady and Nate independently arrived at the same framing: *"easy to lure someone INTO an app. hard to get them OUT of it."* The hard problem — and the defensible one — is the OUT part.

**Rejected.**
- **Streaks.** "Play every day!" mechanics are the canonical anti-pattern. Would turn the app into homework and punish users for skipping a day.
- **Endless feed of recommendations.** "Infinite scroll" for games is scroll-paralysis dressed up as choice.
- **Push notifications to drive return visits.** Would violate the thesis AND trigger the legal-compliance "requires explicit opt-in" rules.
- **Leaderboards, social compare, productivity-dungeon stats.** All turn the app into a new backlog.

**How to apply this.** Run `/feature-creep-audit` before adding features that could slide into engagement-bait. If a proposed feature's success metric is "user spends more time in the app," that is a signal to reject or redesign. The design principle baseline: *every extra minute in Inventory Full should justify itself against a minute that could have been spent playing.*

**Evidence.** `feedback_discord_nate_apr2026.md`, `project_competitive_analysis_apr2026.md`. Encoded as `.claude/rules/brand-messaging.md` "The Anti-Overgamification Stance" section.

---

## 2026-04-02 — Moat is decision quality and momentum, not tracker features

**Decision.** When prioritizing features, weight decision-engine and momentum loop features over tracker/social/organization features. The competitive moat is positioning + decision quality, not feature-checklist parity with trackers.

**Why.** An external competitive analysis found that Inventory Full's moat was thin — positioning and tone were differentiated, but the *product* was uncomfortably adjacent to existing trackers (Backloggd, Grouvee, GameTrack) and recommendation engines (Playbacklog). The strategic danger was drifting into "another tracker with a nicer tone," where every new tracker feature (shelves, stats, sorting, social) moves the product toward commodity and erodes the thing that actually differentiates it.

Five moat-building areas were ranked by defensibility:
1. Decision quality (inference-based, not just random filters)
2. Momentum design (nudges, return loops, progress visibility)
3. Payback/value framing
4. Low-friction triage (import-to-playing speed)
5. Humane tone

Tracker features (better shelves, more sort options, social compare, import more platforms) rank *nowhere* on this list. They are commodity features. Every hour spent on them is an hour not spent on the moat.

**How to apply this.** Before building a proposed feature, ask: *"Does this make our recommendations smarter or our momentum loop stickier?"* If the answer is no, it's a tracker feature and deprioritize. Exception: foundational features that unblock the moat (import flows, basic library management) are worth shipping but shouldn't expand beyond what the moat needs.

**Evidence.** `project_competitive_analysis_apr2026.md` in the prior-session memory.

---

## 2026-04-01 — No manual categorization: the app infers, users don't tag

**Decision.** Users never have to manually pre-tag, pre-categorize, or pre-organize games in their library before the app can help them. Mood tags, session length, quality signals, and shelf assignments are auto-inferred from public data (RAWG for genres → moods, HLTB for session length, Metacritic for quality). Users query by mood/time at the *point of decision*, not by organizing their library up front.

**Why.** Brady tested the app as a new user and discovered that mood filters, time tiers, and shelves all required manual per-game assignment to be useful. The dropdowns did nothing. Filters showed empty results because nothing was pre-tagged. A user with 300 games was being asked to do 300 small categorization tasks *before* the app would help them. That is the exact opposite of the product's promise, and Brady named it precisely: *"micromanagement porn disguised as pile clearing."*

This is the single biggest paradigm shift in the app's history and almost every feature decision since has followed from it.

**Rejected.**
- **Manual tags with "helpful" prompts.** Still asks the user to do work they will never do.
- **Onboarding flow that asks users to tag their top 10.** Still work. Still a drop-off.
- **Hybrid: auto-infer with "correct me if I'm wrong" prompts.** The correction prompts become their own micromanagement surface. Trust the inference.

**How to apply this.** Any proposed feature that requires users to manually categorize, rate, tag, or organize games on a per-game basis gets immediate scrutiny. The burden of proof is high: the feature must either (a) be completely optional with zero impact on the core flow if skipped, or (b) be auto-populated from public data with user correction as an edge case.

**Follow-on.** This decision is what made enrichment (RAWG, HLTB, Metacritic) load-bearing infrastructure instead of a nice-to-have. If enrichment breaks, the core loop breaks. See `docs/scale-up-plan.md` for the sustainability tiering around enrichment API limits.

**Evidence.** `feedback_no_manual_categorization.md` in the prior-session memory. Downstream: every mood/time/quality signal in the app is auto-populated; the mood picker at pick-time is the only user-facing categorization surface and it acts on a single game, not the whole library.

---
