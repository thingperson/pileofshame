import { PlayerArchetype, getArchetypeSpriteKey } from '@/lib/archetypes';
import { hasSprite } from '@/lib/pixel/sprites';
import PixelSprite from './PixelSprite';

interface ArchetypeCardProps {
  currentArchetype: PlayerArchetype;
  archetypeIndex: number;
  archetypesLength: number;
  onReroll: () => void;
}

export default function ArchetypeCard({
  currentArchetype,
  archetypeIndex,
  archetypesLength,
  onReroll,
}: ArchetypeCardProps) {
  return (
    <div
      className="rounded-lg p-4 mb-3 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: `1px solid ${
          currentArchetype.tone === 'roast' ? 'rgba(239, 68, 68, 0.3)'
          : currentArchetype.tone === 'respect' ? 'rgba(34, 197, 94, 0.3)'
          : 'rgba(167, 139, 250, 0.3)'
        }`,
      }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center">
          {(() => {
            const spriteKey = getArchetypeSpriteKey(currentArchetype);
            if (spriteKey && hasSprite(spriteKey)) {
              return (
                <PixelSprite
                  name={spriteKey}
                  size={96}
                  className="w-full h-auto sm:max-w-none"
                  ariaLabel={currentArchetype.title}
                />
              );
            }
            return <span className="text-3xl sm:text-5xl">{currentArchetype.icon}</span>;
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-text-primary">{currentArchetype.title}</span>
            <span
              className="px-1.5 py-0.5 rounded text-xs font-bold uppercase font-[family-name:var(--font-mono)] inline-flex items-center gap-1"
              style={{
                backgroundColor: currentArchetype.tone === 'roast' ? 'rgba(239, 68, 68, 0.15)'
                  : currentArchetype.tone === 'respect' ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(167, 139, 250, 0.15)',
                color: currentArchetype.tone === 'roast' ? '#ef4444'
                  : currentArchetype.tone === 'respect' ? '#22c55e'
                  : '#a78bfa',
              }}
            >
              {(() => {
                const toneSprite = currentArchetype.tone === 'roast' ? 'toneBadgeRoast'
                  : currentArchetype.tone === 'respect' ? 'toneBadgeRespect'
                  : 'toneBadgeReading';
                return hasSprite(toneSprite)
                  ? <PixelSprite name={toneSprite} size={14} ariaLabel={currentArchetype.tone} />
                  : <span aria-hidden="true">{currentArchetype.tone === 'roast' ? '🔥' : currentArchetype.tone === 'respect' ? '👑' : '🔮'}</span>;
              })()}
              <span>{currentArchetype.tone}</span>
            </span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            {currentArchetype.description}
          </p>
        </div>
      </div>
      {archetypesLength > 1 && (
        <button
          onClick={onReroll}
          className="mt-3 w-full py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'rgba(167, 139, 250, 0.08)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            color: '#a78bfa',
          }}
        >
          🔮 Read me again ({archetypeIndex % archetypesLength + 1}/{archetypesLength})
        </button>
      )}
    </div>
  );
}
