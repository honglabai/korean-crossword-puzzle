import allPrebuiltBoardsJson from './allPrebuiltBoards.json';
import { BoardData, CategoryId } from '../types/puzzle';
import { getDictionaryForCategory } from './categoryRegistry';
import { generateCrosswordBoard, getWordCountForLevel, getGridSizeForLevel } from '../utils/crosswordGenerator';

type PrebuiltMap = Record<CategoryId, Record<number, BoardData[]>>;
const prebuiltBoards = allPrebuiltBoardsJson as unknown as PrebuiltMap;

/**
 * Returns a guaranteed crossword board for a given category, level, and boardNumber (1, 2, or 3)
 * Scaling:
 * - Lv.1~3: 10 words (9x9)
 * - Lv.4~7: 15 words (11x11)
 * - Lv.8~10: 20 words (13x13)
 */
export function getBoardForCategoryAndLevel(
  category: CategoryId,
  level: number,
  boardNumber: number = 1
): BoardData {
  const safeLevel = Math.max(1, Math.min(10, level));
  const safeBoardNum = Math.max(1, Math.min(3, boardNumber));

  const catBoards = prebuiltBoards[category];
  if (catBoards && catBoards[safeLevel] && catBoards[safeLevel].length >= safeBoardNum) {
    return JSON.parse(JSON.stringify(catBoards[safeLevel][safeBoardNum - 1]));
  }

  // Fallback: generate dynamically
  const words = getDictionaryForCategory(category);
  const targetCount = getWordCountForLevel(safeLevel);
  const gridSize = getGridSizeForLevel(safeLevel);
  const generated = generateCrosswordBoard(words, safeLevel, safeBoardNum, gridSize, targetCount, category);
  if (generated) return generated;

  // Ultimate fallback to first available board in that category or POLITICS
  if (catBoards && catBoards[1]?.[0]) {
    return JSON.parse(JSON.stringify(catBoards[1][0]));
  }
  return JSON.parse(JSON.stringify(prebuiltBoards.POLITICS[1][0]));
}

/**
 * Backwards compatible helper
 */
export function getBoardForLevel(level: number, boardNumber: number = 1, category: CategoryId = 'POLITICS'): BoardData {
  return getBoardForCategoryAndLevel(category, level, boardNumber);
}

/**
 * Dynamically generates a fresh, brand-new puzzle on demand for a category using level scaling
 */
export function generateFreshBoard(level: number, boardNumber: number = 1, category: CategoryId = 'POLITICS'): BoardData {
  const safeLevel = Math.max(1, Math.min(10, level));
  const targetCount = getWordCountForLevel(safeLevel);
  const gridSize = getGridSizeForLevel(safeLevel);
  const words = getDictionaryForCategory(category);

  const generated = generateCrosswordBoard(words, safeLevel, boardNumber, gridSize, targetCount, category);
  if (generated) {
    return generated;
  }
  return getBoardForCategoryAndLevel(category, safeLevel, boardNumber);
}
