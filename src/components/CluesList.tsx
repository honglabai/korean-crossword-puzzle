import React from 'react';
import { PlacedWord } from '../types/puzzle';
import { CheckCircle2, ArrowRight, ArrowDown } from 'lucide-react';

interface CluesListProps {
  placedWords: PlacedWord[];
  activeWord: PlacedWord | null;
  completedWordIds: Set<string>;
  onSelectWord: (word: PlacedWord) => void;
}

export const CluesList: React.FC<CluesListProps> = ({
  placedWords,
  activeWord,
  completedWordIds,
  onSelectWord,
}) => {
  const acrossClues = placedWords.filter((w) => w.direction === 'across');
  const downClues = placedWords.filter((w) => w.direction === 'down');

  const renderClueItem = (word: PlacedWord) => {
    const isSelected = activeWord?.id === word.id;
    const isCompleted = completedWordIds.has(word.id);

    return (
      <div
        key={word.id}
        onClick={() => onSelectWord(word)}
        className={`group p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
          isSelected
            ? 'bg-[#e0f2fe] border-[#0288d1] shadow-xs translate-x-1 ring-1 ring-[#0288d1]'
            : isCompleted
            ? 'bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-100 hover:bg-sky-50/50'
            : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 shadow-2xs'
        }`}
      >
        <div className="flex items-start gap-2">
          {/* Number & Length */}
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <span
              className={`text-base font-black ${
                isSelected ? 'text-[#0277bd]' : 'text-[#00838f]'
              }`}
            >
              {word.clueNumberText}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
              {word.length}글자
            </span>
          </div>

          {/* Definition */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs sm:text-[13px] leading-relaxed break-keep ${
                isCompleted
                  ? 'text-slate-500 line-through decoration-slate-300'
                  : isSelected
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-700'
              }`}
            >
              {word.definition}
            </p>
          </div>

          {/* Completed Check icon */}
          {isCompleted && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Across Clues */}
      <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-sky-200 p-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-100">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#e1f5fe] text-[#0288d1]">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-extrabold text-sm text-[#01579b]">가로 열쇠</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {acrossClues.filter((w) => completedWordIds.has(w.id)).length} / {acrossClues.length} 완료
          </span>
        </div>
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {acrossClues.map(renderClueItem)}
        </div>
      </div>

      {/* Down Clues */}
      <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-sky-200 p-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-100">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#e1f5fe] text-[#0288d1]">
              <ArrowDown className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-extrabold text-sm text-[#01579b]">세로 열쇠</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {downClues.filter((w) => completedWordIds.has(w.id)).length} / {downClues.length} 완료
          </span>
        </div>
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {downClues.map(renderClueItem)}
        </div>
      </div>
    </div>
  );
};
