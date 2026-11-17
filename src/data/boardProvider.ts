import { BoardData, CategoryId, PlacedWord } from '../types/puzzle';
import { getDictionaryForCategory } from './categoryRegistry';
import {
  generateCrosswordBoard,
  getWordCountForLevel,
  getGridSizeForLevel,
  buildBoardGrid,
} from '../utils/crosswordGenerator';

import politicsBoards from './boards/politics.json';
import societyBoards from './boards/society.json';
import cultureBoards from './boards/culture.json';
import sportsBoards from './boards/sports.json';
import koreanHistoryBoards from './boards/koreanHistory.json';
import worldHistoryBoards from './boards/worldHistory.json';
import musicBoards from './boards/music.json';
import artBoards from './boards/art.json';

export interface CompactBoardData {
  id: string;
  category: CategoryId;
  level: number;
  boardNumber: number;
  title: string;
  size: number;
  placedWords: PlacedWord[];
}

type CompactMap = Record<number, CompactBoardData[]>;

const categoryBoardsMap: Record<CategoryId, CompactMap> = {
  POLITICS: politicsBoards as unknown as CompactMap,
  SOCIETY: societyBoards as unknown as CompactMap,
  CULTURE: cultureBoards as unknown as CompactMap,
  SPORTS: sportsBoards as unknown as CompactMap,
  KOREAN_HISTORY: koreanHistoryBoards as unknown as CompactMap,
  WORLD_HISTORY: worldHistoryBoards as unknown as CompactMap,
  MUSIC: musicBoards as unknown as CompactMap,
  ART: artBoards as unknown as CompactMap,
};

/**
 * Hydrates a compact board into a full BoardData by generating its 2D grid
 */
export function hydrateBoard(compact: CompactBoardData): BoardData {
  return {
    id: compact.id,
    category: compact.category,
    level: compact.level,
    boardNumber: compact.boardNumber,
    title: compact.title,
    size: compact.size,
    placedWords: compact.placedWords,
    grid: buildBoardGrid(compact.size, compact.placedWords),
  };
}

/**
 * Returns a guaranteed crossword board for a given category, level, and boardNumber (1, 2, or 3)
 */
export function getBoardForCategoryAndLevel(
  category: CategoryId,
  level: number,
  boardNumber: number = 1
): BoardData {
  const safeLevel = Math.max(1, Math.min(10, level));
  const safeBoardNum = Math.max(1, Math.min(3, boardNumber));

  const catBoards = categoryBoardsMap[category];
  if (catBoards && catBoards[safeLevel] && catBoards[safeLevel].length >= safeBoardNum) {
    const compact = catBoards[safeLevel][safeBoardNum - 1];
    return hydrateBoard(compact);
  }

  // Fallback: generate dynamically
  const words = getDictionaryForCategory(category);
  const targetCount = getWordCountForLevel(safeLevel);
  const gridSize = getGridSizeForLevel(safeLevel);
  const generated = generateCrosswordBoard(words, safeLevel, safeBoardNum, gridSize, targetCount, category);
  if (generated) return generated;

  // Ultimate fallback to first available board in that category or POLITICS
  if (catBoards && catBoards[1]?.[0]) {
    return hydrateBoard(catBoards[1][0]);
  }
  return hydrateBoard(categoryBoardsMap.POLITICS[1][0]);
}

/**
 * Backwards compatible helper
 */
export function getBoardForLevel(
  level: number,
  boardNumber: number = 1,
  category: CategoryId = 'POLITICS'
): BoardData {
  return getBoardForCategoryAndLevel(category, level, boardNumber);
}

/**
 * Dynamically generates a fresh, brand-new puzzle on demand for a category using level scaling
 */
export function generateFreshBoard(
  level: number,
  boardNumber: number = 1,
  category: CategoryId = 'POLITICS'
): BoardData {
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
