# Marketing Prep — Inventory Full

Pre-work so when it's time to push, everything's loaded and ready to fire.

---

## Channels Ranked by Effort/Impact

### Tier 1: Free, High Impact (Do First)

**1. Reddit**
- Subreddits: r/patientgamers (1.2M), r/gamedeals (900K), r/gaming (35M), r/pcgaming (3.6M), r/Steam (1.4M)
- Best format: "I built a thing" post with screenshot + story
- Rule: Don't shill. Share genuinely. Mention it's free. Link in comments, not title.
- Timing: Weekday mornings (US EST) for best visibility
- Pre-write: 3 post variants (problem-led, show-don't-tell, "roast my project")

**2. Discord Servers**
- Gaming deal servers, backlog support groups, indie dev communities
- Format: Drop link with personal context. "I had 700 games and couldn't pick one."
- Already started: your own server/community posts

**3. Twitter/X**
- Gaming hashtags: #backlog, #steambacklog, #gaming, #indiegames
- Format: Short clip or screenshot + punchy line
- Build-in-public angle works well for dev-adjacent audience

**4. Hacker News**
- "Show HN: I built a backlog matchmaker for gamers"
- Best on weekday mornings. Title matters enormously.
- Pre-write the title and first comment (the "what and why")

### Tier 2: Medium Effort, Good Reach

**5. YouTube**
- Target: gaming content creators who do "backlog challenge" videos
- Reach out to 5-10 mid-size creators (10K-100K subs)
- Offer: free tool, no sponsorship needed, just mention if they like it
- Examples: channels that do "clearing my backlog" series

**6. Blog Post / Dev Story**
- "I had 735 games and built an app to stop scrolling"
- Publish on: Dev.to, Hashnode, personal blog, Medium
- Cross-post everywhere

**7. Product Hunt**
- Good for initial visibility spike
- Prep: screenshots, tagline, maker comment
- Launch on Tuesday-Thursday for best traction
- Pre-write: 5 screenshots, 1 hero image, tagline, description, first comment

### Tier 3: Longer Play

**8. SEO (Organic)**
- Target keywords: "gaming backlog manager", "what should I play", "steam backlog tool", "game picker"
- Landing page (when built) should target these
- Blog content: "How to actually clear your gaming backlog" (not AI-written)
- Time to impact: 3-6 months

**9. Gaming Press**
- Pitch angle: "Free tool helps gamers stop hoarding and start playing"
- Targets: Kotaku, Rock Paper Shotgun, PC Gamer, Eurogamer
- Send to tips@, not cold email
- Include: screenshot, one-line pitch, link, "free, no sign-up" hook

---

## Email Marketing Scaffold

### Tool Recommendation: Resend
- **Why**: Developer-friendly, great free tier (3,000 emails/month, 1 domain)
- **Cost**: Free up to 3K/month, then $20/month for 50K
- **Integration**: REST API, works with Vercel serverless
- **Alternative**: Loops.so (more marketing-focused, $49/month when needed)

### Email Flows to Pre-Build

**1. Welcome Email** (trigger: account creation)
- Subject: "Your pile is loaded. Now what?"
- Content: 3 things to do first (roll the dice, check your stats, try a theme)
- CTA: "Go pick a game"

**2. Nudge Email** (trigger: 7 days inactive)
- Subject: "Your backlog misses you"
- Content: Show their stats (X games, $Y value sitting there)
- CTA: "What should I play tonight?"

**3. Celebration Email** (trigger: game completed)
- Subject: "You finished [Game Name]. That's not nothing."
- Content: Congrats + stats (X games cleared, Y hours recovered)
- CTA: "What's next?"

**4. Monthly Digest** (trigger: 1st of month)
- Subject: "Your pile: month in review"
- Content: Games played, time spent, value recovered, streak info
- CTA: "Keep the momentum going"

### Implementation Steps (When Ready)
1. Sign up for Resend, verify inventoryfull.gg domain
2. Create email templates (HTML, keep simple)
3. Add Supabase trigger: on user signup → send welcome
4. Add cron job: weekly check for inactive users → send nudge
5. Add completion hook: on game status → 'played' → send celebration

### Cost Thresholds

| Users | Emails/Month | Service | Cost |
|-------|-------------|---------|------|
| 0-500 | ~1,500 | Resend Free | $0 |
| 500-2K | ~6,000 | Resend Pro | $20/mo |
| 2K-10K | ~30,000 | Resend Business | $80/mo |
| 10K+ | 100K+ | Resend or migrate to SES | $100-200/mo |

---

## Pre-Launch Checklist

### Before Any Marketing Push

- [ ] Landing page live (explains what it is before you use it)
- [ ] OG image updated (done ✅)
- [ ] Discord unfurl working (done ✅)
- [ ] Meta description punchy (done ✅)
- [ ] Error monitoring added (Sentry)
- [ ] Uptime monitoring added
- [ ] "Share" flow polished (OG cards for shared profiles)
- [ ] Mobile experience solid (mostly done, needs Google login test)
- [ ] Rate limiting on import APIs
- [ ] Cache layer for enrichment

### Content Pre-Written (Draft Before Launch)

- [ ] 3 Reddit post variants
- [ ] 1 Hacker News "Show HN" title + first comment
- [ ] 5 tweets/X posts (build-in-public angle)
- [ ] 1 blog post ("I had 735 games and built a thing")
- [ ] Product Hunt listing copy
- [ ] Press pitch (1 paragraph)

### Assets Needed

- [ ] 3-5 screenshots (dark theme, cozy theme, reroll modal, completion celebration)
- [ ] 1 hero image (for Product Hunt, blog headers)
- [ ] 1 short video/GIF (import → roll → pick → play flow, 15 seconds)
- [ ] Favicon and app icon finalized

---

## Timing Strategy

Don't launch everywhere at once. Stagger for sustained visibility:

**Week 1**: Reddit (r/patientgamers first — most aligned audience)
**Week 2**: Discord servers + Twitter
**Week 3**: Hacker News + Dev.to blog post
**Week 4**: Product Hunt launch
**Week 5+**: YouTube outreach, press pitches

This way each channel feeds the next. Reddit users tweet about it. HN readers upvote the Product Hunt launch. Momentum compounds.

---

## What NOT to Do

- Don't buy ads yet. Organic first. Ads are for scaling what already works.
- Don't spam Discord servers. One genuine post per server, then engage with replies.
- Don't write AI-sounding blog posts. Write like a person who made a thing.
- Don't obsess over metrics before 1,000 users. Below that, everything is noise.
- Don't add features for marketing. The product markets itself or it doesn't.
