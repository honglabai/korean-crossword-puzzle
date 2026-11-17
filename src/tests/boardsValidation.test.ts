import { describe, it, expect } from 'vitest';
import { ALL_CATEGORIES } from '../services/storageService';
import { getBoardForCategoryAndLevel } from '../data/boardProvider';

describe('240 Prebuilt Boards Comprehensive Validation', () => {
  it('validates all 240 prebuilt boards across 8 categories, 10 levels, and 3 boards per level', () => {
    let validatedBoardCount = 0;
    let validatedWordCount = 0;

    for (const cat of ALL_CATEGORIES) {
      for (let lvl = 1; lvl <= 10; lvl++) {
        for (let bNum = 1; bNum <= 3; bNum++) {
          const board = getBoardForCategoryAndLevel(cat, lvl, bNum);

          expect(board).toBeDefined();
          expect(board.category).toBe(cat);
          expect(board.level).toBe(lvl);
          expect(board.boardNumber).toBe(bNum);
          expect(board.size).toBeGreaterThanOrEqual(8);
          expect(board.placedWords.length).toBeGreaterThanOrEqual(5);

          // Verify grid size matches
          expect(board.grid.length).toBe(board.size);
          expect(board.grid[0].length).toBe(board.size);

          // Verify each placed word
          for (const pw of board.placedWords) {
            expect(pw.term.length).toBeGreaterThanOrEqual(2);
            expect(pw.definition.length).toBeGreaterThan(0);

            // Boundary checks
            if (pw.direction === 'across') {
              expect(pw.startRow).toBeGreaterThanOrEqual(0);
              expect(pw.startRow).toBeLessThan(board.size);
              expect(pw.startCol).toBeGreaterThanOrEqual(0);
              expect(pw.startCol + pw.length).toBeLessThanOrEqual(board.size);
            } else {
              expect(pw.startCol).toBeGreaterThanOrEqual(0);
              expect(pw.startCol).toBeLessThan(board.size);
              expect(pw.startRow).toBeGreaterThanOrEqual(0);
              expect(pw.startRow + pw.length).toBeLessThanOrEqual(board.size);
            }

            // Grid cell matching check
            for (let i = 0; i < pw.length; i++) {
              const r = pw.direction === 'across' ? pw.startRow : pw.startRow + i;
              const c = pw.direction === 'across' ? pw.startCol + i : pw.startCol;
              const cell = board.grid[r][c];
              expect(cell.isActive).toBe(true);
              expect(cell.solutionChar).toBe(pw.term[i]);
            }

            validatedWordCount++;
          }

          validatedBoardCount++;
        }
      }
    }

    expect(validatedBoardCount).toBe(240);
    expect(validatedWordCount).toBeGreaterThan(2000);
  });
});
