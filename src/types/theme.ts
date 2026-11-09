export type ThemeId = 'emerald' | 'amber' | 'plum' | 'classic';

export interface ColorTheme {
  id: ThemeId;
  name: string;
  badge: string;
  // Outer frame & active accents
  boardBorder: string;
  inactiveCell: string;
  gridLine: string;
  activeWordHighlight: string;
  focusedCell: string;
  numberColor: string;
  primaryText: string;
  accentBg: string;
  badgeBorder: string;
  buttonClass: string;
}

export const THEMES: Record<ThemeId, ColorTheme> = {
  emerald: {
    id: 'emerald',
    name: '에메랄드 헌법',
    badge: '🌿 헌법 에메랄드',
    boardBorder: 'border-[#1b5e20]',
    inactiveCell: 'bg-[#a5d6a7]',
    gridLine: 'bg-[#81c784]',
    activeWordHighlight: 'bg-[#fff9c4]',
    focusedCell: 'bg-[#ffe082] ring-3 ring-[#1b5e20] ring-inset',
    numberColor: 'text-[#1b5e20]',
    primaryText: 'text-[#1b5e20]',
    accentBg: 'bg-[#e8f5e9]',
    badgeBorder: 'border-[#81c784]',
    buttonClass: 'bg-[#2e7d32] hover:bg-[#1b5e20] text-white',
  },
  amber: {
    id: 'amber',
    name: '클래식 양장 서재',
    badge: '📜 클래식 서재',
    boardBorder: 'border-[#795548]',
    inactiveCell: 'bg-[#d7ccc8]',
    gridLine: 'bg-[#bcaaa4]',
    activeWordHighlight: 'bg-[#fffde7]',
    focusedCell: 'bg-[#ffe082] ring-3 ring-[#5d4037] ring-inset',
    numberColor: 'text-[#5d4037]',
    primaryText: 'text-[#4e342e]',
    accentBg: 'bg-[#efebe9]',
    badgeBorder: 'border-[#bcaaa4]',
    buttonClass: 'bg-[#6d4c41] hover:bg-[#4e342e] text-white',
  },
  plum: {
    id: 'plum',
    name: '로열 벨벳 퍼플',
    badge: '👑 로열 퍼플',
    boardBorder: 'border-[#4a148c]',
    inactiveCell: 'bg-[#ce93d8]',
    gridLine: 'bg-[#ba68c8]',
    activeWordHighlight: 'bg-[#f3e5f5]',
    focusedCell: 'bg-[#ffe082] ring-3 ring-[#4a148c] ring-inset',
    numberColor: 'text-[#4a148c]',
    primaryText: 'text-[#4a148c]',
    accentBg: 'bg-[#f3e5f5]',
    badgeBorder: 'border-[#ce93d8]',
    buttonClass: 'bg-[#6a1b9a] hover:bg-[#4a148c] text-white',
  },
  classic: {
    id: 'classic',
    name: '스카이 블루',
    badge: '🏛️ 스카이 블루',
    boardBorder: 'border-[#1e88e5]',
    inactiveCell: 'bg-[#7ccbff]',
    gridLine: 'bg-[#42a5f5]',
    activeWordHighlight: 'bg-[#fff9c4]',
    focusedCell: 'bg-[#ffe082] ring-3 ring-[#0288d1] ring-inset',
    numberColor: 'text-[#00838f]',
    primaryText: 'text-[#01579b]',
    accentBg: 'bg-[#e1f5fe]',
    badgeBorder: 'border-[#4fc3f7]',
    buttonClass: 'bg-[#0288d1] hover:bg-[#0277bd] text-white',
  },
};

/**
 * Returns default theme for level tier:
 * - 초급 (Lv.1 ~ 3): emerald
 * - 중급 (Lv.4 ~ 7): amber
 * - 전문가 (Lv.8 ~ 10): plum
 */
export function getDefaultThemeForLevel(level: number): ThemeId {
  if (level <= 3) return 'emerald';
  if (level <= 7) return 'amber';
  return 'plum';
}
