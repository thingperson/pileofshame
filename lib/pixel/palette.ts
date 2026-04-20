/**
 * Inventory Full pixel sprite palette.
 * Single-character codes map to hex colors. Shared across every sprite for
 * visual cohesion. Do not add theme-specific colors here — sprites render with
 * fixed palette across all themes by design (persona art is identity, not UI).
 */
export const IF_PALETTE = {
  // neutrals
  K: '#0a0612', D: '#1a1430', N: '#2a2145', M: '#6e658a',
  L: '#a39bb8', W: '#e9e5ef', X: '#ffffff',
  // brand
  T: '#2ee8c4', t: '#1a9e86', P: '#a78bfa', p: '#7c5cff',
  A: '#f59e0b', a: '#d97706', R: '#ff5a5a', G: '#34d399',
  // character (skin / wood / stone)
  S: '#f4c89d', s: '#c08866', H: '#8b5a3c', h: '#5a3820',
  E: '#d4a574', n: '#44403c', l: '#d6d3d1',
  // accent / fun
  Y: '#fbbf24', O: '#fb923c', F: '#ec4899', C: '#06b6d4',
  B: '#60a5fa', V: '#8b5cf6', I: '#f3e8ff',
  // extras
  d: '#065f46', g: '#16a34a', r: '#dc2626',
  b: '#1e3a8a', y: '#facc15',
  u: '#7e22ce', c: '#0891b2',
  w: '#fef3c7', k: '#292524',
} as const;

export type PaletteKey = keyof typeof IF_PALETTE;
