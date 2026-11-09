import backgroundManifest from '../data/backgroundManifest.json';

export interface BackgroundItem {
  id: string;
  url: string;
  name: string;
  sizeKb: number;
}

const typedManifest = backgroundManifest as unknown as Record<number, BackgroundItem[]>;

/**
 * Returns a random background image metadata for a given level (1 of 3 themed variations)
 */
export function getRandomBackgroundForLevel(level: number, currentId?: string): BackgroundItem {
  const safeLevel = Math.max(1, Math.min(10, level));
  const list = typedManifest[safeLevel];
  if (list && list.length > 0) {
    const candidates = currentId && list.length > 1 ? list.filter((b) => b.id !== currentId) : list;
    const randomIdx = Math.floor(Math.random() * candidates.length);
    return candidates[randomIdx];
  }
  // Fallback
  return {
    id: `lv${safeLevel}_default`,
    url: '/background.webp',
    name: '국회 헌법 서고와 서재',
    sizeKb: 125,
  };
}

/**
 * Returns all 3 backgrounds for a level
 */
export function getBackgroundsForLevel(level: number): BackgroundItem[] {
  const safeLevel = Math.max(1, Math.min(10, level));
  return typedManifest[safeLevel] || [];
}
