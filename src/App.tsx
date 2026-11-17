import { useState, useEffect, useMemo, useCallback } from 'react';
import { BoardData, Direction, PlacedWord, BoardRecord, CategoryId } from './types/puzzle';
import { ThemeId, THEMES, getDefaultThemeForLevel } from './types/theme';
import { getCategoryMeta } from './data/categoryRegistry';
import { getBoardForCategoryAndLevel, generateFreshBoard } from './data/boardProvider';
import { getRandomBackgroundForLevel, BackgroundItem } from './utils/backgroundManager';
import { sounds } from './utils/audio';
import { combineHangulInput, decompose, compose } from './utils/hangul';
import { WorkbookHeader } from './components/WorkbookHeader';
import { CategoryLevelBar } from './components/CategoryLevelBar';
import { CategorySelectorModal } from './components/CategorySelectorModal';
import { CrosswordBoard } from './components/CrosswordBoard';
import { ActiveClueCard } from './components/ActiveClueCard';
import { CluesList } from './components/CluesList';
import { GameControls } from './components/GameControls';
import { VirtualHangulKeypad } from './components/VirtualHangulKeypad';
import { ChosungHintModal } from './components/ChosungHintModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { PoliticsPlacementTest } from './components/PoliticsPlacementTest';
import { LevelUpModal } from './components/LevelUpModal';
import { MasterCertificate } from './components/MasterCertificate';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { RecordsView } from './components/RecordsView';
import { MyPageView } from './components/MyPageView';
import { LegalPolicyModal, PolicyTab } from './components/LegalPolicyModal';
import { SiteFooter } from './components/SiteFooter';
import { AdBannerSlot } from './components/AdBannerSlot';
import { PuzzleStageKnowledgeGuide } from './components/PuzzleStageKnowledgeGuide';
import { InstallAppModal } from './components/InstallAppModal';
import { usePWAInstall } from './utils/usePWAInstall';
import { HomeScreen } from './features/home/HomeScreen';
import { KnowledgeHubView } from './features/learning/KnowledgeHubView';
import { DailyChallengeModal } from './features/daily/DailyChallengeModal';
import { AchievementsModal } from './features/achievements/AchievementsModal';
import {
  loadUserSaveData,
  saveUserSaveData,
  processDailyAttendance,
  saveActiveGame,
  clearActiveGame,
  recordWordMistake,
  recordWordHintUsed,
  isCategoryMasterEligible,
  getKSTDateString,
  ALL_CATEGORIES,
} from './services/storageService';
import { getDailyBoard } from './services/dailyService';
import { UserSaveData, FontSizeSetting, ActiveGameSession } from './types/progress';
import confetti from 'canvas-confetti';

const getInitialCategory = (): CategoryId => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category')?.toUpperCase();
    if (cat) {
      const normalized = cat.replace('-', '_');
      const found = ALL_CATEGORIES.find(
        (c) => c === normalized || c.replace('_', '') === normalized.replace('_', '')
      );
      if (found) return found;
    }
    const hash = window.location.hash.toLowerCase();
    for (const c of ALL_CATEGORIES) {
      if (hash.includes(c.toLowerCase().replace('_', '')) || hash.includes(c.toLowerCase())) {
        return c;
      }
    }
  }
  try {
    const loaded = loadUserSaveData();
    if (loaded && loaded.selectedCategory) {
      return loaded.selectedCategory;
    }
  } catch {}
  return 'POLITICS';
};

const getInitialTab = (): TabType => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab')?.toUpperCase();
    const VALID_TABS: TabType[] = ['HOME', 'CHALLENGE', 'KNOWLEDGE', 'RECORDS', 'SETTINGS'];
    if (tabParam && VALID_TABS.includes(tabParam as TabType)) {
      return tabParam as TabType;
    }
    if (tabParam === 'MYPAGE') return 'SETTINGS';
    if (tabParam === 'WORDBOOK') return 'KNOWLEDGE';

    const hash = window.location.hash.toLowerCase();
    if (hash.includes('knowledge') || hash.includes('wordbook')) return 'KNOWLEDGE';
    if (hash.includes('record')) return 'RECORDS';
    if (hash.includes('mypage') || hash.includes('setting')) return 'SETTINGS';
    if (hash.includes('challenge') || hash.includes('play')) return 'CHALLENGE';
  }
  return 'HOME';
};

export function App() {
  // Persistent User Save Data State
  const [saveData, setSaveData] = useState<UserSaveData>(() => {
    const loaded = loadUserSaveData();
    const initCat = getInitialCategory();
    if (initCat && initCat !== loaded.selectedCategory) {
      loaded.selectedCategory = initCat;
    }
    const { data: updated } = processDailyAttendance(loaded);
    return updated;
  });

  const selectedCategory = saveData.selectedCategory;
  const currentCatProgress = saveData.categoryProgress[selectedCategory] || {
    currentLevel: 1,
    clearCountInLevel: 0,
    levelClears: {},
    maxUnlockedLevel: 1,
    isTested: false,
    totalClearedBoards: 0,
  };

  const currentLevel = currentCatProgress.currentLevel;
  const clearCountInLevel = currentCatProgress.clearCountInLevel;
  const levelClears = currentCatProgress.levelClears;
  const maxUnlockedLevel = currentCatProgress.maxUnlockedLevel;
  const hintBalance = saveData.hintBalance;
  const boardRecords = saveData.records;
  const solvedWordTerms = useMemo(() => new Set(saveData.solvedWordTerms), [saveData.solvedWordTerms]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  // Daily puzzle mode flag
  const [isDailyChallengeActive, setIsDailyChallengeActive] = useState<boolean>(false);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState<boolean>(false);
  const [isChosungModalOpen, setIsChosungModalOpen] = useState<boolean>(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState<boolean>(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState<boolean>(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [certificateCategory, setCertificateCategory] = useState<CategoryId>(selectedCategory);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab>('PRIVACY');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Clear completion modal
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

  const currentBoardNumber = Math.min(3, (clearCountInLevel % 3) + 1);

  // Active Crossword Board
  const [board, setBoard] = useState<BoardData>(() => {
    const activeSession = saveData.activeGames[selectedCategory];
    if (activeSession && activeSession.level && activeSession.boardNumber) {
      return getBoardForCategoryAndLevel(selectedCategory, activeSession.level, activeSession.boardNumber);
    }
    return getBoardForCategoryAndLevel(selectedCategory, currentLevel, currentBoardNumber);
  });

  // User input grid
  const [userGrid, setUserGrid] = useState<string[][]>(() => {
    const activeSession = saveData.activeGames[selectedCategory];
    if (activeSession && activeSession.userGrid) {
      return activeSession.userGrid;
    }
    return Array.from({ length: board.size || 8 }, () => Array(board.size || 8).fill(''));
  });

  // Cell selection & Direction
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(() => {
    const activeSession = saveData.activeGames[selectedCategory];
    if (activeSession && activeSession.selectedCell) {
      return activeSession.selectedCell;
    }
    if (board.placedWords.length > 0) {
      return { row: board.placedWords[0].startRow, col: board.placedWords[0].startCol };
    }
    return null;
  });

  const [activeDirection, setActiveDirection] = useState<Direction>(() => {
    const activeSession = saveData.activeGames[selectedCategory];
    return activeSession?.activeDirection || 'across';
  });

  const [activeWordId, setActiveWordId] = useState<string | null>(() => {
    const activeSession = saveData.activeGames[selectedCategory];
    return activeSession?.activeWordId || (board.placedWords.length > 0 ? board.placedWords[0].id : null);
  });

  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [revealedChosungs, setRevealedChosungs] = useState<Set<string>>(() => {
    const activeSession = saveData.activeGames[selectedCategory];
    return new Set(activeSession?.revealedChosungs || []);
  });

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const activeSession = saveData.activeGames[selectedCategory];
    return activeSession?.elapsedSeconds || 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Theme & Background
  const [userThemeId, setUserThemeId] = useState<ThemeId>(() => (saveData.settings.themeId as ThemeId) || 'classic-blue');
  const levelTheme = useMemo(() => getDefaultThemeForLevel(currentLevel), [currentLevel]);
  const currentTheme = THEMES[userThemeId] || levelTheme;

  const [activeBackground, setActiveBackground] = useState<BackgroundItem | null>(() =>
    getRandomBackgroundForLevel(currentLevel)
  );

  // Audio mute
  const [isMuted, setIsMuted] = useState<boolean>(() => saveData.settings.isMuted);
  useEffect(() => {
    sounds.isMuted = isMuted;
  }, [isMuted]);

  const pwa = usePWAInstall();

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
      levelUpModal.isOpen ||
      isCertificateOpen ||
      isDailyModalOpen ||
      isAchievementsModalOpen;

    if (activeTab !== 'CHALLENGE' || isModalActive) {
      setIsTimerRunning(false);
      return;
    }

    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    activeTab,
    isPlacementTestOpen,
    isChosungModalOpen,
    isAdModalOpen,
    levelUpModal.isOpen,
    isCertificateOpen,
    isDailyModalOpen,
    isAchievementsModalOpen,
  ]);

  // Load board
  const loadBoard = useCallback(
    (lvl: number, bNum: number, cat?: CategoryId) => {
      const targetCat = cat || selectedCategory;
      const newBoard = getBoardForCategoryAndLevel(targetCat, lvl, bNum);
      setBoard(newBoard);
      const emptyGrid = Array.from({ length: newBoard.size || 8 }, () => Array(newBoard.size || 8).fill(''));
      setUserGrid(emptyGrid);
      setWrongCells(new Set());
      setRevealedChosungs(new Set());
      setActiveBackground((prev) => getRandomBackgroundForLevel(lvl, prev?.id));
      setElapsedSeconds(0);
      setIsDailyChallengeActive(false);

      if (newBoard.placedWords.length > 0) {
        const first = newBoard.placedWords[0];
        setActiveWordId(first.id);
        setActiveDirection(first.direction);
        setSelectedCell({ row: first.startRow, col: first.startCol });
      }
    },
    [selectedCategory]
  );

  // Switch category
  const handleSelectCategory = (cat: CategoryId) => {
    sounds.playWordComplete();
    const updated = { ...saveData, selectedCategory: cat };
    setSaveData(updated);
    saveUserSaveData(updated);

    const targetProg = updated.categoryProgress[cat] || {
      currentLevel: 1,
      clearCountInLevel: 0,
      levelClears: {},
      maxUnlockedLevel: 1,
      isTested: false,
      totalClearedBoards: 0,
    };

    const activeSession = updated.activeGames[cat];
    if (activeSession && activeSession.level && activeSession.boardNumber) {
      const activeBoard = getBoardForCategoryAndLevel(cat, activeSession.level, activeSession.boardNumber);
      setBoard(activeBoard);
      setUserGrid(activeSession.userGrid || Array.from({ length: activeBoard.size }, () => Array(activeBoard.size).fill('')));
      setRevealedChosungs(new Set(activeSession.revealedChosungs || []));
      setElapsedSeconds(activeSession.elapsedSeconds || 0);
      setSelectedCell(activeSession.selectedCell || (activeBoard.placedWords[0] ? { row: activeBoard.placedWords[0].startRow, col: activeBoard.placedWords[0].startCol } : null));
      setActiveWordId(activeSession.activeWordId || activeBoard.placedWords[0]?.id || null);
      setActiveDirection(activeSession.activeDirection || 'across');
      setWrongCells(new Set());
      setIsDailyChallengeActive(false);
    } else {
      const targetBoardNum = Math.min(3, (targetProg.clearCountInLevel % 3) + 1);
      loadBoard(targetProg.currentLevel, targetBoardNum, cat);
    }
  };

  const handleResumeGame = (cat: CategoryId) => {
    handleSelectCategory(cat);
    setActiveTab('CHALLENGE');
  };

  const handleStartDailyChallenge = () => {
    sounds.playVictory();
    const todayKST = getKSTDateString();
    const dailyBoard = getDailyBoard(todayKST);
    setBoard(dailyBoard);
    setUserGrid(Array.from({ length: dailyBoard.size }, () => Array(dailyBoard.size).fill('')));
    setRevealedChosungs(new Set());
    setWrongCells(new Set());
    setElapsedSeconds(0);
    setIsDailyChallengeActive(true);

    if (dailyBoard.placedWords.length > 0) {
      const first = dailyBoard.placedWords[0];
      setActiveWordId(first.id);
      setActiveDirection(first.direction);
      setSelectedCell({ row: first.startRow, col: first.startCol });
    }

    setActiveTab('CHALLENGE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCellClick = (r: number, c: number) => {
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
        return;
      }
    }

    const matchingWord = wordsAtCell.find((w) => w.direction === activeDirection) || wordsAtCell[0];
    if (matchingWord) {
      setActiveDirection(matchingWord.direction);
      setActiveWordId(matchingWord.id);
    }
  };

  const handleToggleDirection = () => {
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
  };

  const handleSelectWord = (word: PlacedWord) => {
    sounds.playKey();
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
  };

  // Check puzzle completion
  const checkBoardCompletion = useCallback(
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
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Daily Challenge Completion
      if (isDailyChallengeActive) {
        const todayKST = getKSTDateString();
        const updatedDaily = {
          ...saveData.dailyChallenge,
          completedDates: Array.from(new Set([...saveData.dailyChallenge.completedDates, todayKST])),
          todayResult: {
            date: todayKST,
            completed: true,
            elapsedSeconds,
            wordCount: board.placedWords.length,
          },
          bestTimeSeconds: saveData.dailyChallenge.bestTimeSeconds
            ? Math.min(saveData.dailyChallenge.bestTimeSeconds, elapsedSeconds)
            : elapsedSeconds,
        };
        const nextData = {
          ...saveData,
          hintBalance: saveData.hintBalance + 2,
          dailyChallenge: updatedDaily,
        };
        setSaveData(nextData);
        saveUserSaveData(nextData);
        setIsDailyModalOpen(true);
        return;
      }

      // Normal Gate Completion
      clearActiveGame(selectedCategory);

      const newlySolvedWords = new Set(saveData.solvedWordTerms);
      for (const pw of board.placedWords) {
        newlySolvedWords.add(pw.term);
      }

      const nextProg = { ...currentCatProgress };
      const currentClearInLvl = (nextProg.clearCountInLevel || 0) + 1;
      nextProg.clearCountInLevel = currentClearInLvl;
      nextProg.levelClears[currentLevel] = Math.min(3, (nextProg.levelClears[currentLevel] || 0) + 1);
      nextProg.totalClearedBoards = (nextProg.totalClearedBoards || 0) + 1;

      let modalType: 'board_cleared' | 'level_cleared' | 'master_cleared' = 'board_cleared';
      if (currentClearInLvl >= 3) {
        if (currentLevel < 10) {
          nextProg.maxUnlockedLevel = Math.max(nextProg.maxUnlockedLevel, currentLevel + 1);
          nextProg.currentLevel = currentLevel + 1;
          nextProg.clearCountInLevel = 0;
          modalType = 'level_cleared';
        } else {
          modalType = 'master_cleared';
        }
      }

      const newRecord: BoardRecord = {
        id: `rec_${Date.now()}`,
        category: selectedCategory,
        level: currentLevel,
        boardNumber: board.boardNumber,
        timeSeconds: elapsedSeconds,
        date: getKSTDateString(),
        wordCount: board.placedWords.length,
      };

      const updatedAchievements = saveData.achievements.map((ach) => {
        let progress = ach.progress;
        let unlockedAt = ach.unlockedAt;

        if (ach.id === 'first_clear') {
          progress = 1;
          if (!unlockedAt) unlockedAt = new Date().toISOString();
        } else if (ach.id === 'word_50' || ach.id === 'word_100' || ach.id === 'word_300') {
          progress = newlySolvedWords.size;
          if (progress >= ach.maxProgress && !unlockedAt) unlockedAt = new Date().toISOString();
        } else if (ach.id === 'category_master') {
          progress = nextProg.totalClearedBoards;
          if (progress >= 30 && !unlockedAt) unlockedAt = new Date().toISOString();
        }

        return { ...ach, progress, unlockedAt };
      });

      const nextData: UserSaveData = {
        ...saveData,
        categoryProgress: {
          ...saveData.categoryProgress,
          [selectedCategory]: nextProg,
        },
        records: [newRecord, ...saveData.records],
        solvedWordTerms: Array.from(newlySolvedWords),
        achievements: updatedAchievements,
      };

      setSaveData(nextData);
      saveUserSaveData(nextData);

      setLevelUpModal({
        isOpen: true,
        type: modalType,
        clearedBoardNumber: board.boardNumber,
        clearTimeSeconds: elapsedSeconds,
      });
    },
    [
      board,
      isDailyChallengeActive,
      saveData,
      elapsedSeconds,
      selectedCategory,
      currentCatProgress,
      currentLevel,
    ]
  );

  const applyCellInput = (r: number, c: number, char: string) => {
    const newGrid = userGrid.map((rowArr) => [...rowArr]);
    newGrid[r][c] = char;
    setUserGrid(newGrid);

    const cellKey = `${r},${c}`;
    if (wrongCells.has(cellKey)) {
      setWrongCells((prev) => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });
    }

    const cell = board.grid[r]?.[c];
    if (char && cell && cell.solutionChar && char !== cell.solutionChar) {
      sounds.playKey();
      if (activeWord) {
        recordWordMistake(activeWord.term, activeWord.definition, selectedCategory);
      }
    } else if (char) {
      sounds.playKey();
    }

    let nextCell = selectedCell;
    if (char && activeWord) {
      const currIdx =
        activeWord.direction === 'across' ? c - activeWord.startCol : r - activeWord.startRow;
      if (currIdx >= 0 && currIdx < activeWord.length - 1) {
        const nextR =
          activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx + 1;
        const nextC =
          activeWord.direction === 'across' ? activeWord.startCol + currIdx + 1 : activeWord.startCol;
        nextCell = { row: nextR, col: nextC };
        setSelectedCell(nextCell);
      }
    }

    persistActiveSession(newGrid, revealedChosungs, nextCell, activeWordId, activeDirection);
    checkBoardCompletion(newGrid);
  };

  const handleVirtualKeyInput = (jamo: string) => {
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
    persistActiveSession(newGrid, revealedChosungs, nextPos, activeWordId, activeDirection);
    checkBoardCompletion(newGrid);
  };

  const handleCellBackspace = (r: number, c: number) => {
    sounds.playKey();
    const currentVal = userGrid[r]?.[c] || '';

    if (currentVal.length > 0) {
      const decomp = decompose(currentVal);
      if (decomp) {
        if (decomp.jong) {
          applyCellInput(r, c, compose(decomp.cho, decomp.jung));
        } else if (decomp.jung) {
          applyCellInput(r, c, decomp.cho);
        } else {
          applyCellInput(r, c, '');
        }
      } else {
        applyCellInput(r, c, '');
      }
    } else if (activeWord) {
      const currIdx =
        activeWord.direction === 'across' ? c - activeWord.startCol : r - activeWord.startRow;
      if (currIdx > 0) {
        const prevR =
          activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx - 1;
        const prevC =
          activeWord.direction === 'across' ? activeWord.startCol + currIdx - 1 : activeWord.startCol;
        setSelectedCell({ row: prevR, col: prevC });
      }
    }
  };

  const handleCellInput = (r: number, c: number, value: string) => {
    const trimmed = value.slice(-1);
    applyCellInput(r, c, trimmed);
  };

  const handlePrevCell = () => {
    if (!selectedCell || !activeWord) return;
    const currIdx =
      activeWord.direction === 'across'
        ? selectedCell.col - activeWord.startCol
        : selectedCell.row - activeWord.startRow;
    if (currIdx > 0) {
      const prevR =
        activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx - 1;
      const prevC =
        activeWord.direction === 'across' ? activeWord.startCol + currIdx - 1 : activeWord.startCol;
      setSelectedCell({ row: prevR, col: prevC });
    }
  };

  const handleNextCell = () => {
    if (!selectedCell || !activeWord) return;
    const currIdx =
      activeWord.direction === 'across'
        ? selectedCell.col - activeWord.startCol
        : selectedCell.row - activeWord.startRow;
    if (currIdx < activeWord.length - 1) {
      const nextR =
        activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currIdx + 1;
      const nextC =
        activeWord.direction === 'across' ? activeWord.startCol + currIdx + 1 : activeWord.startCol;
      setSelectedCell({ row: nextR, col: nextC });
    }
  };

  const handleCheckAnswers = () => {
    sounds.playKey();
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
    if (wrong.size === 0) {
      sounds.playWordComplete();
    } else {
      sounds.playError();
    }
  };

  const handleResetBoard = () => {
    sounds.playKey();
    const emptyGrid = Array.from({ length: board.size || 8 }, () => Array(board.size || 8).fill(''));
    setUserGrid(emptyGrid);
    setWrongCells(new Set());
    setRevealedChosungs(new Set());
    setElapsedSeconds(0);
    clearActiveGame(selectedCategory);
  };

  const handleNewPuzzle = () => {
    sounds.playKey();
    const fresh = generateFreshBoard(currentLevel, currentBoardNumber, selectedCategory);
    setBoard(fresh);
    const emptyGrid = Array.from({ length: fresh.size }, () => Array(fresh.size).fill(''));
    setUserGrid(emptyGrid);
    setWrongCells(new Set());
    setRevealedChosungs(new Set());
    setElapsedSeconds(0);
    setIsDailyChallengeActive(false);
    clearActiveGame(selectedCategory);

    if (fresh.placedWords.length > 0) {
      const first = fresh.placedWords[0];
      setActiveWordId(first.id);
      setActiveDirection(first.direction);
      setSelectedCell({ row: first.startRow, col: first.startCol });
    }
  };

  const handleApplyChosungToBoard = () => {
    if (hintBalance <= 0 || !activeWord) return;
    const newRevealed = new Set(revealedChosungs);
    for (let i = 0; i < activeWord.length; i++) {
      const r = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
      const c = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
      newRevealed.add(`${r},${c}`);
    }
    setRevealedChosungs(newRevealed);
    persistActiveSession(userGrid, newRevealed, selectedCell, activeWordId, activeDirection);

    const nextData = { ...saveData, hintBalance: Math.max(0, hintBalance - 1) };
    setSaveData(nextData);
    saveUserSaveData(nextData);

    recordWordHintUsed(activeWord.term, activeWord.definition, selectedCategory);
    setIsChosungModalOpen(false);
  };

  const handleAdReward = () => {
    const nextData = { ...saveData, hintBalance: hintBalance + 2 };
    setSaveData(nextData);
    saveUserSaveData(nextData);
    setIsAdModalOpen(false);
    sounds.playVictory();
  };

  const handleTestComplete = (assignedLevel: number) => {
    sounds.playVictory();
    const nextProg = {
      ...currentCatProgress,
      currentLevel: assignedLevel,
      maxUnlockedLevel: Math.max(currentCatProgress.maxUnlockedLevel, assignedLevel),
      isTested: true,
      clearCountInLevel: 0,
    };
    const nextData = {
      ...saveData,
      categoryProgress: {
        ...saveData.categoryProgress,
        [selectedCategory]: nextProg,
      },
    };
    setSaveData(nextData);
    saveUserSaveData(nextData);
    setIsPlacementTestOpen(false);
    loadBoard(assignedLevel, 1, selectedCategory);
  };

  const handleNextBoard = () => {
    setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
    const targetBoardNum = Math.min(3, (currentCatProgress.clearCountInLevel % 3) + 1);
    loadBoard(currentLevel, targetBoardNum, selectedCategory);
  };

  const handleNextLevel = () => {
    setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
    loadBoard(currentLevel, 1, selectedCategory);
  };

  const handleClaimAchievementReward = (achId: string, rewardHints: number) => {
    const updatedAchievements = saveData.achievements.map((a) =>
      a.id === achId ? { ...a, rewardClaimed: true } : a
    );
    const nextData = {
      ...saveData,
      hintBalance: saveData.hintBalance + rewardHints,
      achievements: updatedAchievements,
    };
    setSaveData(nextData);
    saveUserSaveData(nextData);
  };

  const handleChangeFontSize = (size: FontSizeSetting) => {
    const nextData = {
      ...saveData,
      settings: { ...saveData.settings, fontSize: size },
    };
    setSaveData(nextData);
    saveUserSaveData(nextData);
  };

  const handleToggleHighContrast = () => {
    const nextData = {
      ...saveData,
      settings: { ...saveData.settings, highContrast: !saveData.settings.highContrast },
    };
    setSaveData(nextData);
    saveUserSaveData(nextData);
  };

  const handleResetProgress = () => {
    if (window.confirm('정말 모든 진행도와 기록을 초기화하시겠습니까? (되돌릴 수 없습니다)')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleOpenPolicy = (tab: PolicyTab) => {
    setPolicyModalTab(tab);
    setIsPolicyModalOpen(true);
  };

  const handleOpenCertificate = (cat: CategoryId = selectedCategory) => {
    setCertificateCategory(cat);
    setIsCertificateOpen(true);
  };

  const certProg = saveData.categoryProgress[certificateCategory] || currentCatProgress;
  const certEligibility = isCategoryMasterEligible(certificateCategory, certProg);

  return (
    <div
      className={`min-h-screen text-slate-800 flex flex-col font-sans transition-all ${
        saveData.settings.fontSize === 'huge'
          ? 'text-[120%]'
          : saveData.settings.fontSize === 'large'
          ? 'text-[110%]'
          : ''
      } ${saveData.settings.highContrast ? 'contrast-125' : ''}`}
    >
      {/* Background Graphic Layer */}
      {activeBackground && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-15 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${activeBackground.url})` }}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <WorkbookHeader
          selectedCategory={selectedCategory}
          currentLevel={currentLevel}
          clearCountInLevel={clearCountInLevel}
          elapsedSeconds={elapsedSeconds}
          isTimerRunning={isTimerRunning}
          onOpenTest={() => setIsPlacementTestOpen(true)}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* TAB 1: HOME */}
        {activeTab === 'HOME' && (
          <HomeScreen
            saveData={saveData}
            onSelectCategory={(cat) => {
              handleSelectCategory(cat);
              setActiveTab('CHALLENGE');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onResumeGame={(cat) => handleResumeGame(cat)}
            onOpenDailyChallenge={() => setIsDailyModalOpen(true)}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShareApp={() => {}}
          />
        )}

        {/* TAB 2: CHALLENGE */}
        {activeTab === 'CHALLENGE' && (
          <>
            <CategoryLevelBar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
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
                isLargeFont={saveData.settings.fontSize !== 'normal'}
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
                  <div className="w-full bg-white sm:rounded-2xl border-y sm:border border-slate-200/90 shadow-xs p-1.5 sm:p-4 mb-0 sm:mb-3">
                    <CrosswordBoard
                      board={board}
                      theme={currentTheme}
                      userGrid={userGrid}
                      activeWord={activeWord}
                      activeDirection={activeDirection}
                      selectedCell={selectedCell}
                      wrongCells={wrongCells}
                      revealedChosungs={revealedChosungs}
                      isLargeFont={saveData.settings.fontSize !== 'normal'}
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
          </>
        )}

        {/* TAB 3: KNOWLEDGE */}
        {activeTab === 'KNOWLEDGE' && (
          <KnowledgeHubView
            selectedCategory={selectedCategory}
            maxUnlockedLevel={maxUnlockedLevel}
            solvedWordTerms={solvedWordTerms}
            onSelectCategory={handleSelectCategory}
            wrongWords={saveData.wrongWords}
            onMarkMastered={(term) => {
              const updated = saveData.wrongWords.map((w) =>
                w.term === term ? { ...w, mastered: !w.mastered } : w
              );
              const nextData = { ...saveData, wrongWords: updated };
              setSaveData(nextData);
              saveUserSaveData(nextData);
            }}
            onClearMistake={(term) => {
              const updated = saveData.wrongWords.filter((w) => w.term !== term);
              const nextData = { ...saveData, wrongWords: updated };
              setSaveData(nextData);
              saveUserSaveData(nextData);
            }}
          />
        )}

        {/* TAB 4: RECORDS */}
        {activeTab === 'RECORDS' && (
          <RecordsView
            selectedCategory={selectedCategory}
            categoryProgressMap={saveData.categoryProgress}
            boardRecords={boardRecords}
            onSelectCategory={handleSelectCategory}
            onGoToPlay={() => {
              setActiveTab('CHALLENGE');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCertificate={(cat) => handleOpenCertificate(cat)}
          />
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <MyPageView
            currentLevel={currentLevel}
            maxUnlockedLevel={maxUnlockedLevel}
            hintBalance={hintBalance}
            currentTheme={currentTheme}
            isMuted={isMuted}
            fontSize={saveData.settings.fontSize}
            highContrast={saveData.settings.highContrast}
            selectedCategory={selectedCategory}
            categoryClears={currentCatProgress.levelClears}
            totalClearedBoards={currentCatProgress.totalClearedBoards}
            unlockedAchievementsCount={saveData.achievements.filter((a) => a.unlockedAt !== null).length}
            totalAchievementsCount={saveData.achievements.length}
            onSelectCategory={handleSelectCategory}
            onSelectTheme={(themeId) => {
              setUserThemeId(themeId);
              const nextData = {
                ...saveData,
                settings: { ...saveData.settings, themeId },
              };
              setSaveData(nextData);
              saveUserSaveData(nextData);
            }}
            onToggleSound={() => {
              const nextMuted = !isMuted;
              sounds.isMuted = nextMuted;
              setIsMuted(nextMuted);
              const nextData = {
                ...saveData,
                settings: { ...saveData.settings, isMuted: nextMuted },
              };
              setSaveData(nextData);
              saveUserSaveData(nextData);
            }}
            onChangeFontSize={handleChangeFontSize}
            onToggleHighContrast={handleToggleHighContrast}
            onOpenTest={() => setIsPlacementTestOpen(true)}
            onOpenAdModal={() => setIsAdModalOpen(true)}
            onOpenCertificate={() => handleOpenCertificate(selectedCategory)}
            onOpenAchievements={() => setIsAchievementsModalOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenPolicy={handleOpenPolicy}
            onResetProgress={handleResetProgress}
            onDataRestored={() => {
              const refreshed = loadUserSaveData();
              setSaveData(refreshed);
              loadBoard(refreshed.categoryProgress[refreshed.selectedCategory]?.currentLevel || 1, 1, refreshed.selectedCategory);
            }}
          />
        )}

        {/* Google AdSense Responsive Banner Slot */}
        {activeTab !== 'KNOWLEDGE' && (
          <AdBannerSlot slotId="crossword_bottom_banner" />
        )}

        {/* Global Footer with Policy Links */}
        <SiteFooter onOpenPolicy={handleOpenPolicy} />
      </div>

      {/* Persistent Mobile Bottom Navigation Bar (5 Tabs) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unlockedLevel={maxUnlockedLevel}
      />

      {/* Category Selector Modal */}
      <CategorySelectorModal
        isOpen={isCategoryModalOpen}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Placement Test Modal */}
      <PoliticsPlacementTest
        isOpen={isPlacementTestOpen}
        selectedCategory={selectedCategory}
        onClose={() => setIsPlacementTestOpen(false)}
        onComplete={handleTestComplete}
      />

      {/* Chosung Hint Modal */}
      <ChosungHintModal
        isOpen={isChosungModalOpen}
        onClose={() => setIsChosungModalOpen(false)}
        activeWord={activeWord}
        hintBalance={hintBalance}
        onApplyToBoard={handleApplyChosungToBoard}
      />

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onReward={handleAdReward}
      />

      {/* Level Up / Board Clear Modal */}
      <LevelUpModal
        isOpen={levelUpModal.isOpen}
        type={levelUpModal.type}
        currentLevel={currentLevel}
        clearedBoardNumber={levelUpModal.clearedBoardNumber}
        clearTimeSeconds={levelUpModal.clearTimeSeconds}
        onNextBoard={handleNextBoard}
        onNextLevel={handleNextLevel}
        onOpenCertificate={() => {
          setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
          handleOpenCertificate(selectedCategory);
        }}
      />

      {/* Master Certificate Modal */}
      <MasterCertificate
        isOpen={isCertificateOpen}
        selectedCategory={certificateCategory}
        defaultUserName={saveData.nickname}
        isEligible={certEligibility.eligible}
        clearedBoards={certEligibility.clearedBoards}
        totalRequired={certEligibility.totalRequired}
        onClose={() => setIsCertificateOpen(false)}
        onContinueChallenge={() => {
          setIsCertificateOpen(false);
          handleSelectCategory(certificateCategory);
          setActiveTab('CHALLENGE');
        }}
      />

      {/* Daily Challenge Modal */}
      <DailyChallengeModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        saveData={saveData}
        onStartDailyPuzzle={handleStartDailyChallenge}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        achievements={saveData.achievements}
        onClaimReward={handleClaimAchievementReward}
      />

      {/* Legal Policies Modal */}
      <LegalPolicyModal
        isOpen={isPolicyModalOpen}
        initialTab={policyModalTab}
        onClose={() => setIsPolicyModalOpen(false)}
      />

      {/* PWA App Install Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={pwa.promptInstall}
        isIOS={pwa.isIOS}
        isInstalled={pwa.isInstalled}
      />
    </div>
  );
}

export default App;
