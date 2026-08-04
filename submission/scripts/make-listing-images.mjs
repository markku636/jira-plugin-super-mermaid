// 產生 Marketplace listing 用的所有圖:拍當前真實 UI → 合成到規格尺寸。
//
// 為什麼要有這支:UI 一改,listing 的圖就過期,而「截圖與實際 UI 不符」是審查會抓的
// 項目。08-02 那兩張手拍的截圖就是這樣壞掉的(拍完之後還有 5 個改 UI 的 commit)。
// 每次改動面板 UI,重跑這支即可。
//
// 前置(兩個 demo server 都要開著):
//   終端 A:  cd static/panel            && npx vite --config vite.demo.config.ts   # :5199
//   終端 B:  cd confluence/static/ui    && npx vite --config vite.demo.config.ts   # :5299
// 然後:
//   node submission/scripts/make-listing-images.mjs
//
// 相依:playwright 與 sharp 都不在本 repo,借鄰近專案的安裝(見下方 REQUIRE_FROM)。
// 產物:submission/images/*.png(進 git)、submission/.shots/*.png(原始擷取,不進 git)

import { createRequire } from 'node:module';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const SHOTS = path.join(REPO, 'submission', '.shots');
const OUT = path.join(REPO, 'submission', 'images');

// 借用鄰近專案的 node_modules。要換機器就改這兩行。
const REQUIRE_FROM = {
  playwright: 'e:/VisualStudioProject/IBuyPower.Apps/IBuypower.GIT/kanban/package.json',
  sharp: 'd:/01 qen3_tts/qwen3_tts_rainfall_v1/blog/package.json',
};

function load(name) {
  const from = REQUIRE_FROM[name];
  if (!existsSync(from)) {
    throw new Error(`找不到 ${name} 的來源專案:${from} —— 請改 REQUIRE_FROM`);
  }
  return createRequire(from)(name);
}

const { chromium } = load('playwright');
const sharp = load('sharp');

mkdirSync(SHOTS, { recursive: true });
mkdirSync(OUT, { recursive: true });

const PANEL = 'http://localhost:5199/';
const MACRO = 'http://localhost:5299/macro/index.html';

async function assertUp(url, hint) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    throw new Error(`${url} 沒有回應(${e.message})。先開 demo server:\n  ${hint}`);
  }
}

await assertUp(PANEL, 'cd static/panel && npx vite --config vite.demo.config.ts');
await assertUp(MACRO, 'cd confluence/static/ui && npx vite --config vite.demo.config.ts');

// ---------------------------------------------------------------- 擷取

const TYPES = ['flow', 'seq', 'class', 'state', 'er', 'gantt', 'pie', 'mindmap', 'timeline', 'journey', 'git'];

const browser = await chromium.launch();

async function capturePanel() {
  const ctx = await browser.newContext({
    viewport: { width: 1500, height: 1000 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  const page = await ctx.newPage();

  const open = async (q) => {
    await page.goto(`${PANEL}?${q}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.sm-preview svg', { timeout: 30000 });
    await page.waitForFunction(
      () => (document.querySelector('.sm-preview svg')?.getBoundingClientRect().height ?? 0) > 60,
      { timeout: 30000 }
    );
    await page.waitForTimeout(700);
  };
  const shot = async (name, sel) => {
    const el = await page.$(sel);
    if (!el) throw new Error(`selector 不存在:${sel}`);
    await el.screenshot({ path: path.join(SHOTS, `${name}.png`) });
    console.log(`  ${name}`);
  };

  await open('t=flow');
  await shot('panel-flow', '.sm-app');

  await open('t=flow,seq,gantt');
  await shot('panel-tabs', '.sm-app');

  await open('t=seq');
  await page.click('button[title="Toggle Mermaid source"]');
  await page.waitForTimeout(600);
  await shot('panel-source', '.sm-app');

  await open('t=state');
  await page.click('button[title="Toggle dark mode"]');
  await page.waitForTimeout(1200);
  await shot('panel-dark', '.sm-app');

  // 拖拉編輯器:只取 .sm-draw(下面還有一份預覽,不要它)
  await open('t=draw');
  await page.click('button[title="Draw: drag nodes and edges instead of typing"]');
  await page.waitForSelector('.sm-draw-canvas svg', { timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.click('.sm-draw-bar button[title="Fit to view (0)"]');
  await page.waitForTimeout(1200);
  await shot('panel-draw', '.sm-draw');

  // 各圖型:直接拍 svg 元素。拍 .sm-preview 會被固定高度裁掉(圓餅圖只剩一半)。
  for (const k of TYPES) {
    await open(`t=${k}`);
    await shot(`svg-${k}`, '.sm-preview svg');
  }

  await ctx.close();
}

async function captureMacro() {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const [key, name] of [['flow', 'conf-figure'], ['gantt', 'conf-gantt']]) {
    await page.goto(`${MACRO}?t=${key}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.sm-figure svg', { timeout: 30000 });
    await page.waitForTimeout(1200);
    // 工具列是浮動的,不 hover 就拍不到
    await page.hover('.sm-figure');
    await page.waitForTimeout(600);
    const el = await page.$('.sm-figure');
    await el.screenshot({ path: path.join(SHOTS, `${name}.png`) });
    console.log(`  ${name}`);
  }
  await ctx.close();
}

console.log('擷取 Jira 面板:');
await capturePanel();
console.log('擷取 Confluence macro:');
await captureMacro();
await browser.close();

// ---------------------------------------------------------------- 合成

const INK = '#172B4D';
const MUTED = '#5E6C84';
const BORDER = '#DFE1E6';
const JIRA = '#0052CC';
const CONF = '#00875A';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 縮到框內 + 圓角 + 1px 邊框 */
async function framed(file, boxW, boxH) {
  const resized = await sharp(path.join(SHOTS, file))
    .resize({ width: boxW, height: boxH, fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer();
  const { width: w, height: h } = await sharp(resized).metadata();
  const r = Math.max(6, Math.round(w / 140));
  const round = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`;
  const edge = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" ry="${r}" fill="none" stroke="${BORDER}" stroke-width="1"/></svg>`;
  const buf = await sharp(resized)
    .composite([{ input: Buffer.from(round), blend: 'dest-in' }])
    .png()
    .toBuffer();
  return { buf: await sharp(buf).composite([{ input: Buffer.from(edge) }]).png().toBuffer(), w, h };
}

/** 11 種圖型拼圖(2x 排版,交給下游縮放) */
async function montage() {
  const cells = [
    ['svg-flow.png', 'Flowchart'],
    ['svg-seq.png', 'Sequence'],
    ['svg-class.png', 'Class'],
    ['svg-state.png', 'State'],
    ['svg-er.png', 'Entity relationship'],
    ['svg-gantt.png', 'Gantt'],
    ['svg-pie.png', 'Pie'],
    ['svg-mindmap.png', 'Mindmap'],
    ['svg-timeline.png', 'Timeline'],
    ['svg-journey.png', 'User journey'],
    ['svg-git.png', 'Git graph'],
  ];
  const COLS = 4;
  const CW = 840;
  const CH = 380;
  const LABEL = 52;
  const W = COLS * CW;
  const H = Math.ceil(cells.length / COLS) * (CH + LABEL);

  const layers = [];
  for (let i = 0; i < cells.length; i++) {
    const [f, label] = cells[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const img = await sharp(path.join(SHOTS, f))
      .trim({ threshold: 6 })
      .resize({ width: CW - 70, height: CH - 50, fit: 'inside', withoutEnlargement: false })
      .png()
      .toBuffer();
    const m = await sharp(img).metadata();
    layers.push({
      input: img,
      left: col * CW + Math.round((CW - m.width) / 2),
      top: row * (CH + LABEL) + Math.round((CH - m.height) / 2),
    });
    layers.push({
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${LABEL}"><text x="${CW / 2}" y="34" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="${MUTED}">${esc(label)}</text></svg>`
      ),
      left: col * CW,
      top: row * (CH + LABEL) + CH,
    });
  }

  await sharp({ create: { width: W, height: H, channels: 4, background: '#FFFFFF' } })
    .composite(layers)
    .png()
    .toFile(path.join(SHOTS, 'montage-types.png'));
  console.log(`  montage-types ${W}x${H}`);
}

/** 一張 highlight。size: 'hi' = 1840x900,'crop' = 580x330 */
async function highlight({ file, headline, sub, short, accent, out }, size) {
  const subText = size === 'hi' ? sub : (short ?? '');
  const S =
    size === 'hi'
      ? { W: 1840, H: 900, pad: 80, hFont: 54, sFont: 26, headY: 118, subY: 168, imgTop: 214 }
      : subText
        ? { W: 580, H: 330, pad: 28, hFont: 24, sFont: 14, headY: 42, subY: 66, imgTop: 84 }
        : { W: 580, H: 330, pad: 28, hFont: 24, sFont: 14, headY: 44, subY: -100, imgTop: 68 };

  const boxW = S.W - S.pad * 2;
  const boxH = S.H - S.imgTop - S.pad / 2;
  const img = await framed(file, boxW, boxH);

  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S.W}" height="${S.H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F4F5F7"/><stop offset="1" stop-color="#FFFFFF"/>
  </linearGradient></defs>
  <rect width="${S.W}" height="${S.H}" fill="url(#g)"/>
  <rect x="0" y="0" width="${S.W}" height="${Math.round(S.H * 0.02)}" fill="${accent}"/>
  <text x="${S.pad}" y="${S.headY}" font-family="Segoe UI, Arial, sans-serif" font-size="${S.hFont}" font-weight="700" fill="${INK}">${esc(headline)}</text>
  <text x="${S.pad}" y="${S.subY}" font-family="Segoe UI, Arial, sans-serif" font-size="${S.sFont}" fill="${MUTED}">${esc(subText)}</text>
</svg>`);

  const target = path.join(OUT, `${out}-${size === 'hi' ? '1840x900' : '580x330'}.png`);
  await sharp({ create: { width: S.W, height: S.H, channels: 4, background: '#FFFFFF' } })
    .composite([
      { input: bg },
      {
        input: img.buf,
        left: Math.round((S.W - img.w) / 2),
        // 垂直居中,否則矮的產品畫面下方會留一條白帶
        top: S.imgTop + Math.max(0, Math.round((boxH - img.h) / 2)),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(target);
  console.log(`  ${path.basename(target)}`);
}

/** banner:規格要求要有 app 名稱、合作夥伴名稱、一句功能說明 */
async function banner({ slug, title, tagline, accent }, partner) {
  const logo = await sharp(path.join(REPO, 'resources', 'logo-512.png')).png().toBuffer();
  const uri = `data:image/png;base64,${logo.toString('base64')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="548" viewBox="0 0 1120 548">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B1220"/><stop offset="1" stop-color="#1B2A4A"/></linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1120" height="548" fill="url(#bg)"/>
  <circle cx="980" cy="90" r="220" fill="${accent}" opacity="0.07"/>
  <circle cx="90" cy="500" r="160" fill="${accent}" opacity="0.05"/>
  <image x="88" y="96" width="104" height="104" href="${uri}"/>
  <text x="88" y="272" font-family="Segoe UI, Arial, sans-serif" font-size="60" font-weight="700" fill="#FFFFFF">${esc(title)}</text>
  <rect x="88" y="300" width="300" height="4" fill="url(#rule)"/>
  <text x="88" y="356" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#C7D1E0">${esc(tagline)}</text>
  <rect x="88" y="404" width="330" height="52" rx="26" fill="none" stroke="${accent}" stroke-opacity="0.55" stroke-width="2"/>
  <text x="112" y="438" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="600" fill="${accent}">Runs on Atlassian  ·  Free</text>
  <text x="88" y="500" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#8C9BB0">by ${esc(partner)}</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, `banner-${slug}-1120x548.png`));
  await sharp(Buffer.from(svg)).resize(560, 274).png().toFile(path.join(OUT, `banner-${slug}-560x274.png`));
  console.log(`  banner-${slug}`);
}

// 合作夥伴名稱 —— 要與 Marketplace 後台 Details 頁的 vendor 名稱一致
const PARTNER = 'Markkulab';

const DRAW = {
  headline: "Draw it, don't type it",
  sub: 'Drag nodes and edges on a canvas. Every change round-trips back to Mermaid source, losslessly.',
  short: 'Drag nodes. Source stays in sync.',
  file: 'panel-draw.png',
};
const TYPES_CARD = {
  headline: '11 diagram types',
  sub: 'Flowchart, sequence, class, state, ER, Gantt, pie, mindmap, timeline, user journey, git graph.',
  short: 'Flowchart to Gantt to git graph.',
  file: 'montage-types.png',
};

const CARDS = [
  // Jira listing 的三個必填 highlight
  { out: 'hl-jira-1-panel', file: 'panel-flow.png', accent: JIRA, headline: 'Diagrams on the issue', sub: 'Write a few lines of Mermaid, get a diagram — pan, zoom, search and export from the panel.', short: 'Pan, zoom, search, export.' },
  { out: 'hl-jira-2-draw', accent: JIRA, ...DRAW },
  { out: 'hl-jira-3-tabs', file: 'panel-tabs.png', accent: JIRA, headline: 'Several diagrams per issue', sub: 'Keep the flow, the sequence and the plan on the same issue, each in its own tab.', short: 'One tab per diagram.' },
  // Confluence listing 的三個必填 highlight
  { out: 'hl-conf-1-inline', file: 'conf-figure.png', accent: CONF, headline: 'Diagrams inside your page', sub: 'The macro renders in the page body — not an image, not an attachment. Source lives in the macro parameter.', short: 'In the page body, not an image.' },
  { out: 'hl-conf-2-draw', accent: CONF, ...DRAW },
  { out: 'hl-conf-3-types', accent: CONF, ...TYPES_CARD },
  // 圖庫補充(選填,每個 highlight 可掛最多 5 張)
  { out: 'gal-jira-4-types', accent: JIRA, ...TYPES_CARD },
  { out: 'gal-jira-5-source', file: 'panel-source.png', accent: JIRA, headline: 'Source and diagram, side by side', sub: 'Edit the Mermaid text and watch the diagram follow. Copy the source with one click.', short: 'Edit text, diagram follows.' },
  { out: 'gal-jira-6-dark', file: 'panel-dark.png', accent: JIRA, headline: 'Light and dark', sub: 'One toggle. The diagram re-renders in the theme you picked.', short: 'One toggle.' },
  { out: 'gal-conf-4-gantt', file: 'conf-gantt.png', accent: CONF, headline: 'Plans in the page', sub: 'Gantt charts follow page versioning: copy the page and the chart comes with it.', short: 'Follows page versioning.' },
];

console.log('合成:');
await montage();
for (const c of CARDS) {
  await highlight(c, 'hi');
  await highlight(c, 'crop');
}
await banner({ slug: 'jira', title: 'Super Mermaid for Jira', tagline: 'Flowcharts and sequence diagrams on any issue', accent: '#579DFF' }, PARTNER);
await banner({ slug: 'confluence', title: 'Super Mermaid for Confluence', tagline: 'Diagrams embedded in your page body', accent: '#4BCE97' }, PARTNER);

console.log('\n完成 —— 圖在 submission/images/');
