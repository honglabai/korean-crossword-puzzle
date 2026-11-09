import React from 'react';
import { sounds } from '../utils/audio';
import { Lock, Check } from 'lucide-react';

interface LevelSelectorProps {
  currentLevel: number;
  maxUnlockedLevel: number;
  levelClears: Record<number, number>;
  onSelectLevel: (level: number) => void;
  onLockedClick?: (level: number) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  maxUnlockedLevel = 1,
  levelClears,
  onSelectLevel,
  onLockedClick,
}) => {
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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {levels.map((lvl) => {
          const isCurrent = currentLevel === lvl;
          const isLocked = lvl > maxUnlockedLevel;
          const clears = levelClears[lvl] || 0;
          const isCompleted = clears >= 3;
          const detail = levelDetails[lvl];

          return (
            <button
              key={lvl}
              disabled={isLocked}
              onClick={() => {
                if (isLocked) {
                  if (onLockedClick) onLockedClick(lvl);
                  return;
                }
                sounds.playKey();
                onSelectLevel(lvl);
              }}
              title={
                isLocked
                  ? `🔒 Lv.${lvl} (잠김: 이전 관문(Lv.${lvl - 1})을 통과하거나 실력 진단 테스트로 해금)`
                  : `Lv.${lvl} ${detail.name} (${detail.count}단어)`
              }
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none ${
                isLocked
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 shadow-none pointer-events-none'
                  : isCurrent
                  ? 'bg-slate-900 text-white ring-2 ring-slate-400 shadow-md scale-102 cursor-pointer'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 cursor-pointer shadow-2xs'
                  : 'bg-white/95 text-slate-700 border border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs'
              }`}
            >
              {isLocked ? (
                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              ) : isCompleted ? (
                <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[3]" />
              ) : null}

              <span>Lv.{lvl}</span>

              {!isLocked && (
                <span className="text-[11px] font-normal opacity-90 hidden sm:inline">
                  {detail.name}
                </span>
              )}

              {isLocked ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-slate-200 text-slate-400">
                  잠김
                </span>
              ) : (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {detail.count}단어
                </span>
              )}

              {/* Progress dot badges: only shown on unlocked levels */}
              {!isLocked && (
                <div className="flex items-center gap-0.5 ml-0.5">
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
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
