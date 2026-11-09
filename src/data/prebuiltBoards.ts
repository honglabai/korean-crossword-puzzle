import { BoardData, PlacedWord, Direction } from '../types/puzzle';
import { createEmptyGrid } from '../utils/crosswordGenerator';
import { toCircledNumber, getChosung } from '../utils/korean';

interface RawPlacedWord {
  id: string;
  term: string;
  definition: string;
  direction: Direction;
  startRow: number;
  startCol: number;
}

function buildBoard(
  level: number,
  boardNumber: number,
  title: string,
  rawWords: RawPlacedWord[],
  size: number = 9
): BoardData {
  const grid = createEmptyGrid(size);

  // Sort words reading order (row ascending, col ascending)
  const sorted = [...rawWords].sort((a, b) => {
    if (a.startRow !== b.startRow) return a.startRow - b.startRow;
    return a.startCol - b.startCol;
  });

  const placedWords: PlacedWord[] = sorted.map((item, idx) => {
    const num = idx + 1;
    return {
      id: item.id,
      number: num,
      term: item.term,
      definition: item.definition,
      direction: item.direction,
      startRow: item.startRow,
      startCol: item.startCol,
      length: item.term.length,
      clueNumberText: toCircledNumber(num),
    };
  });

  for (const pw of placedWords) {
    for (let i = 0; i < pw.length; i++) {
      const r = pw.direction === 'across' ? pw.startRow : pw.startRow + i;
      const c = pw.direction === 'across' ? pw.startCol + i : pw.startCol;
      const cell = grid[r][c];

      // Validate intersection consistency
      if (cell.isActive && cell.solutionChar !== pw.term[i]) {
        console.error(`Conflict at (${r},${c}): existing '${cell.solutionChar}' vs new '${pw.term[i]}' in word ${pw.term}`);
      }

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

  return {
    id: `politics_lv${level}_board${boardNumber}`,
    level,
    boardNumber,
    title,
    size,
    grid,
    placedWords,
  };
}

// -------------------------------------------------------------
// LEVEL 1 BOARDS
// -------------------------------------------------------------
export const LV1_BOARDS: BoardData[] = [
  // Board 1: Basic Democracy Core Set (10 words)
  buildBoard(1, 1, '정치 Lv.1 제1판: 민주주의와 선거의 기본', [
    // 1. 민주주의: (0,0) across -> (0,0)민 (0,1)주 (0,2)주 (0,3)의
    { id: 'w1', term: '민주주의', definition: '국민이 권력을 가지고 스스로 다스리는 정치 체제.', direction: 'across', startRow: 0, startCol: 0 },
    // 2. 민주공화국: (0,0) down -> (0,0)민 (1,0)주 (2,0)공 (3,0)화 (4,0)국
    { id: 'w2', term: '민주공화국', definition: '주권이 국민에게 있고 공익을 추구하는 국가 형태.', direction: 'down', startRow: 0, startCol: 0 },
    // 3. 주의보: (0,3) down -> (0,3)의 (X) -> Let's use 의장: (0,3) down -> (0,3)의 (1,3)장
    { id: 'w3', term: '의장', definition: '국회 본회의나 회의를 소집하고 주재하는 최고 대표자.', direction: 'down', startRow: 0, startCol: 3 },
    // 4. 장관: (1,3) across -> (1,3)장 (1,4)관
    { id: 'w4', term: '장관', definition: '행정 각 부의 수반으로서 소관 부처 사무를 통괄하는 국무위원.', direction: 'across', startRow: 1, startCol: 3 },
    // 5. 공약: (2,0) across -> (2,0)공 (2,1)약
    { id: 'w5', term: '공약', definition: '입후보자나 정당이 유권자에게 제시하는 정책적 약속.', direction: 'across', startRow: 2, startCol: 0 },
    // 6. 국회의원: (4,0) across -> (4,0)국 (4,1)회 (4,2)의 (4,3)원
    { id: 'w6', term: '국회의원', definition: '국민의 대표로서 법률을 제정하고 국정을 심의하는 사람.', direction: 'across', startRow: 4, startCol: 0 },
    // 7. 의안: (4,2) down -> (4,2)의 (5,2)안
    { id: 'w7', term: '의안', definition: '국회나 위원회에서 심의·의결하기 위해 제출된 문서나 안건.', direction: 'down', startRow: 4, startCol: 2 },
    // 8. 원내대표: (4,3) down -> (4,3)원 (5,3)내 (6,3)대 (7,3)표
    { id: 'w8', term: '원내대표', definition: '국회 안에서 소속 정당을 대표하여 원내 전략을 총괄하는 의원.', direction: 'down', startRow: 4, startCol: 3 },
    // 9. 표결: (7,3) across -> (7,3)표 (7,4)결
    { id: 'w9', term: '표결', definition: '의회에서 어떤 안건에 대해 찬성·반대의 뜻을 표출하는 일.', direction: 'across', startRow: 7, startCol: 3 },
    // 10. 투표: (6,4) down -> (6,4)투 (7,4)결 (X) -> 투표: (7,2) across -> (7,2)투 (7,3)표 (overlap with 8 at (7,3)표!)
    { id: 'w10', term: '투표', definition: '선거 또는 표결에서 한 표를 행사하여 의사를 표현하는 행위.', direction: 'across', startRow: 7, startCol: 2 },
  ]),

  // Board 2: Constitution & Presidential Basics (10 words)
  buildBoard(1, 2, '정치 Lv.1 제2판: 헌법과 국가 원수', [
    // 1. 대통령: (1,1) across -> (1,1)대 (1,2)통 (1,3)령
    { id: 'b2_1', term: '대통령', definition: '국가를 대표하고 행정부의 수반이 되는 최고 지도자.', direction: 'across', startRow: 1, startCol: 1 },
    // 2. 대법관: (1,1) down -> (1,1)대 (2,1)법 (3,1)관
    { id: 'b2_2', term: '대법관', definition: '대법원에서 최종심 재판을 담당하는 최고 법관.', direction: 'down', startRow: 1, startCol: 1 },
    // 3. 법률: (2,1) across -> (2,1)법 (2,2)률
    { id: 'b2_3', term: '법률', definition: '국회의 의결을 거쳐 대통령이 공포하는 국가의 규범.', direction: 'across', startRow: 2, startCol: 1 },
    // 4. 통일: (1,2) down -> (1,2)통 (2,2)일 (X: (2,2) is 률. Let's place 헌법)
    // Let's refine Board 2 carefully:
    // (0,2) 헌법 (down): (0,2)헌 (1,2)법 (2,2)률 (X)
  ], 9),
];

// Let's create an exhaustive, perfectly validated board generator/registry for Lv 1 to Lv 10!
