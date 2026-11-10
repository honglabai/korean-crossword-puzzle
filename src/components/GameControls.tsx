import React from 'react';
import { Lightbulb, CheckSquare, RotateCcw, Shuffle, Eraser } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameControlsProps {
  hintBalance: number;
  onRequestHint: () => void;
  onCheckWrong: () => void;
  onClearActiveWord: () => void;
  onResetBoard: () => void;
  onGenerateNewBoard: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  hintBalance,
  onRequestHint,
  onCheckWrong,
  onClearActiveWord,
  onResetBoard,
  onGenerateNewBoard,
}) => {
  return (
    <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-1.5 sm:p-2.5 shadow-md my-2">
      {/* 
        Single Line 5-Button Toolbar:
        1. 초성 힌트
        2. 오답 점검
        3. 단어 지움
        4. 새 퍼즐
        5. 되돌리기
      */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 w-full">
        {/* 1. 초성 힌트 */}
        <button
          onClick={() => {
            sounds.playHint();
            onRequestHint();
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-0.5 sm:px-1 rounded-xl text-[11px] sm:text-xs font-black bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 active:scale-95 transition-all shadow-2xs text-center select-none cursor-pointer whitespace-nowrap"
          title={`초성 힌트 (${hintBalance > 0 ? `${hintBalance}개 남음` : '광고 충전'})`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-300 shrink-0" />
          <span>초성 힌트</span>
        </button>

        {/* 2. 오답 점검 */}
        <button
          onClick={() => {
            sounds.playKey();
            onCheckWrong();
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-0.5 sm:px-1 rounded-xl text-[11px] sm:text-xs font-black bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 active:scale-95 transition-all shadow-2xs text-center select-none cursor-pointer whitespace-nowrap"
          title="현재 작성한 글자 중 틀린 칸 전체 점검"
        >
          <CheckSquare className="w-3.5 h-3.5 text-[#0288d1] shrink-0" />
          <span>오답 점검</span>
        </button>

        {/* 3. 단어 지우개 */}
        <button
          onClick={() => {
            sounds.playKey();
            onClearActiveWord();
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-0.5 sm:px-1 rounded-xl text-[11px] sm:text-xs font-black bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 active:scale-95 transition-all shadow-2xs text-center select-none cursor-pointer whitespace-nowrap"
          title="선택된 낱말 칸 글자 지우기"
        >
          <Eraser className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>단어 지움</span>
        </button>

        {/* 4. 새 퍼즐 */}
        <button
          onClick={() => {
            sounds.playKey();
            onGenerateNewBoard();
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-0.5 sm:px-1 rounded-xl text-[11px] sm:text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 active:scale-95 transition-all shadow-2xs text-center select-none cursor-pointer whitespace-nowrap"
          title="현재 레벨의 새로운 단어 퍼즐 생성"
        >
          <Shuffle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>새 퍼즐</span>
        </button>

        {/* 5. 되돌리기 */}
        <button
          onClick={() => {
            sounds.playKey();
            if (window.confirm('현재 퍼즐에 입력한 글자를 모두 초기화할까요?')) {
              onResetBoard();
            }
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-0.5 sm:px-1 rounded-xl text-[11px] sm:text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 active:scale-95 transition-all shadow-2xs text-center select-none cursor-pointer whitespace-nowrap"
          title="현재 판 전체 입력 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>되돌리기</span>
        </button>
      </div>
    </div>
  );
};
