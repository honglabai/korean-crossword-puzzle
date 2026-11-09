import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/audio';
import { isCompleteSyllable } from '../utils/hangul';
import { Keyboard, ChevronDown, ChevronUp, Delete, ArrowLeft, ArrowRight } from 'lucide-react';

interface VirtualHangulKeypadProps {
  currentCellChar?: string;
  onInputChar: (char: string) => void;
  onBackspace: () => void;
  onPrevCell?: () => void;
  onNextCell?: () => void;
}

// 4 Rows of high-frequency Korean political science syllables for ultra-fast mobile typing
const FREQUENT_POLITICAL_CHARS = [
  ['민', '주', '공', '화', '국', '정', '당'],
  ['헌', '법', '의', '회', '원', '선', '거'],
  ['투', '표', '권', '력', '대', '통', '령'],
  ['제', '도', '시', '민', '사', '회', '론'],
];

export const VirtualHangulKeypad: React.FC<VirtualHangulKeypadProps> = ({
  currentCellChar = '',
  onInputChar,
  onBackspace,
  onPrevCell,
  onNextCell,
}) => {
  const [isOpen, setIsOpen] = useState(true); // Open by default for instant touch on mobile
  const [manualInput, setManualInput] = useState('');

  // Clear manual input when cell selection moves
  useEffect(() => {
    setManualInput('');
  }, [currentCellChar]);

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (val) {
      onInputChar(val);
      if (isCompleteSyllable(val.slice(-1))) {
        setManualInput('');
      } else {
        setManualInput(val);
      }
    } else {
      setManualInput('');
    }
  };

  const handleManualCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    const data = e.data;
    if (data) {
      onInputChar(data);
    }
    setManualInput('');
  };

  return (
    <div className="w-full max-w-[480px] mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 overflow-hidden shadow-sm transition-all touch-manipulation">
      {/* Mobile Input & Navigation Quick Bar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-bold text-slate-500 shrink-0">
            직접 입력:
          </span>
          <input
            type="text"
            value={manualInput}
            onChange={handleManualInput}
            onCompositionEnd={handleManualCompositionEnd}
            placeholder={currentCellChar ? `현재: ${currentCellChar}` : '한글 타이핑'}
            style={{ fontSize: '16px' }}
            className="w-full max-w-[150px] px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-hidden focus:border-[#0288d1]"
          />
        </div>

        {/* Backspace & Cell Movement Buttons */}
        <div className="flex items-center gap-1">
          {onPrevCell && (
            <button
              onClick={() => {
                sounds.playKey();
                onPrevCell();
              }}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg text-xs"
              title="이전 칸"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {onNextCell && (
            <button
              onClick={() => {
                sounds.playKey();
                onNextCell();
              }}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg text-xs"
              title="다음 칸"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => {
              sounds.playKey();
              onBackspace();
            }}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
            title="글자 지우기"
          >
            <Delete className="w-3.5 h-3.5" />
            <span>지움</span>
          </button>
        </div>
      </div>

      {/* Accordion Toggle Bar */}
      <button
        onClick={() => {
          sounds.playKey();
          setIsOpen(!isOpen);
        }}
        className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition"
      >
        <span className="flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5 text-slate-500" />
          <span>모바일 원터치 한글 자판 {isOpen ? '(접기)' : '(펼치기)'}</span>
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Touch Keypad */}
      {isOpen && (
        <div className="p-2 pt-1 border-t border-slate-200 bg-[#fafcff]">
          <div className="space-y-1">
            {FREQUENT_POLITICAL_CHARS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1">
                {row.map((char) => (
                  <button
                    key={char}
                    onClick={() => {
                      sounds.playKey();
                      onInputChar(char);
                    }}
                    className="flex-1 max-w-[54px] h-10 bg-white hover:bg-sky-50 active:bg-sky-100 active:scale-95 border border-slate-300 rounded-lg font-bold text-sm sm:text-base text-slate-800 shadow-2xs transition flex items-center justify-center min-h-[40px]"
                  >
                    {char}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
