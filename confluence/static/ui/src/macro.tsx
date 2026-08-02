import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { view } from '@forge/bridge';
import { MermaidViewer, type MermaidViewerHandle } from 'react-super-mermaid';
// 共用 Jira app 的英文工具列 —— 不重複維護兩份。
// (lib 內建 Toolbar 硬寫繁中,國際市集會卡,兩邊都走自建。)
import { Toolbar } from '../../../../static/panel/src/Toolbar';
import { buildMermaidLiveUrl, canShare } from '../../../../static/panel/src/shareLink';
import { useMermaidDeps } from './useMermaidDeps';
import { savePageMacroSource } from './savePageMacro';
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
  // 每張圖各自的高度,預設值存在 macro 參數裡跟著頁面版本走(設定面板可改),
  // 工具列的快捷則是當下的即時調整。auto = 依內容撐開。
  const [height, setHeight] = useState('auto');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 內嵌編輯:draft 是編輯中的文字,source 是目前渲染的內容。
  const [draft, setDraft] = useState('');
  const [editable, setEditable] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [localId, setLocalId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // macro 的原始碼存在 config 參數裡,跟著頁面版本走 —— 複製頁面時會一起被複製。
      const ctx = (await view.getContext()) as {
        localId?: string;
        extension?: {
          config?: { source?: string; height?: string };
          content?: { id?: string };
          isEditing?: boolean;
        };
      };
      if (cancelled) return;

      const s = ctx.extension?.config?.source;
      setConfigured(Boolean(s && s.trim()));
      setSource(s && s.trim() ? s : PLACEHOLDER);
      setDraft(s && s.trim() ? s : PLACEHOLDER);
      setHeight(ctx.extension?.config?.height ?? 'auto');

      // 內嵌編輯要能寫回頁面,需要頁面 id 與自己的 localId 兩者都有。
      // 而且【只在已發布頁面】可用 —— 編輯器裡是草稿,直接寫已發布版本
      // 會跟編輯器的狀態打架。
      const pid = ctx.extension?.content?.id;
      const lid = ctx.localId;
      setEditable(Boolean(pid && lid) && ctx.extension?.isEditing !== true);
      setPageId(pid ?? null);
      setLocalId(lid ?? null);
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
          onShare={
            canShare()
              ? () => {
                  void buildMermaidLiveUrl(source, dark)
                    .then((url) => navigator.clipboard?.writeText(url))
                    .then(() => {
                      setShared(true);
                      window.setTimeout(() => setShared(false), 1800);
                    })
                    .catch((e) => setError(e instanceof Error ? e.message : String(e)));
                }
              : undefined
          }
          shared={shared}
          height={height}
          onHeightChange={setHeight}
        />
      </div>

      {/* 圖表與語法是二選一的模式,不往下堆疊 —— 使用者要的是「切換」。
          高度:auto 交給內容撐開,其餘用指定的像素值。 */}
      <div
        className="sm-figure-body"
        hidden={showSource}
        style={height !== 'auto' ? { height: Number(height) } : undefined}
      >
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
            // 全螢幕在 Forge 裡做不到:lib 用 position: fixed 覆蓋「視窗」,
            // 而 iframe 內的視窗就是那個小框,按下去只會把圖縮進去。
            // 關掉整個功能(含 F 快捷鍵),不留一個按了會壞的入口。
            // 放大請用工具列的 ⤢ 或設定面板的 Height。
            fullscreen={false}
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
            <span style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={copySource}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              {editable && (
                <button
                  type="button"
                  className="sm-primary"
                  disabled={saving || draft === source}
                  onClick={() => {
                    if (!pageId || !localId) return;
                    setSaving(true);
                    setError(null);
                    savePageMacroSource(pageId, localId, draft)
                      .then(() => setSource(draft))
                      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
                      .finally(() => setSaving(false));
                  }}
                >
                  {saving ? 'Saving…' : draft === source ? 'Saved' : 'Save'}
                </button>
              )}
            </span>
          </div>

          {editable ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              rows={14}
              aria-label="Mermaid source"
            />
          ) : (
            <pre>{source}</pre>
          )}

          <p className="sm-figure-hint">
            {editable
              ? 'Edits are written straight back to this page. Switch back to the diagram to see the result.'
              : /* 編輯器裡是草稿,直接寫已發布版本會跟編輯器打架,所以只給唯讀。 */
                'Read-only while the page is being edited. Click the macro and choose Edit, or save the page first.'}
          </p>
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
