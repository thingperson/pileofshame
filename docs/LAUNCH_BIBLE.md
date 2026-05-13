# Launch Bible — Inventory Full

**Single source of truth** for how we take Inventory Full public. Merged 2026-05-12 to consolidate the original Apr-21 bible, the May-5 distribution plan, and the May-12 handoff package (Show HN, creator outreach, demo workflow, landing audit, supplementary subs) into one doc. Dates stripped — sequencing is relative, not calendar-based.

The activation order is: get product surfaces tight (Pre-Launch Punch List + Landing Audit + Demo Footage) → run the Reddit sequence → run PH + Show HN the week after Reddit lands → sustain with Bluesky/Twitter artifact posts + creator outreach. Off-canon plays (LinkedIn, paid Reddit boost, supplementary subs) sit in `docs/launch-plays/` and stay dormant unless explicitly activated.

---

## TL;DR

- **Product is ready.** Ship-readiness review came back "launch now." Nothing remaining is a true blocker.
- **Site is already live.** No "launch day" announcement — the quiet-live built runway.
- **Sequencing is fixed, not calendar-driven.** Run the steps in order. If one slips, push the chain, don't skip.
- **Reddit is the engine, Bluesky/Twitter is the artifact layer, PH/HN is the amplification, creator outreach is the long tail.** Don't expect Bluesky alone to move users. It can't.
- **Monetization:** Donationware from day one (Ko-fi). Supporter tier ($3–5/mo cosmetic perks) ships at 2k MAU. Affiliate revenue blocked on RAWG commercial ($149/mo), deferred.
- **One Insight to repeat ruthlessly:** *"Every other app wants you to catalogue and organize. We want you to close the app and go play."*

---

## Table of contents

1. [Positioning & Voice (Locked)](#1-positioning--voice-locked)
2. [Pre-Launch Punch List](#2-pre-launch-punch-list)
3. [Distribution Sequencing](#3-distribution-sequencing)
4. [Reddit Playbook + Copy](#4-reddit-playbook--copy)
5. [Twitter + Bluesky Playbook + Copy](#5-twitter--bluesky-playbook--copy)
6. [Product Hunt Playbook](#6-product-hunt-playbook)
7. [Hacker News / Show HN](#7-hacker-news--show-hn)
8. [Creator Outreach](#8-creator-outreach)
9. [Press](#9-press)
10. [Demo Footage Workflow](#10-demo-footage-workflow)
11. [Landing Page One-Liner Audit](#11-landing-page-one-liner-audit)
12. [Activatable plays (off-canon)](#12-activatable-plays-off-canon)
13. [Infrastructure Checklist](#13-infrastructure-checklist)
14. [Monetization Roadmap](#14-monetization-roadmap)
15. [Scale-Up & Virality Response](#15-scale-up--virality-response)
16. [Metrics & Monitoring](#16-metrics--monitoring)
17. [Compounding bet — what to build, not who to follow](#17-compounding-bet)
18. [What NOT to do](#18-what-not-to-do)

---

## 1. Positioning & Voice (Locked)

### The One Insight

> **Every other app wants you to catalogue and organize. We want you to close the app and go play.**

Use verbatim in: Reddit intro posts, PH listing, press pitches, any cold pitch. It is the category line.

### Taglines

- **Brand line (primary):** `get playing.` (lowercase, period)
- **Landing subhead:** "Your pile's not gonna play itself." (current site bio variant: "Backlog piling up? Yeah me too. Let's get playing our games.")
- **PH / utility tagline:** "Import your backlog. Match your mood. Get playing."
- **Celebration surface only:** "Less shame. More game."

### Core pitch (three sentences)

Gaming backlogs aren't a task list — they're decision paralysis in a UI. Inventory Full takes your Steam/Xbox/PlayStation library, asks your mood and time, and picks one game. You play or you don't; moving on counts too.

### What we're not

- Not a tracker (Backloggd, HLTB log what you played). We decide what you play next.
- Not a random picker. Weights mood, time, skip history, genre cooldown, completion proximity, recent-activity bias.
- Not a social network. No feeds, no comparisons, no leaderboards.
- Not a gamification app. No streaks, no completionist pressure. Moving on = winning too.

### Voice rules (short — full in `.claude/rules/voice-charter.md`)

1. Roast with warmth, never punch down.
2. Confidence over hedge in action moments. No "maybe," "might," "feel free."
3. Never sound like AI. Vary sentence length wildly. Skip obvious transitions.
4. Empathy over shame. User is overloaded, not lazy.
5. Celebrate action, not just completion.

### AI-avoidance scan (run on every public piece)

- No em dashes for drama. Use a period.
- No "that's not X, that's Y" reframes more than once.
- No triple adjectives ("sleek, powerful, intuitive").
- No "leverage," "unlock," "elevate," "seamless," "robust," "dive into."
- No performative empathy openers ("Great question!").
- No summary closers ("In conclusion," "Ultimately,").
- Read aloud. If the rhythm is metronomic, rewrite.

### Terminology (locked)

- **Status cycle:** Backlog → Up Next → Playing Now → Completed (or Moved On as sibling exit). Do not reintroduce: Buried, Play Next, On Deck, Queue, Active, Cleared, Beaten, Bailed, Dropped, Abandoned.
- **Moving On** is a protected canonical moment. Anchor line: *"Moving on is deciding too."* Never frame as failure.

---

## 2. Pre-Launch Punch List

### 🔴 Blocking public push

| # | Item | Why it blocks |
|---|------|---------------|
| B1 | QA all 3 reroll modes (Just 5 Mins / Quick Session / Resume) — 10 picks each, confirm Quick Session never surfaces 40h+ games | Reddit will stress-test this on day one |
| B2 | OG unfurl test on Discord, Bluesky, Reddit, iMessage, Slack (real platforms, not preview tools) | Share cards are our virality loop |
| B3 | Sample library first-pick tuning — first 3 rolls across all modes must feel genuine | Most people try sample before importing |
| B4 | Landing-page one-liner cleanup (see §11) | Visitors form a model in 5s; conflicting one-liners cost conversion |
| B5 | Demo footage produced (PH video, HN hero, landing demo) — see §10 | PH won't accept a launch without a demo video |

### 🟡 Should fix

| # | Item |
|---|------|
| S1 | Safari desktop line icons not rendering |
| S2 | Landing hero CTA position on mobile — confirm above fold on iPhone SE width |
| S3 | "Lines Drawn" label on stats page — hover tooltip or rename |
| S4 | Four-button action row visual hierarchy (Return / Not for me / Don't suggest / Delete) |
| S5 | Smart Import + PostImportSummary moment surfaced on landing page (see §11) |

### 🟢 Post-launch (week 2+)

- Mobile Brave/Chromium theme rendering bug (light/cozy)
- Nintendo onboarding reframe
- Fetch timeouts on external APIs (RAWG/HLTB/PSN/Steam/Xbox/ITAD)
- PSN token scrubber in Sentry beforeSend
- PSN trophy pagination cap (max 5 pages)
- Pre-seed metadata cache with top 500 Steam games
- Completion CTA copy A/B test

### 🟢 Infrastructure (see §13)

- Resend wired for transactional email
- One-click unsubscribe (Privacy Policy promises it)
- Ko-fi link in footer + about page (live; verify before each push)
- Bluesky account + custom domain handle (live — `@inventoryfull.gg`)
- Product Hunt "Coming Soon" page
- Press kit folder (public Google Drive)
- Discord server (live — invite `gJdmmymGg3`)

---

## 3. Distribution Sequencing

The sequence below replaces the original Apr-21 day-by-day calendar. Don't think in dates — think in steps. Each step gates the next.

### Anchor principles (carried from May-5 distribution plan)

1. **Don't manufacture organic.** Sock-puppet posting from multiple accounts in the same thread is asymmetric risk — small upside per thread, large downside if caught once. Posting "this app helped me" from a real second account that's actually a user is fine; fake-arguing with yourself or running upvote rings is not.
2. **Personal accounts have trust capital. IF persona accounts don't yet.** Use personal for first-touch posts. Use IF persona for brand consistency over time.
3. **Don't try to amp follower count.** Engagement-bait posts produce low-quality followers (people who like takes, not products). Ship shareable artifacts and let other people do the spreading.
4. **No LinkedIn on the main path.** Wrong audience for the core gaming offer. (LinkedIn is filed as an *activatable* play in §12 — a different story angle for a different audience, used selectively.)
5. **No paid boosting on socials.** Twitter Blue / Bluesky algo boosts don't reach this audience. Wasted dollars. Paid *Reddit* ads on a working organic post = different calculus, see §12.

### The sequence

| Step | Surface | Trigger to act |
|------|---------|----------------|
| 1 | Get punch list to green (§2) | Always first |
| 2 | Land Bluesky + Twitter artifact posts (archetype card, clear card) on personal accounts | Anytime — low cost, builds shareable proof |
| 3 | Reddit Move 1 — **r/SideProject** | After step 1 green. Tue–Thu, 8–11 AM ET |
| 4 | Reddit Move 2 — **r/patientgamers** (DM mods first) | ≥1 week after step 3 |
| 5 | Reddit Move 3 — **r/gamingsuggestions** | Only if steps 3+4 land. ≥1 week after step 4 |
| 6 | Product Hunt + Show HN | The week after Reddit lands. Both same week, not same day |
| 7 | Creator outreach Tier 1 (1k–10k subs) | Day after HN lands. 10–15/day |
| 8 | Creator outreach Tier 2 (10k–100k) | After Tier 1 has produced ≥1 mention |
| 9 | Supplementary subs (§4.4) if primary plays exhaust | One per week max |
| 10 | Press pitches | After PH/HN have measurable traffic, use as proof |

**Cadence rule:** wait ≥1 week between Reddit posts to the same sub family. Reddit's anti-spam flags rapid same-subject posts.

---

## 4. Reddit Playbook + Copy

### 4.1 The 90/10 rule and the warmup protocol

Site-wide guideline: ~90% genuine participation, ~10% can reference your own stuff. Mods enforce aggressively.

**Warmup status (as of merge):** posting account has 11 karma after 15 years. r/patientgamers (and likely r/SideProject's mod queue) drops low-karma accounts quietly. Target **+25–40 karma minimum, ideally 50+** from genuine comments on r/SideProject, r/patientgamers, r/gamingsuggestions, r/Steam (yes, even though we don't post there — commenting is fine) before posting anywhere.

**Don't farm.** Actual replies to actual threads about backlogs, sales, what-to-play-next. If you can't think of something genuine to say in a thread, scroll past it.

### 4.2 Primary sub map

| Sub | Members | Role | Format |
|-----|---------|------|--------|
| r/SideProject | ~688k | First post, lowest risk, builder audience | Link post + GIF/video, pre-comment with origin story |
| r/patientgamers | ~807k | Second post, **THE user**, DM mods first | Text post (NOT link), confessional framing, link at bottom |
| r/gamingsuggestions | ~340k | Third post, only if 1+2 land | Text post, utility framing |

### 4.3 Subs to AVOID

From the May-5 audit. Mods remove on sight or the audience hostility outweighs the upside.

- r/Steam, r/gaming — too big, hostile to self-promo
- r/IndieDev, r/gamedev — wrong audience (game makers, not players)
- r/truegaming — wants long-form essays, removes products on sight
- r/ShouldIbuythisgame, r/ifyoulikeblank — narrow recommendation-template format we don't fit
- r/lowsodiumgaming — too small, vibes-focused, no builder culture
- r/dadgaming, r/DadGamers — both <10k, not worth the one-shot
- r/incremental_games, r/GameDeals — wrong audience

### 4.4 Supplementary subs (only when primary three exhaust)

Priority order:

1. **r/webdev Saturday showcase** — lowest risk, useful for SEO + dev visibility. Drop one-line description + screenshot + link + stack list + a specific dev question to drive replies. Not a launch driver — dev audience, not gamer audience. Backlinks and visibility, not traffic.
2. **r/IMadeThis** — light-touch, low bar. Hook: *"I made a free tool that picks what to play from your gaming backlog."* 2–3 sentence body, 3 screenshots, link. Or process variant: *"I made a thing in 4 days that I now use every night."*
3. **r/EntrepreneurRideAlong** — useful for credibility/network. Two angle options:
   - *Donationware reasoning:* "I built something with no monetization plan on purpose. Here's the math and the bet." Body beats: what the product is, why charging breaks the thesis, why ads break it, what donationware covers, the failure mode, open question to the sub. Examine the choice, don't defend it.
   - *Solo non-dev launch story:* "I'm a brand strategist, not a developer. I shipped a real product in 4 days because I let AI do the part I can't do." Years of CMO frustration at being unable to ship → Claude Code changing the math → what you can/can't do now → the product as example → what's next. Product is the example, not the centerpiece.
4. **r/InternetIsBeautiful** — coin flip. Submit URL with one of these titles, **no body**:
   - `Inventory Full — pick a game from your Steam library based on mood and time`
   - `A backlog tool that picks your next game instead of asking you to organize it`
   - `Free site that picks one game from your library to play tonight`

   If it gets traction, comment as OP. Don't pre-comment.

**Don't post to more than one supplementary sub per week.** Cross-sub frequency is tracked.

---

### 4.5 r/SideProject — Post 1 (lowest risk, post first)

**Why first:** sub built for "I shipped a thing." Self-promotion is the *point*, not the violation. Lowest ban risk. Won't yield core users in volume but gives 50–200 first-touch visitors with zero risk and useful builder feedback.

**Rules to honor:**
- Live working product required (✅)
- Engagement required — reply to every comment within ~2 hrs

**Timing:** Tue–Thu, 8–11 AM ET.

**Title:** `[Launch] Inventory Full — Picks one game from your library when you can't decide` (under 100 chars)

**Body:**

> I'm a solo dev. Built this because my Steam library was eating me alive — I'd open the launcher, scroll for 20 minutes, and close it without playing anything.
>
> Inventory Full asks two questions (mood + how long you've got) and picks ONE game from the library you already own. Free. No account. No ads. Imports from Steam, PSN, Xbox, GOG, Epic.
>
> It's not a backlog tracker. The whole design point is: less time in the app = better. We win when you close the tab and go play.
>
> [GIF / 30s video of the pick flow]
>
> → inventoryfull.gg
>
> Honest feedback wanted, especially on the picker UX. What would make you trust it?

**Pre-comment to drop right after posting:**

> A bit more context: I built this after spending two months in a "I'll play tonight" → don't pick anything → close laptop loop. The "just pick something" advice never landed because *deciding* was the thing exhausting me. So the design tries to do the deciding *for* me without becoming another thing to manage.
>
> Stuff I'd love to know: does the 2-input picker (mood + time) feel right, or are there other dimensions you'd add? And — is there a missing feature that'd make you actually use this nightly?

---

### 4.6 r/patientgamers — Post 2 (THE user, DM mods first)

**Why second:** this IS the user. Decision paralysis, sunk-cost libraries, anti-hype. Sub rule is "games 6+ months old" but the audience is the backlog-overwhelmed profile we want.

**Pre-post checks (do all four):**

1. **DM mods first** with a 3-line "solo dev, free, no account, here's the link, OK to post?" A soft heads-up converts a removal into a sticky.
2. **Read the "before you post" sticky.** The numeric karma threshold moves; check it.
3. **Karma check.** If posting account is below ~25 comment karma in this sub, spend 2–3 more days commenting genuinely before posting. Posting cold from an 11-karma account gets the post quietly dropped into mod queue or shadow-filtered.
4. **Drop any reference to current-release games.** The sample library showcasing recent titles is the wrong angle for THIS sub. Lead with "I have 750 games I'll never play."

**Format:** text only, NOT link post.

**Title:** `I have 750 games across Steam and PlayStation and I haven't picked one in months. So I built a thing.`

**Body:**

> Patient gamer by accident, not by discipline. I buy games on sale, add them to the library, and then sit down a week later, scroll for twenty minutes, and close the launcher. 349 on Steam, around 400 on PlayStation. Most unplayed. Some bought twice across platforms because I forgot I already owned them.
>
> Disclosure: I'm the dev. I'm posting this here because the problem the tool addresses is exactly the thing this sub talks about constantly.
>
> The backlog stopped feeling like a treasure pile and started feeling like an unread email folder I'm avoiding.
>
> Here's the thing I figured out, eventually. Organizing doesn't fix this. I tried every backlog tracker, every spreadsheet template, every "rate every game 1-10 and let it suggest one" tool. They all made the problem worse, because they all wanted more of my time to set up. The problem isn't that I don't know what I own. The problem is decision paralysis. Two hundred options, no framework, vague guilt about picking the "wrong" one.
>
> Backloggd, Grouvee, GG App — those are trackers. They log what you've played for other people to see. Different job from what I needed.
>
> So I built something that does one thing. You import your library, tell it your mood and how long you've got, and it picks one game. Not five. One. If the pick is wrong, reroll. If you start it and bounce, that's fine. Moving on is deciding too.
>
> The whole point is to spend as little time in the app as possible. Thirty seconds to pick, three hours to play. That's the win condition.
>
> Free. No account required. Your library stays on your device unless you explicitly opt into sync. Imports Steam, Xbox, PlayStation, Playnite CSV.
>
> [inventoryfull.gg](https://inventoryfull.gg)
>
> (The underlying psychology — identity claims, loss aversion, why organizing never fixes it — is written up here if that framing is useful: [inventoryfull.gg/why-deciding-is-hard](https://inventoryfull.gg/why-deciding-is-hard))
>
> Mostly posting this to find out if I'm uniquely broken at picking games or if there's a quiet army of you who also stare at 700 icons and play Balatro for the eighth time.

#### Alt hooks (swap the first sentence if the 750-games lead feels braggy on the day)

**Alt A — the avoidance frame:**
> I haven't picked a new game from my own library in about four months. I keep playing Balatro because picking anything else feels like homework. 349 on Steam, ~400 on PlayStation, and I'm running back the same roguelike like it's the only thing I own.

**Alt B — the launcher frame:**
> The most consistent gaming ritual I have is opening Steam, scrolling for twenty minutes, and closing Steam. I own 349 games there. Another ~400 on PlayStation. Somehow none of them are the right answer at 9pm on a Tuesday.

#### Reply playbook

Use these as voice references, not scripts. Read the actual comment and answer it.

**1. The "this is just a random picker" critic**
> Fair read, but it's not random. It filters by your mood and the time you've actually got, then weights toward stuff you haven't touched. The "one game, decide now" framing is the point though. A shortlist puts you back where you started.

**2. The "I have 2000 games" empath**
> Two thousand. Respect. I think past a certain library size the math stops mattering and the feeling takes over. You're not picking from 2000 games, you're picking from the three you can hold in your head at 9pm, and none of them feel right. That's the part I was trying to fix.

**3. The "isn't this just Backloggd / GG App / Grouvee / Playnite" comparison**
> Different goal. Those are catalogue tools — you organize, tag, rate, track. This one tries to be the opposite. No tagging, no shelves, no completion percentages. You open it when you can't decide, it picks, you close it. If you already love tracking, this isn't for you.

**4. The curious user with a specific question ("how does it handle X")**
> Good question. [Answer it directly.] If it's missing or weird, tell me — I'm one person and this is early days, so the rough edges are real. Bug reports land in my inbox, not a ticketing system.

**5. The gentle mod-flag / "is this self-promo" accusation**
> Totally fair to ask. It's mine, it's free, no account or ads, no affiliate links. I posted here because the problem the tool addresses is exactly the thing this sub talks about constantly. Happy to delete if the mods would rather I didn't.

---

### 4.7 r/gamingsuggestions — Post 3 (only if 1+2 land well)

**Why third:** sub literally exists for "what should I play?" The tool is the meta-answer.

**Frame:** utility, not launch. *"Made a free thing for when 'what should I play' is the actual question."*

**Format:** text post, similar to r/patientgamers but tilted toward "decision-help utility" rather than "backlog therapy." Lighter on confessional, heavier on what the picker actually does (mood + time → one game with reasoning shown).

---

## 5. Twitter + Bluesky Playbook + Copy

### 5.1 The thinking

Bluesky's gaming corner is small enough that organic engagement from a single-digit-follower account still gets seen. Twitter is harder, but personal accounts have trust capital that the IF brand account doesn't yet — use them as the primary launch surface, keep IF accounts dormant for now.

**Current state:**
- Personal Twitter (~99 followers) — active
- Personal Bluesky — active
- IF Twitter — dormant, ≤10 followers
- IF Bluesky (`@inventoryfull.gg`, custom-domain handle live) — 9 followers, 21 posts. Bio: *"Backlog piling up? Yeah me too. Let's get playing our games."*

Use the IF Bluesky as a brand-consistency feed (1 post/day max, voice-led commentary). Use personal accounts for the launch posts. Don't repost personal → IF — it looks insecure.

### 5.2 Cadence and engagement

- **1 post/day** during prep windows. **2/day** when a Reddit post is live. **1/day or alternate days** during sustain.
- Reply to people complaining about their backlog with one useful or funny line. **Don't drop the link in replies.**
- Quote-post gaming journalists when they cover decision fatigue / GamePass sprawl / Steam summer sale.
- Engagement is genuine — the algo rewards threads you start.
- Don't follow-spam. Don't hashtag-heavy. Don't schedule/automate (Bluesky users smell it). Don't only post about the product — personality first.

### 5.3 The three priority artifact posts (personal accounts)

**Post 1 — archetype card.** Image: the H2 archetype share card from `/archetype/[your-slug]`. Caption:

> I learned I'm The [Archetype]. Brutal accuracy. (I made the app.) inventoryfull.gg

The parenthetical disclosure does the work. Honest builder framing > fake organic > hard pitch. No hashtags on Twitter.

**Post 2 — clear card.** Image: the clear card. Caption when you actually clear a game (3–5 days after Post 1):

> Cleared [Game]. [N] hours. [One specific reaction.]
>
> (I built a thing for picking what to play next. Helped me do this. inventoryfull.gg)

Clear cards are more emotionally resonant than archetype cards. Real game, real time, real outcome. Strangers stop scrolling on real outcomes.

**Post 3 — builder opinion thread.** Twitter (3-tweet thread) + Bluesky (single longer post). Only if posts 1+2 got *any* organic engagement from non-followers.

> Built Inventory Full because my Steam library was eating me alive. Three things I learned:
>
> 1. Choice paralysis isn't a discovery problem. It's a decision exhaustion problem. Fewer questions, not better filters.
>
> 2. Most "backlog tracker" apps make the backlog the protagonist; the user becomes a manager. Bad. The user is the protagonist; the backlog is the problem to dissolve.
>
> 3. We win when you close our tab and go play. inventoryfull.gg

### 5.4 Bluesky drip — voice/observation posts (personal or IF)

These run alongside the artifact posts to give the algo something to chew on between launches. Short by design.

- *my steam library has 737 games in it and i played mass effect again*
- *the gaming industry's real product is guilt. they sell you 300 games at 80% off and then you feel bad about it for five years.*
- *"what should i play" is an identity crisis dressed up as an entertainment decision. your backlog is 300 possible selves you haven't committed to yet.*
- *unpopular opinion: giving up on a game is a decision, not a failure. you learned something about yourself. that's progress.*
- *every time i open my steam library i feel like i'm standing in a warehouse full of beautiful things i will never touch. anyway i'm playing hades again.*
- *the moment you sit down to play, browse for 20 minutes, and close steam without starting anything — that's the universe telling you choice is a tax. pay less of it.*
- *Moving On tab is the feature i'm most proud of. giving yourself permission to stop playing a game is a decision, not a loss. less shame, more game.*
- *built this in four days with claude code. seventeen years doing brand strategy. zero years writing web apps before last week. the future is weird and i like it.*

### 5.5 Threshold for "is socials working"

Across posts 1–3 over 2 weeks:
- **Any organic engagement from non-followers** (likes, replies, reposts) → keep cadence, ship more
- **Zero organic engagement** → format isn't reaching. Pause Twitter/Bluesky push. Reallocate effort to Reddit + creator outreach.

---

## 6. Product Hunt Playbook

### 6.1 Pre-launch setup

**Step 1 — Maker account.**
1. Sign up at producthunt.com with Google or email. Use the Gmail tied to `hello@inventoryfull.gg`.
2. Username: `bradywhitteker`.
3. Profile photo: clean headshot. Same one used on Bluesky and LinkedIn so makers recognize you across surfaces.
4. Headline: `Brand strategist building Inventory Full. 17 years brand. 4 days code.`
5. Bio (~200 chars): `Built inventoryfull.gg in four days with Claude Code. First web app I've ever shipped. Solving my own 700-game backlog problem.`
6. Links: inventoryfull.gg, Bluesky, Discord invite.

**Step 2 — Connect social accounts.** PH cares about this for spam detection. Settings → Connected Accounts. Twitter/X if dormant, GitHub if you have one. Bluesky isn't supported — fine.

**Step 3 — Coming Soon page.** producthunt.com/products/new → "Create a Coming Soon page."

Required fields:
- Name: Inventory Full
- Tagline: see §6.2
- Description (~260 chars): *"Your library isn't a to-do list. It's 300 possible selves you haven't committed to. Inventory Full picks one game from your Steam, Xbox, PlayStation, or Playnite library based on your mood and how much time you have. Free. No sign-up."*
- Website: https://inventoryfull.gg
- Topics: Gaming, Productivity, Side Projects
- Logo: 240×240 PNG of the IF logomark from `public/brand/`
- Thumbnail: square crop of the OG card or a clean landing screenshot

Share the Coming Soon URL on Bluesky a few days before the launch date. People can "Notify me" and PH emails them on launch day — the closest thing to a follower base.

**Step 4 — Schedule.** 3 days before the chosen launch date, hit "Launch this product" from the Coming Soon page. Pick a Tue or Wed at 12:01 AM PST. Required at this stage: full description, gallery (5 images + 1 video), maker(s), "Built with" tags (Next.js, React, Tailwind, Supabase, Claude Code — claim them), Pricing: Free.

**Step 5 — Asset prep.** 5 gallery screenshots + 60–90s demo video — see §6.4. Logo at 240×240 and 1280×720. All saved to a Google Drive folder doubling as press kit.

**Step 6 — Warm list.** ~20 people: Bluesky mutuals who've engaged, Discord members, anyone who's beta-poked the site, the Reddit-thread responders. The script for launch morning: *"Hey, launched Inventory Full on Product Hunt today — would love your honest thoughts in the comments if you have a minute."* **Not "upvote."**

### 6.2 Tagline options (60-char limit, ranked)

**A.** `Import your backlog. Match your mood. Get playing.` (50) — Three beats, action verbs, ends on the brand tagline. Strongest. Default pick.

**B.** `Pick what to play from your library by mood and time.` (53) — Plain and functional. Good for PH's literal-minded skimmer.

**C.** `Your backlog isn't a to-do list. Get playing.` (45) — Punchier, psychology hook. Risk: hides the mechanic.

**D.** `One game from your library. Picked by mood, not luck.` (54) — Differentiator-forward, pre-empts the "random picker" question.

### 6.3 Listing description (287 words)

> Your game library isn't a to-do list. It's 300 possible selves you haven't committed to yet.
>
> Inventory Full doesn't help you organize your backlog. It helps you pick from it. You tell it your mood and how much time you have. It picks one game. You play or you don't. Moving on counts too.
>
> **What's actually in it:**
> - Imports from Steam, Xbox, PlayStation, and Playnite (CSV).
> - Mood and session length matching, weighted by skip history and genre cooldown. Not a random picker.
> - One pick at a time. Reroll if it's wrong. Skips train it.
> - A "Moved On" status that treats giving up as a real decision, not a failure.
> - 36 archetypes that read your library back to you with affection.
> - Multiple themes including a dinosaur mode. Yes really.
> - Free forever. No account required. Your data stays on your device.
> - Optional cloud sync via Discord or Google sign-in.
>
> **What it isn't:**
> A tracker. A spreadsheet. A social graph. A backlog leaderboard. We're trying to be the app you close so you can go play.
>
> **Built by:** a brand strategist with 17 years in the industry and zero years writing web apps before last month. Four calendar days from idea to live site using Claude Code. The hardest problem was emotional, not technical — how do you make giving up on a game feel like progress instead of failure?
>
> Free, no sign-up. Try it with a sample library if you don't want to connect anything yet.
>
> [inventoryfull.gg](https://inventoryfull.gg)

### 6.4 Gallery shot list (5 screenshots + demo video)

**Shot 1 — Landing hero.** Surface: signed-out landing. State: hero + subhead + import CTAs visible. Theme: default. Communicates: clean designed product.

**Shot 2 — Pick flow, mid-decision.** Surface: Reroll modal. State: mood selected (e.g. "cozy"), session length on "Medium ~1–2 hrs." Theme: default. Communicates: the two-input philosophy.

**Shot 3 — The pick reveal + "Why This Game?"** Surface: Reroll modal with single game picked. State: big cover art, "Why This Game?" chips visible (metacritic, time-fit, mood match). Use a recognizable game (Hades / Stardew / Hollow Knight). Theme: default. Communicates: we pick ONE, with reasoning. This is the differentiator vs random pickers.

**Shot 4 — Completion celebration with confetti.** Surface: `CompletionCelebration` modal. State: a game just marked Completed. Copy *"You committed, you followed through. That's the whole game."* visible. Confetti frozen mid-burst. Theme: default. Communicates: emotional payoff.

**Shot 5 — Dino theme on a full library grid.** Surface: main app, ~40+ games, grid view. State: dino theme active, tab on Backlog. Communicates: personality, range, real product with real game art.

**Demo video — 75-second structure.** Single take if possible, with text overlays. No live narration. Subtitle-friendly, autoplays muted on PH. See §10 for the full 75-second storyboard and production workflow. The version on PH should hit: landing → import → **PostImportSummary moment ("Your actual backlog is 155 games, not 200")** → mood/time → pick + Why This Game? → one reroll OR Jump Back In → completion share card → close on `inventoryfull.gg` + free/no-signup.

### 6.5 Maker's first comment (pin on launch)

> hey PH. solo builder here.
>
> i had 752 steam games and couldn't pick one to play. every backlog tool i found wanted me to catalog and tag and track. i wanted to close the app and go play a game.
>
> so i built the opposite. mood + session length → one game → play or skip. skips train it. moving on counts. completion gets confetti.
>
> free, no sign-up, data stays on your device unless you opt in to sync. imports steam, xbox, playstation, playnite.
>
> the weird part: i'm a brand strategist, not a developer. seventeen years in brand, zero years writing web apps before last month. built the first version in four days with claude code, then kept building. happy to talk about that process in the thread too.
>
> hoping some of you have the same problem. i'll be here all day — drop questions, feedback, roasts, screenshots of your pile. all welcome.

### 6.6 Launch-day FAQ (prepped replies)

PH algorithm rewards reply *speed* more than reply length. Aim for under 60 seconds per reply.

**Q1. "Is this just a random picker with extra steps?"**
> no. weights mood, session length, skip history, and genre cooldown so you don't get the same kind of game three times in a row. and skip is a real signal — it trains down what you keep saying no to. random would feel random. this feels picked.

**Q2. "How is this different from Backloggd or HowLongToBeat?"**
> Backloggd is a tracker — you log what you played for other people to see. HLTB is a database. neither helps you pick what to play *tonight*. Inventory Full only does the picking part. it actually uses HLTB data under the hood for session-length matching, but the front of the product is one decision, not a library.

**Q3. "Wait, you built this in 4 days with no dev background?"**
> first version in four days, yeah. then a month of building since — ~90 shipped features and counting, ~20K lines of code, all going through a pre-push review skill. brand strategist for 17 years, never written a web app before. used Claude Code. i described what i wanted in plain english and it scaffolded the architecture, wrote the API routes, set up the database. i did the product design, UX decisions, copy, and the calls on what *not* to build. claude did the implementation.
>
> the hardest problems weren't code. they were product — how do you make giving up on a game feel like progress instead of failure?

**Q4. "Is my data safe? Where does it live?"**
> localStorage on your device by default. nothing leaves your browser unless you opt in to sync (Discord or Google sign-in). if you sync, it goes to a Supabase row tied to your auth — RLS-locked, your data only. no ads, no third parties, no selling, no tracking across other sites.

**Q5. "What's the business model? How are you not going to enshittify this?"**
> free forever, no ads, no data sales — those are hard lines, written into the project rules. there's a Ko-fi tip jar in the footer. if it gets big enough that hosting hurts, i'd add an optional $3/mo cosmetic-only supporter tier. the core "import, pick, play" loop stays free. less time in the app = success is the actual product axiom. an ads model would fight that.

**Q6. "Will you add Nintendo Switch import?"**
> no public API for Switch libraries — Nintendo doesn't publish one. on the roadmap as "if Nintendo ever opens an API." in the meantime there's manual add (5 sec per game) and Playnite CSV import.

**Q7. "Mobile app?"**
> it's a PWA — install it on iOS or Android home screen and it runs like an app. native app isn't on the near roadmap. the loop is "open the app, get a pick, close the app and go play your console / PC." a native app would solve a problem i don't have yet.

**Q8. "Is there AI in this? LLM picking the game?"**
> no AI inside the product. the picker is a weighted scoring function — mood tags, session length vs HLTB time, skip history, genre cooldown, completion proximity. deterministic, fast, runs locally. used Claude Code to *build* the app, but the running product is plain TypeScript.

**Q9. "Can I sync across devices?"**
> yes — sign in with Discord or Google, your library syncs to Supabase, opens on any device. opt-in. signed out, everything is local to that browser. you can also export your library as JSON anytime.

**Q10. "What decides whether a game shows up vs gets buried?"**
> manually mark games "Moved On" (they stop appearing in picks) or "Ignored" (same effect, no judgment). the picker also down-weights games you've skipped recently and games in genres you've cycled through a lot. skip three times and the cooldown lifts on its own. five skips and a game leaves the suggestion pool entirely.

**Q11. "What's on the roadmap?"**
> a Discord bot with a `/pick` command for game-night servers — works without an IF account, drops one game into chat for "what should we play tonight." subscription-library mode for Game Pass / PS+ / GeForce NOW (pick from what's already included in what you already pay for). couch co-op pick flow for shared family libraries (PS Family Sharing, Xbox Home Console). bot is closest to ship — ~3 days of focused build.

### 6.7 Launch-day timeline (all times PST, dates relative)

| Time | Action |
|------|--------|
| 12:01 AM | Launch goes live automatically. Sleep. |
| 5:30 AM | Wake up. Open the PH listing on phone. Post the **maker's first comment**. Pin it. |
| 5:45 AM | Reply to any overnight comments (Europe + Asia time zones). Reply within 5 min while online. |
| 6:00 AM | Cross-post to Bluesky: short version + PH link. |
| 6:15 AM | DM the warm list. *"Launched on PH today, would love your honest thoughts in the comments."* Not "upvote." |
| 7:00 AM | Post to r/SideProject (if not already done as part of step 3). |
| 8:00 AM | Post to Indie Hackers. |
| 9:00 AM | Maker update comment #1: *"4 hours in, top question so far is X. here's what i'm hearing..."* |
| 9:30 AM | Email any warmed-up press contacts. *"Launched on PH today, here's the link, here's a one-paragraph description and screenshots."* |
| 10:00 AM | Reply sweep — last hour. |
| 12:00 PM | Lunch + reply sweep. Don't disappear. |
| 1:00 PM | Maker update comment #2: top-3 feedback themes from the morning. |
| 2:00 PM | Designer News post. |
| 4:00 PM | Show HN post goes live (separate workflow — see §7). Drop a comment in the PH thread linking to the HN discussion. |
| 5:00 PM | Reply sweep. |
| 5:30 PM | Maker update comment #3: end-of-west-coast workday wrap. |
| 7:00 PM | Dinner. Phone replies only. |
| 8:00 PM | Reply sweep. Post a screenshot of a sign-up's archetype reading (with permission) or a fun pick someone shared. |
| 9:00 PM | Bluesky: vibes update — what's surprised you about the day. |
| 10:00 PM | Final reply sweep. |
| 11:00 PM | Close laptop. PH ranking locks at midnight PST. Continue reply triage tomorrow morning. |

### 6.8 Cross-post checklist (launch day)

- [ ] **Bluesky** (6 AM PST)
- [ ] **r/SideProject** (7 AM PST) — coordinate, don't double-up if Reddit was already step 3
- [ ] **Indie Hackers** (8 AM PST) — milestone post: *"Launched on Product Hunt today after building in 4 days as a non-developer."*
- [ ] **Designer News** (2 PM PST) — submit as-is, low ceremony
- [ ] **Show HN** (4 PM PST or 9 AM PST — coordinate timing with PH reply load)
- [ ] **Discord** (anytime) — pin a #shipping-log post
- [ ] **Email signature**: *"Launched on Product Hunt today: [link]"*

### 6.9 PH risks/gotchas

- **No PH maker history.** First-time launches get less default visibility. The warm list and same-day cross-posts do the work a follower base would.
- **No follower base on X.** PH's algorithm leans on comment density and reply speed. Be on the thread all day.
- **Solo on launch day with reply-load equivalent to a day job.** Block the calendar. Tell pings you're heads-down.
- **The "4 days with AI" hook is double-edged.** Some PH commenters will be hostile to AI-built apps. Don't be defensive — *"the product solves a real problem, you can use it for free, judge it on that."* Don't get baited into meta arguments about AI.
- **Don't lead with Claude Code.** Product first, build story second-paragraph. Otherwise the whole conversation becomes about Anthropic, not Inventory Full.
- **PWA answer ready (Q7) for the inevitable "mobile app?" question.**
- **Vercel deploy freezes are real.** Don't ship code on launch day unless it's a hotfix. Ship anything new the day before so the prod baseline is clean.
- **Sentry will be noisier than usual.** Triage, don't panic.

---

## 7. Hacker News / Show HN

### 7.1 When + how

Same week as PH, not same day (unless willing to double reply load). Tue or Wed, 8–10 AM PT — catches West Coast wake-up + EU afternoon. Submit title + URL only. **Post the first comment from your account within 60 seconds.** Standard Show HN pattern. Be online and responsive for ≥4 hours after submission.

### 7.2 Pre-post checklist

- [ ] Fill in `[GAME 1]`, `[GAME 2]`, `[GAME 3]` in the first comment with games you actually played through the app. Real names beat plausible names.
- [ ] Update `752` if Steam library count has drifted.
- [ ] Pick a title from the three options below.

### 7.3 Title options

1. `Show HN: Inventory Full – I had 752 games and never played any of them, so I built this`
2. `Show HN: A backlog tool designed to make you use it less`
3. `Show HN: Inventory Full – mood-based game picker for your Steam/Xbox/PlayStation library`

Title 1 is the strongest hook for front-page traction. Title 2 is the most thesis-true. Title 3 is the most utilitarian and lowest-risk-of-snark. **Recommend 1.**

### 7.4 First comment (paste immediately after the post appears)

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

### 7.5 Prepared replies for predictable HN comments

**"How is this different from Backloggd / GG App / Grouvee?"**
> Those are trackers. They optimize for logging what you played. We optimize for picking what to play next. Backloggd is the biggest and the closest pivot risk — they have recommendations on the roadmap. If they ship a paralysis-solver with their audience, they own the category. Right now they don't, and the "less time in app = success" thesis isn't one a social-tracker product can adopt without contradicting its own engagement metrics.

**"Isn't this just Backlog Roulette / Pick a Game / Steam Roulette with extra steps?"**
> Backlog Roulette is the closest direct competitor. Steam-only, iOS-only (Android pending), filters behind a $3/mo paywall. Pick a Game is the most powerful Steam filter stack — but filter-first is the opposite of our thesis. Steam Roulette is pure randomness on Steam. We're the only multi-platform (Steam, Xbox, PlayStation, Playnite CSV) option with mood-and-time as the only required inputs and zero paywall. The differentiator is the "Moved On" framing, the multi-platform reach, the decision-engine specifics (skip memory, genre cooldown, completion proximity), and that the entire product is free with no premium tier dangling.

**"Couldn't you do this with a Python script that picks a random game?"**
> You could, and that's the right place to start. Then the picker has to handle skip history, genre cooldown, completion proximity, recent-activity bias, "Why This Game?" reasoning. Then Smart Import that auto-categorizes a 200-game dump. Then the Jump Back In cheat sheet for stalled games. Then state persistence, library refresh, share cards, archetypes derived from play patterns. The Python script is the first ten minutes. The product is the months after.

**"Why couldn't I just ask ChatGPT to pick a game from my Steam library?"**
> You can, and a lot of people do. The honest answer: that workflow has zero memory across sessions, zero skip history, zero awareness of what you actually own (unless you paste the list each time), and zero state for what you're currently playing vs. moved on from. We're owned-library-aware, state-aware, and the friction is two taps instead of writing a paragraph. ChatGPT is the closest thing to a sleeper threat in the category. The moat is the memory of your library and your patterns across sessions.

**"Why no account required? How do you persist data?"**
> localStorage. Source of truth lives on your device. Cloud sync is opt-in (Discord or Google), and even with sync on, the localStorage version is authoritative. If our backend goes down, your library is still yours.

**"Free forever sounds like a runway problem."**
> Tip jar's at ko-fi.com/inventoryfull. The product economics are minimal (Vercel, Supabase, Sentry — all on free tiers until ~2k MAU). If donations don't cover the bill at scale, the next step is a $3/mo cosmetic-only supporter tier. Core stays free forever. No ads, no data sale, no feature paywalls. Hard lines, not preferences.

**"What about the ToS implications of scraping Steam/PSN/Xbox?"**
> Public APIs only. Steam Web API, OpenXBL, psn-api. No scraping. PSN tokens are ephemeral and never persisted on the backend.

**"Did Claude Code really write most of the code?"**
> Yes. I described what I wanted in plain English, the AI scaffolded architecture, wrote the API routes, handled the database. I did product direction, UX decisions, the brand voice, and the long arguments with myself about what to build vs. what to cut. The split is roughly: code = AI, taste = me. The hard problems are taste problems. There's also a pre-push review skill that catches voice violations, AI-slop copy patterns, and obvious bugs before anything ships — building that workflow was the part that made the volume sustainable.

**"What's on the roadmap?"**
> A Discord bot with a `/pick` command for game-night servers (no IF account needed to use it — the bot drops one game into chat for the "what should we play tonight" question). Subscription-library mode for Game Pass / PS+ / GeForce NOW (pick from what's already included in what you already pay for). Couch co-op pick flow for shared family libraries (PS Family Sharing, Xbox Home Console). The Discord bot is closest to ship — about three days of focused build. The other two are exploration.

**"Where can I see the code?"**
> Closed source for now. The brand strategist part of me knows that closed-source artifacts read different from open-source ones on launch surfaces, and I'm not ready to think about contributor management. May reconsider later. The data model and integrations are all standard — Next.js, Supabase, public APIs — so there's no proprietary secret sauce. The sauce is the product thinking.

---

## 8. Creator Outreach

### 8.1 Tier model

The launch-bible template originally treated all creators the same. They aren't. Response rate and the right approach differ by audience size.

| Tier | Sub range | Approach | Expected response rate | Cadence |
|------|-----------|----------|------------------------|---------|
| 1 | 1k–10k | Hand-written, references specific moment in specific video | 25–40% | 10–15/day |
| 2 | 10k–100k | After Tier 1 produces ≥1 mention. Reference smaller-creator coverage for borrowed credibility | 8–15% | 5–10/day |
| 3 | 100k+ | Don't bother yet | <2% cold | Revisit after Reddit/HN front-page moment |

### 8.2 How to find Tier 1 creators

The pattern is "small but active, niche but relevant."

- **YouTube** for: `gaming backlog`, `patient gamer`, `what should I play`, `steam library tour`, `completionist gaming`, `backlog clearing`. Filter by uploads in last 12 months. Sort by view count ascending to find creators with engaged audiences but not yet huge.
- **Twitch** "Just Chatting" gaming streamers under 1k average viewers, especially those whose stream titles reference backlogs, library tours, or "what to play."
- **r/patientgamers and r/letsplay** — sort by top posts of the month. Creators who post their own videos there are exactly the audience.
- **Backloggd users with active blogs or YouTube channels** — Backloggd profiles often link out. People who maintain a public log are power users in waiting.
- **Twitter/Bluesky** searches for `#patientgamer`, `#backlog`, `#JRPG`, `#indiegaming` — find people who tweet about library frustrations.

Tracking spreadsheet columns: name, channel link, subs, last upload, specific video referenced, date sent, response, used product, mentioned.

### 8.3 The standard template (under 100 words, no attachments)

> **Subject:** free backlog tool, no sponsorship pitch
>
> Hey [Name],
>
> Watched [exact video title — paste it verbatim]. The bit around [timestamp or specific moment, e.g. "8:42 when you talked about closing Steam without picking anything"] is exactly the problem I built something for.
>
> I made a free tool called Inventory Full. You import your Steam/Xbox/PS library, tell it your mood and how much time you have, and it picks one game. That's the whole app. inventoryfull.gg
>
> Not a sponsorship pitch. No tracking link, no affiliate. Free, no sign-up, your data stays on your device. If you mention it, great. If not, no worries.
>
> Happy to send a press kit, give you early access to anything new, or do a quick voice-message walkthrough. Whichever's least effort.
>
> Brady
> inventoryfull.gg

**The thing this fixes vs. the older template:** specificity. Referencing the exact moment in their video proves you actually watched it, not just scraped a list. That changes response rate from ~5% (generic) to 25–40% (specific). The 12-second specificity is the trust move.

### 8.4 Competitive preemption variant

If the creator has covered Steam Roulette / Backlog Roulette / similar random pickers, the cold pitch above misses — they'll assume IF is the same category and pass. Send this version instead:

> **Subject:** free backlog tool — different angle from the random pickers
>
> Hey [Name],
>
> Saw your [video about / mention of] Steam Roulette / Backlog Roulette / [whatever they covered]. Built something in the same neighborhood but going a different direction.
>
> Mine's called Inventory Full. Two differences worth knowing: it's multi-platform (Steam, Xbox, PlayStation, Playnite) and the picker shows you the reasoning ("Why This Game?" — metacritic, time-fit, mood match, started-but-stalled). You can override the weighting by skipping. The skip teaches it. Five skips and a game leaves the suggestion pool entirely.
>
> Free. No sign-up. Your data stays on your device. inventoryfull.gg
>
> If you're considering a follow-up to the [previous video] or comparing tools in the space, happy to send a press kit or screenshots.
>
> Brady

Naming the alternative they covered shows you did the work and respect their existing coverage. Don't disparage the alternatives — neutral comparison only.

### 8.5 Common failure modes

- Watching the first 30 seconds and pretending you watched the whole thing. They can tell.
- Generic references ("love your gaming content"). Generic = mass-sent.
- Attaching a press kit or pitch deck. Don't. Send the link.
- Following up more than once. One email. No response = move on.
- Sending to "info@" or "business@" addresses. Find personal email or DM.

### 8.6 If they respond positively

**Path 1 — they want to try it.** Send a 60-second voice memo walking through your own use of the app. Personal, not produced. Then *"and the press kit if you need it for context, but the app speaks for itself: inventoryfull.gg."*

**Path 2 — they want a sponsored review.** Polite decline: *"I appreciate the interest. I'm not running paid placements right now — the product's free and donation-only, and the budget for marketing is basically zero. If you ever feel like talking about it organically, I'd be grateful, but no pressure."* Protects the integrity of mentions you do get. A creator who mentions you because they actually use the tool is worth ten paid placements.

---

## 9. Press

### 9.1 Two angles, same product

- **Gaming angle:** "The backlog manager that wants you to stop using it." Targets: Rock Paper Shotgun, PC Gamer, Kotaku, Polygon.
- **Tech/AI angle:** "Non-developer builds full web app in 4 days with AI." Targets: Ars Technica, The Verge, 404 Media, Hacker News.
- **Indie angle:** "Built in-public, no funding, side project." Targets: Indie Hackers, Dev.to, personal blog cross-post.

### 9.2 Press email

Use `hello@inventoryfull.gg`. Consider adding `press@inventoryfull.gg` as a separate forwarder before press-pitch batches — looks professional, keeps hello@ quieter.

### 9.3 Pitch template

> **Subject:** non-developer builds gaming app in 4 days with AI — tackles backlog paralysis
>
> Hi [Name],
>
> Quick pitch. I'm a brand strategist (17 years, two Costco-distributed brands, no dev background) who built a full web app called Inventory Full using Claude Code.
>
> The app tackles a surprisingly emotional problem: gaming backlog paralysis. Instead of helping people organize their library, it helps them pick what to play right now based on mood and available time. The thesis: your backlog isn't a task list, it's 300 possible selves you haven't committed to yet.
>
> It's designed so that spending LESS time in it equals success. Every competitor optimizes for engagement. We optimize for getting the user to close the tab and go play.
>
> Live at inventoryfull.gg. Free, no sign-up, imports from Steam/Xbox/PlayStation.
>
> Happy to chat about the AI-assisted build process or the product philosophy. No PR firm, no funding, just a guy with too many games.
>
> Brady Whitteker
> inventoryfull.gg
> hello@inventoryfull.gg

### 9.4 Press kit (public Google Drive)

- 3–4 high-res screenshots (app in action, not landing)
- OG card image
- Logomark (transparent PNG)
- One-paragraph plain-prose description (below)
- Key stats (import sources, feature list, price: free)
- Contact email (hello@inventoryfull.gg)
- One line: "Built with Claude Code by a non-developer"

### 9.5 One-paragraph plain-prose description

> Inventory Full is a free web app that helps gamers decide what to play from their existing library. Users import their Steam, Xbox, PlayStation, or Playnite collections, then select a mood and an estimated session length. The app picks one game from their library, weighted by genre history and skip patterns. There is no account requirement, no advertising, no third-party data sharing, and all data is stored locally in the browser by default with optional cloud sync. The product was built by Brady Whitteker, a brand strategist with no prior web development experience, using Anthropic's Claude Code. It is available at inventoryfull.gg.

---

## 10. Demo Footage Workflow

For the PH video, the HN hero image/GIF, landing-page demo, and creator outreach footage. All from one production session.

### 10.1 What you actually need (it's not AI video)

You don't need AI video generation. AI video tools (Veo, Kling, Runway, Pika) generate cinematic content from prompts. What you need is real app footage, polished. Different category.

**The stack:**

- **Screen Studio** (Mac, $89 one-time, no subscription). Records screen and produces motion-designed video with auto-zoom on clicks and smooth cursor. Zero editing skill required. Industry standard for SaaS founder demos.
- **ElevenLabs** (free tier sufficient). Natural AI voiceover. Record mic-muted, write the script after, generate the voice, drop it on the video.
- **Total time to first demo:** 2–3 hours including script. Faster after.

Cross-platform alternative if not on Mac: **Tella** (subscription). Avoid Loom for launch surfaces — too informal.

### 10.2 The 75-second structure

Current working ceiling for Product Hunt launch videos. Going longer loses the viewer before value lands.

The bracketed feature names match what's shipped per `BUILD_HISTORY.md` so the demo shows real product, not staged screens.

| Time | Section | What's on screen |
|------|---------|------------------|
| 0:00–0:08 | The setup | Open landing page, name the problem in one line ("700 games. Closed Steam without playing again.") |
| 0:08–0:18 | Import | Click "Import My Library," show platform options (Steam / Xbox / PlayStation / Playnite CSV), pick Steam, watch progress bar complete |
| 0:18–0:28 | **The PostImportSummary moment** | Breakdown card: *"Your actual backlog is 155 games, not 200. 12 already beaten, 5 ready to jump back into."* This is the silent reframe — give it 6 seconds. |
| 0:28–0:48 | The pick flow + "Why This Game?" | Mood (`Curious`), time (`1–2 hours`), hit Pick. Result card. Hover/click to surface "Why This Game?" chips — `metacritic 88`, `1–2 hr fit`, `mood match: curious`. **Hold for 8 seconds. The reasoning is what separates IF from random pickers.** |
| 0:48–0:60 | Reroll OR Jump Back In | Either: "If it's not right, roll again" — demonstrate, show one more card. OR: switch to a started-but-stalled game, expand it, show Jump Back In cheat sheet (progress bar, genre-aware tips). Pick whichever you can demonstrate cleanly. |
| 0:60–0:70 | The payoff | Share card after a "clear" status change. One sentence: "Finish something, the app roasts you warmly. Stop halfway, it counts that too." |
| 0:70–0:75 | The closer | "Free. No account. inventoryfull.gg" — text overlay on the URL |

Target 75 seconds. Write to 90. Cut. If you can't trim to 75 by the final pass, drop the reroll/Jump Back In segment and keep the PostImportSummary moment — that's the most defensible feature against the "is this just a random picker" reflex.

### 10.3 Production sequence

**1. Write the script as a bullet outline first.** Not the voiceover — bullets of what you'll click, in what order, and the one-sentence value of each screen. Highest-leverage move in product demo recording. Unscripted is what makes demos feel amateur.

Example bullet:
```
- Land on inventoryfull.gg → "I have 700 games and never play any of them."
- Click Import My Library → "Pick your platform."
- Choose Steam → import runs, progress bar
- PostImportSummary appears: "155 games, not 200. 12 already beaten."
  → "Most of what felt like overwhelm was completion bias."
- Mood: Curious. Time: 1–2 hours. Hit Pick.
- Pick fires → "A Short Hike. 90 minutes. Why this fits."
- Hover/click "Why This Game?" chips: metacritic 88, mood match, time fit
  → "Every pick comes with the actual reasoning."
- Click into a started-but-stalled game → expand → Jump Back In cheat sheet
  → "And for the games you almost forgot — the cheat sheet gets you back in."
- Show clear modal animation → "Free. No account. inventoryfull.gg"
```

**2. Record the screen in Screen Studio.** Mic muted. Don't narrate. Don't try to be perfect. Auto-zoom + smooth cursor will make a single decent take look motion-designed. If you fumble a click, re-record that segment.

**Pro settings:**
- Resolution: 4K capture (you can downscale; you can't upscale)
- Mouse cursor: highlighted, with click rings
- Auto-zoom: on
- Background: punchy gradient from Screen Studio library
- Webcam: off for the PH version (record a separate "founder talking head" cut for HN/social later)

**3. Write the voiceover to match the timing.** After recording, watch back and write narration that fits visual timing. ~150 words per minute spoken; 75 seconds = ~190 words. Cut anything that doesn't serve the visual.

Voice tone: warm, direct, slightly dry. Match the Bluesky post voice ("my steam library has 737 games in it and i played mass effect again"). Don't go documentary-narrator.

**4. Generate the voice in ElevenLabs.** Recommended voice profiles: "Adam" (warm masculine), "Brian" (slightly dry), "Daniel" (clean explainer). Generate the full 75-second script in one pass. Re-generate any line with weird emphasis.

**5. Drop the voice over the video in Screen Studio.** Audio import is supported. Layer the voiceover. If audio runs 2–3 seconds longer than visual, slow the visual playback by 5% or trim the script.

**6. Export.**
- PH: 1080p MP4, under 100MB
- HN: 720p is fine (HN doesn't host video — link to YouTube/Vimeo)
- Landing page: 1080p, ideally under 8MB. Embed as a looping autoplay above the fold or as click-to-play below the fold
- Social: 1:1 or 9:16 versions cut from same source

### 10.4 What NOT to do

- **Don't live-narrate.** Every viewer hears the lights flicker behind your eyes when you're thinking out loud.
- **Don't add music** unless carefully considered. Most product demo music feels stocky. Either invest in real licensing or skip.
- **Don't open with your face.** PH viewers want to see the product immediately. Face cut goes at the 0:50 mark if at all.
- **Don't try to show every feature.** One feature shown well beats five features shown briefly.
- **Don't overproduce.** Authenticity reads better than polish on HN. PH wants polish but rewards real product over AI-prettied product. Find the middle.

### 10.5 Future video queue (post-launch)

- 15-second social cut for Twitter/Bluesky. Just the magic moment (the pick fires).
- 30-second feature spotlight per major feature update.
- 60-second "behind the scenes" cut for HN comments and press kit — your face, the workflow, what changed week to week.
- Founder explainer (3–5 minutes) for sales-call-style audiences (creators, journalists) — full product thinking, longer format, separate session.

---

## 11. Landing Page One-Liner Audit

Notes and recommendations. Not copy.

### 11.1 The problem

The page has too many competing positioning lines. New visitors read the hero, scan one or two more, form a mental model, and leave if those models conflict.

### 11.2 Inventory of one-liners currently in play

| # | Line | Where | Role |
|---|------|-------|------|
| 1 | "Your backlog isn't the problem. Deciding is." | Landing hero | Brand promise / thesis |
| 2 | "get playing." | Logo tagline | Verb / action prompt |
| 3 | "Your library feels more like it's playing you. It should be the other way around." | Landing subhead | Problem framing |
| 4 | "Your pile's not gonna play itself." | Bible (subhead alt) | Casual brand voice |
| 5 | "Less time in the app = success." | Bible (internal axiom) | Anti-engagement positioning |
| 6 | "Skip the overthinking. Just tap a vibe." | Section header on landing | Sample picker intro |
| 7 | "Tonight's answer" | Sample card label | UI moment |

Seven distinct framings. Four visible above the fold.

### 11.3 What survives

**Hero: "Your backlog isn't the problem. Deciding is."** Keep as is. Strongest line. Reframes the reader's relationship to their own behavior in one move. Don't touch.

**Logo tagline: "get playing."** Keep as is. Small, persistent, lowercase, period. Imperative verb complements the hero's diagnostic framing. They don't compete — different jobs.

### 11.4 What to cut or rework

**Subhead: "Your library feels more like it's playing you. It should be the other way around."** Borderline. *"It should be the other way around"* does the same work as the hero. Redundant. Either cut entirely or replace with a line that supports the hero rather than re-argues it.

Suggested replacements that ladder up rather than restate:
- "Pick one game in 30 seconds. Play it or move on. Either way, you're past the hard part."
- "Two questions. One game. The deciding part is the part you outsource."
- (or just delete and let the hero stand alone — sometimes the strongest move)

**Section header: "Skip the overthinking. Just tap a vibe."** Different tonal register from the hero — more casual, more consumer-pop. Also competes with the hero by offering a different thesis ("overthinking is the enemy" vs. "deciding is the problem"). Dilutes both.

Suggested replacements:
- "One tap. One game. Go."
- "Try it on a sample library first."
- "Pick a mood. See what fits." (safest — describes action rather than re-arguing thesis)

**UI moment: "Tonight's answer"** Fine. Working as UI copy. No action.

### 11.5 What's missing

**Decision-engine specifics.** Page doesn't communicate that the picker is actually weighted (mood, time, skip history, genre cooldown, completion proximity, "Why This Game?" reasoning). Visitors who try once and see a pick may assume it's random. A small line near the picker — *"weighted by your skip history, genre cooldown, and recent activity"* — would address the predictable "is this just a random picker?" objection that comes up in every comment thread.

**Smart Import is invisible from the landing page.** The PostImportSummary moment ("Your actual backlog is 155 games, not 200") is the most defensible product moment in the entire app. Real emotional reframe, happens on every import. The landing page doesn't hint that it exists. Worth showing a snippet as a screenshot or referencing it in a "what happens when you import" line — preferably both.

**Jump Back In is invisible from the landing page.** Same problem. The cheat sheet for stalled games (progress bar + genre-aware tips like "check your quest log" / "save before this fight") is one of the most differentiated features against every random-picker competitor. None of them have it. Worth a small section or a screenshot.

**Proof of use.** You've been using the app for weeks. No testimonial-style line says so. A small line near the bottom — *"Brady, the guy who built this, has used it to actually play [GAME 1], finally start [GAME 2], and Move On from [GAME 3] in the last three weeks. The app is doing its job on its maker."* — does real credibility work without sounding corporate.

### 11.6 The product-depth tradeoff

The current page is light on features by design — thesis is "less time in app = success" and a feature-list landing contradicts that. Adding feature surfaces risks the same anti-thesis problem you'd have with a "Pro tier."

Way out: don't *list* features, *show one in action*. The PostImportSummary screenshot does this without making the page about features. It shows the reframe, which IS the thesis, applied to the user's actual library. Same with a Why This Game? chip set — not a feature, a glimpse of the picker thinking visibly.

The durable edge is "thesis discipline." Page is currently disciplined to the point of underselling. Right move: one or two product-in-action screenshots that prove the thesis is implemented, not just stated.

### 11.7 The single test for any new line

Does it ladder up to *"Your backlog isn't the problem. Deciding is."*? If yes, keep. If it offers an alternate framing, cut. Two framings dilute each other.

### 11.8 Tone reference

The bottom signup form copy (*"Hear when we ship something good. Occasional updates. No spam. Unsubscribe whenever."*) is in voice. Honest, direct, low-friction. Use that as the reference for editing anything else on the page. If a new line sounds bigger or punchier than that, it's trying too hard.

### 11.9 Priority order

1. Delete the subhead OR replace with one of the three alternatives (15 min)
2. Replace the "Skip the overthinking" section header (5 min)
3. Add the decision-engine specifics line near the picker (10 min)
4. Add a PostImportSummary screenshot somewhere on the page (20 min including capturing it from your own import)

Total: ~50 min.

---

## 12. Activatable plays (off-canon)

These sit dormant unless explicitly activated. Each one has a clear "what triggers it" — don't run them by default.

### 12.1 LinkedIn launch posts

**Status:** Off the canonical distribution path. The May-5 distribution plan said *"No LinkedIn. Wrong audience. Patient/dad/indie gamers don't hang out there."* That's correct for the gaming audience.

**When to activate:** Brady's LinkedIn network is brand-strategists, founders, agency people — a different audience with a different story angle ("17 years brand, 4 days code" and "use this less as positioning"). Activate when (a) PH or HN has produced traffic worth amplifying, (b) Brady wants the AI/non-developer story to reach his professional network for credibility/network value, or (c) the gaming-audience plays plateau and a different audience is needed.

**Drafts and full playbook:** `docs/launch-plays/linkedin-activatable.md` — two angle drafts (product/psychology + AI/non-developer), variant hooks, comment-reply prep, image recommendation.

### 12.2 Paid Reddit Ads boost

**Status:** Off-canon. Only activate after organic Reddit post has 50+ upvotes.

**Trigger:** If an organic r/SideProject or r/patientgamers post hits 50+ upvotes within 6 hours, a $20 Reddit Ads promoted-post boost on the SAME organic post amplifies it to similar subs. Don't run paid Reddit until you have organic signal to amplify.

**Why not Google Ads:** Gaming-adjacent CPCs run $1–3+ on Google. $20 = ~10 clicks. Cold-paid traffic has the worst retention. No word-of-mouth flywheel. Reddit Ads at $0.50–1.50 CPC, pre-qualified audience, ~15–30 clicks with much better fit.

### 12.3 IF persona accounts (Twitter, Bluesky)

**Status:** Dormant until personal accounts have driven real visits.

**Trigger to activate:** Reddit + Twitter posts from personal accounts have produced ≥1 organic mention from a non-follower. Then IF accounts become the place for daily/weekly archetype-of-the-day posts (using share cards), voice-driven brand commentary, and engagement with users who tag the brand.

Don't run them while their follower counts are single-digit. They reach no one.

### 12.4 Discord bot Tier 1 build

**Status:** Spec'd, not built. See `docs/discord-bot-spec.md`.

**Trigger:** Brady has a 3-day window of focused time OR PH/HN has produced traffic that justifies the distribution play. The `/pick` command works without an IF account — gaming Discords install it for the random-pick utility, members discover IF through embed footer. Bottom-up distribution.

### 12.5 TikTok / YouTube Shorts

**Status:** Premature. Defer until post-1k MAU.

---

## 13. Infrastructure Checklist

### 13.1 Live now ✅

- Site live at inventoryfull.gg
- Email forwarders: hello@ / hi@ / info@ / help@ / press@ / privacy@ → IF Gmail
- Supabase auth (Discord, Google, email)
- Supabase cloud sync (opt-in)
- `wants_updates` + `wants_updates_consented_at` on `profiles` (migration 007)
- Supabase email templates (6 styled transactional templates pasted)
- Sentry error monitoring
- UptimeRobot uptime monitoring
- OG image (1200×630, unfurls correctly)
- GA4 events
- Playwright e2e
- L2 metadata cache (Supabase `game_metadata` table)
- Ko-fi at ko-fi.com/inventoryfull
- Bluesky `@inventoryfull.gg` (custom-domain handle live)
- Discord server (invite `gJdmmymGg3`)

### 13.2 Needed before public push

- [ ] Product Hunt maker profile + Coming Soon page (see §6)
- [ ] Press kit Google Drive folder, public link
- [ ] Demo footage produced (see §10)
- [ ] Landing page one-liner cleanup (see §11)

### 13.3 Week 2+ (post-launch infra, not blocking)

- [ ] Resend wired for transactional (custom domain, SPF/DKIM/DMARC)
- [ ] One-click unsubscribe (Privacy Policy promises it — must land before first marketing send)
- [ ] Physical address in footer (CAN-SPAM requirement before first marketing send)
- [ ] Pre-seed metadata cache with top 500 Steam games (reduces RAWG burnout risk on traffic spike)
- [ ] Fetch timeouts on RAWG / HLTB / PSN / Steam / Xbox / ITAD
- [ ] PSN token Sentry scrubber (beforeSend)
- [ ] PSN trophy pagination cap (max 5 pages)
- [ ] Upstash Redis for global rate limiting
- [ ] Mobile Brave / Chromium theme bug fix

### 13.4 Conditional (triggered by MAU)

- [ ] Vercel Pro ($20/mo) — trigger at 500 DAU or first bandwidth warning
- [ ] Supabase Pro ($25/mo) — trigger at 500 DAU or connection-cap warning
- [ ] Sentry Team (~$26/mo) — trigger when free tier's 5k errors/mo gets hit
- [ ] RAWG Commercial ($149/mo) — **HARD BLOCKER** before any revenue feature. Free tier is non-commercial ToS.
- [ ] Resend paid ($20/mo) — trigger at 3k subscribers

---

## 14. Monetization Roadmap

**Principle.** Donationware from day one. Zero friction. Revenue is not the launch metric; retention and word-of-mouth are.

### Phase 1 — Launch (0 → ~2k MAU)

**Donation-only.**
- Ko-fi link in footer and about page
- Message: *"Inventory Full is free and always will be. If it saved you from another hour of library paralysis, you can buy me a coffee."*
- No tiers, no goals, no guilt-trip copy.

### Phase 2 — Supporter tier (~2k MAU)

**Trigger:** rolling 30-day MAU crosses 2k.

**What it is:** $3/mo or $30/yr cosmetic perks only. No feature-gating. Guest/free experience stays complete.

**Perk candidates (pick 2–3):**
- Exclusive themes (add 2–3 supporter-only variants to existing 13)
- Extra archetype variants (add 6 for supporters to existing 36)
- Animated logomark in their profile
- Early access to new features (not walls, just "ships to supporters two weeks earlier")
- Supporter badge on share cards (subtle, opt-in)

**Never gated:** core pick flow, any platform import, cloud sync, stats, share cards (core version).

**Prerequisite work:** Stripe, `subscribers` table + webhook from Stripe, Privacy Policy update, account settings UI.

### Phase 3 — Affiliate deals (RAWG-gated)

**Hard blocker:** RAWG Commercial ($149/mo) must be signed BEFORE any affiliate link ships. Free RAWG tier violates non-commercial ToS the moment you take revenue.

**When:** evaluate at 5k MAU when sustained MAU makes $149 + Stripe fees break-even at realistic conversion rates.

**What it looks like:** deals on games the user already owns or has wishlisted. Surfacing ITAD/Humble/Fanatical price drops on *your* library. Clear FTC disclosure on every affiliate surface.

**Hard line:** never surface deals on games the user doesn't own based on behavioral profiling. That crosses from "helping you play what you have" to "selling you new things based on your data," outside `.claude/rules/legal-compliance.md`.

### Phase 4 — Nothing (intentionally)

No ads. No data sales. No sponsored game placements. Hard lines.

---

## 15. Scale-Up & Virality Response

### 15.1 Cost ladder

| Tier | MAU | Base cost | Trigger | What breaks first |
|------|-----|-----------|---------|-------------------|
| Launch | 0–2k | $1–5/mo | — | Nothing; free tiers hold |
| Early | 2k–5k | $1–27/mo | Sentry cap | Sentry errors/mo |
| Mid | 5k–10k | $27–150/mo | Vercel/Supabase Pro | Connections, bandwidth |
| Revenue gate | 5k+ with donations viable | +$149 | RAWG Commercial required before any affiliate link | RAWG ToS |
| Scale | 10k–50k | $150–320/mo | Vercel Pro + Supabase Pro + RAWG commercial | Enrichment budget |

L2 cache (Supabase `game_metadata`, live) lengthens every tier — pre-seed top 500 Steam games before launch to extend further.

### 15.2 If a post goes viral (Reddit/PH/HN unexpected spike)

**Hour 1:** dashboards.
- Vercel bandwidth (free cap = 100GB/mo, alert at 50%)
- Supabase connections (free = 60 concurrent, alert at 40)
- Sentry rate (free = 5k errors/mo; if spike, bugs or ratelimit config problems)
- RAWG key usage (free = 20k/mo)

**Hour 2–6:**
- If Vercel bandwidth spiking, check OG image hammering (`/clear/[id]/opengraph-image`) — if so, temporarily swap to static OG for hot URL
- If Supabase connection pool saturated, reduce enrichment concurrency (`lib/enrichment.ts` — drop 5 → 2)
- If RAWG usage spiking, bump L2 TTL from 30d to 90d for the week

**Day 1–3:**
- Add rate limit: 3 imports per user per hour
- Pre-seed top 500 Steam games into metadata cache (if not done pre-launch)
- Pull traffic source report — sustained or spike?

**Week 1 decision:**
- Sustained traffic (>500 DAU for 5+ days) = commit to Vercel Pro + Supabase Pro. Cost predictable, worth headroom.
- Spike then decay = stay free tier, note ceiling for next time.

### 15.3 Worst-case blast radius

1. Vercel throttles rather than bills — no surprise invoice, but users see 503s
2. Supabase rejects new connections — new sign-ins fail, existing users with cached sessions keep working
3. RAWG 429s — enrichment queue silently backs up, no user-facing breakage
4. **Nothing loses data.** localStorage authoritative; Supabase sync, not source of truth. Worst case: a few minutes of cloud-sync lag.

This is why localStorage-authoritative (locked in `AGENTS.md`) matters. We can't lose users' libraries even if the whole cloud stack is down.

---

## 16. Metrics & Monitoring

### 16.1 Daily watch (launch window)

| Metric | Source | Target | Alert |
|--------|--------|--------|-------|
| DAU | GA4 | ↗ curve | drop >30% day-over-day |
| Sample → import conversion | GA4 `library_imported` after `sample_loaded` | >15% | <5% |
| Pick → play signal | GA4 `pick_delivered` | every import produces ≥1 pick | <50% pick rate |
| Share card creation | GA4 `clear_shared` | any | zero for 3 days post-launch = broken virality loop |
| Error rate | Sentry | <0.5% of sessions | >2% |
| Bandwidth | Vercel | <50% of free cap | 75% |
| DB connections | Supabase | <60% of cap | 75% |

### 16.2 Weekly watch (post-launch)

- **Retention:** cohort 1 — do people come back in week 2?
- **Pick-to-close ratio:** do people actually play what we pick, or reroll forever?
- **Moved-On usage:** is Moving On being used, or are games sitting in Backlog forever?
- **Feedback volume:** Discord + emails + Reddit DMs — signal of what to fix next

### 16.3 What to NOT measure

- Time in app (we want it to decrease; measuring makes it a false north star)
- Number of games in library (vanity)
- Engagement (wrong incentive — see product thesis)

---

## 17. Compounding bet

What to build, not who to follow. Every artifact below is something a stranger can post on our behalf. That's the only growth that matters at this stage.

- Archetype share cards ✅ (live)
- Clear share cards ✅ (live)
- Pile share cards ✅ (live)
- Stats share cards ✅ (live)
- Merch (gated, see `docs/merch-plan.md`)
- Discord bot `/pick` (will spread to other servers, see `docs/discord-bot-spec.md`)

---

## 18. What NOT to do

- No "trending topic" reaction posts for IF accounts. Off-brand and ecosystem-saturated.
- No reposting personal-account posts to IF accounts. Looks insecure; audiences spot it.
- No begging for shares. "Please RT to help a solo dev!" — never. Trust the work.
- No follower-for-follower pods. Quality > count.
- No paid amplification on Twitter/Bluesky.
- No fake organic. Sock puppet posting, fake replies. Don't start.
- No same-day cross-sub Reddit posts (looks coordinated).
- No alt-account commenting on your own posts.
- No asking friends to upvote on PH.
- No marketing vocab ("revolutionary," "game-changing").
- No delete + repost if no early traction.
- No arguing with critics. Thank them, link to follow-up fix if real.
- No cross-posting identical text across subs.
- No skipping the voice-charter scan because "it's just a Reddit post." Voice is the moat.

---

## Source-merge notes

This doc consolidates these source files (now archived in `docs/archive/launch-merge-2026-05-12/`):

- Original `LAUNCH_BIBLE.md` (Apr 21) — kept positioning, voice, PH playbook, monetization, infra, scale-up, metrics
- `distribution-plan.md` (May 5) — Reddit sequencing canon, Twitter/Bluesky artifact strategy, anchor principles, what-NOT-to-do, compounding bet
- `notes/inventoryfull-handoff-2026-05-12 2/` — Show HN draft (replaced old Show HN), creator outreach tier model (replaced old template), demo footage workflow (new), landing page audit (new), supplementary subs (new), README integration notes
- `docs/launch-posts/reddit-r-patientgamers-post.md` (this session) — best of merged into §4.6 r/patientgamers (karma pre-flight, alt hooks, reply playbook)
- `docs/launch-posts/product-hunt-prep.md` (this session) — merged into §6 Product Hunt Playbook
- `docs/launch-posts/linkedin-launch-post.md` (this session) — kept in `docs/launch-plays/linkedin-activatable.md` as off-canon activatable
