import React, { useState } from 'react';
import { PlacedWord } from '../types/puzzle';
import { BookOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PuzzleStageKnowledgeGuideProps {
  placedWords: PlacedWord[];
  categoryName: string;
  level: number;
  boardNumber: number;
  completedWordIds?: Set<string>;
  onSelectWord?: (word: PlacedWord) => void;
  initialLearningMode?: boolean;
}

export const PuzzleStageKnowledgeGuide: React.FC<PuzzleStageKnowledgeGuideProps> = ({
  placedWords,
  categoryName,
  level,
  boardNumber,
  completedWordIds = new Set(),
  onSelectWord,
  initialLearningMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLearningMode, setIsLearningMode] = useState(initialLearningMode);

  if (!placedWords || placedWords.length === 0) return null;

  return (
    <section
      aria-label="관문 출제 어휘 상식 사전"
      className="w-full max-w-4xl mx-auto my-4 bg-white/95 rounded-2xl border border-sky-100 shadow-xs overflow-hidden"
    >
      {/* Header Accordion Bar */}
      <div className="w-full px-4 py-3 bg-gradient-to-r from-sky-50 via-white to-sky-50/50 flex flex-wrap items-center justify-between gap-2 border-b border-sky-100/80 text-left">
        <button
          type="button"
          onClick={() => {
            sounds.playKey();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition text-left"
        >
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
              {isLearningMode
                ? '학습 모드: 모든 어휘의 정답과 상세 해설을 함께 학습합니다.'
                : '도전 모드: 풀기 전에는 정답이 가려져 스포일러 없이 힌트로 활용할 수 있습니다.'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playKey();
              setIsLearningMode(!isLearningMode);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 transition ${
              isLearningMode
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
            }`}
            title={isLearningMode ? '도전 모드로 변경 (정답 가리기)' : '학습 모드로 변경 (정답 모두 보기)'}
          >
            {isLearningMode ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>학습 모드 (정답 노출)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-sky-600" />
                <span>도전 모드 (정답 가림)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playKey();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center gap-1 text-slate-400 p-1 hover:text-slate-600 transition"
          >
            <span className="text-[11px] font-semibold hidden sm:inline">
              {isExpanded ? '접기' : '해설 보기'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3.5 sm:p-5 space-y-3 animate-in fade-in duration-200">
          <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100 text-[12px] text-slate-700 leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sky-900 font-bold">지식 탐구 학습 가이드:</strong>{' '}
              {isLearningMode
                ? '출제된 모든 단어와 해설을 미리 정독하여 어휘력을 기르고 퍼즐에 도전해보세요.'
                : '퍼즐을 풀며 단어를 맞추면 정답이 해금됩니다. 아래 카드를 터치하면 퍼즐의 해당 칸으로 즉시 포커스됩니다.'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {placedWords.map((word) => {
              const isCompleted = completedWordIds.has(word.id);
              const showTerm = isCompleted || isLearningMode;

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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-5 h-5 rounded-md bg-[#0288d1] text-white text-[11px] font-black flex items-center justify-center">
                        {word.clueNumberText}
                      </span>

                      {showTerm ? (
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">
                          {word.term}
                        </h4>
                      ) : (
                        <span className="font-mono text-xs font-black text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded tracking-widest">
                          {'● '.repeat(word.length).trim()}
                        </span>
                      )}

                      <span className="text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {word.direction === 'across' ? '가로' : '세로'} {word.length}글자
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        완성
                      </span>
                    ) : (
                      !isLearningMode && (
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-100/70 px-1.5 py-0.5 rounded-full shrink-0">
                          풀이 중
                        </span>
                      )
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
