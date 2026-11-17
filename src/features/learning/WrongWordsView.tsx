import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { WrongWordItem } from '../../types/progress';
import { CategoryId } from '../../types/puzzle';
import { CATEGORIES_REGISTRY, getCategoryMeta, getDictionaryForCategory } from '../../data/categoryRegistry';
import { sounds } from '../../utils/audio';

interface WrongWordsViewProps {
  wrongWords: WrongWordItem[];
  onMarkMastered: (term: string) => void;
  onClearMistake: (term: string) => void;
}

export const WrongWordsView: React.FC<WrongWordsViewProps> = ({
  wrongWords,
  onMarkMastered,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'ALL'>('ALL');
  const [filterMastered, setFilterMastered] = useState<'ALL' | 'UNMASTERED' | 'MASTERED'>('ALL');
  const [quizWord, setQuizWord] = useState<WrongWordItem | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);

  // Filter words
  const filteredWords = wrongWords.filter((w) => {
    if (selectedCategory !== 'ALL' && w.category !== selectedCategory) return false;
    if (filterMastered === 'UNMASTERED' && w.mastered) return false;
    if (filterMastered === 'MASTERED' && !w.mastered) return false;
    return true;
  });

  // Start a 4-choice quiz with one of the wrong words
  const handleStartQuiz = (word: WrongWordItem) => {
    sounds.playKey();
    setQuizWord(word);
    setQuizSelectedAnswer(null);
    setQuizResult(null);

    // Pick 3 random distractors from that category's dictionary
    const dict = getDictionaryForCategory(word.category);
    const otherWords = dict.filter((d) => d.term !== word.term);
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [word.term, ...shuffled.map((d) => d.term)].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
  };

  const handleSelectAnswer = (option: string) => {
    if (quizResult !== null || !quizWord) return;
    setQuizSelectedAnswer(option);

    if (option === quizWord.term) {
      sounds.playWordComplete();
      setQuizResult('correct');
      onMarkMastered(quizWord.term);
    } else {
      sounds.playIncorrect();
      setQuizResult('wrong');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-amber-200" />
          <h2 className="text-lg font-black tracking-tight">나만의 맞춤 오답노트</h2>
        </div>
        <p className="text-xs text-amber-100 leading-relaxed">
          퍼즐을 풀면서 틀렸거나 힌트를 사용했던 어휘를 규칙 기반 AI 알고리즘이 자동으로 수집하여 복습 퀴즈를 제공합니다.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 분야
          </button>
          {CATEGORIES_REGISTRY.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-[#0288d1] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterMastered}
            onChange={(e) => setFilterMastered(e.target.value as any)}
            className="bg-slate-100 rounded-lg px-2 py-1 text-slate-700 font-bold focus:outline-hidden"
          >
            <option value="ALL">전체 보기 ({wrongWords.length})</option>
            <option value="UNMASTERED">복습 필요</option>
            <option value="MASTERED">마스터 완료</option>
          </select>
        </div>
      </div>

      {/* Quiz Modal Popup if active */}
      {quizWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-amber-200 shadow-2xl p-6 text-slate-800">
            <button
              onClick={() => setQuizWord(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-black tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-3">
              맞춤 4지선다 복습 퀴즈
            </span>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">
                {getCategoryMeta(quizWord.category).name} 어휘 정의
              </span>
              <p className="text-sm font-bold text-slate-800 leading-relaxed">
                "{quizWord.definition}"
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {quizOptions.map((option, idx) => {
                const isSelected = quizSelectedAnswer === option;
                const isCorrect = option === quizWord.term;
                let btnStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';

                if (quizResult !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-black';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-red-50 border-red-300 text-red-700 font-bold';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={quizResult !== null}
                    className={`w-full p-3 rounded-xl border text-left text-sm font-bold transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-200/80 text-slate-600 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{option}</span>
                    </span>
                    {quizResult !== null && isCorrect && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {quizResult === 'correct' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold text-center mb-4">
                🎉 정답입니다! 마스터 완료 상태로 등록되었습니다.
              </div>
            )}

            {quizResult === 'wrong' && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-bold text-center mb-4">
                아쉽습니다! 정답은 "{quizWord.term}" 입니다.
              </div>
            )}

            {quizResult !== null && (
              <button
                onClick={() => setQuizWord(null)}
                className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl transition"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      )}

      {/* Word Cards List */}
      {filteredWords.length === 0 ? (
        <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800">오답 및 복습 단어가 없습니다</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            퍼즐을 풀면서 틀리거나 힌트를 사용한 단어가 이곳에 자동으로 기록되어 맞춤형 복습을 도와드립니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredWords.map((word) => {
            const cat = getCategoryMeta(word.category);

            return (
              <div
                key={word.id}
                className={`p-4 rounded-2xl border transition-all ${
                  word.mastered
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-white border-amber-200 shadow-2xs hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base select-none">{cat.icon}</span>
                    <span className="text-xs font-black text-slate-800 tracking-tight">
                      {word.term}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.2 rounded">
                      {cat.name}
                    </span>
                  </div>

                  {word.mastered ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      마스터
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      오답 {word.mistakeCount}회 · 힌트 {word.hintUsedCount}회
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3 break-keep line-clamp-3">
                  {word.definition}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleStartQuiz(word)}
                    className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>복습 퀴즈 풀기</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playKey();
                      onMarkMastered(word.term);
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
                  >
                    {word.mastered ? '마스터 해제' : '마스터로 표시'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
