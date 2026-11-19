import { CategoryId } from '../types/puzzle';
import {
  UserSaveData,
  CategoryProgress,
  ActiveGameSession,
  AchievementItem,
  UserSettings,
} from '../types/progress';

export const KNOWLEDGE_SAVE_KEY = 'knowledge_crossword_save_v1';
export const LEGACY_STORAGE_KEY = 'politics_crossword_progress_v5';

export const ALL_CATEGORIES: CategoryId[] = [
  'POLITICS',
  'SOCIETY',
  'CULTURE',
  'SPORTS',
  'KOREAN_HISTORY',
  'WORLD_HISTORY',
  'MUSIC',
  'ART',
];

export function createDefaultCategoryProgress(): CategoryProgress {
  return {
    currentLevel: 1,
    clearCountInLevel: 0,
    levelClears: {},
    maxUnlockedLevel: 1,
    isTested: false,
    totalClearedBoards: 0,
  };
}

export function createInitialCategoryMap(): Record<CategoryId, CategoryProgress> {
  const map = {} as Record<CategoryId, CategoryProgress>;
  for (const cat of ALL_CATEGORIES) {
    map[cat] = createDefaultCategoryProgress();
  }
  return map;
}

export function createInitialAchievements(): AchievementItem[] {
  return [
    {
      id: 'first_clear',
      title: '첫 발걸음',
      description: '첫 번째 낱말퍼즐 관문 돌파',
      icon: '🎯',
      unlockedAt: null,
      progress: 0,
      maxProgress: 1,
      rewardHints: 2,
      rewardClaimed: false,
    },
    {
      id: 'word_50',
      title: '어휘 탐험가',
      description: '누적 50개 어휘 정복',
      icon: '📖',
      unlockedAt: null,
      progress: 0,
      maxProgress: 50,
      rewardHints: 3,
      rewardClaimed: false,
    },
    {
      id: 'word_100',
      title: '어휘 수집가',
      description: '누적 100개 어휘 정복',
      icon: '📚',
      unlockedAt: null,
      progress: 0,
      maxProgress: 100,
      rewardHints: 5,
      rewardClaimed: false,
    },
    {
      id: 'word_300',
      title: '박학다식',
      description: '누적 300개 어휘 정복',
      icon: '👑',
      unlockedAt: null,
      progress: 0,
      maxProgress: 300,
      rewardHints: 10,
      rewardClaimed: false,
    },
    {
      id: 'streak_3',
      title: '꾸준한 열정',
      description: '3일 연속 출석 달성',
      icon: '🔥',
      unlockedAt: null,
      progress: 0,
      maxProgress: 3,
      rewardHints: 3,
      rewardClaimed: false,
    },
    {
      id: 'streak_7',
      title: '지식의 습관',
      description: '7일 연속 출석 달성',
      icon: '⭐',
      unlockedAt: null,
      progress: 0,
      maxProgress: 7,
      rewardHints: 5,
      rewardClaimed: false,
    },
    {
      id: 'streak_30',
      title: '진정한 탐구자',
      description: '30일 연속 출석 달성',
      icon: '🏆',
      unlockedAt: null,
      progress: 0,
      maxProgress: 30,
      rewardHints: 15,
      rewardClaimed: false,
    },
    {
      id: 'hintless_clear',
      title: '자수성가',
      description: '초성 힌트 없이 관문 퍼즐 클리어',
      icon: '💡',
      unlockedAt: null,
      progress: 0,
      maxProgress: 1,
      rewardHints: 2,
      rewardClaimed: false,
    },
    {
      id: 'speed_master',
      title: '전광석화',
      description: '1분 30초 이내에 관문 클리어',
      icon: '⚡',
      unlockedAt: null,
      progress: 0,
      maxProgress: 1,
      rewardHints: 3,
      rewardClaimed: false,
    },
    {
      id: 'category_master',
      title: '첫 분야 마스터',
      description: '어느 한 분야의 10레벨 30관문 모두 완료',
      icon: '🎓',
      unlockedAt: null,
      progress: 0,
      maxProgress: 30,
      rewardHints: 10,
      rewardClaimed: false,
    },
    {
      id: 'grand_master',
      title: '팔방미인',
      description: '8개 지식 분야 전체 마스터 달성',
      icon: '🏛️',
      unlockedAt: null,
      progress: 0,
      maxProgress: 8,
      rewardHints: 30,
      rewardClaimed: false,
    },
  ];
}

export function createDefaultSettings(): UserSettings {
  return {
    isMuted: false,
    fontSize: 'normal',
    themeId: 'classic',
    highContrast: false,
    learningMode: false, // Default challenge mode: unsolved words are masked in guide
  };
}

export function createDefaultUserSaveData(): UserSaveData {
  return {
    schemaVersion: 1,
    nickname: '대한민국 지식탐구자',
    hintBalance: 3,
    selectedCategory: 'POLITICS',
    categoryProgress: createInitialCategoryMap(),
    activeGames: {},
    records: [],
    settings: createDefaultSettings(),
    dailyChallenge: {
      lastPlayedDate: '',
      streakDays: 0,
      completedDates: [],
    },
    wrongWords: [],
    achievements: createInitialAchievements(),
    solvedWordTerms: [],
  };
}

/**
 * Returns current date in Korea Standard Time (UTC+9) formatted as "YYYY-MM-DD"
 */
export function getKSTDateString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    // Fallback if Intl timeZone is unavailable
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const kst = new Date(utc + 9 * 3600000);
    return kst.toISOString().slice(0, 10);
  }
}

/**
 * Calculates day difference between two YYYY-MM-DD date strings
 */
export function getDayDifference(dateA: string, dateB: string): number {
  if (!dateA || !dateB) return 999;
  const da = new Date(dateA + 'T00:00:00Z').getTime();
  const db = new Date(dateB + 'T00:00:00Z').getTime();
  return Math.round((da - db) / (1000 * 60 * 60 * 24));
}

/**
 * Migrates data from legacy politics_crossword_progress_v5 if present
 */
export function migrateFromLegacyStorage(): UserSaveData {
  const base = createDefaultUserSaveData();

  if (typeof localStorage === 'undefined') {
    return base;
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return base;

    const legacy = JSON.parse(legacyRaw);
    const legacyCategory: CategoryId = ALL_CATEGORIES.includes(legacy.selectedCategory)
      ? legacy.selectedCategory
      : 'POLITICS';

    base.selectedCategory = legacyCategory;
    base.hintBalance = typeof legacy.hintBalance === 'number' ? legacy.hintBalance : 3;

    const storedNickname = localStorage.getItem('politics_crossword_nickname');
    if (storedNickname) base.nickname = storedNickname;

    const storedLargeFont = localStorage.getItem('politics_crossword_large_font');
    if (storedLargeFont === 'true') base.settings.fontSize = 'large';

    const legacyAttendance = localStorage.getItem('politics_crossword_last_attendance');
    if (legacyAttendance) base.lastAttendanceDate = legacyAttendance;

    // Migrate level progress to the legacy's active category
    const catProg = base.categoryProgress[legacyCategory];
    catProg.currentLevel = Math.max(1, Math.min(10, legacy.currentLevel || 1));
    catProg.clearCountInLevel = Math.max(0, Math.min(3, legacy.clearCountInLevel || 0));
    catProg.maxUnlockedLevel = Math.max(1, Math.min(10, legacy.maxUnlockedLevel || 1));
    catProg.levelClears = legacy.levelClears || {};
    catProg.isTested = Boolean(legacy.isTested);

    // Calculate total cleared boards
    let totalCleared = 0;
    for (const lvl of Object.keys(catProg.levelClears)) {
      totalCleared += catProg.levelClears[Number(lvl)] || 0;
    }
    catProg.totalClearedBoards = totalCleared;

    if (Array.isArray(legacy.boardRecords)) {
      base.records = legacy.boardRecords;
    }
    if (Array.isArray(legacy.solvedWords)) {
      base.solvedWordTerms = legacy.solvedWords;
    }

    // Save migrated format to new storage key immediately
    saveUserSaveData(base);
    return base;
  } catch (err) {
    console.error('Migration failed, using default save data:', err);
    return base;
  }
}

/**
 * Loads UserSaveData with automatic migration and fallback
 */
export function loadUserSaveData(): UserSaveData {
  if (typeof localStorage === 'undefined') {
    return createDefaultUserSaveData();
  }

  try {
    const raw = localStorage.getItem(KNOWLEDGE_SAVE_KEY);
    if (!raw) {
      // Check legacy storage
      if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
        return migrateFromLegacyStorage();
      }
      const initial = createDefaultUserSaveData();
      saveUserSaveData(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<UserSaveData>;
    const defaultData = createDefaultUserSaveData();

    // Ensure all 8 categories exist in categoryProgress
    const mergedProgress = createInitialCategoryMap();
    if (parsed.categoryProgress) {
      for (const cat of ALL_CATEGORIES) {
        if (parsed.categoryProgress[cat]) {
          mergedProgress[cat] = {
            ...createDefaultCategoryProgress(),
            ...parsed.categoryProgress[cat],
          };
        }
      }
    }

    // Merge achievements ensuring newly added achievements exist
    const defaultAchievements = createInitialAchievements();
    const existingAchievements = parsed.achievements || [];
    const mergedAchievements = defaultAchievements.map((def) => {
      const existing = existingAchievements.find((a) => a.id === def.id);
      return existing ? { ...def, ...existing } : def;
    });

    const fullData: UserSaveData = {
      schemaVersion: 1,
      nickname: parsed.nickname || defaultData.nickname,
      hintBalance: typeof parsed.hintBalance === 'number' ? parsed.hintBalance : defaultData.hintBalance,
      selectedCategory: ALL_CATEGORIES.includes(parsed.selectedCategory as CategoryId)
        ? (parsed.selectedCategory as CategoryId)
        : 'POLITICS',
      categoryProgress: mergedProgress,
      activeGames: parsed.activeGames || {},
      activeDailySession: parsed.activeDailySession,
      records: Array.isArray(parsed.records) ? parsed.records : [],
      settings: {
        ...createDefaultSettings(),
        ...(parsed.settings || {}),
        themeId:
          parsed.settings?.themeId === 'classic-blue'
            ? 'classic'
            : parsed.settings?.themeId || 'classic',
      },
      dailyChallenge: {
        lastPlayedDate: parsed.dailyChallenge?.lastPlayedDate || '',
        streakDays: parsed.dailyChallenge?.streakDays || 0,
        completedDates: Array.isArray(parsed.dailyChallenge?.completedDates)
          ? parsed.dailyChallenge.completedDates
          : [],
        bestTimeSeconds: parsed.dailyChallenge?.bestTimeSeconds,
        todayResult: parsed.dailyChallenge?.todayResult,
      },
      wrongWords: Array.isArray(parsed.wrongWords) ? parsed.wrongWords : [],
      achievements: mergedAchievements,
      lastAttendanceDate: parsed.lastAttendanceDate,
      solvedWordTerms: Array.isArray(parsed.solvedWordTerms) ? parsed.solvedWordTerms : [],
    };

    return fullData;
  } catch (err) {
    console.error('Error loading UserSaveData, restoring defaults:', err);
    return createDefaultUserSaveData();
  }
}

/**
 * Saves UserSaveData and synchronizes backwards-compatible legacy key
 */
export function saveUserSaveData(data: UserSaveData): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(KNOWLEDGE_SAVE_KEY, JSON.stringify(data));

    // Sync legacy storage key for backward compatibility
    const currentCatProgress = data.categoryProgress[data.selectedCategory] || createDefaultCategoryProgress();
    const legacyPayload = {
      selectedCategory: data.selectedCategory,
      currentLevel: currentCatProgress.currentLevel,
      clearCountInLevel: currentCatProgress.clearCountInLevel,
      levelClears: currentCatProgress.levelClears,
      maxUnlockedLevel: currentCatProgress.maxUnlockedLevel,
      isTested: currentCatProgress.isTested,
      hintBalance: data.hintBalance,
      boardRecords: data.records,
      solvedWords: data.solvedWordTerms,
    };
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyPayload));
    localStorage.setItem('politics_crossword_nickname', data.nickname);
    localStorage.setItem('politics_crossword_large_font', String(data.settings.fontSize !== 'normal'));
  } catch (err) {
    console.error('Failed to save UserSaveData:', err);
  }
}

/**
 * Process daily attendance in KST. Returns updated data and whether reward was awarded.
 */
export function processDailyAttendance(currentData: UserSaveData): { data: UserSaveData; awarded: boolean } {
  const todayKST = getKSTDateString();
  const lastDate = currentData.lastAttendanceDate || '';

  if (lastDate === todayKST) {
    return { data: currentData, awarded: false };
  }

  const diff = getDayDifference(todayKST, lastDate);
  const newStreak = diff === 1 ? (currentData.dailyChallenge.streakDays || 0) + 1 : 1;

  const updated: UserSaveData = {
    ...currentData,
    hintBalance: currentData.hintBalance + 2, // Daily attendance bonus: +2 hints
    lastAttendanceDate: todayKST,
    dailyChallenge: {
      ...currentData.dailyChallenge,
      streakDays: newStreak,
    },
  };

  saveUserSaveData(updated);
  return { data: updated, awarded: true };
}

/**
 * Active game session persistence
 */
export function saveActiveGame(session: ActiveGameSession): void {
  const data = loadUserSaveData();
  data.activeGames[session.category] = session;
  saveUserSaveData(data);
}

export function getActiveGame(category: CategoryId): ActiveGameSession | undefined {
  const data = loadUserSaveData();
  return data.activeGames[category];
}

export function clearActiveGame(category: CategoryId): void {
  const data = loadUserSaveData();
  if (data.activeGames[category]) {
    delete data.activeGames[category];
    saveUserSaveData(data);
  }
}

export function getMostRecentActiveGame(): { category: CategoryId; session: ActiveGameSession } | null {
  const data = loadUserSaveData();
  let mostRecent: { category: CategoryId; session: ActiveGameSession } | null = null;
  let latestTime = 0;

  for (const cat of ALL_CATEGORIES) {
    const session = data.activeGames[cat];
    if (session && session.updatedAt) {
      const t = new Date(session.updatedAt).getTime();
      if (t > latestTime) {
        latestTime = t;
        mostRecent = { category: cat, session };
      }
    }
  }

  return mostRecent;
}

/**
 * Checks master certificate qualification
 * Condition: All 10 levels have cleared all 3 gates (total 30 boards)
 */
export function isCategoryMasterEligible(
  _category: CategoryId,
  progress: CategoryProgress
): { eligible: boolean; clearedBoards: number; totalRequired: number; remainingBoards: number } {
  let clearedCount = 0;
  for (let lvl = 1; lvl <= 10; lvl++) {
    const count = progress.levelClears[lvl] || 0;
    clearedCount += Math.min(3, count);
  }

  const totalRequired = 30;
  const eligible = clearedCount >= totalRequired;
  const remainingBoards = Math.max(0, totalRequired - clearedCount);

  return {
    eligible,
    clearedBoards: clearedCount,
    totalRequired,
    remainingBoards,
  };
}

/**
 * Records a word error for wrong words review
 */
export function recordWordMistake(term: string, definition: string, category: CategoryId): void {
  const data = loadUserSaveData();
  const existingIndex = data.wrongWords.findIndex((w) => w.term === term);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const item = data.wrongWords[existingIndex];
    item.mistakeCount += 1;
    item.lastEncounteredAt = now;
    item.mastered = false;
  } else {
    data.wrongWords.push({
      id: term,
      term,
      definition,
      category,
      mistakeCount: 1,
      hintUsedCount: 0,
      lastEncounteredAt: now,
      mastered: false,
    });
  }

  saveUserSaveData(data);
}

/**
 * Records hint usage for a word
 */
export function recordWordHintUsed(term: string, definition: string, category: CategoryId): void {
  const data = loadUserSaveData();
  const existingIndex = data.wrongWords.findIndex((w) => w.term === term);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const item = data.wrongWords[existingIndex];
    item.hintUsedCount += 1;
    item.lastEncounteredAt = now;
  } else {
    data.wrongWords.push({
      id: term,
      term,
      definition,
      category,
      mistakeCount: 0,
      hintUsedCount: 1,
      lastEncounteredAt: now,
      mastered: false,
    });
  }

  saveUserSaveData(data);
}
