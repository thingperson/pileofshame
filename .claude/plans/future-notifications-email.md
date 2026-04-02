# Future: Notifications & Email Marketing

Status: ONE DAY — not needed for launch, crucial for scale.

## Push Notifications (PWA)

PWAs support push notifications via the Web Push API + service worker.
No app store needed. Works on Android natively, iOS 16.4+ with limitations.

### What we'd notify about:
- Wishlist game price drops ("Hades is 75% off on GOG")
- Weekly backlog nudge ("You haven't played in 5 days. 20 min?")
- Completion streaks ("3 games cleared this month. Keep going.")

### What we need to build:
1. Service worker for push subscription management
2. Backend to store push subscriptions (Supabase table)
3. Scheduled job to check ITAD/CJ prices against wishlists
4. Push notification dispatch (web-push npm package, free)

### Cost: Free (self-hosted push, no third party needed)

---

## Email Marketing

### Phase 1: Transactional deal alerts (low effort)

**Tool: Resend** (resend.com)
- Free tier: 3,000 emails/month, 100/day
- $20/mo for 50K emails
- React Email integration (emails as React components, perfect for Next.js)
- Pay per send, not per contact
- API-first, minimal setup

Use for:
- Wishlist deal alerts ("3 games on your wishlist are on sale")
- Weekly backlog digest (opt-in)

### Phase 2: Marketing sequences (later)

**Tool: Loops** (loops.so) or **Buttondown** (buttondown.com)
- Loops: $0 up to 1K contacts, $49/mo for 5K
- Buttondown: Free up to 100 subscribers, $9/mo for 1K
- Visual editors, automation workflows, segmentation

Use for:
- Welcome sequence after signup
- Re-engagement ("You haven't cleared a game in 30 days")
- Feature announcements
- Community content

### Phase 3: Scale (if we get there)

**Amazon SES** for raw volume
- $0.10 per 1,000 emails
- Would need own template system
- Only worth it at 50K+ subscribers

---

## Email Consent & Compliance

Must build before any email sends:
- [ ] Opt-in checkbox during signup ("Email me about deals and updates")
- [ ] Separate consent for deal alerts vs marketing (granular preferences)
- [ ] Unsubscribe link in every email (legally required)
- [ ] CAN-SPAM compliance (physical address, clear sender, honor opt-outs within 10 days)
- [ ] CASL compliance (Canada — requires express consent, not implied)
- [ ] GDPR compliance (EU — requires explicit opt-in, not pre-checked boxes)
- [ ] Email preferences page (manage frequency, categories)
- [ ] Store consent timestamps in Supabase

---

## Wishlist Import Sources

What users might want to import wishlists from:

| Platform | Export? | API? | Status |
|----------|---------|------|--------|
| Steam | Yes (via API) | Yes | DONE — already built |
| IsThereAnyDeal | Yes (JSON export from waitlist) | Yes (with API key) | Could build |
| GG.deals | No export found | API exists but no wishlist export | Skip |
| GOG | No public wishlist export | No public API | Skip |
| Epic Games Store | No export | No public wishlist API | Skip |
| PlayStation Store | No export | No public API | Skip |
| Nintendo eShop | No export | No public API | Skip |
| Deku Deals (Switch) | No export | No API | Skip |
| PSPrices | No export | No API | Skip |

**Realistic additions:**
1. ITAD waitlist import (they have an API endpoint for this)
2. Manual wishlist — let users search and add games to wishlist within our app
3. CSV/JSON import — generic format users could paste

---

## Implementation Priority

1. **Manual wishlist management** (search + add to wishlist in-app) — high value, low effort
2. **In-app deal banner** for wishlisted games on sale — medium effort
3. **PWA push notifications** for price drops — medium effort, free
4. **Resend integration** for deal alert emails — medium effort, free tier
5. **Email consent flow** during signup — must do before any emails
6. **ITAD waitlist import** — low effort if user has ITAD account
7. **Marketing email sequences** — only after significant user base
