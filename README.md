# Super Mermaid for Jira

Atlassian Forge app：在 Jira issue 裡檢視與**視覺化編輯** Mermaid 圖表。

`react-super-mermaid` 的第三個宿主（前兩個是 blog 與 VS Code 擴充）。

## 產品定位

Marketplace 上已有 8 個以上的 Mermaid for Jira，**全部都是「貼語法 → 渲染 SVG」**。
這個 app 唯一的立足點是 lib 獨有的**拖拉式視覺編輯器 + 無損 round-trip 回 mermaid 原始碼**。
文案不與那些渲染器比功能數量，只講一件事：**別人只能打字，這裡可以用拖的**。

因此里程碑 M3（視覺編輯器接上）是整個專案的 go/no-go，不是加分項 ——
已於 2026-08-02 完成（`DrawEditor.tsx`，兩個 app 共用）。

## 現況

**2026-08-02：兩份 Marketplace listing 都已送審，等待 Atlassian 審核（約 10–15 個工作天）。**

| 里程碑 | 狀態 |
|---|---|
| M0 骨架 | ✅ 完成 |
| M1 Viewer | ✅ 完成（已在 `markku666.atlassian.net` 實際驗證） |
| M2 編輯與儲存 | ✅ 完成（Jira 存 issue property、Confluence 存 macro 參數） |
| M3 視覺編輯器 | ✅ 完成（拖拉繪圖 + 無損 round-trip，兩個 app 共用同一條儲存路徑） |
| M4 上架 | 🟡 兩份 listing 已送審，等待審核結果 |

這個 repo 現在裝了**兩個獨立的 Forge app** —— 跨產品 app（`app.compatibility` 同時宣告
jira + confluence）不接受免費 listing，所以拆成兩個單產品 app，代價是兩份 listing
與兩次審核。細節見 [docs/MARKETPLACE.md](docs/MARKETPLACE.md)。

| app | 位置 | app id 尾碼 | 模組 |
|---|---|---|---|
| Super Mermaid for Jira | repo 根目錄 | `69ba5f06…` | `jira:issuePanel`（側邊面板） |
| Super Mermaid for Confluence | `confluence/` | `fd93a1d5…` | `macro`（`layout: block`，真的嵌在頁面內文裡） |

兩個 app 都已部署到 development 與 production，也都通過 `forge eligibility`
（Runs on Atlassian）。**`forge` 指令必須在各自的目錄下跑**，Confluence 那個不是子模組。

## 快速開始

Forge CLI 已安裝並登入完成，日常更新直接跑：

```powershell
./deploy.ps1                          # Jira app → development(建置 + lint + deploy + eligibility)
./deploy.ps1 -Environment production  # 上架用的正式環境
cd confluence; npm run deploy         # Confluence app 要在自己的目錄下跑
```

日常開發：

```powershell
npm run dev                    # Vite dev server(單獨開發 UI)
forge tunnel                   # 在真實 Jira 裡熱更新
npm run typecheck              # root + panel
```

換一台機器才需要的一次性步驟：

```powershell
npm install -g @forge/cli
forge login                    # Atlassian 帳號是 a4756830@gmail.com,不是 hotmail
npm run install:all
```

> **登入的坑**：token 必須從 <https://go.atlassian.com/forge-cli-api-token> 建立（帶 Forge scope），
> 舊式無 scope 的一定失敗；而且 **email 打錯時，錯誤訊息會謊稱「The API token is no longer valid」**，
> 會害人一直重換 token。

> PowerShell 5.1 沒有 `&&`。要串接指令請用 `;` 搭配 `if ($?)`。
> 另外本機是 Node 24，Forge CLI 官方支援的是 LTS（18/20/22），若 CLI 有相容性抱怨請切換 Node 版本。

## 架構

```
manifest.yml            Jira app:模組宣告、scopes、CSP
src/index.ts            Forge resolver(刻意近乎空殼,見下)
static/panel/           Custom UI(Vite + React 18 + TS)
  src/App.tsx           面板主體:分頁、載入、儲存、原始碼/繪圖模式切換
  src/DrawEditor.tsx    拖拉繪圖編輯器(M3,Confluence 也共用這支)
  src/Toolbar.tsx       自建英文工具列
  src/storage.ts        issue property 讀寫
  src/shareLink.ts      分享連結
  scripts/copy-assets.mjs   把 Virgil 字型複製進 public/
resources/              面板圖示與 Marketplace logo
confluence/             Confluence app(獨立 Forge app,自己的 manifest 與 app id)
  static/ui/src/macro.tsx        內文顯示與內嵌編輯
  static/ui/src/config.tsx       macro 設定面板
  static/ui/src/savePageMacro.ts 寫回頁面 macro 參數
```

> **Confluence 的 Custom UI 不能用「單次多 entry」建置。** `resource.path` 就是那個 iframe 的
> 服務根目錄，多 entry 會產生共用的 `build/assets/`，而 `build/macro/index.html` 引用
> `../assets/…` 等於逃出根目錄 → 線上 404。正解是用 `--mode` 驅動跑兩次獨立建置，
> 各自自足（`macro` 與 `config` 兩個 resource 各一份）。

### 三個刻意的設計決策

**1. 資料存取不走 resolver。** 前端用 `@forge/bridge` 的 `requestJira` 直接讀寫 issue property，
等於「以使用者身分」操作 —— Jira 權限模型自動生效，沒有編輯權的人寫入直接拿到 403。
若改用 `api.asApp()`，就得自己重新實作一遍權限檢查，只會多一個出錯面。
resolver 保留給之後真正需要伺服端的工作（跨 issue 查詢、webhook 觸發）。

**2. 只存 mermaid 原始碼，不存 scene JSON。** 視覺編輯器的 round-trip 本來就是無損的，
存兩份只會製造兩份真相。

**3. 不用 lib 內建工具列。** `react-super-mermaid` 的 UI 字串硬寫繁體中文
（樣式 / 搜尋 / 匯出中… / 全螢幕），對國際市場是上架級阻礙。
`MermaidViewerHandle` 暴露了 24 個命令式方法，足以自建英文工具列，零上游改動風險。
長期正解是替 lib 加一個 `labels` prop，blog 與 VS Code 擴充也會一起受益。

## 絕對不能碰的紅線：`permissions.external`

「Runs on Atlassian」徽章的失格條件是 `permissions.external`、remotes、Connect 模組、
providers、dynamic web triggers —— 這個徽章是**對外唯一講得清楚的信任訊號**：
app 執行期不對外發任何請求。所以「app 零對外請求」不是技術潔癖，是這個 app 的賣點本身。

已知的三個對外連線陷阱，全部已封住：

| 陷阱 | 封法 |
|---|---|
| lib 的 sketch 字型預設指向 jsDelivr | `fontUrl="./Virgil.woff2"` + `copy-assets.mjs` 隨檔出貨 |
| lib 找不到 mermaid 時會 fallback 到 CDN | `mermaid={{ instance }}` 明確注入 |
| 同上，svg-pan-zoom | `svgPanZoom={{ instance }}` 明確注入 |

**但對外文案不能寫成「資料絕不離開 Atlassian」。** 工具列的 🔗 分享按鈕會產生一段
`blog.markkulab.net/tools/mermaid-preview#pako:…` 網址寫進剪貼簿 —— 它不觸發任何請求
（所以徽章資格不受影響，見 `shareLink.ts`），但只要有人打開那個連結，圖就到了
Atlassian 以外的網站。說法一律停在「**app 自己不對外連線，要不要分享出去由使用者決定**」，
且 listing / 隱私權政策 / 說明文件都要明講分享連結是站外的。

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
   （按下 🔗 分享時也要是零請求：它只寫剪貼簿，不開連結）

Playwright 很難自動化 Jira 登入，M1–M3 以手動驗證加截圖為主，不假裝有自動化測試。

## 上架

**免費，不設用量上限，全功能開放。** 要準備的是 Marketplace 合作夥伴帳號、隱私權政策、
End User Terms、支援管道與送審，細節見 [docs/MARKETPLACE.md](docs/MARKETPLACE.md)。

> Runs on Atlassian 徽章仍然值得維持 —— 它代表「app 本身零對外請求」，
> 對企業客戶是信任訊號，而維持它的成本就只是**永遠不要加 `permissions.external`**。

repo 本身的授權條款仍未決定（sibling lib 是 MIT，兩者不衝突，但仍需明確選定）。
