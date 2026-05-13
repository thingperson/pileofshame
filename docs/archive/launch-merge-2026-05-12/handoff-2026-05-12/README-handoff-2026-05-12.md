# Handoff — 2026-05-12

Files produced during this session for the Inventory Full launch refresh. Integration notes for each below.

---

## Files in this package

| File | Status vs. existing docs | Action |
|------|--------------------------|--------|
| `show-hn-draft-2026-05-12.md` | **Replaces** the "Show HN" subsection in `LAUNCH_BIBLE.md` §5 Copy Bank | Overwrite that section |
| `creator-outreach-2026-05-12.md` | **Replaces** the "Creator Outreach Template" subsection in `LAUNCH_BIBLE.md` §5 | Overwrite that section |
| `subreddit-skeletons-supplementary-2026-05-12.md` | **Supplementary** to `distribution-plan.md`. Does not replace. | Add as a new doc alongside |
| `demo-footage-workflow-2026-05-12.md` | **New.** No equivalent in existing docs. | Add as a new doc, consider linking from `LAUNCH_BIBLE.md` §6 Infrastructure |
| `landing-page-one-liner-audit-2026-05-12.md` | **Notes/decisions doc.** Not copy. Informs edits to `app/page.tsx` | Read once, action items in priority order at the bottom |

---

## What's NOT in this package (and why)

- **Bigger psychology write-up.** Held until you pick venue (r/truegaming long post / Slant blog essay / HN companion piece) and load-bearing thesis (Mischel identity / Loewenstein prediction / SDT autonomy). Those choices change the shape of the piece too much to draft blind.
- **Anything that conflicts with `distribution-plan.md`.** Your May-5 plan supersedes the build-in-public sub list from earlier in this conversation. Follow the distribution plan as-is.
- **Updates to `behavioral-learning-framework.md` or `monetization-plan.md`.** No changes needed there — those docs are sound. The decision-engine specifics from the behavioral framework got pulled into the HN draft and demo workflow as proof points, not as edits to the framework itself.
- **A standalone Discord bot distribution doc.** Your `discord-bot-spec.md` already covers this comprehensively (Tier 1 in 3 days, Fly.io free tier, `/pick` as the lead distribution feature). The bot got pulled into the HN draft's "what's on the roadmap?" reply rather than written up separately.

---

## Factor-in pass (revision 2 — added 2026-05-12 evening)

After the first version of this package, three additional source docs were read and their content folded in:

**`BUILD_HISTORY.md` (94 shipped features) changes that landed:**

- The HN draft now reframes "four days" honestly: first version in four days, then a month of building, ~90 shipped features, ~20K lines of code, going through a pre-push review skill. The "four days alone" framing was selling the product short.
- Mechanics paragraph in the HN draft now mentions "Why This Game?" reasoning (item #85 in build history), Smart Import + PostImportSummary (items #72, #73, #80), and Jump Back In cheat sheet (item #79). All shipped, all differentiators against random pickers.
- Demo workflow's 75-second structure now centers the PostImportSummary moment ("Your actual backlog is 155 games, not 200") as the silent reframe — most defensible product moment, gets 6 seconds of breathing room in the demo.
- Landing-page audit now flags that Smart Import and Jump Back In are invisible from the landing page. These are real product depth that contradicts the "is this just a random picker" reflex and the page is hiding them.

**`competitive-landscape-2026-04-20.md` (12 direct + adjacent competitors) changes that landed:**

- HN prepared replies now have specific-named answers for Backlog Roulette (closest direct competitor, paywall'd, Steam-only), Backloggd (biggest latent pivot risk, recommendations on roadmap), Pick a Game (filter-heavy, opposite thesis), and ChatGPT as a habit (sleeper threat, moat is library memory across sessions).
- Creator outreach now includes a competitive-preemption variant for YouTubers who've already covered Steam Roulette / Backlog Roulette. Naming the alternative they covered respects their existing work and demonstrates the differentiator (multi-platform, "Why This Game?" reasoning, Moved On as first-class exit).
- Landing-page audit flags the durable edge identified in the competitive doc — "thesis discipline" — and recommends one or two product-in-action screenshots (PostImportSummary, Why This Game? chips) to show the thesis is implemented, not just stated.

**`discord-bot-spec.md` (Tier 1 in 3 days, $0/mo on Fly.io free tier) changes that landed:**

- HN draft's "What's on the roadmap?" prepared reply now leads with the Discord bot. The `/pick` command works without an IF account — gaming Discords install it for the random-pick utility, members discover IF through the embed footer. This is bottom-up distribution that demonstrates roadmap thinking to HN readers without requiring them to commit.
- Roadmap reply also mentions subscription-library mode (Game Pass / PS+ / GeForce NOW, identified as white space in the competitive doc) and couch co-op pick flow (also white space, thesis-aligned). These signal the product has depth beyond the launch surface.

---

## Voice-sweep notes

All files were scrubbed against `ai-lingo-reference.md` before delivery. Specifically:

- No "not X, it's Y" reframes
- No em-dashes for dramatic pauses (em-dashes used only for em-bracketed parentheticals, and even then sparingly)
- No banned vocab from the verbs/adjectives/nouns/adverbs lists
- No banned phrases ("at its core", "in today's world", etc.)
- No triple-adjective lists
- No "unlock"/"elevate"/"dive into" verb family
- Parallel structures used at most once per piece

**Manual sweep still recommended before any of these go public.** The read-aloud test catches what grep can't, and the Show HN post especially should pass that test before submission.

---

## Sequence of next moves (recommended)

If you want to actually use this package, the right order is:

1. **Review the Show HN draft** (10 min). The replies section grew significantly with the competitive-landscape pass — read those and confirm they sound like things you'd actually say. Pick a title from the three options.
2. **Run the read-aloud sweep on the HN draft.** Catch anything metronomic. Edit until it has hills and valleys. The post is denser now — worth running through aloud twice.
3. **Run the demo footage workflow** (3 hours, one sitting). The 75-second structure now hinges on the PostImportSummary moment — make sure your import demo data produces a clean reframe ("155 games, not 200" or similar). If the math doesn't land cleanly, swap in a different example library.
4. **Make the landing-page edits** from the priority list at the bottom of the audit file (~50 min). Three text edits plus one screenshot of PostImportSummary in action.
5. **Decide on the psych write-up venue and thesis** so I can draft a first version when you're ready for that.
6. **Submit the HN post** Tue or Wed 8–10am PT, ideally the week after the demo video is live and the landing page is cleaned up. PH the same week.
7. **Start the Tier 1 creator outreach** (10/day) the day after the HN post lands. Use the competitive-preemption variant for any creator who's already covered random pickers.
8. **Decide on the Discord bot Tier 1 build** — your spec says 3 days, $0/mo, gated only on having a focused window. If the HN post lands well, this becomes high-leverage distribution. If it doesn't, the bot can still drive bottom-up discovery from gaming Discords independently.

---

## On the launch timing question

Your launch bible from April 21 had public push starting Apr 28, Reddit posts Apr 29 / 30 / May 1 / 3, PH May 6, HN that same week. Today is May 12 and you mentioned 0 users for ~2 weeks. The launch as originally scheduled either didn't fully execute, or executed but didn't land.

Worth being clear with yourself about which one happened, since the next moves differ:

- **If the original plan didn't execute** (Reddit posts didn't go up, PH didn't happen, HN didn't happen), then this package gives you the upgraded copy and workflow to actually run it now. Don't re-litigate the timing — just run it.
- **If the original plan executed but didn't land** (posts went up and got no traction), then the question is what to fix before going again, not just what to redo. The HN draft in this package is materially different from the launch-bible HN draft, so submitting again with this version is reasonable. But also worth diagnosing the launch-bible version's performance: did it hit front page and decay, or never gain enough early upvotes to surface?

Either way, the work product in this package is forward-usable.
