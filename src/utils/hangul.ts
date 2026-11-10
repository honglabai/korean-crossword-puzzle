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

// Complex Vowel Combinations (이중모음 결합 규칙)
export const COMPLEX_VOWELS: Record<string, string> = {
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

// Vowel Prefix Map: Vowels that can form compound vowels upon subsequent vowel keystroke
export const VOWEL_PREFIX_MAP: Record<string, string[]> = {
  'ㅗ': ['ㅘ', 'ㅙ', 'ㅚ'],
  'ㅜ': ['ㅝ', 'ㅞ', 'ㅟ'],
  'ㅡ': ['ㅢ'],
  'ㅏ': ['ㅐ'],
  'ㅓ': ['ㅔ'],
  'ㅕ': ['ㅖ'],
  'ㅑ': ['ㅒ'],
  'ㅘ': ['ㅙ'],
  'ㅝ': ['ㅞ'],
};

// Complex Final Consonants (겹받침 결합 규칙)
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

// Final Consonant Prefix Map: Single consonants that can become complex final consonants
export const JONG_PREFIX_MAP: Record<string, string[]> = {
  'ㄱ': ['ㄳ', 'ㄺ'],
  'ㄴ': ['ㄵ', 'ㄶ'],
  'ㄹ': ['ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ'],
  'ㅂ': ['ㅄ'],
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
 * Checks if current vowel is an incomplete prefix of target compound vowel
 */
export function isVowelPrefix(currentJung: string, targetJung: string): boolean {
  if (currentJung === targetJung) return false;
  const possibleTargets = VOWEL_PREFIX_MAP[currentJung];
  return Boolean(possibleTargets && possibleTargets.includes(targetJung));
}

/**
 * Checks if current final consonant is an incomplete prefix of target compound final consonant
 */
export function isJongPrefix(currentJong: string, targetJong: string): boolean {
  if (currentJong === targetJong) return false;
  const possibleTargets = JONG_PREFIX_MAP[currentJong];
  return Boolean(possibleTargets && possibleTargets.includes(targetJong));
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
 * Resolves compound vowels (e.g. '호' + 'ㅏ' -> '화') and prevents premature cell advancement.
 *
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
  let trimmed = newChar.trim();
  if (!trimmed) return { currentCell: prevChar, shouldAdvance: false };

  const solDec = solutionChar ? decompose(solutionChar) : null;
  const solutionHasJong = Boolean(solDec && solDec.jong);

  // 1. Multi-character buffer check: Uncombined syllable + vowel (e.g. '호ㅏ' -> '화')
  if (trimmed.length >= 2 && isCompleteSyllable(trimmed[0]) && isVowel(trimmed[1])) {
    const dec = decompose(trimmed[0]);
    if (dec && !dec.jong) {
      const combinedVowel = COMPLEX_VOWELS[dec.jung + trimmed[1]];
      if (combinedVowel) {
        const merged = compose(dec.cho, combinedVowel, '');
        if (merged) {
          trimmed = merged + trimmed.slice(2);
        }
      }
    }
  }

  // 2. Multi-character buffer check: Syllable + consonant (e.g. '화ㄱ' or '미ㄴ')
  if (trimmed.length === 2 && isCompleteSyllable(trimmed[0]) && isConsonant(trimmed[1])) {
    const dec = decompose(trimmed[0]);
    if (dec && !dec.jong) {
      // If solution is known and matches trimmed[0], or solution has no 받침:
      // The second consonant trimmed[1] belongs to the NEXT cell!
      if (solutionChar && (trimmed[0] === solutionChar || !solutionHasJong)) {
        return { currentCell: trimmed[0], nextCell: trimmed[1], shouldAdvance: true };
      }

      // If solution expects this 받침 (e.g. '미' + 'ㄴ' for '민')
      if (solDec && solDec.jong === trimmed[1]) {
        const combined = compose(dec.cho, dec.jung, trimmed[1]);
        if (combined) {
          return combineHangulInput(prevChar, combined, solutionChar);
        }
      }

      // If solution has no 받침, overflow consonant to next cell
      if (!solutionHasJong) {
        return { currentCell: trimmed[0], nextCell: trimmed[1], shouldAdvance: true };
      }

      // Otherwise combine into 받침 if valid
      if (JONG_LIST.includes(trimmed[1])) {
        const combined = compose(dec.cho, dec.jung, trimmed[1]);
        if (combined) {
          return combineHangulInput(prevChar, combined, solutionChar);
        }
      }
    }
  }

  // 3. Multi-character buffer check: 2 consonants/vowels (e.g. 'ㅂㅣ' -> '비')
  if (trimmed.length === 2 && isConsonant(trimmed[0]) && isVowel(trimmed[1])) {
    const combined = compose(trimmed[0], trimmed[1], '');
    if (combined) {
      return combineHangulInput(prevChar, combined, solutionChar);
    }
  }

  // Case 1: Incoming is already a complete syllable (e.g. '호', '화', '민', '주')
  if (isCompleteSyllable(trimmed)) {
    const trimDec = decompose(trimmed);
    const trimHasJong = Boolean(trimDec && trimDec.jong);

    // Exact solution match -> always advance!
    if (solutionChar && trimmed === solutionChar) {
      return { currentCell: trimmed, shouldAdvance: true };
    }

    // Check if trimmed is an intermediate composition step towards solutionChar
    if (solDec && trimDec) {
      if (trimDec.cho === solDec.cho) {
        // Vowel is a prefix of solution's compound vowel (e.g. '호' for '화', '구' for '권') -> DO NOT ADVANCE!
        if (isVowelPrefix(trimDec.jung, solDec.jung)) {
          return { currentCell: trimmed, shouldAdvance: false };
        }

        // Vowel matches, but solution requires a 받침 (jong) that user hasn't typed yet (e.g. '미' for '민', '구' for '국') -> DO NOT ADVANCE!
        if (trimDec.jung === solDec.jung && solDec.jong && !trimHasJong) {
          return { currentCell: trimmed, shouldAdvance: false };
        }

        // Vowel matches, and user typed first half of a compound 받침 (e.g. '갑' for '값') -> DO NOT ADVANCE!
        if (trimDec.jung === solDec.jung && isJongPrefix(trimDec.jong, solDec.jong)) {
          return { currentCell: trimmed, shouldAdvance: false };
        }
      }
    }

    // If syllable has a 받침 -> cannot take more vowels or single 받침, so advance!
    if (trimHasJong) {
      return { currentCell: trimmed, shouldAdvance: true };
    }

    // If syllable has NO 받침:
    // If its vowel CAN combine into a compound vowel (like 'ㅗ', 'ㅜ', 'ㅡ'),
    // DO NOT advance prematurely! Wait for the next vowel stroke!
    if (VOWEL_PREFIX_MAP[trimDec?.jung || '']) {
      return { currentCell: trimmed, shouldAdvance: false };
    }

    // If vowel cannot combine further and solution has no 받침, advance
    if (!solutionHasJong) {
      return { currentCell: trimmed, shouldAdvance: true };
    } else {
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

    // If previous cell has a syllable without 받침 and incoming forms a complex vowel (e.g. '호' + 'ㅏ' = '화')
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

export type CellValidationStatus = 'empty' | 'correct' | 'incorrect' | 'composing';

/**
 * Checks real-time correctness of a user-entered character against the solution character:
 * - 'empty': no character entered
 * - 'correct': entered character matches solutionChar
 * - 'composing': entered character is an in-progress prefix of solutionChar (e.g. 'ㅁ' for '민', '호' for '화', '미' for '민')
 * - 'incorrect': entered character does not match and cannot form solutionChar
 */
export function checkCellStatus(userChar: string, solutionChar: string): CellValidationStatus {
  if (!userChar) return 'empty';
  if (!solutionChar) return 'empty';
  if (userChar === solutionChar) return 'correct';

  const solDec = decompose(solutionChar);

  // If user entered a single consonant (e.g. 'ㅁ' when solution is '민')
  if (isConsonant(userChar)) {
    if (solDec && userChar === solDec.cho) {
      return 'composing';
    }
    return 'incorrect';
  }

  // If user entered a complete syllable (e.g. '미' or '호')
  if (isCompleteSyllable(userChar)) {
    if (solDec) {
      const userDec = decompose(userChar);
      if (userDec && userDec.cho === solDec.cho) {
        // 1. Vowel prefix for compound vowel: e.g. '호' for '화'
        if (isVowelPrefix(userDec.jung, solDec.jung) && !userDec.jong) {
          return 'composing';
        }
        // 2. Chosung and Jung match, but solution needs a final consonant (받침): e.g. '미' for '민', '구' for '국'
        if (userDec.jung === solDec.jung && solDec.jong && !userDec.jong) {
          return 'composing';
        }
        // 3. User entered first consonant of compound final consonant: e.g. '갑' for '값'
        if (userDec.jung === solDec.jung && isJongPrefix(userDec.jong, solDec.jong)) {
          return 'composing';
        }
      }
    }
    return 'incorrect';
  }

  // Any other character (alphanumeric, symbols)
  return userChar === solutionChar ? 'correct' : 'incorrect';
}

