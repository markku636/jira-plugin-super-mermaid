// 只給「拍 listing 素材」用的 vite 設定。Forge 打包走 vite.config.ts,這個檔不參與部署。
//
// 唯一的差別:把 App.tsx 對 './storage'(@forge/bridge)的 import 換成記憶體替身
// (../../demo/storage-mock.ts),讓面板能在 Forge iframe 外跑起來。
// 其餘元件、CSS、mermaid/svg-pan-zoom 注入全部是真的 —— 拍出來就是當前程式碼的 UI。
//
// 這個檔必須放在 static/panel/ 底下,不能放 demo/:vite 與 @vitejs/plugin-react
// 只安裝在 static/panel/node_modules,設定檔放外面會解不到模組。
//
// 跑法(在 static/panel 底下):
//   npx vite --config vite.demo.config.ts
// 然後開 http://localhost:5199/?t=flow,seq,gantt

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const MOCK = path.resolve(__dirname, '../../demo/storage-mock.ts');

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'super-mermaid-demo-storage',
      enforce: 'pre',
      resolveId(source, importer) {
        // 只攔 src/App.tsx 對 './storage' 的那一條,其他 import 不動。
        if (
          source === './storage' &&
          importer &&
          importer.replace(/\\/g, '/').endsWith('/src/App.tsx')
        ) {
          return MOCK;
        }
        return null;
      },
    },
  ],
  server: { port: 5199, strictPort: true },
});
