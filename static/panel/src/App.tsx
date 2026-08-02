import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MermaidViewer, type MermaidViewerHandle } from 'react-super-mermaid';
import type { MermaidSource, SvgPanZoomSource } from 'react-super-mermaid';
import { Toolbar } from './Toolbar';
import { DrawEditor } from './DrawEditor';
import { buildShareUrl, canShare } from './shareLink';
import { getIssueKey, isNearLimit, loadDiagrams, saveDiagrams } from './storage';
import { STARTER_CODE, type Diagram, type DiagramDoc } from './types';

/** 產生 id。crypto.randomUUID 在 Forge iframe(安全上下文)可用。 */
function newId(): string {
  return crypto.randomUUID();
}

function newDiagram(index: number): Diagram {
  return {
    id: newId(),
    title: index === 0 ? 'Diagram' : `Diagram ${index + 1}`,
    code: STARTER_CODE,
    updatedAt: new Date().toISOString(),
  };
}

export function App() {
  const viewer = useRef<MermaidViewerHandle | null>(null);

  const [issueKey, setIssueKey] = useState<string | null>(null);
  const [doc, setDoc] = useState<DiagramDoc>({ v: 1, diagrams: [] });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  // 預設一律淺色。不做 prefers-color-scheme 自動偵測 —— 那讀的是作業系統設定,
  // 跟 Jira 當下的佈景無關,結果就是淺色頁面裡冒出深色畫布。要暗色請按工具列的鈕。
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  // 拖拉繪圖模式。編輯結果會序列化回 draft,再由既有的 Save 寫進 issue property。
  const [drawing, setDrawing] = useState(false);
  // 顯示高度。面板在 iframe 裡,lib 的 toggleFullscreen 只會填滿 iframe 而非
  // 瀏覽器視窗,結果是圖縮進原本的小框 —— 所以「放大」在這裡就是設定高度。
  // 'auto' = 依內容撐開。跟著圖一起存進 issue property,每張圖各自記住。
  const [height, setHeight] = useState('auto');

  // 重依賴一律注入實例。若讓 lib 自己解析,它的第三段 fallback 是 CDN ——
  // 在 Forge 會被 CSP 擋下,而且一旦成功就是對外連線,會失去 Runs on Atlassian。
  const [mermaidSource, setMermaidSource] = useState<MermaidSource | null>(null);
  const [panZoomSource, setPanZoomSource] = useState<SvgPanZoomSource | null>(null);

  useEffect(() => {
    let cancelled = false;
    // 動態 import:Vite 會把 mermaid 切成獨立 chunk,面板首屏不必等它下載完。
    void import('mermaid').then((m) => {
      if (!cancelled) setMermaidSource({ instance: m.default as unknown as MermaidSource['instance'] });
    });
    void import('svg-pan-zoom').then((m) => {
      if (!cancelled) setPanZoomSource({ instance: m.default as SvgPanZoomSource['instance'] });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const key = await getIssueKey();
        if (cancelled) return;
        setIssueKey(key);

        const loaded = await loadDiagrams(key);
        if (cancelled) return;

        // 沒有任何圖時給一張起手式,但【不】自動寫入 —— 使用者只是打開面板看看,
        // 不該就這樣改動 issue 資料。
        const diagrams = loaded.diagrams.length ? loaded.diagrams : [newDiagram(0)];
        setDoc({ v: 1, diagrams });
        setActiveId(diagrams[0].id);
        setDraft(diagrams[0].code);
        setHeight(diagrams[0].height ?? 'auto');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = useMemo(
    () => doc.diagrams.find((d) => d.id === activeId) ?? null,
    [doc, activeId]
  );

  // 高度也算變更 —— 調完大小要能存下來,否則換頁就跑掉。
  const dirty =
    active !== null && (active.code !== draft || (active.height ?? 'auto') !== height);

  const selectDiagram = useCallback(
    (id: string) => {
      const next = doc.diagrams.find((d) => d.id === id);
      if (!next) return;
      setActiveId(id);
      setDraft(next.code);
      setHeight(next.height ?? 'auto');
    },
    [doc]
  );

  const addDiagram = useCallback(() => {
    const created = newDiagram(doc.diagrams.length);
    setDoc((prev) => ({ v: 1, diagrams: [...prev.diagrams, created] }));
    setActiveId(created.id);
    setDraft(created.code);
    setHeight('auto');
  }, [doc.diagrams.length]);

  const save = useCallback(async () => {
    if (!issueKey || !active) return;
    setSaving(true);
    setError(null);

    const next: DiagramDoc = {
      v: 1,
      diagrams: doc.diagrams.map((d) =>
        d.id === active.id
          ? { ...d, code: draft, height, updatedAt: new Date().toISOString() }
          : d
      ),
    };

    // 樂觀更新,失敗回滾到 previous —— 使用者看到的畫面永遠等於實際存下的東西。
    const previous = doc;
    setDoc(next);
    try {
      await saveDiagrams(issueKey, next);
    } catch (e) {
      setDoc(previous);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [issueKey, active, doc, draft]);

  if (loading) return <div className="sm-status">Loading…</div>;

  if (error && !active) {
    return <div className="sm-status sm-error">{error}</div>;
  }

  const ready = mermaidSource !== null && panZoomSource !== null;

  return (
    <div className={`sm-app${dark ? ' sm-dark' : ''}`}>
      <div className="sm-tabs" role="tablist" aria-label="Diagrams">
        {doc.diagrams.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={d.id === activeId}
            className={d.id === activeId ? 'sm-tab sm-tab-active' : 'sm-tab'}
            onClick={() => selectDiagram(d.id)}
          >
            {d.title}
          </button>
        ))}
        <button className="sm-tab sm-tab-add" onClick={addDiagram} title="Add diagram">
          +
        </button>
      </div>

      <Toolbar
        viewer={viewer}
        dark={dark}
        onToggleDark={() => setDark((v) => !v)}
        showSource={showSource}
        onToggleSource={() => setShowSource((v) => !v)}
        onCopySource={() => {
          void navigator.clipboard?.writeText(draft).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          });
        }}
        copied={copied}
        onShare={
          canShare()
            ? () => {
                void buildShareUrl(draft, dark)
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
        drawing={drawing}
        onToggleDraw={() => setDrawing((v) => !v)}
        height={height}
        onHeightChange={setHeight}
      />

      {error && <div className="sm-banner sm-error">{error}</div>}
      {isNearLimit(doc) && (
        <div className="sm-banner sm-warn">
          Approaching the 32KB Jira property limit. Consider removing unused diagrams.
        </div>
      )}

      {/* 繪圖模式:整塊換成編輯器。拖拉的結果經 lib 無損序列化回 mermaid,
          寫進 draft,再由下方既有的 Save 存進 issue property —— 兩種編輯方式
          共用同一條儲存路徑,不會有兩份真相。 */}
      {drawing && mermaidSource && (
        <>
          <DrawEditor
            source={draft}
            dark={dark}
            mermaid={mermaidSource}
            fontUrl="./Virgil.woff2"
            height={height}
            onMermaidChange={setDraft}
            onError={setError}
          />
          <div className="sm-source-actions">
            <button type="button" onClick={() => void save()} disabled={!dirty || saving}>
              {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
            </button>
          </div>
        </>
      )}

      <div className={showSource ? 'sm-split sm-split-open' : 'sm-split'} hidden={drawing}>
        {showSource && (
          <div className="sm-source">
            {/* 關掉語法檢視的最短路徑。工具列的 </> 讀同一個 state,
                按這裡它會一起退出 pressed 狀態。 */}
            <div className="sm-source-head">
              <span>Mermaid source</span>
              <button
                type="button"
                className="sm-close"
                onClick={() => setShowSource(false)}
                title="Close source"
                aria-label="Close source"
              >
                ✕
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              aria-label="Mermaid source"
            />
            <div className="sm-source-actions">
              <button type="button" onClick={() => void save()} disabled={!dirty || saving}>
                {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
              </button>
            </div>
          </div>
        )}

        <div
          className="sm-preview"
          style={height !== 'auto' ? { height: Number(height) } : undefined}
        >
          {ready ? (
            <MermaidViewer
              ref={viewer}
              code={draft}
              dark={dark}
              // 見 Toolbar.tsx:lib 內建工具列是繁中,這裡自建英文版
              toolbar={false}
              // 不要網點畫布。那是繪圖編輯器的語彙,放在議題面板裡只是雜訊。
              pattern="none"
              solidColor={null}
              // 全螢幕在 Forge iframe 內做不到(position: fixed 只會填滿 iframe),
              // 連 F 快捷鍵一併關掉,不留會壞的入口。放大請用工具列的 ⤢。
              fullscreen={false}
              mermaid={mermaidSource}
              svgPanZoom={panZoomSource}
              // 自帶字型,絕不連 jsDelivr
              fontUrl="./Virgil.woff2"
              onError={(e) => setError(e.message)}
            />
          ) : (
            <div className="sm-status">Loading renderer…</div>
          )}
        </div>
      </div>
    </div>
  );
}
