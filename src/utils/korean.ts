// Korean Initial Consonants (초성 19개)
const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * Extracts Korean initial consonant (초성) from a syllable.
 * e.g., '민' -> 'ㅁ', '주' -> 'ㅈ'
 */
export function getChosung(char: string): string {
  if (!char || char.length === 0) return '';
  const code = char.charCodeAt(0) - 44032;
  if (code >= 0 && code <= 11171) {
    const chosungIndex = Math.floor(code / 588);
    return CHOSUNG_LIST[chosungIndex] || char;
  }
  return char;
}

/**
 * Returns chosung string for entire word
 * e.g., '민주주의' -> 'ㅁㅈㅈㅇ'
 */
export function getWordChosung(word: string): string {
  return word.split('').map(getChosung).join('');
}

/**
 * Convert number 1~20 to circled Korean/Unicode number
 */
export function toCircledNumber(num: number): string {
  const circles = [
    '⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨',
    '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'
  ];
  return circles[num] || `${num}`;
}

/**
 * Checks if a string is a complete Korean Hangul syllable (가 ~ 힣)
 */
export function isHangulSyllable(char: string): boolean {
  if (!char || char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}
