import React from 'react';
import { BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';
import { CategoryId } from '../types/puzzle';
import { getCategoryMeta } from '../data/categoryRegistry';

interface WorkbookHeaderProps {
  currentLevel: number;
  clearCountInLevel: number;
  selectedCategory?: CategoryId;
  elapsedSeconds?: number;
  isTimerRunning?: boolean;
  onOpenTest?: () => void;
  onOpenCategoryModal?: () => void;
  onOpenInstallModal?: () => void;
}

export const WorkbookHeader: React.FC<WorkbookHeaderProps> = ({
  currentLevel,
  clearCountInLevel,
  selectedCategory = 'POLITICS',
  onOpenCategoryModal,
  onOpenInstallModal,
}) => {
  const catMeta = getCategoryMeta(selectedCategory);

  // Difficulty tier label and word count: 초급 : 10단어
  const tierInfo =
    currentLevel <= 3
      ? { label: '초급', words: 10, badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
      : currentLevel <= 7
      ? { label: '중급', words: 15, badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' }
      : { label: '고급', words: 20, badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' };

  return (
    <header className="relative w-full max-w-5xl mx-auto pt-2 pb-1 px-1.5 sm:px-3 select-none touch-manipulation">
      {/* 1번째 줄: [🏛️] 대한민국 헌법·정치 낱말퍼즐  [앱 설치] */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap w-full">
        {/* [🏛️] 분야 변경 버튼 */}
        {onOpenCategoryModal && (
          <button
            onClick={() => {
              sounds.playKey();
              onOpenCategoryModal();
            }}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white/95 rounded-xl shadow-2xs border border-slate-200 shrink-0 hover:scale-105 active:scale-95 transition cursor-pointer"
            title="분야 변경"
          >
            <span className="text-lg sm:text-xl">{catMeta.icon}</span>
          </button>
        )}

        {/* 대한민국 헌법·정치 낱말퍼즐 제목 */}
        <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight whitespace-nowrap truncate min-w-0">
          <span>{catMeta.fullName} 낱말퍼즐</span>
        </h1>

        {/* [앱 설치] 버튼 */}
        {onOpenInstallModal && (
          <button
            onClick={() => {
              sounds.playKey();
              onOpenInstallModal();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-full shadow-2xs text-[11px] sm:text-xs font-black transition cursor-pointer active:scale-95 border border-sky-400 shrink-0 whitespace-nowrap ml-1 sm:ml-2"
            title="홈 화면에 낱말퍼즐 앱 설치하기"
          >
            <img src="/favicon-32x32.png" alt="" className="w-3 h-3 rounded-xs" />
            <span>앱 설치</span>
          </button>
        )}
      </div>

      {/* 2번째 줄: 📖 Level 1 (초급 단계 · 판당 10단어 출제)       진행도: 0/3판 */}
      <div className="mt-1 sm:mt-1.5 flex items-center justify-between text-xs text-slate-600 bg-white/70 backdrop-blur-xs px-2.5 py-1 sm:py-1.5 rounded-xl border border-slate-200/60 shadow-2xs flex-wrap gap-1">
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
