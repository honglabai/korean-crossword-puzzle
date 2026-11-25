import React from 'react';
import { Shield, FileText, Info, Mail, BookOpen } from 'lucide-react';
import { PolicyTab } from './LegalPolicyModal';

interface SiteFooterProps {
  onOpenPolicy?: (tab: PolicyTab) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = () => {
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

        {/* Right: Real Crawlable Policy & Guide Links */}
        <nav aria-label="사이트 안내 및 정책" className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-[11px] font-bold">
          <a
            href="/guide.html"
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 font-bold"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>학습 가이드</span>
          </a>

          <span className="text-slate-400">|</span>

          <a
            href="/privacy.html"
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 font-bold"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>개인정보처리방침</span>
          </a>

          <span className="text-slate-400">|</span>

          <a
            href="/terms.html"
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 font-bold"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>이용약관</span>
          </a>

          <span className="text-slate-400">|</span>

          <a
            href="/about.html"
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 font-bold"
          >
            <Info className="w-3.5 h-3.5 text-slate-600" />
            <span>서비스 소개</span>
          </a>

          <span className="text-slate-400">|</span>

          <a
            href="/contact.html"
            className="text-slate-700 hover:text-sky-700 transition flex items-center gap-1 font-bold"
          >
            <Mail className="w-3.5 h-3.5 text-slate-600" />
            <span>문의하기</span>
          </a>
        </nav>
      </div>

      {/* Category Knowledge Links */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-slate-600 font-medium">
        <span className="font-bold text-slate-700">지식 백과:</span>
        <a href="/articles/politics.html" className="hover:text-sky-700 hover:underline">정치</a>
        <a href="/articles/society.html" className="hover:text-sky-700 hover:underline">사회</a>
        <a href="/articles/culture.html" className="hover:text-sky-700 hover:underline">문화</a>
        <a href="/articles/sports.html" className="hover:text-sky-700 hover:underline">스포츠</a>
        <a href="/articles/korean-history.html" className="hover:text-sky-700 hover:underline">한국사</a>
        <a href="/articles/world-history.html" className="hover:text-sky-700 hover:underline">세계사</a>
        <a href="/articles/music.html" className="hover:text-sky-700 hover:underline">음악</a>
        <a href="/articles/art.html" className="hover:text-sky-700 hover:underline">미술</a>
      </div>

      {/* Bottom Copyright */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-center text-[11px] text-slate-600 text-center font-medium">
        <div>
          © 2026 지식 탐구 낱말퍼즐 (honglabai). All rights reserved. 문의: honglabai@gmail.com
        </div>
      </div>
    </footer>
  );
};
