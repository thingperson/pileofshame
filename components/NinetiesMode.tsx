'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';

// Visitor counter — persists in localStorage
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

// Cursor sparkle trail
function CursorTrail() {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const nextId = useRef(0);
  const lastTime = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    if (now - lastTime.current < 50) return; // throttle
    lastTime.current = now;

    const emojis = ['✨', '⭐', '💫', '🌟', '✦'];
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
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute text-sm"
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

// Marquee banner
function MarqueeBanner() {
  return (
    <div className="nineties-marquee">
      <span>
        🔥🔥🔥 WELCOME TO PILE OF SHAME — THE #1 GAMING BACKLOG MANAGER ON THE WORLD WIDE WEB 🔥🔥🔥
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

// Under construction banner
function UnderConstruction() {
  return (
    <div className="under-construction">
      🚧 THIS PAGE IS UNDER CONSTRUCTION — COME BACK SOON!!! 🚧
    </div>
  );
}

// Webring footer
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

// Visitor counter display
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

// Netscape badge
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
        Made with 💖 on a Pentium II
      </div>
    </div>
  );
}

// Guestbook (localStorage-based for now)
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
      // Seed with some fun defaults
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

// Rainbow HR divider
function RainbowHR() {
  return <div className="nineties-hr" style={{ height: '4px', background: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000)' }} />;
}

// Main 90s wrapper — renders all the 90s chrome around the app
export default function NinetiesMode({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.settings.theme);
  const is90s = theme === '90s';

  useEffect(() => {
    if (is90s) {
      document.body.classList.add('theme-90s');
    } else {
      document.body.classList.remove('theme-90s');
    }
    return () => document.body.classList.remove('theme-90s');
  }, [is90s]);

  if (!is90s) return <>{children}</>;

  return (
    <>
      <CursorTrail />
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
