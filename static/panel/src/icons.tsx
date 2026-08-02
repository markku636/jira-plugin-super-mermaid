// 圖示直接沿用 VS Code 版 Super Mermaid(src/previewPanel.ts 的 ICON_* 常數),
// 讓三個宿主(VS Code / Jira / Confluence)的工具列長得一樣、認得出是同一家族。
// 路徑一字不改,只從 HTML 字串改寫成 JSX。

const box = { width: 15, height: 15, viewBox: '0 0 16 16', 'aria-hidden': true } as const;
const box14 = { width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true } as const;

export const IconZoomIn = () => (
  <svg {...box} fill="currentColor">
    <path d="M6.5 1a5.5 5.5 0 0 1 4.38 8.83l4.15 4.14-1.06 1.06-4.15-4.14A5.5 5.5 0 1 1 6.5 1Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm.75 1.5v1.75H9v1.5H7.25V9h-1.5V7.25H4v-1.5h1.75V4h1.5Z" />
  </svg>
);

export const IconZoomOut = () => (
  <svg {...box} fill="currentColor">
    <path d="M6.5 1a5.5 5.5 0 0 1 4.38 8.83l4.15 4.14-1.06 1.06-4.15-4.14A5.5 5.5 0 1 1 6.5 1Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 5.75h5v1.5H4v-1.5Z" />
  </svg>
);

export const IconFit = () => (
  <svg {...box} fill="none" stroke="currentColor" strokeWidth={1.4}>
    <circle cx="8" cy="8" r="4.25" />
    <path d="M8 1.25v2.25M8 12.5v2.25M1.25 8H3.5M12.5 8h2.25" />
    <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSearch = () => (
  <svg {...box} fill="currentColor">
    <path d="M6.5 1a5.5 5.5 0 0 1 4.38 8.83l4.15 4.14-1.06 1.06-4.15-4.14A5.5 5.5 0 1 1 6.5 1Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
  </svg>
);

export const IconDownload = () => (
  <svg {...box14} fill="currentColor">
    <path d="M8.75 1v8.04l2.72-2.72 1.06 1.06L8 11.91 3.47 7.38l1.06-1.06 2.72 2.72V1h1.5ZM2 13h12v1.5H2V13Z" />
  </svg>
);

export const IconShare = () => (
  <svg {...box14} fill="none" stroke="currentColor" strokeWidth={1.4}>
    <path d="M6.6 9.4l2.8-2.8" />
    <path d="M7.6 4.6l1.2-1.2a2.55 2.55 0 0 1 3.6 3.6l-1.2 1.2" />
    <path d="M8.4 11.4l-1.2 1.2a2.55 2.55 0 0 1-3.6-3.6l1.2-1.2" />
  </svg>
);

export const IconCopy = () => (
  <svg {...box14} fill="none" stroke="currentColor" strokeWidth={1.4}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.2" />
    <path d="M10.5 5.5v-2A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h2" />
  </svg>
);

export const IconMore = () => (
  <svg {...box14} fill="currentColor">
    <circle cx="3" cy="8" r="1.4" />
    <circle cx="8" cy="8" r="1.4" />
    <circle cx="13" cy="8" r="1.4" />
  </svg>
);

/** 原始碼檢視。VS Code 沒有對應項(它本來就在編輯器裡),用尖括號表達。 */
export const IconCode = () => (
  <svg {...box14} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 4.5 2 8l3.5 3.5" />
    <path d="M10.5 4.5 14 8l-3.5 3.5" />
  </svg>
);

/** 明暗切換。VS Code 用主題下拉,這裡只有兩態,用月亮表達。 */
export const IconTheme = () => (
  <svg {...box14} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
    <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" />
  </svg>
);

/** 繪圖模式切換。VS Code 版是獨立的 editor webview,這裡用鉛筆表達。 */
export const IconDraw = () => (
  <svg {...box14} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
    <path d="M11.2 2.3a1.4 1.4 0 0 1 2 2L5.6 11.9 2.6 13l1.1-3 7.5-7.7Z" />
    <path d="M9.9 3.6l2.1 2.1" />
  </svg>
);
