export type Direction = 'across' | 'down';

export type CategoryId =
  | 'POLITICS'       // 정치
  | 'SOCIETY'        // 사회
  | 'CULTURE'        // 문화
  | 'SPORTS'         // 스포츠
  | 'KOREAN_HISTORY' // 한국사
  | 'WORLD_HISTORY'  // 세계사
  | 'MUSIC'          // 음악
  | 'ART';           // 미술

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  themeId: string;
}

export interface WordItem {
  id: string;
  level: number; // 1 to 10
  term: string; // 2~6 Korean syllables
  definition: string;
  category: CategoryId;
  hintChosung?: string;
}

export interface PlacedWord {
  id: string;
  number: number; // 1 ~ 20
  term: string;
  definition: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  length: number;
  clueNumberText: string; // "①", "②", etc.
}

export interface CellData {
  row: number;
  col: number;
  isActive: boolean; // true if part of any word
  solutionChar: string; // Korean character
  userChar: string; // what user entered
  startNumber?: number; // 1 ~ 20 if word starts here
  startNumberText?: string; // "①", "②" etc
  wordIds: string[]; // ids of words covering this cell
  isWrong?: boolean; // temporary flag for check button
  showChosung?: boolean; // temporary flag for hint
  chosungChar?: string;
}

export interface BoardData {
  id: string;
  category?: CategoryId;
  level: number;
  boardNumber: number; // 1, 2, 3 within this level
  title: string;
  size: number; // 9, 11, or 13
  grid: CellData[][];
  placedWords: PlacedWord[];
}

export interface CategoryProgressItem {
  currentLevel: number;
  maxUnlockedLevel: number;
  clearCountInLevel: number;
  levelClears: Record<number, number>;
}

export interface UserProgress {
  selectedCategory: CategoryId;
  isTested: boolean;
  currentLevel: number; // 1 ~ 10
  clearCountInLevel: number; // 0 ~ 3
  levelClears: Record<number, number>; // level -> cleared count
  hintCountUsed: number;
  isMasterCleared: boolean;
  userName: string;
  categoryProgress?: Partial<Record<CategoryId, CategoryProgressItem>>;
}

export interface BoardRecord {
  id: string;
  category?: CategoryId;
  level: number;
  boardNumber: number;
  timeSeconds: number;
  date: string;
  wordCount: number;
}

export interface DiagnosticQuestion {
  id: number;
  question: string;
  answer: string;
  chosung: string;
  options: string[];
  levelWeight: number; // indicates target level
  explanation: string;
}
