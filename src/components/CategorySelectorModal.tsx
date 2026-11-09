import React from 'react';
import { CategoryId, CategoryMeta } from '../types/puzzle';
import { CATEGORIES_META, getDictionaryForCategory } from '../data/categoryRegistry';
import { X, Check, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CategorySelectorModalProps {
  isOpen: boolean;
  selectedCategory: CategoryId;
  onSelectCategory: (categoryId: CategoryId) => void;
  onClose: () => void;
  categoryProgress?: Partial<Record<CategoryId, { maxUnlockedLevel: number }>>;
}

export const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  isOpen,
  selectedCategory,
  onSelectCategory,
  onClose,
  categoryProgress = {},
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0288d1] to-sky-400 flex items-center justify-center text-xl shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>낱말퍼즐 분야(Category) 선택</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  8대 영역
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                도전하고 싶은 지식 분야를 선택하면 해당 분야의 낱말퍼즐로 즉시 전환됩니다.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playKey();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES_META.map((meta: CategoryMeta) => {
            const isSelected = selectedCategory === meta.id;
            const words = getDictionaryForCategory(meta.id);
            const maxLvl = categoryProgress[meta.id]?.maxUnlockedLevel || 1;

            return (
              <button
                key={meta.id}
                onClick={() => {
                  sounds.playKey();
                  onSelectCategory(meta.id);
                  onClose();
                }}
                className={`group relative p-3.5 rounded-2xl border-2 text-left transition-all duration-150 flex items-start gap-3 active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#0288d1] bg-sky-50/70 shadow-md ring-2 ring-blue-300'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                }`}
              >
                {/* Icon box */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs transition group-hover:scale-105 bg-gradient-to-br ${meta.bgGradient} text-white`}
                >
                  {meta.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <span>{meta.fullName}</span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-[#0288d1] bg-sky-100 px-1.5 py-0.2 rounded-md">
                          <Check className="w-3 h-3" />
                          <span>선택됨</span>
                        </span>
                      )}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                    {meta.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      <span>{words.length}개 어휘</span>
                    </span>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      Lv.{maxLvl} 관문
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>※ 모든 분야는 레벨 1~10 및 3판 성공 승급 체계가 동일하게 적용됩니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition text-xs shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
