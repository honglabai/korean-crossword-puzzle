import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { BoardData, CategoryId } from './types/puzzle';
import { ThemeId } from './types/theme';
import { WorkbookHeader } from './components/WorkbookHeader';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { PolicyTab } from './components/LegalPolicyModal';
import { SiteFooter } from './components/SiteFooter';
import { AdBannerSlot } from './components/AdBannerSlot';
import { usePWAInstall } from './utils/usePWAInstall';
import { HomeScreen } from './features/home/HomeScreen';
import {
  loadUserSaveData,
  saveUserSaveData,
  processDailyAttendance,
  isCategoryMasterEligible,
  ALL_CATEGORIES,
} from './services/storageService';
import { getDailyBoard } from './services/dailyService';
import { UserSaveData, FontSizeSetting } from './types/progress';
import { sounds } from './utils/audio';

// Code-split tabs and modals loaded lazily on demand
const ChallengeView = lazy(() =>
  import('./features/challenge/ChallengeView').then((m) => ({ default: m.ChallengeView }))
);
const KnowledgeHubView = lazy(() =>
  import('./features/learning/KnowledgeHubView').then((m) => ({ default: m.KnowledgeHubView }))
);
const RecordsView = lazy(() =>
  import('./components/RecordsView').then((m) => ({ default: m.RecordsView }))
);
const MyPageView = lazy(() =>
  import('./components/MyPageView').then((m) => ({ default: m.MyPageView }))
);
const DailyChallengeModal = lazy(() =>
  import('./features/daily/DailyChallengeModal').then((m) => ({ default: m.DailyChallengeModal }))
);
const AchievementsModal = lazy(() =>
  import('./features/achievements/AchievementsModal').then((m) => ({ default: m.AchievementsModal }))
);
const MasterCertificate = lazy(() =>
  import('./components/MasterCertificate').then((m) => ({ default: m.MasterCertificate }))
);
const CategorySelectorModal = lazy(() =>
  import('./components/CategorySelectorModal').then((m) => ({ default: m.CategorySelectorModal }))
);
const LegalPolicyModal = lazy(() =>
  import('./components/LegalPolicyModal').then((m) => ({ default: m.LegalPolicyModal }))
);
const InstallAppModal = lazy(() =>
  import('./components/InstallAppModal').then((m) => ({ default: m.InstallAppModal }))
);

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
  const clearCountInLevel = currentCatProgress.clearCountInLevel || 0;
  const maxUnlockedLevel = currentCatProgress.maxUnlockedLevel;
  const boardRecords = saveData.records;
  const solvedWordTerms = useMemo(() => new Set(saveData.solvedWordTerms), [saveData.solvedWordTerms]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  // Custom Daily Board
  const [customDailyBoard, setCustomDailyBoard] = useState<BoardData | null>(null);

  // Timer state for Header
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Global Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState<boolean>(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [certificateCategory, setCertificateCategory] = useState<CategoryId>(selectedCategory);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab>('PRIVACY');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Audio mute
  const [isMuted, setIsMuted] = useState<boolean>(() => saveData.settings.isMuted);
  useEffect(() => {
    sounds.isMuted = isMuted;
  }, [isMuted]);

  const pwa = usePWAInstall();

  // Category switch
  const handleSelectCategory = useCallback(
    (cat: CategoryId) => {
      sounds.playKey();
      setCustomDailyBoard(null);
      setSaveData((prev) => {
        const next = { ...prev, selectedCategory: cat };
        saveUserSaveData(next);
        return next;
      });
    },
    []
  );

  const handleUpdateSaveData = useCallback((updater: (prev: UserSaveData) => UserSaveData) => {
    setSaveData((prev) => {
      const next = updater(prev);
      saveUserSaveData(next);
      return next;
    });
  }, []);

  const handleResumeGame = useCallback(
    (cat: CategoryId) => {
      sounds.playKey();
      handleSelectCategory(cat);
      setActiveTab('CHALLENGE');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [handleSelectCategory]
  );

  const handleStartDailyChallenge = useCallback(() => {
    sounds.playKey();
    setIsDailyModalOpen(false);
    const daily = getDailyBoard();
    setCustomDailyBoard(daily);
    setActiveTab('CHALLENGE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenCertificate = useCallback((cat: CategoryId) => {
    sounds.playKey();
    setCertificateCategory(cat);
    setIsCertificateOpen(true);
  }, []);

  const handleOpenPolicy = useCallback((tab: PolicyTab) => {
    sounds.playKey();
    setPolicyModalTab(tab);
    setIsPolicyModalOpen(true);
  }, []);

  const handleChangeFontSize = useCallback((size: FontSizeSetting) => {
    sounds.playKey();
    handleUpdateSaveData((prev) => ({
      ...prev,
      settings: { ...prev.settings, fontSize: size },
    }));
  }, [handleUpdateSaveData]);

  const handleToggleHighContrast = useCallback(() => {
    sounds.playKey();
    handleUpdateSaveData((prev) => ({
      ...prev,
      settings: { ...prev.settings, highContrast: !prev.settings.highContrast },
    }));
  }, [handleUpdateSaveData]);

  const handleResetProgress = useCallback(() => {
    if (!window.confirm('모든 학습 진도와 기록을 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
      return;
    }
    localStorage.clear();
    const refreshed = loadUserSaveData();
    setSaveData(refreshed);
    setCustomDailyBoard(null);
  }, []);

  const handleClaimAchievementReward = useCallback(
    (achievementId: string) => {
      sounds.playKey();
      handleUpdateSaveData((prev) => {
        const ach = prev.achievements.find((a) => a.id === achievementId);
        if (!ach || ach.rewardClaimed) return prev;

        const nextAchievements = prev.achievements.map((a) =>
          a.id === achievementId ? { ...a, rewardClaimed: true } : a
        );

        return {
          ...prev,
          hintBalance: prev.hintBalance + ach.rewardHints,
          achievements: nextAchievements,
        };
      });
    },
    [handleUpdateSaveData]
  );

  const certEligibility = useMemo(() => {
    const prog = saveData.categoryProgress[certificateCategory] || {
      currentLevel: 1,
      maxUnlockedLevel: 1,
      levelClears: {},
      totalClearedBoards: 0,
      isMasterCompleted: false,
    };
    return isCategoryMasterEligible(certificateCategory, prog);
  }, [saveData.categoryProgress, certificateCategory]);

  const fontScaleClass =
    saveData.settings.fontSize === 'huge'
      ? 'text-lg leading-relaxed'
      : saveData.settings.fontSize === 'large'
      ? 'text-base leading-normal'
      : 'text-sm';

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-800 transition-colors duration-200 select-none ${
        saveData.settings.highContrast ? 'contrast-125 grayscale-[20%]' : ''
      } ${fontScaleClass}`}
    >
      <div className="w-full">
        {/* Top Header */}
        <WorkbookHeader
          currentLevel={currentLevel}
          clearCountInLevel={clearCountInLevel}
          selectedCategory={selectedCategory}
          elapsedSeconds={elapsedSeconds}
          isTimerRunning={isTimerRunning}
          onOpenTest={() => {
            setActiveTab('CHALLENGE');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
          <Suspense fallback={<div className="p-8 text-center text-slate-600 font-bold">퍼즐을 불러오는 중입니다...</div>}>
            <ChallengeView
              saveData={saveData}
              selectedCategory={selectedCategory}
              onUpdateSaveData={handleUpdateSaveData}
              onSelectCategory={handleSelectCategory}
              onOpenCertificate={handleOpenCertificate}
              fontSize={saveData.settings.fontSize}
              userThemeId={(saveData.settings.themeId as ThemeId) || 'classic'}
              customDailyBoard={customDailyBoard}
              onClearCustomDailyBoard={() => setCustomDailyBoard(null)}
              onTimerTick={(sec, running) => {
                setElapsedSeconds(sec);
                setIsTimerRunning(running);
              }}
            />
          </Suspense>
        )}

        {/* TAB 3: KNOWLEDGE */}
        {activeTab === 'KNOWLEDGE' && (
          <Suspense fallback={<div className="p-8 text-center text-slate-600 font-bold">지식 백과를 불러오는 중입니다...</div>}>
            <KnowledgeHubView
              selectedCategory={selectedCategory}
              maxUnlockedLevel={maxUnlockedLevel}
              solvedWordTerms={solvedWordTerms}
              onSelectCategory={handleSelectCategory}
              wrongWords={saveData.wrongWords}
              onMarkMastered={(term) => {
                handleUpdateSaveData((prev) => ({
                  ...prev,
                  wrongWords: prev.wrongWords.map((w) =>
                    w.term === term ? { ...w, mastered: !w.mastered } : w
                  ),
                }));
              }}
              onClearMistake={(term) => {
                handleUpdateSaveData((prev) => ({
                  ...prev,
                  wrongWords: prev.wrongWords.filter((w) => w.term !== term),
                }));
              }}
            />
          </Suspense>
        )}

        {/* TAB 4: RECORDS */}
        {activeTab === 'RECORDS' && (
          <Suspense fallback={<div className="p-8 text-center text-slate-600 font-bold">학습 기록을 불러오는 중입니다...</div>}>
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
          </Suspense>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <Suspense fallback={<div className="p-8 text-center text-slate-600 font-bold">설정을 불러오는 중입니다...</div>}>
            <MyPageView
              currentLevel={currentLevel}
              maxUnlockedLevel={maxUnlockedLevel}
              hintBalance={saveData.hintBalance}
              currentTheme={undefined as any}
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
                handleUpdateSaveData((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, themeId },
                }));
              }}
              onToggleSound={() => {
                const nextMuted = !isMuted;
                sounds.isMuted = nextMuted;
                setIsMuted(nextMuted);
                handleUpdateSaveData((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, isMuted: nextMuted },
                }));
              }}
              onChangeFontSize={handleChangeFontSize}
              onToggleHighContrast={handleToggleHighContrast}
              onOpenTest={() => {
                setActiveTab('CHALLENGE');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAdModal={() => {
                handleUpdateSaveData((prev) => ({
                  ...prev,
                  hintBalance: prev.hintBalance + 5,
                }));
              }}
              onOpenCertificate={() => handleOpenCertificate(selectedCategory)}
              onOpenAchievements={() => setIsAchievementsModalOpen(true)}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              onOpenPolicy={handleOpenPolicy}
              onResetProgress={handleResetProgress}
              onDataRestored={() => {
                const refreshed = loadUserSaveData();
                setSaveData(refreshed);
              }}
            />
          </Suspense>
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

      {/* Lazily loaded modals with Suspense */}
      <Suspense fallback={null}>
        {/* Category Selector Modal */}
        {isCategoryModalOpen && (
          <CategorySelectorModal
            isOpen={isCategoryModalOpen}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onClose={() => setIsCategoryModalOpen(false)}
          />
        )}

        {/* Master Certificate Modal */}
        {isCertificateOpen && (
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
        )}

        {/* Daily Challenge Modal */}
        {isDailyModalOpen && (
          <DailyChallengeModal
            isOpen={isDailyModalOpen}
            onClose={() => setIsDailyModalOpen(false)}
            saveData={saveData}
            onStartDailyPuzzle={handleStartDailyChallenge}
          />
        )}

        {/* Achievements Modal */}
        {isAchievementsModalOpen && (
          <AchievementsModal
            isOpen={isAchievementsModalOpen}
            onClose={() => setIsAchievementsModalOpen(false)}
            achievements={saveData.achievements}
            onClaimReward={handleClaimAchievementReward}
          />
        )}

        {/* Legal Policies Modal */}
        {isPolicyModalOpen && (
          <LegalPolicyModal
            isOpen={isPolicyModalOpen}
            initialTab={policyModalTab}
            onClose={() => setIsPolicyModalOpen(false)}
          />
        )}

        {/* PWA App Install Modal */}
        {isInstallModalOpen && (
          <InstallAppModal
            isOpen={isInstallModalOpen}
            onClose={() => setIsInstallModalOpen(false)}
            onInstall={pwa.promptInstall}
            isIOS={pwa.isIOS}
            isInstalled={pwa.isInstalled}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
