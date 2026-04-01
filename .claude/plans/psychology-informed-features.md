# Psychology-Informed Features Plan

Based on deep research into gaming backlog psychology (analysis paralysis, decision fatigue, executive function, shame vs guilt distinction, Overjustification Effect).

---

## 1. "Just 5 Minutes" Mode

**Psychology**: Behavioral Activation (Martell et al.) — the hardest part of any task is starting. The 5-minute rule lowers the commitment threshold to near-zero. Once someone starts, they usually continue (Zeigarnik Effect — incomplete tasks create psychological tension that motivates completion).

**How it works**:
- Button in hero section: "⚡ Just 5 Minutes"
- Picks a game from library (prioritize: short games, games with progress, games user hasn't tried)
- Shows: "Give [Game] just 5 minutes. That's it. No commitment."
- After 5 minutes (honor system), show: "5 minutes done. Want to keep going, or call it? Either way, you showed up."
- Both "Keep playing" and "Done for now" are celebrated equally
- Track "sessions started" as a win metric, not just completions

**Implementation**:
- New reroll mode in the reroll modal
- Timer is optional/honor-system (no intrusive countdown)
- Toast on completion: warm, not performative

**Effort**: Medium — new reroll mode + timer UI + session tracking

---

## 2. Time-Aware Nudges

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

## 3. Energy Matching

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

## 4. Comfort Game Acknowledgment (IMPLEMENTED)

**Psychology**: Comfort games serve a legitimate psychological function (stress regulation, parasocial connection, flow state access). Shaming someone for 1000h in Stardew misunderstands why they play. These games are emotional regulation tools, not failures of commitment.

**What we did**:
- Reframed all playtime "roasts" as warm comfort game recognition
- 500h+ games get ☁️ prefix and explicit comfort game acknowledgment
- Game-specific lines are affectionate (Stardew: "This is your happy place, isn't it?")
- Color changed from amber/warning to sky blue/calm
- Message: "This isn't part of the pile. It IS the game. That's valid."

---

## 5. Decisions as Wins (PARTIALLY IMPLEMENTED)

**Psychology**: Schwartz's Paradox of Choice — the act of deciding is the hard part, not the outcome. A bail is a decision. A "not for me" is a decision. Progress = decisions made, not just games completed.

**What we did**:
- "Bailed" stat renamed to "Lines Drawn" with ✊ icon
- Bail affirmation toasts celebrate the decision itself
- Share text counts total decisions (cleared + bailed) as progress
- "Lines Drawn" uses neutral gray, not shame-red

**What's left**:
- Track "decisions made this week/month" as a stat
- Show "Decisions Made" as a victory metric alongside "Cleared"
- Milestone celebrations for decision counts (10th decision, 50th, etc.)

---

## 6. Stats Reframing (IMPLEMENTED)

**Psychology**: Overjustification Effect (Lepper et al., 1973) — external rewards/metrics can undermine intrinsic motivation. Shame-based framing ("your pile of shame is $4,200") creates anxiety, not motivation. Empowerment framing ("you have $4,200 of untapped gaming ahead") preserves curiosity.

**What we changed**:
- "Backlog" → "To Explore"
- "Bailed" → "Lines Drawn"
- "Dare to calculate your backlog's value?" → "What's your library worth?"
- "Estimated unplayed value" → "Untapped library value"
- Red/shame styling → purple/neutral
- Share text focuses on exploration % and decisions, not shame
- Backlog hours framed as abundance ("you're set for life") not burden

---

## 7. Future Considerations

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
