# Product Hunt Launch Packet — Inventory Full

Target launch: **Wednesday, May 6, 2026, 12:01 AM PST.** Brady has done nothing on PH yet. This packet is the full checklist plus all copy, ready to execute.

Voice gate: every line below has been scanned against `.claude/rules/voice-charter.md` banned patterns. If you edit, re-scan.

---

## 1. Pre-Launch Setup Checklist (do this week)

**Step 1 — Maker account (15 min).**

1. Go to https://www.producthunt.com/ and sign up with Google or email. Use the Gmail tied to `hello@inventoryfull.gg` if you can.
2. Username: `bradywhitteker` (you've already been seeded with the URL — claim it).
3. Profile photo: clean headshot. Same one you use on Bluesky and LinkedIn so makers recognize you across surfaces.
4. Headline: `Brand strategist building Inventory Full. 17 years brand. 4 days code.`
5. Bio (200 char limit, ish): `Built inventoryfull.gg in four days with Claude Code. First web app I've ever shipped. Solving my own 700-game backlog problem.`
6. Add links: inventoryfull.gg, your Bluesky, your LinkedIn, your Discord invite.

**Step 2 — Connect social accounts.**

PH cares about this for spam detection. In Settings → Connected Accounts, connect Twitter/X if you have one (even dormant), GitHub if you have one. Don't sweat it if you don't — Bluesky isn't supported and that's fine.

**Step 3 — Coming Soon page (30 min).**

1. Go to https://www.producthunt.com/products/new
2. Choose "Create a Coming Soon page" (not the full submission yet).
3. Required fields:
   - **Name:** Inventory Full
   - **Tagline:** (see section 2 — pick the winner)
   - **Description:** short version, ~260 chars. Use: *"Your library isn't a to-do list. It's 300 possible selves you haven't committed to. Inventory Full picks one game from your Steam, Xbox, PlayStation, or Playnite library based on your mood and how much time you have. Free. No sign-up."*
   - **Website:** https://inventoryfull.gg
   - **Topics/Categories:** Gaming, Productivity, Open Source (only if applicable — IF isn't, skip), Side Projects
   - **Logo:** 240×240 PNG of the IF logomark from `public/brand/`
   - **Thumbnail:** square crop of the OG card or a clean landing screenshot, 240×240 minimum
4. Share the Coming Soon URL on Bluesky a few days before launch. People can "Notify me" and PH emails them on launch day. This is the closest thing you have to a follower base.

**Step 4 — Schedule the launch (3 days before, Sun May 3).**

1. Go to your Coming Soon page → "Launch this product"
2. Pick **Wednesday, May 6, 2026** with the post going live at **12:01 AM PST**.
3. Required at this stage:
   - Full description (section 3)
   - Gallery: 5 images + 1 video (section 4)
   - Maker(s): just you
   - "Built with" tags: Next.js, React, Tailwind, Supabase, Claude Code (PH has tags for all of these — claim them, the Claude Code one matters)
   - Pricing: Free
4. **Do not** submit before Sunday. PH lets you edit a scheduled launch up to T-minus a few hours, but locking it early reduces editing flexibility.

**Step 5 — Asset prep (this weekend).**

- 5 gallery screenshots — section 4 shot list
- 1 demo video, 60–90s — section 4 storyboard
- Logo at 240×240 and 1280×720
- All saved to a Google Drive folder you can also use as the press kit

**Step 6 — Warm list.**

Make a list of people you'll email/DM the morning of launch. Not "please upvote." The script: *"Hey, launched Inventory Full on Product Hunt today — would love your honest thoughts in the comments if you have a minute."*

Target ~20 people: Bluesky mutuals who've engaged, Discord members, anyone who's beta-poked the site, the patientgamers thread responders.

---

## 2. Tagline Options (60 char limit)

Ranked. Pick A unless something feels off in your gut.

**A. `Import your backlog. Match your mood. Get playing.`** *(50 chars)*
The Bible's pick. Three beats, action verbs, ends on the brand tagline. Tells the PH skimmer exactly what the product does in one breath. Strongest.

**B. `Pick what to play from your library by mood and time.`** *(53 chars)*
Plain and functional. Good for PH's literal-minded skimmer who wants "what does it do" in one line. Less voice, more clarity. Use this if A reads too marketing-y to you.

**C. `Your backlog isn't a to-do list. Get playing.`** *(45 chars)*
Punchier. Leads with the psychology hook. Risk: PH audience may not know what "backlog" means without context, and "isn't a to-do list" hides the product mechanic. Strongest if the gallery hero shot is self-explanatory.

**D. `One game from your library. Picked by mood, not luck.`** *(54 chars)*
Differentiator-forward. Pre-empts the "is this just a random picker" question. Weakest on action energy but strongest on category positioning.

---

## 3. Listing Description (refined, 287 words)

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
> **Built by:** a brand strategist with 17 years in the industry and zero years writing web apps before last week. Four calendar days from idea to live site, using Claude Code. The hardest problem was emotional, not technical — how do you make giving up on a game feel like progress instead of failure?
>
> Free, no sign-up. Try it with a sample library if you don't want to connect anything yet.
>
> [inventoryfull.gg](https://inventoryfull.gg)

---

## 4. Gallery — Shot List

### 5 screenshots

**Shot 1 — Landing hero (default purple theme).**
- Surface: `inventoryfull.gg` landing page, signed out, no library imported
- State: hero h1 "Inventory Full" with "get playing." subhead visible. The import CTAs (Steam / Xbox / PS / Playnite / sample) visible below.
- Theme: default
- Communicates: this is a clean, designed product, not a hobby site. Sets the bar in the first frame.

**Shot 2 — Pick flow, mid-decision (mood + session length).**
- Surface: Reroll modal open
- State: a mood selected (e.g. "cozy"), session length on "Medium ~1–2 hrs"
- Theme: default
- Communicates: the two-input philosophy. Skimmer instantly sees "oh, mood + time, that's the input."

**Shot 3 — The pick reveal.**
- Surface: Reroll modal with a single game picked
- State: one game card centered, big cover art, "Play it" / "Reroll" actions visible. Use a real recognizable game (Hades, Stardew, Hollow Knight — something most PH readers will recognize).
- Theme: default
- Communicates: we pick ONE game, not a shortlist. This is the differentiator.

**Shot 4 — Completion celebration with confetti.**
- Surface: `CompletionCelebration` modal
- State: a game just marked Completed. "You committed, you followed through. That's the whole game." copy visible. Confetti frozen mid-burst.
- Theme: default
- Communicates: the emotional payoff. PH audience scrolling will pause on confetti.

**Shot 5 — Dino theme on a full library (grid view).**
- Surface: main app, library populated (~40+ games), grid view
- State: dino theme active, tab on Backlog, sort on "Best for You"
- Theme: dino
- Communicates: personality, range, and the fact that it's actually a real app with real game art. Use dino, not the default, so PH viewers see the product has range past one look.

### 60–90s demo video — storyboard

Single take if possible, with text overlays. No voiceover (subtitle-friendly, autoplays muted on PH). Music: something quiet, not chiptune (we're not selling nostalgia).

| Beat | Time | Action | Overlay text |
|---|---|---|---|
| 1 | 0–6s | Landing page. Cursor lands on Steam import. | `your pile's not gonna play itself.` |
| 2 | 6–14s | Steam ID pasted, library imports. Show counter ticking up to 200+ games. | `import your library.` |
| 3 | 14–22s | Library populated. Click "Pick My Game." | `200 games. one decision.` |
| 4 | 22–32s | Mood picker — click "cozy." Session length — click "Medium." | `mood. time. that's it.` |
| 5 | 32–40s | The pick reveals. One game card, big art. | `here's your game.` |
| 6 | 40–48s | Click "Playing Now." Card flies to the Playing Now tab. | `go play it.` |
| 7 | 48–58s | Cut to later: same game, now in Playing Now. Click "I beat it." Confetti. | `then come back and celebrate.` |
| 8 | 58–70s | Completion modal: stats, archetype line. | `we'll remember it for you.` |
| 9 | 70–80s | Quick montage: theme switch (default → dino → void), Moving On status, share card. | `themes. moods. one job.` |
| 10 | 80–88s | End card: `inventoryfull.gg` + `get playing.` + free / no sign-up | — |

Export at 1920×1080, MP4, under 50MB.

---

## 5. Maker's First Comment (pin on launch)

> hey PH. solo builder here.
>
> i had 737 steam games and couldn't pick one to play. every backlog tool i found wanted me to catalog and tag and track. i wanted to close the app and go play a game.
>
> so i built the opposite. mood + session length → one game → play or skip. skips train it. moving on counts. completion gets confetti.
>
> free, no sign-up, data stays on your device unless you opt in to sync. imports steam, xbox, playstation, playnite.
>
> the weird part: i'm a brand strategist, not a developer. seventeen years in brand, zero years writing web apps before last week. built this in four days with claude code. happy to talk about that process in the thread too.
>
> hoping some of you have the same problem. i'll be here all day — drop questions, feedback, roasts, screenshots of your pile. all welcome.

---

## 6. Launch-Day FAQ (10 prepared answers)

Keep replies short. PH algorithm rewards reply *speed* more than reply length. Aim for under 60 seconds per reply.

**Q1. "Is this just a random picker with extra steps?"**
> no. weights mood, session length, skip history, and genre cooldown so you don't get the same kind of game three times in a row. and skip is a real signal — it trains down what you keep saying no to. random would feel random. this feels picked.

**Q2. "How is this different from Backloggd or HowLongToBeat?"**
> Backloggd is a tracker — you log what you played for other people to see. HLTB is a database. neither helps you pick what to play *tonight*. Inventory Full only does the picking part. it actually uses HLTB data under the hood for session-length matching, but the front of the product is one decision, not a library.

**Q3. "Wait, you built this in 4 days with no dev background?"**
> yeah. brand strategist for 17 years, never written a web app. used Claude Code. i described what i wanted in plain english and it scaffolded the architecture, wrote the API routes, set up the database. i did the product design, UX decisions, copy, and the calls on what *not* to build. claude did the implementation. four days from idea to live site.
>
> the hardest problems weren't code. they were product — how do you make giving up on a game feel like progress instead of failure?

**Q4. "Is my data safe? Where does it live?"**
> localStorage on your device by default. nothing leaves your browser unless you opt in to sync (Discord or Google sign-in). if you sync, it goes to a Supabase row tied to your auth — RLS-locked, your data only. no ads, no third parties, no selling, no tracking across other sites. privacy policy is short and honest.

**Q5. "What's the business model? How are you not going to enshittify this?"**
> free forever, no ads, no data sales — those are hard lines, written into the project rules. there's a Ko-fi tip jar in the footer. if it gets big enough that hosting hurts, i'd add an optional paid tier (probably for power features like multi-device sync history or richer stats), but the core "import, pick, play" loop stays free. less time in the app = success is the actual product axiom. an ads model would fight that.

**Q6. "Will you add Nintendo Switch import?"**
> no public API exists for Switch libraries — Nintendo doesn't publish one. closest thing is manually adding games or scraping eShop receipts, neither of which is clean. on the roadmap as "if Nintendo ever opens an API." in the meantime, the manual add flow takes about 5 seconds per game and there's a Playnite CSV import if you use Playnite to manage Switch alongside other platforms.

**Q7. "Mobile app?"**
> it's a PWA — install it on iOS or Android home screen and it runs like an app. native app isn't on the near roadmap. the loop is "open the app, get a pick, close the app and go play your console / PC." a native app would be solving a problem i don't have yet.

**Q8. "Is there AI in this? LLM picking the game?"**
> no AI inside the product. the picker is a weighted scoring function — mood tags, session length vs HLTB time, skip history, genre cooldown. deterministic, fast, runs locally. i used Claude Code to *build* the app, but the running product is plain TypeScript. you don't need an LLM to pick a game and i didn't want one.

**Q9. "Can I sync across devices?"**
> yes — sign in with Discord or Google, your library syncs to Supabase, opens on any device. it's opt-in. signed out, everything is local to that browser. you can also export your library as JSON anytime and re-import it.

**Q10. "What decides whether a game shows up vs gets buried?"**
> a few things. you can manually mark games "Moved On" (they stop appearing in picks) or "Ignored" (same effect, no judgment). the picker also down-weights games you've skipped recently and games in genres you've cycled through a lot. so if you keep saying no to roguelikes, the algorithm cools off on roguelikes for a while. nothing's permanent — skip three times then the cooldown lifts.

---

## 7. Launch-Day Timeline (Wed May 6, all times PST)

| Time | Action |
|---|---|
| 12:01 AM | Launch goes live automatically. Don't stay up. Sleep. |
| 5:30 AM | Wake up. Coffee. Open the PH listing on phone. Post the **maker's first comment** (section 5). Pin it. |
| 5:45 AM | Open laptop. Reply to any overnight comments (Europe + Asia time zones may already be there). Reply within 5 min while you're online. |
| 6:00 AM | Cross-post to Bluesky: short version + PH link. (Section 8 has the copy.) |
| 6:15 AM | DM the warm list — Bluesky mutuals, Discord regulars. *"Launched on PH today, would love your honest thoughts in the comments."* Not "upvote." |
| 7:00 AM | Post to r/SideProject. (Copy in section 8.) |
| 8:00 AM | Post to Indie Hackers. |
| 9:00 AM | Maker update comment #1: *"4 hours in, top question so far is X. here's what i'm hearing..."* |
| 9:30 AM | Email any press contacts you've warmed up. Single line: *"We launched on PH today, here's the link, here's a one-paragraph description and screenshots if useful."* |
| 10:00 AM | Reply sweep — anyone who commented in the last hour. |
| 11:00 AM | Post to LinkedIn. The angle here is "17 years brand, 4 days code." Not the gaming angle. Different audience. |
| 12:00 PM | Lunch + reply sweep. Don't disappear. |
| 1:00 PM | Maker update comment #2: top-3 feedback themes from the morning. |
| 2:00 PM | Designer News post. |
| 3:00 PM | Cross-post to r/patientgamers if you haven't this week. (Coordinate — don't double up if you've already posted there in the last 7 days.) |
| 4:00 PM | Show HN post goes live (separate workflow — see LAUNCH_BIBLE.md §4.4). Drop a comment in the PH thread linking to the HN discussion. |
| 5:00 PM | Reply sweep. |
| 5:30 PM | Maker update comment #3: *"end of west-coast workday. asia + europe waking up. here's what i shipped today based on feedback..."* (If you shipped anything. If not, just thank people for showing up.) |
| 7:00 PM | Dinner. Phone replies only. |
| 8:00 PM | Reply sweep. Post a screenshot of a new sign-up's archetype reading (with permission) or a fun pick someone shared. |
| 9:00 PM | Bluesky: post a vibes update — what's surprised you about the day. |
| 10:00 PM | Final reply sweep. |
| 11:00 PM | Close laptop. PH ranking locks at midnight PST. Reply triage continues tomorrow morning. |

**Throughout the day:** reply within 1 hour to every comment. This is the single biggest PH algorithm signal in 2026. Set a phone notification on the PH app if it exists.

---

## 8. Cross-Post Checklist

Every place to drop the PH link on launch day. Copy is in `docs/LAUNCH_BIBLE.md` for most of these — adapt the lead to "we just launched on Product Hunt."

- [ ] **Bluesky** (6 AM PST). *"launched inventoryfull.gg on product hunt today. import your steam / xbox / ps / playnite library, tell it your mood, it picks one game. free, no sign-up. would love your thoughts in the thread → [PH link]"*
- [ ] **r/SideProject** (7 AM PST). Title: *"Inventory Full — picks one game from your library by mood and time. Built in 4 days with Claude Code, launched on PH today."*
- [ ] **Indie Hackers** (8 AM PST). Milestone post: *"Launched on Product Hunt today after building in 4 days as a non-developer."*
- [ ] **LinkedIn** (11 AM PST). Angle: brand strategist → first shipped web app. Tag Claude / Anthropic if appropriate.
- [ ] **Designer News** (2 PM PST). Submit as-is, low ceremony.
- [ ] **r/patientgamers** (3 PM PST, only if you haven't posted in 7 days). Confessional version from `LAUNCH_BIBLE.md`, with one-line addendum: *"on PH today if that's your thing — but the site works the same either way."*
- [ ] **Show HN** (4 PM PST). Coordinate timing — HN's algorithm prefers morning Pacific, so consider 9 AM PST instead if it doesn't conflict with PH reply load.
- [ ] **Discord** (anytime). Pin a #shipping-log post. *"It's live on PH. Wild day. Here if you want to swap notes."*
- [ ] **Your site footer / OG meta** — no change needed. Don't add a "as seen on PH" badge until the day's over (looks try-hard).
- [ ] **Email signature** for the day: *"Launched on Product Hunt today: [link]"*

---

## 9. Press-Friendly One-Paragraph Description

For the press kit, plain prose, no marketing voice.

> Inventory Full is a free web app that helps gamers decide what to play from their existing library. Users import their Steam, Xbox, PlayStation, or Playnite collections, then select a mood and an estimated session length. The app picks one game from their library, weighted by genre history and skip patterns. There is no account requirement, no advertising, no third-party data sharing, and all data is stored locally in the browser by default with optional cloud sync. The product was built in approximately four days by Brady Whitteker, a brand strategist with no prior web development experience, using Anthropic's Claude Code. It is available at inventoryfull.gg.

---

## 10. Risks / Gotchas

Specific to Brady's situation:

- **No PH maker history.** First-time launches get less default visibility. The warm list and same-day cross-posts are doing the work that a follower base would normally do. Don't skip them.
- **No follower base on X.** PH's algorithm used to lean on Twitter virality; in 2026 it leans more on comment density and reply speed. Lean into that. Be on the thread all day.
- **Solo on launch day with a day job-equivalent of reply load.** Block the calendar. Tell anyone who'd ping you that you're heads-down. Set autoresponders if you need to.
- **The "4 days with AI" hook is double-edged.** Some PH commenters will be hostile to AI-built apps. Don't be defensive — the answer is always "the product solves a real problem and you can use it for free, judge it on that." Don't get baited into a meta argument about AI.
- **Built-with-Claude-Code positioning needs care.** Don't lead with it. Lead with the product. The build story is the second-paragraph hook in the maker comment, not the headline. Otherwise the entire conversation becomes about Anthropic, not Inventory Full.
- **No iOS or Android native app.** A non-trivial slice of commenters will ask. Have the PWA answer ready (Q7 above) so it's instant.
- **Launch on a Wednesday means Vercel deploy freezes are real.** Don't ship code on launch day unless it's a hotfix. Anything you might want to add — ship it Monday or Tuesday so you have a clean prod baseline going in.
- **Sentry will be noisier than usual.** Heavy traffic means edge-case errors surface. Keep a tab open on Sentry. Triage, don't panic — most will be "user typed something weird into search."

---

## Open questions for Brady

1. **Wednesday May 6 or push to Wed May 13?** The Bible says May 6, but that assumes Reddit + Bluesky have already built traction the prior week. Confirm where those stand before locking the PH date.
2. **Is the Coming Soon page already up?** This packet assumes no. If you've already started it, send the URL and I'll adjust the timeline.
3. **Do you want a separate hype graphic for the Coming Soon page** (different from the gallery hero), or reuse one of the 5 shots?
4. **HN same-day or different day?** The Bible suggests same week. Same day is doable but reply load doubles. Worth discussing.
