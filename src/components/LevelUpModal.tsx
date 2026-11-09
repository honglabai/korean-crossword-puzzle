import React from 'react';
import { Trophy, ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface LevelUpModalProps {
  isOpen: boolean;
  type: 'board_cleared' | 'level_cleared' | 'master_cleared';
  currentLevel: number;
  clearedBoardNumber: number; // 1, 2, or 3
  clearTimeSeconds?: number;
  onNextBoard: () => void;
  onNextLevel: () => void;
  onOpenCertificate: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  type,
  currentLevel,
  clearedBoardNumber,
  clearTimeSeconds,
  onNextBoard,
  onNextLevel,
  onOpenCertificate,
}) => {
  if (!isOpen) return null;

  const formatSec = (sec?: number) => {
    if (!sec) return '0초';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}분 ${s}초` : `${s}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-4 border-[#0288d1] shadow-2xl p-6 sm:p-7 text-center overflow-hidden">
        {type === 'board_cleared' && (
          <div>
            <div className="w-16 h-16 bg-sky-100 text-[#0288d1] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>

            <h3 className="text-xl font-black text-[#01579b] mb-1">
              제{clearedBoardNumber}판 클리어 성공!
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              10개의 정치 용어를 모두 완벽하게 맞췄습니다.
            </p>

            {/* Stamp progress */}
            <div className="flex items-center justify-center gap-2 p-3 bg-sky-50 rounded-2xl border border-sky-200 mb-4">
              {[1, 2, 3].map((step) => {
                const isDone = step <= clearedBoardNumber;
                return (
                  <div
                    key={step}
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-black transition-all ${
                      isDone
                        ? 'bg-[#0288d1] text-white shadow-sm ring-2 ring-[#81d4fa]'
                        : 'bg-white text-slate-300 border border-slate-300'
                    }`}
                  >
                    {isDone ? '★' : step}
                  </div>
                );
              })}
              <span className="text-xs font-bold text-[#0288d1] ml-2">
                {clearedBoardNumber} / 3판 완료
              </span>
            </div>

            {clearTimeSeconds !== undefined && clearTimeSeconds > 0 && (
              <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-bold">
                <span>⏱️ 소요 시간:</span>
                <span className="font-mono font-black">{formatSec(clearTimeSeconds)}</span>
              </div>
            )}

            <button
              onClick={() => {
                sounds.playKey();
                onNextBoard();
              }}
              className="w-full py-3.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-sm rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
            >
              <span>다음 퍼즐 도전 ({clearedBoardNumber + 1}/3)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {type === 'level_cleared' && (
          <div>
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner animate-bounce">
              <Trophy className="w-9 h-9" />
            </div>

            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
              Level Clear
            </span>
            <h3 className="text-2xl font-black text-[#01579b] mt-2 mb-1">
              정치 분야 Level {currentLevel} 돌파!
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              3판의 10단어 퍼즐(총 30단어)을 모두 완성하여 다음 단계로 승급합니다!
            </p>

            <div className="bg-gradient-to-r from-sky-500 to-[#0288d1] text-white p-4 rounded-2xl mb-6 shadow-md">
              <span className="text-xs opacity-90">새로운 도전 단계</span>
              <div className="text-2xl font-black mt-0.5">
                Level {currentLevel + 1} 입성
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playVictory();
                onNextLevel();
              }}
              className="w-full py-3.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-sm rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Level {currentLevel + 1} 승급하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {type === 'master_cleared' && (
          <div>
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-amber-300">
              <Award className="w-12 h-12" />
            </div>

            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
              Master Level Reached
            </span>
            <h3 className="text-2xl font-black text-[#01579b] mt-2 mb-1">
              정치학 최고 권위자 달성!
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              대한민국 헌법과 정치학 Level 10의 전 과정을 완벽하게 수료하셨습니다.
            </p>

            <button
              onClick={() => {
                sounds.playVictory();
                onOpenCertificate();
              }}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-base rounded-2xl shadow-xl transition active:scale-98 flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5" />
              <span>대한민국 정치학 마스터 인증서 발급</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
