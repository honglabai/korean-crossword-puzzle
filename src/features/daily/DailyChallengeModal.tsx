import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  X,
  Share2,
  CheckCircle2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { UserSaveData } from '../../types/progress';
import { getKSTDateString } from '../../services/storageService';
import { getDailyCategory, formatDailyShareText } from '../../services/dailyService';
import { getCategoryMeta } from '../../data/categoryRegistry';
import { sounds } from '../../utils/audio';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveData: UserSaveData;
  onStartDailyPuzzle: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  saveData,
  onStartDailyPuzzle,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const todayKST = getKSTDateString();
  const category = getDailyCategory(todayKST);
  const catMeta = getCategoryMeta(category);
  const isCompleted = saveData.dailyChallenge?.completedDates?.includes(todayKST);
  const streakDays = saveData.dailyChallenge?.streakDays || 1;
  const bestTime = saveData.dailyChallenge?.bestTimeSeconds;
  const todayResult = saveData.dailyChallenge?.todayResult;

  const handleShare = async () => {
    sounds.playKey();
    const elapsed = todayResult?.elapsedSeconds || 120;
    const text = formatDailyShareText(todayKST, elapsed, streakDays, catMeta.name);

    if (navigator.share) {
      try {
        await navigator.share({
          title: '지식 탐구 낱말퍼즐 오늘의 퍼즐 결과',
          text,
          url: 'https://crossword.honglabai.com',
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-slate-800 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0288d1] to-sky-400 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <Calendar className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
            {todayKST}
          </span>
          <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{streakDays}일 연속</span>
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mt-2">오늘의 낱말퍼즐</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          오늘의 테마:{' '}
          <strong className="text-[#0288d1] font-black">
            {catMeta.icon} {catMeta.name}({catMeta.fullName})
          </strong>
        </p>

        {isCompleted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>오늘의 퍼즐을 완료했습니다!</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                훌륭합니다! 오늘의 지식 탐구를 완수하셨습니다. 매일 자정에 새로운 퍼즐이 공개됩니다.
              </p>
              {todayResult && (
                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    풀이 시간:
                  </span>
                  <span className="font-mono text-emerald-800 font-black">
                    {Math.floor(todayResult.elapsedSeconds / 60)}분{' '}
                    {todayResult.elapsedSeconds % 60}초
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                닫기
              </button>
              <button
                onClick={handleShare}
                className="flex-2 py-3 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? '복사 완료!' : '결과 친구에게 공유'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>퍼즐 난이도</span>
                <span className="text-[#0288d1] font-black">8x8 그리드 · 10단어</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>완료 보상</span>
                <span className="text-amber-600 font-black">+2개 힌트 & 출석 누적</span>
              </div>
              {bestTime && (
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>역대 최고 기록</span>
                  <span className="font-mono text-slate-800">
                    {Math.floor(bestTime / 60)}분 {bestTime % 60}초
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  onClose();
                  onStartDailyPuzzle();
                }}
                className="flex-2 py-3 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>퍼즐 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
