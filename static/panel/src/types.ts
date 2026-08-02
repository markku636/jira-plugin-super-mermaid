/** 存在 issue property 裡的單張圖。 */
export interface Diagram {
  id: string;
  title: string;
  /** mermaid 原始碼。刻意【只】存這個 —— 視覺編輯器的 round-trip 是無損的,
   *  另外存一份 scene JSON 只會製造兩份真相。 */
  code: string;
  updatedAt: string;
  /** 顯示高度:'auto' 或像素字串。每張圖各自記住。 */
  height?: string;
  // 刻意不存任何使用者識別(名稱 / email / accountId)。
  // Marketplace 的「是否儲存個資」因此可以誠實答 No,
  // 也是 docs/PRIVACY.md 的依據 —— 別為了方便加回來。
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
