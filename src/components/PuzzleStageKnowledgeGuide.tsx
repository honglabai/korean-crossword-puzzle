import React, { useState } from 'react';
import { PlacedWord } from '../types/puzzle';
import { BookOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PuzzleStageKnowledgeGuideProps {
  placedWords: PlacedWord[];
  categoryName: string;
  level: number;
  boardNumber: number;
  completedWordIds?: Set<string>;
  onSelectWord?: (word: PlacedWord) => void;
}

export const PuzzleStageKnowledgeGuide: React.FC<PuzzleStageKnowledgeGuideProps> = ({
  placedWords,
  categoryName,
  level,
  boardNumber,
  completedWordIds = new Set(),
  onSelectWord,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!placedWords || placedWords.length === 0) return null;

  return (
    <section
      aria-label="관문 출제 어휘 상식 사전"
      className="w-full max-w-4xl mx-auto my-4 bg-white/95 rounded-2xl border border-sky-100 shadow-xs overflow-hidden"
    >
      {/* Header Accordion Bar */}
      <button
        type="button"
        onClick={() => {
          sounds.playKey();
          setIsExpanded(!isExpanded);
        }}
        className="w-full px-4 py-3 bg-gradient-to-r from-sky-50 via-white to-sky-50/50 flex items-center justify-between border-b border-sky-100/80 cursor-pointer hover:bg-sky-100/30 transition text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0288d1] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full">
                {categoryName} {level}단계 · 제{boardNumber}관문
              </span>
              <span className="text-xs text-slate-500 font-bold">
                핵심 상식 어휘 해설 ({placedWords.length}단어)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              이번 퍼즐 관문에 출제된 용어의 사전적 정의와 심층 교양 상식을 학습할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-2">
          <span className="text-[11px] font-semibold hidden sm:inline">
            {isExpanded ? '접기' : '해설 보기'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded Content: High-value Publisher Editorial Vocabulary Encyclopedia */}
      {isExpanded && (
        <div className="p-3.5 sm:p-5 space-y-3 animate-in fade-in duration-200">
          <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100 text-[12px] text-slate-700 leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sky-900 font-bold">지식 탐구 학습 가이드:</strong>{' '}
              십자말풀이를 풀면서 단어를 맞추는 재미와 함께, 각 어휘의 배경 지식을 함께 습득하면 장기 기억과 상식 함양에 큰 도움이 됩니다. 아래 어휘 카드를 클릭하면 퍼즐의 해당 칸으로 즉시 이동합니다.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {placedWords.map((word) => {
              const isCompleted = completedWordIds.has(word.id);
              return (
                <article
                  key={word.id}
                  onClick={() => onSelectWord && onSelectWord(word)}
                  className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                    isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-sky-50/60 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-[#0288d1] text-white text-[11px] font-black flex items-center justify-center">
                        {word.clueNumberText}
                      </span>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">
                        {word.term}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {word.direction === 'across' ? '가로' : '세로'} {word.length}글자
                      </span>
                    </div>

                    {isCompleted && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        완성
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed break-keep">
                    {word.definition}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
