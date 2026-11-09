import React, { useState, useMemo } from 'react';
import { Search, BookOpen, CheckCircle, Lock } from 'lucide-react';
import { CategoryId } from '../types/puzzle';
import {
  CATEGORIES_META,
  getAllCategoriesWords,
  getDictionaryForCategory,
  getCategoryMeta,
} from '../data/categoryRegistry';
import { sounds } from '../utils/audio';

interface WordbookViewProps {
  maxUnlockedLevel: number;
  solvedWordTerms?: Set<string>;
  initialCategory?: CategoryId;
}

export const WordbookView: React.FC<WordbookViewProps> = ({
  maxUnlockedLevel,
  solvedWordTerms = new Set(),
  initialCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'ALL'>(
    initialCategory || 'ALL'
  );
  const [selectedLevel, setSelectedLevel] = useState<number | 'ALL'>('ALL');

  const grandTotalWordCount = useMemo(() => getAllCategoriesWords().length, []);

  const allWords = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return getAllCategoriesWords();
    }
    return getDictionaryForCategory(selectedCategory);
  }, [selectedCategory]);

  const filteredWords = useMemo(() => {
    return allWords.filter((w) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        w.term.includes(searchTerm.trim()) ||
        w.definition.includes(searchTerm.trim());
      const matchLevel = selectedLevel === 'ALL' || w.level === selectedLevel;
      return matchSearch && matchLevel;
    });
  }, [allWords, searchTerm, selectedLevel]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-[#0288d1]" />
          <span>8대 분야 종합 낱말사전</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          정치, 사회, 문화, 스포츠, 한국사, 세계사, 음악, 미술 등 총 {grandTotalWordCount.toLocaleString()}개의 핵심 지식 어휘를 탐색하세요.
        </p>
      </div>

      {/* 2. Category Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-3 shadow-xs mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => {
              sounds.playKey();
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 분야 ({getAllCategoriesWords().length})
          </button>

          {CATEGORIES_META.map((meta) => {
            const isSelected = selectedCategory === meta.id;
            const wordsCount = getDictionaryForCategory(meta.id).length;

            return (
              <button
                key={meta.id}
                onClick={() => {
                  sounds.playKey();
                  setSelectedCategory(meta.id);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 ${
                  isSelected
                    ? 'bg-[#0288d1] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.name}</span>
                <span className={`text-[10px] ml-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                  ({wordsCount})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Level Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-3 shadow-xs mb-4">
        {/* Search Input */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="단어명이나 뜻풀이 내용으로 검색 (예: 헌법, 르네상스, 삼일운동, 오케스트라)"
            style={{ fontSize: '16px' }}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:border-[#0288d1] focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Level Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => {
              sounds.playKey();
              setSelectedLevel('ALL');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
              selectedLevel === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            모든 레벨 ({allWords.length})
          </button>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
            const isUnlocked = lvl <= maxUnlockedLevel;
            const isSelected = selectedLevel === lvl;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return;
                  sounds.playKey();
                  setSelectedLevel(lvl);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1 select-none ${
                  !isUnlocked
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 shadow-none pointer-events-none'
                    : isSelected
                    ? 'bg-[#0288d1] text-white shadow-xs cursor-pointer'
                    : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 cursor-pointer'
                }`}
                title={!isUnlocked ? `Lv.${lvl} (잠김: 이전 관문 클리어 필요)` : `Lv.${lvl} 어휘 필터`}
              >
                {!isUnlocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                <span>Lv.{lvl}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Word Cards Count */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 px-1">
        <span>검색 결과: {filteredWords.length}개 단어</span>
        {selectedLevel !== 'ALL' && (
          <span className="text-[#0288d1]">Lv.{selectedLevel} 어휘</span>
        )}
      </div>

      {/* 5. Word Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredWords.map((word) => {
          const isSolved = solvedWordTerms.has(word.term);
          const catMeta = getCategoryMeta(word.category);

          return (
            <div
              key={word.id}
              className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all hover:border-slate-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      {word.term}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500">
                      {word.term.length}글자
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Category Badge */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${catMeta.color}`}>
                      {catMeta.icon} {catMeta.name}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        word.level <= 3
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : word.level <= 7
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      Lv.{word.level}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {word.definition}
                </p>
              </div>

              {/* Card Footer Tag */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {catMeta.fullName}
                </span>
                {isSolved ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                    <CheckCircle className="w-3 h-3" />
                    퍼즐 학습 완료
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px]">
                    미완료 낱말
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
