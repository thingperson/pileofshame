'use client';

/**
 * Line icon system — 55 functional 24×24 SVGs, stroke="currentColor", theme-adaptive.
 * Source: notes/assets/icons/source/icons-line.js (full set + palette)
 *
 * REVERT: to restore emoji in any component, remove the LineIcon import and put
 * back the original emoji character. Original values per file:
 *   Reroll.tsx       ⚙ → settings  |  🎮 → controller
 *   SettingsMenu.tsx 📊 → stats  |  📚 → book  |  🔄 → rotate
 *   ValueCalculator.tsx 🔄 → rotate (×2)
 *   CompletionCelebration.tsx 📋 → copy
 *   StatsShareComposer.tsx 📋 → copy
 */

const ICONS = {
  settings:   '<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  controller: '<rect x="3" y="8" width="18" height="10" rx="3"/><circle cx="8" cy="13" r="1"/><circle cx="16" cy="13" r="1"/><path d="M6 11v4M16 13h2"/>',
  stats:      '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  book:       '<path d="M4 5a2 2 0 012-2h5v18H6a2 2 0 01-2-2V5z"/><path d="M20 5a2 2 0 00-2-2h-5v18h5a2 2 0 002-2V5z"/>',
  rotate:     '<path d="M21 12a9 9 0 1 1-3.5-7.1M21 4v5h-5"/>',
  copy:       '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  launch:     '<path d="M14 4h6v6M20 4 10 14M10 8H4v12h12v-6"/>',
  import:     '<path d="M3 15v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M7 10l5 5 5-5M12 15V3"/>',
  search:     '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  reroll:     '<path d="M21 12a9 9 0 1 1-3.5-7.1M21 4v5h-5"/>',
  trash:      '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M10 11v6M14 11v6"/>',
  edit:       '<path d="M3 21h4l11-11-4-4L3 17v4zM14 6l4 4"/>',
  external:   '<path d="M14 4h6v6M20 4l-8 8M8 4H4v16h16v-4"/>',
  filter:     '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  sort:       '<path d="M3 6h14M3 12h10M3 18h6M17 10v10M17 20l4-4M17 20l-4-4"/>',
} as const;

export type LineIconName = keyof typeof ICONS;

interface LineIconProps {
  name: LineIconName;
  size?: number;
  className?: string;
}

export default function LineIcon({ name, size = 16, className }: LineIconProps) {
  const inner = ICONS[name];
  if (!inner) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
