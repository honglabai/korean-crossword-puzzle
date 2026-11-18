import { CategoryId, WordItem, DiagnosticQuestion } from '../types/puzzle';
import { POLITICS_WORDS, POLITICS_QUESTIONS } from './categories/politics';
import { SOCIETY_WORDS, SOCIETY_QUESTIONS } from './categories/society';
import { CULTURE_WORDS, CULTURE_QUESTIONS } from './categories/culture';
import { SPORTS_WORDS, SPORTS_QUESTIONS } from './categories/sports';
import { KOREAN_HISTORY_WORDS, KOREAN_HISTORY_QUESTIONS } from './categories/koreanHistory';
import { WORLD_HISTORY_WORDS, WORLD_HISTORY_QUESTIONS } from './categories/worldHistory';
import { MUSIC_WORDS, MUSIC_QUESTIONS } from './categories/music';
import { ART_WORDS, ART_QUESTIONS } from './categories/art';

export const DICTIONARY_MAP: Record<CategoryId, WordItem[]> = {
  POLITICS: POLITICS_WORDS,
  SOCIETY: SOCIETY_WORDS,
  CULTURE: CULTURE_WORDS,
  SPORTS: SPORTS_WORDS,
  KOREAN_HISTORY: KOREAN_HISTORY_WORDS,
  WORLD_HISTORY: WORLD_HISTORY_WORDS,
  MUSIC: MUSIC_WORDS,
  ART: ART_WORDS,
};

export const QUESTIONS_MAP: Record<CategoryId, DiagnosticQuestion[]> = {
  POLITICS: POLITICS_QUESTIONS,
  SOCIETY: SOCIETY_QUESTIONS,
  CULTURE: CULTURE_QUESTIONS,
  SPORTS: SPORTS_QUESTIONS,
  KOREAN_HISTORY: KOREAN_HISTORY_QUESTIONS,
  WORLD_HISTORY: WORLD_HISTORY_QUESTIONS,
  MUSIC: MUSIC_QUESTIONS,
  ART: ART_QUESTIONS,
};

export function getDictionaryForCategory(category: CategoryId): WordItem[] {
  return DICTIONARY_MAP[category] || DICTIONARY_MAP.POLITICS;
}

export function getDiagnosticQuestionsForCategory(category: CategoryId): DiagnosticQuestion[] {
  return QUESTIONS_MAP[category] || QUESTIONS_MAP.POLITICS;
}

export function getAllCategoriesWords(): WordItem[] {
  return [
    ...POLITICS_WORDS,
    ...SOCIETY_WORDS,
    ...CULTURE_WORDS,
    ...SPORTS_WORDS,
    ...KOREAN_HISTORY_WORDS,
    ...WORLD_HISTORY_WORDS,
    ...MUSIC_WORDS,
    ...ART_WORDS,
  ];
}
