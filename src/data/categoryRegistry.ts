import { CategoryId, CategoryMeta, WordItem, DiagnosticQuestion } from '../types/puzzle';
import { POLITICS_WORDS, POLITICS_QUESTIONS } from './categories/politics';
import { SOCIETY_WORDS, SOCIETY_QUESTIONS } from './categories/society';
import { CULTURE_WORDS, CULTURE_QUESTIONS } from './categories/culture';
import { SPORTS_WORDS, SPORTS_QUESTIONS } from './categories/sports';
import { KOREAN_HISTORY_WORDS, KOREAN_HISTORY_QUESTIONS } from './categories/koreanHistory';
import { WORLD_HISTORY_WORDS, WORLD_HISTORY_QUESTIONS } from './categories/worldHistory';
import { MUSIC_WORDS, MUSIC_QUESTIONS } from './categories/music';
import { ART_WORDS, ART_QUESTIONS } from './categories/art';

export const CATEGORIES_META: CategoryMeta[] = [
  {
    id: 'POLITICS',
    name: '정치',
    fullName: '대한민국 헌법·정치',
    icon: '🏛️',
    color: 'text-sky-600 border-sky-300 bg-sky-50',
    bgGradient: 'from-sky-600 to-blue-700',
    description: '헌법 기본권, 국회 입법, 선거 제도 및 비교정치학 핵심 개념',
    themeId: 'skyBlue',
  },
  {
    id: 'SOCIETY',
    name: '사회',
    fullName: '현대 사회·시사',
    icon: '🏙️',
    color: 'text-emerald-600 border-emerald-300 bg-emerald-50',
    bgGradient: 'from-emerald-600 to-teal-700',
    description: '시민사회, 기본소득, 복지제도, 도시재생 및 현대 사회학 이론',
    themeId: 'emerald',
  },
  {
    id: 'CULTURE',
    name: '문화',
    fullName: '전통·세계 문화',
    icon: '🎭',
    color: 'text-amber-600 border-amber-300 bg-amber-50',
    bgGradient: 'from-amber-600 to-orange-700',
    description: '한류, 유네스코 세계유산, 민속예술 및 현대 문화비평 이론',
    themeId: 'vintageSepia',
  },
  {
    id: 'SPORTS',
    name: '스포츠',
    fullName: '스포츠·올림픽',
    icon: '⚽',
    color: 'text-orange-600 border-orange-300 bg-orange-50',
    bgGradient: 'from-orange-600 to-red-600',
    description: '올림픽 종목, 야구·축구 전술 규칙, 운동역학 및 세이버메트릭스',
    themeId: 'coralWarm',
  },
  {
    id: 'KOREAN_HISTORY',
    name: '한국사',
    fullName: '찬란한 한국사',
    icon: '📜',
    color: 'text-amber-800 border-amber-400 bg-amber-50/80',
    bgGradient: 'from-amber-700 to-yellow-800',
    description: '고조선부터 삼국, 고려, 조선의 실학, 근현대 독립운동사',
    themeId: 'royalSlate',
  },
  {
    id: 'WORLD_HISTORY',
    name: '세계사',
    fullName: '파노라마 세계사',
    icon: '🌍',
    color: 'text-cyan-700 border-cyan-300 bg-cyan-50',
    bgGradient: 'from-cyan-700 to-blue-900',
    description: '고대 4대 문명, 그리스·로마, 르네상스, 시민혁명과 현대 국제질서',
    themeId: 'deepNavy',
  },
  {
    id: 'MUSIC',
    name: '음악',
    fullName: '음악·클래식·국악',
    icon: '🎵',
    color: 'text-violet-600 border-violet-300 bg-violet-50',
    bgGradient: 'from-violet-600 to-purple-800',
    description: '오케스트라 악기, 불멸의 거장, 서양음악사조 및 우리 정악·산조',
    themeId: 'royalSlate',
  },
  {
    id: 'ART',
    name: '미술',
    fullName: '미술·회화·예술사',
    icon: '🎨',
    color: 'text-rose-600 border-rose-300 bg-rose-50',
    bgGradient: 'from-rose-600 to-pink-700',
    description: '동서양 명화, 조각, 인상주의, 다다이즘 및 현대 전위 미술',
    themeId: 'classicBlue',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = CATEGORIES_META.reduce(
  (acc, meta) => {
    acc[meta.id] = meta;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>
);

export function getCategoryMeta(id: CategoryId): CategoryMeta {
  return CATEGORY_MAP[id] || CATEGORIES_META[0];
}

export function getDictionaryForCategory(category: CategoryId): WordItem[] {
  switch (category) {
    case 'POLITICS':
      return POLITICS_WORDS;
    case 'SOCIETY':
      return SOCIETY_WORDS;
    case 'CULTURE':
      return CULTURE_WORDS;
    case 'SPORTS':
      return SPORTS_WORDS;
    case 'KOREAN_HISTORY':
      return KOREAN_HISTORY_WORDS;
    case 'WORLD_HISTORY':
      return WORLD_HISTORY_WORDS;
    case 'MUSIC':
      return MUSIC_WORDS;
    case 'ART':
      return ART_WORDS;
    default:
      return POLITICS_WORDS;
  }
}

export function getDiagnosticQuestionsForCategory(category: CategoryId): DiagnosticQuestion[] {
  switch (category) {
    case 'POLITICS':
      return POLITICS_QUESTIONS;
    case 'SOCIETY':
      return SOCIETY_QUESTIONS;
    case 'CULTURE':
      return CULTURE_QUESTIONS;
    case 'SPORTS':
      return SPORTS_QUESTIONS;
    case 'KOREAN_HISTORY':
      return KOREAN_HISTORY_QUESTIONS;
    case 'WORLD_HISTORY':
      return WORLD_HISTORY_QUESTIONS;
    case 'MUSIC':
      return MUSIC_QUESTIONS;
    case 'ART':
      return ART_QUESTIONS;
    default:
      return POLITICS_QUESTIONS;
  }
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
