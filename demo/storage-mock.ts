// 截圖用的 storage 替身 —— 只給 vite.demo.config.ts 使用,不會進 Forge bundle。
//
// 為什麼需要它:src/storage.ts 走 @forge/bridge,在 Forge iframe 外呼叫會直接失敗,
// App 就停在錯誤畫面,拍不到任何東西。這個替身把 issue property 換成記憶體,
// 其餘一律走【真實的】App / Toolbar / DrawEditor / MermaidViewer 與真實 CSS ——
// 拍出來的就是當前程式碼跑出來的 UI,不是重畫的示意圖。
//
// 圖表內容由網址參數決定:?t=flow,seq,gantt

import type { DiagramDoc } from '../src/types';

export const PROPERTY_KEY = 'com.markku.super-mermaid.diagrams';

/** listing 用的示範圖,一律英文、內容乾淨,不含任何真實客戶資料。 */
const SAMPLES: Record<string, { title: string; code: string }> = {
  flow: {
    title: 'Release flow',
    code: `flowchart LR
  A[Pull request] --> B{Tests pass?}
  B -- yes --> C[Review]
  B -- no --> D[Fix and push]
  D --> B
  C --> E{Approved?}
  E -- yes --> F[Merge]
  E -- no --> D
  F --> G[Deploy to staging]
  G --> H[Release]`,
  },
  seq: {
    title: 'Auth handshake',
    code: `sequenceDiagram
  participant U as User
  participant A as App
  participant S as Auth service
  U->>A: Open dashboard
  A->>S: Exchange refresh token
  S-->>A: Access token (15 min)
  A-->>U: Dashboard data
  Note over A,S: Token refreshed in the background`,
  },
  gantt: {
    title: 'Sprint plan',
    code: `gantt
  title Sprint 24
  dateFormat YYYY-MM-DD
  axisFormat %m/%d
  section Build
  API endpoints      :a1, 2026-08-04, 5d
  Front-end wiring   :a2, after a1, 4d
  section Verify
  QA pass            :b1, after a2, 3d
  Release notes      :b2, after b1, 1d`,
  },
  state: {
    title: 'Issue states',
    code: `stateDiagram-v2
  [*] --> Backlog
  Backlog --> InProgress: assigned
  InProgress --> Review: PR opened
  Review --> InProgress: changes requested
  Review --> Done: approved
  Done --> [*]`,
  },
  er: {
    title: 'Data model',
    code: `erDiagram
  PROJECT ||--o{ ISSUE : contains
  ISSUE ||--o{ DIAGRAM : stores
  ISSUE ||--o{ COMMENT : has
  USER ||--o{ ISSUE : reports`,
  },
  class: {
    title: 'Class diagram',
    code: `classDiagram
  class Diagram {
    +string id
    +string title
    +string code
    +render()
  }
  class Storage {
    +load()
    +save()
  }
  Diagram --> Storage : persisted by`,
  },
  pie: {
    title: 'Pie chart',
    code: `pie title Time spent this sprint
  "Build" : 45
  "Review" : 20
  "QA" : 25
  "Docs" : 10`,
  },
  mindmap: {
    title: 'Mindmap',
    code: `mindmap
  root((Release))
    Build
      API
      UI
    Verify
      Tests
      QA
    Ship
      Notes
      Deploy`,
  },
  timeline: {
    title: 'Timeline',
    code: `timeline
  title Product timeline
  2026 Q1 : Prototype
  2026 Q2 : Beta
  2026 Q3 : General availability`,
  },
  journey: {
    title: 'User journey',
    code: `journey
  title Reporting a bug
  section Discover
    Hit the error: 2: User
    Search docs: 3: User
  section Report
    Open issue: 5: User
    Attach diagram: 5: User`,
  },
  git: {
    title: 'Git graph',
    code: `gitGraph
  commit id: "init"
  branch feature
  commit id: "panel"
  commit id: "toolbar"
  checkout main
  merge feature
  commit id: "release"`,
  },
  draw: {
    title: 'Draft',
    code: `flowchart TD
  A[Idea] --> B{Feasible?}
  B -- yes --> C[Build]
  B -- no --> D[Park it]`,
  },
};

function requested(): string[] {
  const raw = new URLSearchParams(location.search).get('t');
  const keys = (raw ?? 'flow').split(',').map((s) => s.trim()).filter(Boolean);
  const valid = keys.filter((k) => k in SAMPLES);
  return valid.length ? valid : ['flow'];
}

let memory: DiagramDoc | null = null;

export async function getIssueKey(): Promise<string> {
  return 'DEMO-1';
}

export async function loadDiagrams(_issueKey: string): Promise<DiagramDoc> {
  if (memory) return memory;
  memory = {
    v: 1,
    diagrams: requested().map((k, i) => ({
      id: `demo-${i}`,
      title: SAMPLES[k].title,
      code: SAMPLES[k].code,
      updatedAt: '2026-08-04T00:00:00.000Z',
    })),
  };
  return memory;
}

export async function saveDiagrams(_issueKey: string, doc: DiagramDoc): Promise<{ bytes: number }> {
  memory = doc;
  return { bytes: new TextEncoder().encode(JSON.stringify(doc)).length };
}

export function isNearLimit(_doc: DiagramDoc): boolean {
  return false;
}
