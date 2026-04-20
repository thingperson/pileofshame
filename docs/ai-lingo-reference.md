# AI Lingo Reference — Consolidated

All AI-voice / anti-AI-slop content copied verbatim from the project's rule and skill files. Nothing cut, nothing paraphrased. Use this as a single-pane reference when editing copy or running a sweep.

**Sources:**
- `.claude/rules/voice-and-tone.md` (§3 Never sound like AI)
- `.claude/rules/deploy-gates.md` (§2 Voice/AI lingo sweep)
- `.claude/skills/deploy/SKILL.md` (Voice/Lingo Sweep section)
- `.claude/skills/pre-push-review/SKILL.md` (§2 Copy & Voice Review — AI hallmark terms)

---

## 1. From `.claude/rules/voice-and-tone.md` — §3 "Never sound like AI"

### 3. Never sound like AI

AI text is identifiable at five layers: vocabulary, sentence rhythm, structural patterns, emotional register, and cognitive fingerprint. Fixing only one layer (swapping flagged words) doesn't work — all five must be addressed.

#### Banned vocabulary

**Verbs:** delve, utilize, leverage, harness, underscore, foster, streamline, optimize, bolster, embark, illuminate, navigate (metaphorical), spearhead, facilitate, augment, endeavor, encompass, amplify, cultivate

**Adjectives:** pivotal, robust, innovative, seamless, cutting-edge, groundbreaking, multifaceted, nuanced, comprehensive, meticulous, intricate, vibrant, invaluable, transformative, compelling, unparalleled, bespoke

**Nouns:** landscape, tapestry, realm, synergy, underpinnings, testament, beacon, cornerstone, catalyst, paradigm, interplay, intricacies, trajectory, framework, ecosystem

**Adverbs:** moreover, furthermore, notably, importantly, consequently, additionally, fundamentally, effectively, ultimately, significantly, profoundly

**Phrases:** "in today's [fast-paced/ever-evolving] world", "it's important to note", "it's worth noting", "at its core", "in the realm of", "a testament to", "a rich tapestry", "serves as a [beacon/cornerstone/catalyst]", "not just X but Y", "here's the thing", "here's the kicker", "the bottom line", "let's break it down"

No single word is proof of AI. The signal is **frequency and clustering**. One "furthermore" is fine. "Furthermore" and "moreover" and "notably" in the same paragraph is a tell.

#### Banned structural patterns

- Em dashes for dramatic pauses. Use periods, colons, or hyphens instead.
- "That's not X, that's Y" reframes (e.g., "That's not a backlog, that's a graveyard"). Once is fine. Twice is suspicious. Three times confirms AI.
- "Whether you're X or Y" constructions
- Triple adjective lists ("sleek, powerful, and intuitive")
- Starting sentences with "Ah," or "Well,"
- Opening with broad context ("In today's rapidly evolving...")
- Closing with summary ("In conclusion...", "Ultimately...", "By following these strategies...")
- Transition words between every paragraph ("Furthermore," "Moreover," "It's also worth noting")
- The mic-drop closer on every section ("And that changes everything." / "That's the whole game."). One per piece, max. The technique dies on repetition.
- Excessive bolding of key terms in running prose
- Hedging everything ("some argue," "it depends on context," "there are various perspectives"). Take positions.
- Symmetrical enthusiasm — being equally excited about everything. Real writers have actual preferences.
- Uniform paragraph lengths. If every paragraph is 3-5 sentences, it's AI. Vary wildly: one sentence, then eight, then three, then a fragment.

#### Banned emotional patterns

- Performative empathy: "That's a great question!" / "I completely understand your frustration." Real empathy is specific, not generic.
- Sycophantic openers: "Absolutely!" / "What a thought-provoking question!" These communicate nothing.
- Excessive validation — never disagreeing, always "building on" ideas. We have opinions. We state them.
- "Dive into", "Elevate your", "Unlock the power of"

#### What human writing does that AI doesn't

- Varies sentence length wildly. A three-word sentence followed by a forty-word run-on followed by a fragment.
- Starts mid-thought. Trusts the reader to orient themselves.
- Ends somewhere unexpected instead of summarizing.
- Skips transitions when the connection is obvious. The reader isn't stupid.
- Takes specific positions that risk disagreement.
- Includes odd details that don't serve the argument but serve the truth.
- Uses actual spoken vocabulary — slang, shorthand, references only your people get.
- Leaves something imperfect. A half-formed thought. A parenthetical that goes nowhere.

#### The test

Read the copy aloud. If you can read it in a steady metronomic voice without speeding up or slowing down, the rhythm is flat. Rewrite until it has hills and valleys. Then ask: could anyone have written this? If yes, it's not done.

---

## 2. From `.claude/rules/deploy-gates.md` — §2 "Voice/AI lingo sweep"

### 2. Voice/AI lingo sweep (if any user-facing copy changed)
Run the voice sweep from the deploy skill. Grep changed files for banned patterns:
- "You don't X, you Y" / "That's not X, that's Y" / "You're not X, you're Y"
- Em dashes for dramatic pauses
- "Dive into" / "Elevate" / "Unlock the power of" / "Whether you're"
- Banned words: "delve", "tapestry", "landscape", "journey"
- "Ah," / "Well," openers
- Triple adjective lists
- Overly parallel "You X. You Y. You Z." structures

This is non-negotiable. The user has explicitly requested this runs on every deploy with new copy.

---

## 3. From `.claude/skills/deploy/SKILL.md` — "Voice/Lingo Sweep (Mandatory for Copy Changes)"

## Voice/Lingo Sweep (Mandatory for Copy Changes)

Run this on EVERY deploy where user-facing copy was written or modified. This is non-negotiable.

### What to check
Grep all changed files with user-facing strings for these banned patterns (from `.claude/rules/voice-and-tone.md`):

1. **"You don't X, you Y"** / **"That's not X, that's Y"** / **"You're not X, you're Y"** — the most common AI tell. Grep for: `You don't |You're not |That's not `
2. **Em dashes (—) for dramatic pauses** — use periods, colons, or commas instead. OK as UI placeholder for empty values.
3. **"Dive into" / "Elevate your" / "Unlock the power of"** — generic marketing slop
4. **"Whether you're X or Y"** — hedge-y AI construction
5. **Banned words in copy**: "delve", "tapestry", "landscape", "journey" (unless about the game Journey)
6. **Starting with "Ah," or "Well,"** — filler AI openers
7. **Triple adjective lists** ("sleek, powerful, and intuitive")
8. **Overly parallel structures** — "You X. You Y. You Z." in sequence

### How to run it
```bash
# Check changed files for the most common violations
git diff --name-only HEAD~1 | xargs grep -n "You don't \|You're not \|That's not \|— \|dive into\|delve\|tapestry\|landscape\|journey\|Whether you're\|Ah,\|Well," 2>/dev/null
```

Or use `Grep` tool on each changed file. Focus on string literals and JSX text, not code comments.

### Judgment calls
Not everything flagged is a violation. The voice guide encourages personality, roasts, and wit. "The backlog fears you now" is personality, not AI slop. Use judgment: the test is "would a human gaming buddy say this, or does it sound like ChatGPT wrote a marketing page?"

---

## 4. From `.claude/skills/pre-push-review/SKILL.md` — §2 AI hallmark mentions

## 2. Copy & Voice Review
- Scan all component files (components/*.tsx) for user-facing strings
- Flag any text that violates the voice guide at .claude/rules/voice-and-tone.md:
  - Em dashes used for dramatic pauses (should be periods, colons, or hyphens)
  - "That's not X, that's Y" constructions
  - AI hallmark words: "delve", "tapestry", "landscape", "journey", "elevate", "unlock"
  - TikTok/Gen-Z slang that doesn't match our "witty adult gamer" voice
  - Dismissive text in help/onboarding contexts
