import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/audio';
import { PlayCircle, Award, X, Sparkles, Tv, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (earnedHints: number) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onReward,
}) => {
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isRewarded, setIsRewarded] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAd && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isPlayingAd && countdown === 0) {
      // Ad finished! Reward user
      setIsPlayingAd(false);
      setIsRewarded(true);
      sounds.playVictory();
      confetti({ particleCount: 50, spread: 60 });
      onReward(2); // Grant 2 hints
    }
    return () => clearTimeout(timer);
  }, [isPlayingAd, countdown, onReward]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPlayingAd(false);
      setCountdown(5);
      setIsRewarded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // =========================================================================
  // [SDK Integration Point for Future Update]
  // 추후 실제 구글 애드센스(Google AdSense) / 애드몹(AdMob) 보상형 광고 SDK 연동 시:
  // 아래 handleStartAd 함수 내부에 `admob.rewardedVideo.show()` 호출부를 연결하시면 됩니다.
  // =========================================================================
  const handleStartAd = () => {
    sounds.playKey();
    setIsPlayingAd(true);
    setCountdown(5);
  };

  const handleInstantRewardTest = () => {
    sounds.playVictory();
    onReward(2);
    setIsRewarded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-4 border-[#0288d1] shadow-2xl p-6 text-center overflow-hidden">
        {/* Close Button */}
        {!isPlayingAd && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {!isPlayingAd && !isRewarded && (
          <div>
            {/* Header Icon */}
            <div className="w-14 h-14 bg-sky-100 text-[#0288d1] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Tv className="w-8 h-8 text-[#0288d1]" />
            </div>

            <span className="px-2.5 py-0.5 bg-sky-100 text-[#01579b] text-xs font-black rounded-full border border-sky-200">
              무료 힌트 충전소
            </span>

            <h3 className="text-xl font-black text-slate-800 mt-2 mb-1">
              힌트를 모두 소진하셨나요?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed px-2 mb-5">
              기본 제공 힌트 3개를 모두 사용했습니다.<br />
              짧은 스폰서 동영상 광고를 시청하고 <strong>무료 힌트 2개</strong>를 즉시 충전하세요!
            </p>

            {/* Ad Reward Box */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                  시청 보상 혜택
                </span>
                <span className="text-base font-black text-amber-900">
                  초성 힌트 +2회 지급
                </span>
              </div>
              <span className="p-2 bg-amber-400 text-white rounded-xl shadow-xs">
                <Award className="w-6 h-6" />
              </span>
            </div>

            {/* Start Ad Button */}
            <div className="space-y-2">
              <button
                onClick={handleStartAd}
                className="w-full py-3.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-sm rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                <span>광고 시청하고 힌트 2개 받기</span>
              </button>

              {/* Dev Test Instant Button */}
              <button
                onClick={handleInstantRewardTest}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-lg transition"
                title="SDK 미연결 시 즉시 테스트"
              >
                (테스트용: 광고 건너뛰고 바로 충전)
              </button>
            </div>
          </div>
        )}

        {/* Ad Video Player Simulator */}
        {isPlayingAd && (
          <div className="py-4">
            <div className="relative aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white mb-4 shadow-lg border border-slate-700">
              {/* Animated pulses */}
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-900 to-indigo-900 opacity-80" />
              <Tv className="w-10 h-10 text-sky-400 mb-2 relative z-10 animate-pulse" />
              <p className="text-xs font-bold text-slate-200 relative z-10">
                스폰서 동영상 광고 재생 중...
              </p>
              <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-amber-400 z-10">
                보상까지 {countdown}초
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-700">
                <div
                  className="h-full bg-sky-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              광고가 종료되면 힌트 2개가 자동 지급됩니다.
            </p>
          </div>
        )}

        {/* Reward Success State */}
        {isRewarded && (
          <div className="py-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-1">
              힌트 충전 완료!
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              무료 힌트 <strong>2개</strong>가 성공적으로 지급되었습니다.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>크로스워드로 돌아가기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
