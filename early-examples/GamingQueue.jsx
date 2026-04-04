import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "brady-game-queue-v2";

const SEED_DATA = [{"n":"Inscryption","s":"Steam","h":1.2,"i":true,"t":"wind-down","c":"Your Queue","v":["narrative","atmospheric","philosophical"],"p":1,"no":"Resume. Card game that eats itself. You started this — it gets much weirder.","st":"in-progress"},{"n":"Spiritfarer: Farewell Edition","s":"Steam","h":1.2,"i":false,"t":"wind-down","c":"Your Queue","v":["cozy","narrative","atmospheric"],"p":2,"no":"Resume. Emotional gut-punch disguised as cozy management. Perfect wind-down.","st":"in-progress"},{"n":"Pentiment","s":"PlayStation","h":1.2,"i":false,"t":"wind-down","c":"Your Queue","v":["narrative","atmospheric","philosophical"],"p":3,"no":"Fresh look. Medieval murder mystery with real theological weight. Made for you.","st":"backlog"},{"n":"Neva","s":"PlayStation","h":1.0,"i":false,"t":"wind-down","c":"Your Queue","v":["cozy","atmospheric"],"p":4,"no":"Quick play. Gorgeous wordless narrative about companionship and loss.","st":"backlog"},{"n":"DAVE THE DIVER","s":"PlayStation","h":91.4,"i":false,"t":"wind-down","c":"Your Queue","v":["cozy","mindless"],"p":5,"no":"Finish. 91hrs in — you clearly love it. Close it out.","st":"in-progress"},{"n":"Outer Wilds","s":"Epic","h":12.4,"i":false,"t":"deep-cut","c":"Your Queue","v":["narrative","atmospheric","philosophical"],"p":6,"no":"Second attempt, slower pace. The greatest exploration game ever made. Trust the loop.","st":"backlog"},{"n":"Cyberpunk 2077","s":"Steam","h":45.5,"i":true,"t":"deep-cut","c":"Your Queue","v":["narrative","atmospheric","challenge"],"p":7,"no":"Fresh start on PC. 2.0 overhaul made it what it should've been.","st":"backlog"},{"n":"Persona 5 Royal","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","atmospheric","challenge"],"p":1,"no":"94/94. 100+ hrs but every one earned. Style, story, systems — all peak.","st":"backlog"},{"n":"Hollow Knight","s":"Steam","h":2.9,"i":true,"t":"deep-cut","c":"Sleeping On","v":["challenge","atmospheric"],"p":2,"no":"2.9hrs in. Push past the opening. One of the best games ever made.","st":"in-progress"},{"n":"God of War Ragnarök","s":"PlayStation","h":19.2,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","challenge"],"p":3,"no":"You put 160hrs into GoW. This is the payoff.","st":"backlog"},{"n":"Bloodborne","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Sleeping On","v":["challenge","atmospheric","philosophical"],"p":4,"no":"0 hrs. You platinumed Elden Ring. This is FROM's masterpiece.","st":"backlog"},{"n":"Sekiro: Shadows Die Twice","s":"Steam","h":3.8,"i":false,"t":"deep-cut","c":"Sleeping On","v":["challenge"],"p":5,"no":"0 hrs. Pure skill mastery. The tightest FROM combat.","st":"backlog"},{"n":"The Last of Us Part II Remastered","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","atmospheric"],"p":6,"no":"You played 21hrs of the original. The remaster deserves the full run.","st":"backlog"},{"n":"Disco Elysium","s":"Steam","h":27.0,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","philosophical"],"p":7,"no":"One of the greatest RPGs ever written. Your brain will love this.","st":"backlog"},{"n":"NieR:Automata","s":"Steam","h":2.5,"i":true,"t":"deep-cut","c":"Sleeping On","v":["narrative","atmospheric","philosophical","challenge"],"p":8,"no":"2.5hrs. Needs 3 playthroughs to reveal itself. Existential philosophy as gameplay.","st":"in-progress"},{"n":"Hades II","s":"Steam","h":0.4,"i":true,"t":"wind-down","c":"Sleeping On","v":["challenge","mindless"],"p":9,"no":"0.4hrs. The original got 50+ combined hrs from you. Early access but already great.","st":"backlog"},{"n":"Return of the Obra Dinn","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Sleeping On","v":["narrative","philosophical"],"p":10,"no":"0.2hrs. Pure deductive logic puzzle. A masterpiece of design.","st":"backlog"},{"n":"Celeste","s":"Steam","h":0.5,"i":true,"t":"wind-down","c":"Sleeping On","v":["challenge","narrative"],"p":11,"no":"0.5hrs. Precision platforming with genuine emotional depth.","st":"backlog"},{"n":"Undertale","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Sleeping On","v":["narrative","philosophical"],"p":12,"no":"0.1hrs. Subverts everything. You'll think about it for weeks.","st":"backlog"},{"n":"Kentucky Route Zero","s":"Steam","h":1.1,"i":true,"t":"wind-down","c":"Sleeping On","v":["narrative","atmospheric","philosophical"],"p":13,"no":"1.1hrs. Magical realist road trip. Southern Gothic meets Borges.","st":"in-progress"},{"n":"Alan Wake 2","s":"PlayStation","h":0.1,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","atmospheric"],"p":14,"no":"0.1hrs. Remedy at their peak. Meta-narrative done right.","st":"backlog"},{"n":"Metaphor: ReFantazio - Prologue Demo","s":"PlayStation","h":0.2,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","challenge"],"p":15,"no":"1.9hrs. From the Persona team. 94 critic score. Fantasy political philosophy RPG.","st":"in-progress"},{"n":"Everything","s":"Steam","h":0.4,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["philosophical","cozy","atmospheric"],"p":1,"no":"Alan Watts narrates as you become every object in the universe. Literally made for you.","st":"backlog"},{"n":"The Witness","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["philosophical","challenge"],"p":2,"no":"Jonathan Blow's meditation on perception. 0.2hrs. Deserves your full attention.","st":"backlog"},{"n":"The Talos Principle 2","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Philosopher's Shelf","v":["philosophical","challenge"],"p":3,"no":"Philosophy puzzler about consciousness, free will, and what it means to be alive.","st":"backlog"},{"n":"What Remains of Edith Finch","s":"Steam","h":0.6,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":4,"no":"2hrs total. One of the most moving games ever. Perfect single-session wind-down.","st":"backlog"},{"n":"INSIDE","s":"PlayStation","h":1.5,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["atmospheric","philosophical"],"p":5,"no":"3hrs. Wordless dystopian platformer. The ending will haunt you.","st":"backlog"},{"n":"ABZÛ","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["cozy","atmospheric"],"p":6,"no":"Ocean meditation. 2hrs. Journey but underwater.","st":"backlog"},{"n":"Journey","s":"PlayStation","h":1.9,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["cozy","atmospheric","philosophical"],"p":7,"no":"If you haven't played this, stop everything. 2hrs of transcendence.","st":"backlog"},{"n":"To the Moon","s":"Steam","h":0.0,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":8,"no":"4hrs. Will make you cry about memory, love, and regret.","st":"backlog"},{"n":"Brothers - A Tale of Two Sons","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":9,"no":"3hrs. Uses the controller itself as a storytelling device.","st":"backlog"},{"n":"GRIS","s":"Steam","h":7.0,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["cozy","atmospheric"],"p":10,"no":"2hrs. Wordless platformer about grief. Watercolor gorgeous.","st":"backlog"},{"n":"Papers, Please","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","philosophical"],"p":11,"no":"Bureaucracy as moral philosophy. You'll feel it.","st":"backlog"},{"n":"Firewatch","s":"Steam","h":5.6,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":12,"no":"5.6hrs already. If you didn't finish, the ending is worth it.","st":"in-progress"},{"n":"Tacoma","s":"Steam","h":0.6,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":13,"no":"From Gone Home devs. 3hrs. Space station mystery about labor and AI.","st":"backlog"},{"n":"Subsurface Circular","s":"Steam","h":0.6,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","philosophical"],"p":14,"no":"2hrs. Robot detective story about consciousness. On the nose for you.","st":"backlog"},{"n":"It Takes Two","s":"PlayStation","h":2.4,"i":false,"t":"deep-cut","c":"Family Night","v":["cozy","challenge"],"p":1,"no":"GOTY winner. Mandatory co-op with Rafa. Inventive in every chapter.","st":"backlog"},{"n":"Overcooked! 2","s":"Epic","h":0.0,"i":false,"t":"wind-down","c":"Family Night","v":["mindless","cozy"],"p":2,"no":"Chaotic kitchen co-op. Antonio-ready when he's a bit older.","st":"backlog"},{"n":"Castle Crashers","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Family Night","v":["mindless"],"p":3,"no":"Cartoon brawler. Perfect couch co-op.","st":"backlog"},{"n":"Lovers in a Dangerous Spacetime","s":"Steam","h":0.5,"i":true,"t":"wind-down","c":"Family Night","v":["cozy"],"p":4,"no":"Co-op spaceship management. Great with Rafa.","st":"backlog"},{"n":"Sackboy: A Big Adventure","s":"PlayStation","h":0.0,"i":false,"t":"wind-down","c":"Family Night","v":["cozy"],"p":5,"no":"Co-op platformer. Antonio territory.","st":"backlog"},{"n":"Bluey: The Videogame","s":"PlayStation","h":1.4,"i":false,"t":"wind-down","c":"Family Night","v":["cozy"],"p":6,"no":"Antonio. Obviously.","st":"backlog"},{"n":"Untitled Goose Game","s":"PlayStation","h":1.2,"i":false,"t":"wind-down","c":"Family Night","v":["mindless","cozy"],"p":7,"no":"Honk. Antonio will lose his mind.","st":"backlog"},{"n":"LEGO Star Wars: The Skywalker Saga","s":"PlayStation","h":6.1,"i":false,"t":"deep-cut","c":"Family Night","v":["mindless","cozy"],"p":8,"no":"When Antonio is ready. Co-op LEGO games are the move.","st":"backlog"},{"n":"Slay the Spire","s":"Steam","h":967.7,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge","mindless"],"p":1,"no":"968hrs. Your most-played single player. Always there.","st":"completed"},{"n":"Slay the Spire 2","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge","mindless"],"p":2,"no":"0.1hrs. Early access. Your next thousand hours.","st":"backlog"},{"n":"Stardew Valley","s":"Steam","h":504.7,"i":true,"t":"wind-down","c":"Comfort Food","v":["cozy"],"p":3,"no":"505hrs. Home base. Return anytime.","st":"completed"},{"n":"Deep Rock Galactic","s":"Steam","h":97.1,"i":true,"t":"wind-down","c":"Comfort Food","v":["mindless","challenge"],"p":4,"no":"97hrs. Rock and stone. Perfect session game.","st":"completed"},{"n":"Rocket League","s":"Steam","h":1874.2,"i":true,"t":"wind-down","c":"Comfort Food","v":["mindless","challenge"],"p":5,"no":"1874hrs. Muscle memory never dies.","st":"completed"},{"n":"Tetris Effect","s":"PlayStation","h":114.5,"i":false,"t":"wind-down","c":"Comfort Food","v":["cozy","atmospheric"],"p":6,"no":"114hrs. Synesthetic perfection. Ultimate wind-down.","st":"completed"},{"n":"Vampire Survivors","s":"Steam","h":0.0,"i":true,"t":"wind-down","c":"Comfort Food","v":["mindless"],"p":7,"no":"0hrs but this is pure dopamine. 30min sessions. Perfect.","st":"backlog"},{"n":"Hades II","s":"Steam","h":0.4,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge","narrative"],"p":8,"no":"50+ hrs combined. Always a good run.","st":"completed"},{"n":"Darkest Dungeon II","s":"Steam","h":0.0,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge"],"p":9,"no":"33hrs. Stress management as gameplay. Your kind of pain.","st":"completed"},{"n":"FTL: Faster Than Light","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge"],"p":10,"no":"0.1hrs. 30min runs. Roguelike perfection. Criminally undertouched.","st":"backlog"},{"n":"Into the Breach","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge"],"p":11,"no":"0.2hrs. From FTL devs. Perfect puzzle-tactics in 30min.","st":"backlog"},{"n":"Dead Cells","s":"Steam","h":1.1,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge"],"p":12,"no":"1.1hrs. Roguelike metroidvania. Perfect wind-down action.","st":"backlog"},{"n":"Loop Hero","s":"Steam","h":0.0,"i":true,"t":"wind-down","c":"Comfort Food","v":["cozy","challenge"],"p":13,"no":"0hrs. Idle-adjacent roguelike. Weird and wonderful.","st":"backlog"},{"n":"Clair Obscur: Expedition 33","s":"PlayStation","h":126.9,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric","challenge"],"p":1,"no":"127hrs already?! You're clearly loving this. Finish strong.","st":"in-progress"},{"n":"SUPERHOT: MIND CONTROL DELETE","s":"Steam","h":0.0,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric"],"p":2,"no":"52hrs. SCP meets David Lynch. If you didn't finish the DLC, do it.","st":"in-progress"},{"n":"Prey","s":"Steam","h":0.2,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric","philosophical"],"p":3,"no":"Immersive sim about identity and consciousness. Criminally underplayed.","st":"backlog"},{"n":"Deus Ex: Human Revolution","s":"Steam","h":0.9,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric","philosophical"],"p":4,"no":"0.9hrs. Transhumanism, conspiracy, choice. Your exact frequency.","st":"backlog"},{"n":"Subnautica: Below Zero","s":"Steam","h":1.1,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["atmospheric","cozy"],"p":5,"no":"0.7hrs. Underwater survival that becomes genuinely awe-inspiring.","st":"backlog"},{"n":"Frostpunk","s":"Steam","h":0.4,"i":true,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","philosophical"],"p":6,"no":"0.4hrs. Ethical survival city builder. Every choice costs something.","st":"backlog"},{"n":"Death's Door","s":"PlayStation","h":1.1,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric"],"p":7,"no":"Tight isometric action. Zelda meets Dark Souls lite.","st":"backlog"},{"n":"Cocoon","s":"PlayStation","h":0.0,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["atmospheric","philosophical"],"p":8,"no":"From Limbo/Inside designer. Worlds inside worlds. Pure design.","st":"backlog"},{"n":"Tunic","s":"PlayStation","h":0.1,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric","philosophical"],"p":9,"no":"Zelda-like with a meta mystery. Unravels beautifully.","st":"backlog"},{"n":"Sea of Stars","s":"PlayStation","h":0.6,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","cozy"],"p":10,"no":"Chrono Trigger successor. Gorgeous JRPG.","st":"backlog"},{"n":"Katana ZERO","s":"Steam","h":0.0,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["narrative","challenge"],"p":11,"no":"Neon-drenched time-manipulation action. Tight sessions.","st":"backlog"},{"n":"Rain World","s":"PlayStation","h":0.3,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric"],"p":12,"no":"Brutally beautiful ecosystem sim. Not for everyone but deeply your vibe.","st":"backlog"},{"n":"Kena: Bridge of Spirits","s":"PlayStation","h":0.8,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric","cozy"],"p":13,"no":"Pixar-beautiful action adventure. Surprisingly challenging.","st":"backlog"},{"n":"DREDGE","s":"PlayStation","h":18.3,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["atmospheric","cozy"],"p":14,"no":"18hrs on PS. Lovecraftian fishing. If you didn't finish, worth it.","st":"in-progress"},{"n":"Stray","s":"PlayStation","h":2.3,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["atmospheric","cozy"],"p":15,"no":"You are a cat in a cyberpunk city. 5hrs. Perfect.","st":"backlog"},{"n":"Returnal Original Soundtrack","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric"],"p":16,"no":"Roguelike shooter with cosmic horror. Punishing but rewarding.","st":"backlog"},{"n":"Lies of P","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric"],"p":17,"no":"Soulslike Pinocchio. After your FROM marathon, this'll hit right.","st":"backlog"},{"n":"Hi-Fi RUSH","s":"PlayStation","h":2.8,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["mindless","atmospheric"],"p":18,"no":"Rhythm-action brawler. Pure joy. Perfect session game.","st":"backlog"},{"n":"Sable","s":"Epic","h":0.0,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["atmospheric","cozy","philosophical"],"p":19,"no":"Open world exploration about finding your place. Moebius art style.","st":"backlog"}];

const CATEGORIES = ["All","Your Queue","Sleeping On","Philosopher's Shelf","Family Night","Comfort Food","Hidden Gem Deep Cuts"];
const VIBES = ["cozy","narrative","atmospheric","challenge","mindless","philosophical"];
const TIME_TIERS = ["wind-down","deep-cut"];
const STATUS_CYCLE = ["backlog","in-progress","completed","dropped"];

const STATUS_META = {
  "backlog":     { label: "Backlog",     color: "#4a4a5a", dot: "#6b6b80" },
  "in-progress": { label: "Playing",     color: "#1a3a2a", dot: "#3ddc84" },
  "completed":   { label: "Completed",   color: "#1a2a3a", dot: "#5b9bd5" },
  "dropped":     { label: "Dropped",     color: "#3a1a1a", dot: "#c0392b" },
};

const SOURCE_META = {
  Steam: { color: "#66c0f4", icon: "♨" },
  PlayStation: { color: "#0070d1", icon: "⬡" },
  Epic: { color: "#2a2a2a", icon: "◈" },
};

const VIBE_COLORS = {
  cozy: "#d4a574",
  narrative: "#9b7fd4",
  atmospheric: "#5ba4a4",
  challenge: "#d47f5b",
  mindless: "#7fa87f",
  philosophical: "#c9a96e",
};

const CAT_ICONS = {
  "Your Queue": "▶",
  "Sleeping On": "◉",
  "Philosopher's Shelf": "⬟",
  "Family Night": "⬡",
  "Comfort Food": "◈",
  "Hidden Gem Deep Cuts": "◆",
};

function parseGames(raw) {
  return raw.map((g, idx) => ({
    id: g.n + "_" + idx,
    name: g.n, source: g.s, hours: g.h,
    installed: g.i, timeTier: g.t,
    category: g.c, vibes: g.v,
    priority: g.p, notes: g.no, status: g.st,
  }));
}

const GAMES_INIT = parseGames(SEED_DATA);

export default function GamingQueue() {
  const [games, setGames] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeVibes, setActiveVibes] = useState([]);
  const [activeTier, setActiveTier] = useState(null);
  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [showDropped, setShowDropped] = useState(false);
  const [decideResult, setDecideResult] = useState(null);
  const [decideMode, setDecideMode] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [saveTs, setSaveTs] = useState(null);
  const decideRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setGames(parsed);
        } else {
          setGames(GAMES_INIT);
          await window.storage.set(STORAGE_KEY, JSON.stringify(GAMES_INIT));
        }
      } catch {
        setGames(GAMES_INIT);
      }
      setLoaded(true);
    }
    load();
  }, []);

  const persist = useCallback(async (updated) => {
    setGames(updated);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(updated));
      setSaveTs(new Date().toLocaleTimeString());
    } catch {}
  }, []);

  const cycleStatus = (id) => {
    const updated = games.map(g => {
      if (g.id !== id) return g;
      const idx = STATUS_CYCLE.indexOf(g.status);
      return { ...g, status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] };
    });
    persist(updated);
  };

  const toggleVibe = (v) => setActiveVibes(prev =>
    prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
  );

  const filtered = games.filter(g => {
    if (!showCompleted && g.status === "completed") return false;
    if (!showDropped && g.status === "dropped") return false;
    if (activeCategory !== "All" && g.category !== activeCategory) return false;
    if (activeVibes.length > 0 && !activeVibes.every(v => g.vibes.includes(v))) return false;
    if (activeTier && g.timeTier !== activeTier) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const sOrder = { "in-progress": 0, "backlog": 1, "completed": 2, "dropped": 3 };
    if (sOrder[a.status] !== sOrder[b.status]) return sOrder[a.status] - sOrder[b.status];
    return a.priority - b.priority;
  });

  const decide = (mode) => {
    const pool = games.filter(g => {
      if (g.status === "completed" || g.status === "dropped") return false;
      if (mode === "quick") return g.timeTier === "wind-down";
      if (mode === "deep") return g.timeTier === "deep-cut";
      return true;
    });
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setDecideResult(pick);
    setDecideMode(mode);
    setTimeout(() => decideRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const byCat = (cat) => games.filter(g => g.category === cat && g.status !== "completed" && g.status !== "dropped").length;

  if (!loaded) return (
    <div style={{ background: "#080810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3d3d5c", letterSpacing: "0.2em", fontSize: 13 }}>LOADING QUEUE...</div>
    </div>
  );

  return (
    <div style={{
      background: "#080810",
      minHeight: "100vh",
      fontFamily: "'Outfit', sans-serif",
      color: "#e8e8f0",
      paddingBottom: 80,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: #0d0d1a; }
        ::-webkit-scrollbar-thumb { background: #2a2a40; border-radius: 2px; }
        .cat-tab { cursor: pointer; padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; transition: all 0.15s; white-space: nowrap; border: 1px solid transparent; font-family: 'JetBrains Mono', monospace; }
        .cat-tab:hover { background: #1a1a2e; }
        .cat-tab.active { background: #1e1e38; border-color: #4a4a80; color: #b0b0ff; }
        .vibe-pill { cursor: pointer; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; transition: all 0.15s; border: 1px solid transparent; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
        .vibe-pill:hover { opacity: 0.85; }
        .game-card { background: #0f0f1e; border: 1px solid #1a1a30; border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; }
        .game-card:hover { border-color: #2a2a50; background: #121224; }
        .game-card.expanded { border-color: #3a3a70; background: #111128; }
        .status-badge { cursor: pointer; padding: 3px 9px; border-radius: 4px; font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; user-select: none; }
        .status-badge:hover { filter: brightness(1.3); }
        .decide-btn { cursor: pointer; padding: 10px 20px; border-radius: 8px; border: 1px solid; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.2s; }
        .decide-btn:hover { transform: translateY(-1px); }
        input[type="text"] { background: #0d0d1a; border: 1px solid #1e1e35; border-radius: 8px; padding: 9px 14px; color: #e8e8f0; font-family: 'JetBrains Mono', monospace; font-size: 12px; outline: none; transition: border-color 0.15s; width: 100%; }
        input[type="text"]:focus { border-color: #3a3a70; }
        input[type="text"]::placeholder { color: #3a3a5a; }
        .tier-btn { cursor: pointer; padding: 5px 12px; border-radius: 6px; font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 600; letter-spacing: 0.06em; border: 1px solid transparent; transition: all 0.15s; }
        .toggle-btn { cursor: pointer; padding: 5px 11px; border-radius: 6px; font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 500; letter-spacing: 0.04em; border: 1px solid #1e1e35; transition: all 0.15s; background: transparent; color: #5a5a7a; }
        .toggle-btn.on { background: #1a1a35; border-color: #3a3a60; color: #8080c0; }
        .toggle-btn:hover { border-color: #3a3a60; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 28px 0", borderBottom: "1px solid #0f0f1e", paddingBottom: 20, background: "#080810", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3d3d5c", letterSpacing: "0.3em", marginBottom: 5, textTransform: "uppercase" }}>Brady's</div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1, color: "#f0f0ff" }}>
              GAMING QUEUE
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3d3d5c", marginBottom: 4 }}>
              {filtered.length} games shown · {games.filter(g => g.status === "in-progress").length} active
            </div>
            {saveTs && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2a2a4a" }}>saved {saveTs}</div>}
          </div>
        </div>

        {/* Search + toggles */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <input type="text" placeholder="search games..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 220 }} />
          <button className={`toggle-btn ${showCompleted ? "on" : ""}`} onClick={() => setShowCompleted(x => !x)}>✓ done</button>
          <button className={`toggle-btn ${showDropped ? "on" : ""}`} onClick={() => setShowDropped(x => !x)}>✕ dropped</button>
          <button className={`tier-btn ${activeTier === "wind-down" ? "on" : ""}`}
            style={{ background: activeTier === "wind-down" ? "#1a2a1a" : "transparent", color: activeTier === "wind-down" ? "#6dba6d" : "#4a4a6a", borderColor: activeTier === "wind-down" ? "#2a4a2a" : "#1e1e35" }}
            onClick={() => setActiveTier(p => p === "wind-down" ? null : "wind-down")}>⏱ Wind-Down</button>
          <button className={`tier-btn ${activeTier === "deep-cut" ? "on" : ""}`}
            style={{ background: activeTier === "deep-cut" ? "#2a1a2a" : "transparent", color: activeTier === "deep-cut" ? "#b06db0" : "#4a4a6a", borderColor: activeTier === "deep-cut" ? "#4a2a4a" : "#1e1e35" }}
            onClick={() => setActiveTier(p => p === "deep-cut" ? null : "deep-cut")}>⬡ Deep Cut</button>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
              style={{ color: activeCategory === cat ? "#b0b0ff" : "#5a5a7a" }}
              onClick={() => setActiveCategory(cat)}>
              {cat !== "All" && CAT_ICONS[cat] ? `${CAT_ICONS[cat]} ` : ""}{cat === "All" ? "All" : cat}
              {cat !== "All" && <span style={{ marginLeft: 6, color: "#3d3d5c", fontSize: 10 }}>{byCat(cat)}</span>}
            </button>
          ))}
        </div>

        {/* Vibe filters */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {VIBES.map(v => {
            const active = activeVibes.includes(v);
            return (
              <span key={v} className="vibe-pill"
                style={{
                  background: active ? VIBE_COLORS[v] + "28" : "transparent",
                  borderColor: active ? VIBE_COLORS[v] + "60" : "#1e1e35",
                  color: active ? VIBE_COLORS[v] : "#3d3d5c",
                }}
                onClick={() => toggleVibe(v)}>{v}</span>
            );
          })}
          {activeVibes.length > 0 && (
            <span className="vibe-pill" style={{ borderColor: "#2a2a40", color: "#4a4a6a" }}
              onClick={() => setActiveVibes([])}>✕ clear</span>
          )}
        </div>
      </div>

      {/* Decide For Me */}
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #0f0f1e", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3d3d5c", letterSpacing: "0.15em", textTransform: "uppercase", marginRight: 4 }}>Decide for me →</span>
        <button className="decide-btn" style={{ borderColor: "#2a4a2a", color: "#6dba6d", background: "#0d1a0d" }} onClick={() => decide("quick")}>⏱ Quick Session</button>
        <button className="decide-btn" style={{ borderColor: "#2a1a4a", color: "#9b7fd4", background: "#0d0d1a" }} onClick={() => decide("deep")}>⬡ Deep Cut</button>
        <button className="decide-btn" style={{ borderColor: "#2a2a40", color: "#9090c0", background: "#0d0d18" }} onClick={() => decide("any")}>◈ Anything</button>
        {decideResult && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6a6a9a", marginLeft: 8 }}>
            → <span style={{ color: "#c0c0ff", fontWeight: 700 }}>{decideResult.name}</span>
            <span style={{ color: "#3d3d5c", marginLeft: 8 }}>{decideResult.timeTier === "wind-down" ? "⏱" : "⬡"} {decideResult.category}</span>
          </span>
        )}
      </div>
      <div ref={decideRef} />

      {/* Games Grid */}
      <div style={{ padding: "20px 28px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#2a2a40" }}>
            NO GAMES MATCH THESE FILTERS
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
            {filtered.map(game => {
              const sm = STATUS_META[game.status];
              const src = SOURCE_META[game.source] || {};
              const isExpanded = expandedId === game.id;
              return (
                <div key={game.id} className={`game-card ${isExpanded ? "expanded" : ""}`}
                  onClick={() => setExpandedId(isExpanded ? null : game.id)}>
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: game.status === "completed" ? "#5a5a7a" : "#e8e8ff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {game.name}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: src.color || "#6a6a8a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          {game.source}
                        </span>
                        {game.hours > 0 && (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3d3d5c" }}>
                            {game.hours.toFixed(0)}h
                          </span>
                        )}
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: game.timeTier === "wind-down" ? "#4a7a4a" : "#6a4a8a" }}>
                          {game.timeTier === "wind-down" ? "⏱" : "⬡"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span className="status-badge"
                        style={{ background: sm.color, color: "#ccc" }}
                        onClick={e => { e.stopPropagation(); cycleStatus(game.id); }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: sm.dot, marginRight: 5, verticalAlign: "middle" }} />
                        {sm.label}
                      </span>
                    </div>
                  </div>

                  {/* Vibes */}
                  <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                    {game.vibes.map(v => (
                      <span key={v} style={{
                        padding: "2px 7px", borderRadius: 20, fontSize: 9,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
                        textTransform: "uppercase", background: VIBE_COLORS[v] + "18",
                        color: VIBE_COLORS[v] + "bb", border: `1px solid ${VIBE_COLORS[v]}28`,
                      }}>{v}</span>
                    ))}
                  </div>

                  {/* Expanded notes */}
                  {isExpanded && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a1a30" }}>
                      <div style={{ fontSize: 12, color: "#8080a0", lineHeight: 1.6, fontStyle: "italic" }}>
                        {game.notes}
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2a2a4a" }}>
                          CAT: <span style={{ color: "#4a4a7a" }}>{game.category}</span>
                        </span>
                        {game.installed && (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2a4a2a" }}>✓ installed</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#060610ee", backdropFilter: "blur(12px)", borderTop: "1px solid #0f0f1e", padding: "10px 28px", display: "flex", gap: 24, alignItems: "center" }}>
        {Object.entries(STATUS_META).map(([s, meta]) => {
          const count = games.filter(g => g.status === s).length;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3d3d5c" }}>
                {meta.label} <span style={{ color: "#6a6a8a" }}>{count}</span>
              </span>
            </div>
          );
        })}
        <div style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#2a2a40" }}>
          {games.length} total
        </div>
      </div>
    </div>
  );
}
