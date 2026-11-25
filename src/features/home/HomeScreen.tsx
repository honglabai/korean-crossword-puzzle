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
  GraduationCap,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { UserSaveData } from '../../types/progress';
import { CategoryId } from '../../types/puzzle';
import { getCategoryMeta, CATEGORIES_REGISTRY } from '../../data/categoryRegistry';
import { KNOWLEDGE_ARTICLES } from '../../data/knowledgeArticles';
import { getKSTDateString, getMostRecentActiveGame } from '../../services/storageService';
import { sounds } from '../../utils/audio';

const CATEGORY_ARTICLE_SLUGS: Record<CategoryId, string> = {
  POLITICS: 'politics',
  SOCIETY: 'society',
  CULTURE: 'culture',
  SPORTS: 'sports',
  KOREAN_HISTORY: 'korean-history',
  WORLD_HISTORY: 'world-history',
  MUSIC: 'music',
  ART: 'art',
};

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

  // Active or selected category for the primary Hero card
  const activeCategory: CategoryId = recentActive?.category || saveData.selectedCategory || 'POLITICS';
  const activeCatMeta = getCategoryMeta(activeCategory);
  const activeProg = saveData.categoryProgress[activeCategory];
  const activeLevel = recentActive?.session.level || activeProg?.currentLevel || 1;
  const activeBoard =
    recentActive?.session.boardNumber || Math.min(3, (activeProg?.clearCountInLevel || 0) + 1);

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
  const featuredArticle = KNOWLEDGE_ARTICLES[activeCategory] || KNOWLEDGE_ARTICLES.POLITICS;
  const featuredSlug = CATEGORY_ARTICLE_SLUGS[activeCategory] || 'politics';

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
      className="w-full max-w-xl mx-auto px-3.5 sm:px-4 py-2 sm:py-2.5 space-y-2.5 sm:space-y-3 animate-in fade-in duration-200"
    >
      {/* 1. Header Hero Card: 진행 중인 퍼즐 이어하기 (가장 강조) */}
      <section
        aria-label="진행 중인 퍼즐 이어하기"
        onClick={() => {
          sounds.playKey();
          onResumeGame(activeCategory);
        }}
        className="w-full rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#0288d1] via-[#01579b] to-slate-900 text-white shadow-md relative overflow-hidden cursor-pointer hover:shadow-lg transition group select-none"
      >
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-sky-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-sky-100">
              <RotateCcw className="w-3.5 h-3.5 text-sky-200" />
              <span>{recentActive ? '진행 중인 퍼즐' : '퍼즐 도전하기'}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/30 text-[11px] font-black">
              <span>
                {activeCatMeta.icon} {activeCatMeta.name}
              </span>
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-sky-100/90 font-medium">
            {recentActive
              ? `풀이 시간 ${Math.floor(recentActive.session.elapsedSeconds / 60)}분 ${
                  recentActive.session.elapsedSeconds % 60
                }초 저장됨 · 바로 이어서 풀기`
              : `Level ${activeLevel} · 제${activeBoard}관문 퍼즐 풀기 준비 완료`}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1.5">
              <span>
                {activeCatMeta.name} Lv.{activeLevel} · 제{activeBoard}관문
              </span>
              <ChevronRight className="w-4 h-4 text-sky-300 group-hover:translate-x-1 transition" />
            </h2>

            <span className="flex items-center gap-1 text-xs font-black bg-amber-400 text-slate-900 px-3.5 py-1.5 rounded-xl shadow-md group-hover:bg-amber-300 transition shrink-0">
              <Play className="w-3.5 h-3.5 fill-slate-900" />
              <span>{recentActive ? '이어하기' : '시작하기'}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Secondary Card: 오늘의 낱말퍼즐 (덜 강조된 차분한 스타일) */}
      <section
        aria-label="오늘의 낱말퍼즐"
        onClick={() => {
          sounds.playKey();
          onOpenDailyChallenge();
        }}
        className="w-full rounded-2xl p-3 sm:p-3.5 bg-white border border-slate-200/90 shadow-2xs hover:border-sky-300 transition cursor-pointer group text-slate-800"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{todayKST} 오늘의 퍼즐</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-[11px] font-bold">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{streakDays}일 연속</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1">
              <span>오늘의 낱말퍼즐</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition" />
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              매일 자정 갱신되는 전 국민 공통 상식 십자말풀이
            </p>
          </div>

          {isTodayCompleted ? (
            <span className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>오늘 완료!</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 px-3 py-1.5 rounded-xl transition shrink-0">
              <Play className="w-3 h-3 fill-sky-700" />
              <span>도전하기</span>
            </span>
          )}
        </div>
      </section>

      {/* 3. Knowledge Category Grid (8 Categories) */}
      <section aria-label="지식 분야 선택" className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>지식 분야 선택</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-bold">8대 지식 영역</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 max-w-sm sm:max-w-md mx-auto w-full">
          {CATEGORIES_REGISTRY.map((cat) => {
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
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border transition-all duration-150 relative cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-400 shadow-2xs ring-2 ring-sky-200'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50/60'
                }`}
              >
                <span className="text-xl mb-0.5 select-none">{cat.icon}</span>
                <span className="text-xs font-black text-slate-800 tracking-tight leading-tight">
                  {cat.name}
                </span>
                <span className="text-[9.5px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.2 rounded-md mt-0.5">
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
        className="w-full bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs space-y-2"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">
            나의 학습 현황
          </h3>
          <button
            onClick={() => {
              sounds.playKey();
              onNavigateTab('RECORDS');
            }}
            className="text-[11px] sm:text-xs text-sky-700 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>상세 기록</span>
            <ChevronRight className="w-3.5 h-3.5 text-sky-700" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10.5px] text-slate-500 font-bold block mb-0.5">완료 퍼즐</span>
            <span className="text-base sm:text-lg font-black text-slate-800 font-mono">
              {totalClearedPuzzles}
              <span className="text-[11px] font-bold text-slate-500 ml-0.5">판</span>
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10.5px] text-slate-500 font-bold block mb-0.5">학습 단어</span>
            <span className="text-base sm:text-lg font-black text-[#0288d1] font-mono">
              {learnedWordsCount}
              <span className="text-[11px] font-bold text-slate-500 ml-0.5">개</span>
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10.5px] text-slate-500 font-bold block mb-0.5">연속 출석</span>
            <span className="text-base sm:text-lg font-black text-amber-700 font-mono">
              {streakDays}
              <span className="text-[11px] font-bold text-slate-500 ml-0.5">일</span>
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
        className="w-full bg-gradient-to-r from-amber-50 via-white to-amber-50/50 rounded-2xl p-3 sm:p-3.5 border border-amber-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
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
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium leading-tight">
              틀렸거나 힌트를 사용한 단어를 모아 퀴즈와 단어 카드로 복습해보세요.
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-amber-600 shrink-0 ml-1" />
      </section>

      {/* 6. Invite & Share Card */}
      <section
        aria-label="친구에게 앱 공유하기"
        className="w-full bg-slate-50 rounded-2xl p-2.5 sm:p-3 border border-slate-200 text-center space-y-1.5"
      >
        <p className="text-[11px] text-slate-600 font-bold">친구와 함께 지식에 도전하세요</p>
        <button
          onClick={handleShareClick}
          className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-sky-600" />
          <span>{copied ? '링크가 복사되었습니다!' : '친구에게 앱 공유하기'}</span>
        </button>
      </section>

      {/* 7. Featured Knowledge Column (Rich Editorial Content) */}
      <article
        aria-label="오늘의 추천 지식 칼럼"
        className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 text-slate-800"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#0288d1]" />
            <span className="text-xs font-black text-[#0288d1]">
              {activeCatMeta.icon} {activeCatMeta.name} 심층 지식 칼럼
            </span>
          </div>
          <a
            href={`/articles/${featuredSlug}.html`}
            className="text-[11px] font-bold text-sky-700 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>전체 칼럼 보기</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div>
          <h3 className="text-base font-black text-slate-900 leading-snug">
            {featuredArticle.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {featuredArticle.summary}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          {featuredArticle.sections.slice(0, 2).map((sec) => (
            <div key={sec.heading} className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
              <h4 className="text-xs font-black text-slate-800 mb-1">{sec.heading}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{sec.content}</p>
            </div>
          ))}
        </div>

        <div className="pt-1">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
            핵심 개념 미리보기
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featuredArticle.keyGlossary.slice(0, 4).map((g) => (
              <div key={g.term} className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                <div className="text-xs font-black text-sky-900">{g.term}</div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{g.definition}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playKey();
              onNavigateTab('KNOWLEDGE');
            }}
            className="text-xs font-black text-sky-700 hover:text-sky-800 hover:underline cursor-pointer"
          >
            앱 내 지식백과 탭에서 더 보기 →
          </button>
          <a
            href={`/articles/${featuredSlug}.html`}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-black transition"
          >
            어휘 30선 &amp; 전문 읽기
          </a>
        </div>
      </article>

      {/* 8. 8대 지식 영역 백과 아카이브 */}
      <section
        aria-label="8대 지식 영역 심층 학습 백과"
        className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-black text-slate-800">
            8대 지식 영역별 교양 백과 (2,480개 어휘)
          </h3>
          <span className="text-[11px] text-slate-500 font-bold">국립국어원 표준 기준</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          지식 탐구 가로세로 낱말퍼즐은 초등·중고등 학생부터 성인, 취업 및 공무원 상식 시험 준비생까지 폭넓게 활용할 수 있도록 8개 핵심 교양 분야의 어휘와 배경지식을 체계적으로 정리해 제공합니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CATEGORIES_REGISTRY.map((cat) => {
            const art = KNOWLEDGE_ARTICLES[cat.id];
            const slug = CATEGORY_ARTICLE_SLUGS[cat.id];
            return (
              <a
                key={cat.id}
                href={`/articles/${slug}.html`}
                className="block p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 hover:border-sky-300 transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900 group-hover:text-sky-700">
                    {cat.icon} {cat.name} · {art.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {art.summary}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      {/* 9. Learning Guide & FAQ */}
      <section
        aria-label="이용 안내 및 자주 묻는 질문"
        className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#0288d1]" />
            <span>낱말퍼즐 학습 가이드 &amp; 자주 묻는 질문</span>
          </h3>
          <a href="/guide.html" className="text-[11px] font-bold text-sky-700 hover:underline">
            전체 가이드 →
          </a>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-black text-slate-800 mb-1">
              Q. 초급·중급·고급 난이도는 어떻게 구성되어 있나요?
            </h4>
            <p>
              Level 1~3(초급)은 8×8 격자에서 판당 10단어, Level 4~7(중급)은 10×10 격자에서 15단어, Level 8~10(고급)은 12×12 격자에서 20단어가 출제되어 총 240개 관문을 단계별로 정복할 수 있습니다.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-black text-slate-800 mb-1">
              Q. 가로·세로가 겹치는 칸에서는 어떻게 힌트를 바꾸나요?
            </h4>
            <p>
              같은 칸에서 가로·세로 단어가 함께 시작하거나 교차할 때는 해당 칸을 한 번 더 누르거나 상단 힌트 카드의 [→ 가로] / [↓ 세로] 버튼을 눌러 힌트와 입력 방향을 즉시 전환할 수 있습니다.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-black text-slate-800 mb-1">
              Q. 틀린 단어는 어떻게 복습할 수 있나요?
            </h4>
            <p>
              풀이 도중 틀리거나 초성 힌트를 사용한 어휘는 자동으로 오답노트에 기록됩니다. 상단 또는 하단의 ‘지식’ 탭에서 단어 카드와 복습 퀴즈를 통해 완벽하게 암기할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
