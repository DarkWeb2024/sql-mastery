// A vibrant, multi-hue accent system so the product is colour-coded by subject
// rather than washed in a single blue. Each topic category gets its own hue,
// the way Coursera and Duolingo colour their tracks, which makes the interface
// feel alive and helps learners build a spatial sense of where they are.

export const VIBRANT: string[] = [
  '#4F8CFF', // blue
  '#8B5CF6', // violet
  '#22C55E', // green
  '#F59E0B', // amber
  '#06B6D4', // cyan
  '#F43F5E', // rose
  '#A855F7', // purple
  '#14B8A6', // teal
  '#EC4899', // pink
  '#F97316', // orange
];

// Hand-picked hues for the known categories so related areas feel intentional;
// anything unmapped falls back to a stable hash so colours never flicker.
const CATEGORY_HUES: Record<string, string> = {
  Basics: '#4F8CFF',
  Filtering: '#06B6D4',
  Aggregations: '#22C55E',
  Joins: '#F59E0B',
  Subqueries: '#8B5CF6',
  CTE: '#A855F7',
  'Window Functions': '#EC4899',
  'Set Operations': '#14B8A6',
  'Analytics SQL': '#F43F5E',
  'Interview SQL': '#F97316',
  Indexes: '#0EA5E9',
  Views: '#10B981',
  Optimization: '#EAB308',
};

function hashIndex(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % VIBRANT.length;
}

export function colorForKey(key: string): string {
  return CATEGORY_HUES[key] ?? VIBRANT[hashIndex(key)];
}

// A translucent version of a hex colour, for glows and tinted surfaces.
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
