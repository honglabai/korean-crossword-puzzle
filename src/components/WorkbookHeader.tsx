import React from 'react';
import { Sparkles, BookOpen, Timer } from 'lucide-react';
import { sounds } from '../utils/audio';
import { CategoryId } from '../types/puzzle';
import { getCategoryMeta } from '../data/categoryRegistry';

interface WorkbookHeaderProps {
  currentLevel: number;
  clearCountInLevel: number;
  selectedCategory?: CategoryId;
  elapsedSeconds?: number;
  isTimerRunning?: boolean;
  onOpenTest: () => void;
  onOpenCategoryModal?: () => void;
  onOpenInstallModal?: () => void;
}

export const WorkbookHeader: React.FC<WorkbookHeaderProps> = ({
  currentLevel,
  clearCountInLevel,
  selectedCategory = 'POLITICS',
  elapsedSeconds = 0,
  isTimerRunning = false,
  onOpenTest,
  onOpenCategoryModal,
  onOpenInstallModal,
}) => {
  const catMeta = getCategoryMeta(selectedCategory);

  const formatTimer = (sec: number = 0) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // Difficulty tier label and word count: 초급 : 10단어
  const tierInfo =
    currentLevel <= 3
      ? { label: '초급', words: 10, badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
      : currentLevel <= 7
      ? { label: '중급', words: 15, badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' }
      : { label: '고급', words: 20, badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' };

  return (
    <header className="relative w-full max-w-5xl mx-auto pt-2 pb-1 px-1.5 sm:px-3 select-none touch-manipulation">
      <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
        {/* 1번째 줄: 정치, 초급 : 10단어, 레벨 진단 (모바일/데스크톱 모두 각각 한 줄) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap w-full">
          {/* 1. Category Picker Pill Button: "정치" */}
          {onOpenCategoryModal && (
            <button
              onClick={() => {
                sounds.playKey();
                onOpenCategoryModal();
              }}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-slate-800 bg-white hover:bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-300 shadow-2xs transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
              title="분야 선택"
            >
              <span>{catMeta.icon}</span>
              <span>{catMeta.name}</span>
            </button>
          )}

          {/* 2. Tier Info Badge: "초급 : 10단어" */}
          <span className={`px-2 py-0.5 text-[11px] sm:text-xs font-bold tracking-wide rounded-full border shadow-2xs shrink-0 whitespace-nowrap ${tierInfo.badgeClass}`}>
            {tierInfo.label} : {tierInfo.words}단어
          </span>

          {/* 3. Level Placement Test: "레벨 진단" */}
          <button
            onClick={onOpenTest}
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700 bg-white/90 hover:bg-white px-2 py-0.5 rounded-full border border-slate-300 transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>레벨 진단</span>
          </button>
        </div>

        {/* 2번째 줄: 집(이모지), 대한민국 헌법·정치 낱말퍼즐, 앱 설치, 시간 (한 줄) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap w-full">
          {/* 집(이모지) 분야 변경 버튼 */}
          {onOpenCategoryModal && (
            <button
              onClick={() => {
                sounds.playKey();
                onOpenCategoryModal();
              }}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white/95 rounded-lg shadow-2xs border border-slate-200 shrink-0 hover:scale-105 active:scale-95 transition cursor-pointer"
              title="분야 변경"
            >
              <span className="text-base sm:text-lg">{catMeta.icon}</span>
            </button>
          )}

          {/* 대한민국 헌법·정치 낱말퍼즐 제목 */}
          <h1 className="text-[13px] sm:text-base md:text-xl font-black text-slate-800 tracking-tight whitespace-nowrap truncate shrink min-w-0">
            <span>{catMeta.fullName} 낱말퍼즐</span>
          </h1>

          {/* 앱 설치 버튼 */}
          {onOpenInstallModal && (
            <button
              onClick={() => {
                sounds.playKey();
                onOpenInstallModal();
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-full shadow-2xs text-[10px] sm:text-xs font-black transition cursor-pointer active:scale-95 border border-sky-400 shrink-0 whitespace-nowrap"
              title="홈 화면에 낱말퍼즐 앱 설치하기"
            >
              <img src="/favicon-32x32.png" alt="" className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs" />
              <span>앱 설치</span>
            </button>
          )}

          {/* 시간 (타이머) */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-900 text-amber-300 rounded-full border border-slate-700 shadow-2xs text-[11px] sm:text-xs font-mono font-bold tracking-wider shrink-0 whitespace-nowrap ml-auto"
            title="소요 시간"
          >
            <Timer className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 ${isTimerRunning ? 'animate-pulse' : ''}`} />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Progress in current level */}
      <div className="mt-1 flex items-center justify-between text-xs text-slate-600 bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200/60 shadow-2xs flex-wrap gap-1">
        <div className="flex items-center gap-1.5 font-bold">
          <BookOpen className="w-4 h-4 text-[#0288d1]" />
          <span>Level {currentLevel}</span>
          <span className="text-slate-400 font-normal">
            ({tierInfo.label} 단계 · 판당 {tierInfo.words}단어 출제)
          </span>
        </div>
        <div className="flex items-center gap-2 font-bold">
          <span className="text-slate-500">진행도:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((num) => (
              <span
                key={num}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                  num <= clearCountInLevel
                    ? 'bg-[#0288d1] text-white shadow-xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
          <span className="text-[#0288d1] font-mono ml-1">{clearCountInLevel} / 3 판</span>
        </div>
      </div>
    </header>
  );
};
