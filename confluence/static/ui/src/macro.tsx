import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { view } from '@forge/bridge';
import { MermaidViewer, type MermaidViewerHandle } from 'react-super-mermaid';
// 共用 Jira app 的英文工具列 —— 不重複維護兩份。
// (lib 內建 Toolbar 硬寫繁中,國際市集會卡,兩邊都走自建。)
import { Toolbar } from '../../../../static/panel/src/Toolbar';
import { useMermaidDeps } from './useMermaidDeps';
import './ui.css';

const PLACEHOLDER = `flowchart LR
  A[Edit this macro] --> B[Paste Mermaid]
  B --> C[Save]`;

function Macro() {
  const viewer = useRef<MermaidViewerHandle | null>(null);
  const deps = useMermaidDeps();

  const [source, setSource] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [dark, setDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // macro 的原始碼存在 config 參數裡,跟著頁面版本走 —— 複製頁面時圖表會一起被複製。
      const ctx = (await view.getContext()) as {
        extension?: { config?: { source?: string } };
      };
      if (cancelled) return;
      const s = ctx.extension?.config?.source;
      setConfigured(Boolean(s && s.trim()));
      setSource(s && s.trim() ? s : PLACEHOLDER);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (source === null) return <div className="sm-status">Loading…</div>;

  return (
    <div className={`sm-app${dark ? ' sm-dark' : ''}`}>
      {!configured && (
        <div className="sm-banner sm-warn">
          This macro has no diagram yet. Edit the macro and paste your Mermaid source.
        </div>
      )}
      {error && <div className="sm-banner sm-error">{error}</div>}

      <Toolbar viewer={viewer} dark={dark} onToggleDark={() => setDark((v) => !v)} />

      <div className="sm-preview">
        {deps ? (
          <MermaidViewer
            ref={viewer}
            code={source}
            dark={dark}
            // lib 內建工具列是繁中,改用上面自建的英文版
            toolbar={false}
            mermaid={deps.mermaid}
            svgPanZoom={deps.svgPanZoom}
            // 自帶字型,絕不連 jsDelivr(見 copy-assets.mjs)
            fontUrl="./Virgil.woff2"
            onError={(e) => setError(e.message)}
          />
        ) : (
          <div className="sm-status">Loading renderer…</div>
        )}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');
createRoot(container).render(
  <StrictMode>
    <Macro />
  </StrictMode>
);
