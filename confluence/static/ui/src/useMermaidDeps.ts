import { useEffect, useState } from 'react';
import type { MermaidSource, SvgPanZoomSource } from 'react-super-mermaid';

export interface MermaidDeps {
  mermaid: MermaidSource;
  svgPanZoom: SvgPanZoomSource;
}

/**
 * 動態載入並「注入」mermaid 與 svg-pan-zoom 的實例。
 *
 * 為什麼一定要明確注入:若讓 lib 自己解析,它的第三段 fallback 是 CDN。
 * 在 Forge 會被 CSP 擋下,而且一旦成功就是對外連線,會失去 Runs on Atlassian 資格。
 *
 * 用 dynamic import 而非 static:Vite 會把 mermaid 切成獨立 chunk,
 * macro 首屏不必等它下載完。
 */
export function useMermaidDeps(): MermaidDeps | null {
  const [deps, setDeps] = useState<MermaidDeps | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([import('mermaid'), import('svg-pan-zoom')]).then(([m, pz]) => {
      if (cancelled) return;
      setDeps({
        mermaid: { instance: m.default as unknown as MermaidSource['instance'] },
        svgPanZoom: { instance: pz.default as SvgPanZoomSource['instance'] },
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return deps;
}
