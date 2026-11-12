import { useState, useEffect, useMemo, useCallback } from 'react';
import { BoardData, Direction, PlacedWord, BoardRecord, CategoryId } from './types/puzzle';
import { ThemeId, THEMES, getDefaultThemeForLevel } from './types/theme';
import { getCategoryMeta } from './data/categoryRegistry';
import { getBoardForCategoryAndLevel, generateFreshBoard } from './data/boardProvider';
import { getRandomBackgroundForLevel, BackgroundItem } from './utils/backgroundManager';
import { sounds } from './utils/audio';
import { combineHangulInput, isCompleteSyllable, decompose, compose } from './utils/hangul';
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
import { WordbookView } from './components/WordbookView';
import { MyPageView } from './components/MyPageView';
import { LegalPolicyModal, PolicyTab } from './components/LegalPolicyModal';
import { SiteFooter } from './components/SiteFooter';
import { AdBannerSlot } from './components/AdBannerSlot';
import { KnowledgeArticleHub } from './components/KnowledgeArticleHub';
import { PuzzleStageKnowledgeGuide } from './components/PuzzleStageKnowledgeGuide';
import { InstallAppModal } from './components/InstallAppModal';
import { usePWAInstall } from './utils/usePWAInstall';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'politics_crossword_progress_v5';

// SEO & Deep Linking: Resolve category from query param e.g. ?category=politics or hash e.g. #knowledge/politics
const getInitialCategory = (): CategoryId => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category')?.toUpperCase();
    const VALID: CategoryId[] = [
      'POLITICS',
      'SOCIETY',
      'CULTURE',
      'SPORTS',
      'KOREAN_HISTORY',
      'WORLD_HISTORY',
      'MUSIC',
      'ART',
    ];
    if (cat) {
      const normalized = cat.replace('-', '_');
      const found = VALID.find(
        (c) => c === normalized || c.replace('_', '') === normalized.replace('_', '')
      );
      if (found) return found;
    }
    const hash = window.location.hash.toLowerCase();
    for (const c of VALID) {
      if (hash.includes(c.toLowerCase().replace('_', '')) || hash.includes(c.toLowerCase())) {
        return c;
      }
    }
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && JSON.parse(saved).selectedCategory) {
      return JSON.parse(saved).selectedCategory;
    }
  } catch {}
  return 'POLITICS';
};

// SEO & Deep Linking: Resolve active tab from query param e.g. ?tab=knowledge or hash
const getInitialTab = (): TabType => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab')?.toUpperCase();
    const VALID_TABS: TabType[] = ['CHALLENGE', 'KNOWLEDGE', 'WORDBOOK', 'RECORDS', 'MYPAGE'];
    if (tabParam && VALID_TABS.includes(tabParam as TabType)) {
      return tabParam as TabType;
    }
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('knowledge')) return 'KNOWLEDGE';
    if (hash.includes('wordbook')) return 'WORDBOOK';
    if (hash.includes('record')) return 'RECORDS';
    if (hash.includes('mypage') || hash.includes('setting')) return 'MYPAGE';
  }
  return 'CHALLENGE';
};

export function App() {
  // Selected Knowledge Category (정치, 사회, 문화, 스포츠, 한국사, 세계사, 음악, 미술)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(getInitialCategory);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);

  // --- Persistent User Progress State ---
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const maxLvl = parsed.maxUnlockedLevel || 1;
        const curLvl = parsed.currentLevel || 1;
        return Math.min(curLvl, Math.max(1, maxLvl));
      }
    } catch {}
    return 1;
  });

  const [clearCountInLevel, setClearCountInLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).clearCountInLevel || 0;
    } catch {}
    return 0;
  });

  const [levelClears, setLevelClears] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).levelClears || {};
    } catch {}
    return {};
  });

  const [isTested, setIsTested] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).isTested || false;
    } catch {}
    return false;
  });

  // Hint Balance: starts at 3, replenished via rewarded ad
  const [hintBalance, setHintBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof JSON.parse(saved).hintBalance === 'number') {
        return JSON.parse(saved).hintBalance;
      }
    } catch {}
    return 3;
  });

  // Maximum unlocked level (Level gating progression: can only proceed by breaking through 3-board gates)
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.maxUnlockedLevel) return parsed.maxUnlockedLevel;
        let maxLvl = parsed.currentLevel || 1;
        if (parsed.levelClears) {
          for (let l = 1; l <= 10; l++) {
            if ((parsed.levelClears[l] || 0) >= 3) {
              maxLvl = Math.max(maxLvl, l + 1);
            }
          }
        }
        return Math.min(10, maxLvl);
      }
    } catch {}
    return 1;
  });

  // Google AdSense & Legal Policy Modal
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab>('PRIVACY');
  const handleOpenPolicy = (tab: PolicyTab = 'PRIVACY') => {
    setPolicyModalTab(tab);
    setIsPolicyModalOpen(true);
  };

  // Lock notification toast
  const [lockAlertToast, setLockAlertToast] = useState<string | null>(null);

  // Daily attendance free hint toast (Resolves user pain point #1: Generous hint economy)
  const [attendanceToast, setAttendanceToast] = useState<string | null>(null);

  // Accessibility large font mode (Resolves user pain point #3: Small text for seniors/mobile)
  const [isLargeFont, setIsLargeFont] = useState<boolean>(() => {
    return localStorage.getItem('politics_crossword_large_font') === 'true';
  });

  const handleToggleLargeFont = () => {
    setIsLargeFont((prev) => {
      const next = !prev;
      localStorage.setItem('politics_crossword_large_font', String(next));
      return next;
    });
  };

  // Daily attendance bonus check on launch (+3 free hints daily)
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const lastAttendance = localStorage.getItem('politics_crossword_last_attendance');
      if (lastAttendance !== today) {
        localStorage.setItem('politics_crossword_last_attendance', today);
        setHintBalance((prev) => {
          const newBal = prev + 3;
          setAttendanceToast(`🎉 매일 출석 보너스! 무료 힌트 +3개가 충전되었습니다. (보유: ${newBal}개)`);
          return newBal;
        });
        setTimeout(() => setAttendanceToast(null), 6000);
      }
    } catch {}
  }, []);

  // Data restore synchronization
  const handleDataRestored = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
        if (parsed.currentLevel) setCurrentLevel(parsed.currentLevel);
        if (typeof parsed.clearCountInLevel === 'number') setClearCountInLevel(parsed.clearCountInLevel);
        if (parsed.levelClears) setLevelClears(parsed.levelClears);
        if (typeof parsed.hintBalance === 'number') setHintBalance(parsed.hintBalance);
        if (parsed.maxUnlockedLevel) setMaxUnlockedLevel(parsed.maxUnlockedLevel);
        if (parsed.boardRecords) setBoardRecords(parsed.boardRecords);
        if (parsed.solvedWords) setSolvedWordTerms(new Set(parsed.solvedWords));
        if (typeof parsed.isTested === 'boolean') setIsTested(parsed.isTested);
        if (parsed.selectedCategory && parsed.currentLevel) {
          loadBoard(parsed.currentLevel, (parsed.clearCountInLevel || 0) + 1, parsed.selectedCategory);
        }
      }
      const lf = localStorage.getItem('politics_crossword_large_font') === 'true';
      setIsLargeFont(lf);
    } catch {}
  };

  const [userThemeId, setUserThemeId] = useState<ThemeId | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active random themed background for the current level (1 of 3)
  const [activeBackground, setActiveBackground] = useState<BackgroundItem>(() =>
    getRandomBackgroundForLevel(currentLevel)
  );

  // Active theme: user selected or default for current level tier
  const activeThemeId: ThemeId = userThemeId || getDefaultThemeForLevel(currentLevel);
  const currentTheme = THEMES[activeThemeId] || THEMES.emerald;

  // --- Active Board & Game State ---
  const currentBoardNumber = Math.min(3, clearCountInLevel + 1);
  const [board, setBoard] = useState<BoardData>(() =>
    getBoardForCategoryAndLevel(selectedCategory, currentLevel, currentBoardNumber)
  );

  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array.from({ length: board.size || 9 }, () => Array(board.size || 9).fill(''))
  );

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<Direction>('across');
  const [activeWordId, setActiveWordId] = useState<string | null>(null);

  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [revealedChosungs, setRevealedChosungs] = useState<Set<string>>(new Set());

  // Bottom Navigation Active Tab ('CHALLENGE' | 'KNOWLEDGE' | 'WORDBOOK' | 'RECORDS' | 'MYPAGE')
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  // SEO & Deep Linking: Synchronize URL query parameters without reloading
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('category', selectedCategory.toLowerCase());
      if (activeTab === 'CHALLENGE') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', activeTab.toLowerCase());
      }
      window.history.replaceState(null, '', url.pathname + url.search);
    } catch {}
  }, [selectedCategory, activeTab]);

  // Game Stopwatch / Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Cleared Board Records History
  const [boardRecords, setBoardRecords] = useState<BoardRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).boardRecords || [];
    } catch {}
    return [];
  });

  // Solved Word Terms across all played boards
  const [solvedWordTerms, setSolvedWordTerms] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && JSON.parse(saved).solvedWords) {
        return new Set(JSON.parse(saved).solvedWords);
      }
    } catch {}
    return new Set<string>();
  });

  // Modals - Do NOT auto-open on initial page load (prevents AdSense alert screen violation)
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState<boolean>(false);
  const [isChosungModalOpen, setIsChosungModalOpen] = useState<boolean>(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const pwa = usePWAInstall();

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
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedCategory,
          currentLevel,
          clearCountInLevel,
          levelClears,
          isTested,
          hintBalance,
          maxUnlockedLevel,
          boardRecords,
          solvedWords: Array.from(solvedWordTerms),
        })
      );
    } catch {}
  }, [
    selectedCategory,
    currentLevel,
    clearCountInLevel,
    levelClears,
    isTested,
    hintBalance,
    maxUnlockedLevel,
    boardRecords,
    solvedWordTerms,
  ]);

  // Live Timer: runs when playing in CHALLENGE tab and no modal is blocking
  useEffect(() => {
    const isModalActive =
      isPlacementTestOpen ||
      isChosungModalOpen ||
      isAdModalOpen ||
      levelUpModal.isOpen ||
      isCertificateOpen;

    if (activeTab !== 'CHALLENGE' || isModalActive) {
      setIsTimerRunning(false);
      return;
    }

    setIsTimerRunning(true);
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [
    activeTab,
    isPlacementTestOpen,
    isChosungModalOpen,
    isAdModalOpen,
    levelUpModal.isOpen,
    isCertificateOpen,
  ]);

  // Load appropriate board when category, level, or boardNumber changes
  const loadBoard = useCallback((lvl: number, bNum: number, cat?: CategoryId) => {
    const targetCat = cat || selectedCategory;
    const newBoard = getBoardForCategoryAndLevel(targetCat, lvl, bNum);
    setBoard(newBoard);
    setUserGrid(Array.from({ length: newBoard.size || 9 }, () => Array(newBoard.size || 9).fill('')));
    setWrongCells(new Set());
    setRevealedChosungs(new Set());
    setActiveBackground((prev) => getRandomBackgroundForLevel(lvl, prev?.id));
    setElapsedSeconds(0); // Reset timer for fresh board run

    // Pick first word as active
    if (newBoard.placedWords.length > 0) {
      const first = newBoard.placedWords[0];
      setActiveWordId(first.id);
      setActiveDirection(first.direction);
      setSelectedCell({ row: first.startRow, col: first.startCol });
    }
  }, [selectedCategory]);

  // Switch category and load new puzzle
  const handleSelectCategory = (cat: CategoryId) => {
    setSelectedCategory(cat);
    loadBoard(currentLevel, currentBoardNumber, cat);
    sounds.playWordComplete();
  };

  // Initialize board selection on mount
  useEffect(() => {
    if (board.placedWords.length > 0 && !selectedCell) {
      const first = board.placedWords[0];
      setActiveWordId(first.id);
      setActiveDirection(first.direction);
      setSelectedCell({ row: first.startRow, col: first.startCol });
    }
  }, [board, selectedCell]);

  // Map of active word object
  const activeWord = useMemo(() => {
    if (!activeWordId) return board.placedWords[0] || null;
    return board.placedWords.find((w) => w.id === activeWordId) || null;
  }, [board.placedWords, activeWordId]);

  // Check if selected cell is an intersection of across & down words
  const isIntersection = useMemo(() => {
    if (!selectedCell) return false;
    const { row, col } = selectedCell;
    const count = board.placedWords.filter((pw) => {
      if (pw.direction === 'across') {
        return pw.startRow === row && col >= pw.startCol && col < pw.startCol + pw.length;
      } else {
        return pw.startCol === col && row >= pw.startRow && row < pw.startRow + pw.length;
      }
    }).length;
    return count > 1;
  }, [selectedCell, board.placedWords]);

  // Set of completed word IDs
  const completedWordIds = useMemo(() => {
    const completed = new Set<string>();
    board.placedWords.forEach((pw) => {
      let isWordMatch = true;
      for (let i = 0; i < pw.length; i++) {
        const r = pw.direction === 'across' ? pw.startRow : pw.startRow + i;
        const c = pw.direction === 'across' ? pw.startCol + i : pw.startCol;
        if (userGrid[r]?.[c] !== pw.term[i]) {
          isWordMatch = false;
          break;
        }
      }
      if (isWordMatch) {
        completed.add(pw.id);
      }
    });
    return completed;
  }, [board.placedWords, userGrid]);

  // Unique syllables from current puzzle words for mobile quick keypad
  const puzzleLetters = useMemo(() => {
    const set = new Set<string>();
    board.placedWords.forEach((pw) => {
      for (const char of pw.term) {
        if (isCompleteSyllable(char)) {
          set.add(char);
        }
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [board.placedWords]);

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    const cell = board.grid[r][c];
    if (!cell.isActive) return;

    // Check words covering this cell
    const wordsAtCell = board.placedWords.filter((pw) => {
      if (pw.direction === 'across') {
        return pw.startRow === r && c >= pw.startCol && c < pw.startCol + pw.length;
      } else {
        return pw.startCol === c && r >= pw.startRow && r < pw.startRow + pw.length;
      }
    });

    if (wordsAtCell.length === 0) return;

    // If clicking same cell, toggle direction if cell is an intersection
    if (selectedCell?.row === r && selectedCell?.col === c) {
      if (wordsAtCell.length > 1) {
        const nextWord = wordsAtCell.find((w) => w.direction !== activeDirection) || wordsAtCell[0];
        setActiveDirection(nextWord.direction);
        setActiveWordId(nextWord.id);
      }
      return;
    }

    // New cell clicked
    setSelectedCell({ row: r, col: c });
    const matchingWord =
      wordsAtCell.find((w) => w.direction === activeDirection) || wordsAtCell[0];
    if (matchingWord) {
      setActiveDirection(matchingWord.direction);
      setActiveWordId(matchingWord.id);
    }
  };

  // Toggle direction explicitly
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
    }
  };

  // Select a word from the Clues list
  const handleSelectWord = (word: PlacedWord) => {
    setActiveWordId(word.id);
    setActiveDirection(word.direction);
    let targetCell = { row: word.startRow, col: word.startCol };
    for (let i = 0; i < word.length; i++) {
      const r = word.direction === 'across' ? word.startRow : word.startRow + i;
      const c = word.direction === 'across' ? word.startCol + i : word.startCol;
      if (!userGrid[r]?.[c]) {
        targetCell = { row: r, col: c };
        break;
      }
    }
    setSelectedCell(targetCell);
    sounds.playKey();
  };

  // Previous & Next Word
  const handlePrevWord = () => {
    const currentIdx = board.placedWords.findIndex((w) => w.id === activeWordId);
    const prevIdx = (currentIdx - 1 + board.placedWords.length) % board.placedWords.length;
    handleSelectWord(board.placedWords[prevIdx]);
  };

  const handleNextWord = () => {
    const currentIdx = board.placedWords.findIndex((w) => w.id === activeWordId);
    const nextIdx = (currentIdx + 1) % board.placedWords.length;
    handleSelectWord(board.placedWords[nextIdx]);
  };

  // Check if entire board is solved
  const checkBoardCompletion = useCallback(
    (newGrid: string[][]) => {
      let allCorrect = true;
      for (const pw of board.placedWords) {
        for (let i = 0; i < pw.length; i++) {
          const r = pw.direction === 'across' ? pw.startRow : pw.startRow + i;
          const c = pw.direction === 'across' ? pw.startCol + i : pw.startCol;
          if (newGrid[r]?.[c] !== pw.term[i]) {
            allCorrect = false;
            break;
          }
        }
        if (!allCorrect) break;
      }

      if (allCorrect) {
        sounds.playVictory();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

        const currentClearTime = elapsedSeconds;
        const nextCount = clearCountInLevel + 1;
        const newClears = { ...levelClears, [currentLevel]: Math.max(levelClears[currentLevel] || 0, nextCount) };
        setLevelClears(newClears);

        // Record clear history
        const newRec: BoardRecord = {
          id: `rec_${Date.now()}`,
          category: selectedCategory,
          level: currentLevel,
          boardNumber: currentBoardNumber,
          timeSeconds: currentClearTime,
          date: new Date().toISOString(),
          wordCount: board.placedWords.length,
        };
        setBoardRecords((prev) => [newRec, ...prev]);

        // Mark solved words for the Wordbook
        setSolvedWordTerms((prev) => {
          const updated = new Set(prev);
          board.placedWords.forEach((pw) => updated.add(pw.term));
          return updated;
        });

        if (nextCount < 3) {
          setClearCountInLevel(nextCount);
          setLevelUpModal({
            isOpen: true,
            type: 'board_cleared',
            clearedBoardNumber: nextCount,
            clearTimeSeconds: currentClearTime,
          });
        } else {
          // Gate Cleared! Unlock next level gate
          const nextLvl = Math.min(10, currentLevel + 1);
          setMaxUnlockedLevel((prev) => Math.max(prev, nextLvl));

          if (currentLevel < 10) {
            setLevelUpModal({
              isOpen: true,
              type: 'level_cleared',
              clearedBoardNumber: 3,
              clearTimeSeconds: currentClearTime,
            });
          } else {
            setLevelUpModal({
              isOpen: true,
              type: 'master_cleared',
              clearedBoardNumber: 3,
              clearTimeSeconds: currentClearTime,
            });
          }
        }
      }
    },
    [
      board.placedWords,
      clearCountInLevel,
      currentLevel,
      currentBoardNumber,
      elapsedSeconds,
      levelClears,
      maxUnlockedLevel,
      selectedCategory,
    ]
  );

  // Cell character input handler with smart Korean Hangul composition
  const handleCellInput = (r: number, c: number, char: string) => {
    const trimmed = char.trim();
    if (!trimmed) return;

    sounds.playKey();

    // Check if user entered multiple characters at once (e.g. pasted or typed entire word like "비례대표")
    if (trimmed.length > 1 && Array.from(trimmed).every(ch => isCompleteSyllable(ch))) {
      const syllables = Array.from(trimmed);
      const newGrid = userGrid.map((rowArr) => [...rowArr]);

      let nextPos = { row: r, col: c };
      if (activeWord) {
        let startIdx = 0;
        for (let i = 0; i < activeWord.length; i++) {
          const wr = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
          const wc = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
          if (wr === r && wc === c) {
            startIdx = i;
            break;
          }
        }
        syllables.forEach((syl, offset) => {
          const wordIdx = startIdx + offset;
          if (wordIdx < activeWord.length) {
            const cellR = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + wordIdx;
            const cellC = activeWord.direction === 'across' ? activeWord.startCol + wordIdx : activeWord.startCol;
            newGrid[cellR][cellC] = syl;
            nextPos = { row: cellR, col: cellC };
          }
        });
      } else {
        newGrid[r][c] = syllables[0];
      }
      setUserGrid(newGrid);
      setSelectedCell(nextPos);
      checkBoardCompletion(newGrid);
      return;
    }

    const prevChar = userGrid[r]?.[c] || '';
    const solutionChar = board.grid[r]?.[c]?.solutionChar || '';

    // Smart Korean Hangul Assembly
    const { currentCell, nextCell, shouldAdvance } = combineHangulInput(
      prevChar,
      trimmed,
      solutionChar
    );

    const newGrid = userGrid.map((rowArr, rowIdx) =>
      rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? currentCell : val))
    );

    if (wrongCells.has(`${r}-${c}`)) {
      const updated = new Set(wrongCells);
      updated.delete(`${r}-${c}`);
      setWrongCells(updated);
    }

    // Determine cursor movement and handle consonant overflow to next cell
    if (shouldAdvance && activeWord) {
      let currentIndex = -1;
      for (let i = 0; i < activeWord.length; i++) {
        const wr = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
        const wc = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
        if (wr === r && wc === c) {
          currentIndex = i;
          break;
        }
      }

      if (currentIndex !== -1 && currentIndex < activeWord.length - 1) {
        const nextR =
          activeWord.direction === 'across'
            ? activeWord.startRow
            : activeWord.startRow + currentIndex + 1;
        const nextC =
          activeWord.direction === 'across'
            ? activeWord.startCol + currentIndex + 1
            : activeWord.startCol;

        // If an overflow consonant exists (e.g. typing 'ㄹ' after '비' for '비례')
        if (nextCell) {
          newGrid[nextR][nextC] = nextCell;
        }

        setSelectedCell({ row: nextR, col: nextC });
      }
    }

    setUserGrid(newGrid);

    // Play word complete sound if active word was just finished
    if (activeWord && !completedWordIds.has(activeWord.id)) {
      let isWordMatch = true;
      for (let i = 0; i < activeWord.length; i++) {
        const wr = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
        const wc = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
        if (newGrid[wr]?.[wc] !== activeWord.term[i]) {
          isWordMatch = false;
          break;
        }
      }
      if (isWordMatch) {
        sounds.playWordComplete();
      }
    }

    checkBoardCompletion(newGrid);
  };

  // Backspace handler with Korean Hangul stepwise decomposition
  const handleCellBackspace = (r: number, c: number) => {
    sounds.playKey();
    const currentVal = userGrid[r]?.[c] || '';

    if (currentVal) {
      // If current syllable has a final consonant (받침), remove just the final consonant first
      if (isCompleteSyllable(currentVal)) {
        const dec = decompose(currentVal);
        if (dec && dec.jong) {
          const withoutJong = compose(dec.cho, dec.jung, '');
          const newGrid = userGrid.map((rowArr, rowIdx) =>
            rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? withoutJong : val))
          );
          setUserGrid(newGrid);
          return;
        } else if (dec) {
          // If current syllable is 초성+중성 (no 받침, e.g. '비'), remove vowel to leave 초성 ('ㅂ')
          const newGrid = userGrid.map((rowArr, rowIdx) =>
            rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? dec.cho : val))
          );
          setUserGrid(newGrid);
          return;
        }
      }

      // Standalone consonant or single character: clear current cell
      const newGrid = userGrid.map((rowArr, rowIdx) =>
        rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? '' : val))
      );
      setUserGrid(newGrid);
    } else {
      // Cell is already empty: move back to previous cell and clear it
      if (activeWord) {
        let currentIndex = -1;
        for (let i = 0; i < activeWord.length; i++) {
          const wr =
            activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
          const wc =
            activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
          if (wr === r && wc === c) {
            currentIndex = i;
            break;
          }
        }

        if (currentIndex > 0) {
          const prevR =
            activeWord.direction === 'across'
              ? activeWord.startRow
              : activeWord.startRow + currentIndex - 1;
          const prevC =
            activeWord.direction === 'across'
              ? activeWord.startCol + currentIndex - 1
              : activeWord.startCol;
          setSelectedCell({ row: prevR, col: prevC });

          const newGrid = userGrid.map((rowArr, rowIdx) =>
            rowArr.map((val, colIdx) => (rowIdx === prevR && colIdx === prevC ? '' : val))
          );
          setUserGrid(newGrid);
        }
      }
    }
  };

  // Next Cell
  const handleNextCell = () => {
    if (!selectedCell || !activeWord) return;
    const { row, col } = selectedCell;
    let currentIndex = -1;
    for (let i = 0; i < activeWord.length; i++) {
      const wr = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
      const wc = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
      if (wr === row && wc === col) {
        currentIndex = i;
        break;
      }
    }
    if (currentIndex !== -1 && currentIndex < activeWord.length - 1) {
      const nextR = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currentIndex + 1;
      const nextC = activeWord.direction === 'across' ? activeWord.startCol + currentIndex + 1 : activeWord.startCol;
      setSelectedCell({ row: nextR, col: nextC });
    }
  };

  // Prev Cell
  const handlePrevCell = () => {
    if (!selectedCell || !activeWord) return;
    const { row, col } = selectedCell;
    let currentIndex = -1;
    for (let i = 0; i < activeWord.length; i++) {
      const wr = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
      const wc = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
      if (wr === row && wc === col) {
        currentIndex = i;
        break;
      }
    }
    if (currentIndex > 0) {
      const prevR = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + currentIndex - 1;
      const prevC = activeWord.direction === 'across' ? activeWord.startCol + currentIndex - 1 : activeWord.startCol;
      setSelectedCell({ row: prevR, col: prevC });
    }
  };

  // Arrow key navigation
  const handleNavigate = (dRow: number, dCol: number) => {
    if (!selectedCell) return;
    const size = board.size || 9;
    let newR = selectedCell.row + dRow;
    let newC = selectedCell.col + dCol;

    while (newR >= 0 && newR < size && newC >= 0 && newC < size) {
      if (board.grid[newR][newC].isActive) {
        sounds.playKey();
        handleCellClick(newR, newC);
        return;
      }
      newR += dRow;
      newC += dCol;
    }
  };

  // -------------------------------------------------------------
  // HINT LOGIC:
  // - 3 Free Hints initially
  // - Clicking hint opens Chosung Modal popup and decrements 1
  // - When 0 hints remain, opens Rewarded Ad Modal to replenish!
  // -------------------------------------------------------------
  const handleRequestHint = () => {
    if (hintBalance > 0) {
      setHintBalance((prev) => Math.max(0, prev - 1));
      setIsChosungModalOpen(true);
    } else {
      setIsAdModalOpen(true);
    }
  };

  // Apply chosung to current active word's cells on the board
  const handleApplyChosungToBoard = () => {
    if (!activeWord) return;
    const newRevealed = new Set(revealedChosungs);
    for (let i = 0; i < activeWord.length; i++) {
      const r = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
      const c = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
      newRevealed.add(`${r}-${c}`);
    }
    setRevealedChosungs(newRevealed);
  };

  // Ad reward granted (+2 hints)
  const handleAdReward = (earnedHints: number) => {
    setHintBalance((prev) => prev + earnedHints);
  };

  // Controls: Check Wrong Answers
  const handleCheckWrong = () => {
    const wrong = new Set<string>();
    board.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.isActive) {
          const userChar = userGrid[r]?.[c];
          if (userChar && userChar !== cell.solutionChar) {
            wrong.add(`${r}-${c}`);
          }
        }
      });
    });

    if (wrong.size > 0) {
      sounds.playError();
      setWrongCells(wrong);
      setTimeout(() => {
        setWrongCells(new Set());
      }, 2500);
    } else {
      sounds.playWordComplete();
    }
  };

  // Controls: Clear Active Word
  const handleClearActiveWord = () => {
    if (!activeWord) return;
    const newGrid = userGrid.map((rowArr, r) =>
      rowArr.map((val, c) => {
        let isInWord = false;
        if (activeWord.direction === 'across') {
          isInWord = r === activeWord.startRow && c >= activeWord.startCol && c < activeWord.startCol + activeWord.length;
        } else {
          isInWord = c === activeWord.startCol && r >= activeWord.startRow && r < activeWord.startRow + activeWord.length;
        }
        return isInWord ? '' : val;
      })
    );
    setUserGrid(newGrid);
    setSelectedCell({ row: activeWord.startRow, col: activeWord.startCol });
  };

  // Controls: Reset Board
  const handleResetBoard = () => {
    const size = board.size || 9;
    setUserGrid(Array.from({ length: size }, () => Array(size).fill('')));
    setWrongCells(new Set());
  };

  // Controls: Generate Fresh Board
  const handleGenerateNewBoard = () => {
    const fresh = generateFreshBoard(currentLevel, currentBoardNumber, selectedCategory);
    setBoard(fresh);
    setUserGrid(Array.from({ length: fresh.size }, () => Array(fresh.size).fill('')));
    setWrongCells(new Set());
    setRevealedChosungs(new Set());
    setActiveBackground((prev) => getRandomBackgroundForLevel(currentLevel, prev?.id));
    setElapsedSeconds(0);
    if (fresh.placedWords.length > 0) {
      const first = fresh.placedWords[0];
      setActiveWordId(first.id);
      setActiveDirection(first.direction);
      setSelectedCell({ row: first.startRow, col: first.startCol });
    }
  };

  // Placement Test Completion
  const handleTestComplete = (recLevel: number) => {
    setIsTested(true);
    setIsPlacementTestOpen(false);
    setMaxUnlockedLevel((prev) => Math.max(prev, recLevel));
    setCurrentLevel(recLevel);
    setClearCountInLevel(0);
    loadBoard(recLevel, 1, selectedCategory);
  };

  // Next Board in Level
  const handleNextBoard = () => {
    setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
    loadBoard(currentLevel, clearCountInLevel + 1, selectedCategory);
  };

  // Level Up to Next Level
  const handleNextLevel = () => {
    setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
    const nextLvl = Math.min(10, currentLevel + 1);
    setMaxUnlockedLevel((prev) => Math.max(prev, nextLvl));
    setCurrentLevel(nextLvl);
    setClearCountInLevel(0);
    loadBoard(nextLvl, 1, selectedCategory);
  };

  // Reset all game data back to initial defaults
  const handleResetProgress = () => {
    sounds.playKey();
    setCurrentLevel(1);
    setMaxUnlockedLevel(1);
    setClearCountInLevel(0);
    setLevelClears({});
    setHintBalance(3);
    setBoardRecords([]);
    setSolvedWordTerms(new Set());
    localStorage.removeItem(STORAGE_KEY);
    loadBoard(1, 1, selectedCategory);
    setActiveTab('CHALLENGE');
  };

  const selectedCellChar = selectedCell ? userGrid[selectedCell.row]?.[selectedCell.col] || '' : '';

  return (
    <div
      className="min-h-screen text-slate-800 pb-16 font-sans relative bg-fixed bg-cover bg-center overflow-x-hidden transition-all duration-300"
      style={{ backgroundImage: `url('${activeBackground.url}')` }}
    >
      {/* 50% Translucent atmosphere overlay so the level background is clearly visible! */}
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px] pointer-events-none -z-0" />

      <div className="relative z-10">
        {/* 1. Top Header with Date Badge & Timer & App Install */}
        <WorkbookHeader
          currentLevel={currentLevel}
          clearCountInLevel={clearCountInLevel}
          selectedCategory={selectedCategory}
          elapsedSeconds={elapsedSeconds}
          isTimerRunning={isTimerRunning}
          onOpenTest={() => setIsPlacementTestOpen(true)}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* Locked Gate Alert Banner */}
        {lockAlertToast && (
          <div className="max-w-md mx-auto my-2 px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span>{lockAlertToast}</span>
            <button
              onClick={() => setLockAlertToast(null)}
              className="ml-3 font-black text-amber-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Daily Attendance Bonus Toast */}
        {attendanceToast && (
          <div className="max-w-md mx-auto my-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-1.5">{attendanceToast}</span>
            <button
              onClick={() => setAttendanceToast(null)}
              className="ml-3 text-emerald-200 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: CHALLENGE (도전 - 메인 크로스워드 퍼즐 플레이) */}
        {/* ============================================================== */}
        {activeTab === 'CHALLENGE' && (
          <>
            {/* Unified Category & Level Bar: 분야와 레벨을 같은 줄에 배치하고 클릭 시 위아래로 선택 메뉴 노출 */}
            <CategoryLevelBar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
              currentLevel={currentLevel}
              maxUnlockedLevel={maxUnlockedLevel}
              levelClears={levelClears}
              onSelectLevel={(lvl) => {
                if (lvl > maxUnlockedLevel) {
                  return;
                }
                setCurrentLevel(lvl);
                setClearCountInLevel(0);
                loadBoard(lvl, 1, selectedCategory);
              }}
              onLockedClick={(lvl) => {
                setLockAlertToast(`🔒 Lv.${lvl}은 아직 잠겨 있습니다. 이전 레벨(Lv.${lvl - 1})의 3판 관문을 모두 클리어하거나 레벨 진단으로 해금하세요!`);
                setTimeout(() => setLockAlertToast(null), 3500);
              }}
            />

            {/* Friendly Non-intrusive Placement Test Invitation */}
            {!isTested && (
              <aside
                aria-label="어휘 레벨 진단 안내"
                className="max-w-5xl mx-auto px-2 sm:px-3 my-0.5"
              >
                <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 border border-sky-200/80 rounded-xl px-3 py-1.5 shadow-2xs flex items-center justify-between gap-2 text-slate-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">🎯</span>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      내 실력에 딱 맞는 레벨이 궁금하다면? <span className="text-slate-500 font-normal hidden sm:inline">5문항 1분 레벨 진단</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playKey();
                      setIsPlacementTestOpen(true);
                    }}
                    className="px-2.5 py-1 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs rounded-lg shadow-2xs transition shrink-0 cursor-pointer text-center"
                  >
                    레벨 진단
                  </button>
                </div>
              </aside>
            )}

            {/* 3. Main Play Area */}
            <main className="w-full max-w-6xl mx-auto px-0 sm:px-3 mt-0.5 pb-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
                {/* Left / Center: Unified Interactive Play Area ("Merged Box") */}
                <div className="lg:col-span-7 flex flex-col items-center w-full px-0 sm:px-1">
                  <div className="w-full max-w-[min(100vw,580px)] mx-auto bg-white/95 backdrop-blur-md rounded-none sm:rounded-3xl border-y sm:border border-slate-200/90 shadow-md sm:shadow-lg overflow-hidden flex flex-col">
                    {/* 1. Crossword Board */}
                    <CrosswordBoard
                      board={board}
                      theme={currentTheme}
                      userGrid={userGrid}
                      activeWord={activeWord}
                      activeDirection={activeDirection}
                      selectedCell={selectedCell}
                      wrongCells={wrongCells}
                      revealedChosungs={revealedChosungs}
                      isLargeFont={isLargeFont}
                      onCellClick={handleCellClick}
                      onCellInput={handleCellInput}
                      onCellBackspace={handleCellBackspace}
                      onNavigate={handleNavigate}
                      currentPageNumber={currentLevel}
                    />

                    {/* 2. Prominent Clue / Help Card */}
                    <ActiveClueCard
                      activeWord={activeWord}
                      activeDirection={activeDirection}
                      theme={currentTheme}
                      isIntersection={isIntersection}
                      hintBalance={hintBalance}
                      isLargeFont={isLargeFont}
                      selectedCategory={selectedCategory}
                      onRequestHint={handleRequestHint}
                      onToggleDirection={handleToggleDirection}
                      onPrevWord={handlePrevWord}
                      onNextWord={handleNextWord}
                      isCompleted={activeWord ? completedWordIds.has(activeWord.id) : false}
                      userGrid={userGrid}
                    />

                    {/* 3. In-Game Controls */}
                    <GameControls
                      hintBalance={hintBalance}
                      onRequestHint={handleRequestHint}
                      onCheckWrong={handleCheckWrong}
                      onClearActiveWord={handleClearActiveWord}
                      onResetBoard={handleResetBoard}
                      onGenerateNewBoard={handleGenerateNewBoard}
                    />

                    {/* 4. Virtual Hangul Keypad */}
                    <VirtualHangulKeypad
                      currentCellChar={selectedCellChar}
                      puzzleLetters={puzzleLetters}
                      onInputChar={(char) => {
                        if (selectedCell) {
                          handleCellInput(selectedCell.row, selectedCell.col, char);
                        }
                      }}
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

                {/* Right: Across & Down Clues Lists */}
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

            {/* Current Puzzle Word Encyclopedia & Study Guide (High Publisher Content) */}
            <PuzzleStageKnowledgeGuide
              placedWords={board.placedWords}
              categoryName={getCategoryMeta(selectedCategory).name}
              level={currentLevel}
              boardNumber={board.boardNumber}
              completedWordIds={completedWordIds}
              onSelectWord={handleSelectWord}
            />

            {/* High-Value Publisher Content: 8대 분야 시사·교양 심층 지식 백과 & 상식 학습 칼럼 */}
            <section className="max-w-6xl mx-auto px-3 sm:px-4 my-6" aria-label="8대 지식 탐구 백과">
              <KnowledgeArticleHub
                initialCategory={selectedCategory}
                onSelectCategoryForPuzzle={(catId) => {
                  handleSelectCategory(catId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showAdInside={false}
              />
            </section>
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 2: KNOWLEDGE (지식백과 - 8대 영역 심층 칼럼 및 용어 사전) */}
        {/* ============================================================== */}
        {activeTab === 'KNOWLEDGE' && (
          <main className="max-w-6xl mx-auto px-3 sm:px-4 mt-2 pb-24">
            <KnowledgeArticleHub
              initialCategory={selectedCategory}
              onSelectCategoryForPuzzle={(catId) => {
                handleSelectCategory(catId);
                setActiveTab('CHALLENGE');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showAdInside={true}
            />
          </main>
        )}

        {/* ============================================================== */}
        {/* TAB 2: RECORDS (내기록 - 통계, 히스토리, 타임어택) */}
        {/* ============================================================== */}
        {activeTab === 'RECORDS' && (
          <RecordsView
            levelClears={levelClears}
            boardRecords={boardRecords}
            maxUnlockedLevel={maxUnlockedLevel}
            currentLevel={currentLevel}
            onGoToPlay={() => setActiveTab('CHALLENGE')}
          />
        )}

        {/* ============================================================== */}
        {/* TAB 3: WORDBOOK (낱말사전 - 정치 용어사전 및 학습 완료 체크) */}
        {/* ============================================================== */}
        {activeTab === 'WORDBOOK' && (
          <WordbookView
            maxUnlockedLevel={maxUnlockedLevel}
            solvedWordTerms={solvedWordTerms}
            initialCategory={selectedCategory}
          />
        )}

        {/* ============================================================== */}
        {/* TAB 4: MYPAGE (마이페이지 - 프로필, 인증서, 힌트 충전, 설정) */}
        {/* ============================================================== */}
        {activeTab === 'MYPAGE' && (
          <MyPageView
            currentLevel={currentLevel}
            maxUnlockedLevel={maxUnlockedLevel}
            hintBalance={hintBalance}
            currentTheme={currentTheme}
            isMuted={isMuted}
            isLargeFont={isLargeFont}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onSelectTheme={(themeId) => setUserThemeId(themeId)}
            onToggleSound={() => {
              sounds.isMuted = !isMuted;
              setIsMuted(!isMuted);
            }}
            onToggleLargeFont={handleToggleLargeFont}
            onOpenTest={() => setIsPlacementTestOpen(true)}
            onOpenAdModal={() => setIsAdModalOpen(true)}
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenPolicy={handleOpenPolicy}
            onResetProgress={handleResetProgress}
            onDataRestored={handleDataRestored}
          />
        )}

        {/* Google AdSense Responsive Banner Slot (Rendered alongside rich publisher content) */}
        {activeTab !== 'KNOWLEDGE' && (
          <AdBannerSlot slotId="crossword_bottom_banner" />
        )}

        {/* Global Footer with Google AdSense Compliant Policy Links */}
        <SiteFooter onOpenPolicy={handleOpenPolicy} />
      </div>

      {/* Persistent Mobile Bottom Navigation Bar */}
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

      {/* 4. Placement Test Modal (Direct Input Mode) */}
      <PoliticsPlacementTest
        isOpen={isPlacementTestOpen}
        selectedCategory={selectedCategory}
        onClose={() => setIsPlacementTestOpen(false)}
        onComplete={handleTestComplete}
      />

      {/* 5. Chosung Hint Popup Modal */}
      <ChosungHintModal
        isOpen={isChosungModalOpen}
        onClose={() => setIsChosungModalOpen(false)}
        activeWord={activeWord}
        hintBalance={hintBalance}
        onApplyToBoard={handleApplyChosungToBoard}
      />

      {/* 6. Rewarded Ad Modal (Next Update Integration Ready) */}
      <RewardedAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onReward={handleAdReward}
      />

      {/* 7. Level Up / Board Clear Modal */}
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
          setIsCertificateOpen(true);
        }}
      />

      {/* 8. Master Certificate Modal */}
      <MasterCertificate
        isOpen={isCertificateOpen}
        selectedCategory={selectedCategory}
        onClose={() => setIsCertificateOpen(false)}
      />

      {/* 9. Legal Policies & Google AdSense Compliance Modal */}
      <LegalPolicyModal
        isOpen={isPolicyModalOpen}
        initialTab={policyModalTab}
        onClose={() => setIsPolicyModalOpen(false)}
      />

      {/* 10. PWA App Install Modal with Real App Icon */}
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
