import { CategoryId, BoardRecord } from './puzzle';

export interface CategoryProgress {
  currentLevel: number; // 1 ~ 10
  clearCountInLevel: number; // 0 ~ 3
  levelClears: Record<number, number>; // level -> cleared board count (0 ~ 3)
  maxUnlockedLevel: number; // 1 ~ 10
  isTested: boolean;
  totalClearedBoards: number;
}

export interface ActiveGameSession {
  category: CategoryId;
  level: number;
  boardNumber: number;
  userGrid: string[][];
  revealedChosungs: string[]; // cell keys e.g. "r,c"
  elapsedSeconds: number;
  selectedCell: { row: number; col: number } | null;
  activeWordId: string | null;
  activeDirection: 'across' | 'down';
  updatedAt: string;
}

export interface DailyChallengeData {
  lastPlayedDate: string; // "YYYY-MM-DD" in KST
  streakDays: number;
  completedDates: string[];
  bestTimeSeconds?: number;
  todayResult?: {
    date: string;
    completed: boolean;
    elapsedSeconds: number;
    wordCount: number;
  };
}

export interface WrongWordItem {
  id: string; // term as primary key
  term: string;
  definition: string;
  category: CategoryId;
  mistakeCount: number;
  hintUsedCount: number;
  lastEncounteredAt: string;
  mastered: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  rewardHints: number;
  rewardClaimed: boolean;
}

export type FontSizeSetting = 'normal' | 'large' | 'huge';

export interface UserSettings {
  isMuted: boolean;
  fontSize: FontSizeSetting;
  themeId: string;
  highContrast: boolean;
  learningMode: boolean; // false = Challenge mode (mask unsolved words in guide), true = Study mode
}

export interface UserSaveData {
  schemaVersion: number;
  nickname: string;
  hintBalance: number;
  selectedCategory: CategoryId;
  categoryProgress: Record<CategoryId, CategoryProgress>;
  activeGames: Partial<Record<CategoryId, ActiveGameSession>>;
  activeDailySession?: ActiveGameSession;
  records: BoardRecord[];
  settings: UserSettings;
  dailyChallenge: DailyChallengeData;
  wrongWords: WrongWordItem[];
  achievements: AchievementItem[];
  lastAttendanceDate?: string;
  solvedWordTerms: string[];
}
