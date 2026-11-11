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
  puzzleLetters?: string[];
}

// Default high-frequency Korean syllables
const DEFAULT_FREQUENT_CHARS = [
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
  puzzleLetters,
}) => {
  const [isOpen, setIsOpen] = useState(true); // Open by default for instant touch on mobile
  const [manualInput, setManualInput] = useState('');

  // Dynamically group puzzle syllables into rows of 7
  const displayRows = React.useMemo(() => {
    if (puzzleLetters && puzzleLetters.length > 0) {
      const rows: string[][] = [];
      const perRow = 7;
      for (let i = 0; i < puzzleLetters.length; i += perRow) {
        rows.push(puzzleLetters.slice(i, i + perRow));
      }
      return rows;
    }
    return DEFAULT_FREQUENT_CHARS;
  }, [puzzleLetters]);

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
    <div className="w-full bg-[#f8fafc] border-t border-slate-200/80 overflow-hidden transition-all touch-manipulation">
      {/* Mobile Input & Navigation Quick Bar */}
      <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-bold text-slate-600 shrink-0">
            직접 입력:
          </span>
          <input
            type="text"
            value={manualInput}
            onChange={handleManualInput}
            onCompositionEnd={handleManualCompositionEnd}
            placeholder={currentCellChar ? `선택: ${currentCellChar}` : '한글 타이핑'}
            style={{ fontSize: '16px' }}
            className="w-full max-w-[150px] px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-[#0288d1] shadow-2xs"
          />
        </div>

        {/* Backspace & Cell Movement Buttons */}
        <div className="flex items-center gap-1.5">
          {onPrevCell && (
            <button
              onClick={() => {
                sounds.playKey();
                onPrevCell();
              }}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
              title="이전 칸 (◀)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {onNextCell && (
            <button
              onClick={() => {
                sounds.playKey();
                onNextCell();
              }}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
              title="다음 칸 (▶)"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              sounds.playKey();
              onBackspace();
            }}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-300 rounded-xl text-xs font-black flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
            title="글자 지우기"
          >
            <Delete className="w-4 h-4" />
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
        className="w-full px-3 py-1.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <Keyboard className="w-4 h-4 text-slate-500" />
          <span>{puzzleLetters ? '현재 퍼즐 추천 글자' : '모바일 빠른 한글 자판'} {isOpen ? '(접기)' : '(펼치기)'}</span>
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
      </button>

      {/* Touch Keypad */}
      {isOpen && (
        <div className="p-2 pt-1 border-t border-slate-200/80 bg-[#fafcff]">
          <div className="space-y-1 sm:space-y-1.5">
            {displayRows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
                {row.map((char) => (
                  <button
                    key={char}
                    onClick={() => {
                      sounds.playKey();
                      onInputChar(char);
                    }}
                    className="flex-1 max-w-[60px] h-10 sm:h-12 bg-white hover:bg-sky-50 active:bg-sky-100 active:scale-95 border border-slate-300 rounded-lg sm:rounded-xl font-black text-base sm:text-lg text-slate-800 shadow-2xs transition flex items-center justify-center cursor-pointer"
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
