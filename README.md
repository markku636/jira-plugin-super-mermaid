# Super Mermaid for Jira

Atlassian Forge app：在 Jira issue 裡檢視與**視覺化編輯** Mermaid 圖表。

`react-super-mermaid` 的第三個宿主（前兩個是 blog 與 VS Code 擴充）。

## 產品定位

Marketplace 上已有 8 個以上的 Mermaid for Jira，**全部都是「貼語法 → 渲染 SVG」**。
這個 app 唯一的立足點是 lib 獨有的**拖拉式視覺編輯器 + 無損 round-trip 回 mermaid 原始碼**。
文案不與那些渲染器比功能數量，只講一件事：**別人只能打字，這裡可以用拖的**。

因此里程碑 M3（視覺編輯器接上）是整個專案的 go/no-go，不是加分項。

## 現況

| 里程碑 | 狀態 |
|---|---|
| M0 骨架 | ✅ 完成（本機建置通過） |
| M1 Viewer | 🟡 程式碼完成，**尚未在真實 Jira 驗證** |
| M2 編輯與儲存 | 🟡 程式碼完成，尚未驗證 |
| M3 視覺編輯器 | ⬜ 未開始（go/no-go） |
| M4 上架 | ⬜ 未開始 |

尚未執行 `forge register` / `forge deploy` —— `manifest.yml` 的 `app.id` 還是 placeholder。

## 快速開始

需要 **Forge CLI**（目前這台機器尚未安裝）與一個免費的 Atlassian Cloud 開發站台。

```powershell
npm install -g @forge/cli
forge login                    # 需要 Atlassian API token
forge register                 # 產生 app id,填回 manifest.yml
npm run install:all
npm run build
forge deploy
forge install                  # 選 Jira,輸入你的站台網址
```

日常開發：

```powershell
npm run dev                    # Vite dev server(單獨開發 UI)
forge tunnel                   # 在真實 Jira 裡熱更新
```

> PowerShell 5.1 沒有 `&&`。要串接指令請用 `;` 搭配 `if ($?)`。
> 另外本機是 Node 24，Forge CLI 官方支援的是 LTS（18/20/22），若 CLI 有相容性抱怨請切換 Node 版本。

## 架構

```
manifest.yml            模組宣告、scopes、CSP
src/index.ts            Forge resolver(刻意近乎空殼,見下)
static/panel/           Custom UI(Vite + React 18 + TS)
  src/App.tsx           面板主體:分頁、載入、儲存
  src/Toolbar.tsx       自建英文工具列
  src/storage.ts        issue property 讀寫
  scripts/copy-assets.mjs   把 Virgil 字型複製進 public/
resources/icon.svg      面板按鈕圖示
```

### 三個刻意的設計決策

**1. 資料存取不走 resolver。** 前端用 `@forge/bridge` 的 `requestJira` 直接讀寫 issue property，
等於「以使用者身分」操作 —— Jira 權限模型自動生效，沒有編輯權的人寫入直接拿到 403。
若改用 `api.asApp()`，就得自己重新實作一遍權限檢查，只會多一個出錯面。
resolver 保留給之後真正需要伺服端的工作（授權檢查、跨 issue 查詢）。

**2. 只存 mermaid 原始碼，不存 scene JSON。** 視覺編輯器的 round-trip 本來就是無損的，
存兩份只會製造兩份真相。

**3. 不用 lib 內建工具列。** `react-super-mermaid` 的 UI 字串硬寫繁體中文
（樣式 / 搜尋 / 匯出中… / 全螢幕），對國際市場是上架級阻礙。
`MermaidViewerHandle` 暴露了 24 個命令式方法，足以自建英文工具列，零上游改動風險。
長期正解是替 lib 加一個 `labels` prop，blog 與 VS Code 擴充也會一起受益。

## 絕對不能碰的紅線：`permissions.external`

「Runs on Atlassian」徽章的失格條件是 `permissions.external`、remotes、Connect 模組、
providers、dynamic web triggers —— 而拿到這個徽章的 app **可以取得 100% 的 Marketplace 營收**
（一般 app 要被抽成）。所以「零對外連線」不是技術潔癖，是真金白銀。

已知的三個對外連線陷阱，全部已封住：

| 陷阱 | 封法 |
|---|---|
| lib 的 sketch 字型預設指向 jsDelivr | `fontUrl="./Virgil.woff2"` + `copy-assets.mjs` 隨檔出貨 |
| lib 找不到 mermaid 時會 fallback 到 CDN | `mermaid={{ instance }}` 明確注入 |
| 同上，svg-pan-zoom | `svgPanZoom={{ instance }}` 明確注入 |

反之，`permissions.content.styles: ['unsafe-inline']` **不影響**資格 —— 這是必要的，
因為 mermaid 會往 SVG 塞 `<style>`，lib 也有 4 處 `document.createElement('style')` 注入，
而 Forge Custom UI 預設 `style-src 'self'` 會全部擋掉。

改動 `manifest.yml` 後務必跑：

```powershell
forge eligibility
```

## 驗證

沿用 sibling repo 的零 CI 慣例，品質閘是：

1. `npm run typecheck`（root + panel）
2. `forge lint`
3. `forge eligibility` —— 每次改 manifest 都要跑
4. 真實 Jira 開發站台手動驗證，截圖歸檔到 `outputs/<主題>_<日期>/`
5. **瀏覽器 Network 面板確認零外部請求** —— 比 CLI 更可信的實質驗證

Playwright 很難自動化 Jira 登入，M1–M3 以手動驗證加截圖為主，不假裝有自動化測試。

## 授權與定價

**免費上架**（2026-08-02 決定）。

選免費直接省掉四件事：

- 不需要公司網域 email —— 私有網域只在「付費 app 的 Partner Portal 存取權」被要求
- 不需要 `app.licensing.enabled` 與授權閘門程式碼（免費 app 的 `license` 物件是 undefined）
- 不需要稅務與收款資訊
- 不需要顧慮「付費 app 在 production 的每次安裝都計費」

仍然要的：Marketplace 合作夥伴帳號、隱私權政策、End User Terms、支援管道、送審。

之後想改成付費是可行的，但會影響既有安裝者且要補齊上面整組。
先靠免費把安裝數與評價養起來，再談收費。細節見 [docs/MARKETPLACE.md](docs/MARKETPLACE.md)。

> Runs on Atlassian 徽章仍然值得維持。免費 app 沒有營收要分，
> 但它代表「零對外傳輸」，對企業客戶是信任訊號，
> 而維持它的成本就只是**永遠不要加 `permissions.external`**。

repo 本身的授權條款仍未決定（sibling lib 是 MIT；改走免費後 MIT 不再有衝突，但仍需明確選定）。
