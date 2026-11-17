import { describe, it, expect } from 'vitest';
import {
  buildBoardGrid,
  generateCrosswordBoard,
  getWordCountForLevel,
  getGridSizeForLevel,
} from '../utils/crosswordGenerator';
import { PlacedWord, WordItem } from '../types/puzzle';

describe('crosswordGenerator', () => {
  it('correctly builds 2D CellData grid from placedWords', () => {
    const placedWords: PlacedWord[] = [
      {
        id: 'w1',
        number: 1,
        term: '민주',
        definition: '국민이 주인인 정치',
        direction: 'across',
        startRow: 0,
        startCol: 0,
        length: 2,
        clueNumberText: '①',
      },
      {
        id: 'w2',
        number: 2,
        term: '주권',
        definition: '국가의 의사를 결정하는 최고 권력',
        direction: 'down',
        startRow: 0,
        startCol: 1,
        length: 2,
        clueNumberText: '②',
      },
    ];

    const grid = buildBoardGrid(8, placedWords);
    expect(grid.length).toBe(8);
    expect(grid[0].length).toBe(8);

    // Cell (0,0) - '민'
    expect(grid[0][0].isActive).toBe(true);
    expect(grid[0][0].solutionChar).toBe('민');
    expect(grid[0][0].chosungChar).toBe('ㅁ');
    expect(grid[0][0].startNumber).toBe(1);
    expect(grid[0][0].wordIds).toEqual(['w1']);

    // Cell (0,1) - intersection '주'
    expect(grid[0][1].isActive).toBe(true);
    expect(grid[0][1].solutionChar).toBe('주');
    expect(grid[0][1].chosungChar).toBe('ㅈ');
    expect(grid[0][1].wordIds).toContain('w1');
    expect(grid[0][1].wordIds).toContain('w2');

    // Cell (1,1) - '권'
    expect(grid[1][1].isActive).toBe(true);
    expect(grid[1][1].solutionChar).toBe('권');
    expect(grid[1][1].chosungChar).toBe('ㄱ');
    expect(grid[1][1].wordIds).toEqual(['w2']);

    // Cell (2,2) - inactive
    expect(grid[2][2].isActive).toBe(false);
    expect(grid[2][2].solutionChar).toBe('');
  });

  it('generates identical boards when using the same seed', () => {
    const sampleWords: WordItem[] = [
      { id: '1', level: 1, term: '헌법', definition: '국가의 기본법', category: 'POLITICS' },
      { id: '2', level: 1, term: '법원', definition: '사법부 기관', category: 'POLITICS' },
      { id: '3', level: 1, term: '원내', definition: '국회 안', category: 'POLITICS' },
      { id: '4', level: 1, term: '내각', definition: '행정부 조직', category: 'POLITICS' },
      { id: '5', level: 1, term: '국회', definition: '입법부', category: 'POLITICS' },
      { id: '6', level: 1, term: '회기', definition: '국회 활동 기간', category: 'POLITICS' },
      { id: '7', level: 1, term: '선거', definition: '투표로 대표 선출', category: 'POLITICS' },
    ];

    const boardA = generateCrosswordBoard(sampleWords, 1, 1, 8, 3, 'POLITICS', 12345);
    const boardB = generateCrosswordBoard(sampleWords, 1, 1, 8, 3, 'POLITICS', 12345);

    expect(boardA).not.toBeNull();
    expect(boardB).not.toBeNull();
    expect(boardA?.placedWords.map((w) => w.term)).toEqual(boardB?.placedWords.map((w) => w.term));
    expect(boardA?.placedWords[0].startRow).toBe(boardB?.placedWords[0].startRow);
  });

  it('scales word count and grid size appropriately per level tier', () => {
    expect(getWordCountForLevel(1)).toBe(10);
    expect(getWordCountForLevel(5)).toBe(15);
    expect(getWordCountForLevel(9)).toBe(20);

    expect(getGridSizeForLevel(1)).toBe(8);
    expect(getGridSizeForLevel(5)).toBe(10);
    expect(getGridSizeForLevel(9)).toBe(12);
  });
});
