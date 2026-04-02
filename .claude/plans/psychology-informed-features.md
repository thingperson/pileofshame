# Psychology-Informed Features Plan

Based on deep research into gaming backlog psychology (analysis paralysis, decision fatigue, executive function, shame vs guilt distinction, Overjustification Effect).

---

## 1. "Just 5 Minutes" Mode -- SHIPPED

**Psychology**: Behavioral Activation (Martell et al.) — the hardest part of any task is starting. The 5-minute rule lowers the commitment threshold to near-zero. Once someone starts, they usually continue (Zeigarnik Effect — incomplete tasks create psychological tension that motivates completion).

**How it works**:
- Button in hero section: "⚡ Just 5 Min"
- Weighted game picker prioritizes quick-hit and wind-down time tiers, games with some progress (< 20h), and recently added games
- 3-phase triage flow:
  1. **Suggest** — shows a game card with "Give it 5 minutes. Then decide where it goes." + start timer / skip buttons
  2. **Timing** — floating pill anchored to bottom of viewport with circular SVG progress ring, countdown, game name, "go play -- we'll wait" copy, and "I've decided" early exit button
  3. **Triage** — 4-way decision grid: Playing this now / Play Next / Back to The Pile / Not for me, plus "Try another game instead"
- Every triage decision gets a warm 🙌 toast ("You tried it, you liked it, you're in" / "5 minutes saved you hours. That's a win." / etc.)
- All four outcomes are celebrated equally
- Skip/reroll available at suggest phase; early triage available during timer

**Implementation**: Standalone `components/JustFiveMinutes.tsx` — weighted picker, 300s interval timer, floating pill UI, triage actions dispatched to store (`updateGame` / `setBailed`), warm toasts via `useToast`

---

## 2. Time-Aware Nudges -- NOT YET SHIPPED

**Psychology**: Circadian rhythm affects game preference. Evening = lower executive function = preference for familiar/simple. Morning/afternoon = higher capacity for new/complex. (Baumeister & Tierney, "Willpower")

**How it works**:
- Use `new Date().getHours()` (local system time, VPN-proof)
- Time windows:
  - Morning (6-12): "Good morning. Fresh energy — great time to try something new."
  - Afternoon (12-17): "Afternoon session? You've got bandwidth for a deeper game."
  - Evening (17-22): "Evening mode. Something familiar or low-stakes might hit right."
  - Late night (22-6): "Late night gaming. No judgment. Here's something you can pick up and put down."
- Subtly weight reroll/suggestion results toward appropriate games
- Never force — just gently bias the algorithm
- Show as subtle copy in the hero section or suggestion card

**Implementation**:
- Time-of-day detection in suggestion/reroll logic
- Weight modifiers: evening → boost shorter/familiar games, morning → boost new/longer games
- Subtle UI copy changes based on time

**Effort**: Small-Medium — mostly logic changes in existing suggestion/reroll code

---

## 3. Energy Matching -- NOT YET SHIPPED

**Psychology**: Ryan & Deci's Self-Determination Theory — intrinsic motivation requires autonomy, competence, and relatedness. When energy is low, complex games threaten competence needs. Matching game demands to current energy preserves motivation.

**How it works**:
- Optional energy selector (not required): "How's your energy? [🔋 Low | ⚡ Medium | 🔥 High]"
- Maps to game attributes:
  - Low energy → casual, puzzle, walking sim, visual novel, games with < 3h sessions
  - Medium energy → action, adventure, platformer, mid-length sessions
  - High energy → RPG, strategy, competitive, long sessions, new/unfamiliar games
- Auto-inferred from genre + HLTB data (no manual tagging needed)
- Could combine with time-of-day for even smarter defaults

**Implementation**:
- Energy selector in hero section (optional, defaults based on time of day)
- Genre-to-energy mapping table
- Filter/weight modifier for suggestions and reroll

**Effort**: Medium — new UI element + mapping logic + integration with existing systems

---

## 4. Comfort Game Acknowledgment -- SHIPPED (via playtime roasts)

**Psychology**: Comfort games serve a legitimate psychological function (stress regulation, parasocial connection, flow state access). Shaming someone for 1000h in Stardew misunderstands why they play. These games are emotional regulation tools, not failures of commitment.

**What shipped** (in `lib/enrichment.ts` `getPlaytimeRoast()`):
- All playtime "roasts" reframed as warm, affectionate ribbing -- not shaming
- 40+ game-specific roast sets with multiple randomized variants per game
- Covers: competitive (Rocket League, CS2, Valorant, Apex, LoL, Dota), comfort (Stardew, Minecraft, Animal Crossing), strategy (Civ, Factorio, RimWorld, CK3), RPGs (Skyrim, Elden Ring, BG3, Destiny, WoW), survival (Rust, Ark), sports (FIFA, NBA 2K), and more
- Generic tiers scale from light teasing (40h+) to full comfort-game recognition (500h+) to "this is where you live now" (2000h+)
- Multiple variants per tier so repeat visits don't feel stale
- Tone is warm throughout -- "comfort is comfort", "we understand", not "you're wasting time"

**What's NOT shipped yet** (from original plan):
- Comfort game detection as a standalone feature/tag (separate from roasts)
- Visual distinction (sky blue styling, cloud emoji prefix) for comfort games in the library UI -- roasts handle this in-context but there's no persistent "comfort game" badge or shelf

---

## 5. Decisions as Wins -- SHIPPED

**Psychology**: Schwartz's Paradox of Choice — the act of deciding is the hard part, not the outcome. A bail is a decision. A "not for me" is a decision. Progress = decisions made, not just games completed.

**What shipped**:
- "Bailed" stat renamed to "Lines Drawn" with ✊ icon (in `components/StatsPanel.tsx`)
- "Lines Drawn" uses neutral slate gray (#94a3b8), not shame-red
- Bail/triage toasts in Just 5 Minutes celebrate the decision itself ("5 minutes saved you hours. That's a win.")
- Share text counts total decisions as progress

**What's NOT shipped yet**:
- "Decisions made this week/month" as a tracked stat
- "Decisions Made" as a named victory metric alongside "Cleared"
- Mini celebrations / milestone toasts for decision count thresholds (10th, 50th, etc.)

---

## 6. Stats Reframing -- SHIPPED

**Psychology**: Overjustification Effect (Lepper et al., 1973) — external rewards/metrics can undermine intrinsic motivation. Shame-based framing ("your pile of shame is $4,200") creates anxiety, not motivation. Empowerment framing ("you have $4,200 of untapped gaming ahead") preserves curiosity.

**What shipped** (in `components/StatsPanel.tsx`):
- "Backlog" → "To Explore" (with 📚 icon, neutral #64748b color)
- "Bailed" → "Lines Drawn" (with ✊ icon, neutral #94a3b8 color)
- "Dare to calculate your backlog's value?" → "What's your library worth?" (with 💎 icon)
- "Estimated unplayed value" → "Untapped library value"
- Calculator button uses purple accent styling (hover:border-accent-purple)
- Backlog hours framed as abundance, not burden
- Share language softened throughout

---

## 7. Completion Celebration Flow -- SHIPPED

**Psychology**: Completion deserves recognition, but not in a gamified/performative way. Warm celebration preserves intrinsic motivation.

**What shipped** (in `components/CompletionCelebration.tsx`):
- Canvas-based confetti animation on game completion
- Multi-stage celebration flow (celebrate → details)
- Star rating for completed games
- Stats impact shown (how clearing this game affects your numbers)
- Warm, non-competitive tone

---

## 8. Future Considerations

### Not Yet Shipped
- **Time-aware nudges** (Section 2) — circadian weighting of suggestions
- **Energy matching** (Section 3) — optional energy selector + genre mapping
- **Comfort game detection as standalone feature** — persistent "comfort game" identification in library UI beyond the roast system
- **Mini celebrations for milestones** — toast/confetti for 10th decision, 50th game cleared, etc.
- **Decision tracking stats** — "decisions this week/month" as a visible metric

### Non-Finishable Game Handling (build sooner)
Many games have no "end" — MMOs, roguelikes, sandbox games, multiplayer-only titles (Rocket League, CS2, Overwatch, Minecraft, etc.). These shouldn't count as "unfinished" in the backlog or shame users for not "clearing" them.

**What we need:**
- Auto-tag games as "non-finishable" using genre data from RAWG (if genres include "MMO", "Massively Multiplayer", "Battle Royale", or HLTB returns no main story time)
- Let users manually toggle the tag too
- Non-finishable games should be sortable/filterable separately in The Pile
- "Moving out of the pile" (buried → on-deck → playing) should be a win reflected in stats, not just clearing. Many non-finishable games are a win just to be actively playing.
- Stats bar could track "games in motion" (on-deck + playing) as a positive metric alongside cleared count
- Exploration % should count non-finishable games as "explored" once they hit playing status, not require cleared

**Why this matters:** Without this, users with lots of multiplayer/endless games see an artificially inflated "to explore" count and feel worse about their progress than they should.

### Multiplayer Matchmaking (build later — social feature)
**Insight:** Users likely impulse-bought great multiplayer games but stopped playing because they had no one to play with. The games rot in the pile not because they're bad, but because they're lonely.

**What we could build:**
- Detect multiplayer games in user libraries (genre tags from RAWG)
- Show users who share the same unplayed multiplayer games
- "Looking for group" toggle per game — "I'd play this if someone else would"
- Match users who both own the same multiplayer game and both flagged it
- Notification: "3 other Inventory Full users own Divinity: Original Sin 2 and want to play it. Start a party?"
- Moving a multiplayer game to "playing" because you found a group = a pile win

**Why this matters:** This is a genuine differentiator. No backlog tool helps you find co-op partners from shared libraries. It turns the pile from a solo guilt trip into a social opportunity.

**Requires:** User accounts (done), game library visibility between users (new), opt-in matching, likely a simple lobby/interest system. This is a Phase 5 social feature — significant build, but high retention potential.

### Don't Over-Gamify
The research is clear: adding points, badges, streaks, and leaderboards to backlog clearing risks the Overjustification Effect. People stop playing for joy and start playing for metrics. We should:
- Track stats but frame them as self-knowledge, not scoreboards
- Celebrate milestones warmly, not competitively
- Never add leaderboards or competitive elements to backlog clearing
- Keep the tone: "here's what you did" not "here's your score"

### Shame vs Guilt (Tangney & Dearing)
- **Shame** = "I am bad" (global, paralyzing, identity-level)
- **Guilt** = "I did something I want to change" (specific, motivating, action-level)
- Our app name has "shame" in it, but our UX should never trigger shame
- We should trigger light guilt at most: "you have games waiting" not "you're a hoarder"
- The name is playful/self-deprecating. The experience should be warm.

### Loss Aversion (Kahneman & Tversky)
- "You've already invested $60 in this game" can motivate completion
- But it can also create sunk cost pressure (play something you hate because you paid for it)
- Better framing: "You own this. It's yours whenever you're ready."
- The value calculator should feel like discovery, not accusation
