import { useState, useCallback, useMemo } from 'react';
import { BoardData, CategoryId, Direction, PlacedWord } from '../types/puzzle';
import { getBoardForCategoryAndLevel } from '../data/boardProvider';
import { combineHangulInput, decompose, compose } from '../utils/hangul';
import { sounds } from '../utils/audio';

export interface UseGameStateProps {
  initialCategory: CategoryId;
  initialLevel: number;
  initialBoardNumber: number;
  onAutoSaveSession?: (session: {
    category: CategoryId;
    level: number;
    boardNumber: number;
    userGrid: string[][];
    revealedChosungs: string[];
    elapsedSeconds: number;
    selectedCell: { row: number; col: number } | null;
    activeWordId: string | null;
    activeDirection: 'across' | 'down';
  }) => void;
  onWordMistake?: (term: string, definition: string, category: CategoryId) => void;
  onBoardCompleted?: (timeSeconds: number, wordCount: number) => void;
}

export function useGameState({
  initialCategory,
  initialLevel,
  initialBoardNumber,
  onAutoSaveSession,
  onWordMistake,
  onBoardCompleted,
}: UseGameStateProps) {
  const [currentCategory, setCurrentCategory] = useState<CategoryId>(initialCategory);
  const [board, setBoard] = useState<BoardData>(() =>
    getBoardForCategoryAndLevel(initialCategory, initialLevel, initialBoardNumber)
  );

  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array.from({ length: board.size }, () => Array(board.size).fill(''))
  );

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(() => {
    if (board.placedWords.length > 0) {
      return { row: board.placedWords[0].startRow, col: board.placedWords[0].startCol };
    }
    return null;
  });

  const [activeDirection, setActiveDirection] = useState<Direction>('across');
  const [activeWordId, setActiveWordId] = useState<string | null>(() =>
    board.placedWords.length > 0 ? board.placedWords[0].id : null
  );

  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [revealedChosungs, setRevealedChosungs] = useState<Set<string>>(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Active word derived
  const activeWord = useMemo(() => {
    if (!activeWordId) return null;
    return board.placedWords.find((w) => w.id === activeWordId) || null;
  }, [board.placedWords, activeWordId]);

  // Completed words derived
  const completedWordIds = useMemo(() => {
    const completed = new Set<string>();
    for (const pw of board.placedWords) {
      let isWordComplete = true;
      for (let i = 0; i < pw.length; i++) {
        const r = pw.direction === 'across' ? pw.startRow : pw.startRow + i;
        const c = pw.direction === 'across' ? pw.startCol + i : pw.startCol;
        if (!userGrid[r] || userGrid[r][c] !== pw.term[i]) {
          isWordComplete = false;
          break;
        }
      }
      if (isWordComplete) {
        completed.add(pw.id);
      }
    }
    return completed;
  }, [board.placedWords, userGrid]);

  // Check overall board completion
  const checkCompletion = useCallback(
    (grid: string[][]) => {
      if (isCompleted || board.placedWords.length === 0) return;

      let allCorrect = true;
      for (let r = 0; r < board.size; r++) {
        for (let c = 0; c < board.size; c++) {
          const cell = board.grid[r]?.[c];
          if (cell && cell.isActive) {
            if (grid[r]?.[c] !== cell.solutionChar) {
              allCorrect = false;
              break;
            }
          }
        }
        if (!allCorrect) break;
      }

      if (allCorrect) {
        setIsCompleted(true);
        sounds.playLevelUp();
        if (onBoardCompleted) {
          onBoardCompleted(elapsedSeconds, board.placedWords.length);
        }
      }
    },
    [board, isCompleted, elapsedSeconds, onBoardCompleted]
  );

  // Trigger auto save
  const triggerAutoSave = useCallback(
    (nextGrid: string[][], nextChosungs: Set<string>, nextCell: { row: number; col: number } | null, nextWordId: string | null, nextDir: Direction) => {
      if (onAutoSaveSession && !isCompleted) {
        onAutoSaveSession({
          category: currentCategory,
          level: board.level,
          boardNumber: board.boardNumber,
          userGrid: nextGrid,
          revealedChosungs: Array.from(nextChosungs),
          elapsedSeconds,
          selectedCell: nextCell,
          activeWordId: nextWordId,
          activeDirection: nextDir,
        });
      }
    },
    [onAutoSaveSession, isCompleted, currentCategory, board.level, board.boardNumber, elapsedSeconds]
  );

  // Load a board directly
  const loadBoard = useCallback(
    (lvl: number, bNum: number, cat?: CategoryId) => {
      const targetCat = cat || currentCategory;
      setCurrentCategory(targetCat);
      const newBoard = getBoardForCategoryAndLevel(targetCat, lvl, bNum);
      setBoard(newBoard);
      const emptyGrid = Array.from({ length: newBoard.size }, () => Array(newBoard.size).fill(''));
      setUserGrid(emptyGrid);
      setWrongCells(new Set());
      setRevealedChosungs(new Set());
      setElapsedSeconds(0);
      setIsCompleted(false);

      if (newBoard.placedWords.length > 0) {
        const first = newBoard.placedWords[0];
        setActiveWordId(first.id);
        setActiveDirection(first.direction);
        setSelectedCell({ row: first.startRow, col: first.startCol });
      }
    },
    [currentCategory]
  );

  // Resume or load a custom board with saved state
  const loadCustomBoard = useCallback(
    (
      newBoard: BoardData,
      initialGrid?: string[][],
      initialChosungs?: string[],
      initialElapsed?: number,
      initialCell?: { row: number; col: number } | null,
      initialWordId?: string | null,
      initialDir?: Direction
    ) => {
      setBoard(newBoard);
      if (newBoard.category) setCurrentCategory(newBoard.category);

      const gridToUse = initialGrid || Array.from({ length: newBoard.size }, () => Array(newBoard.size).fill(''));
      setUserGrid(gridToUse);
      setWrongCells(new Set());
      setRevealedChosungs(new Set(initialChosungs || []));
      setElapsedSeconds(initialElapsed || 0);
      setIsCompleted(false);

      const targetWordId = initialWordId || (newBoard.placedWords[0]?.id ?? null);
      const targetDir = initialDir || (newBoard.placedWords[0]?.direction ?? 'across');
      const targetCell = initialCell || (newBoard.placedWords[0] ? { row: newBoard.placedWords[0].startRow, col: newBoard.placedWords[0].startCol } : null);

      setActiveWordId(targetWordId);
      setActiveDirection(targetDir);
      setSelectedCell(targetCell);
    },
    []
  );

  // Handle cell click
  const handleCellClick = useCallback(
    (r: number, c: number) => {
      const cell = board.grid[r]?.[c];
      if (!cell || !cell.isActive) return;

      const wordsAtCell = board.placedWords.filter((pw) => {
        if (pw.direction === 'across') {
          return pw.startRow === r && c >= pw.startCol && c < pw.startCol + pw.length;
        } else {
          return pw.startCol === c && r >= pw.startRow && r < pw.startRow + pw.length;
        }
      });

      if (wordsAtCell.length === 0) return;

      // If clicking same cell, toggle direction if intersection
      if (selectedCell?.row === r && selectedCell?.col === c) {
        if (wordsAtCell.length > 1) {
          const nextWord = wordsAtCell.find((w) => w.direction !== activeDirection) || wordsAtCell[0];
          setActiveDirection(nextWord.direction);
          setActiveWordId(nextWord.id);
          triggerAutoSave(userGrid, revealedChosungs, selectedCell, nextWord.id, nextWord.direction);
        }
        return;
      }

      const isCellInCurrentWord = activeWord && wordsAtCell.some((w) => w.id === activeWord.id);
      setSelectedCell({ row: r, col: c });

      if (isCellInCurrentWord && wordsAtCell.length > 1) {
        const otherWord = wordsAtCell.find((w) => w.direction !== activeDirection);
        if (otherWord) {
          setActiveDirection(otherWord.direction);
          setActiveWordId(otherWord.id);
          triggerAutoSave(userGrid, revealedChosungs, { row: r, col: c }, otherWord.id, otherWord.direction);
          return;
        }
      }

      const matchingWord = wordsAtCell.find((w) => w.direction === activeDirection) || wordsAtCell[0];
      if (matchingWord) {
        setActiveDirection(matchingWord.direction);
        setActiveWordId(matchingWord.id);
        triggerAutoSave(userGrid, revealedChosungs, { row: r, col: c }, matchingWord.id, matchingWord.direction);
      }
    },
    [board, selectedCell, activeDirection, activeWord, userGrid, revealedChosungs, triggerAutoSave]
  );

  // Toggle direction explicitly
  const handleToggleDirection = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const wordsAtCell = board.placedWords.filter((pw) => {
      if (pw.direction === 'across') {
        return pw.startRow === row && col >= pw.startCol && col < pw.startCol + pw.length;
      } else {
        return pw.startCol === col && row >= pw.startRow && row < pw.startRow + pw.length;
      }
    });

    if (wordsAtCell.length > 1) {
      const nextWord = wordsAtCell.find((w) => w.direction !== activeDirection) || wordsAtCell[0];
      setActiveDirection(nextWord.direction);
      setActiveWordId(nextWord.id);
    } else if (activeWord) {
      const targetDir: Direction = activeDirection === 'across' ? 'down' : 'across';
      let foundWord: PlacedWord | null = null;
      let targetPos: { row: number; col: number } | null = null;

      for (let i = 0; i < activeWord.length; i++) {
        const wr = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
        const wc = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
        const cross = board.placedWords.find((pw) => {
          if (pw.direction !== targetDir) return false;
          if (pw.direction === 'across') {
            return pw.startRow === wr && wc >= pw.startCol && wc < pw.startCol + pw.length;
          } else {
            return pw.startCol === wc && wr >= pw.startRow && wr < pw.startRow + pw.length;
          }
        });
        if (cross) {
          foundWord = cross;
          targetPos = { row: wr, col: wc };
          if ((activeWord.direction === 'across' && wc >= col) || (activeWord.direction === 'down' && wr >= row)) {
            break;
          }
        }
      }

      if (foundWord && targetPos) {
        setSelectedCell(targetPos);
        setActiveDirection(foundWord.direction);
        setActiveWordId(foundWord.id);
      }
    }
  }, [selectedCell, board.placedWords, activeDirection, activeWord]);

  // Select word from clue list
  const handleSelectWord = useCallback(
    (word: PlacedWord) => {
      setActiveWordId(word.id);
      setActiveDirection(word.direction);
      let targetCell = { row: word.startRow, col: word.startCol };

      for (let i = 0; i < word.length; i++) {
        const r = word.direction === 'across' ? word.startRow : word.startRow + i;
        const c = word.direction === 'across' ? word.startCol + i : word.startCol;
        if (!userGrid[r][c]) {
          targetCell = { row: r, col: c };
          break;
        }
      }
      setSelectedCell(targetCell);
    },
    [userGrid]
  );

  // Apply cell value with forward progression
  const applyCellChar = useCallback(
    (r: number, c: number, char: string) => {
      const newGrid = userGrid.map((rowArr) => [...rowArr]);
      newGrid[r][c] = char;
      setUserGrid(newGrid);

      // Clear wrong indicator for this cell if any
      const cellKey = `${r},${c}`;
      if (wrongCells.has(cellKey)) {
        setWrongCells((prev) => {
          const next = new Set(prev);
          next.delete(cellKey);
          return next;
        });
      }

      // Check word completion & record mistake if wrong
      const cell = board.grid[r]?.[c];
      if (char && cell && cell.solutionChar && char !== cell.solutionChar) {
        if (activeWord && onWordMistake) {
          onWordMistake(activeWord.term, activeWord.definition, currentCategory);
        }
      }

      // Move to next cell in active word if char entered
      let nextPos = selectedCell;
      if (char && activeWord) {
        const currIdx =
          activeWord.direction === 'across' ? c - activeWord.startCol : r - activeWord.startRow;
        if (currIdx >= 0 && currIdx < activeWord.length - 1) {
          const nextR =
            activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx + 1;
          const nextC =
            activeWord.direction === 'across' ? activeWord.startCol + currIdx + 1 : activeWord.startCol;
          nextPos = { row: nextR, col: nextC };
          setSelectedCell(nextPos);
        }
      }

      triggerAutoSave(newGrid, revealedChosungs, nextPos, activeWordId, activeDirection);
      checkCompletion(newGrid);
    },
    [
      userGrid,
      wrongCells,
      board.grid,
      activeWord,
      onWordMistake,
      currentCategory,
      selectedCell,
      triggerAutoSave,
      revealedChosungs,
      activeWordId,
      activeDirection,
      checkCompletion,
    ]
  );

  // Virtual Hangul Keypad handler
  const handleVirtualKey = useCallback(
    (jamo: string) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      const currentVal = userGrid[row]?.[col] || '';
      const sol = board.grid[row]?.[col]?.solutionChar || '';

      const { currentCell, nextCell } = combineHangulInput(currentVal, jamo, sol);

      const newGrid = userGrid.map((rowArr) => [...rowArr]);
      newGrid[row][col] = currentCell;

      let nextPos = selectedCell;
      if (nextCell && activeWord) {
        const currIdx =
          activeWord.direction === 'across' ? col - activeWord.startCol : row - activeWord.startRow;
        if (currIdx >= 0 && currIdx < activeWord.length - 1) {
          const nextR =
            activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx + 1;
          const nextC =
            activeWord.direction === 'across' ? activeWord.startCol + currIdx + 1 : activeWord.startCol;
          newGrid[nextR][nextC] = nextCell;
          nextPos = { row: nextR, col: nextC };
          setSelectedCell(nextPos);
        }
      }

      setUserGrid(newGrid);
      triggerAutoSave(newGrid, revealedChosungs, nextPos, activeWordId, activeDirection);
      checkCompletion(newGrid);
    },
    [selectedCell, userGrid, board.grid, activeWord, triggerAutoSave, revealedChosungs, activeWordId, activeDirection, checkCompletion]
  );

  // Backspace handler
  const handleBackspace = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const currentVal = userGrid[row]?.[col] || '';

    if (currentVal.length > 0) {
      const decomp = decompose(currentVal);
      if (decomp) {
        if (decomp.jong) {
          applyCellChar(row, col, compose(decomp.cho, decomp.jung));
        } else if (decomp.jung) {
          applyCellChar(row, col, decomp.cho);
        } else {
          applyCellChar(row, col, '');
        }
      } else {
        applyCellChar(row, col, '');
      }
    } else if (activeWord) {
      // Step backward in word
      const currIdx =
        activeWord.direction === 'across' ? col - activeWord.startCol : row - activeWord.startRow;
      if (currIdx > 0) {
        const prevR =
          activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx - 1;
        const prevC =
          activeWord.direction === 'across' ? activeWord.startCol + currIdx - 1 : activeWord.startCol;
        setSelectedCell({ row: prevR, col: prevC });
      }
    }
  }, [selectedCell, userGrid, activeWord, applyCellChar]);

  // Direct cell change (physical keyboard or IME input)
  const handleCellChange = useCallback(
    (r: number, c: number, val: string) => {
      const trimmed = val.slice(-1);
      applyCellChar(r, c, trimmed);
    },
    [applyCellChar]
  );

  // Apply chosung hint
  const handleApplyChosung = useCallback(
    (r: number, c: number) => {
      const key = `${r},${c}`;
      setRevealedChosungs((prev) => {
        const next = new Set(prev);
        next.add(key);
        triggerAutoSave(userGrid, next, selectedCell, activeWordId, activeDirection);
        return next;
      });
    },
    [triggerAutoSave, userGrid, selectedCell, activeWordId, activeDirection]
  );

  // Check answers
  const handleCheckAnswers = useCallback(() => {
    const wrong = new Set<string>();
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        const cell = board.grid[r]?.[c];
        if (cell && cell.isActive && userGrid[r]?.[c]) {
          if (userGrid[r][c] !== cell.solutionChar) {
            wrong.add(`${r},${c}`);
          }
        }
      }
    }
    setWrongCells(wrong);
    return wrong.size;
  }, [board, userGrid]);

  // Reset board
  const handleResetBoard = useCallback(() => {
    const emptyGrid = Array.from({ length: board.size }, () => Array(board.size).fill(''));
    setUserGrid(emptyGrid);
    setWrongCells(new Set());
    setRevealedChosungs(new Set());
    setElapsedSeconds(0);
    setIsCompleted(false);
  }, [board.size]);

  return {
    board,
    userGrid,
    selectedCell,
    activeDirection,
    activeWordId,
    activeWord,
    wrongCells,
    revealedChosungs,
    elapsedSeconds,
    setElapsedSeconds,
    completedWordIds,
    isCompleted,
    currentCategory,
    loadBoard,
    loadCustomBoard,
    handleCellClick,
    handleToggleDirection,
    handleSelectWord,
    handleVirtualKey,
    handleBackspace,
    handleCellChange,
    handleApplyChosung,
    handleCheckAnswers,
    handleResetBoard,
    setSelectedCell,
  };
}
