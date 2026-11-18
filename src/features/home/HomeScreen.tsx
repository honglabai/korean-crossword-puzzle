import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  Share2,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { UserSaveData } from '../../types/progress';
import { CategoryId } from '../../types/puzzle';
import { getCategoryMeta, CATEGORIES_REGISTRY } from '../../data/categoryRegistry';
import { getKSTDateString, getMostRecentActiveGame } from '../../services/storageService';
import { sounds } from '../../utils/audio';

interface HomeScreenProps {
  saveData: UserSaveData;
  onSelectCategory: (cat: CategoryId) => void;
  onResumeGame: (cat: CategoryId) => void;
  onOpenDailyChallenge: () => void;
  onNavigateTab: (tab: 'CHALLENGE' | 'KNOWLEDGE' | 'RECORDS' | 'SETTINGS') => void;
  onShareApp: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  saveData,
  onSelectCategory,
  onResumeGame,
  onOpenDailyChallenge,
  onNavigateTab,
  onShareApp,
}) => {
  const [copied, setCopied] = useState(false);
  const todayKST = getKSTDateString();
  const recentActive = getMostRecentActiveGame();

  // Aggregate stats
  let totalClearedPuzzles = 0;
  for (const cat of Object.keys(saveData.categoryProgress) as CategoryId[]) {
    const prog = saveData.categoryProgress[cat];
    if (prog) {
      totalClearedPuzzles += prog.totalClearedBoards || 0;
    }
  }
  const learnedWordsCount = saveData.solvedWordTerms?.length || 0;
  const streakDays = saveData.dailyChallenge?.streakDays || 1;
  const wrongWordsCount = saveData.wrongWords?.filter((w) => !w.mastered)?.length || 0;

  const isTodayCompleted = saveData.dailyChallenge?.completedDates?.includes(todayKST);

  const handleShareClick = async () => {
    sounds.playKey();
    const shareText = `🧩 [지식 탐구 낱말퍼즐]\n8대 지식 영역(정치·사회·문화·스포츠·한국사·세계사·음악·미술) 2,480개 어휘와 함께하는 대한민국 십자말풀이!\n지금 무료로 도전해보세요: https://crossword.honglabai.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '지식 탐구 낱말퍼즐',
          text: shareText,
          url: 'https://crossword.honglabai.com',
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
    onShareApp();
  };

  return (
    <main
      id="main-content"
      role="main"
      className="w-full max-w-xl mx-auto px-4 py-4 space-y-4 animate-in fade-in duration-200"
    >
      {/* 1. Header Hero Card: Daily Crossword Banner */}
      <section
        aria-label="오늘의 낱말퍼즐"
        onClick={() => {
          sounds.playKey();
          onOpenDailyChallenge();
        }}
        className="w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0288d1] via-[#01579b] to-slate-900 text-white shadow-lg relative overflow-hidden cursor-pointer hover:shadow-xl transition group"
      >
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-sky-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-sky-100">
              <Calendar className="w-3.5 h-3.5 text-sky-200" />
              <span>{todayKST} 오늘의 퍼즐</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[11px] font-black">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{streakDays}일 연속</span>
            </span>
          </div>

          <p className="text-xs text-sky-100/90 font-medium mt-1">
            매일 자정 갱신되는 전 국민 공통 상식 십자말풀이
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5">
              <span>오늘의 낱말퍼즐</span>
              <ChevronRight className="w-5 h-5 text-sky-300 group-hover:translate-x-1 transition" />
            </h2>

            {isTodayCompleted ? (
              <span className="flex items-center gap-1 text-xs font-black bg-emerald-500/80 px-3 py-1.5 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>오늘 완료!</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-black bg-amber-400 text-slate-900 px-3.5 py-1.5 rounded-xl shadow-md group-hover:bg-amber-300 transition">
                <Play className="w-3.5 h-3.5 fill-slate-900" />
                <span>도전하기</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 2. Resume In-Progress Puzzle Card */}
      {recentActive && (
        <section
          aria-label="진행 중인 퍼즐 이어하기"
          className="w-full bg-white rounded-2xl p-4 border border-sky-100 shadow-xs flex items-center justify-between gap-3 hover:border-sky-300 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0288d1] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-[#0288d1] uppercase block">
                진행 중인 퍼즐
              </span>
              <h3 className="text-sm font-black text-slate-800">
                {getCategoryMeta(recentActive.category).name} Lv.{recentActive.session.level} · 제
                {recentActive.session.boardNumber}관문
              </h3>
              <p className="text-[11px] text-slate-600 font-medium">
                풀이 시간 {Math.floor(recentActive.session.elapsedSeconds / 60)}분{' '}
                {recentActive.session.elapsedSeconds % 60}초 저장됨
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playKey();
              onResumeGame(recentActive.category);
            }}
            className="px-4 py-2 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 shrink-0"
          >
            <span>이어하기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* 3. Knowledge Category Grid (8 Categories) */}
      <section aria-label="지식 분야 선택" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>지식 분야 선택</span>
          </h3>
          <span className="text-xs text-slate-600 font-bold">8대 지식 영역</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES_REGISTRY.map((cat, idx) => {
            const prog = saveData.categoryProgress[cat.id];
            const lvl = prog?.currentLevel || 1;
            const isSelected = saveData.selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playKey();
                  onSelectCategory(cat.id);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-150 relative cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-400 shadow-xs ring-2 ring-sky-200'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50/60'
                }`}
              >
                <span className="text-[10px] font-black text-slate-600 mb-0.5">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="text-2xl mb-1 select-none">{cat.icon}</span>
                <span className="text-xs font-black text-slate-800 tracking-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.2 rounded-md mt-1">
                  Lv.{lvl}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Learning Stats Card */}
      <section
        aria-label="나의 학습 현황"
        className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
            나의 학습 현황
          </h3>
          <button
            onClick={() => {
              sounds.playKey();
              onNavigateTab('RECORDS');
            }}
            className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>상세 기록</span>
            <ChevronRight className="w-3.5 h-3.5 text-sky-700" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-600 font-bold block mb-1">완료 퍼즐</span>
            <span className="text-lg font-black text-slate-800 font-mono">
              {totalClearedPuzzles}
              <span className="text-xs font-bold text-slate-600 ml-0.5">판</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-600 font-bold block mb-1">학습 단어</span>
            <span className="text-lg font-black text-[#0288d1] font-mono">
              {learnedWordsCount}
              <span className="text-xs font-bold text-slate-600 ml-0.5">개</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-600 font-bold block mb-1">연속 출석</span>
            <span className="text-lg font-black text-amber-700 font-mono">
              {streakDays}
              <span className="text-xs font-bold text-slate-600 ml-0.5">일</span>
            </span>
          </div>
        </div>
      </section>

      {/* 5. Wrong Words Review Prompt Card */}
      <section
        aria-label="나만의 오답노트"
        onClick={() => {
          sounds.playKey();
          onNavigateTab('KNOWLEDGE');
        }}
        className="w-full bg-gradient-to-r from-amber-50 via-white to-amber-50/50 rounded-2xl p-4 border border-amber-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-800">복습할 시간입니다!</span>
              {wrongWordsCount > 0 && (
                <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.2 rounded-full">
                  {wrongWordsCount}개 단어
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              틀렸거나 힌트를 사용한 단어를 모아 퀴즈와 단어 카드로 복습해보세요.
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-amber-600 shrink-0" />
      </section>

      {/* 6. Invite & Share Card */}
      <section
        aria-label="친구에게 앱 공유하기"
        className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-2"
      >
        <p className="text-xs text-slate-600 font-bold">친구와 함께 지식에 도전하세요</p>
        <button
          onClick={handleShareClick}
          className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition"
        >
          <Share2 className="w-4 h-4 text-sky-600" />
          <span>{copied ? '링크가 복사되었습니다!' : '친구에게 앱 공유하기'}</span>
        </button>
      </section>
    </main>
  );
};
