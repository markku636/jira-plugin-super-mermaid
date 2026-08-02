/**
 * 產生 Super Mermaid 線上預覽的分享連結,格式與 VS Code 版 Super Mermaid 一致。
 *
 * 整個編輯器狀態放在 URL fragment 裡(pako 壓縮後的 base64url JSON)。fragment
 * 不會被瀏覽器送到伺服器,所以連結本身就是全部的資料 —— 圖表內容不會留在任何
 * 伺服器的存取紀錄裡。
 *
 * 欄位形狀刻意沿用 mermaid.live:同一條連結把網域換掉也能在那邊開,
 * 而 `rsmTheme` 是我們自己加的(mermaid 沒有 colorful / sketch 這種主題),
 * 兩邊都會忽略自己不認識的欄位。
 *
 * 為什麼這不影響 Runs on Atlassian:
 * 我們只是「產生一段字串並複製到剪貼簿」,app 從頭到尾沒有發出任何網路請求,
 * 因此不需要在 manifest 宣告 permissions.external。要不要真的把連結貼出去、
 * 打開它,是使用者自己的決定。
 *
 * 為什麼不裝 pako:
 * 瀏覽器原生的 CompressionStream('deflate') 產生的正是 zlib 格式(RFC 1950),
 * 跟 pako.deflate 與 Node zlib.deflateSync 相容。省下約 45KB 相依。
 */

/** 分享連結的落點;與 blog 的 MERMAID_PREVIEW_PATH、VS Code 的 SHARE_BASE_URL 對齊。 */
const SHARE_BASE_URL = 'https://blog.markkulab.net/tools/mermaid-preview';

/** CompressionStream 在舊瀏覽器可能不存在 —— 呼叫端據此決定要不要顯示按鈕。 */
export function canShare(): boolean {
  return typeof CompressionStream !== 'undefined';
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  // 逐塊處理,避免超長圖表把 String.fromCharCode 的參數撐爆。
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function buildShareUrl(code: string, dark: boolean): Promise<string> {
  const state = JSON.stringify({
    code,
    mermaid: JSON.stringify({ theme: dark ? 'dark' : 'default' }),
    autoSync: true,
    updateDiagram: true,
    panZoom: true,
    rough: false,
    // 面板用的是 lib 預設主題,分享出去也維持同一個外觀。
    rsmTheme: 'colorful',
  });

  const stream = new Blob([new TextEncoder().encode(state)])
    .stream()
    .pipeThrough(new CompressionStream('deflate'));
  const buf = new Uint8Array(await new Response(stream).arrayBuffer());

  return `${SHARE_BASE_URL}#pako:${toBase64Url(buf)}`;
}
