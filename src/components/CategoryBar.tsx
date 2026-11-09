import React from 'react';
import { CategoryId } from '../types/puzzle';
import { CATEGORIES_META } from '../data/categoryRegistry';
import { sounds } from '../utils/audio';

interface CategoryBarProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  onOpenModal: () => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenModal,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 my-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
      {/* Category Pills */}
      {CATEGORIES_META.map((meta) => {
        const isSelected = selectedCategory === meta.id;
        return (
          <button
            key={meta.id}
            onClick={() => {
              sounds.playKey();
              onSelectCategory(meta.id);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all active:scale-95 shadow-2xs ${
              isSelected
                ? 'bg-slate-900 text-white shadow-xs ring-2 ring-blue-400'
                : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-sm">{meta.icon}</span>
            <span>{meta.name}</span>
          </button>
        );
      })}

      {/* More / View All Categories Button */}
      <button
        onClick={() => {
          sounds.playKey();
          onOpenModal();
        }}
        className="px-2.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 transition"
      >
        전체 분야 ▾
      </button>
    </div>
  );
};
