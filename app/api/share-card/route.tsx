import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Shareable stats card generator.
 *
 * Query params:
 *   backlog, cleared, bailed, hours, value, playedValue, backlogHours,
 *   oldest, streak, rank, theme (dark|light|90s|80s|future|dino|weird|ultra)
 *
 * Returns a 1200x630 PNG image suitable for OG/Twitter/Discord embeds.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const backlog = parseInt(searchParams.get('backlog') || '0');
  const cleared = parseInt(searchParams.get('cleared') || '0');
  const bailed = parseInt(searchParams.get('bailed') || '0');
  const hours = parseInt(searchParams.get('hours') || '0');
  const value = parseInt(searchParams.get('value') || '0');
  const playedValue = parseInt(searchParams.get('playedValue') || '0');
  const backlogHours = parseInt(searchParams.get('backlogHours') || '0');
  const oldest = searchParams.get('oldest') || '';
  const streak = parseInt(searchParams.get('streak') || '0');
  const rank = searchParams.get('rank') || '';
  const theme = searchParams.get('theme') || 'dark';
  const total = backlog + cleared + bailed;

  // Pick renderer based on theme
  switch (theme) {
    case '80s':
      return renderReceiptCard({ backlog, cleared, bailed, hours, value, playedValue, backlogHours, oldest, streak, rank, total });
    case '90s':
      return renderPolaroidCard({ backlog, cleared, bailed, hours, value, playedValue, backlogHours, oldest, streak, rank, total });
    case 'dino':
      return renderPixelCard({ backlog, cleared, bailed, hours, value, playedValue, backlogHours, oldest, streak, rank, total });
    case 'ultra':
      return renderUltraCard({ backlog, cleared, bailed, hours, value, playedValue, backlogHours, oldest, streak, rank, total });
    default:
      return renderDefaultCard({ backlog, cleared, bailed, hours, value, playedValue, backlogHours, oldest, streak, rank, total });
  }
}

interface CardData {
  backlog: number;
  cleared: number;
  bailed: number;
  hours: number;
  value: number;
  playedValue: number;
  backlogHours: number;
  oldest: string;
  streak: number;
  rank: string;
  total: number;
}

// === DEFAULT (Dark theme) ===
function renderDefaultCard(d: CardData) {
  const pct = d.total > 0 ? Math.round(((d.cleared + d.bailed) / d.total) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #161622 50%, #0a0a0f 100%)',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-80px', right: '0', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(167,139,250,0.12), transparent)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '0', width: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(249,168,212,0.08), transparent)', display: 'flex' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{ fontSize: '42px', display: 'flex' }}>🎮</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-1px', display: 'flex' }}>
            Inventory Full
          </div>
        </div>

        {/* Rank */}
        {d.rank && (
          <div style={{ fontSize: '18px', color: '#a78bfa', fontWeight: 600, marginBottom: '32px', display: 'flex' }}>
            {d.rank}
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <StatBox label="Backlog" value={d.backlog.toString()} color="#64748b" />
          <StatBox label="Cleared" value={d.cleared.toString()} color="#22c55e" />
          {d.bailed > 0 && <StatBox label="Bailed" value={d.bailed.toString()} color="#ef4444" />}
          {d.hours > 0 && <StatBox label="Hours" value={d.hours.toLocaleString()} color="#38bdf8" />}
        </div>

        {/* Value row */}
        {(d.value > 0 || d.playedValue > 0) && (
          <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
            {d.value > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '14px', color: '#64748b', display: 'flex' }}>Unplayed value</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', display: 'flex' }}>
                  ${d.value.toLocaleString()}
                </div>
              </div>
            )}
            {d.playedValue > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '14px', color: '#64748b', display: 'flex' }}>Value recovered</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e', display: 'flex' }}>
                  ${d.playedValue.toLocaleString()}
                </div>
              </div>
            )}
            {d.backlogHours > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '14px', color: '#64748b', display: 'flex' }}>Hours to clear</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', display: 'flex' }}>
                  ~{d.backlogHours.toLocaleString()}h
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', display: 'flex' }}>Exploration progress</div>
            <div style={{ fontSize: '14px', color: '#a78bfa', fontWeight: 700, display: 'flex' }}>{pct}%</div>
          </div>
          <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', backgroundColor: '#a78bfa', display: 'flex' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ fontSize: '16px', color: '#475569', display: 'flex' }}>inventoryfull.gg</div>
          {d.streak >= 3 && (
            <div style={{ fontSize: '16px', color: '#a78bfa', display: 'flex' }}>
              🔥 {d.streak} game streak
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

// === 80s SYNTHWAVE — Receipt/thermal printer style ===
function renderReceiptCard(d: CardData) {
  const lines = [
    '================================',
    '     BACKLOG BUSTER INC.',
    '     Est. Your Steam Account',
    '================================',
    '',
    `GAMES TRACKED ........... ${d.total}`,
    `BACKLOG ................. ${d.backlog}`,
    `CLEARED ................. ${d.cleared}`,
    ...(d.bailed > 0 ? [`BAILED .................. ${d.bailed}`] : []),
    ...(d.hours > 0 ? [`HOURS LOGGED ............ ${d.hours.toLocaleString()}`] : []),
    '',
    '--------------------------------',
    ...(d.value > 0 ? [`UNPLAYED VALUE    $${d.value.toLocaleString()}`] : []),
    ...(d.playedValue > 0 ? [`VALUE RECOVERED   $${d.playedValue.toLocaleString()}`] : []),
    ...(d.backlogHours > 0 ? [`TIME TO CLEAR     ~${d.backlogHours.toLocaleString()}h`] : []),
    '--------------------------------',
    '',
    ...(d.rank ? [`STATUS: ${d.rank.toUpperCase()}`] : []),
    ...(d.streak >= 3 ? [`STREAK: ${d.streak} IN A ROW`] : []),
    ...(d.oldest ? [`OLDEST: ${d.oldest.toUpperCase()}`] : []),
    '',
    '================================',
    '  THANK YOU FOR YOUR PATRONAGE',
    '       inventoryfull.gg',
    '================================',
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Receipt paper */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '520px',
            padding: '40px 36px',
            background: '#f0e8d8',
            color: '#1a1a1a',
            fontSize: '16px',
            lineHeight: '1.6',
            borderRadius: '2px',
            boxShadow: '0 4px 40px rgba(255,0,128,0.15), 0 0 80px rgba(167,139,250,0.1)',
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', whiteSpace: 'pre' }}>
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

// === 90s GEOCITIES — Polaroid style ===
function renderPolaroidCard(d: CardData) {
  const pct = d.total > 0 ? Math.round(((d.cleared + d.bailed) / d.total) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, serif',
        }}
      >
        {/* Polaroid frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '480px',
            background: '#fafaf5',
            padding: '24px 24px 48px 24px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 4px 4px 0 rgba(0,0,0,0.1)',
            transform: 'rotate(-1.5deg)',
          }}
        >
          {/* "Photo" area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #1e1e2e, #2d1b69)',
              padding: '32px',
              gap: '12px',
              minHeight: '360px',
            }}
          >
            <div style={{ fontSize: '48px', display: 'flex' }}>🎮</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', display: 'flex' }}>
              Inventory Full
            </div>
            {d.rank && (
              <div style={{ fontSize: '16px', color: '#c4b5fd', fontWeight: 600, display: 'flex' }}>
                {d.rank}
              </div>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              <MiniStat label="Backlog" value={d.backlog.toString()} />
              <MiniStat label="Cleared" value={d.cleared.toString()} />
              {d.hours > 0 && <MiniStat label="Hours" value={d.hours.toLocaleString()} />}
            </div>
            {d.value > 0 && (
              <div style={{ fontSize: '20px', color: '#fbbf24', fontWeight: 700, marginTop: '8px', display: 'flex' }}>
                ${d.value.toLocaleString()} sitting unplayed
              </div>
            )}
            {/* Mini progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ width: '120px', height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex' }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: '#a78bfa', display: 'flex' }} />
              </div>
              <div style={{ fontSize: '14px', color: '#a78bfa', fontWeight: 700, display: 'flex' }}>{pct}%</div>
            </div>
          </div>

          {/* Handwritten-style bottom text */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              padding: '0 4px',
            }}
          >
            <div style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', display: 'flex' }}>
              {d.cleared > 0 ? `${d.cleared} down, ${d.backlog} to go` : `${d.backlog} games to play`}
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af', display: 'flex' }}>
              inventoryfull.gg
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

// === DINO — Pixel/8-bit style ===
function renderPixelCard(d: CardData) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#1a3a1a',
          fontFamily: 'monospace',
          color: '#33ff33',
          imageRendering: 'pixelated' as any,
        }}
      >
        {/* Pixel border frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '6px solid #33ff33',
            padding: '40px 60px',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '56px', display: 'flex' }}>🦕</div>
          <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '4px', display: 'flex' }}>
            INVENTORY FULL
          </div>
          <div style={{ fontSize: '16px', color: '#88cc88', display: 'flex' }}>
            - - - PLAYER STATS - - -
          </div>

          <div style={{ display: 'flex', gap: '40px', marginTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, display: 'flex' }}>{d.backlog}</div>
              <div style={{ fontSize: '14px', color: '#88cc88', display: 'flex' }}>BACKLOG</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, display: 'flex' }}>{d.cleared}</div>
              <div style={{ fontSize: '14px', color: '#88cc88', display: 'flex' }}>CLEARED</div>
            </div>
            {d.hours > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, display: 'flex' }}>{d.hours.toLocaleString()}</div>
                <div style={{ fontSize: '14px', color: '#88cc88', display: 'flex' }}>HOURS</div>
              </div>
            )}
          </div>

          {d.value > 0 && (
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffcc00', marginTop: '8px', display: 'flex' }}>
              UNPLAYED VALUE: ${d.value.toLocaleString()}
            </div>
          )}

          {d.rank && (
            <div style={{ fontSize: '18px', color: '#88cc88', fontStyle: 'italic', display: 'flex' }}>
              RANK: {d.rank.toUpperCase()}
            </div>
          )}

          <div style={{ fontSize: '14px', color: '#558855', marginTop: '12px', display: 'flex' }}>
            inventoryfull.gg
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

// === ULTRA — Chartreuse + black, aggressive ===
function renderUltraCard(d: CardData) {
  const pct = d.total > 0 ? Math.round(((d.cleared + d.bailed) / d.total) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#000000',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Chartreuse accent line */}
        <div style={{ position: 'absolute', top: '0', left: '0', width: '6px', height: '100%', background: '#BFFF00', display: 'flex' }} />

        {/* Header */}
        <div style={{ fontSize: '48px', fontWeight: 900, color: '#BFFF00', letterSpacing: '6px', textTransform: 'uppercase' as any, display: 'flex' }}>
          INVENTORY FULL
        </div>
        {d.rank && (
          <div style={{ fontSize: '18px', color: '#ffffff', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' as any, marginTop: '4px', display: 'flex' }}>
            {d.rank}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '56px', fontWeight: 900, color: '#ffffff', display: 'flex' }}>{d.backlog}</div>
            <div style={{ fontSize: '14px', color: '#555555', letterSpacing: '2px', textTransform: 'uppercase' as any, display: 'flex' }}>BACKLOG</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '56px', fontWeight: 900, color: '#BFFF00', display: 'flex' }}>{d.cleared}</div>
            <div style={{ fontSize: '14px', color: '#555555', letterSpacing: '2px', textTransform: 'uppercase' as any, display: 'flex' }}>CLEARED</div>
          </div>
          {d.hours > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '56px', fontWeight: 900, color: '#ffffff', display: 'flex' }}>{d.hours.toLocaleString()}</div>
              <div style={{ fontSize: '14px', color: '#555555', letterSpacing: '2px', textTransform: 'uppercase' as any, display: 'flex' }}>HOURS</div>
            </div>
          )}
        </div>

        {/* Value */}
        {d.value > 0 && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '32px' }}>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#BFFF00', display: 'flex' }}>
              ${d.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '16px', color: '#555555', letterSpacing: '1px', display: 'flex' }}>
              UNPLAYED
            </div>
          </div>
        )}

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <div style={{ width: '400px', height: '4px', backgroundColor: '#1a1a1a', display: 'flex' }}>
            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#BFFF00', display: 'flex' }} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#BFFF00', display: 'flex' }}>{pct}%</div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ fontSize: '14px', color: '#333333', letterSpacing: '2px', display: 'flex' }}>PILEOFSHA.ME</div>
          {d.streak >= 3 && (
            <div style={{ fontSize: '14px', color: '#BFFF00', letterSpacing: '2px', display: 'flex' }}>
              {d.streak} GAME STREAK
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

// === Helper components for Satori ===
function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 24px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        minWidth: '120px',
      }}
    >
      <div style={{ fontSize: '14px', color: '#64748b', display: 'flex' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 800, color, display: 'flex' }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', display: 'flex' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex' }}>{label}</div>
    </div>
  );
}
