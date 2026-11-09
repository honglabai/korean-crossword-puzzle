import React, { useState } from 'react';
import { Award, Printer, X, Check, Edit2 } from 'lucide-react';
import { CategoryId } from '../types/puzzle';
import { getCategoryMeta } from '../data/categoryRegistry';

interface MasterCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserName?: string;
  selectedCategory?: CategoryId;
}

export const MasterCertificate: React.FC<MasterCertificateProps> = ({
  isOpen,
  onClose,
  defaultUserName = '대한민국 지식탐구자',
  selectedCategory = 'POLITICS',
}) => {
  const [userName, setUserName] = useState(defaultUserName);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const catMeta = getCategoryMeta(selectedCategory);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const handlePrint = () => {
    window.print();
  };

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
              Certificate of {catMeta.name} Mastery (Level 10)
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
              <strong className="text-[#01579b] font-black">대한민국 {catMeta.name} 10개 레벨 크로스워드</strong>의 전 과정을
              성공적으로 완수하여 최고 권위의 지식 소양과 탐구 역량을 입증하였으므로 이 인증서를 수여합니다.
            </p>
          </div>

          {/* Date, Serial & Seal Graphic */}
          <div className="mt-10 pt-6 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left text-xs text-slate-500">
              <p className="font-mono font-semibold text-slate-400">
                인증번호: CERT-{catMeta.id.slice(0, 3)}-2026-X89B
              </p>
              <p className="font-medium mt-0.5">
                수여일자: {year}년 {month}월 {date}일
              </p>
            </div>

            {/* Official Seal Motif */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-black text-slate-700 block">
                  대한민국 {catMeta.name} 학회
                </span>
                <span className="text-[10px] text-slate-400">
                  National Society of Knowledge
                </span>
              </div>

              {/* Red Korean Seal Graphic */}
              <div className="w-14 h-14 rounded-2xl border-2 border-red-700 p-0.5 flex items-center justify-center rotate-6 shadow-xs bg-red-50/40">
                <div className="border border-red-600 w-full h-full flex flex-col items-center justify-center text-red-700 font-serif font-black leading-tight text-[11px]">
                  <span>지식</span>
                  <span>명인</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print / Action Buttons */}
        <div className="print:hidden mt-6 flex items-center justify-end gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>인증서 인쇄 및 PDF 저장</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
