import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
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
  // 預設一律淺色。不做主題自動偵測 —— 使用者明確要求預設不要暗黑,
  // 而且自動偵測讀 prefers-color-scheme 是作業系統設定,跟 Confluence 佈景無關。
  // 要暗色請按工具列的鈕。
  const [dark, setDark] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // macro 的原始碼存在 config 參數裡,跟著頁面版本走 —— 複製頁面時會一起被複製。
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

  const copySource = useCallback(() => {
    if (!source) return;
    void navigator.clipboard
      ?.writeText(source)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setError('Clipboard unavailable in this browser.'));
  }, [source]);

  if (source === null) return <div className="sm-status">Loading…</div>;

  return (
    <div className={`sm-figure${dark ? ' sm-dark' : ''}`}>
      {!configured && (
        <div className="sm-banner sm-warn">
          No diagram yet — click this macro and choose Edit to add your Mermaid source.
        </div>
      )}
      {error && <div className="sm-banner sm-error">{error}</div>}

      <div className="sm-figure-bar">
        <Toolbar
          viewer={viewer}
          dark={dark}
          onToggleDark={() => setDark((v) => !v)}
          showSource={showSource}
          onToggleSource={() => setShowSource((v) => !v)}
          onCopySource={copySource}
          copied={copied}
        />
      </div>

      <div className="sm-figure-body">
        {deps ? (
          <MermaidViewer
            ref={viewer}
            code={source}
            dark={dark}
            // lib 內建工具列是繁中,改用上面自建的英文版
            toolbar={false}
            // 文件內嵌的圖不該有網點畫布 —— 那是編輯器的語彙,放進文章裡很吵。
            pattern="none"
            solidColor={null}
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

      {showSource && (
        <div className="sm-figure-source">
          <div className="sm-figure-source-head">
            <span>Mermaid source</span>
            <button type="button" onClick={copySource}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          {/* 唯讀:macro 檢視端無法寫回設定,存檔只能走 view.submit(),
              而那只在設定面板可用。誠實標示,不做一個改了不會存的假輸入框。 */}
          <pre>{source}</pre>
          <p className="sm-figure-hint">Read-only. To change it, click the macro and choose Edit.</p>
        </div>
      )}
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
