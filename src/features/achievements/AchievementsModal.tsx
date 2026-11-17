import React from 'react';
import { X, Gift, CheckCircle2 } from 'lucide-react';
import { AchievementItem } from '../../types/progress';
import { sounds } from '../../utils/audio';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: AchievementItem[];
  onClaimReward: (achievementId: string, rewardHints: number) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-slate-800 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-xs">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">도전 과제 및 업적</h3>
              <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {unlockedCount} / {achievements.length} 달성
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              지식 퍼즐을 풀며 다양한 업적을 달성하고 힌트 보상을 획득하세요.
            </p>
          </div>
        </div>

        {/* Achievement List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {achievements.map((item) => {
            const isUnlocked = item.unlockedAt !== null;
            const percent = Math.min(100, Math.round((item.progress / item.maxProgress) * 100));

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isUnlocked
                    ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-100 text-amber-700 shadow-2xs'
                        : 'bg-slate-200 text-slate-400 grayscale'
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-slate-800">{item.title}</h4>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          달성
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>

                    {/* Progress Bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="w-28 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            isUnlocked ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {item.progress}/{item.maxProgress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim reward button */}
                <div className="shrink-0">
                  {isUnlocked ? (
                    item.rewardClaimed ? (
                      <span className="text-[11px] font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-lg">
                        수령 완료
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          sounds.playWordComplete();
                          onClaimReward(item.id, item.rewardHints);
                        }}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>+{item.rewardHints} 힌트 받기</span>
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      보상 +{item.rewardHints}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
