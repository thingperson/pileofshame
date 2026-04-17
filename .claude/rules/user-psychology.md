# User Psychology — Research-Grounded Decision Framework

This rule is loaded every session. It applies to copy, UX decisions, feature design, and anything that touches how users feel when interacting with Inventory Full.

**Why this exists:** We were guessing at user psychology. This file grounds our decisions in published behavioral science so we stop reinventing the same "does this feel right?" debate every sweep.

---

## Who we're building for (the psychological profile)

Our user is not a lapsed gamer or a casual shopper. They're someone who:

1. **Owns more games than they can play** — often dozens to hundreds. The library itself is a source of guilt, not excitement.
2. **Experiences decision paralysis at play time** — they sit down to play, open a launcher, browse for 20 minutes, close the launcher, do something else.
3. **Has sunk cost on unplayed games** — real dollars spent, possibly via sales/bundles. The unplayed library represents money and time loss.
4. **Feels judged by backlog culture** — "pile of shame" framing is internalized even when users reject it verbally.
5. **Wants to play, not to catalogue** — they did not come to us to spreadsheet their library. They came because they couldn't decide.

This is a population with **analysis paralysis, mild shame, and commitment avoidance.** Every design decision should be tested against that profile, not against a generic "engaged user."

---

## Core research foundations

### 1. Choice overload (Iyengar & Lepper, 2000)

*"When Choice is Demotivating: Can One Desire Too Much of a Good Thing?"* — Journal of Personality and Social Psychology, 79(6), 995–1006.

Key finding: in the famous jam study, shoppers shown 24 jam varieties were ~10× less likely to purchase than shoppers shown 6. More choice reduced both action and satisfaction with the choice eventually made.

**Implication for us:** A library of 100+ games IS the jam wall. Our job is to reduce the choice set to 1 — not 5, not "top picks." One decision. The user's hesitation is cognitive, not preferential.

**Derived rule:** *We pick ONE game. We do not surface a shortlist and ask them to pick from it. Rerolls are for "not right now" not "let me browse options."*

### 2. Paradox of choice (Schwartz, 2004)

*The Paradox of Choice: Why More Is Less* — Barry Schwartz.

Key finding: more options increase regret and second-guessing even after a decision is made. "Maximizers" (trying to find the best option) are less satisfied than "satisficers" (accepting good enough). Exposure to alternatives after choosing creates post-decision regret.

**Implication for us:** Even after we pick, users can spiral if we show them what they could have played instead. The pick must feel confident. A weak pick with disclaimers ("maybe try this?") reintroduces the problem we're solving.

**Derived rule:** *Present picks with confidence, not hedging. "Here's your game." not "You might like this one?" Rerolls are explicit user action, not a suggestion.*

### 3. Cognitive load theory (Sweller, 1988 and successors)

Key finding: working memory is finite (~4 chunks). UI elements, copy density, and decisions all draw from the same pool. Excess load causes abandonment regardless of intent.

**Implication for us:** Every extra question at pick-time is a tax on the exact cognitive resource that's already depleted (that's why they came to us). Mood + time = two inputs. That's the ceiling.

**Derived rule:** *Pick flow must stay at 2 inputs max. Any new variable (genre, platform, mood sub-filter) must displace an existing one, not add to it.*

### 4. Reactance theory (Brehm, 1966) + Self-Determination Theory (Deci & Ryan, 1985)

Key findings: when users feel their freedom of choice is threatened, they push back — even against options they'd otherwise accept. Command language ("You must", "You should") triggers reactance. Separately, Self-Determination Theory identifies autonomy (felt agency) as a basic psychological need; interventions that preserve autonomy outperform those that override it, even when the override is objectively "correct."

**Implication for us — and a nuance we had to earn:** our user knows they *should* be able to decide. The fact that they can't makes them feel slightly dumb. Telling them "We pick" risks reading as *"because you can't,"* which pokes that shame. "We help you pick" is warmer partnership framing — it preserves their agency while still removing most of the decision burden. Choice-overload research says delegate the decision. SDT/reactance research says preserve autonomy. The resolution is context-dependent:

- **Marketing / landing copy (invitation context):** lead with "help" language. The reader hasn't opted in yet; they're evaluating whether we'll respect them. Warmth > strength here.
- **In-product pick delivery (fulfillment context):** drop "help." Once they've asked for a pick, hedged language ("maybe try this?") becomes the enemy. Deliver with confidence: "Here's your game."

**Derived rule:** *Landing uses "we help" framing. The pick moment itself uses "here's your game" confidence. Both are research-backed; they serve different stages of the relationship. Never lecture users for not playing.*

### 5. Commitment avoidance & loss aversion (Kahneman & Tversky, 1979)

Key finding: losses loom ~2× larger than equivalent gains. Starting a new game = committing 20+ hours = potential loss if the game doesn't land. This is why unplayed libraries grow.

**Implication for us:** Starting a game feels risky. Moving on from a game feels like admitting the purchase was a loss. Both need to feel low-stakes and reversible.

**Derived rule:** *"Moved On" exists specifically to neutralize the loss. Never frame moving on as failure. Celebrate it as equal to completing. "Moving on is deciding too" is the canonical line.*

### 6. Action bias & progress loops (Amabile & Kramer, 2011)

*The Progress Principle* — small wins compound. Users who experience a single meaningful action early are dramatically more likely to return.

**Implication for us:** First pick → play must happen in one session. The landing/onboarding job is one thing: get them to a picked game and the "start playing" moment, fast.

**Derived rule:** *Sub-60-second path from import to pick. Everything in the UI must serve that loop or get cut.*

---

## Applied: copy decisions derived from research

These are not stylistic preferences. They're downstream of the research above.

### "We pick" vs "We help pick"

**Research says:** analysis-paralysis populations benefit from assertive delegation. "Help" reintroduces the user as a decision-maker, which is the exact role they wanted to shed.

**Our choice:** "We pick. You play." / "We pick. You get playing." "Help" is banned in the pick flow copy.

### "We'll pick the game. You do the playing."

**Research says:** clear role division reduces cognitive load. Two short independent clauses = two chunks = low load. Confident framing avoids reactance as long as the surrounding context is voluntary.

**Verdict:** psychologically sound. "Do the playing" reads slightly soft vs "get playing" which has action-verb energy. Both defensible. Preference: "We pick. You get playing." echoes the locked tagline "Get playing." for brand reinforcement.

### "Pile of shame" language

**Research says:** shame framing increases avoidance, not action. Self-criticism reduces self-regulation capacity (Neff, 2003 — self-compassion research).

**Our choice:** We acknowledge the backlog reality without naming it shame. "Less shame. More game." is a directional rejection of that culture, not an endorsement. Never imply the user should feel bad.

### "Moving on is deciding too"

**Research says:** reframing loss as agency converts avoidance into action. Naming a positive identity for the action users feel guilty about is directly supported by identity-based motivation literature (Oyserman).

**Our choice:** Preserve this line. It does meaningful work.

### Confident vs hedging CTAs

**Research says:** decision-depleted users need low-friction, confident affordances. Hedging language ("maybe try", "you might like") reintroduces decision work.

**Our choice:** Primary CTAs are imperative and short. "Import My Library." "Pick My Game." "I Beat It." No question marks on CTAs.

---

## Sweep checklist — run this on any user-facing copy

Before shipping copy, test it against these six questions. Any "yes" on Q1–Q4 or "no" on Q5–Q6 is a flag.

1. **Does this add a decision the user didn't ask to make?** (e.g., showing a shortlist instead of a pick)
2. **Does this imply the user should feel bad?** (shame, lecture, judgment)
3. **Does this hedge the pick or action?** (maybe, might, if you want, feel free to)
4. **Does this expand choice when the user is in a pick-time flow?** (filters, options, alternatives)
5. **Does the user keep felt agency? Can they opt out without losing face?** (easy reroll, easy skip, easy move-on)
6. **Does this progress them toward playing in the current session?** (not "discovery", not "organizing", actual play)

---

## When psychology and business instincts conflict

Our commercial instinct will sometimes be to add: more features, more filters, more options, more notifications, more prompts. The research is clear: for our specific user, more = worse.

When in doubt, fewer inputs, more decisiveness, less noise. The job is one pick, fast, with dignity.

---

## Reference

- Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating. *JPSP*, 79(6), 995–1006.
- Schwartz, B. (2004). *The Paradox of Choice*. Harper Perennial.
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science*, 12(2), 257–285.
- Brehm, J. W. (1966). *A Theory of Psychological Reactance*. Academic Press.
- Kahneman, D., & Tversky, A. (1979). Prospect theory. *Econometrica*, 47(2), 263–291.
- Amabile, T., & Kramer, S. (2011). *The Progress Principle*. Harvard Business Review Press.
- Neff, K. D. (2003). Self-compassion: An alternative conceptualization. *Self and Identity*, 2, 85–101.
- Oyserman, D. (2015). *Pathways to Success Through Identity-Based Motivation*. Oxford University Press.

Related internal docs:
- `.claude/rules/voice-and-tone.md` — how we sound
- `.claude/rules/brand-messaging.md` — what we say
- `.claude/rules/deploy-gates.md` — when to run this sweep
