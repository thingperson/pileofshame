---
name: project-context
description: User personas, identity psychology research, and target audience details. Use /project-context when writing copy, designing features, or needing to understand the user.
disable-model-invocation: true
---

# Inventory Full — Identity Psychology Research Brief

## Core Insight

What a person chooses to play is not merely a decision about entertainment or experience. It is an identity decision. The game you commit to playing next is a statement about who you want to be — or at least, who you want to spend time being.

## Background: The Monoculture-to-Identity Pipeline

In the broadcast era (pre-2000s), media consumption was largely passive and communal. You watched what was on. Everyone watched roughly the same 4-5 shows. Your media diet wasn't expressive — it was ambient. You didn't choose it any more than you chose the weather.

The shift to streaming, digital libraries, and on-demand everything changed this fundamentally. Your watchlist, your playlist, your game library — these became expressions of self. What you choose to consume became part of how you present and understand yourself. It is now more common and more revealing to ask someone what they DON'T watch than what they do. The curation IS the identity.

## Application to Gaming Backlogs

A gaming backlog is not just a pile of unplayed purchases. It is a collection of identities the user considered inhabiting but hasn't committed to yet. Every unplayed game represents a version of themselves they thought about becoming:

- The person who platinumed Elden Ring (mastery, persistence, challenge-seeking)
- The person who sank 700 hours into Slay the Spire as The Defect (optimization, systems-thinking, comfort in depth)
- The person who finally played through Spiritfarer (emotional openness, narrative sensitivity)
- The person who got into grand strategy (patience, complexity tolerance, historical curiosity)

The paralysis isn't just "too many choices." It's an identity crisis in miniature. Choosing a game means choosing which version of yourself to spend time being, and rejecting (temporarily) all the others.

## Design Implications

### 1. Reduce Identity Weight Per Decision
The roll mechanic, "Just 5 Min" timer, and session-type filters all work because they lower the identity stakes. "Try this for 5 minutes" doesn't ask "who do you want to be?" It asks "are you curious about this for 5 minutes?" Much lower commitment, much less identity freight.

### 2. "Give Up" as Identity Clarity
When a user discards a game, they're not failing. They're clarifying who they are by eliminating who they're not. This is progress. The pile shrinks. What remains is a more honest reflection of the person. Frame accordingly — discarding is self-knowledge, not defeat.

### 3. Clearing as Identity Achievement
"You beat Portal 2?" isn't just celebrating completion. It's celebrating that the user became the person who beat Portal 2. The celebration UX should reflect this — you didn't just finish a game, you became someone. Confetti is correct.

### 4. The Backlog as Identity Museum
The library view could subtly communicate: this is who you've been (cleared), who you're being (now playing), who you're becoming (play next), and who you might be (the pile). This reframes the pile from shame to possibility.

### 5. Shame Reframe Through Identity Lens
"Pile of shame" implies you failed to do something. The identity lens reframes it: you haven't failed to play these games. You've been collecting possible selves. That's not shameful. That's aspirational. The problem isn't the collecting — it's the paralysis about which aspiration to pursue first. We solve the paralysis, not the collecting.

### 6. Social Sharing as Identity Expression
When a user shares their stats, cleared games, or backlog composition, they're not just sharing data. They're presenting a curated self-portrait. The sharing card design should feel like self-expression, not a report card.

### 7. Affiliate Ethics Through Identity Lens
Showing DLC deals for cleared games works because the user has already committed to that identity. They ARE the person who plays that game. Offering more of it isn't pushing consumption — it's supporting a choice they already made. This is ethically distinct from suggesting new purchases that add to the pile of uncommitted identities.

## Research Directions

- Psychology of identity-based decision making (see: James Clear's identity-based habits framework in Atomic Habits — "every action is a vote for the type of person you want to become")
- Paradox of choice literature (Schwartz) — specifically how identity weight increases choice difficulty
- Self-determination theory (Deci & Ryan) — autonomy, competence, relatedness as needs that gaming fulfills differently depending on genre/game
- How mood-based filtering (Brain Off, Quick Session, Deep Cut) maps to identity states vs. fixed identity categories
- The difference between "who I am when I game" vs "who I want others to see me as when I game" — and how social features navigate that gap

## Origin Note

This insight emerged during a Friday night conversation (April 2026) connecting the fragmentation of monoculture media to the psychology of gaming backlogs. The thread started with The Simpsons as universal reference protocol, moved through streaming-as-identity, and landed on: if your Netflix profile is your identity, your gaming backlog is your identity crisis.

---

*This document is a living brief. Update as the product evolves and user behavior reveals new patterns.*
# User Persona — Inventory Full

## Primary Persona: The Overwhelmed Gamer

### Demographics
- 25-40 years old
- Has disposable income (bought games impulsively over years)
- Owns 50-500+ games across Steam, PlayStation, Xbox, Switch
- Actually plays 3-5 games regularly, ignores the rest
- Browses Reddit (r/patientgamers, r/backlog, r/gaming)
- Has strong opinions about games but hasn't played half the ones they have opinions about

### Psychology

#### Analysis Paralysis
The core affliction. Too many choices leads to choosing nothing. The user opens Steam, scrolls for 20 minutes, then plays the same game they always play or watches YouTube instead. The paradox of choice is real: more games = less gaming.

**How we help:** Remove the decision burden. "What Should I Play?" picks for them. Play Next gives them an ordered list. We decide so they don't have to.

#### Commitment Avoidance
Fear of picking the wrong game. "What if I start Persona 5 and then don't feel like a 100-hour RPG?" So they pick nothing. The cost of commitment feels higher than the cost of inaction.

**How we help:** Make commitment feel reversible and low-stakes. "Try it for an hour. If it's not clicking, bail. No shame." Session length filters match games to available time. Short games provide quick wins that build momentum.

#### Acquisition as Substitute for Experience
Buying a game scratches a similar itch to playing it. The dopamine hit of a Steam sale purchase can feel like progress. The pile grows because acquiring feels like experiencing.

**How we help:** Shame Dollar Calculator makes the financial reality visible. "You own $4,200 of unplayed games." Playtime roasts call out the gap between owning and playing. Not to punish, but to motivate.

#### Guilt / Shame Cycle
The bigger the pile, the worse they feel. The worse they feel, the less they want to engage with it. The less they engage, the bigger it grows. Classic avoidance loop.

**How we help:** We name it. "Inventory Full" acknowledges the overload without judgment. By framing it as a solvable problem (too full, need to clear space) rather than a moral failing, we break the paralysis. Humor is the release valve. Celebrations reward any progress, no matter how small.

#### Comfort Zone Gravity
High-playtime comfort games (Rocket League, Stardew Valley, Civilization) pull users back because they're safe. No learning curve, no risk of disappointment. The pile stays untouched because familiar games are frictionless.

**How we help:** Playtime roasts gently call this out. "1,874h in Rocket League. Your other 200 games are wondering if you even remember their names." We don't shame the comfort game. We nudge toward trying something new alongside it.

### Emotional States We Design For

| State | When It Happens | Our Response |
|-------|----------------|--------------|
| **Overwhelmed** | Looking at 300 unplayed games | Simplify. "Ignore the pile. Here's one game. Just this one." |
| **Guilty** | Buying another game without finishing one | Acknowledge without judgment. "Welcome to the intervention." |
| **Indecisive** | 20 min scrolling, can't pick | Decide for them. "What Should I Play?" removes the burden. |
| **Motivated** | "Tonight I'm going to play something new" | Channel it fast. Play Next list, one-click start. Don't let them lose momentum to browsing. |
| **Proud** | Just finished a game | Celebrate loudly. Confetti, stats, rating, sharing. This feeling is rare. Make it huge. |
| **Deflated** | Bailed on a game 3 hours in | Normalize it. "Life's too short for games that aren't clicking. That's wisdom, not failure." |

### Sub-Personas

#### The Collector
Owns 500+ games. Buys every Humble Bundle. Steam sales are a sport. Has played maybe 15% of their library. Knows they have a problem. Finds it funny. Secretly wishes they could stop.

#### The Dabbler
Starts every game, finishes none. Has 30 games at 2-5 hours played. Gets past the tutorial, feels the initial excitement fade, moves on. Not bored, just distracted by the next shiny thing.

#### The Comfort Gamer
2,000 hours in one game. The pile exists but they're not really bothered by it because they found their game. Our challenge: gently suggest they might enjoy something else too, without threatening their safe space.

#### The Aspirational Gamer
Buys critically acclaimed games because they "should" play them. Has Disco Elysium, Outer Wilds, Return of the Obra Dinn all unplayed. Wants to be the kind of person who plays those games but defaults to something easier.

#### The Returner
Used to game heavily, fell off for years (life, kids, work). Now has a free evening and a pile of games from 2018-2023. Doesn't know where to start. Needs a "what's worth your limited time" filter.

### Design Principles from Psychology

1. **Reduce choice, don't add it.** Every feature should narrow options, not expand them.
2. **Make the first action trivially easy.** One click to add to Play Next. One click to start playing.
3. **Celebrate micro-progress.** Not just finishing games. Adding to Play Next is progress. Trying the picker is progress.
4. **Use social proof.** "10k overwhelmingly positive reviews" removes doubt. Metacritic scores, HLTB times, community ratings all serve as permission to commit.
5. **Time-box commitment.** "This game takes ~8 hours. That's two weekends." Makes the commitment feel finite and manageable.
6. **Name the feeling.** "Inventory Full" works because every gamer has stood in a menu dropping items to keep moving. The metaphor is instantly understood. Empathy over shame.
7. **Never mock vulnerability.** Users opening our app are admitting they need help deciding. That's brave. Respect it.

### Research to Explore
- Analysis paralysis in consumer behavior (Schwartz, "The Paradox of Choice")
- Executive function and decision fatigue
- Gamification psychology (variable reward schedules, loss aversion)
- Commitment devices in behavioral economics
- The psychology of collecting vs. experiencing
- Flow state prerequisites (Csikszentmihalyi) and how game selection affects flow entry
