import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadUserSaveData,
  saveUserSaveData,
  getKSTDateString,
  processDailyAttendance,
  isCategoryMasterEligible,
  saveActiveGame,
  getActiveGame,
  clearActiveGame,
  getMostRecentActiveGame,
  LEGACY_STORAGE_KEY,
} from '../services/storageService';
import { ActiveGameSession, CategoryProgress } from '../types/progress';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes default UserSaveData when localStorage is empty', () => {
    const data = loadUserSaveData();
    expect(data.schemaVersion).toBe(1);
    expect(data.hintBalance).toBe(3);
    expect(data.categoryProgress.POLITICS.currentLevel).toBe(1);
    expect(data.categoryProgress.KOREAN_HISTORY.currentLevel).toBe(1);
    expect(data.categoryProgress.POLITICS.maxUnlockedLevel).toBe(1);
    expect(data.achievements.length).toBeGreaterThan(0);
  });

  it('migrates legacy politics_crossword_progress_v5 cleanly', () => {
    const legacy = {
      selectedCategory: 'KOREAN_HISTORY',
      currentLevel: 4,
      clearCountInLevel: 2,
      levelClears: { 1: 3, 2: 3, 3: 3, 4: 2 },
      maxUnlockedLevel: 4,
      isTested: true,
      hintBalance: 7,
      boardRecords: [{ id: 'test-1', level: 1, boardNumber: 1, timeSeconds: 60, date: '2026-11-01', wordCount: 10 }],
      solvedWords: ['민주주의', '삼국사기'],
    };
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));
    localStorage.setItem('politics_crossword_nickname', '역사마스터');
    localStorage.setItem('politics_crossword_large_font', 'true');

    const migrated = loadUserSaveData();
    expect(migrated.nickname).toBe('역사마스터');
    expect(migrated.hintBalance).toBe(7);
    expect(migrated.settings.fontSize).toBe('large');
    expect(migrated.selectedCategory).toBe('KOREAN_HISTORY');
    expect(migrated.categoryProgress.KOREAN_HISTORY.currentLevel).toBe(4);
    expect(migrated.categoryProgress.KOREAN_HISTORY.clearCountInLevel).toBe(2);
    expect(migrated.categoryProgress.KOREAN_HISTORY.maxUnlockedLevel).toBe(4);
    expect(migrated.categoryProgress.POLITICS.currentLevel).toBe(1); // POLITICS remains independent
    expect(migrated.solvedWordTerms).toContain('삼국사기');
  });

  it('maintains independent category progress across 8 categories', () => {
    const data = loadUserSaveData();
    data.categoryProgress.POLITICS.currentLevel = 7;
    data.categoryProgress.POLITICS.maxUnlockedLevel = 7;
    data.categoryProgress.KOREAN_HISTORY.currentLevel = 2;
    data.categoryProgress.KOREAN_HISTORY.maxUnlockedLevel = 2;
    saveUserSaveData(data);

    const reloaded = loadUserSaveData();
    expect(reloaded.categoryProgress.POLITICS.currentLevel).toBe(7);
    expect(reloaded.categoryProgress.KOREAN_HISTORY.currentLevel).toBe(2);
    expect(reloaded.categoryProgress.SPORTS.currentLevel).toBe(1);
  });

  it('saves and resumes active games per category', () => {
    const session: ActiveGameSession = {
      category: 'WORLD_HISTORY',
      level: 3,
      boardNumber: 2,
      userGrid: [['가', '나'], ['', '다']],
      revealedChosungs: ['0,0'],
      elapsedSeconds: 45,
      selectedCell: { row: 0, col: 1 },
      activeWordId: 'w1',
      activeDirection: 'across',
      updatedAt: new Date().toISOString(),
    };

    saveActiveGame(session);
    const retrieved = getActiveGame('WORLD_HISTORY');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.level).toBe(3);
    expect(retrieved?.userGrid[0][0]).toBe('가');
    expect(retrieved?.elapsedSeconds).toBe(45);

    const mostRecent = getMostRecentActiveGame();
    expect(mostRecent?.category).toBe('WORLD_HISTORY');

    clearActiveGame('WORLD_HISTORY');
    expect(getActiveGame('WORLD_HISTORY')).toBeUndefined();
  });

  it('accurately verifies master certificate eligibility', () => {
    const notEligibleProgress: CategoryProgress = {
      currentLevel: 10,
      clearCountInLevel: 1,
      levelClears: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 1 },
      maxUnlockedLevel: 10,
      isTested: true,
      totalClearedBoards: 28,
    };
    const res1 = isCategoryMasterEligible('POLITICS', notEligibleProgress);
    expect(res1.eligible).toBe(false);
    expect(res1.clearedBoards).toBe(28);
    expect(res1.remainingBoards).toBe(2);

    const eligibleProgress: CategoryProgress = {
      currentLevel: 10,
      clearCountInLevel: 3,
      levelClears: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3 },
      maxUnlockedLevel: 10,
      isTested: true,
      totalClearedBoards: 30,
    };
    const res2 = isCategoryMasterEligible('POLITICS', eligibleProgress);
    expect(res2.eligible).toBe(true);
    expect(res2.remainingBoards).toBe(0);
  });

  it('correctly awards KST daily attendance bonus', () => {
    const data = loadUserSaveData();
    const todayKST = getKSTDateString();
    
    // Day 1
    const { data: updated1, awarded: awarded1 } = processDailyAttendance(data);
    expect(awarded1).toBe(true);
    expect(updated1.hintBalance).toBe(5); // initial 3 + 2
    expect(updated1.dailyChallenge.streakDays).toBe(1);
    expect(updated1.lastAttendanceDate).toBe(todayKST);

    // Same day retry should not award again
    const { awarded: awarded2 } = processDailyAttendance(updated1);
    expect(awarded2).toBe(false);
  });
});
