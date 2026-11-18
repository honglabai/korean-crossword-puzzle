import React from 'react';
import { Shield, FileText, Info, Mail } from 'lucide-react';
import { PolicyTab } from './LegalPolicyModal';
import { sounds } from '../utils/audio';

interface SiteFooterProps {
  onOpenPolicy: (tab: PolicyTab) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 pt-6 pb-24 text-slate-700 text-xs border-t border-slate-200 mt-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Service Info */}
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 font-black text-slate-800 text-sm mb-1">
            <span className="text-base">🧩</span>
            <span>지식 탐구 가로세로 낱말퍼즐</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-md font-medium">
            대한민국 8대 지식 영역(정치·사회·문화·스포츠·한국사·세계사·음악·미술) 2,480개 어휘와 240개 관문 십자말풀이를 무료로 제공하는 상식 학습 플랫폼입니다.
          </p>
        </div>

        {/* Right: Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              sounds.playKey();
              onOpenPolicy('PRIVACY');
            }}
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 cursor-pointer font-bold"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>개인정보처리방침</span>
          </button>

          <span className="text-slate-400">|</span>

          <button
            type="button"
            onClick={() => {
              sounds.playKey();
              onOpenPolicy('TERMS');
            }}
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 cursor-pointer font-bold"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>이용약관</span>
          </button>

          <span className="text-slate-400">|</span>

          <button
            type="button"
            onClick={() => {
              sounds.playKey();
              onOpenPolicy('ABOUT');
            }}
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 cursor-pointer font-bold"
          >
            <Info className="w-3.5 h-3.5 text-slate-600" />
            <span>서비스 소개</span>
          </button>

          <span className="text-slate-400">|</span>

          <button
            type="button"
            onClick={() => {
              sounds.playKey();
              onOpenPolicy('CONTACT');
            }}
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 cursor-pointer font-bold"
          >
            <Mail className="w-3.5 h-3.5 text-slate-600" />
            <span>문의하기</span>
          </button>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-center text-[11px] text-slate-600 text-center font-medium">
        <div>
          © 2026 지식 탐구 낱말퍼즐 (honglabai). All rights reserved. Google AdSense 광고 정책을 준수합니다.
        </div>
      </div>
    </footer>
  );
};
