# Pip — the Inventory Full bot character

*Written 2026-05-05. Spec for further generation + brand placement.*

**Pip is NOT the Inventory Full mascot.** The brand puts the user's archetype at center; Pip is a sidekick, not a hero. Pip lives around the brand — in the Discord bot, in occasional app moments, on merch — but never replaces the archetype-as-personality framing.

---

## Character bible

### Name

**Pip.** Short, low-key, self-deprecating. The character wears a crown but is named Pip. The contrast IS the joke. We let users discover the joke; we never explain it.

We never call Pip "the mascot." Pip is "the bot character" or just "Pip."

### Personality

- Earnest. Tries hard. Means well. Slightly clumsy.
- Quietly dignified. Wears the crown like he meant to put it on but doesn't lord it over anyone.
- Helpful without being pushy. Pip would never tell you to play harder. Pip nods.
- Doesn't take itself seriously, but isn't cynical either.

### Voice (when Pip "speaks" — very rarely)

Pip should almost never have lines. The brand voice is the user's friend; Pip is a wordless presence. When Pip does speak, it's short and warm:
- *"Found one for you."* (after a pick)
- *"Nice."* (after a clear)
- *"Take a break, you earned it."* (after a long session)

Never:
- LinkedIn vocab
- Hype ("LET'S GO!" / "FANTABULOUS!" / "MAKES LATER RIGHT NOW")
- Lecture
- Multi-sentence speeches

### Visual identity (locked)

Source material: ChatGPT-generated mockup from May-4. Style:
- Pixel-art (high-detail, painted-pixel — closer to the H2 archetype style than the lo-fi 32×32 sprites)
- Teal body, yellow eyes, gold crown, lightning-bolt accent, holding a globe/ball
- Friendly square head
- Cape variants: with cape (hero mode), without (default)
- Multiple color variants confirmed working: teal (canonical), yellow, dark/shadow, pink, white/ghost

Don't redraw the canonical look. Use the existing teal version as the base; new poses match.

---

## Visual variants worth generating (GPT prompt library)

For each, paste the prompt into ChatGPT/DALL-E/equivalent. Style anchor: *"Pip — small pixel-art robot character with teal body, yellow eyes, gold crown, lightning-bolt chest emblem, holding a small globe. Pixel-art high-detail style, similar to retro-modern painted-pixel art. Same character as in [reference image]. [Pose-specific description]."*

### Active / app-moment poses

1. **Pip launching a game** — Pip pressing a giant Start button, light beaming up. For the launch celebration moment.
2. **Pip presenting a game** — Pip holding out a small game cartridge or card toward the viewer, like *"this one."* For the picker reveal.
3. **Pip nodding** — Pip's head tilting in slow approval. For status changes (Up Next → Playing Now).
4. **Pip giving a thumbs up** — classic, simple. For positive reinforcement.
5. **Pip celebrating** — small confetti, Pip with arms raised. For Cleared. (Don't compete with the existing celebration UI; this is an alternative for shareables.)
6. **Pip with a "moved on" sigh** — Pip looking at a game, then setting it down gently, no judgement. For Moved On.

### Idle / atmospheric poses

7. **Pip asleep on a controller** — curled up. For end-of-session / "you can stop now" moments.
8. **Pip with a mug of coffee, reading patch notes** — cozy, late-night vibe. For loading states or quiet moments.
9. **Pip looking up at a backlog mountain** — overwhelmed but determined. For empty/full backlog states (depends on framing).
10. **Pip walking with a flashlight** — exploring a dark library. For "we're picking" loading state.

### Themed variants (for theme-aware UI)

11. **Pip wearing dino headgear** — for dino theme.
12. **Pip in 90s neon outfit** — for 90s theme.
13. **Pip in synthwave / outrun colors** — for 80s theme.
14. **Pip as a hologram** — for future theme.
15. **Pip in cozy sweater + mug** — for cozy theme.

### Merch-specific poses

16. **Pip on the front of a coffee mug** — small character, lots of negative space around. For the mug merch SKU.
17. **Pip embroidered logo style** — simplified, fewer colors, suitable for hat embroidery (~1500 stitch budget). Pip's head + crown only, super clean.
18. **Pip on a controller skin** — full-body lounging across a controller. For the giveaway-controller idea.
19. **Pip waving from inside a TV/monitor** — for poster art.
20. **Pip + game cartridge — sticker pack design** — clean isolated character, good for die-cut stickers.

### Discord / Twitter persona poses

21. **Pip as a Discord bot avatar** — clean head shot, crown visible, square crop. 256×256 / 512×512.
22. **Pip raising a hand** — for `/pick` command response.
23. **Pip handing over an envelope** — for celebration webhooks (`@user just cleared X`).

### Don't generate

- Pip as villain / angry / aggressive
- Pip in a "competitive" / esports pose (gaming chair, headset, RGB)
- Pip with a brand-loud caption ("LET'S GO!" / "FANTABULOUS")
- Pip without the crown (the crown is the joke)
- Multiple Pips in one image (Pip is a singular presence)

---

## Where Pip lives (placement plan)

### LIVE soon (when ready)

- **Discord bot avatar.** Pip's headshot, 256×256. Use prompt #21 above.
- **Sticker pack** (in merch plan): 3-sticker design featuring Pip in 3 poses (launching, nodding, with mug). Use prompts #1, #3, #8.
- **Coffee mug** (merch SKU): Pip on the front, prompt #16. Brand wordmark on opposite side.
- **Hat** (merch SKU, future): embroidered Pip head, prompt #17.

### LIVE inside the app (Easter-egg level frequency)

- Empty states: Pip occasionally appears, looking at the empty space (~10% of empty-state renders, weighted to first-time users).
- Loading states for picker: Pip walking with flashlight (prompt #10) instead of a spinner, occasionally.
- Status change toasts: Pip nod (prompt #3) appears in ~5% of toast renders.

**Frequency rule: rare enough to feel like a discovery.** If Pip shows up every interaction, he becomes a chore. The whole point is that some users will see him weeks before they realize there's a character.

### Settings opt-out

A toggle in Settings → Display:

> **Hide Pip**
> *He's small but he's around. Tick this if you'd rather not see him.*

Default: off (Pip is on by default). The toggle is a quiet acknowledgement that he exists without making a thing about it. Voice-aligned, anti-shame ("you'd rather not" — neutral framing).

### NEVER

- Pip in the wordmark
- Pip in OG card hero positions (those are reserved for archetype sprites + share moments)
- Pip on the landing page hero (archetype + "get playing." stays)
- Pip in onboarding flow (archetypes own onboarding)
- Pip-themed CTAs ("Pip says: pick now!") — Pip never speaks for the brand
- Pip in error toasts (errors are voice-driven, Pip-free)

---

## Future / phase 2

- **Custom controller giveaway** with Pip skin — prize for: first 100 supporter-tier-A tippers? Discord engagement reward? Reddit post traction milestone? Brady's call.
- **Animated Pip emotes for Discord** — small loops (nod, thumbs up, sleep). Requires gif/lottie work; defer until bot is live.
- **Pip as Twitch overlay** for streamers using the app — bottom-corner companion. Defer to later, requires actual streamer interest.
- **Pip plushie** — far future. Real merch decision, not POD. Don't think about it until tee + mug have proved out.

---

## Locked decisions

| Decision | Choice | Reason |
|---|---|---|
| Name | Pip | Short, contrast with crown, voice-aligned |
| Mascot status | NOT the IF mascot | Archetype-as-personality stays at brand center |
| Speaking | Almost never | Voice belongs to the brand; Pip is a presence |
| Default visibility | On (rare appearances) | Easter-egg discoverability |
| User opt-out | Yes, in Settings | Anti-shame, full user control |
| Crown visibility | Always | The contrast IS the joke |
| Color canonical | Teal | Match existing brand accent |

---

*Linked from [INDEX.md](INDEX.md). Update when Pip evolves.*
