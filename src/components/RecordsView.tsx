import React, { useState } from 'react';
import { Trophy, Award, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { BoardRecord, CategoryId } from '../types/puzzle';
import { CATEGORIES_REGISTRY, getCategoryMeta } from '../data/categoryRegistry';
import { CategoryProgress } from '../types/progress';
import { isCategoryMasterEligible } from '../services/storageService';
import { sounds } from '../utils/audio';

interface RecordsViewProps {
  selectedCategory: CategoryId;
  categoryProgressMap: Record<CategoryId, CategoryProgress>;
  boardRecords: BoardRecord[];
  onSelectCategory: (category: CategoryId) => void;
  onGoToPlay: () => void;
  onOpenCertificate: (category: CategoryId) => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  selectedCategory,
  categoryProgressMap,
  boardRecords,
  onSelectCategory,
  onGoToPlay,
  onOpenCertificate,
}) => {
  const [activeCat, setActiveCat] = useState<CategoryId>(selectedCategory);

  const activeProg = categoryProgressMap[activeCat] || {
    currentLevel: 1,
    clearCountInLevel: 0,
    levelClears: {},
    maxUnlockedLevel: 1,
    isTested: false,
    totalClearedBoards: 0,
  };

  const catMeta = getCategoryMeta(activeCat);

  // Overall stats
  let totalAllBoardsCleared = 0;
  for (const cat of Object.keys(categoryProgressMap) as CategoryId[]) {
    totalAllBoardsCleared += categoryProgressMap[cat]?.totalClearedBoards || 0;
  }

  // Filter records for active category
  const catRecords = boardRecords.filter(
    (r) => !r.category || r.category === activeCat
  );

  const bestRecord =
    catRecords.length > 0
      ? [...catRecords].sort((a, b) => a.timeSeconds - b.timeSeconds)[0]
      : null;

  const formatTime = (sec: number = 0) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${String(s).padStart(2, '0')}초`;
  };

  const masterStatus = isCategoryMasterEligible(activeCat, activeProg);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28 animate-in fade-in duration-200">
      {/* 1. Header Overview Cards */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <span>내 지식 탐구 기록실</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          8대 분야별 관문 돌파 현황과 공식 마스터 인증서 발급 자격을 확인하세요.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
        {CATEGORIES_REGISTRY.map((cat) => {
          const isSelected = activeCat === cat.id;
          const prog = categoryProgressMap[cat.id];
          const cleared = prog?.totalClearedBoards || 0;

          return (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playKey();
                setActiveCat(cat.id);
              }}
              className={`px-3 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#0288d1] text-white border-[#0288d1] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cleared}/30
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats Summary Grid for Active Category */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-500">
            {catMeta.name} 돌파 관문
          </span>
          <span className="text-2xl font-black text-[#0288d1] mt-1 font-mono">
            {activeProg.totalClearedBoards}
            <span className="text-xs font-bold text-slate-500 ml-1">/ 30관문</span>
          </span>
        </div>

        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-500">최고 해금 레벨</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            Lv.{activeProg.maxUnlockedLevel}
            <span className="text-xs font-bold text-slate-500 ml-1">/ 10</span>
          </span>
        </div>

        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-500">전체 누적 완료</span>
          <span className="text-2xl font-black text-amber-500 mt-1 font-mono">
            {totalAllBoardsCleared}
            <span className="text-xs font-bold text-slate-500 ml-1">판</span>
          </span>
        </div>

        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-500">최단 기록 (타임어택)</span>
          <span className="text-lg font-black text-purple-600 mt-1 font-mono">
            {bestRecord ? formatTime(bestRecord.timeSeconds) : '-'}
          </span>
        </div>
      </div>

      {/* Master Certificate Banner for this Category */}
      <div className="w-full bg-gradient-to-r from-amber-50 via-white to-amber-50/40 rounded-3xl p-5 border border-amber-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">
                대한민국 {catMeta.name} 마스터 인증서
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  masterStatus.eligible
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-100/70 text-amber-800 border-amber-300'
                }`}
              >
                {masterStatus.eligible ? '수여 자격 획득' : `30개 중 ${masterStatus.clearedBoards}개 완료`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {masterStatus.eligible
                ? `${catMeta.name} 전 10개 레벨 30개 관문을 정복하셨습니다! 인증서를 열람하고 PDF로 저장하세요.`
                : `${masterStatus.remainingBoards}개 관문을 더 통과하면 공식 마스터 인증서가 수여됩니다.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playKey();
            onOpenCertificate(activeCat);
          }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 ${
            masterStatus.eligible
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{masterStatus.eligible ? '마스터 인증서 보기' : '인증서 도전 현황'}</span>
        </button>
      </div>

      {/* 2. Gate Progress Grid (Lv.1 ~ Lv.10) for Selected Category */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0288d1]" />
            <span>
              {catMeta.name} 레벨별 관문 돌파 현황 (각 레벨 3관문 돌파)
            </span>
          </h3>

          <button
            onClick={() => {
              sounds.playKey();
              onSelectCategory(activeCat);
              onGoToPlay();
            }}
            className="px-3.5 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1"
          >
            <span>이 분야 도전하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
            const clears = activeProg.levelClears[lvl] || 0;
            const isCompleted = clears >= 3;
            const isUnlocked = lvl <= activeProg.maxUnlockedLevel;

            return (
              <div
                key={lvl}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isUnlocked
                    ? 'bg-sky-50/50 border-sky-200'
                    : 'bg-slate-50 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isUnlocked
                        ? 'bg-[#0288d1] text-white shadow-xs'
                        : 'bg-slate-300 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : !isUnlocked ? <Lock className="w-4 h-4" /> : lvl}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800">
                        {catMeta.name} {lvl}단계
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {lvl <= 3 ? '초급 (8x8)' : lvl <= 7 ? '중급 (10x10)' : '전문가 (12x12)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3].map((gate) => (
                        <span
                          key={gate}
                          className={`w-4 h-1.5 rounded-full ${
                            clears >= gate
                              ? 'bg-emerald-500'
                              : isUnlocked
                              ? 'bg-slate-300'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-400 font-bold ml-1">
                        {clears} / 3관문
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      완료
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[10px] font-black text-[#0288d1] bg-sky-100 px-2 py-0.5 rounded-full">
                      도전 가능
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">잠김</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
