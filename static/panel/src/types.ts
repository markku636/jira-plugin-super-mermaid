/** 存在 issue property 裡的單張圖。 */
export interface Diagram {
  id: string;
  title: string;
  /** mermaid 原始碼。刻意【只】存這個 —— 視覺編輯器的 round-trip 是無損的,
   *  另外存一份 scene JSON 只會製造兩份真相。 */
  code: string;
  updatedAt: string;
  updatedBy?: string;
}

/** issue property 的完整內容。`v` 保留給之後的 schema 遷移(例如溢位改走 KVS)。 */
export interface DiagramDoc {
  v: 1;
  diagrams: Diagram[];
}

export const STARTER_CODE = `flowchart LR
  A[Idea] --> B{Feasible?}
  B -- yes --> C[Build]
  B -- no --> D[Park it]
  C --> E[Ship]`;
