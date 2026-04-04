import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const STORAGE_KEY = "brady-game-queue-v2";

const SEED_DATA = [{"n":"Inscryption","s":"Steam","h":1.2,"i":true,"t":"wind-down","c":"Your Queue","v":["narrative","atmospheric","philosophical"],"p":1,"no":"Resume. Card game that eats itself. You started this — it gets much weirder.","st":"in-progress"},{"n":"Spiritfarer: Farewell Edition","s":"Steam","h":1.2,"i":false,"t":"wind-down","c":"Your Queue","v":["cozy","narrative","atmospheric"],"p":2,"no":"Resume. Emotional gut-punch disguised as cozy management. Perfect wind-down.","st":"in-progress"},{"n":"Pentiment","s":"PlayStation","h":1.2,"i":false,"t":"wind-down","c":"Your Queue","v":["narrative","atmospheric","philosophical"],"p":3,"no":"Fresh look. Medieval murder mystery with real theological weight. Made for you.","st":"backlog"},{"n":"Neva","s":"PlayStation","h":1.0,"i":false,"t":"wind-down","c":"Your Queue","v":["cozy","atmospheric"],"p":4,"no":"Quick play. Gorgeous wordless narrative about companionship and loss.","st":"backlog"},{"n":"DAVE THE DIVER","s":"PlayStation","h":91.4,"i":false,"t":"wind-down","c":"Your Queue","v":["cozy","mindless"],"p":5,"no":"Finish. 91hrs in — you clearly love it. Close it out.","st":"in-progress"},{"n":"Outer Wilds","s":"Epic","h":12.4,"i":false,"t":"deep-cut","c":"Your Queue","v":["narrative","atmospheric","philosophical"],"p":6,"no":"Second attempt, slower pace. The greatest exploration game ever made. Trust the loop.","st":"backlog"},{"n":"Cyberpunk 2077","s":"Steam","h":45.5,"i":true,"t":"deep-cut","c":"Your Queue","v":["narrative","atmospheric","challenge"],"p":7,"no":"Fresh start on PC. 2.0 overhaul made it what it should've been.","st":"backlog"},{"n":"Persona 5 Royal","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","atmospheric","challenge"],"p":1,"no":"94/94. 100+ hrs but every one earned. Style, story, systems — all peak.","st":"backlog"},{"n":"Hollow Knight","s":"Steam","h":2.9,"i":true,"t":"deep-cut","c":"Sleeping On","v":["challenge","atmospheric"],"p":2,"no":"2.9hrs in. Push past the opening. One of the best games ever made.","st":"in-progress"},{"n":"God of War Ragnarök","s":"PlayStation","h":19.2,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","challenge"],"p":3,"no":"You put 160hrs into GoW. This is the payoff.","st":"backlog"},{"n":"Bloodborne","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Sleeping On","v":["challenge","atmospheric","philosophical"],"p":4,"no":"0 hrs. You platinumed Elden Ring. This is FROM's masterpiece.","st":"backlog"},{"n":"Sekiro: Shadows Die Twice","s":"Steam","h":3.8,"i":false,"t":"deep-cut","c":"Sleeping On","v":["challenge"],"p":5,"no":"0 hrs. Pure skill mastery. The tightest FROM combat.","st":"backlog"},{"n":"The Last of Us Part II Remastered","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","atmospheric"],"p":6,"no":"You played 21hrs of the original. The remaster deserves the full run.","st":"backlog"},{"n":"Disco Elysium","s":"Steam","h":27.0,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","philosophical"],"p":7,"no":"One of the greatest RPGs ever written. Your brain will love this.","st":"backlog"},{"n":"NieR:Automata","s":"Steam","h":2.5,"i":true,"t":"deep-cut","c":"Sleeping On","v":["narrative","atmospheric","philosophical","challenge"],"p":8,"no":"2.5hrs. Needs 3 playthroughs to reveal itself. Existential philosophy as gameplay.","st":"in-progress"},{"n":"Hades II","s":"Steam","h":0.4,"i":true,"t":"wind-down","c":"Sleeping On","v":["challenge","mindless"],"p":9,"no":"0.4hrs. The original got 50+ combined hrs from you. Early access but already great.","st":"backlog"},{"n":"Return of the Obra Dinn","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Sleeping On","v":["narrative","philosophical"],"p":10,"no":"0.2hrs. Pure deductive logic puzzle. A masterpiece of design.","st":"backlog"},{"n":"Celeste","s":"Steam","h":0.5,"i":true,"t":"wind-down","c":"Sleeping On","v":["challenge","narrative"],"p":11,"no":"0.5hrs. Precision platforming with genuine emotional depth.","st":"backlog"},{"n":"Undertale","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Sleeping On","v":["narrative","philosophical"],"p":12,"no":"0.1hrs. Subverts everything. You'll think about it for weeks.","st":"backlog"},{"n":"Kentucky Route Zero","s":"Steam","h":1.1,"i":true,"t":"wind-down","c":"Sleeping On","v":["narrative","atmospheric","philosophical"],"p":13,"no":"1.1hrs. Magical realist road trip. Southern Gothic meets Borges.","st":"in-progress"},{"n":"Alan Wake 2","s":"PlayStation","h":0.1,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","atmospheric"],"p":14,"no":"0.1hrs. Remedy at their peak. Meta-narrative done right.","st":"backlog"},{"n":"Metaphor: ReFantazio - Prologue Demo","s":"PlayStation","h":0.2,"i":false,"t":"deep-cut","c":"Sleeping On","v":["narrative","challenge"],"p":15,"no":"1.9hrs. From the Persona team. 94 critic score. Fantasy political philosophy RPG.","st":"in-progress"},{"n":"Everything","s":"Steam","h":0.4,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["philosophical","cozy","atmospheric"],"p":1,"no":"Alan Watts narrates as you become every object in the universe. Literally made for you.","st":"backlog"},{"n":"The Witness","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["philosophical","challenge"],"p":2,"no":"Jonathan Blow's meditation on perception. 0.2hrs. Deserves your full attention.","st":"backlog"},{"n":"The Talos Principle 2","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Philosopher's Shelf","v":["philosophical","challenge"],"p":3,"no":"Philosophy puzzler about consciousness, free will, and what it means to be alive.","st":"backlog"},{"n":"What Remains of Edith Finch","s":"Steam","h":0.6,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":4,"no":"2hrs total. One of the most moving games ever. Perfect single-session wind-down.","st":"backlog"},{"n":"INSIDE","s":"PlayStation","h":1.5,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["atmospheric","philosophical"],"p":5,"no":"3hrs. Wordless dystopian platformer. The ending will haunt you.","st":"backlog"},{"n":"ABZÛ","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["cozy","atmospheric"],"p":6,"no":"Ocean meditation. 2hrs. Journey but underwater.","st":"backlog"},{"n":"Journey","s":"PlayStation","h":1.9,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["cozy","atmospheric","philosophical"],"p":7,"no":"If you haven't played this, stop everything. 2hrs of transcendence.","st":"backlog"},{"n":"To the Moon","s":"Steam","h":0.0,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":8,"no":"4hrs. Will make you cry about memory, love, and regret.","st":"backlog"},{"n":"Brothers - A Tale of Two Sons","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":9,"no":"3hrs. Uses the controller itself as a storytelling device.","st":"backlog"},{"n":"GRIS","s":"Steam","h":7.0,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["cozy","atmospheric"],"p":10,"no":"2hrs. Wordless platformer about grief. Watercolor gorgeous.","st":"backlog"},{"n":"Papers, Please","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","philosophical"],"p":11,"no":"Bureaucracy as moral philosophy. You'll feel it.","st":"backlog"},{"n":"Firewatch","s":"Steam","h":5.6,"i":true,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":12,"no":"5.6hrs already. If you didn't finish, the ending is worth it.","st":"in-progress"},{"n":"Tacoma","s":"Steam","h":0.6,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","atmospheric"],"p":13,"no":"From Gone Home devs. 3hrs. Space station mystery about labor and AI.","st":"backlog"},{"n":"Subsurface Circular","s":"Steam","h":0.6,"i":false,"t":"wind-down","c":"Philosopher's Shelf","v":["narrative","philosophical"],"p":14,"no":"2hrs. Robot detective story about consciousness. On the nose for you.","st":"backlog"},{"n":"It Takes Two","s":"PlayStation","h":2.4,"i":false,"t":"deep-cut","c":"Family Night","v":["cozy","challenge"],"p":1,"no":"GOTY winner. Mandatory co-op with Rafa. Inventive in every chapter.","st":"backlog"},{"n":"Overcooked! 2","s":"Epic","h":0.0,"i":false,"t":"wind-down","c":"Family Night","v":["mindless","cozy"],"p":2,"no":"Chaotic kitchen co-op. Antonio-ready when he's a bit older.","st":"backlog"},{"n":"Castle Crashers","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Family Night","v":["mindless"],"p":3,"no":"Cartoon brawler. Perfect couch co-op.","st":"backlog"},{"n":"Lovers in a Dangerous Spacetime","s":"Steam","h":0.5,"i":true,"t":"wind-down","c":"Family Night","v":["cozy"],"p":4,"no":"Co-op spaceship management. Great with Rafa.","st":"backlog"},{"n":"Sackboy: A Big Adventure","s":"PlayStation","h":0.0,"i":false,"t":"wind-down","c":"Family Night","v":["cozy"],"p":5,"no":"Co-op platformer. Antonio territory.","st":"backlog"},{"n":"Bluey: The Videogame","s":"PlayStation","h":1.4,"i":false,"t":"wind-down","c":"Family Night","v":["cozy"],"p":6,"no":"Antonio. Obviously.","st":"backlog"},{"n":"Untitled Goose Game","s":"PlayStation","h":1.2,"i":false,"t":"wind-down","c":"Family Night","v":["mindless","cozy"],"p":7,"no":"Honk. Antonio will lose his mind.","st":"backlog"},{"n":"LEGO Star Wars: The Skywalker Saga","s":"PlayStation","h":6.1,"i":false,"t":"deep-cut","c":"Family Night","v":["mindless","cozy"],"p":8,"no":"When Antonio is ready. Co-op LEGO games are the move.","st":"backlog"},{"n":"Slay the Spire","s":"Steam","h":967.7,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge","mindless"],"p":1,"no":"968hrs. Your most-played single player. Always there.","st":"completed"},{"n":"Slay the Spire 2","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge","mindless"],"p":2,"no":"0.1hrs. Early access. Your next thousand hours.","st":"backlog"},{"n":"Stardew Valley","s":"Steam","h":504.7,"i":true,"t":"wind-down","c":"Comfort Food","v":["cozy"],"p":3,"no":"505hrs. Home base. Return anytime.","st":"completed"},{"n":"Deep Rock Galactic","s":"Steam","h":97.1,"i":true,"t":"wind-down","c":"Comfort Food","v":["mindless","challenge"],"p":4,"no":"97hrs. Rock and stone. Perfect session game.","st":"completed"},{"n":"Rocket League","s":"Steam","h":1874.2,"i":true,"t":"wind-down","c":"Comfort Food","v":["mindless","challenge"],"p":5,"no":"1874hrs. Muscle memory never dies.","st":"completed"},{"n":"Tetris Effect","s":"PlayStation","h":114.5,"i":false,"t":"wind-down","c":"Comfort Food","v":["cozy","atmospheric"],"p":6,"no":"114hrs. Synesthetic perfection. Ultimate wind-down.","st":"completed"},{"n":"Vampire Survivors","s":"Steam","h":0.0,"i":true,"t":"wind-down","c":"Comfort Food","v":["mindless"],"p":7,"no":"0hrs but this is pure dopamine. 30min sessions. Perfect.","st":"backlog"},{"n":"Hades II","s":"Steam","h":0.4,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge","narrative"],"p":8,"no":"50+ hrs combined. Always a good run.","st":"completed"},{"n":"Darkest Dungeon II","s":"Steam","h":0.0,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge"],"p":9,"no":"33hrs. Stress management as gameplay. Your kind of pain.","st":"completed"},{"n":"FTL: Faster Than Light","s":"Steam","h":0.1,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge"],"p":10,"no":"0.1hrs. 30min runs. Roguelike perfection. Criminally undertouched.","st":"backlog"},{"n":"Into the Breach","s":"Steam","h":0.2,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge"],"p":11,"no":"0.2hrs. From FTL devs. Perfect puzzle-tactics in 30min.","st":"backlog"},{"n":"Dead Cells","s":"Steam","h":1.1,"i":true,"t":"wind-down","c":"Comfort Food","v":["challenge"],"p":12,"no":"1.1hrs. Roguelike metroidvania. Perfect wind-down action.","st":"backlog"},{"n":"Loop Hero","s":"Steam","h":0.0,"i":true,"t":"wind-down","c":"Comfort Food","v":["cozy","challenge"],"p":13,"no":"0hrs. Idle-adjacent roguelike. Weird and wonderful.","st":"backlog"},{"n":"Clair Obscur: Expedition 33","s":"PlayStation","h":126.9,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric","challenge"],"p":1,"no":"127hrs already?! You're clearly loving this. Finish strong.","st":"in-progress"},{"n":"SUPERHOT: MIND CONTROL DELETE","s":"Steam","h":0.0,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric"],"p":2,"no":"52hrs. SCP meets David Lynch. If you didn't finish the DLC, do it.","st":"in-progress"},{"n":"Prey","s":"Steam","h":0.2,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric","philosophical"],"p":3,"no":"Immersive sim about identity and consciousness. Criminally underplayed.","st":"backlog"},{"n":"Deus Ex: Human Revolution","s":"Steam","h":0.9,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric","philosophical"],"p":4,"no":"0.9hrs. Transhumanism, conspiracy, choice. Your exact frequency.","st":"backlog"},{"n":"Subnautica: Below Zero","s":"Steam","h":1.1,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["atmospheric","cozy"],"p":5,"no":"0.7hrs. Underwater survival that becomes genuinely awe-inspiring.","st":"backlog"},{"n":"Frostpunk","s":"Steam","h":0.4,"i":true,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","philosophical"],"p":6,"no":"0.4hrs. Ethical survival city builder. Every choice costs something.","st":"backlog"},{"n":"Death's Door","s":"PlayStation","h":1.1,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric"],"p":7,"no":"Tight isometric action. Zelda meets Dark Souls lite.","st":"backlog"},{"n":"Cocoon","s":"PlayStation","h":0.0,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["atmospheric","philosophical"],"p":8,"no":"From Limbo/Inside designer. Worlds inside worlds. Pure design.","st":"backlog"},{"n":"Tunic","s":"PlayStation","h":0.1,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric","philosophical"],"p":9,"no":"Zelda-like with a meta mystery. Unravels beautifully.","st":"backlog"},{"n":"Sea of Stars","s":"PlayStation","h":0.6,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","cozy"],"p":10,"no":"Chrono Trigger successor. Gorgeous JRPG.","st":"backlog"},{"n":"Katana ZERO","s":"Steam","h":0.0,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["narrative","challenge"],"p":11,"no":"Neon-drenched time-manipulation action. Tight sessions.","st":"backlog"},{"n":"Rain World","s":"PlayStation","h":0.3,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric"],"p":12,"no":"Brutally beautiful ecosystem sim. Not for everyone but deeply your vibe.","st":"backlog"},{"n":"Kena: Bridge of Spirits","s":"PlayStation","h":0.8,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["narrative","atmospheric","cozy"],"p":13,"no":"Pixar-beautiful action adventure. Surprisingly challenging.","st":"backlog"},{"n":"DREDGE","s":"PlayStation","h":18.3,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["atmospheric","cozy"],"p":14,"no":"18hrs on PS. Lovecraftian fishing. If you didn't finish, worth it.","st":"in-progress"},{"n":"Stray","s":"PlayStation","h":2.3,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["atmospheric","cozy"],"p":15,"no":"You are a cat in a cyberpunk city. 5hrs. Perfect.","st":"backlog"},{"n":"Returnal Original Soundtrack","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric"],"p":16,"no":"Roguelike shooter with cosmic horror. Punishing but rewarding.","st":"backlog"},{"n":"Lies of P","s":"PlayStation","h":0.0,"i":false,"t":"deep-cut","c":"Hidden Gem Deep Cuts","v":["challenge","atmospheric"],"p":17,"no":"Soulslike Pinocchio. After your FROM marathon, this'll hit right.","st":"backlog"},{"n":"Hi-Fi RUSH","s":"PlayStation","h":2.8,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["mindless","atmospheric"],"p":18,"no":"Rhythm-action brawler. Pure joy. Perfect session game.","st":"backlog"},{"n":"Sable","s":"Epic","h":0.0,"i":false,"t":"wind-down","c":"Hidden Gem Deep Cuts","v":["atmospheric","cozy","philosophical"],"p":19,"no":"Open world exploration about finding your place. Moebius art style.","st":"backlog"}];

const CATEGORIES = ["Your Queue","Sleeping On","Philosopher's Shelf","Family Night","Comfort Food","Hidden Gem Deep Cuts"];
const VIBES = ["cozy","narrative","atmospheric","challenge","mindless","philosophical"];
const TIME_TIERS = ["wind-down","deep-cut"];
const STATUSES = ["backlog","in-progress","completed","dropped"];

const STATUS_CONFIG = {
  "backlog": { label: "Backlog", color: "#64748b", bg: "#1e293b", icon: "◻" },
  "in-progress": { label: "Playing", color: "#f59e0b", bg: "#422006", icon: "▶" },
  "completed": { label: "Done", color: "#22c55e", bg: "#052e16", icon: "✓" },
  "dropped": { label: "Dropped", color: "#ef4444", bg: "#450a0a", icon: "✕" },
};

const VIBE_COLORS = {
  cozy: "#f9a8d4", narrative: "#93c5fd", atmospheric: "#a78bfa",
  challenge: "#f87171", mindless: "#fbbf24", philosophical: "#34d399",
};

const CAT_ICONS = {
  "Your Queue": "⚡", "Sleeping On": "💤", "Philosopher's Shelf": "🧠",
  "Family Night": "🎮", "Comfort Food": "🍜", "Hidden Gem Deep Cuts": "💎",
};

const SOURCE_ICONS = { Steam: "🖥", PlayStation: "🎮", Epic: "🎯" };

export default function GamingQueue() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterVibe, setFilterVibe] = useState("all");
  const [filterTime, setFilterTime] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedGame, setExpandedGame] = useState(null);
  const [toast, setToast] = useState(null);
  const [decidePick, setDecidePick] = useState(null);
  const toastTimeout = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const saveGames = useCallback(async (g) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(g)); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed) && parsed.length > 0) { setGames(parsed); setLoading(false); return; }
        }
      } catch (e) { console.log("No stored data, seeding..."); }
      setGames(SEED_DATA);
      try { await window.storage.set(STORAGE_KEY, JSON.stringify(SEED_DATA)); } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const cycleStatus = useCallback((gameName) => {
    setGames(prev => {
      const next = prev.map(g => {
        if (g.n !== gameName) return g;
        const idx = STATUSES.indexOf(g.st);
        const newSt = STATUSES[(idx + 1) % STATUSES.length];
        return { ...g, st: newSt };
      });
      saveGames(next);
      const updated = next.find(g => g.n === gameName);
      showToast(`${gameName} → ${STATUS_CONFIG[updated.st].label}`);
      return next;
    });
  }, [saveGames, showToast]);

  const filtered = useMemo(() => {
    let f = games;
    if (!showCompleted) f = f.filter(g => g.st !== "completed" && g.st !== "dropped");
    if (filterCat !== "all") f = f.filter(g => g.c === filterCat);
    if (filterVibe !== "all") f = f.filter(g => g.v.includes(filterVibe));
    if (filterTime !== "all") f = f.filter(g => g.t === filterTime);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(g => g.n.toLowerCase().includes(q) || g.no.toLowerCase().includes(q) || g.c.toLowerCase().includes(q));
    }
    return f;
  }, [games, showCompleted, filterCat, filterVibe, filterTime, search]);

  const grouped = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => { map[c] = []; });
    filtered.forEach(g => { if (map[g.c]) map[g.c].push(g); });
    Object.values(map).forEach(arr => arr.sort((a, b) => {
      const so = { "in-progress": 0, backlog: 1, completed: 2, dropped: 3 };
      if (so[a.st] !== so[b.st]) return so[a.st] - so[b.st];
      return a.p - b.p;
    }));
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const total = games.length;
    const inProgress = games.filter(g => g.st === "in-progress").length;
    const completed = games.filter(g => g.st === "completed").length;
    const backlog = games.filter(g => g.st === "backlog").length;
    const totalHrs = games.reduce((s, g) => s + g.h, 0);
    return { total, inProgress, completed, backlog, totalHrs };
  }, [games]);

  const decideForMe = useCallback((mode) => {
    let pool = games.filter(g => g.st === "backlog" || g.st === "in-progress");
    if (mode === "wind-down") pool = pool.filter(g => g.t === "wind-down");
    else if (mode === "deep-cut") pool = pool.filter(g => g.t === "deep-cut");
    else if (mode === "in-progress") pool = pool.filter(g => g.st === "in-progress");
    if (pool.length === 0) { showToast("No games match that mood!"); return; }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setDecidePick(pick);
  }, [games, showToast]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#a78bfa", fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }}>Loading queue...</div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", color: "#e2e8f0",
      fontFamily: "'Segoe UI', 'SF Pro Display', -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .game-card { transition: all 0.2s ease; cursor: pointer; }
        .game-card:hover { transform: translateY(-1px); }
        .status-btn { transition: all 0.15s ease; cursor: pointer; user-select: none; }
        .status-btn:hover { filter: brightness(1.3); transform: scale(1.05); }
        .status-btn:active { transform: scale(0.95); }
        .filter-chip { transition: all 0.15s ease; cursor: pointer; user-select: none; white-space: nowrap; }
        .filter-chip:hover { filter: brightness(1.2); }
        .vibe-tag { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 500; margin-right: 4px; margin-bottom: 3px; }
        .decide-btn { transition: all 0.2s ease; cursor: pointer; }
        .decide-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(167,139,250,0.3); }
        .decide-btn:active { transform: scale(0.97); }
        .toast-enter { animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .glow { box-shadow: 0 0 40px rgba(167,139,250,0.08); }
        input:focus { outline: none; border-color: #a78bfa !important; box-shadow: 0 0 0 2px rgba(167,139,250,0.2); }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(249,168,212,0.03) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "24px 16px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 28, color: "#f8fafc", letterSpacing: "-0.02em" }}>
              Brady's Queue
            </h1>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#64748b" }}>v2</span>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#64748b" }}>
            <span><span style={{ color: "#f59e0b" }}>{stats.inProgress}</span> playing</span>
            <span><span style={{ color: "#94a3b8" }}>{stats.backlog}</span> backlog</span>
            <span><span style={{ color: "#22c55e" }}>{stats.completed}</span> done</span>
            <span><span style={{ color: "#a78bfa" }}>{stats.total}</span> total</span>
            <span><span style={{ color: "#f9a8d4" }}>{stats.totalHrs.toLocaleString(undefined,{maximumFractionDigits:0})}</span> hrs tracked</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search games, notes, categories..."
            style={{
              width: "100%", padding: "10px 14px", background: "#111118", border: "1px solid #1e293b",
              borderRadius: 10, color: "#e2e8f0", fontSize: 14, fontFamily: "'Outfit', sans-serif",
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ padding: "6px 10px", background: "#111118", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
          </select>
          <select value={filterVibe} onChange={e => setFilterVibe(e.target.value)}
            style={{ padding: "6px 10px", background: "#111118", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <option value="all">All Vibes</option>
            {VIBES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterTime} onChange={e => setFilterTime(e.target.value)}
            style={{ padding: "6px 10px", background: "#111118", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <option value="all">All Times</option>
            <option value="wind-down">Wind-Down (30-60m)</option>
            <option value="deep-cut">Deep Cut (2+ hrs)</option>
          </select>
          <button onClick={() => setShowCompleted(p => !p)}
            className="filter-chip"
            style={{
              padding: "6px 12px", background: showCompleted ? "#052e16" : "#111118",
              border: `1px solid ${showCompleted ? "#22c55e" : "#1e293b"}`, borderRadius: 8,
              color: showCompleted ? "#22c55e" : "#64748b", fontSize: 12, fontFamily: "'Outfit', sans-serif",
            }}>
            {showCompleted ? "✓ Showing Done" : "Show Done"}
          </button>
        </div>

        {/* Decide for me */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { mode: "any", label: "🎲 Decide for me", bg: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
            { mode: "wind-down", label: "🌙 Quick session", bg: "linear-gradient(135deg, #6366f1, #818cf8)" },
            { mode: "deep-cut", label: "🔥 Deep cut", bg: "linear-gradient(135deg, #dc2626, #f87171)" },
            { mode: "in-progress", label: "▶ Continue something", bg: "linear-gradient(135deg, #d97706, #fbbf24)" },
          ].map(({ mode, label, bg }) => (
            <button key={mode} onClick={() => decideForMe(mode)} className="decide-btn"
              style={{ padding: "8px 16px", background: bg, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Decision overlay */}
        {decidePick && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20,
          }} onClick={() => setDecidePick(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: "#111118", border: "1px solid #a78bfa", borderRadius: 16, padding: 28,
              maxWidth: 400, width: "100%", textAlign: "center",
              boxShadow: "0 0 60px rgba(167,139,250,0.2)",
            }}>
              <div style={{ fontSize: 14, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Tonight you play</div>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#f8fafc", marginBottom: 8 }}>{decidePick.n}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {decidePick.v.map(v => (
                  <span key={v} className="vibe-tag" style={{ background: VIBE_COLORS[v] + "20", color: VIBE_COLORS[v] }}>{v}</span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 16 }}>{decidePick.no}</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                <span>{SOURCE_ICONS[decidePick.s]} {decidePick.s}</span>
                <span>·</span>
                <span>{decidePick.h}hrs logged</span>
                <span>·</span>
                <span>{decidePick.t === "wind-down" ? "🌙" : "🔥"} {decidePick.t}</span>
              </div>
              <button onClick={() => setDecidePick(null)} style={{
                marginTop: 20, padding: "8px 24px", background: "#a78bfa", border: "none",
                borderRadius: 8, color: "#0a0a0f", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              }}>Let's go</button>
            </div>
          </div>
        )}

        {/* Game grid by category */}
        {CATEGORIES.map(cat => {
          const catGames = grouped[cat];
          if (!catGames || catGames.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>{CAT_ICONS[cat]}</span>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: "#f8fafc" }}>{cat}</h2>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569", marginLeft: 4 }}>{catGames.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {catGames.map(g => {
                  const sc = STATUS_CONFIG[g.st];
                  const expanded = expandedGame === g.n;
                  return (
                    <div key={g.n} className="game-card glow" onClick={() => setExpandedGame(expanded ? null : g.n)}
                      style={{
                        background: "#111118", border: `1px solid ${expanded ? "#334155" : "#1a1a24"}`,
                        borderRadius: 12, padding: "12px 14px", borderLeft: `3px solid ${sc.color}`,
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button className="status-btn" onClick={e => { e.stopPropagation(); cycleStatus(g.n); }}
                          style={{
                            padding: "3px 10px", background: sc.bg, border: `1px solid ${sc.color}40`,
                            borderRadius: 6, color: sc.color, fontSize: 11, fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                          }}>
                          {sc.icon} {sc.label}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.n}</div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{g.t === "wind-down" ? "🌙" : "🔥"}</span>
                          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{SOURCE_ICONS[g.s]}</span>
                        </div>
                      </div>
                      {expanded && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e293b" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                            {g.v.map(v => (
                              <span key={v} className="vibe-tag" style={{ background: VIBE_COLORS[v] + "18", color: VIBE_COLORS[v] }}>{v}</span>
                            ))}
                          </div>
                          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 8 }}>{g.no}</p>
                          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace", flexWrap: "wrap" }}>
                            <span>{g.h} hrs</span>
                            <span>{g.s}</span>
                            <span>{g.i ? "Installed" : "Not installed"}</span>
                            <span>Priority #{g.p}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎮</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16 }}>No games match those filters</div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-enter" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1e293b", border: "1px solid #334155", borderRadius: 10,
          padding: "10px 20px", color: "#e2e8f0", fontSize: 13, fontFamily: "'Outfit', sans-serif",
          fontWeight: 500, zIndex: 1000, boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        }}>{toast}</div>
      )}
    </div>
  );
}
