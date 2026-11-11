import React, { useEffect, useRef } from 'react';

interface AdBannerSlotProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  slotId,
  format = 'auto',
  className = '',
}) => {
  const adRef = useRef<HTMLElement>(null);
  const hasPushed = useRef(false);

  // AdSense ad slots must be a 9~12 digit numeric ID issued by Google AdSense
  const isRealNumericSlot = Boolean(slotId && /^\d{9,12}$/.test(slotId));

  useEffect(() => {
    if (!isRealNumericSlot || hasPushed.current) return;
    try {
      if (typeof window !== 'undefined') {
        const w = window as unknown as { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
        hasPushed.current = true;
      }
    } catch {
      // AdSense script may be blocked by ad blockers or not yet loaded
    }
  }, [isRealNumericSlot]);

  // When under review or before creating numeric ad units, render high-value educational tip block
  if (!isRealNumericSlot) {
    return (
      <aside
        ref={adRef}
        aria-label="지식 학습 안내"
        className={`w-full max-w-4xl mx-auto my-3 px-3 sm:px-4 ${className}`}
      >
        <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50/40 rounded-2xl border border-sky-100 p-3 sm:p-3.5 text-center overflow-hidden min-h-[64px] flex items-center justify-center relative shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 max-w-2xl leading-relaxed text-left sm:text-center">
            <span className="w-2 h-2 rounded-full bg-[#0288d1] shrink-0" />
            <p className="text-[11px] sm:text-xs">
              <strong className="text-slate-800 font-bold">💡 지식 탐구 낱말퍼즐:</strong>{' '}
              정치·사회·문화·스포츠·한국사·세계사·음악·미술 8대 지식 영역의 2,480개 어휘와 심층 백과사전을 누구나 무료로 학습할 수 있습니다. 상단 <strong>‘지식백과’</strong> 탭에서 주제별 칼럼을 만나보세요.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  // Real AdSense Unit (Active only when verified numeric slotId is provided)
  return (
    <aside
      ref={adRef}
      aria-label="스폰서 광고"
      className={`w-full max-w-4xl mx-auto my-3 px-3 sm:px-4 ${className}`}
    >
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-2 sm:p-3 text-center overflow-hidden min-h-[90px] flex flex-col items-center justify-center relative">
        {/* Ad Label according to Google Policy */}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">
          스폰서 광고 · Advertisement
        </span>

        {/* Real AdSense Ins Element */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-8675047967209162"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* Fallback Display until AdSense ads serve */}
        <div className="text-[11px] text-slate-400 py-1 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
          <span>지식 탐구 낱말퍼즐은 무료 서비스 유지를 위해 공인 광고를 게재합니다.</span>
        </div>
      </div>
    </aside>
  );
};
