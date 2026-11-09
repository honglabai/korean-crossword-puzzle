import React, { useState } from 'react';
import { CategoryId } from '../types/puzzle';
import { getDiagnosticQuestionsForCategory, getCategoryMeta } from '../data/categoryRegistry';
import { sounds } from '../utils/audio';
import { Sparkles, ArrowRight, Award, X, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PoliticsPlacementTestProps {
  isOpen: boolean;
  selectedCategory?: CategoryId;
  onClose: () => void;
  onComplete: (recommendedLevel: number) => void;
}

export const PoliticsPlacementTest: React.FC<PoliticsPlacementTestProps> = ({
  isOpen,
  selectedCategory = 'POLITICS',
  onClose,
  onComplete,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [chosenLevel, setChosenLevel] = useState<number | null>(null);

  const catMeta = getCategoryMeta(selectedCategory);
  const questions = getDiagnosticQuestionsForCategory(selectedCategory);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx] || questions[0];
  const totalQuestions = questions.length;

  const handleInputSubmit = (skip: boolean = false) => {
    sounds.playKey();
    const answerToSave = skip ? '' : currentInput.trim();
    const updatedAnswers = {
      ...userAnswers,
      [currentQ.id]: answerToSave,
    };
    setUserAnswers(updatedAnswers);
    setCurrentInput('');

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      questions.forEach((q) => {
        const userAns = (updatedAnswers[q.id] || '').replace(/\s+/g, '');
        const correctAns = q.answer.replace(/\s+/g, '');
        if (userAns === correctAns) {
          correctCount++;
        }
      });

      // Recommended level:
      // 0~1 correct: Lv.1 (기초 민주)
      // 2 correct: Lv.2 (의회 기본)
      // 3 correct: Lv.4 (선거 실무)
      // 4 correct: Lv.6 (입법 통제)
      // 5 correct: Lv.8 (정치 사상)
      let recLevel = 1;
      if (correctCount <= 1) recLevel = 1;
      else if (correctCount === 2) recLevel = 2;
      else if (correctCount === 3) recLevel = 4;
      else if (correctCount === 4) recLevel = 6;
      else if (correctCount >= 5) recLevel = 8;

      setChosenLevel(recLevel);
      setShowResult(true);
      sounds.playVictory();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        handleInputSubmit(false);
      }
    }
  };

  const handleStartGame = () => {
    sounds.playVictory();
    onComplete(chosenLevel || 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-[#0288d1] shadow-2xl p-5 sm:p-7 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {!showResult ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3.5 pr-8">
              <span className="p-2 bg-[#e1f5fe] text-[#0288d1] rounded-xl shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#01579b]">{catMeta.fullName} 수준 진단 테스트</h2>
                <p className="text-xs text-slate-500">
                  직접 답을 입력하여 맞춤 퍼즐 레벨을 배정받으세요.
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-[#0288d1] h-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-[#f0f9ff] border border-sky-200 rounded-2xl p-4 sm:p-5 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#0288d1] mb-2">
                <span>질문 {currentIdx + 1} / {totalQuestions}</span>
                <span className="bg-white px-2.5 py-0.5 rounded-full border border-sky-200 text-slate-600 font-semibold">
                  직접 주관식 입력
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed break-keep">
                {currentQ.question}
              </p>
            </div>

            {/* Direct Text Input Box */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  정답 입력 (한글)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="정답 단어를 직접 입력하세요"
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-lg font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20 focus:outline-hidden transition shadow-inner"
                    autoFocus
                  />
                  {currentInput && (
                    <button
                      onClick={() => setCurrentInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleInputSubmit(true)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1 min-h-[44px]"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>잘 모르겠어요</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputSubmit(false)}
                  disabled={!currentInput.trim()}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition min-h-[44px] ${
                    currentInput.trim()
                      ? 'bg-[#0288d1] hover:bg-[#0277bd] text-white shadow-md active:scale-98'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{currentIdx === totalQuestions - 1 ? '결과 채점하기' : '정답 제출'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Result Summary & Level Selection */
          <div className="text-center py-1">
            <div className="w-14 h-14 bg-[#e1f5fe] text-[#0288d1] rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[#01579b] mb-1">
              {catMeta.name} 지식 주관식 진단 채점 완료!
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              직접 작성하신 주관식 답안을 정밀 채점하여 추천 레벨을 산출했습니다.
            </p>

            {/* Answer Review Accordion */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 text-left mb-4 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              {questions.map((q) => {
                const userAns = (userAnswers[q.id] || '').trim();
                const isCorrect = userAns.replace(/\s+/g, '') === q.answer.replace(/\s+/g, '');
                return (
                  <div key={q.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">문제 {q.id}</span>
                        <span className={`text-[10px] font-black ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isCorrect ? '정답' : '오답'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] truncate">{q.question}</p>
                      <div className="text-[11px] mt-0.5">
                        <span className="text-slate-400">내 답: </span>
                        <span className="font-bold text-slate-800">{userAns || '(미제출)'}</span>
                        {!isCorrect && (
                          <span className="ml-2 text-[#0288d1] font-bold">정답: {q.answer}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommended Box */}
            <div className="bg-gradient-to-br from-[#e0f2fe] to-[#b3e5fc] border-2 border-[#29b6f6] rounded-2xl p-3.5 mb-4 shadow-xs">
              <span className="text-xs font-bold text-[#0277bd] uppercase tracking-wider">
                당신을 위한 추천 시작 레벨
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#01579b] mt-0.5">
                Level {chosenLevel}
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {chosenLevel && chosenLevel <= 2
                  ? '기초 민주주의와 헌법 상식부터 차근차근 다지기 좋은 단계입니다.'
                  : chosenLevel && chosenLevel <= 5
                  ? '선거와 의회 제도의 핵심 구조를 탐구할 준비가 되셨습니다.'
                  : '심화 정치사상 및 국제정치 이론까지 정복 가능한 높은 수준입니다.'}
              </p>
            </div>

            {/* Level selection buttons if user wants another level */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-500 block mb-1.5">
                시작 레벨 직접 선택 (Lv.1 ~ Lv.10):
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      sounds.playKey();
                      setChosenLevel(lvl);
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition min-h-[32px] ${
                      chosenLevel === lvl
                        ? 'bg-[#0288d1] text-white border-[#0288d1] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-sky-50'
                    }`}
                  >
                    Lv.{lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-sm rounded-xl shadow-lg transition active:scale-98 min-h-[48px]"
            >
              Level {chosenLevel} 크로스워드 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
