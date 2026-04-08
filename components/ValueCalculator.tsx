import { PlayerArchetype } from '@/lib/archetypes';
import { plural, shareToTwitter, shareToReddit, generateShareText, getDiscordText } from '@/lib/statsHelpers';
import { trackShareStats } from '@/lib/analytics';

interface ValueCalculatorProps {
  calculating: boolean;
  calculated: boolean;
  enriching: boolean;
  countedUnplayed: number;
  countedPlayed: number;
  countedBacklogHours: number;
  backlogHours: number | null;
  playedValue: number;
  priceConfidence: { known: number; total: number };
  hltbConfidence: { known: number; total: number };
  confidencePct: number;
  hltbPct: number;
  handleCalculate: () => void;
  handleRecalculate: () => void;
  stats: {
    backlogSize: number;
    gamesCleared: number;
    bailedCount: number;
    nowPlaying: number;
    totalHours: number;
    streak: number;
    oldest: { name: string; days: number } | null;
    totalAchievementsEarned: number;
    totalAchievements: number;
    platinumsEarned: number;
    perfectGames: number;
    totalGamerscore: number;
    hasAchievementData: boolean;
  };
  explorationPct: number;
  currentArchetype: PlayerArchetype;
  showToast: (msg: string) => void;
}

export default function ValueCalculator({
  calculating,
  calculated,
  enriching,
  countedUnplayed,
  countedPlayed,
  countedBacklogHours,
  backlogHours,
  playedValue,
  priceConfidence,
  hltbConfidence,
  confidencePct,
  hltbPct,
  handleCalculate,
  handleRecalculate,
  stats,
  explorationPct,
  currentArchetype,
  showToast,
}: ValueCalculatorProps) {
  return (
    <>
      {/* The Big One — Backlog Value Calculator */}
      {!calculating && !calculated && (
        <button
          onClick={handleCalculate}
          className="w-full py-3 rounded-lg text-sm font-semibold font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            background: 'linear-gradient(135deg, var(--color-bg-elevated), rgba(167, 139, 250, 0.08))',
            border: '1px dashed rgba(167, 139, 250, 0.35)',
            color: '#a78bfa',
          }}
        >
          💎 What&apos;s your library worth?
        </button>
      )}

      {(calculating || calculated) && (
        <div
          className="rounded-lg p-4 text-center"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            background: 'linear-gradient(135deg, var(--color-bg-elevated), rgba(167, 139, 250, 0.06))',
            border: '1px solid rgba(167, 139, 250, 0.25)',
          }}
        >
          <div className="text-xs text-text-muted font-[family-name:var(--font-mono)] mb-1">
            💎 Estimated untapped value
          </div>
          <div
            className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-mono)] tracking-tight"
            style={{ color: '#a78bfa' }}
          >
            ~${countedUnplayed.toLocaleString()}
          </div>

          {/* Confidence indicator */}
          {calculated && priceConfidence.total > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${confidencePct}%`,
                      backgroundColor: confidencePct > 75 ? '#22c55e' : confidencePct > 40 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                  {priceConfidence.known} of {priceConfidence.total} priced
                </span>
              </div>
              <div className="text-xs text-text-faint font-[family-name:var(--font-mono)]">
                {confidencePct >= 80
                  ? 'high confidence: most games priced via retail data'
                  : confidencePct >= 40
                  ? 'moderate confidence: rest estimated from your library avg'
                  : enriching
                  ? 'improving... fetching more prices in background'
                  : 'low confidence: tap again to fetch more prices'
                }
              </div>
            </div>
          )}

          {calculated && playedValue > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-0.5">
                💰 Value unlocked by playing
              </div>
              <div
                className="text-xl font-bold font-[family-name:var(--font-mono)]"
                style={{ color: '#22c55e' }}
              >
                ${countedPlayed.toLocaleString()}
              </div>
            </div>
          )}

          {/* Time to clear backlog */}
          {calculated && backlogHours !== null && backlogHours > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-0.5">
                ⏳ Estimated time to clear
              </div>
              <div
                className="text-xl font-bold font-[family-name:var(--font-mono)]"
                style={{ color: '#f59e0b' }}
              >
                ~{countedBacklogHours.toLocaleString()} hours
              </div>

              {/* HLTB confidence */}
              {hltbConfidence.total > 0 && (
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${hltbPct}%`,
                        backgroundColor: hltbPct > 75 ? '#22c55e' : hltbPct > 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="text-xs text-text-faint font-[family-name:var(--font-mono)]">
                    {hltbConfidence.known} of {hltbConfidence.total} timed
                  </span>
                </div>
              )}

              <div className="text-xs text-text-faint font-[family-name:var(--font-mono)] mt-1.5 italic">
                {backlogHours > 5000
                  ? `That's ${(backlogHours / 24 / 365).toFixed(1)} years of non-stop gaming. You're set for life. Possibly several lives.`
                  : backlogHours > 1000
                  ? `At 2 hours a day, that's ${plural(Math.round(backlogHours / 2 / 30), 'month')}. Better get started.`
                  : backlogHours > 200
                  ? `Totally doable. At 2 hours a day, that's ${plural(Math.round(backlogHours / 2 / 7), 'week')}.`
                  : `Actually manageable. You could knock this out in ${plural(Math.round(backlogHours / 2 / 7), 'week')}.`
                }
              </div>
              <div className="text-xs text-text-faint font-[family-name:var(--font-mono)] mt-0.5 opacity-60">
                completion times via HowLongToBeat
              </div>
            </div>
          )}

          {/* Enrichment status */}
          {enriching && (
            <div className="mt-2 text-xs text-accent-purple font-[family-name:var(--font-mono)] animate-pulse">
              🔄 Fetching more data... estimates updating live
            </div>
          )}
        </div>
      )}

      {/* Recalculate button — shown after first calc to improve accuracy */}
      {calculated && !enriching && confidencePct < 90 && (
        <button
          onClick={handleRecalculate}
          className="w-full mt-2 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'rgba(167, 139, 250, 0.08)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            color: '#a78bfa',
          }}
        >
          🔄 Refine estimate ({priceConfidence.known}/{priceConfidence.total} games priced)
        </button>
      )}

      {/* Share buttons */}
      {calculated && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="text-xs text-text-faint font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2 text-center">
            Share your stats
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                trackShareStats('twitter');
                const text = generateShareText({
                  backlogSize: stats.backlogSize,
                  gamesCleared: stats.gamesCleared,
                  bailedCount: stats.bailedCount,
                  unplayedValue: countedUnplayed,
                  playedValue: countedPlayed,
                  oldest: stats.oldest,
                  streak: stats.streak,
                  backlogHours: backlogHours,
                  confidence: confidencePct,
                });
                shareToTwitter(text);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'rgba(29, 161, 242, 0.1)',
                border: '1px solid rgba(29, 161, 242, 0.2)',
                color: '#1da1f2',
              }}
            >
              𝕏 Post
            </button>
            <button
              onClick={() => {
                trackShareStats('reddit');
                const text = generateShareText({
                  backlogSize: stats.backlogSize,
                  gamesCleared: stats.gamesCleared,
                  bailedCount: stats.bailedCount,
                  unplayedValue: countedUnplayed,
                  playedValue: countedPlayed,
                  oldest: stats.oldest,
                  streak: stats.streak,
                  backlogHours: backlogHours,
                  confidence: confidencePct,
                });
                shareToReddit(text);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'rgba(255, 69, 0, 0.1)',
                border: '1px solid rgba(255, 69, 0, 0.2)',
                color: '#ff4500',
              }}
            >
              📮 Reddit
            </button>
            <button
              onClick={() => {
                trackShareStats('discord');
                const text = generateShareText({
                  backlogSize: stats.backlogSize,
                  gamesCleared: stats.gamesCleared,
                  bailedCount: stats.bailedCount,
                  unplayedValue: countedUnplayed,
                  playedValue: countedPlayed,
                  oldest: stats.oldest,
                  streak: stats.streak,
                  backlogHours: backlogHours,
                  confidence: confidencePct,
                });
                navigator.clipboard.writeText(getDiscordText(text));
                showToast('Copied! Paste it wherever you want.');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                border: '1px solid rgba(88, 101, 242, 0.2)',
                color: '#5865f2',
              }}
            >
              📋 Copy
            </button>
          </div>
        </div>
      )}

    </>
  );
}
