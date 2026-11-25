import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const articlesDir = path.join(publicDir, 'articles');

fs.mkdirSync(articlesDir, { recursive: true });

// Bundle and evaluate TS data modules via esbuild
async function loadTsModule(entryRelPath) {
  const result = await build({
    entryPoints: [path.join(rootDir, entryRelPath)],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    target: 'node20',
  });
  const code = result.outputFiles[0].text;
  const encoded = Buffer.from(code, 'utf-8').toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

const { KNOWLEDGE_ARTICLES } = await loadTsModule('src/data/knowledgeArticles.ts');
const { POLITICS_WORDS } = await loadTsModule('src/data/categories/politics.ts');
const { SOCIETY_WORDS } = await loadTsModule('src/data/categories/society.ts');
const { CULTURE_WORDS } = await loadTsModule('src/data/categories/culture.ts');
const { SPORTS_WORDS } = await loadTsModule('src/data/categories/sports.ts');
const { KOREAN_HISTORY_WORDS } = await loadTsModule('src/data/categories/koreanHistory.ts');
const { WORLD_HISTORY_WORDS } = await loadTsModule('src/data/categories/worldHistory.ts');
const { MUSIC_WORDS } = await loadTsModule('src/data/categories/music.ts');
const { ART_WORDS } = await loadTsModule('src/data/categories/art.ts');

const CATEGORIES = [
  { id: 'POLITICS', slug: 'politics', name: '정치', fullName: '대한민국 헌법·정치', icon: '🏛️', words: POLITICS_WORDS },
  { id: 'SOCIETY', slug: 'society', name: '사회', fullName: '현대 사회·법치·시사', icon: '⚖️', words: SOCIETY_WORDS },
  { id: 'CULTURE', slug: 'culture', name: '문화', fullName: '세계유산·전통문화', icon: '🎭', words: CULTURE_WORDS },
  { id: 'SPORTS', slug: 'sports', name: '스포츠', fullName: '올림픽·스포츠 과학', icon: '⚽', words: SPORTS_WORDS },
  { id: 'KOREAN_HISTORY', slug: 'korean-history', name: '한국사', fullName: '고조선부터 대한민국까지', icon: '📜', words: KOREAN_HISTORY_WORDS },
  { id: 'WORLD_HISTORY', slug: 'world-history', name: '세계사', fullName: '인류 문명과 세계의 역사', icon: '🌍', words: WORLD_HISTORY_WORDS },
  { id: 'MUSIC', slug: 'music', name: '음악', fullName: '국악·클래식·음악 이론', icon: '🎵', words: MUSIC_WORDS },
  { id: 'ART', slug: 'art', name: '미술', fullName: '동서양 미술사와 미학', icon: '🎨', words: ART_WORDS },
];

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLayout({ title, description, bodyHtml, activePath = '' }) {
  const articleLinks = CATEGORIES.map(
    (c) =>
      `<a href="/articles/${c.slug}.html" class="nav-pill ${activePath === `/articles/${c.slug}.html` ? 'active' : ''}">${c.icon} ${c.name}</a>`
  ).join('\n        ');

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="honglabai" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="google-adsense-account" content="ca-pub-8675047967209162" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8675047967209162" crossorigin="anonymous"></script>
  <style>
    :root {
      --primary: #0288d1;
      --primary-dark: #01579b;
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #0f172a;
      --text-muted: #475569;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.75;
    }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .site-header {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .header-inner {
      max-width: 960px;
      margin: 0 auto;
      padding: 12px 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 900;
      font-size: 18px;
      color: var(--text);
      text-decoration: none;
    }
    .brand:hover { text-decoration: none; color: var(--primary); }
    .top-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
    }
    .top-nav a {
      padding: 6px 12px;
      border-radius: 999px;
      color: var(--text-muted);
      background: #f1f5f9;
    }
    .top-nav a:hover, .top-nav a.active {
      background: var(--primary);
      color: #ffffff;
      text-decoration: none;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 16px 48px;
    }
    .hero {
      background: linear-gradient(135deg, #0288d1 0%, #01579b 65%, #0f172a 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 28px 24px;
      margin-bottom: 24px;
    }
    .hero-badge {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 10px;
    }
    .hero h1 {
      margin: 0 0 8px;
      font-size: 26px;
      line-height: 1.35;
      font-weight: 900;
    }
    .hero p {
      margin: 0;
      font-size: 15px;
      color: #e0f2fe;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 22px 24px;
      margin-bottom: 20px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .card h2 {
      margin: 0 0 12px;
      font-size: 20px;
      font-weight: 800;
      color: var(--text);
      border-left: 4px solid var(--primary);
      padding-left: 10px;
    }
    .card h3 {
      margin: 18px 0 8px;
      font-size: 17px;
      font-weight: 800;
      color: #1e293b;
    }
    .card p {
      margin: 0 0 12px;
      color: #334155;
      font-size: 15px;
    }
    .card ul, .card ol {
      margin: 8px 0 14px;
      padding-left: 20px;
      color: #334155;
      font-size: 15px;
    }
    .card li { margin-bottom: 6px; }
    .glossary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .glossary-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
    }
    .glossary-term {
      font-weight: 900;
      font-size: 15px;
      color: var(--primary-dark);
      margin-bottom: 4px;
    }
    .glossary-level {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      background: #e0f2fe;
      color: #0369a1;
      padding: 1px 7px;
      border-radius: 6px;
      margin-left: 6px;
    }
    .glossary-def {
      font-size: 13.5px;
      color: #475569;
      margin: 0;
      line-height: 1.55;
    }
    .cta-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;
      border-radius: 16px;
      padding: 20px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    .cta-btn {
      display: inline-block;
      background: #0288d1;
      color: #ffffff !important;
      font-weight: 900;
      font-size: 14px;
      padding: 11px 20px;
      border-radius: 12px;
      text-decoration: none !important;
      box-shadow: 0 2px 6px rgba(2, 136, 209, 0.25);
    }
    .cta-btn:hover { background: #0277bd; }
    .sub-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .nav-pill {
      font-size: 12.5px;
      font-weight: 700;
      padding: 5px 11px;
      border-radius: 999px;
      background: #ffffff;
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .nav-pill.active, .nav-pill:hover {
      background: #e0f2fe;
      border-color: #7dd3fc;
      color: #0369a1;
      text-decoration: none;
    }
    .site-footer {
      background: #ffffff;
      border-top: 1px solid var(--border);
      padding: 28px 16px;
      font-size: 13px;
      color: #64748b;
    }
    .footer-inner {
      max-width: 960px;
      margin: 0 auto;
    }
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    @media (max-width: 640px) {
      .hero h1 { font-size: 21px; }
      .card { padding: 18px 16px; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="brand">
        <span>🧩</span>
        <span>지식 탐구 가로세로 낱말퍼즐</span>
      </a>
      <nav class="top-nav" aria-label="주요 메뉴">
        <a href="/">퍼즐 홈</a>
        <a href="/guide.html" class="${activePath === '/guide.html' ? 'active' : ''}">학습 가이드</a>
        <a href="/articles/politics.html" class="${activePath.startsWith('/articles/') ? 'active' : ''}">8대 지식 백과</a>
        <a href="/about.html" class="${activePath === '/about.html' ? 'active' : ''}">서비스 소개</a>
        <a href="/contact.html" class="${activePath === '/contact.html' ? 'active' : ''}">문의하기</a>
      </nav>
    </div>
  </header>

  <main class="container">
    ${bodyHtml}
    <section class="card" aria-label="8대 지식 영역 백과 바로가기">
      <h2>8대 지식 영역 심층 칼럼 둘러보기</h2>
      <p>대한민국 필수 교양 8개 영역의 배경 지식과 핵심 어휘 해설을 확인해 보세요.</p>
      <div class="sub-nav">
        ${articleLinks}
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="/">홈 (낱말퍼즐 시작)</a>
        <a href="/guide.html">학습 가이드</a>
        <a href="/about.html">서비스 소개</a>
        <a href="/privacy.html">개인정보처리방침</a>
        <a href="/terms.html">이용약관</a>
        <a href="/contact.html">문의하기</a>
      </div>
      <p style="margin: 0 0 6px;">운영자: honglabai | 문의: <a href="mailto:honglabai@gmail.com">honglabai@gmail.com</a></p>
      <p style="margin: 0;">© 2026 지식 탐구 가로세로 낱말퍼즐 (honglabai). All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

// 1. Generate 8 Knowledge Article Pages
for (const cat of CATEGORIES) {
  const art = KNOWLEDGE_ARTICLES[cat.id];
  // Pick 30 representative words evenly across levels (1..10)
  const selectedWords = [];
  for (let lvl = 1; lvl <= 10; lvl++) {
    const levelWords = cat.words.filter((w) => w.level === lvl);
    selectedWords.push(...levelWords.slice(0, 3));
  }

  const sectionsHtml = art.sections
    .map(
      (sec) => `
      <section class="card">
        <h2>${escapeHtml(sec.heading)}</h2>
        <p>${escapeHtml(sec.content)}</p>
      </section>`
    )
    .join('\n');

  const keyGlossaryHtml = art.keyGlossary
    .map(
      (g) => `
      <div class="glossary-item">
        <div class="glossary-term">${escapeHtml(g.term)} <span class="glossary-level">${escapeHtml(g.importance)}</span></div>
        <p class="glossary-def">${escapeHtml(g.definition)}</p>
      </div>`
    )
    .join('\n');

  const vocabHtml = selectedWords
    .map(
      (w) => `
      <div class="glossary-item">
        <div class="glossary-term">${escapeHtml(w.term)} <span class="glossary-level">Lv.${w.level}</span></div>
        <p class="glossary-def">${escapeHtml(w.definition)}</p>
      </div>`
    )
    .join('\n');

  const bodyHtml = `
    <div class="hero">
      <span class="hero-badge">${cat.icon} ${escapeHtml(cat.fullName)} · ${escapeHtml(art.readTime)}</span>
      <h1>${escapeHtml(art.title)}</h1>
      <p>${escapeHtml(art.subtitle)} — ${escapeHtml(art.summary)}</p>
    </div>

    <div class="cta-box">
      <div>
        <strong style="font-size: 16px; color: #0f172a; display: block; margin-bottom: 4px;">
          ${cat.icon} ${escapeHtml(cat.name)} 분야 310개 어휘를 직접 퍼즐로 풀어보세요!
        </strong>
        <span style="font-size: 13.5px; color: #334155;">초급·중급·고급 10단계 총 30개 관문 보드가 무료로 제공됩니다.</span>
      </div>
      <a href="/?category=${cat.id}&tab=CHALLENGE" class="cta-btn">${escapeHtml(cat.name)} 퍼즐 바로 풀기 ▶</a>
    </div>

    ${sectionsHtml}

    <section class="card">
      <h2>핵심 개념 요약 사전</h2>
      <p>${escapeHtml(cat.name)} 영역에서 반드시 알아두어야 할 핵심 개념과 중요도를 정리했습니다.</p>
      <div class="glossary-grid">
        ${keyGlossaryHtml}
      </div>
    </section>

    <section class="card">
      <h2>출제 어휘 미리보기 (${selectedWords.length}선)</h2>
      <p>실제 가로세로 낱말퍼즐 Lv.1부터 Lv.10까지 출제되는 주요 어휘와 표준 해설입니다. 전체 310개 어휘는 퍼즐과 지식백과 탭에서 확인하실 수 있습니다.</p>
      <div class="glossary-grid">
        ${vocabHtml}
      </div>
    </section>

    <section class="card">
      <h2>낱말퍼즐 공략 팁</h2>
      <p>${escapeHtml(art.crosswordTip)}</p>
    </section>
  `;

  const html = renderLayout({
    title: `${art.title} | ${cat.name} 지식 백과 - 가로세로 낱말퍼즐`,
    description: `${art.summary} ${cat.fullName} 분야 핵심 어휘 해설 및 무료 십자말풀이 학습 가이드.`,
    bodyHtml,
    activePath: `/articles/${cat.slug}.html`,
  });

  fs.writeFileSync(path.join(articlesDir, `${cat.slug}.html`), html, 'utf-8');
}

// 2. Generate guide.html
{
  const bodyHtml = `
    <div class="hero">
      <span class="hero-badge">📖 학습 가이드 &amp; 공략법</span>
      <h1>가로세로 낱말퍼즐 완벽 활용 가이드</h1>
      <p>초보자부터 상식 마스터까지, 어휘력과 배경지식을 가장 효과적으로 키우는 낱말퍼즐 학습법을 안내합니다.</p>
    </div>

    <div class="cta-box">
      <div>
        <strong style="font-size: 16px; color: #0f172a; display: block; margin-bottom: 4px;">지금 바로 첫 관문에 도전해 보세요</strong>
        <span style="font-size: 13.5px; color: #334155;">회원가입 없이 브라우저에서 즉시 플레이하고 학습 기록을 저장할 수 있습니다.</span>
      </div>
      <a href="/?tab=CHALLENGE" class="cta-btn">퍼즐 시작하기 ▶</a>
    </div>

    <article class="card">
      <h2>1. 3단계 난이도와 240개 관문 시스템</h2>
      <p>지식 탐구 가로세로 낱말퍼즐은 학습자의 수준에 맞춰 <strong>초급 · 중급 · 고급</strong>의 체계적인 난이도로 설계되어 있습니다.</p>
      <ul>
        <li><strong>초급 (Level 1 ~ 3):</strong> 8×8 격자에 한 판당 10개의 핵심 기초 어휘가 출제됩니다. 일상 시사와 기본 교과 개념을 익히기에 적합합니다.</li>
        <li><strong>중급 (Level 4 ~ 7):</strong> 10×10 격자에 한 판당 15개의 중급 어휘가 출제됩니다. 개념 간 연결 관계와 심화 용어를 학습합니다.</li>
        <li><strong>고급 (Level 8 ~ 10):</strong> 12×12 격자에 한 판당 20개의 고난도 전문 어휘가 출제됩니다. 각 분야의 깊이 있는 학술·시사 개념을 완성할 수 있습니다.</li>
      </ul>
      <p>각 레벨마다 3개의 판(제1~3관문)이 준비되어 있으며, 8개 분야 × 10레벨 × 3판 = 총 <strong>240개 관문</strong>과 <strong>2,480개 어휘</strong>를 제공합니다.</p>
    </article>

    <article class="card">
      <h2>2. 스마트 한글 입력 및 교차 칸 전환 방법</h2>
      <ul>
        <li><strong>직접 입력 및 자모 조합:</strong> 퍼즐 칸을 선택하고 키보드나 모바일 자판으로 입력하면 초성·중성·종성이 자연스럽게 한 글자로 조합되어 입력됩니다.</li>
        <li><strong>모바일 원터치 자판:</strong> 스마트폰 환경에서는 현재 퍼즐에 포함된 음절 후보를 기반으로 구성된 편리한 터치 자판을 활용할 수 있습니다.</li>
        <li><strong>가로·세로 동시 시작 칸 전환:</strong> 한 칸에서 가로 단어와 세로 단어가 함께 시작하는 경우(예: <code>②, ③</code>), 해당 칸을 한 번 더 터치하거나 상단 힌트 카드의 <strong>[→ 가로] / [↓ 세로]</strong> 버튼을 눌러 힌트와 입력 방향을 즉시 전환할 수 있습니다.</li>
        <li><strong>실시간 정답 확인:</strong> 입력한 글자가 정답이면 초록색 체크(✓) 표시가, 오답이면 붉은색(×) 표시가 즉시 나타나 직관적인 학습이 가능합니다.</li>
      </ul>
    </article>

    <article class="card">
      <h2>3. 어휘력을 두 배로 높이는 3단계 복습 루틴</h2>
      <ol>
        <li><strong>오늘의 낱말퍼즐로 워밍업:</strong> 매일 자정(KST) 갱신되는 전 국민 공통 상식 퍼즐로 연속 출석 기록을 쌓으세요.</li>
        <li><strong>초성 힌트와 배경 지식 읽기:</strong> 막히는 단어는 초성 힌트(ㄱ·ㄴ·ㄷ)로 추론해 보고, 힌트 카드 하단의 '분야별 상식 &amp; 상세 배경 지식'을 펼쳐 맥락을 이해하세요.</li>
        <li><strong>오답노트 &amp; 지식백과 복습:</strong> 틀렸거나 힌트를 사용한 단어는 자동으로 오답노트에 저장됩니다. '지식' 탭의 플래시카드와 객관식 복습 퀴즈로 완전히 내 것으로 만드세요.</li>
      </ol>
    </article>

    <article class="card">
      <h2>4. 자주 묻는 질문 (FAQ)</h2>
      <h3>Q. 모든 콘텐츠와 기능은 무료인가요?</h3>
      <p>네, 8대 지식 영역 240개 관문, 오늘의 낱말퍼즐, 2,480개 어휘 사전, 지식 백과 칼럼 모두 별도의 회원가입이나 유료 결제 없이 100% 무료로 제공됩니다.</p>
      <h3>Q. 진행 중이던 퍼즐과 기록은 어떻게 저장되나요?</h3>
      <p>별도 로그인 없이도 사용 중인 브라우저의 안전한 로컬 저장소(LocalStorage)에 풀이 진행 상태, 학습 단어 수, 연속 출석, 마스터 인증서가 자동 저장됩니다.</p>
      <h3>Q. 오타나 단어 해설 수정을 건의하고 싶습니다.</h3>
      <p><a href="/contact.html">문의하기</a> 페이지 또는 <code>honglabai@gmail.com</code>으로 제보해 주시면 검토 후 신속하게 반영하겠습니다.</p>
    </article>
  `;

  fs.writeFileSync(
    path.join(publicDir, 'guide.html'),
    renderLayout({
      title: '학습 가이드 & FAQ - 지식 탐구 가로세로 낱말퍼즐',
      description: '가로세로 낱말퍼즐 플레이 방법, 초급·중급·고급 난이도 구성, 한글 입력 및 오답 복습 전략을 안내합니다.',
      bodyHtml,
      activePath: '/guide.html',
    }),
    'utf-8'
  );
}

// 3. Generate about.html
{
  const bodyHtml = `
    <div class="hero">
      <span class="hero-badge">ℹ️ 서비스 소개 &amp; 편집 원칙</span>
      <h1>지식 탐구 가로세로 낱말퍼즐 소개</h1>
      <p>단순한 시간 보내기용 게임을 넘어, 대한민국 교양 상식과 어휘력을 체계적으로 기르는 교육용 웹 플랫폼입니다.</p>
    </div>

    <article class="card">
      <h2>1. 서비스 기획 의도 및 비전</h2>
      <p>디지털 시대의 짧은 영상과 파편화된 정보 속에서 깊이 있는 어휘력과 인문·사회적 문해력의 중요성은 더욱 커지고 있습니다. <strong>지식 탐구 가로세로 낱말퍼즐(honglabai)</strong>은 남녀노소 누구나 쉽고 재미있게 십자말풀이를 즐기면서 대한민국 핵심 교양 어휘를 자연스럽게 체득할 수 있도록 개발되었습니다.</p>
      <p>단순히 글자만 맞추는 데 그치지 않고, 각 낱말이 가진 정확한 사전적 정의와 분야별 심층 배경 지식을 함께 제공하여 한 판을 풀 때마다 하나의 지식 영역을 깊이 이해하는 경험을 선사합니다.</p>
    </article>

    <article class="card">
      <h2>2. 8대 지식 영역 및 2,480개 어휘 큐레이션</h2>
      <p>본 플랫폼의 어휘 데이터베이스는 다음 8대 지식 영역별로 각 310단어씩, 총 <strong>2,480개 어휘</strong>로 구성되어 있습니다.</p>
      <ul>
        <li><strong>🏛️ 정치:</strong> 대한민국 헌법, 삼권분립, 의회민주주의, 선거제도 및 행정 원리</li>
        <li><strong>⚖️ 사회:</strong> 법치주의, 사회계약론, 사회보장제도, 디지털 미디어와 현대 사회 쟁점</li>
        <li><strong>🎭 문화:</strong> 유네스코 세계유산, 한국 전통문화, 기록유산 및 현대 문화예술</li>
        <li><strong>⚽ 스포츠:</strong> 올림픽 정신, 경기 규칙, 스포츠 과학 및 세이버메트릭스</li>
        <li><strong>📜 한국사:</strong> 고조선부터 삼국·고려·조선, 근현대사에 이르는 역사적 사건과 인물</li>
        <li><strong>🌍 세계사:</strong> 세계 4대 문명, 서양사 및 동양사의 주요 혁명과 국제 질서</li>
        <li><strong>🎵 음악:</strong> 한국 전통 국악 이론, 서양 클래식 음악사, 화성학 및 악기 편성</li>
        <li><strong>🎨 미술:</strong> 한국화·풍속화부터 르네상스, 인상주의, 현대 미술 사조까지</li>
      </ul>
    </article>

    <article class="card">
      <h2>3. 콘텐츠 품질 관리 및 검수 기준</h2>
      <p>지식 탐구 낱말퍼즐은 정확하고 신뢰할 수 있는 교육 콘텐츠 제공을 최우선 가치로 삼습니다.</p>
      <ul>
        <li><strong>공신력 있는 기준 준수:</strong> 국립국어원 표준국어대사전, 대한민국 헌법 및 주요 법령, 교육부 기본 교과 과정을 기준으로 단어와 풀이를 작성합니다.</li>
        <li><strong>지속적인 검수 및 업데이트:</strong> 사용자 피드백을 바탕으로 어휘의 적절성과 해설의 명료성을 상시 점검하고 개선합니다.</li>
        <li><strong>건전한 웹 환경:</strong> 과도한 팝업이나 이용을 방해하는 광고 배치를 지양하며, Google AdSense 프로그램 정책과 웹 접근성 지침을 준수합니다.</li>
      </ul>
    </article>

    <article class="card">
      <h2>4. 운영 정보</h2>
      <ul>
        <li><strong>서비스명:</strong> 지식 탐구 가로세로 낱말퍼즐</li>
        <li><strong>개발 및 운영:</strong> honglabai</li>
        <li><strong>공식 문의 이메일:</strong> <a href="mailto:honglabai@gmail.com">honglabai@gmail.com</a></li>
      </ul>
    </article>
  `;

  fs.writeFileSync(
    path.join(publicDir, 'about.html'),
    renderLayout({
      title: '서비스 소개 - 지식 탐구 가로세로 낱말퍼즐',
      description: '8대 지식 영역 2,480개 어휘와 심층 교양 백과를 제공하는 지식 탐구 가로세로 낱말퍼즐의 기획 의도와 콘텐츠 검수 기준을 소개합니다.',
      bodyHtml,
      activePath: '/about.html',
    }),
    'utf-8'
  );
}

// 4. Generate privacy.html
{
  const bodyHtml = `
    <div class="hero">
      <span class="hero-badge">🔒 개인정보보호 &amp; 광고 정책</span>
      <h1>개인정보처리방침</h1>
      <p>지식 탐구 가로세로 낱말퍼즐(이하 "본 서비스")은 이용자의 개인정보를 소중히 보호하며 관련 법령 및 Google AdSense 정책을 준수합니다.</p>
    </div>

    <article class="card">
      <h2>1. 수집하는 개인정보 및 저장 방식</h2>
      <p>본 서비스는 회원가입이나 로그인을 요구하지 않으며, 이용자의 성명, 주민등록번호, 전화번호 등 개인을 식별할 수 있는 정보를 서버에 수집하거나 저장하지 않습니다.</p>
      <p>퍼즐 풀이 진행 상황, 정답 기록, 연속 출석일, 환경설정(소리·테마·글자 크기 등)은 전적으로 이용자 본인의 웹 브라우저 내 <strong>로컬 스토리지(LocalStorage)</strong>에만 저장되며, 언제든 브라우저 설정 또는 앱 내 '설정 &gt; 데이터 초기화' 기능을 통해 삭제할 수 있습니다.</p>
    </article>

    <article class="card">
      <h2>2. 쿠키(Cookie) 및 Google AdSense 맞춤형 광고 안내</h2>
      <p>본 서비스는 무료 서비스 유지 및 운영을 위해 <strong>Google AdSense</strong>를 통해 광고를 게재합니다.</p>
      <ul>
        <li>Google을 포함한 제3자 공급업체는 쿠키(Cookie)를 사용하여 이용자가 본 웹사이트 또는 다른 웹사이트에 과거에 방문한 기록을 바탕으로 맞춤형 광고를 게재합니다.</li>
        <li>Google의 광고 쿠키(DoubleClick DART 쿠키 등) 사용으로 인해 Google 및 파트너는 이용자의 본 사이트 및 인터넷상의 다른 사이트 방문 기록을 기반으로 적절한 광고를 제공할 수 있습니다.</li>
        <li>이용자는 <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Google 광고 설정(My Ad Center)</a> 페이지를 방문하여 맞춤형 광고를 사용 중지(Opt-out)할 수 있습니다.</li>
        <li>또한 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>를 방문하여 제3자 공급업체의 맞춤형 광고용 쿠키 사용을 거부할 수 있습니다.</li>
      </ul>
    </article>

    <article class="card">
      <h2>3. 접속 로그 및 통계 분석</h2>
      <p>서비스 안정성 확보와 오류 진단을 위해 호스팅 인프라(Vercel) 수준에서 IP 주소(비식별화 처리), 브라우저 유형, 접속 일시 등의 기술적 접속 로그가 일시적으로 처리될 수 있습니다. 이는 서비스 보안 및 트래픽 최적화 목적 외에는 사용되지 않습니다.</p>
    </article>

    <article class="card">
      <h2>4. 아동의 개인정보 보호</h2>
      <p>본 서비스는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다. 만약 보호자께서 아동이 개인정보를 제공했다고 판단하시는 경우 아래 문의처로 연락해 주시면 즉시 확인 및 필요한 조치를 취하겠습니다.</p>
    </article>

    <article class="card">
      <h2>5. 개인정보 보호책임자 및 문의처</h2>
      <ul>
        <li><strong>운영 주체:</strong> honglabai</li>
        <li><strong>이메일:</strong> <a href="mailto:honglabai@gmail.com">honglabai@gmail.com</a></li>
        <li><strong>시행일자:</strong> 2026년 11월 1일 (최종 개정: 2026년 11월 25일)</li>
      </ul>
    </article>
  `;

  fs.writeFileSync(
    path.join(publicDir, 'privacy.html'),
    renderLayout({
      title: '개인정보처리방침 - 지식 탐구 가로세로 낱말퍼즐',
      description: '지식 탐구 가로세로 낱말퍼즐의 개인정보처리방침, 로컬 스토리지 사용 안내 및 Google AdSense 쿠키 정책입니다.',
      bodyHtml,
      activePath: '/privacy.html',
    }),
    'utf-8'
  );
}

// 5. Generate terms.html
{
  const bodyHtml = `
    <div class="hero">
      <span class="hero-badge">📜 서비스 이용 규정</span>
      <h1>서비스 이용약관</h1>
      <p>지식 탐구 가로세로 낱말퍼즐 서비스 이용과 관련하여 운영자와 이용자 간의 권리, 의무 및 책임 사항을 규정합니다.</p>
    </div>

    <article class="card">
      <h2>제1조 (목적)</h2>
      <p>본 약관은 honglabai(이하 "운영자")가 제공하는 '지식 탐구 가로세로 낱말퍼즐' 웹 서비스 및 부가 교육 콘텐츠(이하 "서비스")의 이용 조건과 절차에 관한 기본적인 사항을 정함을 목적으로 합니다.</p>
    </article>

    <article class="card">
      <h2>제2조 (서비스의 내용 및 제공)</h2>
      <p>운영자는 이용자에게 8대 지식 영역(정치·사회·문화·스포츠·한국사·세계사·음악·미술) 기반의 가로세로 낱말퍼즐, 오늘의 낱말퍼즐, 어휘 사전, 지식 백과 칼럼 및 오답 복습 기능을 무료로 제공합니다.</p>
      <p>운영자는 서비스 품질 향상을 위해 사전 고지 없이 콘텐츠의 수정, 보완, 어휘 교체 및 시스템 점검을 실시할 수 있습니다.</p>
    </article>

    <article class="card">
      <h2>제3조 (지식재산권 및 저작권)</h2>
      <p>서비스 내에 포함된 퍼즐 보드 구성, 지식 칼럼 텍스트, UI 디자인, 소프트웨어 코드에 대한 저작권 및 지식재산권은 운영자에게 있습니다. 이용자는 본 서비스를 개인의 학습 및 비상업적 용도로만 이용할 수 있으며, 운영자의 사전 서면 동의 없이 무단 복제, 크롤링, 재배포, 상업적 이용할 수 없습니다.</p>
    </article>

    <article class="card">
      <h2>제4조 (이용자의 의무)</h2>
      <p>이용자는 서비스의 정상적인 운영을 방해하는 자동화 봇 공격, 비정상적인 트래픽 유발, 시스템 해킹 시도 등의 행위를 하여서는 안 됩니다.</p>
    </article>

    <article class="card">
      <h2>제5조 (광고의 게재)</h2>
      <p>운영자는 무료 서비스의 지속적인 제공을 위해 서비스 화면에 Google AdSense 등 공인된 광고를 게재할 수 있으며, 이용자는 서비스 이용 시 노출되는 광고 게재에 동의합니다.</p>
    </article>

    <article class="card">
      <h2>제6조 (면책 조항)</h2>
      <p>운영자는 천재지변, 네트워크 장애, 이용자 단말기 환경 또는 브라우저 캐시 삭제 등으로 인해 로컬에 저장된 학습 데이터가 유실된 경우에 대해 책임을 지지 않습니다. 또한 서비스 내 교육 콘텐츠는 학습 참고용으로 제공되며, 시험 결과나 법적 판단의 근거로 직접 활용되어 발생한 결과에 대해서는 책임을 지지 않습니다.</p>
    </article>
  `;

  fs.writeFileSync(
    path.join(publicDir, 'terms.html'),
    renderLayout({
      title: '이용약관 - 지식 탐구 가로세로 낱말퍼즐',
      description: '지식 탐구 가로세로 낱말퍼즐의 서비스 이용약관, 저작권 및 면책 사항 안내입니다.',
      bodyHtml,
      activePath: '/terms.html',
    }),
    'utf-8'
  );
}

// 6. Generate contact.html
{
  const bodyHtml = `
    <div class="hero">
      <span class="hero-badge">✉️ 고객 지원 &amp; 오류 제보</span>
      <h1>문의하기</h1>
      <p>낱말퍼즐 이용 중 발견한 오타, 단어 뜻 수정 제안, 기능 개선 아이디어 또는 제휴 문의를 환영합니다.</p>
    </div>

    <article class="card">
      <h2>공식 연락처 안내</h2>
      <p>지식 탐구 가로세로 낱말퍼즐은 학습자 여러분의 소중한 의견을 반영하여 콘텐츠를 지속적으로 다듬어 나가고 있습니다. 아래 이메일로 연락 주시면 영업일 기준 1~3일 이내에 성실히 답변드리겠습니다.</p>
      <ul>
        <li><strong>운영자:</strong> honglabai</li>
        <li><strong>공식 이메일:</strong> <a href="mailto:honglabai@gmail.com">honglabai@gmail.com</a></li>
        <li><strong>주요 문의 분야:</strong>
          <ul>
            <li>어휘·힌트·해설의 오탈자 또는 사실관계 수정 제보</li>
            <li>모바일/PC 환경에서의 화면 표시 및 입력 오류 신고</li>
            <li>새로운 지식 분야 또는 어휘 추가 건의</li>
            <li>교육 기관 활용 및 기타 제휴 문의</li>
          </ul>
        </li>
      </ul>
      <div style="margin-top: 18px;">
        <a href="mailto:honglabai@gmail.com?subject=%5B지식탐구%20낱말퍼즐%20문의%5D" class="cta-btn">이메일로 바로 문의하기 ✉️</a>
      </div>
    </article>

    <article class="card">
      <h2>오류 제보 시 참고 사항</h2>
      <p>문제나 오탈자를 제보해 주실 때 아래 내용을 함께 적어주시면 훨씬 빠르고 정확하게 해결할 수 있습니다.</p>
      <ol>
        <li>사용 중인 기기 및 브라우저 (예: 아이폰 사파리, 갤럭시 크롬, PC 엣지 등)</li>
        <li>발생한 분야명 및 레벨·관문 번호 (예: 사회 Lv.1 제1판)</li>
        <li>문제가 발생한 단어 또는 화면 설명</li>
      </ol>
    </article>
  `;

  fs.writeFileSync(
    path.join(publicDir, 'contact.html'),
    renderLayout({
      title: '문의하기 - 지식 탐구 가로세로 낱말퍼즐',
      description: '지식 탐구 가로세로 낱말퍼즐 운영자 문의, 단어 오류 제보 및 개선 건의 안내 페이지입니다.',
      bodyHtml,
      activePath: '/contact.html',
    }),
    'utf-8'
  );
}

console.log('Successfully generated all 13 static HTML pages in public/!');
