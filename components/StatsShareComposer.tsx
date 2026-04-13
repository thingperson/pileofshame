'use client';

import { useState, useCallback } from 'react';
import { PlayerArchetype } from '@/lib/archetypes';
import { trackShareStatsCard } from '@/lib/analytics';

interface ShareToggle {
  key: string;
  label: string;
  available: boolean;
  enabled: boolean;
}

const PILE_FLAVORS = [
  (backlog: number) => backlog > 200 ? `${backlog} games in the pile. At this point it's a lifestyle.` : `${backlog} games tracked. The pile is real.`,
  (backlog: number) => backlog > 100 ? `${backlog} unplayed games and counting. I know. I know.` : `${backlog} in the backlog. Working on it.`,
  (_: number, cleared: number) => cleared > 20 ? `${cleared} games completed. The pile is scared.` : `Making progress, one game at a time.`,
  (_: number, cleared: number) => cleared > 0 ? `${cleared} completed. Every one counts.` : `The pile trembles. It knows what's coming.`,
  (backlog: number) => `${backlog} games. Zero regrets. Okay, maybe a few.`,
  (_: number, cleared: number) => cleared > 10 ? `${cleared} down. The pile didn't stand a chance.` : `Started clearing the pile. No turning back.`,
  (backlog: number) => backlog > 50 ? `My backlog has a backlog. Here's the proof.` : `Small pile, big ambitions.`,
  () => `Future civilizations will study this library.`,
  (_: number, _c: number, hours: number) => hours > 500 ? `${Math.round(hours).toLocaleString()} hours logged. Time well spent.` : `Building something here. One game at a time.`,
  (backlog: number, cleared: number) => cleared > 0 ? `${cleared} completed, ${backlog} to go. The math is fine.` : `${backlog} games waiting. Challenge accepted.`,
  () => `I don't have a problem. I have a collection.`,
  (backlog: number) => backlog > 30 ? `${backlog} games deep. Send help. Or don't.` : `A curated pile, if you will.`,
  (_: number, cleared: number) => cleared > 5 ? `${cleared} games done. That's ${cleared} decisions made.` : `Deciding is the hardest part. I'm getting better at it.`,
  () => `Every game in here was a good idea at the time.`,
  (_: number, _c: number, hours: number) => hours > 1000 ? `${Math.round(hours).toLocaleString()} hours. Not wasted. Invested.` : `The pile is my personality at this point.`,
  (backlog: number) => `${backlog} unplayed. But I know exactly which one I'm playing tonight.`,
  () => `My library is a museum of broken promises to my future self.`,
  () => `Bought during a sale. Played during a mood. That's the system.`,
  (_: number, cleared: number) => cleared > 0 ? `Completing games like it's my job. It's not, but still.` : `The journey of a thousand games starts with finishing one.`,
  () => `I play games the way some people collect vinyl. Passionately and incompletely.`,
];

interface StatsShareComposerProps {
  stats: {
    backlogSize: number;
    gamesCleared: number;
    bailedCount: number;
    nowPlaying: number;
    totalHours: number;
    streak: number;
    totalAchievementsEarned: number;
    totalAchievements: number;
    platinumsEarned: number;
    perfectGames: number;
    totalGamerscore: number;
    hasAchievementData: boolean;
    inMotion: number;
  };
  totalGames: number;
  explorationPct: number;
  currentArchetype: PlayerArchetype;
  unplayedValue: number;
  playedValue: number;
  backlogHours: number | null;
  calculated: boolean;
  showToast: (msg: string) => void;
}

export default function StatsShareComposer({
  stats,
  totalGames,
  explorationPct,
  currentArchetype,
  unplayedValue,
  playedValue,
  backlogHours,
  calculated,
  showToast,
}: StatsShareComposerProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Toggle states
  const [showValue, setShowValue] = useState(calculated && unplayedValue > 0);
  const [showArchetype, setShowArchetype] = useState(true);
  const [showTrophies, setShowTrophies] = useState(stats.hasAchievementData);
  const [showHours, setShowHours] = useState(stats.totalHours > 0);
  const [showDisplayName, setShowDisplayName] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const pickFlavor = useCallback(() => {
    const fn = PILE_FLAVORS[Math.floor(Math.random() * PILE_FLAVORS.length)];
    return fn(stats.backlogSize, stats.gamesCleared, stats.totalHours);
  }, [stats.backlogSize, stats.gamesCleared, stats.totalHours]);

  const [flavorText, setFlavorText] = useState(() => pickFlavor());

  // Invalidate the share URL when any card content changes
  const invalidateUrl = useCallback(() => {
    if (shareUrl) setShareUrl(null);
  }, [shareUrl]);

  const handleRerollFlavor = useCallback(() => {
    let next = flavorText;
    let attempts = 0;
    while (next === flavorText && attempts < 10) {
      next = pickFlavor();
      attempts++;
    }
    setFlavorText(next);
    invalidateUrl();
  }, [flavorText, pickFlavor, invalidateUrl]);

  const handleToggle = (key: string) => {
    invalidateUrl();
    switch (key) {
      case 'archetype': setShowArchetype(v => !v); break;
      case 'value': setShowValue(v => !v); break;
      case 'trophies': setShowTrophies(v => !v); break;
      case 'hours': setShowHours(v => !v); break;
      case 'displayName': setShowDisplayName(v => !v); break;
    }
  };

  const toggles: ShareToggle[] = [
    { key: 'archetype', label: currentArchetype?.title || 'Player Archetype', available: !!currentArchetype, enabled: showArchetype },
    { key: 'value', label: `Library worth ~$${unplayedValue.toLocaleString()}`, available: calculated && unplayedValue > 0, enabled: showValue },
    { key: 'trophies', label: `${stats.totalAchievementsEarned.toLocaleString()} trophies earned`, available: stats.hasAchievementData, enabled: showTrophies },
    { key: 'hours', label: `${Math.round(stats.totalHours).toLocaleString()}h logged`, available: stats.totalHours > 0, enabled: showHours },
    { key: 'displayName', label: 'Show my name', available: true, enabled: showDisplayName },
  ];

  const handleCreateCard = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/share-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gamesCleared: stats.gamesCleared,
          gamesInMotion: stats.inMotion,
          backlogSize: stats.backlogSize,
          totalGames,
          streak: stats.streak,
          hoursLogged: stats.totalHours,
          explorationPct,
          linesDrawn: stats.bailedCount,
          archetypeName: currentArchetype ? `${currentArchetype.icon} ${currentArchetype.title}` : null,
          archetypeDescriptor: currentArchetype?.description || null,
          unplayedValue: unplayedValue || null,
          playedValue: playedValue || null,
          backlogHours: backlogHours || null,
          trophiesEarned: stats.totalAchievementsEarned || null,
          trophiesTotal: stats.totalAchievements || null,
          platinums: stats.platinumsEarned || null,
          perfectGames: stats.perfectGames || null,
          gamerscore: stats.totalGamerscore || null,
          showValue,
          showArchetype,
          showTrophies,
          showHours,
          showDisplayName,
          displayName: showDisplayName ? displayName : null,
          flavorText,
        }),
      });
      const data = await res.json();
      if (data.url) {
        setShareUrl(data.url);
        trackShareStatsCard('card_created');
      }
    } catch {
      showToast('Could not create stats card. Try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      trackShareStatsCard('copy_link');
      showToast('Link copied! Paste it anywhere and it unfurls.');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); trackShareStatsCard('composer_opened'); }}
        className="w-full py-2.5 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{
          backgroundColor: 'rgba(167, 139, 250, 0.08)',
          border: '1px solid rgba(167, 139, 250, 0.2)',
          color: '#a78bfa',
        }}
      >
        🔗 Share as card
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-3.5 space-y-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid rgba(167, 139, 250, 0.2)',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-faint font-[family-name:var(--font-mono)]">
          Pick what to include. Creates a link that unfurls with a card.
        </p>
        <button
          onClick={() => setOpen(false)}
          className="text-text-dim hover:text-text-muted text-xs"
          aria-label="Close composer"
        >
          ✕
        </button>
      </div>

      {/* Flavor text preview + reroll */}
      <div
        className="rounded-lg p-2.5 flex items-start gap-2"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="text-sm text-text-muted italic leading-relaxed flex-1">
          {flavorText}
        </span>
        <button
          onClick={handleRerollFlavor}
          className="shrink-0 text-xs px-2 py-1 rounded-md transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            color: '#a78bfa',
          }}
          aria-label="Reroll tagline"
          title="Try a different tagline"
        >
          🎲
        </button>
      </div>

      {/* Toggle checkboxes */}
      <div className="space-y-1.5">
        {toggles.filter(t => t.available).map((t) => (
          <label
            key={t.key}
            className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.03]"
          >
            <input
              type="checkbox"
              checked={t.enabled}
              onChange={() => handleToggle(t.key)}
              className="accent-[#a78bfa] w-3.5 h-3.5"
            />
            <span className="text-xs text-text-muted font-[family-name:var(--font-mono)]">{t.label}</span>
          </label>
        ))}
      </div>

      {/* Display name input */}
      {showDisplayName && (
        <input
          type="text"
          value={displayName}
          onChange={(e) => { setDisplayName(e.target.value.slice(0, 50)); invalidateUrl(); }}
          placeholder="Your name or tag"
          className="w-full px-3 py-2 rounded-lg text-sm text-text-primary font-[family-name:var(--font-mono)] placeholder:text-text-faint"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            outline: 'none',
          }}
        />
      )}

      {/* Create / share buttons */}
      {!shareUrl ? (
        <button
          onClick={handleCreateCard}
          disabled={creating}
          className="w-full py-2.5 rounded-lg text-sm font-semibold font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            color: 'white',
          }}
        >
          {creating ? 'Creating...' : '🔗 Create share link'}
        </button>
      ) : (
        <div className="space-y-2">
          {/* URL display + copy */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all hover:scale-[1.005] active:scale-[0.995]"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <span className="text-xs text-text-muted font-[family-name:var(--font-mono)] truncate flex-1">
              {shareUrl}
            </span>
            <span className="text-xs font-semibold shrink-0" style={{ color: '#22c55e' }}>
              📋 Copy
            </span>
          </button>

          {/* Platform share row */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                trackShareStatsCard('twitter');
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(flavorText)}&url=${encodeURIComponent(shareUrl)}`,
                  '_blank', 'width=550,height=420',
                );
              }}
              className="flex-1 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01]"
              style={{ backgroundColor: 'rgba(29, 161, 242, 0.1)', border: '1px solid rgba(29, 161, 242, 0.2)', color: '#1da1f2' }}
            >
              𝕏 Post
            </button>
            <button
              onClick={() => {
                trackShareStatsCard('reddit');
                window.open(
                  `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(flavorText)}`,
                  '_blank',
                );
              }}
              className="flex-1 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01]"
              style={{ backgroundColor: 'rgba(255, 69, 0, 0.1)', border: '1px solid rgba(255, 69, 0, 0.2)', color: '#ff4500' }}
            >
              📮 Reddit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
