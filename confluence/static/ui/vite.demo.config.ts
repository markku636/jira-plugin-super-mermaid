// 只給「拍 listing 素材」用的 vite 設定(Confluence macro)。
// Forge 打包走 vite.config.ts 的 --mode macro / --mode config,這個檔不參與部署。
//
// 唯一的差別:把 '@forge/bridge' 換成 ../../../demo/forge-bridge-mock.ts,
// 讓 macro 能在 Forge iframe 外跑起來。macro.tsx、ui.css、共用的 Toolbar 與
// DrawEditor 全部是真的 —— 拍出來就是當前程式碼的 UI。
//
// 跑法(在 confluence/static/ui 底下):
//   npx vite --config vite.demo.config.ts
// 然後開 http://localhost:5299/macro/index.html?t=flow
//
// ⚠️ root 刻意【不】設成 'macro'(正式建置才那樣做):dev 模式下 macro/index.html
// 的 `<script src="../src/macro.tsx">` 會被改寫成 /src/macro.tsx,若 root=macro
// 就指到 macro/src/ 而 404。root 留在 ui/ 才解得到。

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const MOCK = path.resolve(__dirname, '../../../demo/forge-bridge-mock.ts');

export default defineConfig({
  base: './',
  publicDir: 'public',
  plugins: [react()],
  resolve: {
    alias: [{ find: '@forge/bridge', replacement: MOCK }],
  },
  server: {
    port: 5299,
    strictPort: true,
    fs: {
      // macro 會 import Jira app 的 Toolbar/DrawEditor(../../../../static/panel/src),
      // 也要讀 demo/ 的替身 —— 兩者都在 root 之外。
      allow: ['../../../..'],
    },
  },
});
