// 自建的英文工具列。
//
// 為什麼不用 lib 內建的 <Toolbar>:react-super-mermaid 的 UI 字串硬寫繁體中文
// (樣式 / 搜尋 / 匯出中… / 全螢幕)。Atlassian Marketplace 是國際市場,中文工具列
// 是上架級的阻礙。MermaidViewerHandle 已暴露 24 個命令式方法,足以完整重建,
// 所以這裡走 toolbar={false} + 自建,零上游改動風險。
//
// (長期正解是替 lib 加一個 labels prop,blog 與 VS Code 擴充也會一起受益。)

import { useState } from 'react';
import type { MermaidViewerHandle, SearchState } from 'react-super-mermaid';

interface Props {
  viewer: React.RefObject<MermaidViewerHandle | null>;
  dark: boolean;
  onToggleDark: () => void;
  /** 原始碼切換。省略則不顯示該按鈕 —— 不該出現一顆按了沒反應的鈕。 */
  showSource?: boolean;
  onToggleSource?: () => void;
  /** 一鍵複製 mermaid 原始碼。省略則不顯示。 */
  onCopySource?: () => void;
  /** 複製成功的短暫回饋。 */
  copied?: boolean;
  /**
   * 顯示高度。'auto' = 依內容撐開,其餘為像素字串。
   *
   * 這裡刻意【不】提供 lib 的 toggleFullscreen():它靠 position: fixed 覆蓋視窗,
   * 但在 Forge 裡「視窗」就是那個 iframe —— 結果是圖被塞進原本的小框裡縮成一團。
   * iframe 內做不到真正的全螢幕,能做的是把內容撐高,讓自動調整高度的
   * macro / 面板跟著長高。所以「放大」在這裡就是「設定高度」。
   */
  height?: string;
  onHeightChange?: (value: string) => void;
}

/** 高度快捷。涵蓋從一張小流程圖到整頁時序圖的常見尺寸。 */
export const HEIGHT_PRESETS = [
  { value: 'auto', label: 'Auto' },
  { value: '320', label: 'S' },
  { value: '480', label: 'M' },
  { value: '640', label: 'L' },
  { value: '860', label: 'XL' },
  { value: '1200', label: '2XL' },
] as const;

export function Toolbar({
  viewer,
  dark,
  onToggleDark,
  showSource,
  onToggleSource,
  onCopySource,
  copied,
  height,
  onHeightChange,
}: Props) {
  const [term, setTerm] = useState('');
  // SearchState.current 是 1-based,無命中時為 0。
  const [hits, setHits] = useState<SearchState | null>(null);

  const runSearch = (value: string) => {
    setTerm(value);
    if (!value) {
      viewer.current?.clearSearch();
      setHits(null);
      return;
    }
    setHits(viewer.current?.search(value) ?? null);
  };

  const step = (dir: 'next' | 'prev') => {
    setHits((dir === 'next' ? viewer.current?.next() : viewer.current?.prev()) ?? null);
  };

  return (
    <div className="sm-toolbar" role="toolbar" aria-label="Diagram controls">
      <button type="button" onClick={() => viewer.current?.zoomOut()} title="Zoom out">
        −
      </button>
      <button type="button" onClick={() => viewer.current?.zoomIn()} title="Zoom in">
        +
      </button>
      <button type="button" onClick={() => viewer.current?.fit()} title="Fit to view">
        Fit
      </button>
      <button type="button" onClick={() => viewer.current?.actualSize()} title="Actual size">
        1:1
      </button>

      <span className="sm-sep" />

      <input
        className="sm-search"
        type="search"
        placeholder="Search…"
        value={term}
        onChange={(e) => runSearch(e.target.value)}
      />
      <button type="button" onClick={() => step('prev')} disabled={!hits?.total} title="Previous match">
        ↑
      </button>
      <button type="button" onClick={() => step('next')} disabled={!hits?.total} title="Next match">
        ↓
      </button>
      {hits && hits.total > 0 && (
        <span className="sm-hits">
          {hits.current}/{hits.total}
        </span>
      )}

      <span className="sm-sep" />

      {onCopySource && (
        <button type="button" onClick={onCopySource} title="Copy Mermaid source">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      )}
      <button type="button" onClick={() => viewer.current?.downloadSvg()} title="Download SVG">
        SVG
      </button>
      <button type="button" onClick={() => void viewer.current?.downloadPng()} title="Download PNG">
        PNG
      </button>

      <span className="sm-spacer" />

      {onToggleSource && (
        <button
          type="button"
          onClick={onToggleSource}
          aria-pressed={showSource}
          title="Toggle Mermaid source"
        >
          {showSource ? 'Hide source' : 'Source'}
        </button>
      )}
      <button type="button" onClick={onToggleDark} aria-pressed={dark} title="Toggle dark mode">
        {dark ? 'Light' : 'Dark'}
      </button>
      {onHeightChange && (
        <>
          <span className="sm-sep" />
          {HEIGHT_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className="sm-h-preset"
              aria-pressed={height === p.value}
              onClick={() => onHeightChange(p.value)}
              title={p.value === 'auto' ? 'Fit to content' : `${p.value}px tall`}
            >
              {p.label}
            </button>
          ))}
          <input
            className="sm-h-input"
            type="number"
            min={120}
            max={4000}
            step={20}
            placeholder="px"
            title="Custom height in pixels"
            // 清空等同回到 Auto —— 不要留一個空字串當高度。
            value={height && height !== 'auto' ? height : ''}
            onChange={(e) => onHeightChange(e.target.value === '' ? 'auto' : e.target.value)}
          />
        </>
      )}
    </div>
  );
}
