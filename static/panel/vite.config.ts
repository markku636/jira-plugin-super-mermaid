import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Forge Custom UI 要求資產用相對路徑存取(iframe 的 base URL 不是網站根目錄)。
  base: './',
  plugins: [react()],
  build: {
    // manifest.yml 的 resources[key=panel].path 指向 static/panel/build
    outDir: 'build',
    emptyOutDir: true,
    target: 'es2020',
    // 不出 sourcemap:會讓上傳的檔案數與體積翻倍,而 Forge 有每週檔案數配額
    sourcemap: false,
  },
});
