// 把 react-super-mermaid 的 sketch 手寫字型複製進 public/,讓 app 完全自帶。
//
// 跟 Jira 版同樣的理由:lib 的 DEFAULT_VIRGIL_FONT_URL 指向 jsDelivr CDN,
// 只要 sketch 主題被啟用就會產生對外請求 —— 那會讓 app 失去
// 「Runs on Atlassian」資格,而且在 Forge 的 font-src CSP 下本來就會被擋。

import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../node_modules/react-super-mermaid/dist/Virgil.woff2');
const dest = resolve(here, '../public/Virgil.woff2');

if (!existsSync(src)) {
  console.error(
    `[copy-assets] 找不到 ${src}\n` + `             請先在 confluence/static/ui 執行 npm install。`
  );
  process.exit(1);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log('[copy-assets] Virgil.woff2 -> public/');
