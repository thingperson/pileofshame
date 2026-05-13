# Show HN draft — 2026-05-12

**Status:** Replaces the existing "Show HN" subsection in `LAUNCH_BIBLE.md` §5 Copy Bank.

**Voice sweep:** Scrubbed against `ai-lingo-reference.md`. No "not X, it's Y" reframes. No em-dashes for dramatic pauses. No "unlock"-family verbs. No triple-adjective lists. Parallel "Skip... Skip... Skip..." pattern broken on the third instance. One more read-aloud sweep recommended before posting (the metronomic test catches what grep can't).

**Pre-post checklist:**

- [ ] Fill in `[GAME 1]`, `[GAME 2]`, `[GAME 3]` with games you actually played through the app. Real names beat plausible names.
- [ ] Update `752` if your current Steam library count has drifted.
- [ ] Submit Tue or Wed, 8–10am PT (catches West Coast wake-up + EU afternoon).
- [ ] Submit the title + URL only. Post the first comment from your account within 60 seconds. This is the standard Show HN posting pattern.
- [ ] Be online and responsive for at least 4 hours after submission.

---

## Title options

Pick one before posting. Numbered by recommended order.

1. `Show HN: Inventory Full – I had 752 games and never played any of them, so I built this`
2. `Show HN: A backlog tool designed to make you use it less`
3. `Show HN: Inventory Full – mood-based game picker for your Steam/Xbox/PlayStation library`

Title 1 is the strongest hook for front-page traction. Title 2 is the most thesis-true. Title 3 is the most utilitarian and lowest-risk-of-snark. Recommend 1.

---

## First comment

Paste this immediately after the post appears.

> Three weeks ago I sat down after dinner to play something. Closed Steam thirty minutes later without starting anything. This was maybe the twentieth time it had happened that month.
>
> I have 752 games in my Steam library. Most came from sales I told myself were good deals. The library stopped being exciting and started feeling like an obligation. A warehouse full of beautiful things I'd never touch.
>
> I tried every backlog tracker I could find. They all wanted me to organize, tag, prioritize, list. Every minute I spent in those tools was a minute I wasn't playing. Then I noticed the actual problem. Organization wasn't going to fix this. The thing exhausting me was deciding.
>
> So I built the opposite of a tracker. Inventory Full takes your library (Steam, Xbox, PlayStation, or a Playnite CSV), asks how you feel and how much time you have, and picks one game. You play it or you don't. Moving on counts too.
>
> I'm a brand strategist. Seventeen years building consumer brands, zero years writing web apps before last month. I built the first working version in four days with Claude Code. I've kept building since. Around 90 shipped features and 20K lines of code, all going through a senior-engineer review skill before push. The four-day origin gets the headline but the work hasn't stopped. That's the part of the story everyone asks about and the part I find least interesting. Yes, the AI wrote most of the code. No, it didn't decide what to build. The hard problem was never the code. It was figuring out why a 700-game library makes you feel worse instead of better.
>
> The thesis I keep coming back to: your backlog is a collection of uncommitted possible selves. Boot Disco Elysium and you're choosing to be someone who sits with ambiguity. Hades is for who you are when you want friction. Stardew is for the version of you that's softer than you've been all week. Picking a game is picking an identity for the evening, and a list of 700 of those is paralyzing.
>
> The app commits for you. One pick at a time. Mood and time as inputs. Skip history, genre cooldown, completion proximity, and recent-activity bias as weights under the hood. Every pick comes with a "Why This Game?" line showing the actual reasons: metacritic score, time-fit, stalled-but-promising, mood match. The reasoning is visible. Skip a suggestion and the app reduces its weighting. After three skips it weights way down. Five skips and the game leaves the suggestion pool entirely. Finish something and there's a share card the app roasts you with, warmly. Stop halfway and the app counts that as a decision too. Moving On is its own status. The whole product treats giving up on a game as progress, because the alternative (sitting on a 700-game library you'll never touch) is the actual failure.
>
> Import does its own categorization. Games with 5+ hours played go to Up Next automatically (capped at 5, the rest stay in Backlog). Games where you've played past 130% of HowLongToBeat's main-story estimate go to Completed. The screen after import says: *"Your actual backlog is 155 games, not 200. We guessed 12 are already beaten and 5 are ready to jump back into. Wrong? Move them back anytime."* Most of what felt like overwhelm was completion bias.
>
> A few things I built in on purpose:
>
> - Less time in the app equals success. The metric I care about is people closing the tab and going to play. Every conventional engagement metric points the wrong direction here.
> - localStorage is authoritative. Cloud sync is opt-in. If our backend dies, your library is still on your device.
> - No account required to use it. No ads. No data sale. Free forever for the core. There's a tip jar.
>
> I've been using it for three weeks. Played [GAME 1], finally started [GAME 2] (the app's Jump Back In cheat sheet, with its progress bar and genre-aware tips like "check your quest log" or "save before this fight", got me past the re-entry friction), and Moved On from [GAME 3] when the app surfaced it after I'd been ignoring it for months. The Moved On column is the one I didn't expect to need. Giving yourself permission to put something down without finishing it turns out to be the move that lets you actually play other things.
>
> Stack: Next.js 16, React 19, Tailwind 4, Supabase (sync), Zustand, Sentry, Vercel. Public APIs only. Steam Web, OpenXBL, psn-api, Playnite CSV. PSN tokens are ephemeral, never persisted.
>
> inventoryfull.gg
>
> Happy to answer questions on the product thinking, the Claude Code workflow, why anti-engagement is the only honest thesis for this category, or anything else.

---

## What changed from the prior draft (LAUNCH_BIBLE.md §5 Show HN)

The prior draft (in the locked launch bible) led with library count and made the four-day-build the framing. This version:

- Leads with a specific moment (the closed-Steam-without-playing moment) rather than a stat.
- Defers the AI-build hook to the middle paragraph so it lands as a side note instead of the headline.
- Reframes "four days" honestly — the MVP was four days, then a month of building (~90 shipped features per `BUILD_HISTORY.md`). The "four days" framing alone now sells the product short.
- Makes the identity-overflow thesis load-bearing — the philosophical argument is the durable part of the post and what HN voters reward.
- Pulls real decision-engine specifics (skip thresholds, genre cooldown, completion proximity, recent-activity bias, "Why This Game?" reasoning) from `behavioral-learning-framework.md` and `BUILD_HISTORY.md`. HN audiences reward mechanical specificity over the AI-build hook.
- Adds the Smart Import + PostImportSummary reframe ("Your actual backlog is 155 games, not 200") — one of the most defensible product moments and the closest thing IF has to a viral hook.
- Mentions Jump Back In in the proof paragraph. Shipped feature, differentiator, real usage.
- Uses three real games you've played to make the proof concrete instead of generic.

---

## Replies prepared for predictable HN comments

**"How is this different from Backloggd / GG App / Grouvee?"**
Those are trackers. They optimize for logging what you played. We optimize for picking what to play next. Backloggd is the biggest and the closest pivot risk — they have recommendations on the roadmap. If they ship a paralysis-solver with their audience, they own the category. Right now they don't, and the "less time in app = success" thesis isn't one a social-tracker product can adopt without contradicting its own engagement metrics.

**"Isn't this just Backlog Roulette / Pick a Game / Steam Roulette with extra steps?"**
Backlog Roulette is the closest direct competitor. Steam-only, iOS-only (Android pending), filters behind a $3/mo paywall. Pick a Game is the most powerful Steam filter stack — but filter-first is the opposite of our thesis. Steam Roulette is pure randomness on Steam. We're the only multi-platform (Steam, Xbox, PlayStation, Playnite CSV) option with mood-and-time as the only required inputs and zero paywall. The differentiator is the "Moved On" framing, the multi-platform reach, the decision-engine specifics (skip memory, genre cooldown, completion proximity), and that the entire product is free with no premium tier dangling.

**"Couldn't you do this with a Python script that picks a random game?"**
You could, and that's the right place to start. Then the picker has to handle skip history, genre cooldown, completion proximity, recent-activity bias, "Why This Game?" reasoning. Then Smart Import that auto-categorizes a 200-game dump. Then the Jump Back In cheat sheet for stalled games. Then state persistence, library refresh, share cards, archetypes derived from play patterns. The Python script is the first ten minutes. The product is the months after.

**"Why couldn't I just ask ChatGPT to pick a game from my Steam library?"**
You can, and a lot of people do. The honest answer: that workflow has zero memory across sessions, zero skip history, zero awareness of what you actually own (unless you paste the list each time), and zero state for what you're currently playing vs. moved on from. We're owned-library-aware, state-aware, and the friction is two taps instead of writing a paragraph. ChatGPT is the closest thing to a sleeper threat in the category. The moat is the memory of your library and your patterns across sessions.

**"Why no account required? How do you persist data?"**
localStorage. Source of truth lives on your device. Cloud sync is opt-in (Discord or Google), and even with sync on, the localStorage version is authoritative. If our backend goes down, your library is still yours.

**"Free forever sounds like a runway problem."**
Tip jar's at ko-fi.com/inventoryfull. The product economics are minimal (Vercel, Supabase, Sentry — all on free tiers until ~2k MAU). If donations don't cover the bill at scale, the next step is a $3/mo cosmetic-only supporter tier. Core stays free forever. No ads, no data sale, no feature paywalls. Those are hard lines, not preferences.

**"What about the ToS implications of scraping Steam/PSN/Xbox?"**
Public APIs only. Steam Web API, OpenXBL, psn-api. No scraping. PSN tokens are ephemeral and never persisted on the backend.

**"Did Claude Code really write most of the code?"**
Yes. I described what I wanted in plain English, the AI scaffolded architecture, wrote the API routes, handled the database. I did product direction, UX decisions, the brand voice, and the long arguments with myself about what to build vs. what to cut. The split is roughly: code = AI, taste = me. The hard problems are taste problems. There's also a pre-push review skill that catches voice violations, AI-slop copy patterns, and obvious bugs before anything ships — building that workflow was the part that made the volume sustainable.

**"What's on the roadmap?"**
A Discord bot with a `/pick` command for game-night servers (no IF account needed to use it — the bot drops one game into chat for the "what should we play tonight" question). Subscription-library mode for Game Pass / PS+ / GeForce NOW (pick from what's already included in what you already pay for). Couch co-op pick flow for shared family libraries (PS Family Sharing, Xbox Home Console). The Discord bot is closest to ship — about three days of focused build. The other two are exploration.

**"Where can I see the code?"**
Closed source for now. The brand strategist part of me knows that closed-source artifacts read different from open-source ones on launch surfaces, and I'm not ready to think about contributor management. May reconsider later. The data model and integrations are all standard — Next.js, Supabase, public APIs — so there's no proprietary secret sauce. The sauce is the product thinking.
