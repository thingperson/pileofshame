# Launch Bible — Inventory Full

**Locked 2026-04-21.** Single source of truth for how we take Inventory Full public. Supersedes: `marketing-prep.md`, `reddit-launch-prep.md`, `email-strategy.md`, `scale-up-plan.md`, `scale-up-costs-2026-04-20.md`, `pre-launch-risks-2026-04-15.md`, `notes/inventory-full-launch-plan_1.md`. Those live in `docs/archive/launch-2026-04-21/` for history.

Open this doc daily during the launch window. Every day has a task block. Do the tasks.

---

## TL;DR

- **Product is ready.** Ship-readiness review (Apr 14) came back "launch now." Nothing left is a true blocker.
- **Site is already live.** No Friday-Apr-24 announcement. The quiet-live lets us build runway.
- **Public push starts Tue Apr 28.** Bluesky + Reddit warmup fills Apr 21–27.
- **Main event:** Reddit posts staggered Apr 29 / 30 / May 1 / 3. Product Hunt May 6. Show HN same week.
- **Monetization:** Donationware from day one (Ko-fi). Supporter tier ($3–5/mo cosmetic perks) ships at 2k MAU. Affiliate revenue blocked on RAWG commercial ($149/mo), deferred.
- **One Insight to repeat ruthlessly:** *"Every other app wants you to catalogue and organize. We want you to close the app and go play."*

---

## Table of Contents

1. [Positioning & Voice (Locked)](#1-positioning--voice-locked)
2. [Pre-Launch Punch List](#2-pre-launch-punch-list)
3. [Day-by-Day Playbook (Apr 21 → May 18)](#3-day-by-day-playbook-apr-21--may-18)
4. [Channel Playbooks](#4-channel-playbooks)
5. [Copy Bank](#5-copy-bank-paste-ready)
6. [Infrastructure Checklist](#6-infrastructure-checklist)
7. [Monetization Roadmap](#7-monetization-roadmap)
8. [Scale-Up & Virality Response](#8-scale-up--virality-response)
9. [Metrics & Monitoring](#9-metrics--monitoring)
10. [BradyOS Handoff](#10-bradyos-handoff)

---

## 1. Positioning & Voice (Locked)

### The One Insight
> **Every other app wants you to catalogue and organize. We want you to close the app and go play.**

Use verbatim in: Reddit intro posts, PH listing, press pitches, any cold pitch. It is the category line.

### Taglines
- **Brand line (primary):** `get playing.` (lowercase, period)
- **Landing subhead:** "Your pile's not gonna play itself."
- **PH / utility tagline:** "Import your backlog. Match your mood. Get playing."
- **Celebration surface only:** "Less shame. More game."

### Core pitch (three sentences)
Gaming backlogs aren't a task list — they're decision paralysis in a UI. Inventory Full takes your Steam/Xbox/PlayStation library, asks your mood and time, and picks one game. You play or you don't; moving on counts too.

### What we're not
- Not a tracker (Backloggd, HLTB log what you played). We decide what you play next.
- Not a random picker. Weights mood, time, skip history, genre cooldown.
- Not a social network. No feeds, no comparisons, no leaderboards.
- Not a gamification app. No streaks, no completionist pressure. Moving on = winning too.

### Voice rules (short version — full in `.claude/rules/voice-charter.md`)
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

Dated. Owner. State. Integrates with the day-by-day playbook below — these gate the Reddit posts, not the already-live site.

### 🔴 Blocking public push (fix before Apr 28)

| # | Item | Why it blocks | Target | State |
|---|------|---------------|--------|-------|
| B1 | Landing wordmark rendering purple on hero | First thing reviewers see; brand integrity | Apr 23 | ✅ 2026-04-21 (landing h1 reverted to bold text; DefaultBanner forces white `--wordmark-in`) |
| B2 | Landing claims "5 ways to pick today's game" but shows 3 | Copy drift looks sloppy under scrutiny | Apr 23 | ✅ 2026-04-21 (headline → "3 ways") |
| B3 | QA all 3 reroll modes (Just 5 Mins / Quick Session / Resume) — 10 picks each, confirm Quick Session never surfaces 40h+ games | Reddit will stress-test this on day one | Apr 25 | ⬜ |
| B4 | OG unfurl test on Discord, Twitter/Bluesky, Reddit, iMessage, Slack (real platforms, not preview tools) | Share cards are our virality loop | Apr 25 | ⬜ |
| B5 | Sample library first-pick tuning — first 3 rolls across all modes must feel genuine | Most people try sample before importing | Apr 26 | ⬜ |

### 🟡 Should fix (ok to ship Apr 28 without, but reddit traffic will surface)

| # | Item | Target | State |
|---|------|--------|-------|
| S1 | Safari desktop line icons not rendering (carried from earlier) | Apr 26 | ⬜ |
| S2 | Share-card flavor-text reroll button (composer) | Apr 27 | ✅ 2026-04-21 (🎲 button on flavor preview; excludes current line) |
| S3 | Landing hero CTA position on mobile — confirm above fold on iPhone SE width | Apr 26 | ⬜ |
| S4 | "Lines Drawn" label on stats page — hover tooltip or rename | Apr 27 | ⬜ |
| S5 | Four-button action row visual hierarchy (Return/Not for me/Don't suggest/Delete) | Apr 27 | ⬜ |

### 🟢 Post-launch (week 2+)

- Mobile Brave/Chromium theme rendering bug (light/cozy)
- Nintendo onboarding reframe
- Fetch timeouts on external APIs (RAWG/HLTB/PSN/Steam/Xbox/ITAD)
- PSN token scrubber in Sentry beforeSend
- PSN trophy pagination cap (max 5 pages)
- Pre-seed metadata cache with top 500 Steam games
- Completion CTA copy A/B test

### 🟢 Infrastructure (week 2+, see §6)

- Resend wired for transactional email (currently Supabase defaults)
- One-click unsubscribe (Privacy Policy promises it)
- Ko-fi / donation link live
- Bluesky account + custom domain handle
- Product Hunt "Coming Soon" page
- Press kit folder (public Google Drive)
- Discord server (community landing)

---

## 3. Day-by-Day Playbook (Apr 21 → May 18)

**Rule:** open the bible at the start of each day. Do the day. If an item slips, push it one day, not forever.

### Prep Week — Apr 21 to Apr 27

Theme: build reception infrastructure and start the Reddit karma clock. No product announcements yet.

---

**Tue Apr 21 (today)**
- [x] ~~Ko-fi profile~~ — live already at `ko-fi.com/inventoryfull`; just verify footer + about page link
- [x] ~~press@/help@/info@ forwarders~~ — created in Porkbun
- [ ] Claim Bluesky handle: try `@inventoryfull.gg` via DNS TXT on the domain (cleaner brand match than `.bsky.social`). Bio = "your pile's not gonna play itself. free backlog tool. steam / xbox / ps. built by @bradyw."
- [ ] Decide Reddit warmup account: pick ONE old low-karma account, write it down, do not use any other
- [ ] Bluesky post #1: see [Bluesky Copy](#bluesky-copy) (post D1)
- [ ] Reddit: 3 genuine comments on r/patientgamers or r/Steam (no product mention, ever, this week)

**Wed Apr 22**
- [ ] Bluesky post #2 (post D2)
- [ ] Reddit: 3 more comments. Target: 10 karma by end of Fri.
- [ ] PH: create maker profile at producthunt.com/@bradywhitteker, add "Coming Soon" for Inventory Full
- [ ] Start press kit folder: public Google Drive, add 4 screenshots + OG card + logomark + one-paragraph description

**Thu Apr 23**
- [x] ~~**FIX B1** (wordmark purple) + **FIX B2** ("5 ways")~~ — both shipped Apr 21 (commit `5cf101c`)
- [ ] Bluesky post #3 (post D3)
- [ ] Reddit: 3 comments
- [ ] YouTube outreach list: search "steam backlog", "gaming backlog manager", "backlog challenge"; save 10 creators 5k–100k subs to a spreadsheet (name, handle, video URL, sub count, last upload)

**Fri Apr 24** (quiet-live day — no announcement)
- [ ] Bluesky post #4 (post D4)
- [ ] Reddit: 3 comments
- [ ] Discord server: create, name it "Inventory Full", set up #general, #got-picks, #feedback, #shipping-log. Don't invite anyone yet — just the shell.
- [ ] Verify Ko-fi link is present in site footer + about page (profile already live)

**Sat Apr 25**
- [ ] **QA reroll modes (B3)** — 10 picks each, real library, not sample
- [ ] **OG unfurl test (B4)** — paste a `/clear/<id>` URL into Discord DM, Bluesky compose, Reddit compose, iMessage, Slack. Screenshot each. File bugs for anything broken.
- [ ] Bluesky post #5 (post D5)
- [ ] Reddit: 3 comments + reply to one backlog-related thread with something substantive (no link)

**Sun Apr 26**
- [ ] **FIX B5** (sample first-pick tuning) + **S1** (Safari icons) + **S3** (mobile CTA)
- [ ] Bluesky post #6 (post D6)
- [ ] Reddit: 2 comments (Sunday is lower-engagement)
- [ ] Draft the Reddit posts for next week — open [Reddit Copy](#reddit-copy), adapt the personal stats (game count, actual library path)

**Mon Apr 27**
- [ ] **FIX S4** (Lines Drawn label) + **S5** (action row hierarchy) — ~~S2~~ shipped Apr 21
- [ ] Bluesky post #7 (post D7) — "been building a thing. tell you about it soon."
- [ ] Reddit: 3 comments. End-of-day karma check — should be 50+. If not, push Tue post to Wed.
- [ ] Final OG unfurl re-test after all fixes
- [ ] PH asset pack finalized: 5 screenshots, 60s video (import → mood → pick → play), tagline, description, logo

---

### Launch Week 1 — Apr 28 to May 4

Theme: Reddit + Bluesky announcement. Respond to every comment within an hour.

---

**Tue Apr 28**
- [ ] Bluesky post #8 (D8 — blurred teaser)
- [ ] Reddit warmup final: 2–3 more comments to pad recent activity on the posting account

**Wed Apr 29 — REDDIT DAY 1**
- [ ] **Post to r/patientgamers** at ~10am EST — see [Reddit Copy r/patientgamers](#reddit-rpatientgamers-confessional)
- [ ] Bluesky launch post #9 (D9) — ~1 hour after the Reddit post; include the 15s GIF
- [ ] Monitor Reddit comments for next 6 hours continuously. Reply to every one within 30 min.
- [ ] Check Sentry, Vercel bandwidth, Supabase connections at 12pm, 3pm, 6pm, 10pm EST

**Thu Apr 30 — REDDIT DAY 2**
- [ ] **Post to r/Steam** at ~10am EST — see [Reddit Copy r/Steam](#reddit-rsteam-utility)
- [ ] Bluesky post #10 (D10)
- [ ] Keep replying to Day-1 r/patientgamers comments (they'll keep coming)
- [ ] Email 3 YouTube creators from the list using [Creator Outreach](#creator-outreach-template)

**Fri May 1 — REDDIT DAY 3**
- [ ] **Post to r/truegaming** — the philosophy post, no product link — see [Reddit Copy r/truegaming](#reddit-rtruegaming-philosophy-no-link)
- [ ] If the truegaming thread gets questions about what you're building, mention Inventory Full naturally in a reply (not in the top-level post)
- [ ] Bluesky post #11 (D11)
- [ ] Check infrastructure dashboards (same cadence as Wed)

**Sat May 2**
- [ ] Bluesky post #12 (D12 — testimonial if available, otherwise reflection)
- [ ] Reply to stragglers on all three Reddit posts
- [ ] Draft gamedev Show Off Saturday post for tomorrow

**Sun May 3 — REDDIT DAY 4**
- [ ] **Post to r/gamedev Show Off Saturday thread** — see [Reddit Copy r/gamedev](#reddit-rgamedev-show-off-saturday)
- [ ] Bluesky post #13 (D13)
- [ ] Email 3 more YouTube creators
- [ ] Press pitch batch #1: Rock Paper Shotgun, PC Gamer, Ars Technica, The Verge (use [Press Pitch](#press-pitch) template)

**Mon May 4**
- [ ] Bluesky post #14 (D14 — what I learned)
- [ ] r/SteamDeck and r/IndieGaming as follow-up posts (softer than the main subs, lower-stakes)
- [ ] PH final asset review + schedule coming-soon launch email

---

### Launch Week 2 — May 5 to May 11

Theme: Product Hunt + Hacker News. Sustain Reddit and Bluesky.

---

**Tue May 5**
- [ ] PH pre-launch prep: email everyone you've built a relationship with over the past 2 weeks (Bluesky followers, Reddit commenters, Discord members). Not "upvote me." Say: *"we're on Product Hunt tomorrow. would love your eyes on it."*
- [ ] Bluesky post: "tomorrow on Product Hunt. come say hi."

**Wed May 6 — PRODUCT HUNT LAUNCH**
- [ ] **PH launch at 12:01 AM PST** — use [PH Listing](#product-hunt-listing) copy
- [ ] Be online by 6am PST. Stay online 18 hours.
- [ ] Reply to every PH comment within 1 hour.
- [ ] Bluesky launch post (morning + evening check-in)
- [ ] Submit **Show HN** on Hacker News — use [Show HN](#show-hn)
- [ ] Post to r/SideProject, Indie Hackers, Designer News
- [ ] Monitor dashboards every 2 hours

**Thu May 7**
- [ ] PH follow-up: thank everyone who commented yesterday, maker comment update ("we hit #X overall, here's what I heard most")
- [ ] Bluesky: PH recap post + Show HN recap
- [ ] HN comment replies (threads can go 24+ hours)

**Fri May 8**
- [ ] Indie Hackers post: full build story + PH + HN numbers
- [ ] Press pitch batch #2: Kotaku, Polygon, Indie Hackers interview request
- [ ] Bluesky post

**Sat May 9 / Sun May 10 / Mon May 11**
- [ ] One Bluesky post per day
- [ ] Respond to any press replies
- [ ] First real metrics review: see [Metrics & Monitoring](#9-metrics--monitoring)

---

### Follow-Up — May 12 to May 18

Theme: iterate on feedback, write the retrospective, set the week-2+ infra work.

---

**Mon May 12 → Sun May 18**
- [ ] Daily Bluesky post, lower cadence ok (1/day or alternate days)
- [ ] Write "what I learned launching Inventory Full" post — target: Dev.to + Bluesky thread + Indie Hackers
- [ ] Ship top-3 feedback items from the launch window (keep it tight, don't chase everything)
- [ ] Schedule next competitive audit (monthly cadence — see `docs/competitive-refresh-prompt.md`)
- [ ] Start the Week 2+ infra list (Resend, pre-seed cache, fetch timeouts, RAWG commercial evaluation at MAU threshold)

---

## 4. Channel Playbooks

### 4.1 Bluesky

**Why it over X.** The gaming corner of Bluesky is small enough that organic engagement from a single-digit-follower account still gets seen. On X, same effort gets ~30 followers. On Bluesky, 200–500 is realistic in 2 weeks.

**Setup today.**
- Claim `@inventoryfull.gg` via DNS (add a TXT record `_atproto.inventoryfull.gg` = `did=did:plc:...`). Instructions in Bluesky's "Change handle" → "I have my own domain." This is cooler than `.bsky.social` and reinforces the brand.
- Bio: "your pile's not gonna play itself. free backlog tool. steam / xbox / ps. built by @bradyw."
- Profile image: logomark (already in `public/if-logos/`). Banner: OG card variant or theme screenshot.

**Posting cadence.** 1/day during prep week, 2/day launch week 1, 1/day sustain. More than that = noise, less than that = algo forgets you.

**Engagement pattern.**
- Reply to people complaining about their backlog with one useful or funny line. Do NOT drop the link in replies.
- Quote-post gaming journalists when they cover decision fatigue / GamePass sprawl / Steam summer sale.
- Engage genuine — the algo rewards threads you start, not lurking.

**Don'ts.**
- Don't follow-spam (100+ follows in a day looks botty).
- Don't hashtag-heavy (Bluesky culture is conversational).
- Don't schedule / automate — Bluesky users smell it.
- Don't only post about the product. Personality first.

See [Bluesky Copy](#bluesky-copy) for D1–D14 drafts.

---

### 4.2 Reddit

**The 90/10 rule.** Site-wide guideline: ~90% of your activity should be genuine participation, ~10% can reference your own stuff. Mods enforce aggressively. Accounts that only post their own product get flagged as spam instantly.

**The warmup protocol (the one thing that makes this work).**
- ONE old account only. Don't use multiples. Reddit's sockpuppet detection catches it.
- 7–10 days of genuine comments on r/patientgamers, r/Steam, r/SteamDeck, r/truegaming. NOT about Inventory Full.
- Upvote stuff. Reply to people. Aim for 50–100 karma from organic comments before posting product.
- By launch day the account looks like someone who woke up and started using Reddit, not a marketing vehicle.

**Subreddit map.**

| Sub | Members | Vibe | Post type | Risk |
|-----|---------|------|-----------|------|
| r/patientgamers | 1.2M | Thoughtful, long-form | Confessional personal story + link | Mod removal if reads promo |
| r/Steam | 1.2M | Utility-tolerant | Tool post with Steam import hook | Lower |
| r/SteamDeck | 670k | PWA audience | PWA add-to-home-screen angle | Lower |
| r/truegaming | 1.5M | Discussion, no memes | Philosophy post, NO link | None (if no link) |
| r/gamedev | 900k | Show-Off-Saturday weekly | Build story, AI-tool angle | Low |
| r/IndieGaming | 450k | Self-promo allowed with flair | Stacking presence | None |
| r/SideProject | 500k | Launch-friendly | PH launch-day cross-post | None |

**What NOT to do (bury any of these, mods ban).**
- Same day, multiple subs (looks coordinated)
- Alt-account commenting on your own posts
- Asking friends to upvote
- Marketing vocab ("revolutionary," "game-changing")
- Delete + repost if no early traction
- Arguing with critics — thank them, link to follow-up fix if real
- Cross-posting identical text

See [Reddit Copy](#reddit-copy) for all 4 main post drafts.

---

### 4.3 Product Hunt

**Why it still works.** PH audience = early adopters + builders. "Free indie gaming tool with no sign-up and good design" is catnip. "Built with AI in 4 days by a non-developer" doubles the interest.

**Timing.** Tue or Wed, 12:01 AM PST. **Target Wed May 6** — after Reddit + Bluesky have built initial traction.

**Pre-launch (this week).**
- Maker profile at producthunt.com/@bradywhitteker
- "Coming Soon" page for Inventory Full
- Social accounts connected
- Full asset pack (listed in [Copy Bank](#product-hunt-listing))

**Launch day rules.**
- Online by 6am PST, stay 18 hours
- Reply to every comment within 1 hour (this is the PH algorithm's main signal)
- Maker update every 4 hours ("here's what I'm hearing")
- Email your Bluesky + Reddit + Discord people — NOT "please upvote," say *"we launched, would love your thoughts"*
- Cross-post to r/SideProject, Indie Hackers, Designer News

**What NOT to do.**
- Never say "upvote"
- No paid upvote rings (PH detects and bans in 2026)
- Don't launch and disappear — activity IS the product
- Don't launch on weekends

---

### 4.4 Hacker News (Show HN)

**When.** Same week as PH. Morning PT on a weekday, not Monday.

**Format.** Show HN: + product name + one-line description + link. First comment = the full "why I built this" story. HN rewards honest context.

See [Show HN](#show-hn) for the draft.

---

### 4.5 YouTube creator outreach

**Target.** 5k–100k sub creators covering:
- Steam backlog / backlog challenges
- Steam Deck apps and tools
- Gaming productivity / "what to play next"
- Indie app reviews

**How to find.** Search YouTube for the terms above, filter 5k–50k views. Those creators have engaged niche audiences and are responsive because brands rarely contact them.

**Outreach template.** See [Creator Outreach](#creator-outreach-template).

**PR kit.** Public Google Drive folder with:
- 3–4 high-res screenshots (app in action, not landing)
- OG card image
- Logomark (transparent PNG)
- One-paragraph description
- Key stats (import sources, feature list, price: free)
- Contact email (hello@inventoryfull.gg)
- One line: "Built in ~4 days with Claude Code by a non-developer"

---

### 4.6 Press

**Angles (two stories, same product).**
- **Gaming angle:** "The backlog manager that wants you to stop using it"
  - Targets: Rock Paper Shotgun, PC Gamer, Kotaku, Polygon
- **Tech/AI angle:** "Non-developer builds full web app in 4 days with AI"
  - Targets: Ars Technica, The Verge, 404 Media, Hacker News
- **Indie angle:** "Built in-public, no funding, side project"
  - Targets: Indie Hackers, Dev.to, personal blog cross-post

Pitch template: [Press Pitch](#press-pitch).

**Press email:** use `hello@inventoryfull.gg` (already forwarded to your IF gmail). Consider adding `press@inventoryfull.gg` as a separate forwarder before batch #1 (Sun May 3) — looks more professional, reduces future noise in hello@.

---

### 4.7 Discord community

**Purpose.** Landing spot for people who like the product and want to stick around. Feedback loop. Not a broadcast channel.

**Structure (keep tiny).**
- #welcome — one pinned message, the mission
- #general — chat
- #got-picks — screenshots of their picks / clears
- #feedback — direct line to Brady
- #shipping-log — Brady posts updates when stuff ships

**Link from:** site footer, Reddit post signatures, PH listing, Bluesky bio.

**Don't launch Discord before Reddit.** Reddit drives the initial wave; Discord is the catch.

---

## 5. Copy Bank (paste-ready)

All drafts below have been scanned for AI tells: no em-dash drama, no "that's not X, that's Y" overuse, no performative empathy, no summary closers. If you edit, re-run the scan (`.claude/rules/voice-charter.md` §banned patterns).

---

### Bluesky Copy

14 drafts for Apr 21 → May 4. Personality first, product second. Keep them short — Bluesky posts perform better under 200 chars.

**D1 (Tue Apr 21):**
> my steam library has 737 games in it and i played mass effect again

**D2 (Wed Apr 22):**
> the gaming industry's real product is guilt. they sell you 300 games at 80% off and then you feel bad about it for five years.

**D3 (Thu Apr 23):**
> "what should i play" is an identity crisis dressed up as an entertainment decision. your backlog is 300 possible selves you haven't committed to yet.

**D4 (Fri Apr 24):**
> unpopular opinion: giving up on a game is a decision, not a failure. you learned something about yourself. that's progress.

**D5 (Sat Apr 25):**
> every time i open my steam library i feel like i'm standing in a warehouse full of beautiful things i will never touch. anyway i'm playing hades again.

**D6 (Sun Apr 26):**
> the moment you sit down to play, browse for 20 minutes, and close steam without starting anything — that's the universe telling you choice is a tax. pay less of it.

**D7 (Mon Apr 27):**
> been building a thing. tell you about it soon.

**D8 (Tue Apr 28 — blurred teaser):**
> [blurred screenshot of the app]
>
> soon.

**D9 (Wed Apr 29 — LAUNCH):**
> it's live. inventoryfull.gg
>
> import your steam / xbox / ps library. tell it your mood. it picks your next game.
>
> free. no account. your data stays on your device.
>
> your pile's not gonna play itself.
>
> [15s GIF: import → mood → pick]

**D10 (Thu Apr 30):**
> already hearing from people with 400+ game libraries. turns out i'm not alone. the pile is the point.

**D11 (Fri May 1):**
> favorite question so far: "is this just a random picker?"
>
> no. it weighs mood, time, skip history, and genre cooldown. you still pick, we just narrow it to one. then you play or skip. skips train it.

**D12 (Sat May 2):**
> Moving On tab is the feature i'm most proud of. giving yourself permission to stop playing a game is a decision, not a loss. less shame, more game.

**D13 (Sun May 3):**
> built this in four days with claude code. seventeen years doing brand strategy. zero years writing web apps before last week. the future is weird and i like it.

**D14 (Mon May 4):**
> what i learned launching inventoryfull.gg:
> 1. people with big libraries are hungry for permission to stop
> 2. "less time in app = success" is the hardest pitch to explain and the easiest thing to deliver
> 3. the dino theme was the right call

**Ongoing cadence (May 5+):** same pattern. Backlog-culture observations. Reply to gaming journalists. Share user screenshots (with permission). Never hard-pitch.

---

### Reddit Copy

#### Reddit r/patientgamers (confessional)

**Title:** I have 737 games and I've been staring at them for years. So I built something.

**Body:**

> I'm a patient gamer by circumstance. I buy games on sale, add them to my library, and never play them because I can't decide which one to start. The backlog stopped being exciting and started feeling like an obligation. An abandoned warehouse of good intentions.
>
> I realized the problem isn't organization. Every backlog tool I tried gave me more ways to sort and categorize, which meant more time in the app and less time playing. The problem is paralysis. Too many options, no decision framework, a weird guilt about "wasting" time on the wrong game.
>
> So I built a thing. It doesn't help you organize. It helps you pick. You tell it your mood and how much time you have, and it picks something from your library that fits. If it picks wrong, roll again. If you finish something, confetti. If you give up on something, that's fine too. Moving on is deciding.
>
> The core idea: less time in the app = success. If you spend 30 seconds picking and then go play for three hours, that's a perfect session.
>
> It's free, no sign-up, your data stays on your device. Imports from Steam, Xbox, PlayStation, Playnite.
>
> [inventoryfull.gg](https://inventoryfull.gg)
>
> Genuinely curious if anyone else has this problem, or if I'm exceptionally bad at choosing things.

**Note before posting:** replace `737` with your real current Steam library count. If it's smaller than 500 the post reads weaker — don't pad it, just use the real number and adjust the hook ("I have 340 games...").

---

#### Reddit r/Steam (utility)

**Title:** Free tool that imports your Steam library and picks what to play based on your mood

**Body:**

> I built a backlog manager that tries to get you to stop using it. Import your Steam library, tell it how much time you've got and what kind of mood you're in, and it picks something.
>
> It's not another tracker. No spreadsheets, no tagging systems. Just pick, play, move on.
>
> Works with Xbox, PlayStation, Playnite CSV too. Free, no account needed, data stays local unless you sign in to sync.
>
> [inventoryfull.gg](https://inventoryfull.gg)
>
> Happy to answer questions or take feedback.

---

#### Reddit r/truegaming (philosophy, NO link)

**Title:** Your gaming backlog isn't a to-do list — it's a collection of uncommitted possible selves

**Body:**

> I've been thinking about why backlogs cause so much anxiety, and I think we're framing the problem wrong. We treat a backlog like a task list. Things to get through. But choosing a game isn't choosing a task. It's choosing an identity.
>
> When you boot up Disco Elysium, you're choosing to be someone who sits with ambiguity and reads a lot. Elden Ring — someone who grinds through difficulty. Stardew Valley — gentleness.
>
> Your backlog isn't 300 undone tasks. It's 300 possible versions of you that you haven't committed to yet. And that's why it's paralyzing. It's not time management. It's identity management.
>
> Every game you don't play is a self you didn't try on. The guilt isn't about wasted money. It's about unlived possibilities.
>
> Anyone else feel this way, or have I been staring at my Steam library too long?

**If people ask what you're building in comments:** reply naturally. *"Ha, funny you asked — I actually built a thing a few weeks ago that tries to make that decision less heavy. It's inventoryfull.gg. Take or leave."*

---

#### Reddit r/gamedev (Show Off Saturday)

**Title (for the weekly thread comment):** I'm a brand strategist with zero dev experience. I built a full web app with AI tools in 4 days.

**Body:**

> Not a developer. Never built a web app. Last week I built inventoryfull.gg — a gaming backlog manager with Steam/Xbox/PS/Playnite import, mood-based matching, cloud sync, multiple themes, OG share cards, PWA support.
>
> Built with Claude Code. I described what I wanted in plain English; it scaffolded the architecture, wrote the API routes, handled the database. I did the design direction, UX decisions, and product philosophy. Claude did the implementation.
>
> Happy to answer questions about the process. The hardest problems were product, not code — how do you make giving up on a game feel like progress instead of failure?

---

### Product Hunt Listing

**Tagline (60 chars):** Import your backlog. Match your mood. Get playing.

**Description:**

> Your game library isn't a to-do list. It's 300 possible selves you haven't committed to yet.
>
> Inventory Full doesn't help you organize your backlog. It helps you pick from it. Tell it your mood and how much time you have. It picks one game. You play or you don't. Moving on counts too.
>
> **What makes it different:**
> - Less time in the app = success. We're designed to get you out.
> - Mood and time matching, not a random picker. Weights skip history and genre cooldown.
> - Steam, Xbox, PlayStation, Playnite import.
> - Free forever. No account required. Your data stays on your device.
> - Cloud sync available via Discord or Google sign-in.
> - Multiple themes including a dino mode because why not.
>
> Built by a brand strategist with zero dev experience using Claude Code. The whole app went from idea to shipped in about four days. The hardest problem was emotional, not technical — how do you make giving up on a game feel like progress instead of failure?
>
> [inventoryfull.gg](https://inventoryfull.gg)

**Gallery (prep):** 5 screenshots — landing, library import flow, mood picker, celebration modal, dino theme. Plus 60–90s screen recording.

**Maker's first comment (pin on launch):**

> hey PH. solo builder here. i had 737 steam games and couldn't pick one to play. every tool i found wanted me to catalog and tag and track. i wanted to close the app and go play a game.
>
> so i built the opposite. mood + time → one game → play or skip. skips train it.
>
> free, no sign-up, data stays on your device unless you opt in to sync. hoping some of you have the same problem and this helps. happy to take every question in the thread today.

---

### Show HN

**Title:** Show HN: Inventory Full – pick what to play from your backlog by mood and time

**First comment (submit right after the post appears):**

> Hey HN. Solo builder. I had ~700 games across Steam, Xbox, and PlayStation and regularly closed every launcher without starting anything. Every backlog tool I tried made me organize more and play less.
>
> Inventory Full goes the other way. You import your libraries (public APIs only — Steam web API, OpenXBL, psn-api, Playnite CSV). You tell it your mood and how much time you have. It picks one game weighted by mood / time / skip history / genre cooldown. Skip trains it. Clear it and the share card roasts you warmly.
>
> Stack: Next.js 16, React 19, Tailwind 4, Supabase (opt-in sync — localStorage is authoritative), Zustand, Playwright. Sentry in prod. Deployed on Vercel. Built with Claude Code over roughly four calendar days — I'm a brand strategist, not a developer, and this is the first web app I've shipped.
>
> Happy to answer questions about the product philosophy, the Claude-Code workflow, the integrations (PSN tokens are the fun one — ephemeral, never persisted), or anything else.

---

### Email Templates

All three below assume Resend is wired (week 2+ infra item). For launch, Supabase handles transactional.

**Welcome (on first sign-in, if `wants_updates = true`):**

> Subject: your pile is loaded. now what.
>
> You're in. Three things to do first:
>
> 1. **Pick one.** Tell us your mood and how much time you have. We'll pick a game.
> 2. **Skip if it's wrong.** The skip teaches us what you don't want right now.
> 3. **Clear it.** Finish or move on. Both count. Moving on is deciding too.
>
> That's the whole app.
>
> — Brady

**Re-engagement (30d inactive, only if opted in):**

> Subject: the pile is still there
>
> Hey. It's been a month. Your library is still waiting, and there's probably one game in it that's exactly right for tonight. Takes about 30 seconds to find out.
>
> [pick a game →](https://inventoryfull.gg)

**Completion celebration (shipped on clear, currently handled in-app — email is optional stretch):**

> Subject: one down.
>
> You cleared [Game]. That's the whole game.
>
> [share the win →](https://inventoryfull.gg/clear/[id])

---

### Creator Outreach Template

> **Subject:** free backlog tool for your audience, no strings
>
> Hey [Name],
>
> I built a free gaming backlog tool called Inventory Full (inventoryfull.gg). You import your Steam/Xbox/PS library, tell it your mood and how much time you have, and it picks your next game.
>
> I'm reaching out because your video [specific video title, pasted] is exactly the problem this solves. Thought your audience might like it.
>
> No sponsorship pitch. It's free, no sign-up, no catch. Just a tool I built because I have ~700 games and couldn't pick one. If you want to check it out and think it's worth a mention, great. If not, no worries.
>
> Happy to give you screenshots, early access, or any context you need. Press kit here: [drive link]
>
> Brady Whitteker
> inventoryfull.gg
> hello@inventoryfull.gg

---

### Press Pitch

> **Subject:** non-developer builds gaming app in 4 days with AI — tackles backlog paralysis
>
> Hi [Name],
>
> Quick pitch. I'm a brand strategist (17 years, two Costco-distributed brands, no dev background) who built a full web app called Inventory Full in four days using Claude Code.
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

---

## 6. Infrastructure Checklist

### Live now ✅
- Site live at inventoryfull.gg
- Email forwarders: hello@ / hi@ / info@ / help@ / press@ / privacy@ → Inventory Full Gmail
- Supabase auth (Discord, Google, email)
- Supabase cloud sync (opt-in)
- `wants_updates` + `wants_updates_consented_at` on `profiles` (migration 007 applied)
- Supabase email templates pasted (6 styled transactional templates)
- Sentry error monitoring
- UptimeRobot uptime monitoring
- OG image (1200×630, unfurls correctly — re-verify B4)
- GA4 events
- Playwright e2e
- L2 metadata cache (Supabase `game_metadata` table)
- **Ko-fi** at ko-fi.com/inventoryfull — verify footer + about page link before Apr 28

### Needed by Apr 27 (public push gating)

- [ ] **Bluesky** account `@inventoryfull.gg` (DNS handle, not .bsky.social)
- [ ] **Product Hunt** maker profile + coming-soon page
- [ ] **Discord** server shell (structure above, no invites yet)
- [ ] **Press kit** Google Drive folder, public link

### Week 2+ (post-launch infra, not blocking)

- [ ] **Resend** wired for transactional (custom domain, SPF/DKIM/DMARC)
- [ ] **One-click unsubscribe** (Privacy Policy promises it — must land before first marketing send)
- [ ] **Physical address in footer** (CAN-SPAM requirement before first marketing send)
- [ ] **Pre-seed metadata cache** with top 500 Steam games (reduces RAWG burnout risk on traffic spike)
- [ ] **Fetch timeouts** on RAWG / HLTB / PSN / Steam / Xbox / ITAD (flagged in old scale-up-plan as engineering blocker)
- [ ] **PSN token Sentry scrubber** (beforeSend)
- [ ] **PSN trophy pagination cap** (max 5 pages)
- [ ] **Upstash Redis** for global rate limiting (current limiter is per-Vercel-instance)
- [ ] **Mobile Brave / Chromium theme bug** fix

### Conditional (triggered by MAU)

- [ ] **Vercel Pro** ($20/mo) — trigger at 500 DAU or first bandwidth warning
- [ ] **Supabase Pro** ($25/mo) — trigger at 500 DAU or connection-cap warning
- [ ] **Sentry Team** (~$26/mo) — trigger when free tier's 5k errors/mo gets hit
- [ ] **RAWG Commercial** ($149/mo) — **HARD BLOCKER** before any revenue feature. Free tier is non-commercial ToS.
- [ ] **Resend paid** ($20/mo) — trigger at 3k subscribers

### Confirmed infra state (from session-resume 2026-04-21)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — live
- `SUPABASE_SERVICE_ROLE_KEY` — live, secret
- `RAWG_API_KEY`, `OPENXBL_API_KEY`, `SENTRY_DSN` — live in Vercel env
- Supabase migration 007 (wants_updates column) — **still needs to be applied in dashboard** (carried from Apr 21 sprint)
- 6 Supabase email templates drafted — **still need to be pasted** (carried from Apr 21 sprint)

---

## 7. Monetization Roadmap

**Principle.** Donationware from day one. Zero friction. Revenue is not the launch metric; retention and word-of-mouth are.

### Phase 1 — Launch (Apr 28 → ~2k MAU)

**Donation-only.**
- Ko-fi link in footer and about page
- Message: *"Inventory Full is free and always will be. If it saved you from another hour of library paralysis, you can buy me a coffee."*
- No tiers, no goals, no guilt-trip copy. One button, one message.

### Phase 2 — Supporter tier (~2k MAU)

**Trigger:** rolling 30-day MAU crosses 2k. Not a calendar date.

**What it is:** $3/mo or $30/yr cosmetic perks only. No feature-gating. Guest/free experience must stay complete.

**Perk candidates (pick 2–3, don't ship all):**
- Exclusive themes (we have 13 already; add 2–3 "supporter-only" variants)
- Extra archetype variants (36 already; add 6 for supporters)
- Animated logomark in their profile
- Early access to new features (not walls, just "ships to supporters two weeks earlier")
- Supporter badge on their share cards (subtle; opt-in)

**What it will NEVER gate:**
- Core pick flow
- Any platform import
- Cloud sync
- Stats
- Share cards (core version)

**Prerequisite work:**
- Stripe integration
- `subscribers` table in Supabase with webhook from Stripe
- Privacy Policy update
- Account settings UI

### Phase 3 — Affiliate deals (conditional, RAWG-gated)

**Hard blocker:** RAWG Commercial plan must be signed and paid ($149/mo) BEFORE any affiliate link ships. Free RAWG tier violates non-commercial ToS the moment you take revenue. See `docs/archive/launch-2026-04-21/scale-up-costs-2026-04-20.md` for the full reasoning.

**When:** not a date — when sustained MAU makes $149 + Stripe fees break-even on affiliate revenue at realistic conversion rates. Evaluate at 5k MAU.

**What it looks like:** deals on games the user already owns or has wishlisted. Surfacing ITAD/Humble/Fanatical price drops on *your* library. Clear FTC disclosure on every affiliate surface.

**Hard line:** never surface deals on games the user doesn't own based on behavioral profiling. That crosses from "helping you play what you have" to "selling you new things based on your data," which is outside `.claude/rules/legal-compliance.md`.

### Phase 4 — Nothing (intentionally)

No ads. No data sales. No sponsored game placements. These are locked-out by the legal-compliance rules file and by the product thesis. Revenue above what Supporter + affiliates cover either comes from product expansion (Phase 5 multi-vertical) or doesn't come.

---

## 8. Scale-Up & Virality Response

### Cost ladder (mitigations in §6)

| Tier | MAU | Base cost | Trigger | What breaks first |
|------|-----|-----------|---------|-------------------|
| Launch | 0–2k | $1–5 /mo | — | Nothing; free tiers hold |
| Early | 2k–5k | $1–27 /mo | Sentry cap | Sentry errors/mo |
| Mid | 5k–10k | $27–150 /mo | Vercel/Supabase Pro | Connections, bandwidth |
| **Revenue gate** | 5k+ with donations viable | +$149 | RAWG Commercial required before any affiliate link | RAWG ToS |
| Scale | 10k–50k | $150–320 /mo | Vercel Pro + Supabase Pro + RAWG commercial | Enrichment budget |

Caching (L2 Supabase `game_metadata` table, already live) lengthens every tier — pre-seed top 500 Steam games before launch to extend further.

### If a post goes viral (Reddit/PH/HN unexpected spike)

**Hour 1:** dashboards
- Vercel bandwidth (hard cap on free = 100GB/mo, alert at 50%)
- Supabase connections (free = 60 concurrent, alert at 40)
- Sentry rate (free = 5k errors/mo; if it spikes, we have bugs or ratelimit config problems)
- RAWG key usage (free = 20k/mo)

**Hour 2–6:**
- If Vercel bandwidth is spiking, check if OG image is being hammered (`/clear/[id]/opengraph-image`) — if so, temporarily swap to a static OG for the hot URL
- If Supabase connection pool saturated, reduce enrichment concurrency (lib/enrichment.ts — drop from 5 concurrent to 2)
- If RAWG usage spiking, enable aggressive L2 cache TTL extension (bump from 30d to 90d for the week)

**Day 1–3:**
- Add rate limit: 3 imports per user per hour
- Pre-seed top 500 Steam games into metadata cache (if not done pre-launch)
- Pull a traffic source report — where are they coming from, and is it sustained or a spike?

**Week 1 decision:**
- Sustained traffic (>500 DAU for 5+ days) = commit to Vercel Pro + Supabase Pro. Cost predictable, worth the headroom.
- Spike then decay = stay free tier, note the ceiling for next time.

### Worst-case blast radius

If the site falls over completely during a launch-week post:
1. Vercel will throttle rather than bill — you won't get a surprise invoice, but users will see 503s
2. Supabase will reject new connections — new sign-ins fail, existing users with cached sessions keep working
3. RAWG will 429 — enrichment queue silently backs up, no user-facing breakage
4. **Nothing in this list loses data.** localStorage is authoritative; Supabase is sync, not source of truth. Worst case: a few minutes of cloud-sync lag.

This is why the architecture decision to keep localStorage authoritative (locked in `AGENTS.md`) matters. We can't lose users' libraries even if the whole cloud stack is down.

---

## 9. Metrics & Monitoring

### What to watch daily (launch window)

| Metric | Source | Target | Alert threshold |
|--------|--------|--------|-----------------|
| DAU | GA4 | ↗ curve | drop >30% day-over-day |
| Sample → import conversion | GA4 event `library_imported` after `sample_loaded` | >15% | <5% |
| Pick → play signal | GA4 event `pick_delivered` | every import produces ≥1 pick | <50% pick rate |
| Share card creation | GA4 event `clear_shared` | any | zero for 3 days post-launch = broken virality loop |
| Error rate | Sentry | <0.5% of sessions | >2% |
| Bandwidth | Vercel dashboard | <50% of free cap | 75% |
| DB connections | Supabase | <60% of cap | 75% |

### What to watch weekly (post-launch)

- **Retention:** cohort 1 — do people come back in week 2?
- **Pick-to-close ratio:** do people actually play what we pick, or do they reroll forever? (Instrumentation plan draft exists from Apr 9 session.)
- **Moved-On usage:** is the Moving On tab being used, or are people leaving games in Backlog forever?
- **Feedback volume:** Discord + emails + Reddit DMs — the signal of what to fix next

### What to NOT measure

- Time in app (we want it to decrease; measuring makes it a false north star)
- Number of games in library (vanity, doesn't signal anything useful)
- Engagement (wrong incentive — see product thesis)

---

## 10. BradyOS Handoff

This doc feeds the BradyOS Handoffs bus at `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Handoffs/inbox/`. A dated handoff file is written alongside this bible so BradyOS can surface *today's* launch tasks when you ask "what's on for today."

The handoff structure:
- **Today's block:** pulled from §3 Day-by-Day for the current date
- **This week's block:** the rolling 7-day window
- **Punch list state:** current pre-launch checklist with items still red
- **Next major milestone:** the next dated event on the timeline

**Write cadence.** The `session-close` skill already writes to Handoffs on session end. When the launch window is active (Apr 28 → May 18), trigger the skill daily even if no code session happened — it picks up the day-by-day block and pushes it to BradyOS.

**Initial handoff:** written 2026-04-21, file `2026-04-21-launch-bible-and-daily-rhythm.md` in the inbox.

---

## Retired / archived source docs

All moved to `docs/archive/launch-2026-04-21/` on 2026-04-21. See `docs/archive/launch-2026-04-21/README.md` for the map.

| Archived doc | Lived | Superseded by |
|--------------|-------|---------------|
| `marketing-prep.md` | docs/ | §4 Channels + §5 Copy Bank |
| `reddit-launch-prep.md` | docs/ | §4.2 Reddit + §5 Reddit Copy |
| `email-strategy.md` | docs/ | §5 Email Templates + §6 Infra + §7 Monetization |
| `scale-up-plan.md` | docs/ | §8 Scale-Up + §6 Infra |
| `scale-up-costs-2026-04-20.md` | docs/ | §7 Monetization + §8 Scale-Up |
| `pre-launch-risks-2026-04-15.md` | docs/ | §2 Pre-Launch Punch List |
| `inventory-full-launch-plan_1.md` | notes/ | §3 Day-by-Day + §4 Channels + §5 Copy |

Not archived (still live as reference):
- `docs/BLUE_SKY.md` — philosophy, north star
- `docs/ROADMAP.md` — product state of the world
- `docs/ROADMAP_PHASES.md` — phase planning (Phase 4/5 speculative)
- `docs/DECISIONS.md` — append-only decision log
- `docs/competitive-refresh-prompt.md` — monthly audit template (use post-launch)
- `notes/feedback-inbox/raw/Inventory Full — Ship-Readiness Review/` — external review, still reads fresh

---

**Last updated:** 2026-04-21. **Next review:** Mon May 5 (after first Reddit wave, before PH).
