import { requestConfluence } from '@forge/bridge';

/**
 * 把這個 macro 的 mermaid 原始碼直接寫回頁面。
 *
 * 為什麼要這樣繞:macro 的【檢視端】無法用 view.submit() 存設定 ——
 * 那個 API 只在設定面板可用。想在檢視頁面直接編輯,唯一的路是讀回整頁 ADF、
 * 找到自己這個 extension 節點、改掉 guestParams.source,再整頁寫回去。
 *
 * 因此需要 read:page:confluence / write:page:confluence 兩個 scope。
 * (scopes 不影響 Runs on Atlassian —— 失格條件是對外傳輸,不是權限大小。)
 *
 * 限制:只能在【已發布】的頁面上用。編輯器裡是草稿,直接寫已發布版本會跟
 * 編輯器的狀態打架,所以呼叫端必須先擋掉編輯模式。
 */

/** 遞迴找出 parameters.localId 相符的 extension 節點,就地改掉它的 source。 */
function patchNode(node: unknown, localId: string, source: string): boolean {
  if (!node || typeof node !== 'object') return false;
  const n = node as {
    type?: string;
    attrs?: { parameters?: { localId?: string; guestParams?: { source?: string } } };
    content?: unknown[];
  };

  if (
    (n.type === 'extension' || n.type === 'bodiedExtension') &&
    n.attrs?.parameters?.localId === localId
  ) {
    n.attrs.parameters.guestParams = { ...n.attrs.parameters.guestParams, source };
    return true;
  }

  if (Array.isArray(n.content)) {
    for (const child of n.content) {
      if (patchNode(child, localId, source)) return true;
    }
  }
  return false;
}

export async function savePageMacroSource(
  pageId: string,
  localId: string,
  source: string
): Promise<void> {
  const getRes = await requestConfluence(
    `/wiki/api/v2/pages/${encodeURIComponent(pageId)}?body-format=atlas_doc_format`
  );
  if (!getRes.ok) throw new Error(`讀取頁面失敗(HTTP ${getRes.status})`);

  const page = (await getRes.json()) as {
    title: string;
    version?: { number?: number };
    body?: { atlas_doc_format?: { value?: string } };
  };

  const raw = page.body?.atlas_doc_format?.value;
  if (!raw) throw new Error('頁面沒有可解析的內容格式。');

  const adf = JSON.parse(raw) as { content?: unknown[] };
  if (!patchNode(adf, localId, source)) {
    // 找不到自己 —— 多半是頁面剛被別處改過,或這是尚未發布的草稿。
    throw new Error('在頁面中找不到這個圖表,請改用 macro 的編輯功能儲存。');
  }

  const putRes = await requestConfluence(`/wiki/api/v2/pages/${encodeURIComponent(pageId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: pageId,
      status: 'current',
      title: page.title,
      body: { representation: 'atlas_doc_format', value: JSON.stringify(adf) },
      // 版本必須 +1,否則 Confluence 會以為你在覆蓋別人的修改而擋下。
      version: {
        number: (page.version?.number ?? 0) + 1,
        message: 'Updated Super Mermaid diagram',
      },
    }),
  });

  if (putRes.status === 409) {
    throw new Error('頁面已被其他人修改,請重新整理後再試。');
  }
  if (putRes.status === 403 || putRes.status === 401) {
    throw new Error('你沒有這個頁面的編輯權限。');
  }
  if (!putRes.ok) throw new Error(`儲存失敗(HTTP ${putRes.status})`);
}
