'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Game, GameStatus } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, SOURCE_LABELS } from '@/lib/constants';
import { useToast } from './Toast';
import { getGameDescriptor } from '@/lib/descriptors';
import { MOOD_TAG_CONFIG, getPlaytimeRoast } from '@/lib/enrichment';
import { trackStatusChange } from '@/lib/analytics';
import { getSkipCount, resetSkipCount, isSoftIgnored } from '@/lib/skipTracking';

// ── Jump Back In Cheat Sheet ──────────────────────────────────────

function JumpBackIn({ game }: { game: Game }) {
  const [open, setOpen] = useState(false);

  // Progress estimate
  const progressPct = game.hoursPlayed && game.hltbMain
    ? Math.min(Math.round((game.hoursPlayed / game.hltbMain) * 100), 100)
    : null;

  // Genre-aware or game-specific context tips
  const genreTips = getGenreTips(game.genres || [], game.name);

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: 'rgba(245, 158, 11, 0.04)',
        borderColor: 'rgba(245, 158, 11, 0.15)',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium font-[family-name:var(--font-mono)] text-amber-300/80 hover:text-amber-300 transition-colors"
      >
        <span>🗺️ Jump Back In</span>
        <span className="text-xs opacity-60" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 animate-[fadeIn_150ms_ease-out]">
          {/* Progress estimate */}
          {progressPct !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-[family-name:var(--font-mono)]">
                <span className="text-text-dim">
                  ~{progressPct}% through ({game.hoursPlayed}h / {game.hltbMain}h)
                </span>
                {progressPct >= 75 && (
                  <span className="text-green-400">Almost there</span>
                )}
                {progressPct < 25 && progressPct > 0 && (
                  <span className="text-text-faint">Early game</span>
                )}
                {progressPct >= 25 && progressPct < 75 && (
                  <span className="text-amber-300/60">Mid-game</span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor: progressPct >= 75 ? '#22c55e' : '#f59e0b',
                  }}
                />
              </div>
            </div>
          )}

          {/* Genre tips */}
          {genreTips.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-text-faint font-[family-name:var(--font-mono)] uppercase tracking-wider">Quick reminders</p>
              {genreTips.map((tip, i) => (
                <p key={i} className="text-xs text-text-muted leading-relaxed">
                  {tip}
                </p>
              ))}
            </div>
          )}

          {/* Progress-based nudge */}
          {progressPct !== null && progressPct >= 75 && game.hltbMain && (
            <p className="text-xs text-green-400/80 font-medium font-[family-name:var(--font-mono)]">
              ~{Math.max(1, Math.round(game.hltbMain - game.hoursPlayed))}h left. One more session might finish this.
            </p>
          )}
          {progressPct !== null && progressPct >= 40 && progressPct < 75 && game.hltbMain && (
            <p className="text-xs text-amber-300/60 font-[family-name:var(--font-mono)]">
              ~{Math.round(game.hltbMain - game.hoursPlayed)}h to go. You&apos;re past the halfway mark.
            </p>
          )}

          {/* No enrichment data? */}
          {!game.description && !game.hltbMain && (!game.genres || game.genres.length === 0) && (
            <p className="text-xs text-text-faint italic">
              No game data available yet. It might still be enriching.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Game-specific return tips for popular titles ──────────────────
// Pre-seeded tips for games where generic genre advice isn't enough.
// Key: lowercase substring match against game name.
const GAME_SPECIFIC_TIPS: Record<string, string[]> = {
  'elden ring': [
    '🗺️ Open the map and look for unexplored golden tree markers.',
    '⚔️ Check your flask allocation at a Site of Grace.',
    '💀 If you\'re stuck, go explore somewhere else. Come back stronger.',
  ],
  'baldur\'s gate 3': [
    '📋 Check your quest journal - active quests are sorted by proximity.',
    '🎭 Talk to your camp companions. They react to recent events.',
    '💾 Quicksave before conversations. Choices matter here.',
  ],
  'witcher 3': [
    '📋 Check the quest log and read the objectives carefully.',
    '🗡️ Reapply your blade oils and check potion stocks.',
    '🗺️ Follow the yellow quest marker on the minimap.',
  ],
  'red dead redemption': [
    '🐴 Head to camp first. Someone there probably has a mission.',
    '🗺️ Yellow blips on the map are story missions.',
    '🎯 Do a quick hunt to warm up your aim.',
  ],
  'cyberpunk 2077': [
    '📱 Check your phone messages and journal for active gigs.',
    '🗡️ Review your cyberware and perks - you might have unspent points.',
    '🗺️ Yellow markers are main story, blue are side gigs.',
  ],
  'persona 5': [
    '📅 Check the calendar. Deadlines are real and you can\'t go back.',
    '🎭 Spend time with confidants who are close to ranking up.',
    '📋 Check Mementos requests - they expire.',
  ],
  'hollow knight': [
    '🗺️ Buy the map for the current area from Cornifer (humming sound).',
    '💎 Equip your best charm loadout at a bench.',
    '🧭 If lost, head toward areas you haven\'t filled on the map.',
  ],
  'zelda': [
    '🗺️ Open the map and look for blinking quest markers.',
    '🎒 Cook some meals before heading out. Full hearts matter.',
    '🧭 Climb something tall and scan the horizon for points of interest.',
  ],
  'dark souls': [
    '💀 You will die. That\'s fine. Learn the enemy patterns.',
    '🔥 Rest at the nearest bonfire and level up if you can.',
    '🛡️ Check your equipment load - stay under 70% for medium roll.',
  ],
  'mass effect': [
    '📋 Check the journal - main quests are marked.',
    '🎭 Talk to your squad on the ship. New dialogue after each mission.',
    '⚙️ Spend any unassigned skill points before the next mission.',
  ],
  'skyrim': [
    '📋 Check your quest log - pick the one closest to you.',
    '🎒 Sell junk at the nearest merchant. Free up carry weight.',
    '⚙️ Check if you have unspent perk points.',
  ],
  'god of war': [
    '🗺️ Check the map for undiscovered areas nearby.',
    '⚔️ Look at your skill tree - you might have upgrades waiting.',
    '📖 Atreus\'s journal has story recaps.',
  ],
  'stardew valley': [
    '📅 Check the calendar on your wall for birthdays and events.',
    '🌱 Water your crops first, then decide how to spend the day.',
    '📦 Check the Community Center bundles for what to collect.',
  ],
  'slay the spire': [
    '🃏 Start a fresh run or continue your current climb.',
    '🧠 Check your deck synergies before the next fight.',
    '💎 Review your relics. They change how you play.',
  ],
  'hades': [
    '🏛️ Talk to everyone in the House before your next run.',
    '💎 Check the contractor for permanent upgrades.',
    '⚔️ Try a weapon with a dark glow - it gives bonus Darkness.',
  ],
  'final fantasy': [
    '📋 Check active quests and any side content you missed.',
    '⚙️ Review your party setup and equipment before moving on.',
    '💰 Sell duplicate gear at the nearest shop.',
  ],
  'monster hunter': [
    '📋 Check the quest board for assigned and optional quests.',
    '🔨 Upgrade or try a different weapon at the smithy.',
    '🍖 Eat at the canteen before every hunt. Always.',
  ],
  'metroid': [
    '🗺️ Check the map for blinking doors or unexplored rooms.',
    '🔫 Test your current abilities - you might have forgotten one.',
    '🔍 Scan walls near dead ends. Breakable blocks are everywhere.',
  ],
  'dragon age': [
    '🎭 Check in with party members at camp. They have opinions.',
    '📋 Review your quest journal - the war table has new missions.',
    '⚙️ Spend any unused ability points.',
  ],
  'horizon': [
    '🏹 Restock on ammo and potions at your stash.',
    '📋 Check the quest log - main quests are gold, sides are teal.',
    '🤖 Scan machines before fighting. Weak points save you time.',
  ],
  'disco elysium': [
    '📋 Check your thought cabinet and task list.',
    '🗣️ Talk to Kim. He keeps you grounded.',
    '📖 Read your internal monologue carefully. The answer is in there.',
  ],
  'divinity': [
    '📋 Check your journal - quest entries update with new clues.',
    '💬 Talk to every NPC. Persuasion checks open new paths.',
    '⚙️ Re-examine your skill books. You might have new combos.',
  ],
  'subnautica': [
    '📻 Check your radio for new signals.',
    '🔋 Charge your equipment and restock supplies at base.',
    '🗺️ Head toward the deepest biome you haven\'t explored yet.',
  ],
};

function getGameSpecificTips(gameName: string): string[] {
  const lower = gameName.toLowerCase();
  for (const [key, tips] of Object.entries(GAME_SPECIFIC_TIPS)) {
    if (lower.includes(key)) return tips;
  }
  return [];
}

function getGenreTips(genres: string[], gameName: string): string[] {
  // Check game-specific tips first
  const specificTips = getGameSpecificTips(gameName);
  if (specificTips.length > 0) return specificTips.slice(0, 3);

  // Fall back to genre-based tips
  const tips: string[] = [];
  const g = genres.map(s => s.toLowerCase());

  if (g.some(x => x.includes('rpg') || x.includes('role-playing'))) {
    tips.push('📋 Check your quest log or journal for active objectives.');
    tips.push('🗡️ Review your equipment and skill loadout before diving in.');
  }
  if (g.some(x => x.includes('action') || x.includes('shooter'))) {
    tips.push('🎮 Spend a minute in a safe area to re-learn the controls.');
  }
  if (g.some(x => x.includes('strategy') || x.includes('simulation'))) {
    tips.push('📊 Check your resources and any pending decisions before making moves.');
  }
  if (g.some(x => x.includes('adventure') || x.includes('story'))) {
    tips.push('📖 Read your last save\'s chapter or area name to jog your memory.');
  }
  if (g.some(x => x.includes('puzzle'))) {
    tips.push('🧩 Look around the current room. The answer is usually in front of you.');
  }
  if (g.some(x => x.includes('stealth'))) {
    tips.push('👀 Quicksave before you do anything. Relearn the patrol patterns.');
  }
  if (g.some(x => x.includes('survival') || x.includes('craft'))) {
    tips.push('🔨 Check your inventory and crafting options. Repair anything broken.');
  }
  if (g.some(x => x.includes('metroidvania') || x.includes('platformer'))) {
    tips.push('🗺️ Open the map. Look for unexplored areas near your current position.');
  }
  if (g.some(x => x.includes('souls') || x.includes('roguelike') || x.includes('roguelite'))) {
    tips.push('💀 Expect to die a few times while you get back into the rhythm.');
  }
  if (g.some(x => x.includes('open world'))) {
    tips.push('🧭 Pick ONE objective. Ignore everything else until it\'s done.');
  }
  if (g.some(x => x.includes('racing'))) {
    tips.push('🏎️ Do a practice lap to remember the track before going competitive.');
  }
  if (g.some(x => x.includes('fighting'))) {
    tips.push('🥊 Hit training mode for 5 minutes. Muscle memory comes back fast.');
  }
  if (g.some(x => x.includes('visual novel'))) {
    tips.push('📖 Re-read the last few dialogue lines in the backlog to catch up.');
  }
  if (g.some(x => x.includes('turn-based'))) {
    tips.push('⚙️ Review your party composition and any pending upgrades.');
  }
  if (g.some(x => x.includes('horror'))) {
    tips.push('🔦 Check your inventory. Ammo and healing items are usually scarce.');
    tips.push('🎧 Play with headphones. Audio cues are half the experience.');
  }

  // Cap at 3 tips max
  return tips.slice(0, 3);
}

interface ProgressAction {
  label: string;
  onClick: () => void;
}

interface GameCardProps {
  game: Game;
  upNextIndex?: number; // 1-based index for Play Next games
  forceExpanded?: boolean; // Used by GameDetailModal to render expanded without click
  progressAction?: ProgressAction; // "→ Up Next" etc.
  regressAction?: ProgressAction;  // "← Backlog" etc.
  onStatusChange?: (newStatus: GameStatus) => void; // Notify parent of status changes (e.g., Replay, Un-bail)
  hideStatusLabel?: boolean; // Hide status badge label when viewing the matching tab (redundant info)
}

export default function GameCard({ game, upNextIndex, forceExpanded, progressAction, regressAction, onStatusChange, hideStatusLabel }: GameCardProps) {
  const [expanded, setExpanded] = useState(forceExpanded ?? false);
  const [ghostStatus, setGhostStatus] = useState<GameStatus | null>(null);
  const [showBailConfirm, setShowBailConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [bailing, setBailing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { cycleStatus, getNextStatus, setBailed, unBail, shelveGame, playAgain, newGamePlus, updateGame, deleteGame, showCelebration, toggleIgnore } = useStore();
  const { showToast } = useToast();
  const statusConfig = STATUS_CONFIG[game.status];
  const nextStatus = getNextStatus(game.status);

  // Status badge discoverability: show hint until user has tapped one
  const [showBadgeHint, setShowBadgeHint] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasTapped = localStorage.getItem('pos-status-tapped');
    if (!hasTapped && nextStatus) {
      setShowBadgeHint(true);
    }
  }, [nextStatus]);
  const descriptor = getGameDescriptor(game.name, game.metacritic, game.genres);

  const handleStatusClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (game.status === 'played' || game.status === 'bailed') return;

    // Mark badge as discovered
    if (showBadgeHint) {
      localStorage.setItem('pos-status-tapped', '1');
      setShowBadgeHint(false);
    }

    // Intercept the transition TO played — show celebration instead
    const next = getNextStatus(game.status);
    if (next === 'played') {
      showCelebration(game);
      return;
    }

    const newStatus = cycleStatus(game.id);
    if (newStatus) {
      trackStatusChange(game.status, newStatus);
      const cfg = STATUS_CONFIG[newStatus];
      if (newStatus === 'on-deck') {
        // Play Next celebrations
        if (!localStorage.getItem('pos-first-playnext')) {
          localStorage.setItem('pos-first-playnext', '1');
          showToast(`${game.name} → Play Next 🎯 Nice. You just committed. That's the hard part.`);
        } else {
          const playNextToasts = [
            `${game.name} just made the list. Good pick. 🎯`,
            `${game.name} → Play Next. The pile is shrinking. 🎯`,
            `Locked in: ${game.name}. No more scrolling. 🎯`,
            `${game.name} queued up. One step closer. 🎯`,
            `${game.name} earned a spot on the list. Let's go. 🎯`,
          ];
          showToast(playNextToasts[Math.floor(Math.random() * playNextToasts.length)]);
        }
      } else if (newStatus === 'playing') {
        const nowPlayingToasts = [
          `${game.name} is live. Go play. 🔥`,
          `Let's go. ${game.name} isn't going to play itself. 🔥`,
          `${game.name} → Now Playing. This is happening. 🔥`,
          `You're in. ${game.name} is loaded up. 🔥`,
        ];
        showToast(nowPlayingToasts[Math.floor(Math.random() * nowPlayingToasts.length)]);
      } else {
        showToast(`${game.name} → ${cfg.label} ${cfg.icon}`);
      }

      // Notify parent to switch tabs
      onStatusChange?.(newStatus);

      // Milestone celebrations (delayed so they don't overlap with status toast)
      setTimeout(() => {
        const allGames = useStore.getState().games;
        const cleared = allGames.filter(g => g.status === 'played').length;
        const decisions = allGames.filter(g => g.status !== 'buried').length;
        const milestoneKey = 'pos-milestone-';

        // Cleared milestones
        const clearMilestones: [number, string][] = [
          [50, `50 games cleared. You're a machine. 🏆`],
          [25, `25 games cleared. Quarter century of progress. 🏆`],
          [10, `10 games cleared. Double digits. This is real. 🏆`],
          [5, `5 games cleared. Momentum is building. 🎉`],
          [1, `First game cleared. The pile just got smaller. 🎉`],
        ];
        for (const [n, msg] of clearMilestones) {
          if (cleared === n && !localStorage.getItem(`${milestoneKey}clear-${n}`)) {
            localStorage.setItem(`${milestoneKey}clear-${n}`, '1');
            showToast(msg);
            break;
          }
        }

        // Decision milestones (any game moved out of buried)
        const decisionMilestones: [number, string][] = [
          [100, `100 decisions made. You've touched every corner of this pile. 🧠`],
          [50, `50 decisions. Half a hundred games you've taken action on. 🧠`],
          [25, `25 decisions in. The paralysis is breaking. 🧠`],
          [10, `10 decisions made. You're actually doing this. 🧠`],
        ];
        for (const [n, msg] of decisionMilestones) {
          if (decisions === n && !localStorage.getItem(`${milestoneKey}decision-${n}`)) {
            localStorage.setItem(`${milestoneKey}decision-${n}`, '1');
            showToast(msg);
            break;
          }
        }
      }, 2000);
    }
  }, [game.id, game.name, game.status, cycleStatus, getNextStatus, showToast, showBadgeHint, onStatusChange]);

  const handleLongPressStart = useCallback(() => {
    if (game.status === 'played') return;
    longPressTimer.current = setTimeout(() => {
      setShowBailConfirm(true);
    }, 500);
  }, [game.status]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const canBail = game.status !== 'played' && game.status !== 'bailed';

  const bailAffirmations = [
    'You drew a line. That takes guts.',
    'Knowing when to walk away is a superpower.',
    'One less thing weighing on you. Nice.',
    'Boundaries set. Pile shrunk. Progress.',
    'That decision? Already worth more than 10 more hours sunk.',
  ];

  const handleBail = useCallback(() => {
    setBailing(true);
    setShowBailConfirm(false);
    const affirmation = bailAffirmations[Math.floor(Math.random() * bailAffirmations.length)];
    // Animate out, then commit the status change
    setTimeout(() => {
      setBailed(game.id);
      showToast(`${game.name} → Done ✊ ${affirmation}`);
      setBailing(false);
    }, 300);
  }, [game.id, game.name, setBailed, showToast]);

  const handlePlayAgain = useCallback(() => {
    const { games } = useStore.getState();
    const nowPlayingCount = games.filter((g) => g.status === 'playing').length;
    if (nowPlayingCount >= 3) {
      showToast('Now Playing is capped at 3. Finish or shelve something first.');
      return;
    }
    playAgain(game.id);
    showToast(`Back for more? Let's go.`);
    onStatusChange?.('playing');
  }, [game.id, playAgain, showToast, onStatusChange]);

  const handleNewGamePlus = useCallback(() => {
    newGamePlus(game.id);
    showToast(`${game.name} → New Game+ 🎯`);
    onStatusChange?.('on-deck');
  }, [game.id, game.name, newGamePlus, showToast, onStatusChange]);

  const handleUnBail = useCallback(() => {
    unBail(game.id);
    showToast(`${game.name} → back in the backlog 📚`);
    onStatusChange?.('buried');
  }, [game.id, game.name, unBail, showToast, onStatusChange]);

  const handleShelve = useCallback(() => {
    shelveGame(game.id);
    showToast(`${game.name} → returned to The Pile 📚`);
    onStatusChange?.('buried');
  }, [game.id, game.name, shelveGame, showToast, onStatusChange]);

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/20 ${game.status === 'playing' ? 'now-playing-glow' : ''} ${bailing ? 'scale-95 opacity-0' : ''}`}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: expanded ? 'var(--color-border-active)' : 'var(--color-border-subtle)',
        borderLeftWidth: '3px',
        borderLeftColor: statusConfig.color,
      }}
    >
      {/* Compact View */}
      <div
        className={`flex items-center gap-3 px-3.5 py-3 select-none ${forceExpanded ? '' : 'cursor-pointer'}`}
        role={forceExpanded ? undefined : 'button'}
        tabIndex={forceExpanded ? undefined : 0}
        aria-expanded={forceExpanded ? undefined : expanded}
        onClick={forceExpanded ? undefined : () => setExpanded(!expanded)}
        onKeyDown={forceExpanded ? undefined : (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        {/* Status Badge */}
        <div className="relative flex items-center">
          <button
            onClick={handleStatusClick}
            onMouseEnter={() => nextStatus && setGhostStatus(nextStatus)}
            onMouseLeave={() => setGhostStatus(null)}
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            className={`
              relative flex items-center gap-1.5 px-2.5 py-2 sm:py-1.5 rounded-lg text-xs font-medium
              font-[family-name:var(--font-mono)] transition-all duration-150
              ${game.status !== 'played' && game.status !== 'bailed'
                ? 'hover:brightness-125 active:scale-95 cursor-pointer ring-1 ring-white/10 hover:ring-white/25'
                : 'cursor-default'}
              ${showBadgeHint ? 'animate-[pulse_2s_ease-in-out_3]' : ''}
            `}
            style={{
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
            }}
            aria-label={`Status: ${statusConfig.label}${nextStatus ? `. Tap to move to ${STATUS_CONFIG[nextStatus].label}` : ''}`}
            title={
              game.status === 'played'
                ? 'Played. Expand card for options'
                : game.status === 'bailed'
                ? 'You drew the line. Expand card to reconsider'
                : nextStatus
                ? `Tap to move → ${STATUS_CONFIG[nextStatus].label}`
                : undefined
            }
          >
            <span className="emoji-icon">{statusConfig.icon}</span>
            <span className="ascii-icon hidden">{statusConfig.asciiIcon}</span>
            {!hideStatusLabel && (
              <>
                <span className="sm:hidden">{statusConfig.shortLabel || statusConfig.label}</span>
                <span className="hidden sm:inline">{statusConfig.label}</span>
              </>
            )}
            {/* Arrow - makes it obvious this is tappable */}
            {nextStatus && (
              <span className="text-xs opacity-60">→</span>
            )}
          </button>
          {/* Hover hint — shows what tapping does (desktop) */}
          {ghostStatus && game.status !== 'played' && game.status !== 'bailed' && (
            <span
              className="absolute left-full ml-1.5 whitespace-nowrap flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium font-[family-name:var(--font-mono)] opacity-0 animate-[fadeIn_150ms_100ms_forwards] pointer-events-none z-10"
              style={{
                backgroundColor: STATUS_CONFIG[ghostStatus].bg,
                color: STATUS_CONFIG[ghostStatus].color,
              }}
            >
              → {STATUS_CONFIG[ghostStatus].label}
            </span>
          )}
        </div>

        {/* Game Name */}
        <span className="flex-1 min-w-0 text-[15px] sm:text-base font-semibold text-text-primary truncate">
          {upNextIndex && (
            <span className="text-accent-purple font-bold font-[family-name:var(--font-mono)] mr-1.5 text-sm">
              {upNextIndex}.
            </span>
          )}
          {game.isWishlisted && <span className="text-yellow-400 mr-1" title="Wishlisted" aria-label="Wishlisted" role="img">⭐</span>}
          {game.ignored && <span className="text-text-faint mr-1" title="Ignored from recommendations" aria-label="Ignored">🚫</span>}
          {!game.ignored && isSoftIgnored(game.id) && <span className="text-text-faint mr-1" title="Skipped 5+ times. Hidden from picker." aria-label="Soft-ignored">💤</span>}
          {game.name}
        </span>

        {/* Achievement mini */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {game.achievements && game.achievements.total > 0 && (
            <span
              className="text-[9px] font-bold font-[family-name:var(--font-mono)] px-1 py-0.5 rounded hidden sm:inline"
              title={`${game.achievements.earned}/${game.achievements.total}${game.achievements.earnedPlatinum ? ' 🏆' : ''}`}
              style={{
                backgroundColor: game.achievements.earned === game.achievements.total
                  ? 'rgba(34,197,94,0.15)' : 'rgba(167,139,250,0.12)',
                color: game.achievements.earned === game.achievements.total
                  ? '#22c55e' : '#a78bfa',
              }}
            >
              {game.achievements.earnedPlatinum ? '🏆' : `${Math.round((game.achievements.earned / game.achievements.total) * 100)}%`}
            </span>
          )}
        </div>

        {/* Expand indicator — hidden when forced open in modal */}
        {!forceExpanded && (
          <svg
            aria-hidden="true"
            className={`w-4 h-4 text-text-dim transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Bail Confirmation — inline strip */}
      {showBailConfirm && !expanded && (
        <div className="px-3.5 py-2.5 border-t flex items-center gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <span className="text-xs text-text-muted">Drawing the line?</span>
          <button
            onClick={handleBail}
            className="px-3 py-1.5 text-xs rounded-md font-medium"
            style={{ backgroundColor: STATUS_CONFIG.bailed.bg, color: STATUS_CONFIG.bailed.color }}
          >
            ✊ Done
          </button>
          <button
            onClick={() => setShowBailConfirm(false)}
            className="px-3 py-1.5 text-xs rounded-md text-text-dim hover:text-text-muted"
          >
            Maybe later
          </button>
        </div>
      )}

      {/* Progression Arrows — always visible when provided */}
      {(progressAction || regressAction) && !expanded && !showBailConfirm && (
        <div className="flex items-center gap-1.5 px-3.5 pb-2.5 -mt-0.5">
          {regressAction && (
            <button
              onClick={(e) => { e.stopPropagation(); regressAction.onClick(); }}
              className="px-3 py-2 text-xs font-medium font-[family-name:var(--font-mono)] rounded-md text-text-dim hover:text-text-muted hover:bg-white/5 transition-all"
            >
              {regressAction.label}
            </button>
          )}
          {progressAction && (
            <button
              onClick={(e) => { e.stopPropagation(); progressAction.onClick(); }}
              className="px-3 py-2 text-xs font-semibold font-[family-name:var(--font-mono)] rounded-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(167, 139, 250, 0.12)',
                color: '#a78bfa',
                border: '1px solid rgba(167, 139, 250, 0.2)',
              }}
            >
              {progressAction.label}
            </button>
          )}
        </div>
      )}

      {/* Expanded View */}
      {expanded && (
        <div className="px-3.5 pb-3.5 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          {/* Row 1: Cover + Info Grid */}
          <div className="flex gap-3 pt-3">
            {game.coverUrl && (
              <img
                src={game.coverUrl}
                alt=""
                className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg object-cover shrink-0 bg-bg-primary"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Quick stats row */}
              <div className="flex flex-wrap items-center gap-2 text-sm font-[family-name:var(--font-mono)]">
                {game.hoursPlayed > 0 && (
                  <span className="text-text-primary font-semibold">{game.hoursPlayed}h played</span>
                )}
                {game.hoursPlayed > 0 && game.hltbMain && game.hltbMain > 0 && (() => {
                  const remaining = Math.max(game.hltbMain - game.hoursPlayed, 0);
                  const pct = Math.min(Math.round((game.hoursPlayed / game.hltbMain) * 100), 100);
                  if (remaining > 0 && remaining <= 8) {
                    return (
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: pct >= 85 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: pct >= 85 ? '#4ade80' : '#fcd34d',
                        }}
                      >
                        {pct >= 85 ? '🏁' : '⏳'} ~{Math.round(remaining)}h left
                      </span>
                    );
                  }
                  return null;
                })()}
                <span className="text-text-muted">{SOURCE_LABELS[game.source]}</span>
                {game.metacritic && (
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: game.metacritic >= 75 ? 'rgba(34,197,94,0.15)' : game.metacritic >= 50 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                      color: game.metacritic >= 75 ? '#22c55e' : game.metacritic >= 50 ? '#eab308' : '#ef4444',
                    }}
                    title="Critic score via Metacritic"
                  >
                    {game.metacritic}
                  </span>
                )}
              </div>

              {/* Achievement / Trophy Progress */}
              {game.achievements && game.achievements.total > 0 && (() => {
                const pct = Math.round((game.achievements.earned / game.achievements.total) * 100);
                const isComplete = game.achievements.earned === game.achievements.total;
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${game.source === 'playstation' ? 'Trophy' : 'Achievement'} progress: ${pct}%`} style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: isComplete ? '#22c55e' : '#a78bfa',
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold font-[family-name:var(--font-mono)] shrink-0" style={{ color: isComplete ? '#22c55e' : '#a78bfa' }}>
                        {game.achievements.earned}/{game.achievements.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-dim font-[family-name:var(--font-mono)]">
                      <span>
                        {game.source === 'playstation' ? '🏆 Trophies' : '🏆 Achievements'}
                      </span>
                      {game.achievements.earnedPlatinum && (
                        <span className="text-yellow-400 font-bold">Platinum earned!</span>
                      )}
                      {game.achievements.gamerscore !== undefined && game.achievements.gamerscore > 0 && (
                        <span>{game.achievements.gamerscore}/{game.achievements.totalGamerscore} G</span>
                      )}
                      {isComplete && !game.achievements.earnedPlatinum && (
                        <span className="text-green-400 font-bold">100% complete!</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Genres */}
              {game.genres && game.genres.length > 0 && (
                <div className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                  {game.genres.slice(0, 3).join(' · ')}
                </div>
              )}

              {/* Synopsis — from RAWG */}
              {game.description && (
                <p className="text-xs text-text-muted leading-relaxed" title="Description via RAWG">
                  {game.description.length > 180
                    ? game.description.slice(0, 180).replace(/\s+\S*$/, '') + '...'
                    : game.description
                  }
                </p>
              )}

              {/* Descriptor — opinionated one-liner */}
              {descriptor && (
                <div
                  className="text-sm leading-relaxed italic"
                  style={{
                    color: descriptor.confidence === 'curated' ? '#a78bfa'
                      : descriptor.confidence === 'scored' ? 'var(--color-text-muted)'
                      : 'var(--color-text-dim)',
                  }}
                >
                  &ldquo;{descriptor.line}&rdquo;
                </div>
              )}

              {/* HLTB + Mood Tags row */}
              {(game.hltbMain || (game.moodTags && game.moodTags.length > 0)) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {game.hltbMain && (
                    <span className="text-xs font-[family-name:var(--font-mono)] text-text-dim px-1.5 py-0.5 rounded bg-bg-primary border border-border-subtle" title="Average completion time via HowLongToBeat">
                      🕐 ~{game.hltbMain}h to beat
                    </span>
                  )}
                  {game.moodTags?.map((mood) => {
                    const config = MOOD_TAG_CONFIG[mood];
                    return config ? (
                      <span
                        key={mood}
                        className="text-xs font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                          border: `1px solid ${config.color}25`,
                        }}
                      >
                        {config.icon} {config.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Jump Back In — Now Playing cheat sheet */}
              {(game.status === 'playing' || game.status === 'on-deck') && (game.description || game.hltbMain || game.genres?.length) && (
                <JumpBackIn game={game} />
              )}

              {/* Playtime insight */}
              {game.hoursPlayed > 0 && (() => {
                const insight = getPlaytimeRoast(game.name, game.hoursPlayed);
                return insight ? (
                  <p className="text-xs text-amber-300/70 italic font-[family-name:var(--font-mono)]">
                    {insight}
                  </p>
                ) : null;
              })()}

              {/* Notes — single editable field, auto-saves */}
              <div className="relative">
                <textarea
                  value={game.notes}
                  onChange={(e) => {
                    updateGame(game.id, { notes: e.target.value });
                    setNotesSaved(true);
                    setTimeout(() => setNotesSaved(false), 2000);
                  }}
                  placeholder={
                    game.status === 'playing' ? 'Where did you leave off? Controls to remember?'
                    : game.status === 'on-deck' ? 'Anything to remember before starting?'
                    : game.status === 'played' ? 'Final thoughts? Rating? Memorable moments?'
                    : game.status === 'bailed' ? 'Why\'d you stop? Worth revisiting later?'
                    : 'Notes, reminders, anything...'
                  }
                  aria-label="Game notes"
                  className="w-full text-sm bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-text-secondary placeholder-text-faint resize-none focus:outline-none focus:border-accent-purple"
                  rows={2}
                />
                {notesSaved && (
                  <span className="absolute right-2 bottom-2 text-xs text-green-400/70 font-[family-name:var(--font-mono)] animate-[fadeIn_150ms_ease-out]">
                    saved ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Launch button */}
          {game.steamAppId && (
            <div className="mt-3">
              <a
                href={`steam://run/${game.steamAppId}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'rgba(124, 58, 237, 0.15)',
                  color: '#a78bfa',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                }}
                title={`Opens in ${SOURCE_LABELS[game.source]} (or Steam Link on mobile)`}
              >
                🚀 Launch in {SOURCE_LABELS[game.source]}
              </a>
            </div>
          )}

          {/* Row 4: Status-specific actions + bail + delete */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {game.status === 'played' && (
              <>
                <button
                  onClick={handlePlayAgain}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  🔥 Replay?
                </button>
                <button
                  onClick={handleNewGamePlus}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  🎯 DLC / New Game+?
                </button>
              </>
            )}

            {(game.status === 'playing' || game.status === 'on-deck') && (
              <button
                onClick={handleShelve}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                style={{
                  backgroundColor: STATUS_CONFIG.buried.bg,
                  color: STATUS_CONFIG.buried.color,
                  border: `1px solid ${STATUS_CONFIG.buried.color}40`,
                }}
              >
                📚 Return to The Pile
              </button>
            )}

            {game.status === 'bailed' && (
              <button
                onClick={handleUnBail}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: STATUS_CONFIG.buried.bg,
                  color: STATUS_CONFIG.buried.color,
                }}
              >
                Give it another shot?
              </button>
            )}

            {/* Bail / Eject — visible button for non-played, non-bailed games */}
            {canBail && !showBailConfirm && (
              <button
                onClick={() => setShowBailConfirm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#ef4444',
                  border: '1px dashed rgba(239, 68, 68, 0.3)',
                }}
                title="Draw the line on this one"
              >
                🚪 Not for me
              </button>
            )}

            {/* Bail confirmation inline */}
            {canBail && showBailConfirm && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-muted font-[family-name:var(--font-mono)]">Drawing the line?</span>
                <button
                  onClick={handleBail}
                  className="px-2.5 py-1 text-xs font-bold rounded-md transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  ✊ Yeah, I&apos;m done
                </button>
                <button
                  onClick={() => setShowBailConfirm(false)}
                  className="px-2 py-1 text-xs text-text-dim hover:text-text-muted transition-colors"
                >
                  Maybe later
                </button>
              </div>
            )}

            {/* Don't suggest toggle */}
            <button
              onClick={() => {
                toggleIgnore(game.id);
                showToast(game.ignored
                  ? `${game.name} is back in rotation.`
                  : `${game.name} won't be suggested anymore.`
                );
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{
                backgroundColor: game.ignored ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                color: game.ignored ? '#a78bfa' : 'var(--color-text-faint)',
                border: game.ignored ? '1px solid rgba(167, 139, 250, 0.25)' : '1px solid transparent',
              }}
              title={game.ignored ? 'Include in suggestions again' : 'Won\'t show up in What Should I Play'}
            >
              {game.ignored ? '👁 Suggest again' : '🚫 Don\'t suggest'}
            </button>

            {/* Skip count reset (only visible when game has been skipped 3+ times) */}
            {(() => {
              const skipCount = getSkipCount(game.id);
              if (skipCount < 3) return null;
              return (
                <button
                  onClick={() => {
                    resetSkipCount(game.id);
                    showToast(`${game.name} skip count cleared. Fresh start.`);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.97]"
                  style={{
                    backgroundColor: 'rgba(251, 191, 36, 0.08)',
                    color: 'var(--color-text-faint)',
                    border: '1px solid transparent',
                  }}
                  title={`Skipped ${skipCount} times in the picker. ${skipCount >= 5 ? 'Currently hidden from suggestions.' : 'Showing less often in suggestions.'} Click to reset.`}
                >
                  🔄 {skipCount >= 5 ? 'Un-hide' : 'Reset'} ({skipCount} skips)
                </button>
              );
            })()}

            {/* Delete from library — pushed to the right, subtle */}
            <div className="flex-1" />
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-text-faint hover:text-red-400 transition-colors font-[family-name:var(--font-mono)]"
                title="Permanently remove this game from your library"
              >
                Delete from library
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2">
                <span className="text-xs text-text-muted font-[family-name:var(--font-mono)]">Gone forever?</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      deleteGame(game.id);
                      showToast(`${game.name} deleted. It was never here.`);
                    }}
                    className="px-2 py-1 text-xs font-medium rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 text-xs text-text-dim hover:text-text-muted transition-colors"
                  >
                    Keep it
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
