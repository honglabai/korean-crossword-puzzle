import { BoardData, CategoryId } from '../types/puzzle';
import { getDictionaryForCategory } from '../data/categoryRegistry';
import { generateCrosswordBoard } from '../utils/crosswordGenerator';
import { ALL_CATEGORIES, getKSTDateString } from './storageService';

/**
 * Returns integer seed from a date string "YYYY-MM-DD"
 */
export function getDateSeed(dateStr: string = getKSTDateString()): number {
  const clean = dateStr.replace(/-/g, '');
  return parseInt(clean, 10) || 20261118;
}

/**
 * Resolves the category of the day based on day offset
 */
export function getDailyCategory(dateStr: string = getKSTDateString()): CategoryId {
  const seed = getDateSeed(dateStr);
  const index = Math.abs(seed) % ALL_CATEGORIES.length;
  return ALL_CATEGORIES[index];
}

/**
 * Generates or retrieves the deterministic Daily Crossword board
 */
export function getDailyBoard(dateStr: string = getKSTDateString()): BoardData {
  const seed = getDateSeed(dateStr);
  const category = getDailyCategory(dateStr);
  const dictionary = getDictionaryForCategory(category);

  // Daily puzzle uses Level 3 (8x8 grid, 10 words - accessible yet challenging)
  const board = generateCrosswordBoard(dictionary, 3, 1, 8, 10, category, seed);
  if (board) {
    return {
      ...board,
      id: `daily_${dateStr}_${category.toLowerCase()}`,
      title: `오늘의 낱말퍼즐 (${dateStr})`,
    };
  }

  // Fallback board
  const fallback = generateCrosswordBoard(dictionary, 2, 1, 8, 8, category, seed + 1);
  return (
    fallback || {
      id: `daily_${dateStr}`,
      category,
      level: 3,
      boardNumber: 1,
      title: `오늘의 낱말퍼즐 (${dateStr})`,
      size: 8,
      grid: [],
      placedWords: [],
    }
  );
}

/**
 * Generates social share text for the completed daily puzzle
 */
export function formatDailyShareText(
  dateStr: string,
  elapsedSeconds: number,
  streakDays: number,
  categoryName: string
): string {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes}분 ` : ''}${seconds}초`;

  return `🧩 [지식 탐구 낱말퍼즐] 오늘의 낱말퍼즐 완료!
📅 ${dateStr} (${categoryName})
⏱️ 풀이 시간: ${timeFormatted}
🔥 연속 출석: ${streakDays}일차 달성!
✨ 8대 지식 영역 무료 십자말풀이에 도전해보세요:
https://crossword.honglabai.com`;
}
