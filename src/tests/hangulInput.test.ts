import { describe, it, expect } from 'vitest';
import {
  combineHangulInput,
  checkCellStatus,
  compose,
  decompose,
  isCompleteSyllable,
  isConsonant,
  isVowel,
} from '../utils/hangul';

describe('Hangul Input & Composition Engine', () => {
  it('keeps consonant in current cell without advancing prematurely', () => {
    const res = combineHangulInput('', 'ㄱ', '관');
    expect(res.currentCell).toBe('ㄱ');
    expect(res.shouldAdvance).toBe(false);
  });

  it('keeps intermediate compound vowel prefix in cell without advancing', () => {
    // When solution is '관' (vowel 'ㅘ'), typing '고' (vowel 'ㅗ') should wait for 'ㅏ'
    const res = combineHangulInput('ㄱ', '고', '관');
    expect(res.currentCell).toBe('고');
    expect(res.shouldAdvance).toBe(false);
  });

  it('combines compound vowels and waits for final consonant if solution has 받침', () => {
    // When solution is '관', typing '과' should wait for 받침 'ㄴ'
    const res = combineHangulInput('고', '과', '관');
    expect(res.currentCell).toBe('과');
    expect(res.shouldAdvance).toBe(false);
  });

  it('combines final consonant and advances when syllable matches solution', () => {
    // Typing 'ㄴ' into cell with '과' when solution is '관'
    const res = combineHangulInput('과', 'ㄴ', '관');
    expect(res.currentCell).toBe('관');
    expect(res.shouldAdvance).toBe(true);
  });

  it('correctly resolves multi-character buffer "과ㄴ" into "관" and advances', () => {
    const res = combineHangulInput('', '과ㄴ', '관');
    expect(res.currentCell).toBe('관');
    expect(res.shouldAdvance).toBe(true);
  });

  it('correctly resolves raw jamo buffer "ㄱㅗㅏㄴ" into "관" and advances', () => {
    const res = combineHangulInput('', 'ㄱㅗㅏㄴ', '관');
    expect(res.currentCell).toBe('관');
    expect(res.shouldAdvance).toBe(true);
  });

  it('overflows next consonant to next cell when current syllable already has 받침 (e.g. "관ㄷ")', () => {
    const res = combineHangulInput('관', '관ㄷ', '관');
    expect(res.currentCell).toBe('관');
    expect(res.nextCell).toBe('ㄷ');
    expect(res.shouldAdvance).toBe(true);
  });

  it('overflows consonant to next cell when solution explicitly has no 받침 (e.g. "비" -> "비" + "ㄹ")', () => {
    const res = combineHangulInput('비', '비ㄹ', '비');
    expect(res.currentCell).toBe('비');
    expect(res.nextCell).toBe('ㄹ');
    expect(res.shouldAdvance).toBe(true);
  });

  it('combines consonant into 받침 if solution expects it (e.g. "비" + "ㄹ" -> "빌")', () => {
    const res = combineHangulInput('비', 'ㄹ', '빌');
    expect(res.currentCell).toBe('빌');
    expect(res.shouldAdvance).toBe(true);
  });

  it('advances immediately when complete syllable with no 받침 matches solution without 받침', () => {
    const res = combineHangulInput('', '비', '비');
    expect(res.currentCell).toBe('비');
    expect(res.shouldAdvance).toBe(true);
  });

  it('correctly reports real-time composing status for prefixes without marking mistake', () => {
    // 'ㄱ' for '관' is composing
    expect(checkCellStatus('ㄱ', '관')).toBe('composing');
    // '과' for '관' is composing
    expect(checkCellStatus('과', '관')).toBe('composing');
    // '관' for '관' is correct
    expect(checkCellStatus('관', '관')).toBe('correct');
    // '민' for '관' is incorrect
    expect(checkCellStatus('민', '관')).toBe('incorrect');
  });

  it('correctly identifies syllables, consonants, and vowels', () => {
    expect(isCompleteSyllable('관')).toBe(true);
    expect(isCompleteSyllable('ㄱ')).toBe(false);
    expect(isConsonant('ㄱ')).toBe(true);
    expect(isConsonant('ㅏ')).toBe(false);
    expect(isVowel('ㅏ')).toBe(true);
    expect(isVowel('ㄱ')).toBe(false);
  });

  it('correctly decomposes and recomposes syllables', () => {
    const dec = decompose('관');
    expect(dec).not.toBeNull();
    expect(dec?.cho).toBe('ㄱ');
    expect(dec?.jung).toBe('ㅘ');
    expect(dec?.jong).toBe('ㄴ');

    const composed = compose('ㄱ', 'ㅘ', 'ㄴ');
    expect(composed).toBe('관');
  });
});
