import React from 'react';
import { PlacedWord } from '../types/puzzle';
import { getChosung } from '../utils/korean';
import { sounds } from '../utils/audio';
import { Lightbulb, X, Check } from 'lucide-react';

interface ChosungHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWord: PlacedWord | null;
  hintBalance: number;
  onApplyToBoard: () => void;
}

export const ChosungHintModal: React.FC<ChosungHintModalProps> = ({
  isOpen,
  onClose,
  activeWord,
  hintBalance,
  onApplyToBoard,
}) => {
  if (!isOpen || !activeWord) return null;

  const chosungList = activeWord.term.split('').map((char) => getChosung(char));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-6 text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-amber-50">
          <Lightbulb className="w-8 h-8 text-amber-500 fill-amber-300" />
        </div>

        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-200">
          단어 초성 힌트
        </span>

        {/* Word Info */}
        <div className="mt-2 text-sm font-bold text-slate-600">
          <span>{activeWord.clueNumberText} </span>
          <span className="text-[#0288d1]">
            {activeWord.direction === 'across' ? '가로' : '세로'}
          </span>
          <span> · {activeWord.length}글자</span>
        </div>

        {/* Chosung Big Letter Display */}
        <div className="my-5 flex items-center justify-center gap-2 flex-wrap">
          {chosungList.map((ch, idx) => (
            <div
              key={idx}
              className="w-12 h-14 bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-center shadow-md transform hover:scale-105 transition"
            >
              <span className="text-2xl font-black text-amber-900 leading-none">
                {ch}
              </span>
              <span className="text-[9px] font-bold text-amber-600 mt-1">
                {idx + 1}번째
              </span>
            </div>
          ))}
        </div>

        {/* Definition reminder */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium leading-relaxed mb-4 text-left">
          <span className="font-bold text-slate-900 block mb-0.5">뜻풀이:</span>
          {activeWord.definition}
        </div>

        {/* Hint Balance Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1 mb-4">
          <span>남은 무료 힌트:</span>
          <span className="text-amber-600 font-black bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {hintBalance}개 보유 중
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              sounds.playWordComplete();
              onApplyToBoard();
              onClose();
            }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-sm rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>퍼즐 보드 칸에 초성 표시하기</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
