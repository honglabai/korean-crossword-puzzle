import { WordItem, DiagnosticQuestion } from '../../types/puzzle';
import { POLITICS_DICTIONARY, DIAGNOSTIC_QUESTIONS } from '../politicsDictionary';

export const POLITICS_WORDS: WordItem[] = POLITICS_DICTIONARY.map(w => ({
  ...w,
  category: 'POLITICS' as const,
}));

export const POLITICS_QUESTIONS: DiagnosticQuestion[] = DIAGNOSTIC_QUESTIONS;
