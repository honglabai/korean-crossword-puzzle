import React, { useState } from 'react';
import { GraduationCap, BookOpen, BookmarkCheck } from 'lucide-react';
import { CategoryId } from '../../types/puzzle';
import { WrongWordItem } from '../../types/progress';
import { KnowledgeArticleHub } from '../../components/KnowledgeArticleHub';
import { WordbookView } from '../../components/WordbookView';
import { WrongWordsView } from './WrongWordsView';
import { sounds } from '../../utils/audio';

export type KnowledgeSubTab = 'ARTICLES' | 'WORDBOOK' | 'WRONG_WORDS';

interface KnowledgeHubViewProps {
  selectedCategory: CategoryId;
  maxUnlockedLevel: number;
  solvedWordTerms?: Set<string>;
  onSelectCategory: (cat: CategoryId) => void;
  wrongWords: WrongWordItem[];
  onMarkMastered: (term: string) => void;
  onClearMistake: (term: string) => void;
  initialSubTab?: KnowledgeSubTab;
}

export const KnowledgeHubView: React.FC<KnowledgeHubViewProps> = ({
  selectedCategory,
  maxUnlockedLevel,
  solvedWordTerms = new Set(),
  onSelectCategory,
  wrongWords,
  onMarkMastered,
  onClearMistake,
  initialSubTab = 'ARTICLES',
}) => {
  const [subTab, setSubTab] = useState<KnowledgeSubTab>(initialSubTab);

  const wrongCount = wrongWords.filter((w) => !w.mastered).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 pb-28 animate-in fade-in duration-200">
      {/* Subtab Segmented Switcher */}
      <div className="flex items-center justify-center p-1.5 bg-slate-100 rounded-2xl max-w-md mx-auto mb-5 shadow-2xs">
        <button
          onClick={() => {
            sounds.playKey();
            setSubTab('ARTICLES');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'ARTICLES'
              ? 'bg-white text-[#0288d1] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>지식백과 칼럼</span>
        </button>

        <button
          onClick={() => {
            sounds.playKey();
            setSubTab('WORDBOOK');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'WORDBOOK'
              ? 'bg-white text-[#0288d1] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>낱말사전</span>
        </button>

        <button
          onClick={() => {
            sounds.playKey();
            setSubTab('WRONG_WORDS');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'WRONG_WORDS'
              ? 'bg-white text-amber-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>오답노트</span>
          {wrongCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
              {wrongCount}
            </span>
          )}
        </button>
      </div>

      {/* Subtab Content */}
      {subTab === 'ARTICLES' && (
        <KnowledgeArticleHub
          initialCategory={selectedCategory}
          onSelectCategoryForPuzzle={(catId) => onSelectCategory(catId)}
          showAdInside={false}
        />
      )}

      {subTab === 'WORDBOOK' && (
        <WordbookView
          maxUnlockedLevel={maxUnlockedLevel}
          solvedWordTerms={solvedWordTerms}
          initialCategory={selectedCategory}
        />
      )}

      {subTab === 'WRONG_WORDS' && (
        <WrongWordsView
          wrongWords={wrongWords}
          onMarkMastered={onMarkMastered}
          onClearMistake={onClearMistake}
        />
      )}
    </div>
  );
};
