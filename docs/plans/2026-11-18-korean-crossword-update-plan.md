# 지식 탐구 낱말퍼즐 전면 고도화 구현 계획 (Roadmap Implementation Plan)

> **For agentic workers:** Execute task-by-task with verification. All 4 stages and 24 checklist items from the PDF technical roadmap report are mapped below.

**Goal:** Transform the Korean Crossword Puzzle from a basic single-state game into an independent 8-category knowledge learning platform with offline PWA, daily challenge, error-note review, senior accessibility, and modular architecture.

**Architecture:** 
1. **Data Layer (`src/services/` & `src/types/`):** Unified `UserSaveData` with independent category progress, active game resume, backwards-compatible migration from v5, seedable daily puzzle generator, compact/lazy-loaded category boards.
2. **Game Core Layer (`src/hooks/` & `src/utils/`):** Modular hooks for game state, timer, Hangul typing, and achievements. Zero spoiler word-guide masking.
3. **UI / Feature Layer (`src/features/` & `src/components/`):** 5-tab navigation (홈, 도전, 지식, 기록, 설정) matching Page 5 mockup, Daily Crossword, Wrong Word Flashcards/Quiz, Achievements modal, 3-level Senior font zoom, and PWA Service Worker.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, Tailwind CSS 3.4, Vitest, Canvas-Confetti, Lucide-React.

---

## Task List & Implementation Stages

### Stage 1: Core Game Stabilization (1단계. 핵심 게임 안정화)
- [ ] **Task 1.1: Data Schema & Independent Category Progress (`src/types/progress.ts`, `src/services/storageService.ts`)**
  - Define `CategoryProgress`, `ActiveGameSession`, `DailyChallengeData`, `AchievementItem`, `WrongWordItem`, `UserSaveData`.
  - Independent level (1-10) and clearCount (0-3) for each of the 8 categories.
  - Implement transparent migration from `politics_crossword_progress_v5` to `knowledge_crossword_save_v1`.
  - Fix attendance bonus to use KST (`Asia/Seoul`, UTC+9).
  - Unit tests in `src/tests/storageService.test.ts`.

- [ ] **Task 1.2: Active Game Auto-Save & Resume (`useGameState.ts`, `src/services/storageService.ts`)**
  - Save board userGrid, revealed chosungs, elapsed time on every cell change.
  - On app launch or category switch, automatically resume in-progress game rather than resetting to blank.
  - Reset active game only when board is cleared or user explicitly requests a reset.

- [ ] **Task 1.3: Master Certificate Verification & Real Completion Check (`MasterCertificate.tsx`, `MyPageView.tsx`, `RecordsView.tsx`)**
  - Check whether all 10 levels (30 boards) for the category are actually completed before granting certificate.
  - Display exact progress (e.g., "27/30 관문 돌파", "Lv.10 3개 관문 완료 필요").
  - Lock certificate access with informative modal if conditions are not met.

- [ ] **Task 1.4: Prevent Word Spoiler in Learning Guide (`PuzzleStageKnowledgeGuide.tsx`)**
  - In Challenge mode, mask unsolved word terms (e.g. `● ● ●` with letter count tag).
  - Reveal full term and definition only when word is completed on the board.
  - Provide a toggle for "학습/열람 모드" (Learning mode) vs "도전 모드" (Challenge mode).

- [ ] **Task 1.5: Duplicate Clear Prevention & Sound/Setting Persistence**
  - Guard `handleBoardCleared` with an idempotent completed flag per board session.
  - Save sound mute, font size, and theme preferences inside `UserSaveData.settings`.

### Stage 2: Technical Quality & Performance (2단계. 기술적 품질 개선)
- [ ] **Task 2.1: Package.json Clean-up & Vitest Infrastructure**
  - Remove unused scripts (`sudoku:*`, `honglabai:*`, `newsletter:*`).
  - Add `vitest` to `devDependencies`, add `"test": "vitest run"`.
  - Remove unused static files `src/data/generatedBoards.json` (983KB) and `src/data/prebuiltBoards.ts`.

- [ ] **Task 2.2: Puzzle Data Splitting & Compression (`src/data/boards/`)**
  - Split `allPrebuiltBoards.json` (7.3MB) into lightweight category modules:
    `src/data/boards/politics.ts`, `society.ts`, `culture.ts`, `sports.ts`, `koreanHistory.ts`, `worldHistory.ts`, `music.ts`, `art.ts`.
  - Compress boards by omitting serialized empty grid cells (generate grid dynamically in memory at load time from `placedWords` and `size`).
  - Board file sizes reduced from 7.3MB to ~150KB!

- [ ] **Task 2.3: Seedable Generator & Word Selection by Difficulty (`crosswordGenerator.ts`)**
  - Implement Mulberry32 PRNG with seed support.
  - Weight vocabulary selection by level difficulty (Lv.1~3 common, Lv.8~10 advanced).
  - Clean across/down start number collision handling.

- [ ] **Task 2.4: 240 Prebuilt Boards Validation Test (`src/tests/boardsValidation.test.ts`)**
  - Automated test verifying all 240 prebuilt boards have valid intersections, no out-of-bounds cells, and non-empty clues.

### Stage 3: User Feature Improvements (3단계. 사용자 기능 개선)
- [ ] **Task 3.1: 5-Tab Navigation & Page 5 Home Screen (`src/features/home/HomeScreen.tsx`, `BottomNavBar.tsx`)**
  - Implement 5-tab layout: `HOME` (홈), `CHALLENGE` (도전), `KNOWLEDGE` (지식), `RECORDS` (기록), `SETTINGS` (설정).
  - Home screen components:
    1. Daily Crossword banner with direct jump.
    2. In-progress puzzle resume card ("이어하기").
    3. 8-category grid selection with badges and level indicators.
    4. Learning stats card (완료 퍼즐, 학습 단어, 연속 출석).
    5. Wrong words review prompt card.
    6. Friend share CTA button.

- [ ] **Task 3.2: Daily Crossword ("오늘의 낱말퍼즐") (`src/features/daily/DailyChallengeModal.tsx`, `src/services/dailyService.ts`)**
  - Deterministic daily seed based on KST date string `YYYY-MM-DD`.
  - Common puzzle of the day across all users.
  - Streak tracker (연속 출석 및 완료 일수).
  - Social share card generator (Web Share API / Clipboard copy with emoji tiles & time).

- [ ] **Task 3.3: AI/Rule-based Wrong Words Note & Review Quiz (`src/features/learning/WrongWordsView.tsx`)**
  - Automatically log wrong cell inputs and words where chosung hints were used.
  - Interactive Flashcard & Quiz mode to practice missed vocabulary.

- [ ] **Task 3.4: Achievements & Badges System (`src/features/achievements/AchievementsModal.tsx`)**
  - 10+ achievements with visual badges and hint rewards:
    - 첫 걸음 (첫 퍼즐 완료)
    - 성실한 탐구자 (3일 / 7일 / 30일 연속 출석)
    - 어휘 수집가 (100 / 300 / 500 단어 완성)
    - 힌트 독립군 (힌트 없이 Lv.5 이상 클리어)
    - 분야별 마스터 (각 분야 10레벨 올클리어)

- [ ] **Task 3.5: Senior Accessibility (글자 확대 & 고대비 & 터치 최적화)**
  - Font size selector: 보통 (100%), 크게 (115%), 아주 크게 (130%).
  - Ensure contrast ratios and large touch targets (min 44x44px) across virtual keypad and cell inputs.

### Stage 4: Service Operations & PWA Optimization (4단계. 서비스 운영 최적화)
- [ ] **Task 4.1: Service Worker & Offline Play (`public/sw.js`, `src/registerSW.ts`)**
  - Cache app shell, CSS, JS, and all 8 category puzzle data for full offline gameplay.
  - Offline status indicator and auto-reconnect handling.

- [ ] **Task 4.2: Monetization & AdSense Alignment**
  - Keep responsive AdSense slots properly spaced.
  - Maintain simulated 5-second countdown rewarded ad modal ready for SDK swap without annoying interrupts.

- [ ] **Task 4.3: App.tsx Modularization & Verification**
  - Break down giant `App.tsx` into modular hooks and feature containers.
  - Run full test suite (`npm test`).
  - Run production build (`npm run build`).
  - Git commit with author `honglabai <honglabai@gmail.com>` and push to `origin main`.
  - Verify live deployment on `https://crossword.honglabai.com/`.
