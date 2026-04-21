# Voice Charter — Inventory Full

**This is the canonical, enforced voice guide.** Read this first. The long-form
reference docs (`voice-and-tone.md`, `brand-messaging.md`, `user-psychology.md`)
still exist and go deeper on specific questions, but this charter is the
ship-or-don't-ship bar for any user-facing copy.

Short on purpose. A long rulebook decays into a decoration. This one stays
memorable enough to actually hold in your head while writing.

---

## The voice, in three sentences

A gaming buddy who roasts you with warmth, never judgment. We acknowledge your
decision paralysis and backlog guilt without shame-framing — we make action
feel safe and progress feel real. Every interaction prioritizes getting you
playing over keeping you in the app.

---

## Five principles

1. **Roast with warmth, never punch down.** We're in on the joke WITH the user, never AT them.
2. **Confidence over hedge in action moments.** CTAs and pick delivery are imperative and short. No "maybe," "might," "feel free."
3. **Never sound like AI.** Vary sentence length wildly. Take positions. Skip transitions when the connection is obvious. If it reads like a LinkedIn post, rewrite.
4. **Empathy over shame.** The user is overloaded, not lazy. Motivation through reassurance, never guilt.
5. **Celebrate action, not just completion.** Moving On, Up Next, Playing Now — every forward step gets a small warm acknowledgement.

---

## Canonical exemplars — if it reads like these, ship it

Point at shipped lines, not abstractions:

- `lib/archetypes.ts` — *"Your backlog has a backlog."*
- `components/CompletionCelebration.tsx` — *"You committed, you followed through. That's the whole game."*
- `components/Reroll.tsx` — *"The pile just got smaller. Go."*
- Landing page — *"We'll help you pick. You do the playing."*
- Moving On status — *"Moving on is deciding too. [Game] isn't going anywhere."*

When in doubt, draft three candidates and pick the one closest to these in rhythm and confidence.

---

## The two intentional exceptions (most-asked questions)

### "Help" language: marketing vs. fulfillment

- **Landing / onboarding / invitation surfaces:** "We'll help you pick." "Help" is correct here. The reader hasn't opted in yet. Warmth beats strength.
- **Pick moment / in-product delivery:** "Here's your game." "We pick. You play." No hedging. Once they've asked for a pick, soft language is the enemy.

Both are psychologically correct for their context. This is not a rule violation; it's an intentional split. Locked 2026-04-21.

### "Moving On" is a protected canonical moment

Treat Moved On with the same gravity as Completed. Never frame it as failure. The anchor line is **"Moving on is deciding too."** Variations are fine; the sentiment is locked. This is the single strongest lever against commitment avoidance in the app — don't dilute it.

---

## Locked terminology

Never deviate without updating this charter.

### Status cycle (user-facing)
**Backlog → Up Next → Playing Now → Completed** (or **Moved On** as sibling exit)

Retired labels (do not reintroduce): Buried, Play Next, On Deck, Queue, Active, Cleared, Beaten, Bailed, Dropped, Abandoned.

### Taglines
- **Primary:** `get playing.` (lowercase, with period). Use everywhere.
- **Landing subhead:** "Your backlog's not gonna play itself."
- **Celebration/share only:** "Less shame. More game."
- **Retired:** "Stop stalling. Get playing." — do not reintroduce.

---

## Banned patterns — the short list

A full vocabulary list lives in `voice-and-tone.md`. Most of it isn't memorable. These are the patterns that kill a draft and you can hold in your head:

- **LinkedIn vocab:** leverage, landscape, paradigm, seamless, robust, unlock, elevate, dive into. If you'd never say it at a bar, don't write it.
- **Em dashes for drama.** Use a period.
- **"That's not X, that's Y"** reframes. Once per piece max. Three times confirms AI.
- **Triple adjective lists** ("sleek, powerful, and intuitive").
- **Uniform paragraph lengths.** If every paragraph is 3-5 sentences, it's AI. Mix a fragment, an eight-sentence run, a two-word line.
- **Performative empathy** ("That's a great question!") and **sycophantic openers** ("Absolutely!").
- **Summary closers** ("In conclusion," "Ultimately,"). End somewhere unexpected.
- **Hedging in CTAs** ("Maybe pick one?"). Imperatives only.

---

## The test

Read the copy aloud. If you can read it in a steady metronomic voice without speeding up or slowing down, the rhythm is flat. Rewrite. Then ask: could anyone have written this? If yes, it's not done.

---

## What to do with this

Before shipping any user-facing copy:
1. Match it against the five principles.
2. Compare rhythm to the canonical exemplars.
3. Scan for banned patterns.
4. Read it aloud.

That's the gate. Anything deeper — specific vocab debates, psychological rationale, messaging hierarchy — lives in the reference docs. Don't load them unless you need them.

---

## Reference docs (deep-dive only)

- `.claude/rules/voice-and-tone.md` — full banned vocabulary list, structural patterns, emotional patterns
- `.claude/rules/brand-messaging.md` — messaging hierarchy, positioning, social copy examples
- `.claude/rules/user-psychology.md` — research foundations (Iyengar, Schwartz, Sweller, Brehm, Kahneman, Amabile) — the *why* behind the voice

When they contradict this charter, **the charter wins.** Flag the conflict and I'll reconcile.

---

*Locked 2026-04-21. Supersedes voice-and-tone.md + brand-messaging.md as the primary enforcement gate. Deploy gates check this file.*
