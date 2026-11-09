import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORIES_META, getDictionaryForCategory } from '../src/data/categoryRegistry';
import { generateCrosswordBoard, getWordCountForLevel, getGridSizeForLevel } from '../src/utils/crosswordGenerator';
import { BoardData, CategoryId } from '../src/types/puzzle';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PrebuiltMap = Record<CategoryId, Record<number, BoardData[]>>;

const allCategoryBoards: PrebuiltMap = {} as PrebuiltMap;

console.log('Generating prebuilt boards for ALL 8 CATEGORIES (310+ words each)...');
console.log('Scaling: Lv.1~3: 10 words (9x9), Lv.4~7: 15 words (11x11), Lv.8~10: 20 words (13x13)');

const startTime = Date.now();

for (const cat of CATEGORIES_META) {
  const catId = cat.id;
  allCategoryBoards[catId] = {} as Record<number, BoardData[]>;
  const dict = getDictionaryForCategory(catId);
  console.log(`\n[${cat.name} (${catId})] Dictionary size: ${dict.length} words`);

  for (let lvl = 1; lvl <= 10; lvl++) {
    allCategoryBoards[catId][lvl] = [];
    const targetCount = getWordCountForLevel(lvl);
    const gridSize = getGridSizeForLevel(lvl);

    const levelWords = dict.filter(w => w.level === lvl);
    const otherWords = dict.filter(w => w.level !== lvl);

    for (let b = 1; b <= 3; b++) {
      let board: BoardData | null = null;
      let retries = 0;
      while (!board && retries < 180) {
        retries++;
        // Shuffle level words and fallback other words
        const shuffledLevel = [...levelWords].sort(() => Math.random() - 0.5);
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        const pool = [...shuffledLevel, ...shuffledOthers];

        board = generateCrosswordBoard(pool, lvl, b, gridSize, targetCount, catId);
      }

      if (board) {
        allCategoryBoards[catId][lvl].push(board);
      } else {
        console.error(`[${catId}] Failed to generate Lv.${lvl} Board ${b} after ${retries} retries!`);
      }
    }
    console.log(`  Lv.${lvl}: generated ${allCategoryBoards[catId][lvl].length}/3 boards (${targetCount} words, ${gridSize}x${gridSize})`);
  }
}

const outputPath = path.join(__dirname, '../src/data/allPrebuiltBoards.json');
fs.writeFileSync(outputPath, JSON.stringify(allCategoryBoards, null, 2), 'utf-8');

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\nSuccessfully built and saved ALL 240 BOARDS (8 categories x 10 levels x 3 boards) to src/data/allPrebuiltBoards.json in ${elapsed}s!`);
