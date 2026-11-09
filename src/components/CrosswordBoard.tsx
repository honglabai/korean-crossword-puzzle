import React, { useRef, useEffect } from 'react';
import { BoardData, Direction, PlacedWord } from '../types/puzzle';
import { ColorTheme } from '../types/theme';
import { sounds } from '../utils/audio';

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

  // Responsive font size scaling with Large Font Mode support
  const getLetterFontSize = () => {
    if (isLargeFont) {
      if (size <= 9) return 'text-xl sm:text-2xl font-black';
      if (size <= 11) return 'text-base sm:text-lg font-black';
      return 'text-sm sm:text-base font-black';
    }
    if (size <= 9) return 'text-base sm:text-xl font-black';
    if (size <= 11) return 'text-sm sm:text-base font-bold';
    return 'text-xs sm:text-sm font-bold';
  };

  const getNumberFontSize = () => {
    if (size <= 9) return 'text-[9px] sm:text-[11px]';
    if (size <= 11) return 'text-[8px] sm:text-[9px]';
    return 'text-[7px] sm:text-[8px]';
  };

  const getInputPixelFontSize = () => {
    if (isLargeFont) {
      return size <= 9 ? '24px' : size <= 11 ? '19px' : '16px';
    }
    return size <= 9 ? '20px' : size <= 11 ? '16px' : '14px';
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-[min(94vw,480px)] mx-auto px-1 touch-manipulation my-2">
      {/* 
        Main Board Box:
        - Outer border frame
        - Clean, sleek, no decorative characters around
        - 50% translucent backdrop so the generated level background shows through empty cells!
      */}
      <div
        className={`relative w-full aspect-square p-2 sm:p-2.5 rounded-[24px] sm:rounded-[30px] border-[5px] sm:border-[6px] shadow-2xl backdrop-blur-xs transition-colors duration-200 ${theme.boardBorder} bg-slate-900/40`}
      >
        {/* Dynamic NxN Grid Cells */}
        <div
          className={`grid gap-[1.5px] sm:gap-[2px] w-full h-full p-[2px] rounded-[16px] sm:rounded-[22px] overflow-hidden bg-slate-600/30`}
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
                // Inactive cell: 50% opacity translucent window showing the custom background image!
                return (
                  <div
                    key={cellKey}
                    className="w-full h-full bg-slate-900/50 backdrop-blur-[0.5px] transition-colors rounded-[2px]"
                  />
                );
              }

              // Active cell: Direct in-cell text input
              return (
                <div
                  key={cellKey}
                  onClick={() => {
                    sounds.playKey();
                    onCellClick(r, c);
                  }}
                  className={`relative flex items-center justify-center cursor-pointer transition-all duration-150 font-bold rounded-[3px] select-none ${
                    isSelected
                      ? `${theme.focusedCell} z-20 scale-102 shadow-md ring-2 ring-blue-500`
                      : inActiveWord
                      ? theme.activeWordHighlight
                      : 'bg-white hover:bg-slate-50'
                  } ${isWrong ? 'bg-red-100 text-red-600 ring-2 ring-red-400' : ''}`}
                >
                  {/* Top-Left Circled Number Badge */}
                  {cell.startNumberText && (
                    <span
                      className={`absolute top-[1px] left-[2px] leading-none font-black pointer-events-none z-10 ${theme.numberColor} ${getNumberFontSize()}`}
                    >
                      {cell.startNumberText}
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
                      inputMode="text"
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      className={`w-full h-full text-center font-black text-slate-900 bg-transparent outline-none caret-blue-600 p-0 m-0 cursor-text select-all ${getLetterFontSize()}`}
                      style={{ fontSize: getInputPixelFontSize() }}
                    />
                  ) : userVal ? (
                    <span className={`leading-none pointer-events-none ${getLetterFontSize()} text-slate-800`}>
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
