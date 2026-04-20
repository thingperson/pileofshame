# Email Infra Spec — 2026-04-20

What we need, what we don't, who sends it, what the checkbox says. Companion to `docs/email-strategy.md` (which covers *when* to send). This doc covers *how* to send.

Cover-costs-first posture: stay on free tiers until a real send demands otherwise.

---

## 1. Transactional vs. marketing — the line that matters

**Transactional email** is triggered by a user action and necessary to deliver the service they asked for. Magic-link sign-in. Password reset. Receipt for a purchase. "Your export is ready." No consent needed — they asked for the thing.

**Marketing email** is anything we send because *we* decided it's a good time. Re-engagement nudges. "Hey, new feature." Newsletter. Share-card invites to strangers. Requires explicit, unbundled opt-in under GDPR, implied or express under CAN-SPAM, and an honored unsubscribe.

Why we care about the split:

1. **Legal.** Mixing them in one stream risks marketing-grade compliance failures on transactional sends (now everything needs an unsubscribe, now you've got CAN-SPAM exposure on a password reset).
2. **Deliverability.** Mailbox providers score marketing and transactional traffic differently. Mixing them lowers transactional deliverability — the thing that matters *most* to get right, because a failed magic link is a failed login.
3. **Revocability.** A user can unsubscribe from marketing and still expect magic-link emails. Separate streams means we can honor that cleanly.

**Rule:** transactional and marketing ride on separate sender domains or at minimum separate subdomains (`auth.inventoryfull.gg` vs `updates.inventoryfull.gg`) and separate API keys / services.

---

## 2. Service comparison

Researched 2026-04-20. Pricing linked at bottom.

| Service | Free tier | Transactional $ | Marketing $ | Deliverability rep | Next.js fit | Our fit |
|---|---|---|---|---|---|---|
| **Supabase built-in SMTP** | Team-members only; unusable in prod | N/A (auth only, and only via custom SMTP in prod) | N/A | N/A | Native | Route auth emails *through* a real provider — Supabase's built-in is dev-only |
| **Resend** | 3k/mo transactional, 1k marketing contacts, 1 domain | $20/mo for 50k | $40/mo for 5k contacts | Strong, modern | Best-in-class (React Email, `@resend/node`) | **Pick** |
| **Postmark** | 100/mo (test only) | $15/mo for 10k, $1.30/k overage | Message Streams (pricing opaque) | Gold standard for transactional | Good (REST API) | Runner-up on transactional only |
| **SendGrid** | 100/day | $19.95/mo for 50k | Separate Marketing product, $15+/mo | Battle-tested but noisy | Decent | Overkill, corporate-UX |
| **Mailgun** | 100/day trial, expires | $15/mo for 10k | Separate product | OK — deliverability reputation wobbly lately | Decent | No reason to pick over Resend |
| **AWS SES** | 3k/mo first 12 mo (new AWS accts) | $0.10 per 1,000 emails | None (bring your own UI) | Strong IF you warm the IP | Clunky (needs your own wrapper) | Cheapest at scale; worst DX |
| **Loops** | 1k contacts, 4k sends/mo | Included | Included | Growing rep, good for product-led | Good | Single-provider split; strong option for marketing later |
| **Brevo** | 300/day, unlimited contacts | Included | Included | OK | Decent | Free tier generous, brand "Sent with Brevo" footer on free |
| **Buttondown** | 100 subs free | — | $9/mo for 1k | Strong indie-newsletter rep | Simple API | Only if marketing = newsletter-style |

---

## 3. Recommended stack

**Transactional: Resend.** Keep it. Already referenced in `email-strategy.md`. Free tier (3k/mo) covers us through at least 5k MAU given most users stay in guest mode. React Email integrates cleanly with our Next.js 16 codebase. One API key, one domain, one bill.

**Auth emails: Supabase → Resend via custom SMTP.** Supabase's built-in SMTP is dev-only (refuses delivery to anyone outside the project team). Configure Supabase Auth to use Resend as its SMTP provider. Supabase templates the email; Resend delivers it. Cost stays $0 until we exceed 3k/mo.

**Marketing: spec-only until first real send.** When share-card v2 or re-engagement ships, default to **Resend Audiences** — same provider, same domain auth, same API key, minimal ops overhead. Evaluate Loops when we need drip automations Resend can't do (Resend's marketing product is simpler than Loops on lifecycle flows). Don't commit now.

**Domain split:** `auth.inventoryfull.gg` for transactional, `updates.inventoryfull.gg` for marketing when it ships. Both SPF/DKIM/DMARC-authenticated via Resend.

**Why not AWS SES:** cheapest at scale, but the DX cost (IP warming, bounce handling, compliance UI, template management) costs more than the $20/mo Resend charges until we're sending >50k/mo. We're not.

**Why not Loops today:** great product, but we don't have marketing volume to justify a second vendor account yet. Revisit when re-engagement ships.

---

## 4. Consent checkbox copy — in voice

Three drafts. All unchecked by default. All separate from the main sign-up action. All CAN-SPAM + GDPR + CCPA-compliant (explicit affirmative action, clear purpose, easy to revoke).

### Draft A — short and warm

> Email me when something good ships. No spam, no newsletters, no "10 ways to clear your backlog."

Legal floor: purpose is disclosed ("when something good ships"), consent is affirmative (they tick the box), the negative framing ("no spam") sets a reasonable expectation. Unsubscribe link in every email footer covers the revocation right. Privacy Policy link sits next to the checkbox.

### Draft B — with the brand's self-aware humor

> Yeah, send me emails. Only the useful kind — new features, stuff that actually helps me play more and decide less.

Legal floor: same as A. "Only the useful kind" is a soft promise, not a guarantee — back it up by actually sending only useful emails. "Yeah" opener makes the consent feel voluntary and casual, not bureaucratic.

### Draft C — direct, one sentence

> Sure, email me when we ship something worth knowing about.

Shortest of the three. Still meets the compliance bar: affirmative, specific to purpose, unbundled from the main action. Pairs well with a small-print line underneath: "Unsubscribe anytime. We never share your email."

### Banned patterns avoided

Reference: `.claude/rules/voice-and-tone.md`.

- No "dive in", "unlock", "elevate"
- No em dashes for drama
- No "whether you're X or Y"
- No triple adjective lists ("helpful, timely, relevant")
- No "We hereby" or "you acknowledge" legal slop
- No pre-checked box, no bundled consent, no "by creating an account you agree"

### Brady's draft, tightened

Original: *"opt in to our awesome emails that help you and never spam you"*

Tightened: *"Opt in for emails that help you play more. No spam."*

Legally sound because "help you play more" is specific enough to describe the purpose. "No spam" is a commitment — live up to it (no affiliate blasts, no sponsored content masquerading as product updates).

---

## 5. Legal anchors

Every marketing email MUST include:

1. **Working unsubscribe link.** One click to unsub, no login required, processed within 10 business days (CAN-SPAM). GDPR requires it to be as easy as opting in.
2. **Sender identification.** "Inventory Full" in From name, a reply-to that reaches a human.
3. **Physical postal address.** CAN-SPAM requires a valid physical address. P.O. box is fine. Get one, don't use a home address.
4. **Purpose line / context.** Either in the footer or header, a one-liner reminding the reader why they're getting this email ("You signed up at inventoryfull.gg on [date]").
5. **Link to Privacy Policy.** Standard footer item.
6. **Preference center** *(when list grows past ~1k):* lets users pick email types instead of all-or-nothing unsubscribe. Not required at small scale, required by best practice by 5k subs.

Transactional emails MUST include:

1. Clear identification of sender and purpose.
2. No marketing content bundled in. A receipt is a receipt.
3. Privacy Policy link (not legally required for strictly transactional, but good hygiene).

Database hygiene:

- Double opt-in not legally required under CAN-SPAM; *is* effectively required for healthy deliverability in EU. Recommend enabling once marketing sends go live.
- Log consent: timestamp, IP, source surface, exact checkbox text shown. Store in Supabase `email_consent_log` table.
- Honor unsubscribe server-side within minutes, not days. Resend handles this via their List-Unsubscribe support.

---

## 6. Triggers — when to wire each piece

| Component | Wire when | Why not sooner | Why not later |
|---|---|---|---|
| Supabase → Resend SMTP for auth | **Now** if auth is live for any non-team user | Supabase built-in won't deliver to real users | Broken magic links = dead product |
| Transactional email templates (magic link, pw reset) | With the SMTP wiring. Use Supabase default templates initially, customize post-launch. | Blocks auth for non-team users | — |
| Receipt emails | When monetization ships (first paying user) | Not needed pre-revenue | Legal: receipts must accompany charges |
| Resend Audiences (marketing list) | When share-card v2 ships OR at 1k MAU, whichever first | No list = no send = no reason to pay | Want list built *before* the first marketing moment |
| First marketing send (re-engagement) | When share-card v2 ships AND list >200 opted-in | Sub-200 is a rounding error | Dormant list decays fast; send something within 60 days of first signup |
| Preference center | At 1k marketing subs or first complaint, whichever first | Over-engineering | Unsub complaint = deliverability hit |
| Second domain split (`updates.inventoryfull.gg`) | Before first marketing send | Not needed for auth-only | Protects transactional deliverability |

---

## 7. References

- Resend pricing: https://resend.com/pricing
- Postmark pricing: https://postmarkapp.com/pricing
- Loops pricing: https://loops.so/pricing
- AWS SES pricing: https://aws.amazon.com/ses/pricing/
- Brevo free plan: https://help.brevo.com/hc/en-us/articles/208580669
- Supabase Auth SMTP docs: https://supabase.com/docs/guides/auth/auth-smtp
- CAN-SPAM Act compliance: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- GDPR consent guidance: https://gdpr.eu/checklist/
- Internal: `docs/email-strategy.md`, `.claude/rules/voice-and-tone.md`, `.claude/rules/legal-compliance.md`
