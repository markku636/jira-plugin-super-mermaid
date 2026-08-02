import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { view } from '@forge/bridge';
import './ui.css';

const STARTER = `flowchart LR
  A[Idea] --> B{Feasible?}
  B -- yes --> C[Build]
  B -- no --> D[Park it]
  C --> E[Ship]`;

/**
 * macro 設定面板。Confluence 編輯器插入 / 編輯 macro 時開啟。
 *
 * 儲存走 view.submit(),Confluence 會把值寫進 macro 的 config 參數,
 * 跟著頁面版本一起儲存。macro.tsx 再用 view.getContext() 讀回來。
 */
function Config() {
  const [source, setSource] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // 不要用 void view.submit(...) 把錯誤吞掉 —— 那會讓使用者只看到一個
  // 沒頭沒尾的失敗。把真正的訊息顯示出來。
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      // payload 必須是 { config: {...} },不能把設定值直接攤在最外層。
      // 攤平會拿到:view.submit(): Invalid "config" provided. Expected object
      await view.submit({ config: { source } });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      console.error('[super-mermaid] view.submit failed', e);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ctx = (await view.getContext()) as {
        extension?: { config?: { source?: string } };
      };
      if (cancelled) return;
      setSource(ctx.extension?.config?.source ?? STARTER);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (source === null) return <div className="sm-status">Loading…</div>;

  return (
    <div className="sm-config">
      <label className="sm-config-label" htmlFor="sm-source">
        Mermaid source
      </label>
      <textarea
        id="sm-source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        rows={16}
      />
      <p className="sm-config-hint">
        Supports flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline, journey and
        git graph.
      </p>
      {error && <div className="sm-banner sm-error">Save failed: {error}</div>}
      <div className="sm-config-actions">
        <button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');
createRoot(container).render(
  <StrictMode>
    <Config />
  </StrictMode>
);
