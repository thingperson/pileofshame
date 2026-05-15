# PWA Explainer — What It Means for Inventory Full

**Question Brady asked:** "PWA was when I asked if this can be a mobile app on someone's homescreen — I don't know if it means more or less than that."

**Short answer:** PWA means *more* than just homescreen, and we should think of it as a three-tier decision — each tier unlocks more capability and costs more complexity.

---

## What "PWA" actually means

PWA = Progressive Web App. Three tiers of capability, each separable:

### Tier 1: Installable homescreen icon *(what Brady was thinking)*
- User visits site on phone → browser offers "Add to Home Screen"
- Launches full-screen, no browser chrome, looks like a native app
- Needs: `manifest.json` with icons, name, theme-color, display mode
- **We already have this.** Manifest is wired.

### Tier 2: Offline capability
- App works without internet (viewing library, making picks, basic nav)
- Needs: a **service worker** that caches assets + data
- Capability: user can open app on a plane and still pick a game
- Cost: service worker complexity — cache invalidation is famously the hard part

### Tier 3: Push notifications + background sync
- Re-engagement pushes ("3 weeks since you played — we picked something")
- Background sync (library updates while app is closed)
- Needs: service worker + explicit user permission + push infrastructure
- Cost: legal compliance (consent flow), Apple/Google push quirks, infra to send pushes

---

## What we have today

- `manifest.json` ✅ (Tier 1 working)
- Icons (192, 512, apple-touch) ✅
- Installable on iOS Safari + Android Chrome ✅
- **No service worker** ❌ (no Tier 2 or 3)

So today's PWA = "it goes on the homescreen." Nothing more.

---

## Should we advance the tiers?

### Tier 2 (offline) — conditional YES
Our app could genuinely benefit from offline mode. Someone in front of their Xbox, WiFi flaky, wants a pick — the core loop is *all local state* (localStorage is authoritative per our architecture). A service worker would let the app load fully offline; they just wouldn't get enrichment updates or Supabase sync until connectivity returns.

**When to ship:** not urgent. Nice polish for mobile-as-primary-surface. Worth pairing with the mobile best-practices pass.

### Tier 3 (push notifications) — conditional NO for now
Push notifications have a thesis tension: notifications pull users back into the app. Our thesis is "less time in app = success." Any notification better terminate in play, not in browsing.

**If we ship push:** only in service of the core loop. Example allowed: "Quick pick? You haven't played *Hollow Knight* in a week — pull the trigger?" (terminates in play). Example banned: "5 new games were enriched in your library." (pulls back to browse, no play terminus.)

Also: push adds legal surface (consent, CAN-SPAM analogue, preference center for push). Infra cost is non-zero.

**When to ship:** deliberately late. Phase 5 in roadmap is correct. But see `docs/email-infra-spec-2026-04-20.md` — email re-engagement is moving earlier, which addresses the retention problem cheaper.

---

## The distribution question

The real question Brady was circling: **is PWA a distribution channel, or a nice-to-have?**

### Case for treating PWA as a channel
- No app store approval
- No 30% cut
- Installed from a URL — aligns with our SEO strategy
- Lower barrier than native app download
- Same codebase, no platform split

### Case against
- iOS has historically limited PWAs (no push before iOS 16.4, still treats them second-class)
- Users don't naturally think "install this web app" — discovery is via URL, not App Store
- Native iOS/Android (Phase 6 in roadmap) may be a better eventual home

### Recommendation
Treat Tier 1 PWA as **free marketing surface** — someone who loves the app should be able to install it on their phone, easy. We already have this.

Treat Tier 2 as **polish, not priority** — ship it when we do a mobile performance pass.

Treat Tier 3 as **explicitly gated** until we're ready for re-engagement tooling AND confident the notifications serve play-termination, not session-length.

Don't frame PWA as "our mobile strategy." It's a distribution surface, not the strategy. The native mobile app in Phase 6 is a separate product decision — one that should only happen if PWA adoption shows real mobile usage patterns.

---

## Actions

- [ ] Audit current `manifest.json` for completeness — splash screens, status-bar color, orientation
- [ ] Verify iOS Safari install works end-to-end (test on actual device)
- [ ] Verify Android Chrome install works end-to-end
- [ ] Add install-prompt UI if it isn't there yet (mobile-only, dismissable, doesn't nag)
- [ ] Defer service worker until the mobile best-practices sprint

The audit items are 15 min total. The install-prompt UI is ~1 hr. Service worker is a multi-session commitment.
