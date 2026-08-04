// 截圖用的 @forge/bridge 替身 —— 只給 confluence/static/ui/vite.demo.config.ts 使用,
// 不會進 Forge bundle。
//
// Confluence macro 從 view.getContext() 拿 config.source(圖表原始碼)、content.id
// 與 localId(內嵌儲存要用)。在 Forge iframe 外這個呼叫會失敗,macro 就停在
// 「尚未設定」狀態,拍不到圖。這個替身只換掉 bridge,macro.tsx / ui.css /
// 共用的 Toolbar 與 DrawEditor 全部是真的。
//
// 圖表內容由網址參數決定:?t=flow(鍵值與 storage-mock.ts 同一份 SAMPLES)

const SAMPLES: Record<string, string> = {
  flow: `flowchart LR
  A[Draft] --> B{Reviewed?}
  B -- yes --> C[Publish]
  B -- no --> D[Revise]
  D --> B`,
  seq: `sequenceDiagram
  participant W as Writer
  participant R as Reviewer
  W->>R: Share page
  R-->>W: Inline comments
  W->>R: Publish new version`,
  arch: `flowchart TB
  U[Reader] --> P[Confluence page]
  P --> M[Super Mermaid macro]
  M --> S[(Diagram source in
macro parameter)]
  S --> V[Page version history]`,
  gantt: `gantt
  title Documentation plan
  dateFormat YYYY-MM-DD
  axisFormat %m/%d
  section Write
  Draft pages     :a1, 2026-08-04, 4d
  Review          :a2, after a1, 3d
  section Publish
  Final edits     :b1, after a2, 2d`,
};

function sample(): string {
  const key = new URLSearchParams(location.search).get('t') ?? 'flow';
  return SAMPLES[key] ?? SAMPLES.flow;
}

export const view = {
  async getContext() {
    return {
      localId: 'demo-local-id',
      extension: {
        config: { source: sample(), height: 'auto' },
        content: { id: '65855' },
        isEditing: false,
      },
    };
  },
  async submit(_payload: unknown) {
    return undefined;
  },
  async close() {
    return undefined;
  },
};

/** 只在 demo 裡被呼叫到的話,回一個成功但什麼也沒做的結果。 */
export async function requestConfluence(_url: string, _init?: unknown) {
  return {
    ok: true,
    status: 200,
    async json() {
      return {};
    },
  };
}

export async function requestJira(_url: string, _init?: unknown) {
  return {
    ok: false,
    status: 404,
    async json() {
      return {};
    },
  };
}

export async function invoke(_key: string, _payload?: unknown) {
  return undefined;
}
