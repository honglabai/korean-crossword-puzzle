import React, { useState } from 'react';
import { Award, Printer, X, Check, Edit2, Lock, ArrowRight, Share2 } from 'lucide-react';
import { CategoryId } from '../types/puzzle';
import { getCategoryMeta } from '../data/categoryRegistry';
import { sounds } from '../utils/audio';

interface MasterCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
  selectedCategory?: CategoryId;
  isEligible?: boolean;
  clearedBoards?: number;
  totalRequired?: number;
  onContinueChallenge?: () => void;
}

export const MasterCertificate: React.FC<MasterCertificateProps> = ({
  isOpen,
  onClose,
  defaultUserName = '대한민국 지식탐구자',
  selectedCategory = 'POLITICS',
  isEligible = false,
  clearedBoards = 0,
  totalRequired = 30,
  onContinueChallenge,
}) => {
  const [userName, setUserName] = useState(defaultUserName);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const catMeta = getCategoryMeta(selectedCategory);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    sounds.playKey();
    const shareText = `🎓 [지식 탐구 낱말퍼즐] 대한민국 ${catMeta.name} 마스터 달성!\n10개 레벨 30개 관문을 모두 돌파하여 ${catMeta.name} 마스터 인증서를 수여받았습니다.\n함께 지식에 도전해보세요: https://crossword.honglabai.com/?category=${catMeta.id.toLowerCase()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `대한민국 ${catMeta.name} 마스터 인증서`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {}
  };

  // If not eligible yet, display progress & lock screen
  if (!isEligible) {
    const percent = Math.min(100, Math.round((clearedBoards / totalRequired) * 100));
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-800 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-black tracking-wider text-amber-600 uppercase bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            마스터 인증서 잠금 중
          </span>

          <h3 className="text-xl font-black text-slate-900 mt-3 mb-1">
            대한민국 {catMeta.name} 마스터 인증서
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-5 break-keep">
            {catMeta.name} 10개 레벨의 <strong className="text-slate-700">전체 30개 관문</strong>을 모두 돌파해야 공식 마스터 인증서가 발급됩니다.
          </p>

          {/* Progress bar */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-left">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-600">{catMeta.name} 관문 돌파 현황</span>
              <span className="text-[#0288d1] font-black">{clearedBoards} / {totalRequired} ({percent}%)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-[#0288d1] h-3 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              앞으로 {Math.max(0, totalRequired - clearedBoards)}개 관문을 더 완료하면 인증서가 수여됩니다!
            </p>
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
                if (onContinueChallenge) onContinueChallenge();
              }}
              className="flex-2 py-3 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <span>이어서 도전하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border-8 border-[#01579b] shadow-2xl p-6 sm:p-10 text-slate-800 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="print:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Container with Double Frame */}
        <div className="border-2 border-amber-600/40 p-6 sm:p-8 rounded-2xl relative bg-gradient-to-b from-amber-50/30 via-white to-amber-50/20">
          {/* Corner Ornaments */}
          <div className="absolute top-2 left-2 text-amber-600 text-lg">✦</div>
          <div className="absolute top-2 right-2 text-amber-600 text-lg">✦</div>
          <div className="absolute bottom-2 left-2 text-amber-600 text-lg">✦</div>
          <div className="absolute bottom-2 right-2 text-amber-600 text-lg">✦</div>

          {/* Certificate Badge */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white shadow-md mb-3 ring-4 ring-amber-100">
              <Award className="w-9 h-9" />
            </div>

            <span className="text-xs font-black tracking-[0.25em] text-amber-700 uppercase">
              Official Master Certificate
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#01579b] mt-1 tracking-tight">
              대한민국 {catMeta.name} 마스터 인증서
            </h1>
            <p className="text-xs font-medium text-slate-400 tracking-wider mt-0.5">
              Certificate of {catMeta.name} Mastery (Level 10 All Cleared)
            </p>
          </div>

          {/* Recipient Name Area */}
          <div className="mt-8 text-center">
            <span className="text-xs text-slate-400 font-semibold block mb-1">
              수 여 자
            </span>
            <div className="inline-flex items-center justify-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="border-b-2 border-[#0288d1] px-2 py-0.5 text-xl font-black text-[#01579b] text-center focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 bg-[#0288d1] text-white rounded-md"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditing(true)}
                  className="group flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded-lg hover:bg-amber-50/70 transition"
                  title="이름 수정"
                >
                  <span className="text-2xl sm:text-3xl font-black text-[#01579b] underline decoration-amber-400 decoration-2 underline-offset-8">
                    {userName}
                  </span>
                  <Edit2 className="print:hidden w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
                </div>
              )}
            </div>
          </div>

          {/* Commendation Body Text */}
          <div className="mt-8 text-center px-2 sm:px-6">
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium break-keep">
              위 사람은 기초 개념부터 전공 이론 및 심화 전문 지식에 이르는{' '}
              <strong className="text-[#01579b] font-black">대한민국 {catMeta.name} 10개 레벨 30관문</strong>의 전 과정을
              성공적으로 완수하여 최고 권위의 지식 소양과 탐구 역량을 입증하였으므로 이 인증서를 수여합니다.
            </p>
          </div>

          {/* Date, Serial & Seal Graphic */}
          <div className="mt-10 pt-6 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left text-xs text-slate-500">
              <p className="font-mono font-semibold text-slate-400">
                인증번호: CERT-{catMeta.id.slice(0, 3)}-2026-X89B
              </p>
              <p className="mt-1 text-slate-400">
                수여일자: {year}년 {month}월 {date}일
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center sm:text-right">
                <span className="text-[11px] text-slate-400 block font-semibold">
                  지식 탐구 낱말퍼즐 평가위원회
                </span>
                <span className="text-base font-black text-[#01579b] tracking-wider">
                  홍랩AI 학술인증처
                </span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-red-600 flex items-center justify-center text-red-600 font-black text-[10px] leading-tight text-center rotate-[-12deg] shadow-inner select-none bg-red-50/50">
                홍랩AI
                <br />
                인증지인
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Print, Share, Close) */}
        <div className="print:hidden mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
          >
            닫기
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? '복사 완료!' : '결과 공유'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>인증서 인쇄 / PDF 저장</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
