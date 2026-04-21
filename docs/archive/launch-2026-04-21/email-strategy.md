# Email Strategy — Inventory Full

**Status:** Collection mode only. Zero marketing flows live. This doc is the playbook for when we're ready.

**Locked principle:** No marketing email goes out until we have explicit `marketing_consent = true` from the user. Transactional (magic link, password reset) is allowed without consent because it's strictly necessary to deliver the requested service.

---

## Right now (pre-launch through ~1k users)

**What we do:**
- Collect emails with explicit purpose and explicit marketing-consent checkbox separately
- Store in Supabase (`feedback.email`, future `email_subscribers`) with `marketing_consent` flag
- Send zero marketing email
- Send transactional only: magic-link sign-in via Supabase + Resend SMTP

**What we do NOT do:**
- Auto-add anyone to a list
- Pre-check the consent box
- Treat "they signed up for the app" as marketing consent
- Send a "welcome" marketing email even if they opted in (no flow built yet)

---

## Capture moments (build now, even if no flow exists)

Every capture surface MUST: ask only when there's a clear value exchange, never pre-check consent, separate email-required from marketing-consent.

| # | Surface | Trigger | Value exchange | Marketing consent shown? |
|---|---|---|---|---|
| 1 | **Sample post-completion** | User finishes sample onboarding (without signing up) | "Save your archetype + we'll email you when X ships" | Yes — explicit checkbox |
| 2 | **Share-card "make yours"** | Visitor lands on someone else's `/clear/[id]` | "Make your own — drop your email and we'll send a link" | Yes — explicit checkbox |
| 3 | **Feedback widget** | Already shipped (Item 6) | "Hear from us about updates" | Yes — explicit checkbox, only if email entered |
| 4 | **Year-in-Review (Q4 2026)** | December annual recap | "Subscribe to next year's recap" | Yes — explicit checkbox |
| 5 | **Re-engagement nudge** *(later)* | User hasn't opened app in 30+ days, opted in | None at capture — collected at signup | (must already be opted in) |

**Order to ship:** #3 (done) → #2 (with share-card revamp) → #1 (post-launch) → #4 (Q4) → #5 (after #1+#4 prove value).

---

## Service progression

Don't pay for tools we're not using.

### Tier 0 — Now (0–1k subs)
- **Storage:** Supabase tables (`feedback`, future `email_subscribers`)
- **Transactional sender:** Resend (free: 3k/month, custom domain)
- **Marketing sender:** none — we're not sending any
- **Cost:** $0

### Tier 1 — Engagement begins (1k–5k subs, first marketing send)
- **Storage:** Same Supabase tables
- **Marketing sender:** Resend Audiences (free up to 3k contacts) OR Buttondown (free 100 subs, $9/mo for 1k)
- **Recommendation:** Resend Audiences if we stay under 3k. Same API key, no extra account.
- **Cost:** $0–9

### Tier 2 — Real list (5k–25k subs)
- **Marketing sender:** Resend Audiences ($20/mo for 10k, $40/mo for 25k) OR ConvertKit ($25/mo for 1k, scales)
- **Recommendation:** Stay on Resend unless we need automations Resend can't do (drip flows, segments, advanced tagging — Resend's getting better, evaluate when we cross 5k)
- **Cost:** $20–50

### Tier 3 — Scale (25k+ subs, automations live)
- **Migrate to:** Customer.io ($100/mo starter, real automations) or ConvertKit Creator Pro
- **Reason to migrate:** automations, behavioral triggers, multi-step drips, A/B testing
- **Don't migrate just because:** you can. Migrations cost weeks. Only do it when current tool actually blocks something we want to ship.
- **Cost:** $100–300

---

## Starter flows (when we cross Tier 1)

Don't build all of these on day one. Pick **one** to start. Validate. Then add.

### Flow A: Welcome series (single email, not a series)
- **Trigger:** New marketing-consent opt-in
- **Send:** Immediately
- **Content:** Confirms opt-in, restates what they'll get ("about one email a month — new features, no nags"), unsubscribe footer, link back to app
- **Goal:** Set expectation. That's it. No upsell, no roadmap pitch.

### Flow B: Re-engagement nudge (manual at first, automated later)
- **Trigger:** Opted-in user hasn't opened app in 30+ days
- **Send:** Once. Never twice.
- **Content:** "Your pile's still there. Want a suggestion?" + one personalized recommendation from their own library
- **Goal:** Bring them back to the core loop. Ungated.

### Flow C: Year-in-Review (annual)
- **Trigger:** December 1
- **Send:** All opted-in users
- **Content:** Their personal recap card + link to share
- **Goal:** Viral moment. Reinforce identity. Drive shares.

### Flow D: Big-feature announcement (manual broadcast)
- **Trigger:** Major shipment (Pro tier launch, mobile app, etc.)
- **Send:** All opted-in users
- **Frequency:** Max 4/year
- **Content:** What shipped, why they'd care, link to try
- **Goal:** Re-engagement around real news.

**Cadence ceiling: 1 email per opted-in user per month, max.** Anything more and we burn the list.

---

## Voice for email

Same as the app — gaming buddy, witty, never marketing-speak. Subject lines should feel like a friend texting:
- ✅ "Your pile's been quiet."
- ✅ "Year in Review is up."
- ✅ "We added a thing you asked for."
- ❌ "🚀 Exciting Updates from Inventory Full!"
- ❌ "Don't miss out — limited time"

Read every subject line aloud. If it sounds like a brand, rewrite it.

---

## Compliance gates

Before sending the first marketing email, this list must be true:

- [ ] Privacy policy explicitly mentions email marketing as a use of `marketing_consent = true` data
- [ ] Every email has a working one-click unsubscribe (Resend handles this if configured)
- [ ] Email footer includes physical address (CAN-SPAM requirement, US)
- [ ] Sender domain has SPF + DKIM + DMARC configured (Resend setup wizard)
- [ ] We can prove consent timestamp for any subscriber (already tracked via `feedback.created_at`)
- [ ] Unsubscribes are honored within 10 days (Resend handles this)
- [ ] No segmenting on sensitive categories (race, health, etc.) — we don't collect any anyway

Most of these are baseline. The first one (privacy policy update) is the actionable gate.

---

## What we do NOT build

- No "your friend joined" notifications (we don't have friend graph and won't)
- No "this game is on sale" emails to users who don't own it (legal-compliance.md grey area)
- No automated abandoned-cart-style emails ("you started an import and didn't finish")
- No daily digests
- No streak emails ("you haven't logged in in 3 days")
- No third-party email tools that share data (Mailchimp's data practices are out)

---

## When to revisit this doc

- When list crosses 1k opted-in subscribers (move to Tier 1)
- When considering first marketing send (run compliance gate)
- When evaluating a new ESP
- Annually as part of legal review
