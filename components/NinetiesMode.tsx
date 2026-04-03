'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';

// ============================
// 90s MODE COMPONENTS
// ============================

function useVisitorCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const key = 'pileofshame-visitor-count';
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    const newCount = current + 1;
    localStorage.setItem(key, String(newCount));
    setCount(newCount);
  }, []);
  return count;
}

function CursorTrail({ emojis, className }: { emojis: string[]; className?: string }) {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const nextId = useRef(0);
  const lastTime = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    if (now - lastTime.current < 50) return;
    lastTime.current = now;

    const id = nextId.current++;
    const sparkle = {
      id,
      x: e.clientX + (Math.random() - 0.5) * 20,
      y: e.clientY + (Math.random() - 0.5) * 20,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    };

    setSparkles((prev) => [...prev.slice(-12), sparkle]);

    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 600);
  }, [emojis]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className={`absolute text-sm ${className || ''}`}
          style={{
            left: s.x,
            top: s.y,
            animation: 'sparkle-fade 600ms ease-out forwards',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
}

function MarqueeBanner() {
  return (
    <div className="nineties-marquee">
      <span>
        🔥🔥🔥 WELCOME TO INVENTORY FULL — THE #1 GAMING BACKLOG MANAGER ON THE WORLD WIDE WEB 🔥🔥🔥
        &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        ⚠️ THIS SITE IS UNDER CONSTRUCTION ⚠️
        &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        🎮 OVER 9000 GAMES TRACKED 🎮
        &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        📧 SIGN MY GUESTBOOK 📧
        &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
        🏗️ BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 AT 800x600 🏗️
        &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
      </span>
    </div>
  );
}

function UnderConstruction() {
  return (
    <div className="under-construction">
      🚧 THIS PAGE IS UNDER CONSTRUCTION — COME BACK SOON!!! 🚧
    </div>
  );
}

function WebringFooter() {
  return (
    <div className="webring-bar">
      <span style={{ color: '#808080' }}>🕸️</span>{' '}
      <a href="https://backloggd.com" target="_blank" rel="noopener noreferrer">← Previous</a>
      <span style={{ color: '#ffffff' }}>
        | <span className="rainbow-text">Indie Gaming Tools Webring</span> |
      </span>
      <a href="https://howlongtobeat.com" target="_blank" rel="noopener noreferrer">Next →</a>
    </div>
  );
}

function VisitorCounter() {
  const count = useVisitorCount();
  return (
    <div className="text-center py-3" style={{ background: '#000080' }}>
      <p style={{ color: '#ffff00', fontSize: '11px', fontFamily: '"Comic Sans MS", cursive', marginBottom: '4px' }}>
        You are visitor number:
      </p>
      <span className="visitor-counter">
        {String(count).padStart(6, '0')}
      </span>
    </div>
  );
}

function NetscapeBadge() {
  return (
    <div className="text-center py-2" style={{ background: '#000080' }}>
      <div
        style={{
          display: 'inline-block',
          border: '2px outset #c0c0c0',
          background: '#c0c0c0',
          padding: '4px 12px',
          fontSize: '10px',
          color: '#000000',
          fontFamily: '"Comic Sans MS", cursive',
        }}
      >
        🌐 Best viewed in <strong>Netscape Navigator 4.0</strong> at <strong>800×600</strong>
      </div>
      <br />
      <div
        style={{
          display: 'inline-block',
          border: '2px outset #c0c0c0',
          background: '#c0c0c0',
          padding: '4px 12px',
          fontSize: '10px',
          color: '#000000',
          fontFamily: '"Comic Sans MS", cursive',
          marginTop: '4px',
        }}
      >
        Built with FrontPage Express on a Pentium MMX 233
      </div>
    </div>
  );
}

interface GuestbookEntry {
  name: string;
  message: string;
  date: string;
}

function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pileofshame-guestbook');
    if (saved) {
      try { setEntries(JSON.parse(saved)); } catch { /* ignore */ }
    } else {
      const defaults: GuestbookEntry[] = [
        { name: 'x_DarkLink_x', message: 'cool site!!! check out mine too!!', date: '1999-03-14' },
        { name: 'GameMaster2000', message: 'finally a place to track my games. bookmarked!!!', date: '1999-05-22' },
        { name: '~*SephirothFan*~', message: 'ur webring is awesome. added u to my links page', date: '1999-08-07' },
      ];
      setEntries(defaults);
      localStorage.setItem('pileofshame-guestbook', JSON.stringify(defaults));
    }
  }, []);

  const handleSubmit = () => {
    if (!name.trim() || !message.trim()) return;
    const entry: GuestbookEntry = {
      name: name.trim(),
      message: message.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [entry, ...entries].slice(0, 20);
    setEntries(updated);
    localStorage.setItem('pileofshame-guestbook', JSON.stringify(updated));
    setName('');
    setMessage('');
    setShowForm(false);
  };

  return (
    <div style={{ background: '#000080', padding: '12px 16px' }}>
      <div
        style={{
          background: '#c0c0c0',
          border: '3px outset #ffffff',
          padding: '12px',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        <h3
          style={{
            fontFamily: '"Papyrus", fantasy',
            fontSize: '18px',
            color: '#000080',
            textAlign: 'center',
            marginBottom: '8px',
            textShadow: 'none',
          }}
        >
          📖 Sign My Guestbook!!! 📖
        </h3>

        <div
          style={{
            border: '2px inset #808080',
            background: '#ffffff',
            maxHeight: '150px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {entries.map((e, i) => (
            <div key={i} className="guestbook-entry">
              <span className="gb-name">{e.name}</span>{' '}
              <span className="gb-date">({e.date})</span>
              <br />
              {e.message}
            </div>
          ))}
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'block',
              margin: '8px auto 0',
              padding: '4px 16px',
              fontFamily: '"Comic Sans MS", cursive',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ✏️ Sign the Guestbook
          </button>
        ) : (
          <div style={{ marginTop: '8px' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (e.g. ~*CoolGamer99*~)"
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '12px',
                marginBottom: '4px',
                boxSizing: 'border-box',
              }}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message!!!"
              rows={2}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '12px',
                marginBottom: '4px',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
              <button
                onClick={handleSubmit}
                style={{ padding: '3px 12px', fontSize: '11px', cursor: 'pointer' }}
              >
                Submit
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: '3px 12px', fontSize: '11px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RainbowHR() {
  return <div className="nineties-hr" style={{ height: '4px', background: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000)' }} />;
}

// ============================
// 80s SYNTHWAVE COMPONENTS
// ============================

function SynthwaveBanner() {
  return (
    <div className="synthwave-banner">
      <div className="synthwave-banner-text">
        I N V E N T O R Y &nbsp; F U L L
      </div>
      <div className="synthwave-banner-sub">
        ▸▸ INSERT COIN TO CONTINUE ▸▸
      </div>
    </div>
  );
}

function ScanLines() {
  return <div className="scanlines" />;
}

function VHSTracker() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="vhs-tracker">
      <span className="vhs-rec">● REC</span>
      <span className="vhs-time">{time}</span>
      <span className="vhs-sp">SP</span>
    </div>
  );
}

function SynthwaveFooter() {
  return (
    <div className="synthwave-footer">
      <div className="synthwave-footer-grid" />
      <div className="synthwave-footer-text">
        🌅 SUNSET DRIVE • INVENTORY FULL™ • EST. 2024 • TURBO EDITION
      </div>
    </div>
  );
}

// ============================
// FUTURE MODE COMPONENTS
// ============================

function FutureBanner() {
  return (
    <div className="future-banner">
      <div className="future-banner-inner">
        <span className="future-glyph">◈</span>
        <span className="future-banner-text">INVENTORY_FULL</span>
        <span className="future-banner-version">v4.2.1</span>
        <span className="future-glyph">◈</span>
      </div>
      <div className="future-status-bar">
        <span>SYS.OK</span>
        <span>BACKLOG.CRITICAL</span>
        <span>SHAME.LEVEL: ELEVATED</span>
      </div>
    </div>
  );
}

function HoloParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      size: 1 + Math.random() * 3,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]" style={{ opacity: 0.4 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="future-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function FutureFooter() {
  return (
    <div className="future-footer">
      <div className="future-footer-line" />
      <div className="future-footer-text">
        <span>◇ NEURAL.LINK: ACTIVE</span>
        <span>◇ BACKLOG.AI: MONITORING</span>
        <span>◇ SHAME.INDEX: CALCULATING...</span>
      </div>
    </div>
  );
}

// ============================
// DINO MODE COMPONENTS
// ============================

function DinoBanner() {
  return (
    <div className="dino-banner">
      <div className="dino-banner-text">
        <span className="dino-walk">🦕</span>
        INVENTORY FULL
        <span className="dino-walk-reverse">🦖</span>
      </div>
      <div className="dino-banner-sub">
        RAWR means &ldquo;play your backlog&rdquo; in dinosaur
      </div>
    </div>
  );
}

function DinoFooter() {
  const footprints = ['🦶', '🦶', '🦶', '🦶', '🦶'];
  return (
    <div className="dino-footer">
      <div className="dino-footprints">
        {footprints.map((f, i) => (
          <span key={i} className="dino-footprint" style={{ animationDelay: `${i * 0.3}s` }}>
            {f}
          </span>
        ))}
      </div>
      <div className="dino-footer-text">
        🌋 Backlog extinction event in progress 🌋
      </div>
    </div>
  );
}

function DinoFact() {
  const facts = [
    'Did you know? A T-Rex could clear 47 games in a single sitting. Short arms, big heart.',
    'Fun fact: Velociraptors were known to hoard games they never played. Sound familiar?',
    'The Stegosaurus had a brain the size of a walnut. Still finished more games than you.',
    'Pterodactyls had excellent taste in indie games. Mostly platformers.',
    'The Brontosaurus backlog was 200 million years long. Yours is catching up.',
    'Triceratops used their three horns to open three games at once. The original multitasker.',
  ];
  const [fact] = useState(() => facts[Math.floor(Math.random() * facts.length)]);

  return (
    <div className="dino-fact">
      🦴 {fact}
    </div>
  );
}

// ============================
// MAIN THEME WRAPPER
// ============================

const THEME_CLASSES = ['theme-90s', 'theme-80s', 'theme-future', 'theme-light', 'theme-dino', 'theme-weird', 'theme-ultra', 'theme-void'];

export default function NinetiesMode({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    // Remove all theme classes
    THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
    // Add current theme class
    const cls = `theme-${theme}`;
    if (THEME_CLASSES.includes(cls)) {
      document.body.classList.add(cls);
    }

    return () => {
      THEME_CLASSES.forEach((c) => document.body.classList.remove(c));
    };
  }, [theme]);

  if (theme === '90s') {
    return (
      <>
        <CursorTrail emojis={['✨', '⭐', '💫', '🌟', '✦']} />
        <MarqueeBanner />
        <UnderConstruction />
        <RainbowHR />
        {children}
        <RainbowHR />
        <Guestbook />
        <VisitorCounter />
        <NetscapeBadge />
        <WebringFooter />
      </>
    );
  }

  if (theme === '80s') {
    return (
      <>
        <ScanLines />
        <VHSTracker />
        <CursorTrail emojis={['▲', '◆', '★', '▶', '●']} className="synthwave-trail" />
        <SynthwaveBanner />
        {children}
        <SynthwaveFooter />
      </>
    );
  }

  if (theme === 'future') {
    return (
      <>
        <HoloParticles />
        <FutureBanner />
        {children}
        <FutureFooter />
      </>
    );
  }

  if (theme === 'dino') {
    return (
      <>
        <CursorTrail emojis={['🦕', '🦖', '🌿', '🦴', '🥚']} />
        <DinoBanner />
        {children}
        <DinoFact />
        <DinoFooter />
      </>
    );
  }

  // dark and light — no chrome, just CSS variables
  return <>{children}</>;
}
