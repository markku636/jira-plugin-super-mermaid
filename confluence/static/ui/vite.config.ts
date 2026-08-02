import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 為什麼要「跑兩次建置」而不是一次多 entry:
// Forge 的 resource.path 就是該 iframe 的服務根目錄,資產不能在它外面。
// 單次多 entry 建置會產生共用的 build/assets/,而 build/macro/index.html
// 會引用 ../assets/... —— 逃出 resource 根目錄,線上必定 404。
// 所以 macro 與 config 各自建成自足的目錄。
//
// 重複打包的成本很低:config 面板只是一個 textarea,不含 mermaid,
// 真正大的 mermaid chunk 只存在 macro 那一份。
//
// 用 --mode 而非環境變數,是為了跨平台(Windows 的 npm script 沒有 POSIX 的 VAR=x 前綴)。

export default defineConfig(({ mode }) => {
  const target = mode === 'config' ? 'config' : 'macro';

  return {
    // Forge Custom UI 要求資產用相對路徑存取(iframe 的 base URL 不是網站根目錄)。
    base: './',
    root: target,
    // publicDir 預設相對於 root,但 Virgil.woff2 由 copy-assets 放在 ui/public。
    // 只有 macro 會渲染圖表(sketch 主題才需要字型);config 面板不需要,設 false 免得多打包 60KB。
    publicDir: target === 'macro' ? '../public' : false,
    plugins: [react()],
    server: {
      fs: {
        // entry 以相對路徑 import ../src/*,macro 還會 import Jira app 的共用
        // Toolbar(../../../../static/panel/src),都在 root 之外,dev 需放行。
        allow: ['../../../..'],
      },
    },
    build: {
      outDir: `../build/${target}`,
      emptyOutDir: true,
      target: 'es2020',
      sourcemap: false,
    },
  };
});
