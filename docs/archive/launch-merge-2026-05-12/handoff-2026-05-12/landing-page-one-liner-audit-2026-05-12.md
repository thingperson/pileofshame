# Landing page one-liner audit — 2026-05-12

**Status:** Notes and recommendations. Not a copy file — these are decisions to make before editing `app/page.tsx`.

Based on review of the current inventoryfull.gg landing page screencap from 2026-05-12.

---

## The problem

The page has too many competing positioning lines. New visitors don't read all of them. They read the hero, scan one or two more, and form a mental model of what the product is. If those models conflict, they leave confused.

## Inventory of one-liners currently in play

| # | Line | Where it lives | Role it's trying to play |
|---|------|----------------|--------------------------|
| 1 | "Your backlog isn't the problem. Deciding is." | Landing hero | Brand promise / thesis |
| 2 | "get playing." | Logo tagline | Verb / action prompt |
| 3 | "Your library feels more like it's playing you. It should be the other way around." | Landing subhead | Problem framing |
| 4 | "Your pile's not gonna play itself." | Launch bible (subhead alt) | Casual brand voice |
| 5 | "Less time in the app = success." | Launch bible (internal axiom) | Anti-engagement positioning |
| 6 | "Skip the overthinking. Just tap a vibe." | Section header on landing | Sample picker intro |
| 7 | "Tonight's answer" | Sample card label | UI moment |

Seven distinct framings for one product. Four of them (hero, subhead, "get playing", section header) are on the page right now and visible without scrolling.

## What survives

**Hero: "Your backlog isn't the problem. Deciding is."** Keep as is. This is your strongest line. It reframes the reader's relationship to their own behavior in one move, which is what your best brand work does (Moon Cheese "what the hell is Moon Cheese" lineage). Don't touch.

**Logo tagline: "get playing."** Keep as is. Small, persistent, lowercase, period. It's a verb in the imperative, which complements the hero's diagnostic framing. They don't compete because they're doing different jobs.

## What to cut or rework

**Subhead: "Your library feels more like it's playing you. It should be the other way around."** Borderline. The "it should be the other way around" is doing the same work as the hero ("deciding is the problem"). Redundant. Either cut the subhead entirely (let the hero breathe) or replace it with a line that supports the hero rather than re-arguing it.

Suggested subhead alternatives that ladder up rather than restate:

- "Pick one game in 30 seconds. Play it or move on. Either way, you're past the hard part."
- "Two questions. One game. The deciding part is the part you outsource."
- (or just delete and let the hero stand alone — sometimes the strongest move)

**Section header: "Skip the overthinking. Just tap a vibe."** Different tonal register from the hero — more casual, more consumer-pop. It also competes with the hero by offering a different thesis ("overthinking is the enemy" vs. "deciding is the problem"). Same underlying point, different language, dilutes both.

Suggested replacements that ladder up to the hero:

- "One tap. One game. Go."
- "Try it on a sample library first."
- "Pick a mood. See what fits."

The third one is the safest — describes the action rather than re-arguing the thesis.

**UI moment: "Tonight's answer"** Fine. It's working as UI copy. No action needed.

## What's missing

**Decision-engine specifics.** The page doesn't communicate that the picker is actually weighted (mood, time, skip history, genre cooldown, completion proximity, "Why This Game?" reasoning). Visitors who try it once and see a pick may assume it's random — same reflex they have for Steam Roulette or Backlog Roulette. A small line near the picker — "weighted by your skip history, genre cooldown, and recent activity" — would address the predictable "is this just a random picker?" objection that comes up in every comment thread.

**Smart Import is invisible from the landing page.** The PostImportSummary moment ("Your actual backlog is 155 games, not 200") is the most defensible product moment in the entire app. It's a real emotional reframe and it happens on every import. The landing page doesn't hint that it exists. Worth showing a snippet of it as a screenshot, or referencing it in a "what happens when you import" line — preferably both.

**Jump Back In is invisible from the landing page.** Same problem. The cheat sheet for stalled games (progress bar + genre-aware tips like "check your quest log" / "save before this fight") is one of the most differentiated features against every random-picker competitor. None of them have it. Worth a small section or a screenshot.

**Proof of use.** You've been using the app for three weeks. There's no testimonial-style line that says so. A small line near the bottom — "Brady, the guy who built this, has used it to actually play [GAME 1], finally start [GAME 2], and Move On from [GAME 3] in the last three weeks. The app is doing its job on its maker." — would do real work for credibility without sounding like a corporate testimonial.

## The product-depth tradeoff

This is the harder strategic call. The current page is light on features by design — your thesis is "less time in app = success" and a feature-list landing page contradicts that. So adding feature surfaces to the page risks the same anti-thesis problem you'd have with a "Pro tier."

The way out is: don't list features, show one feature in action. The PostImportSummary screenshot does this without making the page about features. It shows the reframe, which IS the thesis, applied to the user's actual library. Same with a Why This Game? chip set — it's not a feature, it's a glimpse of the picker thinking visibly.

The competitive landscape doc identifies your durable edge as "thesis discipline." The landing page is currently disciplined to the point of underselling. The right move is one or two product-in-action screenshots that prove the thesis is implemented, not just stated.

## The single test for any new line

Does it ladder up to "Your backlog isn't the problem. Deciding is."? If yes, keep. If it offers an alternate framing, cut. Two framings dilute each other.

## One more thing

The bottom signup form copy ("Hear when we ship something good. Occasional updates. No spam. Unsubscribe whenever.") is in your voice. Honest, direct, low-friction. That's the tonal calibration the rest of the page should match. Not louder. Not more enthusiastic. That.

Use that line as the reference when editing anything else on the page. If a new line sounds bigger or punchier than that, it's probably trying too hard.

---

## Priority order if you can only do one pass

1. Delete the subhead OR replace it with one of the three alternatives above (15 min)
2. Replace the "Skip the overthinking" section header (5 min)
3. Add the decision-engine specifics line near the picker (10 min)
4. Add a PostImportSummary screenshot somewhere on the page — labelled or unlabelled, your call — to prove the thesis is implemented, not just stated (20 min including capturing the screenshot from your own import)

Total time: ~50 minutes. These four changes make the page cleaner AND more credibility-bearing without rewriting it.
