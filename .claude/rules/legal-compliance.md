# Legal & Privacy Compliance — Feature Review Framework

This rule is loaded every session. It applies to ALL feature design, implementation, and review. When proposing or building any feature, run it through this framework BEFORE writing code.

## The Core Test

**"Did the user ask to see this, or are we showing it because we think they'd buy it?"**

If the user initiated the action (opened their library, looked at their game, checked their wishlist), we're clean. If we're pushing content to them based on what we know about them, we need explicit consent — or we don't build it.

## Hard Lines — Never Cross These

These are absolute. No feature, no matter how good the idea, can violate these:

1. **Never sell, rent, share, or trade user data with any third party.** Not anonymized. Not aggregated. Not "just metadata." Nothing leaves our control.
2. **Never let advertisers, publishers, or any external party target specific users through our platform.** We are not an ad network.
3. **Never track users across external sites or apps.** No cross-site tracking, no fingerprinting, no pixel trackers beyond GA4.
4. **Never store authentication credentials server-side.** PSN tokens, passwords, OAuth secrets — ephemeral only, never logged, never persisted.
5. **Never market to or collect data from users under 13.** COPPA and PIPEDA are strict here.
6. **Never make automated decisions that significantly affect the user** outside of game recommendations (no credit, employment, insurance, housing, etc. — not that we would, but the line is stated).

## Grey Area Triggers — Stop and Review

If a feature involves ANY of the following, **stop building and review against this document first:**

### Pushing content the user didn't request
- Push notifications based on user behavior or profile → **requires explicit opt-in consent, separate from account creation**
- Email marketing based on library analysis → **requires explicit opt-in consent**
- "You might like this game you don't own" recommendations → **this is behavioral targeting for new purchases, legally distinct from showing deals on owned games**
- Any proactive outreach (email, notification, in-app prompt) driven by user data → **requires consent**

### Using behavioral data to drive purchases
- "Users who played X also bought Y" → **recommendation-to-purchase pipeline, requires disclosure**
- Surfacing deals on games the user does NOT own based on their play patterns → **crosses from "helping you play what you have" to "selling you new things based on your profile"**
- Any feature where a third party benefits from our user data (even indirectly) → **review required**

### Expanding data collection or storage
- Any new third-party API that receives user data (even game names) → **update Privacy Policy before shipping**
- Moving any data from client-side (localStorage) to server-side (Supabase) → **update Privacy Policy before shipping**
- Any new analytics, tracking, or telemetry beyond current GA4 scope → **update Privacy Policy before shipping**
- Storing any new category of user data (location, age, spending, social connections) → **update Privacy Policy before shipping**

### New revenue or commercial features
- Affiliate links on any surface → **FTC disclosure required on the page, Privacy Policy update**
- "Sponsored" or "featured" game placements → **this makes us an ad platform — hard no under current model**
- Premium/paid features that use behavioral data as the value prop → **review whether the paywall creates a "pay for your own data" dynamic**

### Sharing or exposing user data
- Public profiles showing library/stats → **user must opt in, not opt out. Default is private.**
- Social features (compare piles, friend lists) → **user controls what is visible, granular privacy settings**
- Leaderboards or community features → **anonymized or opt-in only**
- Any feature that makes one user's data visible to another user → **explicit consent required**

## The Safe Zone — Build Freely

These patterns are legally and ethically clean. No review needed:

- Showing deals on games the user already owns or has wishlisted
- Recommending games from the user's own library based on mood/time
- Generating behavioral profiles (archetypes, stats) that stay client-side or in the user's own account
- Auto-enriching games with public metadata (RAWG, HLTB) using game names (no user data sent)
- Celebrating completions, showing progress, nudging within the app during active use
- Exporting/importing the user's own data in portable formats
- Showing aggregate anonymous stats ("10,000 users have cleared 50,000 games") with no individual identification

## When In Doubt

1. Would this feature work the same way if we had zero user data? If yes, it's probably fine.
2. Is a third party benefiting from our knowledge of this specific user? If yes, stop.
3. Would the user be surprised to learn we're doing this? If yes, either don't do it or get explicit consent.
4. Does this feature serve the user's stated intent, or our commercial interest? If the latter, review carefully.

## Disclosure Update Checklist

When a feature triggers a Privacy Policy or Terms update:

- [ ] Update `app/privacy/page.tsx` with new data collection/usage
- [ ] Update `app/terms/page.tsx` if new terms apply
- [ ] Update the "Last updated" date on both pages
- [ ] Deploy policy updates BEFORE or SIMULTANEOUSLY with the feature — never after
- [ ] If the change is material (new data category, new third-party sharing), consider an in-app notice

## Reference

- Privacy Policy: `app/privacy/page.tsx`
- Terms of Service: `app/terms/page.tsx`
- Roadmap legal guardrails: `docs/ROADMAP.md` → "Legal Guardrails" section
- Applicable laws: CCPA/CPRA (California), PIPEDA (Canada), COPPA (US children), FTC Endorsement Guidelines (US affiliate disclosure)
