// Korean Hangul Unicode Table
export const CHO_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export const JUNG_LIST = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

export const JONG_LIST = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Complex Vowel Combinations (이중모음)
const COMPLEX_VOWELS: Record<string, string> = {
  'ㅗㅏ': 'ㅘ',
  'ㅗㅐ': 'ㅙ',
  'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ',
  'ㅜㅔ': 'ㅞ',
  'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
  'ㅓㅣ': 'ㅔ',
  'ㅏㅣ': 'ㅐ',
  'ㅕㅣ': 'ㅖ',
  'ㅑㅣ': 'ㅒ',
};

// Complex Final Consonants (겹받침)
export const COMPLEX_JONGS: Record<string, string> = {
  'ㄱㅅ': 'ㄳ',
  'ㄴㅈ': 'ㄵ',
  'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ',
  'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ',
  'ㄹㅌ': 'ㄾ',
  'ㄹㅍ': 'ㄿ',
  'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ',
};

/**
 * Checks if char is a complete Hangul syllable (가 ~ 힣)
 */
export function isCompleteSyllable(char: string): boolean {
  if (!char || char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

/**
 * Checks if char is a single Hangul consonant (ㄱ ~ ㅎ)
 */
export function isConsonant(char: string): boolean {
  return CHO_LIST.includes(char) || JONG_LIST.includes(char);
}

/**
 * Checks if char is a single Hangul vowel (ㅏ ~ ㅣ)
 */
export function isVowel(char: string): boolean {
  return JUNG_LIST.includes(char);
}

/**
 * Decomposes a Hangul syllable into 초성, 중성, 종성 indices
 */
export function decompose(char: string) {
  if (!isCompleteSyllable(char)) return null;
  const code = char.charCodeAt(0) - 0xac00;
  const jong = code % 28;
  const jung = Math.floor((code / 28) % 21);
  const cho = Math.floor(code / (28 * 21));
  return {
    cho: CHO_LIST[cho],
    jung: JUNG_LIST[jung],
    jong: JONG_LIST[jong] || '',
    choIndex: cho,
    jungIndex: jung,
    jongIndex: jong,
  };
}

/**
 * Assembles 초성, 중성, 종성 into a complete Hangul syllable
 */
export function compose(cho: string, jung: string, jong: string = ''): string {
  const choIdx = CHO_LIST.indexOf(cho);
  const jungIdx = JUNG_LIST.indexOf(jung);
  const jongIdx = JONG_LIST.indexOf(jong);

  if (choIdx === -1 || jungIdx === -1 || jongIdx === -1) {
    return '';
  }

  const code = 0xac00 + (choIdx * 21 + jungIdx) * 28 + jongIdx;
  return String.fromCharCode(code);
}

/**
 * Smart Combiner:
 * Combines existing character in cell with a newly typed character or IME stroke.
 * Returns:
 * {
 *   currentCell: string;   // what goes into the current cell
 *   nextCell?: string;     // what overflows into the next cell (if any)
 *   shouldAdvance: boolean;// whether cursor should advance to next cell
 * }
 */
export function combineHangulInput(
  prevChar: string,
  newChar: string,
  solutionChar?: string
): { currentCell: string; nextCell?: string; shouldAdvance: boolean } {
  const trimmed = newChar.trim();
  if (!trimmed) return { currentCell: prevChar, shouldAdvance: false };

  const solDec = solutionChar ? decompose(solutionChar) : null;
  const solutionHasJong = Boolean(solDec && solDec.jong);

  // If input contains 2 characters like 'ㅂㅣ' or '미ㄴ' (e.g. fast typing or uncombined buffer)
  if (trimmed.length === 2) {
    if (isConsonant(trimmed[0]) && isVowel(trimmed[1])) {
      const combined = compose(trimmed[0], trimmed[1], '');
      if (combined) {
        return combineHangulInput(prevChar, combined, solutionChar);
      }
    }
    if (isCompleteSyllable(trimmed[0]) && isConsonant(trimmed[1])) {
      const dec = decompose(trimmed[0]);
      if (dec && !dec.jong && JONG_LIST.includes(trimmed[1])) {
        const combined = compose(dec.cho, dec.jung, trimmed[1]);
        if (combined) {
          return combineHangulInput(prevChar, combined, solutionChar);
        }
      }
    }
  }

  // Case 1: Incoming is already a complete syllable (e.g. '비', '민', or pasted syllable)
  if (isCompleteSyllable(trimmed)) {
    const trimDec = decompose(trimmed);
    const trimHasJong = Boolean(trimDec && trimDec.jong);

    // Exact solution match -> always advance!
    if (solutionChar && trimmed === solutionChar) {
      return { currentCell: trimmed, shouldAdvance: true };
    }

    // Target solution has NO 받침 (e.g. '비', '대', '주', '표') -> always advance on complete syllable!
    if (!solutionHasJong) {
      return { currentCell: trimmed, shouldAdvance: true };
    }

    // Target solution DOES have a 받침 (e.g. '민', '법', '헌')
    if (trimHasJong) {
      // User entered a syllable WITH a 받침 (e.g. '민' or '문') -> advance!
      return { currentCell: trimmed, shouldAdvance: true };
    } else {
      // User entered 초성+중성 (e.g. '미' or '버'), wait for user to type 받침 ('ㄴ' or 'ㅂ')!
      return { currentCell: trimmed, shouldAdvance: false };
    }
  }

  // Case 2: Incoming is a single consonant (e.g. 'ㅂ', 'ㅁ')
  if (isConsonant(trimmed)) {
    // If previous cell is empty -> store consonant, wait for vowel, do not advance
    if (!prevChar) {
      return { currentCell: trimmed, shouldAdvance: false };
    }

    // If previous cell already had a standalone consonant ('ㄱ') and user types another consonant ('ㄷ'): replace it
    if (isConsonant(prevChar)) {
      return { currentCell: trimmed, shouldAdvance: false };
    }

    // If previous cell already has a complete syllable (e.g. '비' or '미' or '허')
    if (isCompleteSyllable(prevChar)) {
      const dec = decompose(prevChar);
      if (dec && !dec.jong) {
        // Current syllable has NO 받침 yet
        const potentialSyllable = compose(dec.cho, dec.jung, trimmed);

        // If target solution matches with this 받침 (e.g. '미' + 'ㄴ' = '민')
        if (solutionChar && potentialSyllable === solutionChar) {
          return { currentCell: potentialSyllable, shouldAdvance: true };
        }

        // If solution explicitly expects this 받침
        if (solDec && solDec.jong === trimmed) {
          return { currentCell: potentialSyllable, shouldAdvance: true };
        }

        // If current cell already matches solution (e.g. solution is '비' and user types 'ㄹ' for next cell '례')
        if (solutionChar && prevChar === solutionChar) {
          return { currentCell: prevChar, nextCell: trimmed, shouldAdvance: true };
        }

        // If solution has NO 받침, incoming consonant definitely belongs to next cell!
        if (!solutionHasJong) {
          return { currentCell: prevChar, nextCell: trimmed, shouldAdvance: true };
        }

        // Otherwise, if it can form a valid syllable with this 받침
        if (potentialSyllable && JONG_LIST.includes(trimmed)) {
          return { currentCell: potentialSyllable, shouldAdvance: true };
        }
      }

      // If prevChar already has a 받침 (e.g. '헌') -> incoming consonant belongs to next cell!
      return { currentCell: prevChar, nextCell: trimmed, shouldAdvance: true };
    }
  }

  // Case 3: Incoming is a single vowel (e.g. 'ㅣ', 'ㅏ')
  if (isVowel(trimmed)) {
    // If previous cell had a consonant ('ㅂ')
    if (isConsonant(prevChar)) {
      const syllable = compose(prevChar, trimmed, '');
      if (syllable) {
        return combineHangulInput('', syllable, solutionChar);
      }
    }

    // If previous cell has a syllable without 받침 and incoming forms a complex vowel (e.g. 'ㅗ' + 'ㅏ' = 'ㅘ')
    if (isCompleteSyllable(prevChar)) {
      const dec = decompose(prevChar);
      if (dec && !dec.jong) {
        const combinedVowel = COMPLEX_VOWELS[dec.jung + trimmed];
        if (combinedVowel) {
          const complexSyllable = compose(dec.cho, combinedVowel, '');
          if (complexSyllable) {
            return combineHangulInput('', complexSyllable, solutionChar);
          }
        }
      }
    }
  }

  // Fallback
  return { currentCell: trimmed, shouldAdvance: isCompleteSyllable(trimmed) };
}
