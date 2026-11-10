import React from 'react';
import { X, Download, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<'accepted' | 'dismissed' | 'ios' | 'unsupported'>;
  isIOS: boolean;
  isInstalled: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIOS,
  isInstalled,
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sounds.playKey();
    const result = await onInstall();
    if (result === 'accepted') {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center border border-slate-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playKey();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Icon Display with soft shadow */}
        <div className="relative mx-auto w-24 h-24 mb-4">
          <img
            src="/icon-192.png"
            alt="지식 탐구 낱말퍼즐 앱 아이콘"
            className="w-24 h-24 rounded-2xl shadow-lg border border-sky-100 object-cover"
          />
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1 shadow-xs border-2 border-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          지식 탐구 가로세로 낱말퍼즐
        </h3>
        <p className="text-xs text-sky-600 font-bold mt-0.5">
          스마트폰 및 PC 홈 화면에 앱 추가
        </p>

        {isInstalled ? (
          <div className="mt-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs">
            <div className="flex items-center justify-center gap-1.5 font-black mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>이미 앱이 설치되어 있습니다!</span>
            </div>
            <p className="text-emerald-700">
              스마트폰 바탕화면 또는 앱 목록에서 <strong>'낱말퍼즐'</strong> 아이콘을 터치하여 바로 실행하실 수 있습니다.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="mt-4 text-left bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
            <p className="font-black text-slate-900 text-center mb-1">
              아이폰 / 아이패드 설치 방법
            </p>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <p>
                사파리(Safari) 화면 하단의 <strong>공유 버튼</strong>
                <Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" />을 누릅니다.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <p>
                메뉴 목록에서 <strong>'홈 화면에 추가'</strong>
                <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-sky-600" />를 선택합니다.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <p>
                우측 상단 <strong>[추가]</strong>를 누르면 홈 화면에 낱말퍼즐 앱 아이콘이 바로 생성됩니다!
              </p>
            </div>
          </div>
        ) : (
          /* Android / Chrome Native Install */
          <div className="mt-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              홈 화면에 추가하면 전용 앱 아이콘으로 브라우저 주소창 없이 빠르고 편리하게 낱말퍼즐을 즐기실 수 있습니다.
            </p>
            <button
              onClick={handleInstallClick}
              className="mt-5 w-full py-3 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>홈 화면에 앱 설치하기</span>
            </button>
          </div>
        )}

        {/* Dismiss Button */}
        <button
          onClick={() => {
            sounds.playKey();
            onClose();
          }}
          className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition"
        >
          나중에 하기
        </button>
      </div>
    </div>
  );
};
