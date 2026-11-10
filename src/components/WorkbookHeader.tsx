import React from 'react';
import { Sparkles, Calendar, BookOpen, Volume2, VolumeX, Palette, Timer } from 'lucide-react';
import { sounds } from '../utils/audio';
import { ColorTheme, ThemeId, THEMES } from '../types/theme';
import { CategoryId } from '../types/puzzle';
import { getCategoryMeta } from '../data/categoryRegistry';

interface WorkbookHeaderProps {
  currentLevel: number;
  clearCountInLevel: number;
  currentTheme: ColorTheme;
  selectedCategory?: CategoryId;
  elapsedSeconds?: number;
  isTimerRunning?: boolean;
  onSelectTheme: (themeId: ThemeId) => void;
  onOpenTest: () => void;
  onOpenCategoryModal?: () => void;
  onOpenInstallModal?: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const WorkbookHeader: React.FC<WorkbookHeaderProps> = ({
  currentLevel,
  clearCountInLevel,
  currentTheme,
  selectedCategory = 'POLITICS',
  elapsedSeconds = 0,
  isTimerRunning = false,
  onSelectTheme,
  onOpenTest,
  onOpenCategoryModal,
  onOpenInstallModal,
  isMuted,
  onToggleSound,
}) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[today.getDay()];

  const catMeta = getCategoryMeta(selectedCategory);

  const formatTimer = (sec: number = 0) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // Difficulty tier label and word count
  const tierInfo =
    currentLevel <= 3
      ? { label: '초급 단계', words: 10, badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
      : currentLevel <= 7
      ? { label: '중급 단계', words: 15, badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' }
      : { label: '전문가 단계', words: 20, badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' };

  return (
    <header className="relative w-full max-w-5xl mx-auto pt-3 pb-2 px-3 sm:px-4 select-none touch-manipulation">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Logo & Category Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenCategoryModal}
              className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-white/95 rounded-2xl shadow-sm border border-slate-200 shrink-0 hover:scale-105 active:scale-95 transition cursor-pointer"
              title="분야 변경"
            >
              <span className="text-xl sm:text-2xl">{catMeta.icon}</span>
              <span className="absolute -bottom-1 -right-1 text-xs">✨</span>
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Category Picker Pill Button */}
                {onOpenCategoryModal && (
                  <button
                    onClick={() => {
                      sounds.playKey();
                      onOpenCategoryModal();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-slate-800 bg-white hover:bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-300 shadow-2xs transition active:scale-95"
                    title="다른 분야 선택하기"
                  >
                    <span>{catMeta.icon}</span>
                    <span>{catMeta.name} 분야</span>
                    <span className="text-[10px] text-blue-600 font-bold ml-0.5">변경 ▾</span>
                  </button>
                )}

                <span className={`px-2 py-0.5 text-[11px] sm:text-xs font-bold tracking-wide rounded-full border shadow-2xs ${tierInfo.badgeClass}`}>
                  {tierInfo.label} · {tierInfo.words}단어
                </span>

                <button
                  onClick={onOpenTest}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700 bg-white/90 hover:bg-white px-2 py-0.5 rounded-full border border-slate-300 transition-all shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  진단 테스트
                </button>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 mt-0.5">
                <span>{catMeta.fullName} 낱말퍼즐</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Date Box & Theme & Audio */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
          {/* Live Game Stopwatch / Timer Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-amber-300 rounded-full border border-slate-700 shadow-xs text-xs font-mono font-bold tracking-wider"
            title="소요 시간"
          >
            <Timer className={`w-3.5 h-3.5 text-amber-400 ${isTimerRunning ? 'animate-pulse' : ''}`} />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Date Capsule Box */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur-xs rounded-full border border-slate-300 shadow-xs text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono font-bold">{year}.{month}.{date}</span>
            <span className="text-[10px] font-bold text-slate-700 ml-0.5 bg-slate-100 px-1.5 py-0.2 rounded-full">
              {dayName}
            </span>
          </div>

          {/* App Install Button with Real Icon */}
          {onOpenInstallModal && (
            <button
              onClick={() => {
                sounds.playKey();
                onOpenInstallModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-full shadow-xs text-xs font-black transition cursor-pointer active:scale-95 border border-sky-400"
              title="홈 화면에 낱말퍼즐 앱 설치하기"
            >
              <img src="/favicon-32x32.png" alt="" className="w-3.5 h-3.5 rounded-md" />
              <span>앱 설치</span>
            </button>
          )}

          {/* Theme Selector Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur-xs rounded-full border border-slate-300 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
              title="색상 테마 변경"
            >
              <Palette className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">{currentTheme.name}</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-1.5 hidden group-hover:block z-30 animate-in fade-in duration-100">
              <span className="text-[10px] font-bold text-slate-400 block px-2 py-1">
                테마 팔레트 선택
              </span>
              {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                const t = THEMES[tId];
                const isActive = currentTheme.id === tId;
                const themeColors: Record<ThemeId, string> = {
                  emerald: '#2e7d32',
                  amber: '#6d4c41',
                  plum: '#6a1b9a',
                  classic: '#0288d1',
                };
                return (
                  <button
                    key={tId}
                    onClick={() => {
                      sounds.playKey();
                      onSelectTheme(tId);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      isActive ? 'bg-[#0288d1] text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="w-3 h-3 rounded-full border border-white/50" style={{ backgroundColor: themeColors[tId] }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mute Toggle */}
          <button
            onClick={() => {
              sounds.playKey();
              onToggleSound();
            }}
            className={`p-2 rounded-full border transition active:scale-95 shadow-2xs ${
              isMuted
                ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                : 'bg-white/95 text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title={isMuted ? '음소거 해제' : '효과음 끄기'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress in current level */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-600 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs flex-wrap gap-1">
        <div className="flex items-center gap-1.5 font-bold">
          <BookOpen className="w-4 h-4 text-[#0288d1]" />
          <span>Level {currentLevel}</span>
          <span className="text-slate-400 font-normal">
            ({tierInfo.label} 판당 {tierInfo.words}단어 출제)
          </span>
        </div>
        <div className="flex items-center gap-2 font-bold">
          <span className="text-slate-500">진행도:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((num) => (
              <span
                key={num}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                  num <= clearCountInLevel
                    ? 'bg-[#0288d1] text-white shadow-xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
          <span className="text-[#0288d1] font-mono ml-1">{clearCountInLevel} / 3 판</span>
        </div>
      </div>
    </header>
  );
};
