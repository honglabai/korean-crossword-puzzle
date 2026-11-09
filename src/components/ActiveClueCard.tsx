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
}) => {
  const [showDetailedContext, setShowDetailedContext] = useState<boolean>(false);

  if (!activeWord) return null;

  const contextText = getWordContext(activeWord.term, activeWord.definition, selectedCategory);

  return (
    <div
      className={`w-full max-w-[480px] my-2 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 shadow-md transition-all duration-150 animate-in fade-in slide-in-from-top-1 ${theme.boardBorder}`}
    >
      {/* Top Header of Clue Card */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5">
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
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white transition active:scale-95 ${
              activeDirection === 'across' ? 'bg-[#0288d1]' : 'bg-[#7b1fa2]'
            } ${isIntersection ? 'cursor-pointer hover:opacity-90 ring-1 ring-white/50' : 'cursor-default'}`}
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
            {isIntersection && <RefreshCw className="w-2.5 h-2.5 opacity-80 ml-0.5" />}
          </button>

          {/* Word Length */}
          <span className={`font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md ${isLargeFont ? 'text-xs' : 'text-[11px]'}`}>
            {activeWord.length}글자
          </span>

          {/* Completed Badge */}
          {isCompleted && (
            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ✓ 완성됨
            </span>
          )}
        </div>

        {/* Action Controls: Hint & Direction Toggle & Prev/Next */}
        <div className="flex items-center gap-1.5">
          {/* Hint Button right in Clue Card */}
          <button
            onClick={() => {
              sounds.playHint();
              onRequestHint();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs"
            title="초성 힌트 보기"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
            <span>힌트</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                hintBalance > 0 ? 'bg-amber-200 text-amber-900' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {hintBalance > 0 ? `${hintBalance}개` : '+충전'}
            </span>
          </button>

          {/* Direction Toggle button when at an intersection */}
          {isIntersection && (
            <button
              onClick={() => {
                sounds.playKey();
                onToggleDirection();
              }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs"
              title="가로/세로 방향 전환"
            >
              <RefreshCw className="w-3 h-3 text-slate-600" />
              <span className="text-[11px]">방향 전환</span>
            </button>
          )}

          {/* Prev/Next Clue Navigation */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => {
                sounds.playKey();
                onPrevWord();
              }}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition"
              title="이전 단어"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sounds.playKey();
                onNextWord();
              }}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition"
              title="다음 단어"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Definition Text */}
      <div className="flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p
          className={`font-bold text-slate-800 leading-snug break-keep ${
            isLargeFont ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
          }`}
        >
          {activeWord.definition}
        </p>
      </div>

      {/* Expanded Educational / Constitutional Insight Toggle (Resolves User Pain Point #4) */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => {
            sounds.playKey();
            setShowDetailedContext(!showDetailedContext);
          }}
          className="w-full flex items-center justify-between text-[11px] font-bold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 transition"
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
          <div className="mt-1.5 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-slate-700 text-xs leading-relaxed animate-in fade-in duration-150">
            <p className="font-medium text-slate-800 break-keep">
              {contextText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
