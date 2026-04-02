'use client';

import { useState, useEffect } from 'react';
import { trackHelpOpen } from '@/lib/analytics';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    id: 'basics',
    title: 'The Basics',
    icon: '🎮',
    items: [
      {
        q: 'What is Inventory Full?',
        a: 'Your backlog is full. Your time doesn\'t have to be. Add your games, tell us your mood, and we\'ll find your game tonight. No more staring at your library wondering what to play.',
      },
      {
        q: 'How do I add games?',
        a: 'Two ways: click "+ Add" to manually add one, or click "Import" to pull your Steam library, Steam wishlist, Xbox collection, or a Playnite export. Imported games land in your backlog automatically.',
      },
      {
        q: 'What happens to my data?',
        a: 'Everything saves to your browser automatically. Sign in with Discord or Google to sync across devices. Your local library stays either way. We never delete it.',
      },
    ],
  },
  {
    id: 'statuses',
    title: 'Game Statuses',
    icon: '📊',
    items: [
      {
        q: '📚 Backlog',
        a: 'The default. These are games you own (or want to play) but haven\'t started yet. Your pile. The whole point of being here.',
      },
      {
        q: '🎯 Play Next',
        a: 'Your numbered queue. Games you\'ve earmarked to play soon, in order. Click a game\'s status badge to move it from Backlog → Play Next. They show up as 1. 2. 3. so you always know what\'s next.',
      },
      {
        q: '🔥 Now Playing',
        a: 'You\'re actively playing this one. These games get a special glow so they stand out. You can have multiple games here. We don\'t judge. When "What Should I Play?" picks a game and you hit "Let\'s go," it moves here automatically.',
      },
      {
        q: '✅ Played',
        a: 'Done. Finished. Credits rolled (or you decided you\'re done). No more status cycling. You can still "Play Again" or start a "New Game+" from the expanded card.',
      },
      {
        q: '🚪 Bailed',
        a: 'Not for you. Long-press any status badge to bail on a game. No shame. Life\'s too short. You can always "Give it another shot" later.',
      },
      {
        q: 'How do I change a game\'s status?',
        a: 'Click the colored status badge on any game card. It cycles forward: Backlog → Play Next → Now Playing → Played. Long-press the badge to bail. Hover to preview the next status.',
      },
    ],
  },
  {
    id: 'getplaying',
    title: 'What Should I Play?',
    icon: '🎲',
    items: [
      {
        q: 'What does "What Should I Play?" do?',
        a: 'It randomly picks a game from your backlog. Hit "Let\'s go" to commit and start playing, "Roll Again" to try another, or "Not now" to walk away. Simple.',
      },
      {
        q: 'What are the different modes?',
        a: '🎲 What Should I Play? Random from everything.\n🌙 Quick Session: picks shorter games (Quick Hit + Wind-Down).\n🔥 Deep Cut: picks longer games (Deep Cut + Marathon).\n▶ Keep Playing: only picks from games you\'re already playing, for when you can\'t decide which one to continue.',
      },
      {
        q: 'What if I keep rerolling?',
        a: 'We\'ll gently roast you at rolls 3, 5, and 7. At roll 10, you\'re forced to pick from your last three results. You\'re here to play, not spin.',
      },
    ],
  },
  {
    id: 'organizing',
    title: 'Organizing Your Pile',
    icon: '🗂️',
    items: [
      {
        q: 'What are Categories?',
        a: 'Folders for your games. Default ones: The Pile (your main backlog), Favorites, and Quick Wins. You can create your own in settings.',
      },
      {
        q: 'What are Time Tiers?',
        a: '🌙 Wind-Down = short sessions (30-60 min). Great for a quick game before bed.\n🔥 Deep Cut = long sessions (2+ hours). For when you\'re settling in for a marathon.\nEvery game gets one. Tap the tier in the expanded card to switch.',
      },
      {
        q: 'What does the ⭐ mean?',
        a: 'That game came from your Steam wishlist import. We\'ll check for deals on wishlisted games so you know when to buy.',
      },
    ],
  },
  {
    id: 'filters',
    title: 'Filtering & Finding',
    icon: '🔍',
    items: [
      {
        q: 'How does search work?',
        a: 'Type in the search bar to filter by game name or notes. All other filters (shelf, mood, session length) stack on top. They\'re AND filters, so everything narrows together.',
      },
      {
        q: 'Why can\'t I see some games?',
        a: 'Played and Bailed games are hidden by default. Toggle "Show played" or "Show bailed" in the filter bar to reveal them.',
      },
      {
        q: 'What does the platform preference do?',
        a: 'In settings, set "I play on" to PC, Mac, Console, or Any. This filters what "What Should I Play?" picks. It won\'t suggest a PlayStation game if you set Mac, for example. Doesn\'t hide games from your library, just from the randomizer.',
      },
    ],
  },
  {
    id: 'deals',
    title: 'Deals & Prices',
    icon: '💰',
    items: [
      {
        q: 'How do deal checks work?',
        a: 'Expand any game card and click "Check deals." We search IsThereAnyDeal for current prices across Steam, GOG, Humble, and more. Results are cached for 30 minutes.',
      },
      {
        q: 'Are the deal links affiliate links?',
        a: 'Some deal links include affiliate parameters from IsThereAnyDeal. If you buy through them, it helps keep the app free. We never inflate prices.',
      },
      {
        q: 'Will you try to sell me games?',
        a: 'No. We never recommend games to buy. We only show deals on games you already own or have wishlisted yourself. Our job is to help you play what you have, not add to the pile.',
      },
    ],
  },
];

export default function HelpModal({ open, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState('basics');

  useEffect(() => {
    if (open) trackHelpOpen();
  }, [open]);

  if (!open) return null;

  const section = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
          animation: 'scaleIn 400ms ease-out',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              How It Works
            </h2>
            <p className="text-xs text-text-dim mt-0.5 font-[family-name:var(--font-mono)]">
              Everything you need to know
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text-muted transition-colors text-xl leading-none px-2"
          >
            &times;
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-5 pb-3 flex gap-1.5 overflow-x-auto shrink-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'bg-accent-purple/15 text-accent-purple'
                  : 'text-text-dim hover:text-text-muted hover:bg-white/5'
              }`}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-3">
            {section.items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                <h3 className="text-sm font-semibold text-text-primary mb-1.5">
                  {item.q}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <p className="text-[10px] text-text-faint text-center font-[family-name:var(--font-mono)]">
            Still stuck? We&apos;re always improving — check back, things get better all the time.
          </p>
        </div>
      </div>
    </div>
  );
}
