// ============================================================
// @peregrinus/gantt-core — Color Utilities
// ============================================================
// Pure functions for color manipulation. No dependencies.
// ============================================================

/** Parse a hex color (#RGB or #RRGGBB) into [r, g, b] */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Clamp a number to 0–255 */
function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/** Darken a hex color by reducing each RGB channel. */
export function darkenHex(color: string, amount = 40): string {
  const [r, g, b] = parseHex(color);
  return `#${clamp(r - amount).toString(16).padStart(2, '0')}${clamp(g - amount).toString(16).padStart(2, '0')}${clamp(b - amount).toString(16).padStart(2, '0')}`;
}

/** Lighten a hex color by increasing each RGB channel. */
export function lightenHex(color: string, amount = 40): string {
  const [r, g, b] = parseHex(color);
  return `#${clamp(r + amount).toString(16).padStart(2, '0')}${clamp(g + amount).toString(16).padStart(2, '0')}${clamp(b + amount).toString(16).padStart(2, '0')}`;
}

/** Convert a hex color to an rgba() string. */
export function hexToRgba(color: string, alpha: number): string {
  const [r, g, b] = parseHex(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
