import React, { useState } from 'react';
import { PlacedWord, Direction, CategoryId } from '../types/puzzle';
import { ColorTheme } from '../types/theme';
import {
  ArrowRight,
  ArrowDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { getWordContext } from '../utils/wordContext';

interface ActiveClueCardProps {
  activeWord: PlacedWord | null;
  activeDirection: Direction;
  theme: ColorTheme;
  isIntersection: boolean;
  hintBalance: number;
  isLargeFont?: boolean;
  selectedCategory?: CategoryId;
  onRequestHint: () => void;
  onToggleDirection: () => void;
  onPrevWord: () => void;
  onNextWord: () => void;
  isCompleted: boolean;
  userGrid?: string[][];
}

export const ActiveClueCard: React.FC<ActiveClueCardProps> = ({
  activeWord,
  activeDirection,
  theme,
  isIntersection,
  hintBalance,
  isLargeFont = false,
  selectedCategory = 'POLITICS',
  onRequestHint,
  onToggleDirection,
  onPrevWord,
  onNextWord,
  isCompleted,
  userGrid,
}) => {
  const [showDetailedContext, setShowDetailedContext] = useState<boolean>(false);

  if (!activeWord) return null;

  const contextText = getWordContext(activeWord.term, activeWord.definition, selectedCategory);

  // Calculate real-time letter completion for this active word
  let correctCount = 0;
  if (activeWord && userGrid) {
    for (let i = 0; i < activeWord.length; i++) {
      const r = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
      const c = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
      const ch = userGrid[r]?.[c] || '';
      if (ch === activeWord.term[i]) correctCount++;
    }
  }

  return (
    <div
      className={`w-full max-w-[min(98vw,560px)] lg:max-w-[580px] my-1 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm transition-all duration-150 animate-in fade-in slide-in-from-top-1`}
    >
      {/* Top Header of Clue Card */}
      <div className="flex items-center justify-between gap-1.5 mb-1 pb-1 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Circled Number */}
          <span className={`font-black ${theme.numberColor} ${isLargeFont ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
            {activeWord.clueNumberText}
          </span>

          {/* Direction Pill (Clickable to switch direction if intersection exists) */}
          <button
            onClick={() => {
              if (isIntersection) {
                sounds.playKey();
                onToggleDirection();
              }
            }}
            disabled={!isIntersection}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white transition active:scale-95 ${
              isIntersection
                ? 'bg-gradient-to-r from-[#0288d1] to-[#7b1fa2] hover:opacity-95 shadow-2xs cursor-pointer ring-1 ring-white/60'
                : activeDirection === 'across'
                ? 'bg-[#0288d1] cursor-default'
                : 'bg-[#7b1fa2] cursor-default'
            }`}
            title={isIntersection ? '클릭하여 가로/세로 방향 전환' : '현재 단어 방향'}
          >
            {activeDirection === 'across' ? (
              <>
                <ArrowRight className="w-3 h-3" />
                <span>가로</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3 h-3" />
                <span>세로</span>
              </>
            )}
            {isIntersection && (
              <>
                <span className="text-[10px] opacity-90">⇄</span>
                <RefreshCw className="w-2.5 h-2.5 opacity-90 animate-spin-slow" />
              </>
            )}
          </button>

          {/* Progress / Word Length Badge */}
          {isCompleted ? (
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
              ✓ 완성됨
            </span>
          ) : correctCount > 0 ? (
            <span className="text-[11px] font-bold text-sky-800 bg-sky-100/80 px-1.5 py-0.5 rounded-md border border-sky-300 shadow-2xs">
              {correctCount} / {activeWord.length}글자 정답
            </span>
          ) : (
            <span className={`font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 ${isLargeFont ? 'text-xs' : 'text-[11px]'}`}>
              {activeWord.length}글자
            </span>
          )}
        </div>

        {/* Action Controls: Hint & Direction Toggle & Prev/Next */}
        <div className="flex items-center gap-1">
          {/* Hint Button right in Clue Card */}
          <button
            onClick={() => {
              sounds.playHint();
              onRequestHint();
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
            title="초성 힌트 보기"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
            <span>힌트</span>
            <span
              className={`px-1 py-0.2 rounded-md text-[10px] font-black ${
                hintBalance > 0 ? 'bg-amber-200 text-amber-900' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {hintBalance > 0 ? `${hintBalance}개` : '+충전'}
            </span>
          </button>

          {/* Prev/Next Clue Navigation */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-2xs">
            <button
              onClick={() => {
                sounds.playKey();
                onPrevWord();
              }}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition cursor-pointer"
              title="이전 단어"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sounds.playKey();
                onNextWord();
              }}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition cursor-pointer"
              title="다음 단어"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Definition Text */}
      <div className="flex items-start gap-1.5 py-0.5">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p
          className={`font-bold text-slate-800 leading-snug break-keep ${
            isLargeFont ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
          }`}
        >
          {activeWord.definition}
        </p>
      </div>

      {/* Expanded Educational / Constitutional Insight Toggle */}
      <div className="mt-1 pt-1 border-t border-slate-100">
        <button
          onClick={() => {
            sounds.playKey();
            setShowDetailedContext(!showDetailedContext);
          }}
          className="w-full flex items-center justify-between text-[11px] font-bold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 transition"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>분야별 상식 & 상세 배경 지식</span>
          </span>
          {showDetailedContext ? (
            <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
          )}
        </button>

        {showDetailedContext && (
          <div className="mt-1 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100 text-slate-700 text-xs leading-relaxed animate-in fade-in duration-150">
            <p className="font-medium text-slate-800 break-keep">
              {contextText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
