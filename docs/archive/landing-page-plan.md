# Landing Page Plan — Inventory Full

## Product Thesis

Inventory Full should shorten the distance between wanting to play and actually playing. The landing page exists to make that obvious in three seconds, then get out of the way.

---

## Hero Section — Copy Options

Three directions. Pick one, kill the others.

**Option A: The Direct Pitch**
> **You own 300 games. Let's pick one.**
> Import your library. Tell us your mood. We'll find your game.
> [Get Started]

**Option B: The Gentle Roast**
> **Your pile isn't going to play itself.**
> Inventory Full connects to your Steam, PlayStation, or Xbox library, figures out what you're in the mood for, and picks the game. You just have to hit play.
> [Import Your Library]

**Option C: The Empathy Play**
> **Too many games. Not enough decisions.**
> We get it. You scroll for 20 minutes, pick nothing, open YouTube. Inventory Full fixes that.
> [Show Me How]

All three follow the same structure: acknowledge the problem, hint at the solution, one CTA. No paragraphs. No feature lists. Subhead does the explaining, headline does the feeling.

See `.claude/rules/voice-and-tone.md` for tone guardrails. Warm, witty, slightly teasing. Never mean. Never corporate.

---

## Section Breakdown

### 1. Hero (above the fold)
- Headline + subhead + single CTA button
- Background: dark, game-library-ish texture or gradient. Not a screenshot of the app yet.
- No login/signup form in the hero. Just the button.

### 2. How It Works (the flow)
Four steps, horizontal on desktop, vertical on mobile. Icon or illustration per step.

1. **Import** — "Connect Steam, PlayStation, or Xbox. We grab everything."
2. **Enrich** — "We pull in descriptions, mood tags, and session lengths. You do nothing."
3. **Pick** — "Tell us your mood and how much time you've got. We find the game."
4. **Play** — "Clear it? Confetti. Bail on it? No judgment. Your pile, your rules."

Keep this tight. Four cards or panels, not a scrolling narrative. The "you do nothing" on step 2 is load-bearing: it communicates that this isn't a manual tagging tool.

### 3. The Picker Preview
One static screenshot or mockup of "What Should I Play?" in action. Show a real-looking game card with mood tags, session length, and the pick/skip buttons.

Don't show the full library view. New visitors don't care about data tables. They care about the decision moment.

### 4. The Close / Final CTA
> **Your pile's not getting any smaller.**
> [Get Started — It's Free]

Or:

> **200 games. Pick one. We'll help.**
> [Import Your Library]

Repeat the CTA. That's it. No footer essay.

---

## What to Show vs. What to Hide

**Show:**
- The picker ("What Should I Play?")
- Mood/time filtering concept
- Auto-enrichment (this is a differentiator: no manual work)
- Confetti celebration (screenshot or animation)
- Platform logos (Steam, PSN, Xbox)

**Hide:**
- Library management / shelf views (looks like every other tracker)
- Settings, archetype system, stats — these are depth features, not hooks
- Any complexity. The landing page should feel like the app has three buttons.

---

## Mobile Considerations

- Hero must work in one screen height. Headline, subhead, CTA. Nothing else.
- "How It Works" stacks vertically, one step per row
- Picker preview should be a phone-width screenshot, not a desktop one. Most people browsing will be on their phone even if they play on PC.
- CTA buttons: full width, sticky bottom bar on scroll? Maybe. Test it.

---

## What NOT to Build

- No video. Not yet. A video is a production project, not a landing page task.
- No testimonials. We don't have enough users to make these feel real.
- No pricing section. It's free.
- No feature comparison table. We're not competing with Backloggd on features.
- No animated walkthrough or interactive demo. Static screenshots are fine for v1.
- No newsletter signup. Either they use the app or they don't.
- No "about us" or team section. Nobody cares yet.

---

## Technical Approach

Two viable options:

**Option A: Conditional render on `/`**
If the user has no games (not logged in or empty library), show the landing page. If they have games, show the normal app. This is simpler and avoids route management.

Pros: one URL, returning users never see it, easy to maintain.
Cons: harder to share the landing page URL with someone ("go to inventoryfull.gg" might show the app if you're logged in).

**Option B: Separate `/welcome` route**
Landing page lives at `/welcome`. Root `/` always shows the app (with an empty state if no games). Marketing links point to `/welcome`.

Pros: shareable, testable independently, clear separation.
Cons: another route to maintain, redirect logic needed.

**Recommendation:** Option A with a manual escape hatch. Render the landing page on `/` when the user has no games. Add a small "What is this?" or "Learn more" link in the app footer/nav for logged-in users who want to share the page. If we need a stable marketing URL later, we add `/welcome` as an alias.

---

## Open Questions

- Do we want a "try it without signing up" flow? (e.g., paste a Steam profile URL, see what we'd recommend.) High effort, high conversion potential. Defer for now, note it.
- Header/nav: does the landing page share the app's nav, or get its own minimal one? Leaning toward minimal: logo + single CTA button. No hamburger menu.
- Dark mode only, or respect system preference? The app is dark. The landing page should probably match.
