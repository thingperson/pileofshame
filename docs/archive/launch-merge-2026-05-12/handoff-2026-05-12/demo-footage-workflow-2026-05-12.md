# Demo footage workflow — 2026-05-12

**Status:** NEW. No equivalent in existing docs. Suggest adding to `LAUNCH_BIBLE.md` §6 Infrastructure or as a standalone supporting doc.

For the Product Hunt video, the HN post hero image/GIF, landing-page demo, and creator outreach footage. All from one production session.

---

## TLDR

You don't need AI video generation. AI video tools (Veo 3.1, Kling 3.0, Runway, Pika) generate cinematic content from prompts. What you need is real app footage, polished. Different category.

**The stack:**

- **Screen Studio** (Mac only, $89 one-time, no subscription). Records your screen and produces motion-designed video with auto-zoom on clicks and smooth cursor — zero editing skill required. Industry standard for SaaS founder demos as of May 2026.
- **ElevenLabs** (free tier sufficient for one video). Natural AI voiceover. Record mic-muted, write the script after, generate the voice, drop it on the video.
- **Total time to first demo:** 2–3 hours including script. Faster after.

If you're not on Mac (you are), the cross-platform alternative is **Tella** (subscription). Avoid Loom for launch surfaces — too informal.

---

## The 75-second structure

This is the current working ceiling for Product Hunt launch videos. Going longer loses the viewer before the value lands. Cite: "For a Product Hunt launch, 75 seconds is the working ceiling."

The structure below assumes the viewer has zero context. The bracketed feature names match what's shipped per `BUILD_HISTORY.md` so the demo shows real product, not staged screens.

| Time | Section | What's on screen |
|------|---------|------------------|
| 0:00–0:08 | The setup | Open landing page, name the problem in one line ("700 games. Closed Steam without playing again.") |
| 0:08–0:18 | Import | Click "Import My Library," show platform options (Steam / Xbox / PlayStation / Playnite CSV), pick Steam, watch the progress bar complete |
| 0:18–0:28 | The PostImportSummary moment | Show the breakdown card: *"Your actual backlog is 155 games, not 200. 12 already beaten, 5 ready to jump back into."* This is the reframe and it lands silently if you give it 6 seconds. |
| 0:28–0:48 | The pick flow + "Why This Game?" | Choose mood (`Curious`), choose time (`1–2 hours`), hit Pick. Show the result card. Hover or click to surface the "Why This Game?" chips — `metacritic 88`, `1–2 hr fit`, `mood match: curious`. **This is the magic moment. Hold for 8 seconds. The reasoning is what separates IF from random pickers.** |
| 0:48–0:60 | One reroll OR Jump Back In | Either: "If it's not right, roll again" — demonstrate, show one more card. OR: switch to a started-but-stalled game in the library, expand it, show the Jump Back In cheat sheet (progress bar, genre-aware tips). Pick whichever you can demonstrate cleanly. |
| 0:60–0:70 | The payoff | Show the share card after a "clear" status change. One sentence over it: "Finish something, the app roasts you warmly. Stop halfway, it counts that too." |
| 0:70–0:75 | The closer | "Free. No account. inventoryfull.gg" — text overlay on the URL |

Target 75 seconds. Write to 90. Cut. If you can't trim to 75 by the final pass, drop the reroll/Jump Back In segment and keep the PostImportSummary moment — that's the most defensible feature against the "is this just a random picker" reflex.

---

## Production sequence

This is the workflow with the lowest total time and highest visual polish.

### 1. Write the script as a bullet outline first

Not the voiceover. The bullets of what you'll click, in what order, and the one-sentence value of each screen. This is the highest-leverage move in product demo recording. Going in unscripted is what makes demos feel amateur.

Example bullet:

```
- Land on inventoryfull.gg → "I have 700 games and never play any of them."
- Click Import My Library → "Pick your platform."
- Choose Steam → import runs, progress bar
- PostImportSummary appears: "155 games, not 200. 12 already beaten."
  → "Most of what felt like overwhelm was completion bias."
- Mood: Curious. Time: 1-2 hours. Hit Pick.
- Pick fires → "A Short Hike. 90 minutes. Why this fits."
- Hover/click "Why This Game?" chips: metacritic 88, mood match, time fit
  → "Every pick comes with the actual reasoning."
- Click into a started-but-stalled game → expand → Jump Back In cheat sheet
  → "And for the games you almost forgot — the cheat sheet gets you back in."
- Show clear modal animation → "Free. No account. inventoryfull.gg"
```

### 2. Record the screen in Screen Studio

Mic muted. Don't try to narrate. Don't try to be perfect.

Screen Studio's auto-zoom and smooth cursor will make a single decent take look motion-designed. If you fumble a click, just re-record that segment — Screen Studio's editor lets you cut and splice cleanly.

**Pro settings:**
- Resolution: 4K capture (you can downscale; you can't upscale)
- Mouse cursor: highlighted, with click rings
- Auto-zoom: on
- Background: pick one from the Screen Studio library that matches your brand (the punchy gradient ones work)
- Webcam: off for the PH version (you can record a separate "founder talking head" cut for HN/social later)

### 3. Write the voiceover script to match the timing

After you have the recording, watch it back and write narration that fits the timing of the visual. Roughly 150 words per minute is the spoken pace. For 75 seconds, that's ~190 words. Cut anything that doesn't serve the visual.

Voice tone for your brand: warm, direct, slightly dry. Match the Bluesky post voice from the launch bible ("my steam library has 737 games in it and i played mass effect again"). Don't go documentary-narrator on it.

### 4. Generate the voice in ElevenLabs

Pick a voice that's close to your speaking voice if you want to ghost-narrate (the listener doesn't need to know it's AI). Or use a clearly different voice if you want to keep the AI thing transparent.

Recommended voice profiles in ElevenLabs as of May 2026: "Adam" (warm masculine), "Brian" (slightly dry), "Daniel" (clean explainer). Generate the full 75-second script in one pass. Re-generate any line that has a weird emphasis — they fix easily.

### 5. Drop the voice over the video in Screen Studio

Screen Studio supports audio import. Layer the voiceover. Adjust timing — sometimes the audio runs 2–3 seconds longer than the visual, slow the visual playback by 5% to compensate, or trim the script.

### 6. Export

For PH: 1080p MP4, under 100MB.
For HN: a smaller version (720p) is fine since HN doesn't really host video — link to YouTube or Vimeo.
For landing page: 1080p, ideally under 8MB. Embed as a looping autoplay above the fold if you want, or as a click-to-play below the fold.
For social: 1:1 or 9:16 versions can be cut from the same source.

---

## What NOT to do

- **Don't live-narrate.** Live narration is what makes founder demos feel amateur. Every viewer can hear the lights flicker behind your eyes when you're thinking out loud.
- **Don't add music** unless you've thought about it carefully. Most product demo music feels stocky. Either invest in real licensing or skip it.
- **Don't open with your face.** PH viewers want to see the product immediately. If you want a face cut, put it at the 0:50 mark for context.
- **Don't try to show every feature.** You're showing the magic of the product, not its surface area. One feature shown well beats five features shown briefly.
- **Don't overproduce.** Authenticity reads better than polish on HN. PH wants polish but rewards real product over AI-prettied product. Find the middle.

---

## Future videos (post-launch)

Once you have the Screen Studio workflow down, the marginal cost of future videos is low. Worth queueing:

- **15-second social cut** for Twitter/Bluesky. Just the magic moment (the pick fires).
- **30-second feature spotlight** for each major feature update.
- **60-second "behind the scenes" cut** for HN comments and the press kit — your face, the workflow you built it in, what changed week to week.
- **Founder explainer (3–5 minutes)** for sales-call-style audiences (creators, journalists) — the full product thinking. Different audience, longer format, deserves its own session.
