import React, { useState } from 'react';
import { CategoryId } from '../types/puzzle';
import { CATEGORIES_META, getCategoryMeta } from '../data/categoryRegistry';
import { KNOWLEDGE_ARTICLES } from '../data/knowledgeArticles';
import { AdBannerSlot } from './AdBannerSlot';
import { sounds } from '../utils/audio';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
} from 'lucide-react';

interface KnowledgeArticleHubProps {
  initialCategory?: CategoryId;
  onSelectCategoryForPuzzle?: (catId: CategoryId) => void;
  showAdInside?: boolean;
}

export const KnowledgeArticleHub: React.FC<KnowledgeArticleHubProps> = ({
  initialCategory = 'POLITICS',
  onSelectCategoryForPuzzle,
  showAdInside = true,
}) => {
  const [selectedCat, setSelectedCat] = useState<CategoryId>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'TAB' | 'ALL'>('TAB');

  const currentArticle = KNOWLEDGE_ARTICLES[selectedCat];
  const catMeta = getCategoryMeta(selectedCat);

  // Filter articles based on search
  const filteredArticles = Object.values(KNOWLEDGE_ARTICLES).filter((art) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const meta = getCategoryMeta(art.categoryId);
    return (
      art.title.toLowerCase().includes(q) ||
      art.subtitle.toLowerCase().includes(q) ||
      meta.name.toLowerCase().includes(q) ||
      art.sections.some(
        (s) => s.heading.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
      ) ||
      art.keyGlossary.some(
        (g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)
      )
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-28 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <header className="text-center mb-6 bg-gradient-to-br from-white to-sky-50/70 border border-sky-100 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100/80 text-sky-800 rounded-full text-xs font-black mb-3">
          <GraduationCap className="w-4 h-4 text-sky-600" />
          <span>8대 지식 탐구 백과 & 시사·교양 학습 칼럼</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-snug">
          상식과 어휘력을 넓히는 <span className="text-[#0288d1]">분야별 심층 지식 가이드</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto leading-relaxed">
          정치·사회·문화·스포츠·한국사·세계사·음악·미술 대한민국 8대 영역의 핵심 제도, 역사적 배경, 그리고 필수 어휘 개념을 체계적으로 수록한 상식 백과사전입니다.
        </p>

        {/* Search Bar & View Mode Toggle */}
        <div className="mt-5 max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="개념, 용어, 역사적 사건 검색 (예: 삼권분립, 훈민정음...)"
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => {
                sounds.playKey();
                setViewMode('TAB');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                viewMode === 'TAB' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              분야별 보기
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playKey();
                setViewMode('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                viewMode === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              8대 분야 전체 완독
            </button>
          </div>
        </div>
      </header>

      {/* 2. Category Select Tabs (when in TAB view mode) */}
      {viewMode === 'TAB' && (
        <nav
          aria-label="지식 영역 선택"
          className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin"
        >
          {CATEGORIES_META.map((meta) => {
            const isSelected = selectedCat === meta.id;
            return (
              <button
                key={meta.id}
                type="button"
                onClick={() => {
                  sounds.playKey();
                  setSelectedCat(meta.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-sm">{meta.icon}</span>
                <span>{meta.name}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* 3. Main Content: Either Single Selected Article or Continuous Multi-Article Read */}
      {viewMode === 'TAB' ? (
        <article
          className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs"
          itemScope
          itemType="https://schema.org/Article"
        >
          {/* Article Header */}
          <header className="border-b border-slate-100 pb-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${catMeta.color}`}>
                <span>{catMeta.icon}</span>
                <span itemProp="articleSection">{catMeta.fullName}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentArticle.readTime}</span>
              </span>
            </div>

            <h2
              itemProp="headline"
              className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mt-1"
            >
              {currentArticle.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
              {currentArticle.subtitle}
            </p>

            {/* Editorial Executive Summary Callout */}
            <div className="mt-4 p-4 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              <strong className="font-bold text-sky-900 block mb-1">핵심 요약</strong>
              {currentArticle.summary}
            </div>
          </header>

          {/* Article Body Sections */}
          <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
            {currentArticle.sections.map((sec, idx) => (
              <section key={idx} className="space-y-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-sky-600 rounded-full" />
                  <span>{sec.heading}</span>
                </h3>
                <p className="text-slate-700 leading-relaxed pl-3.5 text-xs sm:text-sm sm:leading-loose">
                  {sec.content}
                </p>
              </section>
            ))}
          </div>

          {/* Core Key Terms Glossary Box */}
          <section className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {catMeta.name} 영역 필수 상식 어휘 사전
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentArticle.keyGlossary.map((item, gIdx) => (
                <div
                  key={gIdx}
                  className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:border-sky-300 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-black text-slate-900 text-sm tracking-tight">
                      {item.term}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">
                      {item.importance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Crossword Tips & Action Call */}
          <footer className="mt-8 p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-black">십자말풀이 연계 학습 포인트: </strong>
                <span>{currentArticle.crosswordTip}</span>
              </div>
            </div>

            {onSelectCategoryForPuzzle && (
              <button
                type="button"
                onClick={() => {
                  sounds.playKey();
                  onSelectCategoryForPuzzle(selectedCat);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>{catMeta.name} 퍼즐 풀러가기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </footer>
        </article>
      ) : (
        /* Continuous Multi-Article Read Mode: Renders ALL 8 Categories in Sequence */
        <div className="space-y-8">
          {filteredArticles.map((art) => {
            const meta = getCategoryMeta(art.categoryId);
            return (
              <article
                key={art.categoryId}
                id={`article-${art.categoryId}`}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs"
                itemScope
                itemType="https://schema.org/Article"
              >
                <header className="border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${meta.color}`}>
                      <span>{meta.icon}</span>
                      <span>{meta.fullName}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{art.readTime}</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {art.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    {art.subtitle}
                  </p>
                  <p className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed">
                    <strong>요약: </strong>
                    {art.summary}
                  </p>
                </header>

                <div className="space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {art.sections.map((sec, sIdx) => (
                    <section key={sIdx} className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-sky-600 rounded-full" />
                        <span>{sec.heading}</span>
                      </h3>
                      <p className="pl-3 text-slate-600 leading-relaxed font-normal">
                        {sec.content}
                      </p>
                    </section>
                  ))}
                </div>

                {/* Key Terms */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 mb-2.5">
                    💡 {meta.name} 핵심 상식 어휘
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {art.keyGlossary.slice(0, 4).map((g, gIdx) => (
                      <div key={gIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                        <span className="font-bold text-slate-900 mr-1.5">{g.term}:</span>
                        <span className="text-slate-600">{g.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 4. Google AdSense Compliant Banner Slot - Surrounded by rich publisher text */}
      {showAdInside && (
        <div className="mt-8">
          <AdBannerSlot slotId="knowledge_hub_banner" />
        </div>
      )}
    </div>
  );
};
