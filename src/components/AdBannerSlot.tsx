import React, { useEffect, useRef } from 'react';

interface AdBannerSlotProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  slotId = '0000000000',
  format = 'auto',
  className = '',
}) => {
  const adRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const w = window as unknown as { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
      }
    } catch {
      // AdSense script may be blocked by ad blockers or not yet loaded
    }
  }, []);

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
