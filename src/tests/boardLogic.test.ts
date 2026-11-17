import { describe, it, expect } from 'vitest';
import { hydrateBoard } from '../data/boardProvider';
import { PlacedWord } from '../types/puzzle';

describe('Crossword Board Logic', () => {
  const mockPlacedWords: PlacedWord[] = [
    {
      id: 'w1',
      number: 1,
      term: '민주',
      definition: '국민 주권 정치',
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
      definition: '국가 최고 권력',
      direction: 'down',
      startRow: 0,
      startCol: 1,
      length: 2,
      clueNumberText: '②',
    },
  ];

  const mockBoard = hydrateBoard({
    id: 'test_board',
    category: 'POLITICS',
    level: 1,
    boardNumber: 1,
    title: '테스트 보드',
    size: 4,
    placedWords: mockPlacedWords,
  });

  it('determines whether a word is completed in userGrid', () => {
    const userGrid = Array.from({ length: 4 }, () => Array(4).fill(''));
    userGrid[0][0] = '민';
    userGrid[0][1] = '주';

    const w1 = mockBoard.placedWords[0];
    let isW1Complete = true;
    for (let i = 0; i < w1.length; i++) {
      const r = w1.direction === 'across' ? w1.startRow : w1.startRow + i;
      const c = w1.direction === 'across' ? w1.startCol + i : w1.startCol;
      if (userGrid[r][c] !== w1.term[i]) {
        isW1Complete = false;
        break;
      }
    }
    expect(isW1Complete).toBe(true);

    const w2 = mockBoard.placedWords[1];
    let isW2Complete = true;
    for (let i = 0; i < w2.length; i++) {
      const r = w2.direction === 'across' ? w2.startRow : w2.startRow + i;
      const c = w2.direction === 'across' ? w2.startCol + i : w2.startCol;
      if (userGrid[r][c] !== w2.term[i]) {
        isW2Complete = false;
        break;
      }
    }
    expect(isW2Complete).toBe(false); // only '주' is filled, '권' is not filled
  });
});
