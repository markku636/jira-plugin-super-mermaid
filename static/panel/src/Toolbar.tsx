// 共用工具列(Jira 面板與 Confluence macro 都用這一份)。
//
// 圖示與 tooltip 文案刻意抄自 VS Code 版 Super Mermaid,讓三個宿主體驗一致。
// 兩個刻意的差異:
//   1. 沒有全螢幕。lib 的 toggleFullscreen 用 position: fixed 覆蓋「視窗」,
//      而 Forge 裡的視窗就是那個 iframe —— 按下去只會把圖縮進小框。
//      能做的是設定高度,所以「放大」在這裡就是右邊那組高度控制。
//   2. 多了高度快捷與手動輸入,那是 iframe 宿主特有的需求。
//
// 也不用 lib 內建的 <Toolbar>:它的 UI 字串硬寫繁體中文,國際市集會卡。

import { useState } from 'react';
import type { MermaidViewerHandle, SearchState } from 'react-super-mermaid';
import {
  IconCode,
  IconCopy,
  IconDownload,
  IconDraw,
  IconFit,
  IconMore,
  IconSearch,
  IconShare,
  IconTheme,
  IconZoomIn,
  IconZoomOut,
} from './icons';

interface Props {
  viewer: React.RefObject<MermaidViewerHandle | null>;
  dark: boolean;
  onToggleDark: () => void;
  /** 原始碼切換。省略則不顯示 —— 不該出現一顆按了沒反應的鈕。 */
  showSource?: boolean;
  onToggleSource?: () => void;
  /** 一鍵複製 mermaid 原始碼。省略則不顯示。 */
  onCopySource?: () => void;
  copied?: boolean;
  /** 產生 mermaid.live 分享連結並複製。省略則不顯示。 */
  onShare?: () => void;
  shared?: boolean;
  /** 拖拉繪圖模式切換。省略則不顯示。 */
  drawing?: boolean;
  onToggleDraw?: () => void;
  /** 顯示高度。'auto' = 依內容撐開,其餘為像素字串。 */
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
  onShare,
  shared,
  drawing,
  onToggleDraw,
  height,
  onHeightChange,
}: Props) {
  const [term, setTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
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

  return (
    <div className="sm-toolbar" role="toolbar" aria-label="Diagram controls">
      <button type="button" onClick={() => viewer.current?.zoomOut()} title="Zoom out (-)">
        <IconZoomOut />
      </button>
      <button
        type="button"
        className="sm-zoom-level"
        onClick={() => viewer.current?.actualSize()}
        title="Click for actual size (1)"
      >
        {viewer.current?.getZoomPercent() ?? 100}%
      </button>
      <button type="button" onClick={() => viewer.current?.zoomIn()} title="Zoom in (+)">
        <IconZoomIn />
      </button>
      <button
        type="button"
        onClick={() => viewer.current?.fit()}
        title="Fit to view (0, or double-click canvas)"
      >
        <IconFit />
      </button>

      <span className="sm-sep" />

      <button
        type="button"
        aria-pressed={searchOpen}
        onClick={() => {
          const next = !searchOpen;
          setSearchOpen(next);
          if (!next) runSearch('');
        }}
        title="Find in diagram (/)"
      >
        <IconSearch />
      </button>
      {searchOpen && (
        <>
          <input
            className="sm-search"
            type="search"
            autoFocus
            placeholder="Find…"
            value={term}
            onChange={(e) => runSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setHits(viewer.current?.prev() ?? null)}
            disabled={!hits?.total}
            title="Previous match"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => setHits(viewer.current?.next() ?? null)}
            disabled={!hits?.total}
            title="Next match"
          >
            ↓
          </button>
          {hits && hits.total > 0 && (
            <span className="sm-hits">
              {hits.current}/{hits.total}
            </span>
          )}
        </>
      )}

      <span className="sm-sep" />

      {/* 匯出收成一顆按鈕 + 選單,跟 VS Code 版的「Export diagram…」一致。
          PNG 與 SVG 各佔一顆常駐按鈕太浪費寬度。 */}
      <span className="sm-more-wrap">
        <button
          type="button"
          aria-pressed={exportOpen}
          aria-expanded={exportOpen}
          onClick={() => {
            setExportOpen((v) => !v);
            setMoreOpen(false);
          }}
          title="Export diagram…"
        >
          <IconDownload />
        </button>

        {exportOpen && (
          <div className="sm-more-pop sm-more-pop-sm" role="menu">
            <button
              type="button"
              className="sm-more-item"
              onClick={() => {
                setExportOpen(false);
                void viewer.current?.downloadPng();
              }}
            >
              Download PNG
            </button>
            <button
              type="button"
              className="sm-more-item"
              onClick={() => {
                setExportOpen(false);
                viewer.current?.downloadSvg();
              }}
            >
              Download SVG
            </button>
          </div>
        )}
      </span>
      {onShare && (
        <button type="button" onClick={onShare} title="Share to mermaid.live">
          {shared ? '✓' : <IconShare />}
        </button>
      )}
      {onCopySource && (
        <button type="button" onClick={onCopySource} title="Copy Mermaid source">
          {copied ? '✓' : <IconCopy />}
        </button>
      )}
      {onToggleDraw && (
        <button
          type="button"
          onClick={onToggleDraw}
          aria-pressed={drawing}
          title="Draw: drag nodes and edges instead of typing"
        >
          <IconDraw />
        </button>
      )}
      {onToggleSource && (
        <button
          type="button"
          onClick={onToggleSource}
          aria-pressed={showSource}
          title="Toggle Mermaid source"
        >
          <IconCode />
        </button>
      )}
      <button type="button" onClick={onToggleDark} aria-pressed={dark} title="Toggle dark mode">
        <IconTheme />
      </button>

      {/* 高度控制收進 ⋯ 選單。它是「設定一次就不太動」的東西,
          常駐在工具列上會把一整排擠爆,尤其 Confluence 那個浮動列。
          VS Code 版同樣有一顆 More,收在這裡也維持一致。 */}
      {onHeightChange && (
        <span className="sm-more-wrap">
          <button
            type="button"
            aria-pressed={moreOpen}
            aria-expanded={moreOpen}
            onClick={() => {
              setMoreOpen((v) => !v);
              setExportOpen(false);
            }}
            title="More… (display size)"
          >
            <IconMore />
          </button>

          {moreOpen && (
            <div className="sm-more-pop" role="group" aria-label="Display size">
              <div className="sm-more-title">Display height</div>
              <div className="sm-more-row">
                {HEIGHT_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className="sm-h-preset"
                    aria-pressed={height === p.value}
                    onClick={() => onHeightChange(p.value)}
                    title={p.value === 'auto' ? 'Fit height to content' : `${p.value}px tall`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="sm-more-row">
                <input
                  className="sm-h-input"
                  type="number"
                  min={120}
                  max={4000}
                  step={20}
                  placeholder="Custom"
                  title="Custom height in pixels"
                  // 清空等同回到 Auto —— 不要留一個空字串當高度。
                  value={height && height !== 'auto' ? height : ''}
                  onChange={(e) => onHeightChange(e.target.value === '' ? 'auto' : e.target.value)}
                />
                <span className="sm-more-unit">px</span>
              </div>
            </div>
          )}
        </span>
      )}
    </div>
  );
}
