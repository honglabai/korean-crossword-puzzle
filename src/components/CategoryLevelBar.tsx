import React, { useState } from 'react';
import { CategoryId } from '../types/puzzle';
import { CATEGORIES_META, getCategoryMeta } from '../data/categoryRegistry';
import { sounds } from '../utils/audio';
import { Lock, Check, ChevronDown } from 'lucide-react';

interface CategoryLevelBarProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  onOpenCategoryModal?: () => void;
  currentLevel: number;
  maxUnlockedLevel: number;
  levelClears: Record<number, number>;
  onSelectLevel: (level: number) => void;
  onLockedClick?: (level: number) => void;
}

export const CategoryLevelBar: React.FC<CategoryLevelBarProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenCategoryModal,
  currentLevel,
  maxUnlockedLevel = 1,
  levelClears,
  onSelectLevel,
  onLockedClick,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  const catMeta = getCategoryMeta(selectedCategory);

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const levelDetails: Record<number, { name: string; tier: string; count: number }> = {
    1: { name: '기초 민주', tier: '초급', count: 31 },
    2: { name: '의회 기본', tier: '초급', count: 31 },
    3: { name: '정부 형태', tier: '초급', count: 31 },
    4: { name: '선거 실무', tier: '중급', count: 31 },
    5: { name: '비교 정치', tier: '중급', count: 31 },
    6: { name: '입법 통제', tier: '중급', count: 31 },
    7: { name: '외교 안보', tier: '중급', count: 31 },
    8: { name: '정치 사상', tier: '전문가', count: 31 },
    9: { name: '제도 분석', tier: '전문가', count: 31 },
    10: { name: '정치 마스터', tier: '전문가', count: 31 },
  };

  const currentLevelDetail = levelDetails[currentLevel] || { name: '도전 레벨', count: 31 };

  return (
    <>
      {/* Click Outside Backdrop */}
      {(isCategoryOpen || isLevelOpen) && (
        <div
          className="fixed inset-0 z-35 bg-black/15 backdrop-blur-[0.5px]"
          onClick={() => {
            setIsCategoryOpen(false);
            setIsLevelOpen(false);
          }}
        />
      )}

      {/* Main Single Row: 분야 & 레벨 같은 줄 배치 */}
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 my-1.5 relative z-40">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-1 sm:p-1.5 shadow-2xs flex items-center justify-between gap-2">
          {/* ========================================================= */}
          {/* 1. 분야 (Category) Button & Vertical Dropdown */}
          {/* ========================================================= */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => {
                sounds.playKey();
                setIsCategoryOpen((prev) => !prev);
                setIsLevelOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-1.5 sm:gap-2.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer select-none shadow-2xs ${
                isCategoryOpen
                  ? 'bg-slate-900 text-white ring-2 ring-blue-400 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base sm:text-lg shrink-0">{catMeta.icon}</span>
                <div className="text-left min-w-0 truncate">
                  <div className="text-[10px] text-slate-400 font-bold leading-none">분야</div>
                  <div className="leading-tight font-black truncate">{catMeta.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-500 hidden sm:inline">
                  310단어
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCategoryOpen ? 'rotate-180 text-blue-400' : 'text-slate-400'
                  }`}
                />
              </div>
            </button>

            {/* Vertical Category Dropdown */}
            {isCategoryOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>🏷️ 분야 선택</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-md font-bold">
                      8개 영역
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">각 310단어</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES_META.map((meta) => {
                    const isSelected = selectedCategory === meta.id;
                    return (
                      <button
                        key={meta.id}
                        type="button"
                        onClick={() => {
                          sounds.playKey();
                          onSelectCategory(meta.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs ring-2 ring-blue-400'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-lg shrink-0">{meta.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-black text-xs leading-tight">{meta.name}</div>
                          <div
                            className={`text-[10px] leading-tight ${
                              isSelected ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            310단어
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {onOpenCategoryModal && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playKey();
                      setIsCategoryOpen(false);
                      onOpenCategoryModal();
                    }}
                    className="w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>전체 분야 상세 안내 모달 열기</span>
                    <span>▾</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 2. 레벨 (Level) Button & Vertical Dropdown */}
          {/* ========================================================= */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => {
                sounds.playKey();
                setIsLevelOpen((prev) => !prev);
                setIsCategoryOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-1.5 sm:gap-2.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer select-none shadow-2xs ${
                isLevelOpen
                  ? 'bg-slate-900 text-white ring-2 ring-blue-400 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[#0288d1] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  {currentLevel}
                </div>
                <div className="text-left min-w-0 truncate">
                  <div className="text-[10px] text-slate-400 font-bold leading-none">레벨 관문</div>
                  <div className="leading-tight font-black flex items-center gap-1 truncate">
                    <span>Lv.{currentLevel}</span>
                    <span className="text-slate-500 font-bold text-xs hidden md:inline truncate">
                      {currentLevelDetail?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 text-slate-400">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-500 hidden xs:inline">
                  31단어
                </span>
                {/* 3 clear dots for current level */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`w-1.5 h-1.5 rounded-full ${
                        (levelClears[currentLevel] || 0) >= s
                          ? 'bg-emerald-500'
                          : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isLevelOpen ? 'rotate-180 text-blue-400' : 'text-slate-400'
                  }`}
                />
              </div>
            </button>

            {/* Vertical Level Dropdown */}
            {isLevelOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>🎯 레벨 관문 선택</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md font-bold">
                      Lv.1~10
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    최고 해금: Lv.{maxUnlockedLevel}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                  {levels.map((lvl) => {
                    const isCurrent = currentLevel === lvl;
                    const isLocked = lvl > maxUnlockedLevel;
                    const clears = levelClears[lvl] || 0;
                    const isCompleted = clears >= 3;
                    const detail = levelDetails[lvl];

                    return (
                      <button
                        key={lvl}
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) {
                            if (onLockedClick) onLockedClick(lvl);
                            return;
                          }
                          sounds.playKey();
                          onSelectLevel(lvl);
                          setIsLevelOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all select-none ${
                          isLocked
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 shadow-none pointer-events-none'
                            : isCurrent
                            ? 'bg-slate-900 text-white ring-2 ring-slate-400 shadow-md scale-[1.01] cursor-pointer'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 cursor-pointer shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : isCompleted ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                          )}
                          <span className="font-black text-sm">Lv.{lvl}</span>
                          <span
                            className={`text-xs ${
                              isLocked ? 'text-slate-400' : isCurrent ? 'text-slate-200' : 'text-slate-600'
                            }`}
                          >
                            {detail.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isLocked ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-slate-200 text-slate-400">
                              잠김
                            </span>
                          ) : (
                            <>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                                  isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {detail.count}단어
                              </span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3].map((s) => (
                                  <span
                                    key={s}
                                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                                      clears >= s
                                        ? isCurrent
                                          ? 'bg-amber-300'
                                          : 'bg-emerald-500'
                                        : isCurrent
                                        ? 'bg-white/40'
                                        : 'bg-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                  ※ 첫 진단 테스트 확정 레벨 또는 3판 관문을 완료한 레벨 이하만 선택 가능합니다.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
