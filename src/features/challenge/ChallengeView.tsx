import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BoardData, Direction, PlacedWord, CategoryId } from '../../types/puzzle';
import { ThemeId, THEMES, getDefaultThemeForLevel } from '../../types/theme';
import { getCategoryMeta } from '../../data/categoryRegistry';
import { getBoardForCategoryAndLevel, generateFreshBoard } from '../../data/boardProvider';
import { sounds } from '../../utils/audio';
import { combineHangulInput, decompose, compose } from '../../utils/hangul';
import { CategoryLevelBar } from '../../components/CategoryLevelBar';
import { CategorySelectorModal } from '../../components/CategorySelectorModal';
import { CrosswordBoard } from '../../components/CrosswordBoard';
import { ActiveClueCard } from '../../components/ActiveClueCard';
import { CluesList } from '../../components/CluesList';
import { GameControls } from '../../components/GameControls';
import { VirtualHangulKeypad } from '../../components/VirtualHangulKeypad';
import { ChosungHintModal } from '../../components/ChosungHintModal';
import { RewardedAdModal } from '../../components/RewardedAdModal';
import { PoliticsPlacementTest } from '../../components/PoliticsPlacementTest';
import { LevelUpModal } from '../../components/LevelUpModal';
import { PuzzleStageKnowledgeGuide } from '../../components/PuzzleStageKnowledgeGuide';
import {
  saveActiveGame,
  clearActiveGame,
  recordWordMistake,
  recordWordHintUsed,
  getKSTDateString,
} from '../../services/storageService';
import { UserSaveData, FontSizeSetting, ActiveGameSession } from '../../types/progress';

export interface ChallengeViewProps {
  saveData: UserSaveData;
  selectedCategory: CategoryId;
  onUpdateSaveData: (updater: (prev: UserSaveData) => UserSaveData) => void;
  onSelectCategory: (cat: CategoryId) => void;
  onOpenCertificate: (cat: CategoryId) => void;
  fontSize: FontSizeSetting;
  userThemeId: ThemeId;
  customDailyBoard?: BoardData | null;
  onClearCustomDailyBoard?: () => void;
  onTimerTick?: (elapsed: number, isRunning: boolean) => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  saveData,
  selectedCategory,
  onUpdateSaveData,
  onSelectCategory,
  onOpenCertificate,
  fontSize,
  userThemeId,
  customDailyBoard,
  onClearCustomDailyBoard,
  onTimerTick,
}) => {
  const currentCatProgress = saveData.categoryProgress[selectedCategory] || {
    currentLevel: 1,
    maxUnlockedLevel: 1,
    levelClears: {},
    totalClearedBoards: 0,
    isMasterCompleted: false,
  };

  const currentLevel = currentCatProgress.currentLevel || 1;
  const clearCountInLevel = currentCatProgress.levelClears[currentLevel] || 0;
  const levelClears = currentCatProgress.levelClears;
  const maxUnlockedLevel = currentCatProgress.maxUnlockedLevel;
  const hintBalance = saveData.hintBalance;
  const currentBoardNumber = Math.min(3, (clearCountInLevel % 3) + 1);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);
  const [isChosungModalOpen, setIsChosungModalOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{
    isOpen: boolean;
    type: 'board_cleared' | 'level_cleared' | 'master_cleared';
    clearedBoardNumber: number;
    clearTimeSeconds?: number;
  }>({
    isOpen: false,
    type: 'board_cleared',
    clearedBoardNumber: 1,
  });

  const isDailyChallengeActive = Boolean(customDailyBoard);

  // Board initialization
  const [board, setBoard] = useState<BoardData>(() => {
    if (customDailyBoard) return customDailyBoard;
    const activeSession = saveData.activeGames[selectedCategory];
    if (activeSession && activeSession.level && activeSession.boardNumber) {
      return getBoardForCategoryAndLevel(selectedCategory, activeSession.level, activeSession.boardNumber);
    }
    return getBoardForCategoryAndLevel(selectedCategory, currentLevel, currentBoardNumber);
  });

  // User input grid
  const [userGrid, setUserGrid] = useState<string[][]>(() => {
    if (!customDailyBoard) {
      const activeSession = saveData.activeGames[selectedCategory];
      if (activeSession && activeSession.userGrid) {
        return activeSession.userGrid;
      }
    }
    return Array.from({ length: board.size || 8 }, () => Array(board.size || 8).fill(''));
  });

  // Cell selection & Direction
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(() => {
    if (!customDailyBoard) {
      const activeSession = saveData.activeGames[selectedCategory];
      if (activeSession && activeSession.selectedCell) {
        return activeSession.selectedCell;
      }
    }
    if (board.placedWords.length > 0) {
      return { row: board.placedWords[0].startRow, col: board.placedWords[0].startCol };
    }
    return null;
  });

  const [activeDirection, setActiveDirection] = useState<Direction>(() => {
    if (!customDailyBoard) {
      const activeSession = saveData.activeGames[selectedCategory];
      return activeSession?.activeDirection || 'across';
    }
    return 'across';
  });

  const [activeWordId, setActiveWordId] = useState<string | null>(() => {
    if (!customDailyBoard) {
      const activeSession = saveData.activeGames[selectedCategory];
      return activeSession?.activeWordId || (board.placedWords.length > 0 ? board.placedWords[0].id : null);
    }
    return board.placedWords.length > 0 ? board.placedWords[0].id : null;
  });

  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [revealedChosungs, setRevealedChosungs] = useState<Set<string>>(() => {
    if (!customDailyBoard) {
      const activeSession = saveData.activeGames[selectedCategory];
      return new Set(activeSession?.revealedChosungs || []);
    }
    return new Set();
  });

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (!customDailyBoard) {
      const activeSession = saveData.activeGames[selectedCategory];
      return activeSession?.elapsedSeconds || 0;
    }
    return 0;
  });

  // Theme
  const levelThemeId = useMemo(() => getDefaultThemeForLevel(currentLevel), [currentLevel]);
  const currentTheme =
    THEMES[userThemeId as ThemeId] ||
    (userThemeId === ('classic-blue' as any) ? THEMES.classic : undefined) ||
    THEMES[levelThemeId] ||
    THEMES.classic;

  // Active word reference
  const activeWord = useMemo(() => {
    if (!activeWordId) return null;
    return board.placedWords.find((w) => w.id === activeWordId) || null;
  }, [board.placedWords, activeWordId]);

  // Derived Completed Words
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

  // Save active game session automatically
  const persistActiveSession = useCallback(
    (grid: string[][], chosungs: Set<string>, cell: { row: number; col: number } | null, wordId: string | null, dir: Direction) => {
      if (isDailyChallengeActive) return;

      const session: ActiveGameSession = {
        category: selectedCategory,
        level: board.level,
        boardNumber: board.boardNumber,
        userGrid: grid,
        revealedChosungs: Array.from(chosungs),
        elapsedSeconds,
        selectedCell: cell,
        activeWordId: wordId,
        activeDirection: dir,
        updatedAt: new Date().toISOString(),
      };

      saveActiveGame(session);
    },
    [isDailyChallengeActive, selectedCategory, board.level, board.boardNumber, elapsedSeconds]
  );

  // Timer Tick
  useEffect(() => {
    const isModalActive =
      isPlacementTestOpen ||
      isChosungModalOpen ||
      isAdModalOpen ||
      levelUpModal.isOpen;

    if (isModalActive) {
      if (onTimerTick) onTimerTick(elapsedSeconds, false);
      return;
    }

    if (onTimerTick) onTimerTick(elapsedSeconds, true);
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (onTimerTick) onTimerTick(next, true);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isPlacementTestOpen,
    isChosungModalOpen,
    isAdModalOpen,
    levelUpModal.isOpen,
    elapsedSeconds,
    onTimerTick,
  ]);

  // Load board helper
  const loadBoard = useCallback(
    (lvl: number, bNum: number, cat?: CategoryId) => {
      const targetCat = cat || selectedCategory;
      const newBoard = getBoardForCategoryAndLevel(targetCat, lvl, bNum);
      setBoard(newBoard);
      const emptyGrid = Array.from({ length: newBoard.size || 8 }, () => Array(newBoard.size || 8).fill(''));
      setUserGrid(emptyGrid);
      setWrongCells(new Set());
      setRevealedChosungs(new Set());
      setElapsedSeconds(0);

      if (newBoard.placedWords.length > 0) {
        const first = newBoard.placedWords[0];
        setActiveWordId(first.id);
        setActiveDirection(first.direction);
        setSelectedCell({ row: first.startRow, col: first.startCol });
      } else {
        setActiveWordId(null);
        setSelectedCell(null);
      }

      clearActiveGame(targetCat);
    },
    [selectedCategory]
  );

  // Sync when selectedCategory or customDailyBoard changes externally
  useEffect(() => {
    if (customDailyBoard) {
      setBoard(customDailyBoard);
      setUserGrid(Array.from({ length: customDailyBoard.size || 8 }, () => Array(customDailyBoard.size || 8).fill('')));
      setWrongCells(new Set());
      setRevealedChosungs(new Set());
      setElapsedSeconds(0);
      if (customDailyBoard.placedWords.length > 0) {
        const first = customDailyBoard.placedWords[0];
        setActiveWordId(first.id);
        setActiveDirection(first.direction);
        setSelectedCell({ row: first.startRow, col: first.startCol });
      }
      return;
    }

    const activeSession = saveData.activeGames[selectedCategory];
    if (activeSession && activeSession.level && activeSession.boardNumber) {
      const activeBoard = getBoardForCategoryAndLevel(selectedCategory, activeSession.level, activeSession.boardNumber);
      setBoard(activeBoard);
      setUserGrid(activeSession.userGrid || Array.from({ length: activeBoard.size }, () => Array(activeBoard.size).fill('')));
      setSelectedCell(activeSession.selectedCell || (activeBoard.placedWords[0] ? { row: activeBoard.placedWords[0].startRow, col: activeBoard.placedWords[0].startCol } : null));
      setActiveDirection(activeSession.activeDirection || 'across');
      setActiveWordId(activeSession.activeWordId || (activeBoard.placedWords[0]?.id ?? null));
      setRevealedChosungs(new Set(activeSession.revealedChosungs || []));
      setElapsedSeconds(activeSession.elapsedSeconds || 0);
      setWrongCells(new Set());
    } else {
      loadBoard(currentLevel, currentBoardNumber, selectedCategory);
    }
  }, [selectedCategory, customDailyBoard]);

  // Word selection
  const handleSelectWord = useCallback(
    (word: PlacedWord) => {
      sounds.playKey();
      setActiveWordId(word.id);
      setActiveDirection(word.direction);
      setSelectedCell({ row: word.startRow, col: word.startCol });
      persistActiveSession(userGrid, revealedChosungs, { row: word.startRow, col: word.startCol }, word.id, word.direction);
    },
    [userGrid, revealedChosungs, persistActiveSession]
  );

  // Direction toggle
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
      sounds.playKey();
      const other = wordsAtCell.find((w) => w.direction !== activeDirection) || wordsAtCell[0];
      setActiveDirection(other.direction);
      setActiveWordId(other.id);
      persistActiveSession(userGrid, revealedChosungs, selectedCell, other.id, other.direction);
    }
  }, [selectedCell, board.placedWords, activeDirection, userGrid, revealedChosungs, persistActiveSession]);

  // Cell click
  const handleCellClick = useCallback(
    (r: number, c: number) => {
      const cell = board.grid[r]?.[c];
      if (!cell || !cell.isActive) return;

      sounds.playKey();

      const wordsAtCell = board.placedWords.filter((pw) => {
        if (pw.direction === 'across') {
          return pw.startRow === r && c >= pw.startCol && c < pw.startCol + pw.length;
        } else {
          return pw.startCol === c && r >= pw.startRow && r < pw.startRow + pw.length;
        }
      });

      if (wordsAtCell.length === 0) return;

      if (selectedCell?.row === r && selectedCell?.col === c) {
        if (wordsAtCell.length > 1) {
          const nextWord = wordsAtCell.find((w) => w.direction !== activeDirection) || wordsAtCell[0];
          setActiveDirection(nextWord.direction);
          setActiveWordId(nextWord.id);
          persistActiveSession(userGrid, revealedChosungs, selectedCell, nextWord.id, nextWord.direction);
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
          persistActiveSession(userGrid, revealedChosungs, { row: r, col: c }, otherWord.id, otherWord.direction);
          return;
        }
      }

      const matchingWord = wordsAtCell.find((w) => w.direction === activeDirection) || wordsAtCell[0];
      if (matchingWord) {
        setActiveDirection(matchingWord.direction);
        setActiveWordId(matchingWord.id);
        persistActiveSession(userGrid, revealedChosungs, { row: r, col: c }, matchingWord.id, matchingWord.direction);
      }
    },
    [board, selectedCell, activeDirection, activeWord, userGrid, revealedChosungs, persistActiveSession]
  );

  // Check completion
  const checkCompletion = useCallback(
    (grid: string[][]) => {
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

      if (!allCorrect) return;

      sounds.playVictory();
      import('canvas-confetti').then((m) => {
        m.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }).catch(() => {});

      // Daily Challenge Completion
      if (isDailyChallengeActive) {
        const todayKST = getKSTDateString();
        onUpdateSaveData((prev) => {
          const updatedDaily = {
            ...prev.dailyChallenge,
            completedDates: Array.from(new Set([...prev.dailyChallenge.completedDates, todayKST])),
            todayResult: {
              date: todayKST,
              completed: true,
              elapsedSeconds,
              wordCount: board.placedWords.length,
            },
          };
          return {
            ...prev,
            hintBalance: prev.hintBalance + 3,
            dailyChallenge: updatedDaily,
          };
        });

        setLevelUpModal({
          isOpen: true,
          type: 'board_cleared',
          clearedBoardNumber: 1,
          clearTimeSeconds: elapsedSeconds,
        });

        if (onClearCustomDailyBoard) onClearCustomDailyBoard();
        return;
      }

      // Standard Challenge Board Completion
      clearActiveGame(selectedCategory);

      const wordsSolved = board.placedWords.map((pw) => pw.term);
      const isBoardAlreadyCleared = (clearCountInLevel >= board.boardNumber);

      onUpdateSaveData((prev) => {
        const catProg = prev.categoryProgress[selectedCategory] || {
          currentLevel: 1,
          maxUnlockedLevel: 1,
          levelClears: {},
          totalClearedBoards: 0,
          isMasterCompleted: false,
        };

        const currentLvlClears = catProg.levelClears[board.level] || 0;
        const newClearsInLvl = Math.max(currentLvlClears, board.boardNumber);
        const nextTotalBoards = isBoardAlreadyCleared ? catProg.totalClearedBoards : catProg.totalClearedBoards + 1;
        const nextMaxLvl = newClearsInLvl >= 3 ? Math.max(catProg.maxUnlockedLevel, Math.min(10, board.level + 1)) : catProg.maxUnlockedLevel;

        const updatedCatProgress = {
          ...catProg,
          levelClears: {
            ...catProg.levelClears,
            [board.level]: newClearsInLvl,
          },
          totalClearedBoards: nextTotalBoards,
          maxUnlockedLevel: nextMaxLvl,
          isMasterCompleted: nextTotalBoards >= 30,
        };

        const newRecords = [
          ...prev.records,
          {
            id: `rec_${Date.now()}`,
            category: selectedCategory,
            level: board.level,
            boardNumber: board.boardNumber,
            date: new Date().toISOString(),
            timeSeconds: elapsedSeconds,
            wordCount: board.placedWords.length,
          },
        ];

        return {
          ...prev,
          hintBalance: isBoardAlreadyCleared ? prev.hintBalance : prev.hintBalance + 2,
          solvedWordTerms: Array.from(new Set([...prev.solvedWordTerms, ...wordsSolved])),
          categoryProgress: {
            ...prev.categoryProgress,
            [selectedCategory]: updatedCatProgress,
          },
          records: newRecords,
        };
      });

      const nextType =
        board.level === 10 && board.boardNumber === 3
          ? 'master_cleared'
          : board.boardNumber === 3
          ? 'level_cleared'
          : 'board_cleared';

      setLevelUpModal({
        isOpen: true,
        type: nextType,
        clearedBoardNumber: board.boardNumber,
        clearTimeSeconds: elapsedSeconds,
      });
    },
    [board, isDailyChallengeActive, selectedCategory, clearCountInLevel, elapsedSeconds, onUpdateSaveData, onClearCustomDailyBoard]
  );

  // Cell input
  const handleCellInput = useCallback(
    (r: number, c: number, char: string) => {
      const cell = board.grid[r]?.[c];
      if (!cell || !cell.isActive) return;

      const isCorrect = char === cell.solutionChar;
      sounds.playKey();

      const newGrid = userGrid.map((row) => [...row]);
      newGrid[r][c] = char;
      setUserGrid(newGrid);

      if (!isCorrect && char.trim() !== '') {
        setWrongCells((prev) => new Set([...prev, `${r},${c}`]));
        const pw = board.placedWords.find((w) => {
          if (w.direction === 'across') return w.startRow === r && c >= w.startCol && c < w.startCol + w.length;
          return w.startCol === c && r >= w.startRow && r < w.startRow + w.length;
        });
        if (pw) {
          recordWordMistake(pw.term, pw.definition, selectedCategory);
        }
      } else {
        setWrongCells((prev) => {
          const next = new Set(prev);
          next.delete(`${r},${c}`);
          return next;
        });
      }

      // Move cursor
      let nextCell = selectedCell;
      if (activeDirection === 'across') {
        const nextC = c + 1;
        if (nextC < board.size && board.grid[r]?.[nextC]?.isActive) {
          nextCell = { row: r, col: nextC };
          setSelectedCell(nextCell);
        }
      } else {
        const nextR = r + 1;
        if (nextR < board.size && board.grid[nextR]?.[c]?.isActive) {
          nextCell = { row: nextR, col: c };
          setSelectedCell(nextCell);
        }
      }

      persistActiveSession(newGrid, revealedChosungs, nextCell, activeWordId, activeDirection);
      checkCompletion(newGrid);
    },
    [board, userGrid, selectedCell, activeDirection, activeWordId, revealedChosungs, selectedCategory, persistActiveSession, checkCompletion]
  );

  // Virtual key input
  const handleVirtualKeyInput = useCallback(
    (jamo: string) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      const cell = board.grid[row]?.[col];
      if (!cell || !cell.isActive) return;

      const currentVal = userGrid[row]?.[col] || '';
      const sol = cell.solutionChar || '';
      const combined = combineHangulInput(currentVal, jamo, sol);

      const newGrid = userGrid.map((rArr) => [...rArr]);
      newGrid[row][col] = combined.currentCell;

      let nextPos = selectedCell;
      if (combined.nextCell && activeWord) {
        const currIdx =
          activeWord.direction === 'across' ? col - activeWord.startCol : row - activeWord.startRow;
        if (currIdx >= 0 && currIdx < activeWord.length - 1) {
          const nextR =
            activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx + 1;
          const nextC =
            activeWord.direction === 'across' ? activeWord.startCol + currIdx + 1 : activeWord.startCol;
          newGrid[nextR][nextC] = combined.nextCell;
          nextPos = { row: nextR, col: nextC };
          setSelectedCell(nextPos);
        }
      } else if (combined.shouldAdvance && activeWord) {
        const currIdx =
          activeWord.direction === 'across' ? col - activeWord.startCol : row - activeWord.startRow;
        if (currIdx >= 0 && currIdx < activeWord.length - 1) {
          const nextR =
            activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx + 1;
          const nextC =
            activeWord.direction === 'across' ? activeWord.startCol + currIdx + 1 : activeWord.startCol;
          nextPos = { row: nextR, col: nextC };
          setSelectedCell(nextPos);
        }
      }

      setUserGrid(newGrid);
      persistActiveSession(newGrid, revealedChosungs, nextPos, activeWordId, activeDirection);
      checkCompletion(newGrid);
    },
    [selectedCell, board.grid, userGrid, activeWord, revealedChosungs, activeWordId, activeDirection, persistActiveSession, checkCompletion]
  );

  // Backspace
  const handleCellBackspace = useCallback(
    (r: number, c: number) => {
      const currentChar = userGrid[r]?.[c] || '';
      const newGrid = userGrid.map((row) => [...row]);

      if (currentChar !== '') {
        const decomp = decompose(currentChar);
        if (decomp && decomp.jong) {
          newGrid[r][c] = compose(decomp.cho, decomp.jung);
        } else if (decomp && decomp.jung) {
          newGrid[r][c] = decomp.cho;
        } else {
          newGrid[r][c] = '';
        }
        setUserGrid(newGrid);
        setWrongCells((prev) => {
          const next = new Set(prev);
          next.delete(`${r},${c}`);
          return next;
        });
        persistActiveSession(newGrid, revealedChosungs, selectedCell, activeWordId, activeDirection);
        return;
      }

      // Move backward if empty
      let prevCell = selectedCell;
      if (activeDirection === 'across') {
        const prevC = c - 1;
        if (prevC >= 0 && board.grid[r]?.[prevC]?.isActive) {
          prevCell = { row: r, col: prevC };
          setSelectedCell(prevCell);
          newGrid[r][prevC] = '';
          setUserGrid(newGrid);
        }
      } else {
        const prevR = r - 1;
        if (prevR >= 0 && board.grid[prevR]?.[c]?.isActive) {
          prevCell = { row: prevR, col: c };
          setSelectedCell(prevCell);
          newGrid[prevR][c] = '';
          setUserGrid(newGrid);
        }
      }
      persistActiveSession(newGrid, revealedChosungs, prevCell, activeWordId, activeDirection);
    },
    [userGrid, board.grid, activeDirection, selectedCell, revealedChosungs, activeWordId, persistActiveSession]
  );

  const handlePrevCell = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (activeDirection === 'across' && col > 0 && board.grid[row]?.[col - 1]?.isActive) {
      setSelectedCell({ row, col: col - 1 });
    } else if (activeDirection === 'down' && row > 0 && board.grid[row - 1]?.[col]?.isActive) {
      setSelectedCell({ row: row - 1, col });
    }
  }, [selectedCell, activeDirection, board.grid]);

  const handleNextCell = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (activeDirection === 'across' && col < board.size - 1 && board.grid[row]?.[col + 1]?.isActive) {
      setSelectedCell({ row, col: col + 1 });
    } else if (activeDirection === 'down' && row < board.size - 1 && board.grid[row + 1]?.[col]?.isActive) {
      setSelectedCell({ row: row + 1, col });
    }
  }, [selectedCell, activeDirection, board.grid, board.size]);

  // Apply chosung hint
  const handleApplyChosungToBoard = useCallback(() => {
    if (!activeWord || hintBalance < 1) return;

    onUpdateSaveData((prev) => ({
      ...prev,
      hintBalance: Math.max(0, prev.hintBalance - 1),
    }));

    const newChosungs = new Set(revealedChosungs);
    for (let i = 0; i < activeWord.length; i++) {
      const r = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
      const c = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
      newChosungs.add(`${r},${c}`);
    }
    setRevealedChosungs(newChosungs);

    recordWordHintUsed(activeWord.term, activeWord.definition, selectedCategory);
    sounds.playHint();
    setIsChosungModalOpen(false);
    persistActiveSession(userGrid, newChosungs, selectedCell, activeWordId, activeDirection);
  }, [activeWord, hintBalance, revealedChosungs, selectedCategory, userGrid, selectedCell, activeWordId, activeDirection, onUpdateSaveData, persistActiveSession]);

  // Check answers
  const handleCheckAnswers = useCallback(() => {
    sounds.playKey();
    const wrong = new Set<string>();
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        const cell = board.grid[r]?.[c];
        if (cell && cell.isActive) {
          const userChar = userGrid[r]?.[c] || '';
          if (userChar !== '' && userChar !== cell.solutionChar) {
            wrong.add(`${r},${c}`);
          }
        }
      }
    }
    setWrongCells(wrong);
  }, [board, userGrid]);

  // Reset board
  const handleResetBoard = useCallback(() => {
    sounds.playKey();
    const emptyGrid = Array.from({ length: board.size || 8 }, () => Array(board.size || 8).fill(''));
    setUserGrid(emptyGrid);
    setWrongCells(new Set());
    setRevealedChosungs(new Set());
    setElapsedSeconds(0);
    clearActiveGame(selectedCategory);
  }, [board.size, selectedCategory]);

  // Generate new puzzle
  const handleNewPuzzle = useCallback(() => {
    sounds.playKey();
    const fresh = generateFreshBoard(currentLevel, currentBoardNumber, selectedCategory);
    setBoard(fresh);
    const emptyGrid = Array.from({ length: fresh.size || 8 }, () => Array(fresh.size || 8).fill(''));
    setUserGrid(emptyGrid);
    setWrongCells(new Set());
    setRevealedChosungs(new Set());
    setElapsedSeconds(0);
    if (fresh.placedWords.length > 0) {
      const first = fresh.placedWords[0];
      setActiveWordId(first.id);
      setActiveDirection(first.direction);
      setSelectedCell({ row: first.startRow, col: first.startCol });
    }
    clearActiveGame(selectedCategory);
  }, [currentLevel, currentBoardNumber, selectedCategory]);

  return (
    <>
      <CategoryLevelBar
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        currentLevel={currentLevel}
        maxUnlockedLevel={maxUnlockedLevel}
        levelClears={levelClears}
        onSelectLevel={(lvl) => loadBoard(lvl, 1, selectedCategory)}
      />

      <main className="max-w-6xl mx-auto px-1 sm:px-4 py-2 w-full">
        <ActiveClueCard
          activeWord={activeWord}
          activeDirection={activeDirection}
          theme={currentTheme}
          isCompleted={activeWord ? completedWordIds.has(activeWord.id) : false}
          isIntersection={Boolean(
            selectedCell &&
            board.placedWords.filter((pw) => {
              if (pw.direction === 'across') {
                return pw.startRow === selectedCell.row && selectedCell.col >= pw.startCol && selectedCell.col < pw.startCol + pw.length;
              } else {
                return pw.startCol === selectedCell.col && selectedCell.row >= pw.startRow && selectedCell.row < pw.startRow + pw.length;
              }
            }).length > 1
          )}
          hintBalance={hintBalance}
          isLargeFont={fontSize !== 'normal'}
          selectedCategory={selectedCategory}
          onRequestHint={() => setIsChosungModalOpen(true)}
          onToggleDirection={handleToggleDirection}
          onPrevWord={() => {
            if (board.placedWords.length === 0) return;
            const idx = board.placedWords.findIndex((w) => w.id === activeWordId);
            const prevIdx = idx > 0 ? idx - 1 : board.placedWords.length - 1;
            handleSelectWord(board.placedWords[prevIdx]);
          }}
          onNextWord={() => {
            if (board.placedWords.length === 0) return;
            const idx = board.placedWords.findIndex((w) => w.id === activeWordId);
            const nextIdx = idx < board.placedWords.length - 1 ? idx + 1 : 0;
            handleSelectWord(board.placedWords[nextIdx]);
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-4 items-start w-full">
          <div className="lg:col-span-7 flex flex-col items-center w-full px-0 sm:px-0">
            <div className="w-full bg-white sm:rounded-2xl border-y sm:border border-slate-200 shadow-xs p-1.5 sm:p-4 mb-0 sm:mb-3">
              <CrosswordBoard
                board={board}
                theme={currentTheme}
                userGrid={userGrid}
                activeWord={activeWord}
                activeDirection={activeDirection}
                selectedCell={selectedCell}
                wrongCells={wrongCells}
                revealedChosungs={revealedChosungs}
                isLargeFont={fontSize !== 'normal'}
                onCellClick={handleCellClick}
                onCellInput={handleCellInput}
                onCellBackspace={handleCellBackspace}
                onNavigate={(dRow, dCol) => {
                  if (!selectedCell) return;
                  const nextR = Math.max(0, Math.min(board.size - 1, selectedCell.row + dRow));
                  const nextC = Math.max(0, Math.min(board.size - 1, selectedCell.col + dCol));
                  setSelectedCell({ row: nextR, col: nextC });
                }}
              />

              <div className="w-full mt-2 pt-2 border-t border-slate-100">
                <GameControls
                  hintBalance={hintBalance}
                  onRequestHint={() => setIsChosungModalOpen(true)}
                  onCheckWrong={handleCheckAnswers}
                  onClearActiveWord={() => {
                    if (!activeWord) return;
                    const newGrid = userGrid.map((r) => [...r]);
                    for (let i = 0; i < activeWord.length; i++) {
                      const r = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
                      const c = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
                      newGrid[r][c] = '';
                    }
                    setUserGrid(newGrid);
                    persistActiveSession(newGrid, revealedChosungs, selectedCell, activeWordId, activeDirection);
                  }}
                  onResetBoard={handleResetBoard}
                  onGenerateNewBoard={handleNewPuzzle}
                />
              </div>
            </div>

            <div className="w-full px-0 sm:px-0 mb-3">
              <VirtualHangulKeypad
                currentCellChar={selectedCell ? userGrid[selectedCell.row]?.[selectedCell.col] || '' : ''}
                onInputChar={handleVirtualKeyInput}
                onBackspace={() => {
                  if (selectedCell) {
                    handleCellBackspace(selectedCell.row, selectedCell.col);
                  }
                }}
                onPrevCell={handlePrevCell}
                onNextCell={handleNextCell}
              />
            </div>
          </div>

          <div className="lg:col-span-5 w-full px-2 sm:px-0">
            <CluesList
              placedWords={board.placedWords}
              activeWord={activeWord}
              completedWordIds={completedWordIds}
              onSelectWord={handleSelectWord}
            />
          </div>
        </div>
      </main>

      <PuzzleStageKnowledgeGuide
        placedWords={board.placedWords}
        categoryName={getCategoryMeta(selectedCategory).name}
        level={currentLevel}
        boardNumber={board.boardNumber}
        completedWordIds={completedWordIds}
        onSelectWord={handleSelectWord}
        initialLearningMode={saveData.settings.learningMode}
      />

      {/* In-game Modals */}
      {isCategoryModalOpen && (
        <CategorySelectorModal
          isOpen={isCategoryModalOpen}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            onSelectCategory(cat);
            setIsCategoryModalOpen(false);
          }}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}

      {isPlacementTestOpen && (
        <PoliticsPlacementTest
          isOpen={isPlacementTestOpen}
          selectedCategory={selectedCategory}
          onClose={() => setIsPlacementTestOpen(false)}
          onComplete={(diagnosedLvl) => {
            setIsPlacementTestOpen(false);
            loadBoard(diagnosedLvl, 1, selectedCategory);
          }}
        />
      )}

      {isChosungModalOpen && (
        <ChosungHintModal
          isOpen={isChosungModalOpen}
          onClose={() => setIsChosungModalOpen(false)}
          activeWord={activeWord}
          hintBalance={hintBalance}
          onApplyToBoard={handleApplyChosungToBoard}
        />
      )}

      {isAdModalOpen && (
        <RewardedAdModal
          isOpen={isAdModalOpen}
          onClose={() => setIsAdModalOpen(false)}
          onReward={() => {
            onUpdateSaveData((prev) => ({
              ...prev,
              hintBalance: prev.hintBalance + 5,
            }));
            setIsAdModalOpen(false);
          }}
        />
      )}

      {levelUpModal.isOpen && (
        <LevelUpModal
          isOpen={levelUpModal.isOpen}
          type={levelUpModal.type}
          currentLevel={currentLevel}
          clearedBoardNumber={levelUpModal.clearedBoardNumber}
          clearTimeSeconds={levelUpModal.clearTimeSeconds}
          onNextBoard={() => {
            setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
            loadBoard(currentLevel, Math.min(3, levelUpModal.clearedBoardNumber + 1), selectedCategory);
          }}
          onNextLevel={() => {
            setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
            loadBoard(Math.min(10, currentLevel + 1), 1, selectedCategory);
          }}
          onOpenCertificate={() => {
            setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
            onOpenCertificate(selectedCategory);
          }}
        />
      )}
    </>
  );
};
