import { WordItem, PlacedWord, CellData, BoardData, Direction, CategoryId } from '../types/puzzle';
import { toCircledNumber, getChosung } from './korean';
import { getCategoryMeta } from '../data/categoryRegistry';

interface CandidatePlacement {
  word: WordItem;
  direction: Direction;
  startRow: number;
  startCol: number;
  intersectRow: number;
  intersectCol: number;
}

/**
 * Returns target word count for a given level:
 * - 초급 (Lv.1 ~ 3): 10개
 * - 중급 (Lv.4 ~ 7): 15개
 * - 전문가 (Lv.8 ~ 10): 20개
 */
export function getWordCountForLevel(level: number): number {
  if (level <= 3) return 10;
  if (level <= 7) return 15;
  return 20;
}

/**
 * Returns grid size for a given level:
 * - 초급 (Lv.1 ~ 3): 8x8 (가로·세로 1칸 축소로 글자 및 터치 가독성 극대화)
 * - 중급 (Lv.4 ~ 7): 10x10
 * - 전문가 (Lv.8 ~ 10): 12x12
 */
export function getGridSizeForLevel(level: number): number {
  if (level <= 3) return 8;
  if (level <= 7) return 10;
  return 12;
}

/**
 * Builds a clean, fully initialized NxN grid data matrix
 */
export function createEmptyGrid(size: number = 9): CellData[][] {
  const grid: CellData[][] = [];
  for (let r = 0; r < size; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        row: r,
        col: c,
        isActive: false,
        solutionChar: '',
        userChar: '',
        wordIds: [],
      });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Validates whether placing `word` at `(startRow, startCol)` along `direction` is legal
 */
export function canPlaceWord(
  grid: (string | null)[][],
  size: number,
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
  isFirstWord: boolean = false
): boolean {
  const len = word.length;
  let hasIntersection = isFirstWord;

  // Check boundaries
  if (direction === 'across') {
    if (startRow < 0 || startRow >= size || startCol < 0 || startCol + len > size) return false;
    // Check cell before start and cell after end (must be empty)
    if (startCol - 1 >= 0 && grid[startRow][startCol - 1] !== null) return false;
    if (startCol + len < size && grid[startRow][startCol + len] !== null) return false;
  } else {
    if (startCol < 0 || startCol >= size || startRow < 0 || startRow + len > size) return false;
    if (startRow - 1 >= 0 && grid[startRow - 1][startCol] !== null) return false;
    if (startRow + len < size && grid[startRow + len][startCol] !== null) return false;
  }

  // Check each cell along the word path
  for (let i = 0; i < len; i++) {
    const r = direction === 'across' ? startRow : startRow + i;
    const c = direction === 'across' ? startCol + i : startCol;
    const existing = grid[r][c];

    if (existing !== null) {
      if (existing !== word[i]) {
        return false; // Character conflict!
      }
      hasIntersection = true;
    } else {
      // If cell is empty, check neighboring cells perpendicular to this word direction
      if (direction === 'across') {
        if (r - 1 >= 0 && grid[r - 1][c] !== null) return false;
        if (r + 1 < size && grid[r + 1][c] !== null) return false;
      } else {
        if (c - 1 >= 0 && grid[r][c - 1] !== null) return false;
        if (c + 1 < size && grid[r][c + 1] !== null) return false;
      }
    }
  }

  return hasIntersection;
}

/**
 * Automatically generates a crossword board from a given word pool.
 * Uses level-scaled word counts (10, 15, or 20) and grid sizes (9, 11, or 13).
 */
export function generateCrosswordBoard(
  pool: WordItem[],
  level: number,
  boardNumber: number = 1,
  gridSize?: number,
  targetCount?: number,
  category?: CategoryId
): BoardData | null {
  const catId = category || pool[0]?.category || 'POLITICS';
  const catMeta = getCategoryMeta(catId);

  const finalTargetCount = targetCount ?? getWordCountForLevel(level);
  const finalGridSize = gridSize ?? getGridSizeForLevel(level);

  const levelWords = pool.filter(w => w.level === level);
  const otherWords = pool.filter(w => w.level !== level);
  const prioritizedPool = [...levelWords, ...otherWords];

  const attempts = 80;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const shuffled = [...prioritizedPool].sort(() => Math.random() - 0.5);
    const charGrid: (string | null)[][] = Array.from({ length: finalGridSize }, () =>
      Array.from({ length: finalGridSize }, () => null)
    );

    const placedList: {
      word: WordItem;
      direction: Direction;
      startRow: number;
      startCol: number;
    }[] = [];

    // Pick a well-proportioned first word (length 3 to finalGridSize - 2)
    const firstCandidates = prioritizedPool.filter(
      w => w.term.length >= 3 && w.term.length <= finalGridSize - 2
    );
    const firstWord = firstCandidates[Math.floor(Math.random() * firstCandidates.length)] || shuffled[0];
    if (!firstWord) continue;

    const firstDir: Direction = Math.random() > 0.5 ? 'across' : 'down';
    const firstLen = firstWord.term.length;
    const centerRow = Math.floor((finalGridSize - (firstDir === 'down' ? firstLen : 1)) / 2);
    const centerCol = Math.floor((finalGridSize - (firstDir === 'across' ? firstLen : 1)) / 2);

    if (!canPlaceWord(charGrid, finalGridSize, firstWord.term, centerRow, centerCol, firstDir, true)) {
      continue;
    }

    // Place first word
    for (let i = 0; i < firstLen; i++) {
      const r = firstDir === 'across' ? centerRow : centerRow + i;
      const c = firstDir === 'across' ? centerCol + i : centerCol;
      charGrid[r][c] = firstWord.term[i];
    }
    placedList.push({
      word: firstWord,
      direction: firstDir,
      startRow: centerRow,
      startCol: centerCol,
    });

    const usedIds = new Set<string>([firstWord.id]);

    // Try to add more intersecting words
    let iterations = 0;
    while (placedList.length < finalTargetCount && iterations < 600) {
      iterations++;
      const candidates: CandidatePlacement[] = [];

      for (const candidateWord of prioritizedPool) {
        if (usedIds.has(candidateWord.id)) continue;

        for (const placed of placedList) {
          const nextDir: Direction = placed.direction === 'across' ? 'down' : 'across';

          for (let pi = 0; pi < placed.word.term.length; pi++) {
            const placedChar = placed.word.term[pi];
            const pr = placed.direction === 'across' ? placed.startRow : placed.startRow + pi;
            const pc = placed.direction === 'across' ? placed.startCol + pi : placed.startCol;

            for (let ci = 0; ci < candidateWord.term.length; ci++) {
              if (candidateWord.term[ci] === placedChar) {
                const targetStartRow = nextDir === 'across' ? pr : pr - ci;
                const targetStartCol = nextDir === 'across' ? pc - ci : pc;

                if (canPlaceWord(charGrid, finalGridSize, candidateWord.term, targetStartRow, targetStartCol, nextDir)) {
                  candidates.push({
                    word: candidateWord,
                    direction: nextDir,
                    startRow: targetStartRow,
                    startCol: targetStartCol,
                    intersectRow: pr,
                    intersectCol: pc,
                  });
                }
              }
            }
          }
        }
      }

      if (candidates.length === 0) {
        break;
      }

      // Pick one randomly from candidates
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      for (let i = 0; i < chosen.word.term.length; i++) {
        const r = chosen.direction === 'across' ? chosen.startRow : chosen.startRow + i;
        const c = chosen.direction === 'across' ? chosen.startCol + i : chosen.startCol;
        charGrid[r][c] = chosen.word.term[i];
      }
      placedList.push({
        word: chosen.word,
        direction: chosen.direction,
        startRow: chosen.startRow,
        startCol: chosen.startCol,
      });
      usedIds.add(chosen.word.id);
    }

    if (placedList.length >= finalTargetCount) {
      // Sort words by reading order (top-to-bottom, left-to-right)
      placedList.sort((a, b) => {
        if (a.startRow !== b.startRow) return a.startRow - b.startRow;
        return a.startCol - b.startCol;
      });

      // Assign numbers 1 to N
      const finalPlacedWords: PlacedWord[] = placedList.slice(0, finalTargetCount).map((item, idx) => {
        const num = idx + 1;
        return {
          id: item.word.id,
          number: num,
          term: item.word.term,
          definition: item.word.definition,
          direction: item.direction,
          startRow: item.startRow,
          startCol: item.startCol,
          length: item.word.term.length,
          clueNumberText: toCircledNumber(num),
        };
      });

      // Construct final grid
      const finalGrid = createEmptyGrid(finalGridSize);
      for (const pw of finalPlacedWords) {
        for (let i = 0; i < pw.length; i++) {
          const r = pw.direction === 'across' ? pw.startRow : pw.startRow + i;
          const c = pw.direction === 'across' ? pw.startCol + i : pw.startCol;
          const cell = finalGrid[r][c];
          cell.isActive = true;
          cell.solutionChar = pw.term[i];
          cell.chosungChar = getChosung(pw.term[i]);
          if (!cell.wordIds.includes(pw.id)) {
            cell.wordIds.push(pw.id);
          }
          if (i === 0) {
            cell.startNumber = pw.number;
            cell.startNumberText = pw.clueNumberText;
          }
        }
      }

      const tierTitle = level <= 3 ? '초급 (10단어)' : level <= 7 ? '중급 (15단어)' : '전문가 (20단어)';

      return {
        id: `board_${catId.toLowerCase()}_lv${level}_p${boardNumber}_${Date.now()}`,
        category: catId,
        level,
        boardNumber,
        title: `${catMeta.name}(${catMeta.fullName}) Lv.${level} - 제${boardNumber}판 [${tierTitle}]`,
        size: finalGridSize,
        grid: finalGrid,
        placedWords: finalPlacedWords,
      };
    }
  }

  return null;
}
