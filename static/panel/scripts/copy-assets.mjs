// 把 react-super-mermaid 的 sketch 手寫字型複製進 public/,讓 app 完全自帶。
//
// 為什麼非做不可:lib 的 DEFAULT_VIRGIL_FONT_URL 指向 jsDelivr CDN。
// 只要 sketch 主題被啟用,就會產生一次對外網路請求 —— 那會讓這個 app
// 失去「Runs on Atlassian」資格(等於失去「資料零外流」這個賣點),而且在 Forge
// 的 font-src CSP 下本來就會被擋。
// 解法是 <MermaidViewer fontUrl="./Virgil.woff2">,而檔案由這個腳本備妥。

import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../node_modules/react-super-mermaid/dist/Virgil.woff2');
const dest = resolve(here, '../public/Virgil.woff2');

if (!existsSync(src)) {
  console.error(
    `[copy-assets] 找不到 ${src}\n` +
      `             請先在 static/panel 執行 npm install。`
  );
  process.exit(1);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log('[copy-assets] Virgil.woff2 -> public/');
