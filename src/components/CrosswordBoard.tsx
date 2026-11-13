import React, { useRef, useEffect } from 'react';
import { BoardData, Direction, PlacedWord } from '../types/puzzle';
import { ColorTheme } from '../types/theme';
import { sounds } from '../utils/audio';
import { checkCellStatus } from '../utils/hangul';
import { Check, X } from 'lucide-react';

interface CrosswordBoardProps {
  board: BoardData;
  theme: ColorTheme;
  userGrid: string[][];
  activeWord: PlacedWord | null;
  activeDirection: Direction;
  selectedCell: { row: number; col: number } | null;
  wrongCells: Set<string>;
  revealedChosungs: Set<string>;
  isLargeFont?: boolean;
  onCellClick: (row: number, col: number) => void;
  onCellInput: (row: number, col: number, char: string) => void;
  onCellBackspace: (row: number, col: number) => void;
  onNavigate: (dRow: number, dCol: number) => void;
  currentPageNumber?: number | string;
}

export const CrosswordBoard: React.FC<CrosswordBoardProps> = ({
  board,
  theme,
  userGrid,
  activeWord,
  selectedCell,
  wrongCells,
  revealedChosungs,
  isLargeFont = false,
  onCellClick,
  onCellInput,
  onCellBackspace,
  onNavigate,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastProcessedRef = useRef<string>('');
  const size = board.size || 9;

  // Whenever selectedCell changes, focus and select text in the cell's input
  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      inputRef.current.select();
      lastProcessedRef.current = '';
    }
  }, [selectedCell]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    if (e.key === 'Backspace') {
      e.preventDefault();
      onCellBackspace(row, col);
      lastProcessedRef.current = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onNavigate(-1, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onNavigate(1, 0);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onNavigate(0, -1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNavigate(0, 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val || !selectedCell) return;

    lastProcessedRef.current = val;
    onCellInput(selectedCell.row, selectedCell.col, val);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    if (!selectedCell) return;
    const data = e.data;
    if (data && data !== lastProcessedRef.current) {
      onCellInput(selectedCell.row, selectedCell.col, data);
    }
    lastProcessedRef.current = '';
  };

  const isCellInActiveWord = (r: number, c: number): boolean => {
    if (!activeWord) return false;
    if (activeWord.direction === 'across') {
      return (
        r === activeWord.startRow &&
        c >= activeWord.startCol &&
        c < activeWord.startCol + activeWord.length
      );
    } else {
      return (
        c === activeWord.startCol &&
        r >= activeWord.startRow &&
        r < activeWord.startRow + activeWord.length
      );
    }
  };

  // Responsive font size scaling with Large Font Mode support - Maximized for readability
  const getLetterFontSize = () => {
    if (isLargeFont) {
      if (size <= 8) return 'text-2xl sm:text-4xl font-black';
      if (size <= 10) return 'text-xl sm:text-3xl font-black';
      return 'text-lg sm:text-2xl font-black';
    }
    if (size <= 8) return 'text-xl sm:text-3xl font-black';
    if (size <= 10) return 'text-lg sm:text-2xl font-black';
    return 'text-base sm:text-xl font-black';
  };

  const getNumberFontSize = () => {
    if (size <= 8) return 'text-[9px] sm:text-[11px] font-black';
    if (size <= 10) return 'text-[8px] sm:text-[10px] font-black';
    return 'text-[7px] sm:text-[9px] font-black';
  };

  const getInputPixelFontSize = () => {
    if (isLargeFont) {
      return size <= 8 ? '34px' : size <= 10 ? '28px' : '24px';
    }
    return size <= 8 ? '30px' : size <= 10 ? '24px' : '20px';
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full touch-manipulation">
      {/* 
        Main Board Box:
        - Outer bulky boxes/margins removed so grid cells reach the left & right edges
        - Integrated seamlessly as the top section of the play container
      */}
      <div
        className="relative w-full aspect-square p-1 sm:p-2 bg-slate-950/70 transition-colors duration-200"
      >
        {/* Dynamic NxN Grid Cells */}
        <div
          className="grid gap-[1px] sm:gap-[1.5px] w-full h-full p-0.5 rounded-lg sm:rounded-xl overflow-hidden bg-slate-700/40"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {board.grid.map((row, r) =>
            row.map((cell, c) => {
              const cellKey = `${r}-${c}`;
              const isSelected = selectedCell?.row === r && selectedCell?.col === c;
              const inActiveWord = isCellInActiveWord(r, c);
              const isWrong = wrongCells.has(cellKey);
              const hasChosung = revealedChosungs.has(cellKey);
              const userVal = userGrid[r]?.[c] || '';

              if (!cell.isActive) {
                // Inactive cell: Obsidian glass tile exposing background artwork
                return (
                  <div
                    key={cellKey}
                    className="w-full h-full bg-slate-900/50 backdrop-blur-[2px] transition-colors rounded-[4px] sm:rounded-[6px] border border-white/5"
                  />
                );
              }

              // Real-time answer validation status
              const valStatus = checkCellStatus(userVal, cell.solutionChar || '');
              const isCharCorrect = valStatus === 'correct';
              const isCharIncorrect =
                (userVal !== '' && (valStatus === 'incorrect' || (!isSelected && valStatus === 'composing'))) ||
                isWrong;

              // Compute cell style
              let cellStyle = 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs';
              if (isSelected) {
                if (isCharCorrect) {
                  cellStyle = 'bg-emerald-50 text-emerald-900 border-2 border-emerald-500 ring-2 ring-emerald-400 shadow-md scale-[1.03] z-20';
                } else if (isCharIncorrect) {
                  cellStyle = 'bg-rose-50 text-rose-700 border-2 border-rose-400 ring-2 ring-rose-400 shadow-md scale-[1.03] z-20';
                } else {
                  cellStyle = `${theme.focusedCell} z-20 scale-[1.03] shadow-md ring-2 ring-blue-500 border border-blue-400`;
                }
              } else if (isCharCorrect) {
                cellStyle = 'bg-emerald-50/95 text-emerald-800 border border-emerald-300 shadow-2xs hover:bg-emerald-100/70';
              } else if (isCharIncorrect) {
                cellStyle = 'bg-rose-50/95 text-rose-600 border border-rose-300 shadow-2xs hover:bg-rose-100/70';
              } else if (inActiveWord) {
                cellStyle = `${theme.activeWordHighlight} border border-amber-300/80 hover:bg-amber-100/90 shadow-2xs`;
              }

              const letterTextColor = isCharCorrect
                ? 'text-emerald-800 font-black'
                : isCharIncorrect
                ? 'text-rose-600 font-black'
                : 'text-slate-800 font-black';

              const inputStyle = isCharCorrect
                ? 'caret-emerald-600 text-emerald-900'
                : isCharIncorrect
                ? 'caret-rose-600 text-rose-700'
                : 'caret-blue-600 text-slate-900';

              // Active cell: Direct in-cell text input
              return (
                <div
                  key={cellKey}
                  onClick={() => {
                    sounds.playKey();
                    onCellClick(r, c);
                  }}
                  className={`relative flex items-center justify-center cursor-pointer transition-all duration-150 font-bold rounded-[4px] sm:rounded-[6px] select-none ${cellStyle}`}
                >
                  {/* Top-Left Circled Number Badge */}
                  {cell.startNumberText && (
                    <span
                      className={`absolute top-[1px] left-[1.5px] leading-none font-black pointer-events-none z-10 ${
                        isCharCorrect
                          ? 'text-emerald-700/80'
                          : isCharIncorrect
                          ? 'text-rose-600/80'
                          : theme.numberColor
                      } ${getNumberFontSize()}`}
                    >
                      {cell.startNumberText}
                    </span>
                  )}

                  {/* Top-Right Real-Time Validation Indicator Badge */}
                  {isCharCorrect && (
                    <span
                      className={`absolute top-[1.5px] right-[1.5px] rounded-full bg-emerald-500 text-white flex items-center justify-center pointer-events-none shadow-2xs z-10 animate-in zoom-in-75 duration-150 ${
                        size <= 8 ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3'
                      }`}
                      title="정답"
                    >
                      <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3.5]" />
                    </span>
                  )}
                  {isCharIncorrect && (
                    <span
                      className={`absolute top-[1.5px] right-[1.5px] rounded-full bg-rose-500 text-white flex items-center justify-center pointer-events-none shadow-2xs z-10 animate-in zoom-in-75 duration-150 ${
                        size <= 8 ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3'
                      }`}
                      title="오답"
                    >
                      <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3.5]" />
                    </span>
                  )}

                  {/* Direct In-Cell Input for Selected Cell */}
                  {isSelected ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={userVal}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onCompositionEnd={handleCompositionEnd}
                      onClick={() => onCellClick(r, c)}
                      inputMode="text"
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      className={`w-full h-full text-center font-black bg-transparent outline-none p-0 m-0 cursor-text select-all ${getLetterFontSize()} ${inputStyle}`}
                      style={{ fontSize: getInputPixelFontSize() }}
                    />
                  ) : userVal ? (
                    <span className={`leading-none pointer-events-none ${getLetterFontSize()} ${letterTextColor}`}>
                      {userVal}
                    </span>
                  ) : hasChosung && cell.chosungChar ? (
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 opacity-75 pointer-events-none">
                      {cell.chosungChar}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
