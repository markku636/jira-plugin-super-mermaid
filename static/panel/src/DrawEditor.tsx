// 拖拉式繪圖編輯器(Jira 面板與 Confluence macro 共用)。
//
// 這是整個產品唯一勝過市集上既有 Mermaid app 的地方:別人只能打字,這裡可以用拖的,
// 而且改完會無損地序列化回 mermaid 原始碼。
//
// 兩個刻意的處理:
//   1. toolbar={false} —— lib 內建的 EditorToolbar 硬寫繁體中文,國際市集會卡。
//      這裡用 MermaidEditorHandle(等同 DiagramEditorHandle,約 50 個方法)自建英文版。
//   2. defaultSource={false} —— lib 內建的原始碼面板同樣是繁中,而且我們自己有一份。
//
// 動作清單對齊 VS Code 版 webview/diagramEditor.ts 的 wireToolbar,
// 讓三個宿主的操作習慣一致。

import { useCallback, useEffect, useRef, useState } from 'react';
import { MermaidEditor, type MermaidEditorHandle } from 'react-super-mermaid';
import type { MermaidSource } from 'react-super-mermaid';
import { IconFit, IconZoomIn, IconZoomOut } from './icons';

/** 常用外形:點一下直接在畫布中央放節點,免下拉選單也免再點畫布。 */
const QUICK_SHAPES = [
  { shape: 'rectangle', label: '▭', title: 'Add box' },
  { shape: 'rounded', label: '▢', title: 'Add rounded box' },
  { shape: 'stadium', label: '⬭', title: 'Add stadium' },
  { shape: 'diamond', label: '◇', title: 'Add decision' },
  { shape: 'circle', label: '○', title: 'Add circle' },
  { shape: 'hexagon', label: '⬡', title: 'Add hexagon' },
  { shape: 'cylinder', label: '⛁', title: 'Add database' },
] as const;

const TOOLS = [
  { tool: 'select', label: '⬉', title: 'Select and move (V)' },
  { tool: 'pan', label: '✋', title: 'Pan the canvas (H)' },
  { tool: 'node-create', label: '＋', title: 'Click canvas to add a node (N)' },
  { tool: 'edge-create', label: '↗', title: 'Drag between nodes to connect (E)' },
] as const;

const LINE_KINDS = [
  { kind: 'solid', label: '──', title: 'Solid line' },
  { kind: 'thick', label: '━━', title: 'Thick line' },
  { kind: 'dotted', label: '┄┄', title: 'Dotted line' },
] as const;

interface Props {
  source: string;
  dark: boolean;
  mermaid: MermaidSource;
  fontUrl?: string;
  /** 序列化後的 mermaid(lib 已做防抖),用來回寫給宿主。 */
  onMermaidChange: (text: string) => void;
  onError?: (message: string) => void;
  height?: string;
}

export function DrawEditor({
  source,
  dark,
  mermaid,
  fontUrl,
  onMermaidChange,
  onError,
  height,
}: Props) {
  const ed = useRef<MermaidEditorHandle | null>(null);
  const [tool, setTool] = useState<string>('select');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [sketch, setSketch] = useState(false);

  // handle 的狀態不是 React state,要靠事件把它鏡射進來,按鈕才會即時反白 / 禁用。
  useEffect(() => {
    const h = ed.current;
    if (!h) return;
    const sync = (): void => {
      setCanUndo(h.canUndo());
      setCanRedo(h.canRedo());
      setTool(h.getTool());
    };
    sync();
    const offHistory = h.on('historychange', sync);
    const offTool = h.on('toolchange', sync);
    return () => {
      offHistory();
      offTool();
    };
  }, [ed.current]);

  const pick = useCallback((t: string) => {
    ed.current?.setTool(t as Parameters<MermaidEditorHandle['setTool']>[0]);
    setTool(t);
  }, []);

  return (
    <div className="sm-draw">
      <div className="sm-toolbar sm-draw-bar" role="toolbar" aria-label="Drawing tools">
        {TOOLS.map((t) => (
          <button
            key={t.tool}
            type="button"
            aria-pressed={tool === t.tool}
            onClick={() => pick(t.tool)}
            title={t.title}
          >
            {t.label}
          </button>
        ))}

        <span className="sm-sep" />

        {QUICK_SHAPES.map((s) => (
          <button
            key={s.shape}
            type="button"
            onClick={() =>
              ed.current?.addNode(s.shape as Parameters<MermaidEditorHandle['addNode']>[0])
            }
            title={s.title}
          >
            {s.label}
          </button>
        ))}

        <span className="sm-sep" />

        {LINE_KINDS.map((l) => (
          <button
            key={l.kind}
            type="button"
            onClick={() =>
              ed.current?.applyEdgeStyle({
                lineKind: l.kind as 'solid' | 'thick' | 'dotted',
              })
            }
            title={l.title}
          >
            {l.label}
          </button>
        ))}

        <span className="sm-sep" />

        <button
          type="button"
          disabled={!canUndo}
          onClick={() => ed.current?.undo()}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={() => ed.current?.redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷
        </button>
        <button
          type="button"
          onClick={() => ed.current?.deleteSelection()}
          title="Delete selection (Del)"
        >
          🗑
        </button>
        <button
          type="button"
          onClick={() => void ed.current?.tidy()}
          title="Tidy up: re-run the layout engine"
        >
          ⌗
        </button>

        <span className="sm-sep" />

        <button type="button" onClick={() => ed.current?.zoomOut()} title="Zoom out (-)">
          <IconZoomOut />
        </button>
        <button type="button" onClick={() => ed.current?.zoomIn()} title="Zoom in (+)">
          <IconZoomIn />
        </button>
        <button type="button" onClick={() => ed.current?.fit()} title="Fit to view (0)">
          <IconFit />
        </button>

        <button
          type="button"
          aria-pressed={sketch}
          onClick={() => {
            const next = !sketch;
            setSketch(next);
            ed.current?.setLook(next ? 'sketch' : 'clean');
          }}
          title="Hand-drawn look"
        >
          ✎
        </button>
      </div>

      <div
        className="sm-draw-canvas"
        style={{ height: height && height !== 'auto' ? Number(height) : 460 }}
      >
        <MermaidEditor
          ref={ed}
          source={source}
          dark={dark}
          mermaid={mermaid}
          fontUrl={fontUrl}
          look="clean"
          // 內建工具列與原始碼面板都是繁中,兩個都關掉,由 host 自建
          toolbar={false}
          defaultSource={false}
          onMermaidChange={onMermaidChange}
          onError={(e) => onError?.(e instanceof Error ? e.message : String(e))}
        />
      </div>
    </div>
  );
}
