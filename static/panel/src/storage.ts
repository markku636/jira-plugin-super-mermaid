// issue entity property 的讀寫。
//
// 走前端 requestJira 而非 resolver + api.asApp():這樣所有請求都是「以目前使用者
// 的身分」發出,Jira 的權限模型自動生效 —— 沒有 issue 編輯權的人寫入會拿到 403,
// 不需要我們自己重新實作一遍權限檢查。

import { requestJira, view } from '@forge/bridge';
import type { DiagramDoc } from './types';

export const PROPERTY_KEY = 'com.markku.super-mermaid.diagrams';

/** Jira entity property 單筆上限 32768 bytes。留 2KB 餘裕給編碼膨脹。 */
const HARD_LIMIT = 32768;
const WARN_LIMIT = 30 * 1024;

const EMPTY: DiagramDoc = { v: 1, diagrams: [] };

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

/** 從 Forge context 取得目前的 issue key。 */
export async function getIssueKey(): Promise<string> {
  const ctx = (await view.getContext()) as {
    extension?: { issue?: { key?: string } };
  };
  const key = ctx.extension?.issue?.key;
  if (!key) {
    throw new Error('無法從 Forge context 取得 issue key —— 這個面板只能在 issue 檢視畫面中執行。');
  }
  return key;
}

export async function loadDiagrams(issueKey: string): Promise<DiagramDoc> {
  const res = await requestJira(
    `/rest/api/3/issue/${encodeURIComponent(issueKey)}/properties/${PROPERTY_KEY}`
  );

  // 還沒存過任何圖 —— 這是正常狀態,不是錯誤。
  if (res.status === 404) return EMPTY;

  if (!res.ok) {
    throw new Error(`讀取失敗(HTTP ${res.status})。`);
  }

  const body = (await res.json()) as { value?: unknown };
  const value = body.value;

  // 防禦性解析:property 是公開可寫的,不能假設內容一定是我們寫的格式。
  if (!value || typeof value !== 'object' || !Array.isArray((value as DiagramDoc).diagrams)) {
    return EMPTY;
  }
  return value as DiagramDoc;
}

export interface SaveResult {
  /** 序列化後的 bytes,給 UI 顯示容量用。 */
  bytes: number;
}

export async function saveDiagrams(issueKey: string, doc: DiagramDoc): Promise<SaveResult> {
  const body = JSON.stringify(doc);
  const bytes = byteLength(body);

  // 明確擋下並說清楚,不要讓 Jira 回一個難懂的 400,更不要靜默截斷。
  if (bytes > HARD_LIMIT) {
    throw new Error(
      `圖表資料 ${(bytes / 1024).toFixed(1)}KB,超過 Jira 單筆屬性上限 32KB。` +
        `請刪掉或縮短部分圖表後再存。`
    );
  }

  const res = await requestJira(
    `/rest/api/3/issue/${encodeURIComponent(issueKey)}/properties/${PROPERTY_KEY}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    }
  );

  if (res.status === 403 || res.status === 401) {
    throw new Error('你沒有這個 issue 的編輯權限,無法儲存。');
  }
  if (!res.ok) {
    throw new Error(`儲存失敗(HTTP ${res.status})。`);
  }

  return { bytes };
}

/** 是否已接近 32KB 上限,UI 用來提前警告。 */
export function isNearLimit(doc: DiagramDoc): boolean {
  return byteLength(JSON.stringify(doc)) > WARN_LIMIT;
}
