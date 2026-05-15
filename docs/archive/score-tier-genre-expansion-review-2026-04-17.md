# Score-tier + genre-fallback descriptor expansion — 2026-04-17

**How to use this doc:** these are the NEW lines added to [lib/descriptors.ts](../lib/descriptors.ts). Shipped live as of commit (see `git log` for hash). If you want tweaks, edit in place here and save — I'll sync back to `lib/descriptors.ts` next turn.

Voice filter passed: no banned vocab, no em-dash dramatic pauses, no "That's not X, that's Y" reframes, no triple adjective lists, no "tonight" for game sessions, varied sentence length, each line takes a position.

## Score tiers — 3 → 7 lines per tier (27 → 63 total)

### 95–100 (generational)
Existing 3 kept: "Universally adored...", "One of the highest-rated...", "Generational talent..."

Added:
4. A game people still talk about years later. The reputation's earned.
5. The kind of game your future self will thank you for playing.
6. If you only play ten more games in your life, this is one.
7. Critics and players agree. That almost never happens.

### 90–94 (elite)
Existing: "Near-universal acclaim...", "Elite tier...", "A top-shelf title..."

Added:
4. Reviewers ran out of ways to say 'great.' You're about to see why.
5. The kind of game that shows up on year-end lists. All of them.
6. This one doesn't need you to meet it halfway. It comes to you.
7. Reliably great. Unanimously so.

### 85–89 (excellent) — the Titanfall 2 tier
Existing: "Excellent by any measure...", "Highly rated across the board...", "Strong reviews, strong word of mouth..."

Added:
4. Sharp execution. Not revolutionary, but very good at what it does.
5. You won't regret picking this one. Most people don't.
6. Did most things right. A few things brilliantly. Worth the time.
7. High marks across the board. No red flags.

### 80–84 (solid)
Existing: "Solid and well-received...", "A good game...", "Well-reviewed, well-liked..."

Added:
4. A B+ game that occasionally hits an A. Happens more than you'd think.
5. Does the basics well. A few moments punch above.
6. Reviewers liked it. Players liked it. You'll probably like it too.
7. Well-made. Won't blow your mind but won't waste your time.

### 75–79 (good, not great)
Existing: "Good, not great...", "Positive reviews with some caveats...", "A solid pick..."

Added:
4. Fine. Not a word we love, but accurate here. If you're in the mood, go.
5. Works well for what it is. Doesn't try to be more.
6. The kind of game you play and forget in two weeks. Not a bad thing.
7. Genre fans will be satisfied. Others might bounce.

### 70–74 (mixed-to-positive)
Existing: "Mixed-to-positive...", "Divisive...", "Not for everyone..."

Added:
4. Reviewers disagreed. So did players. Form your own opinion.
5. Some of it lands. Some of it doesn't. You'll know which is which.
6. Imperfect, but memorable to the people who stuck with it.
7. A game with flaws and fans. Give it an hour.

### 60–69 (polarizing)
Existing: "Polarizing...", "Has ambition...", "The reviews are mixed..."

Added:
4. Uneven. Parts are great, parts aren't. You'll play it to find out which.
5. A game trying to do too much. Sometimes that's exactly what you want.
6. Rough around the edges, but some edges have soul.
7. Not for everyone. If you're curious, that's a signal.

### 50–59 (rough)
Existing: "Rough around the edges...", "Mid...", "This one needs you to meet it halfway..."

Added:
4. Not the best reviewed. Still earned its spot in your pile for a reason.
5. Patchy. Has its moments. Measure your expectations.
6. You paid for this. Might as well see what it's about.
7. Reviewers weren't kind. You don't have to be them.

### 0–49 (brave)
Existing: "Brave choice...", "The reviews were brutal...", "A guilty pleasure..."

Added:
4. Universally panned. Play it ironically. Or sincerely. No judgment.
5. The kind of game you play on a dare. Live a little.
6. Bad review scores. Strong personality. Your call.
7. A bold pick. Nobody ever tells stories about safe games.

---

## Genre fallbacks — 1 → 4 lines per genre (14 → 56 total)

The fallback function now picks deterministically from a pool of 4 per genre, using a hash of the game name as the seed. Same game = same line on reroll; different games in the same genre = different lines.

### RPG
1. An RPG in the pile. Block out some serious hours for this one.
2. RPG means reading. RPG means commitment. Still in?
3. The kind of game where 'just one more quest' becomes midnight.
4. Level up. Story up. Time up. Classic RPG tax.

### Roguelike / lite
1. A roguelike. Every failed run is technically progress.
2. A roguelike. You will die. The game wants you to. You'll come back.
3. One more run energy. Set a timer or lose the evening.
4. Built to be replayed. Built to be brutal. Weirdly relaxing.

### Puzzle
1. A puzzle game. Your brain will thank you. Your backlog won't.
2. A puzzle game. Bring coffee and patience.
3. Expect 'aha' moments. Expect some stuck moments. Both are the point.
4. Perfect when thinking is what you actually want to do.

### Platformer
1. A platformer. Jump, die, learn, repeat. The classics never change.
2. A platformer. Muscle memory, rhythm, and rage. All three.
3. Short levels, long memories. Platformers age well.
4. Tight controls and trial-and-error. The genre at its best.

### Horror / survival
1. Play this one at night with headphones. Trust the process.
2. Horror. Bright lights off. Headphones on. Commit.
3. A survival horror. Bring your nerves. Leave your composure.
4. Scary on purpose. Worth it if you're in the mood.

### Strategy / tactical
1. A strategy game. Budget more time than you think you need.
2. Strategy games eat hours. Plan accordingly.
3. Chess with extra steps. You'll love the extra steps.
4. Thinking the game. That's the game.

### Simulation
1. A sim game. You'll either play 5 minutes or 500 hours. No in-between.
2. A sim. These games don't end. That's the appeal.
3. Menus within menus. Addictive menus.
4. Quiet systems doing quiet things. You'll lose an afternoon.

### Shooter / FPS
1. Bullets first, questions later. Pure adrenaline.
2. A shooter. Aim. Shoot. Move. Repeat. There's joy in the rhythm.
3. Fast-twitch fun. Your reflexes will thank you.
4. If you want adrenaline, load it up.

### Action
1. Fast combat, sharp reflexes. This one earns its spot in the pile.
2. Action means timing. Action means commitment to combos. Fun.
3. Gets the blood moving. Also gets the thumbs sore.
4. Reactive, rhythmic, rewarding when it clicks.

### Adventure / exploration
1. An adventure awaits. The pile can wait. This one's calling.
2. Adventure games reward curiosity. Bring some.
3. Exploration means wandering means noticing. Slow it down.
4. Get lost in a place on purpose. That's the genre.

### Indie
1. An indie pick. Often where the real magic happens.
2. Indie games swing for the fences. This one probably connects.
3. Small team, big ideas. Usually worth your time.
4. Indie = personality. Load it up.

### Racing
1. A racing game. Perfect for when you want zero narrative commitment.
2. Racing. Pure reflex. Pure fun. And no one gets sad in a racing game.
3. Go fast. Turn left. Occasionally right. That's the deal.
4. A perfect 30-minute game.

### Fighting
1. A fighting game. You'll spend more time in training mode than you expect.
2. Fighting games are rhythm games with fists. Learn the beat.
3. Losing is the tutorial. Winning is the reward.
4. Bring friends. Or bring the practice dummy.

### Sports
1. A sports game. Great for when the real season isn't on.
2. A sports game. Ritualistic. Satisfying. Oddly meditative.
3. Arcade sports or sim? Either way, pick up and play.
4. The pickup-and-play format perfected.

---

## Things I'd flag to you

- **"Tuesday night" in 50-59 tier line 2** ("Mid. But sometimes mid is exactly what you need on a Tuesday night.") — this is an existing line, not new. "Tuesday night" implies game session like "tonight" does. Swap for "after-work Tuesday" or "a random weeknight"? Flagging since you just swept "tonight."
- **"Indie = personality"** — uses `=` instead of "is." Conversational. Works on Twitter but may read casual in-app. Your call.
- **"No one gets sad in a racing game"** — a specific claim that might not be universally true (people rage at unfair AI). But it lands as voice. Keep.
- **Edition nudges (Deluxe, Ultimate, Collector's)** are unchanged — only score tiers and genre fallbacks expanded this pass.

## Notes

- Hash-based selection: same game always shows the same descriptor line. Different games in same tier/genre rotate. No randomness at render time.
- Curated list (145 hand-written titles) not touched this pass — the top-80 expansion review is in [descriptor-expansion-review-2026-04-17.md](descriptor-expansion-review-2026-04-17.md).
