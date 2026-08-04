# Marketplace 送審逐欄表（2026-08-04 打包）

兩份 listing 要各填一次。**建立 listing 與送審只能由人在網頁後台做**，這份表就是給你
一邊開後台一邊照著貼的。

- 後台入口：<https://marketplace.atlassian.com/manage/apps>
- 描述長文案的**唯一來源**是 [../docs/LISTING-COPY.md](../docs/LISTING-COPY.md) ——
  這份表只放短欄位、素材與檢查項，長描述請從那個檔複製，別在兩個地方各維護一份。

---

## 0. 上傳前 30 秒，先確認兩件事

1. **登入帳號必須是 `a4756830@gmail.com`。**
   兩個 Forge app 屬於這個帳號；用公司帳號（`mark.ku@ascentistech.com`）登入會進到
   另一個空的 vendor profile，`Create app` 的清單裡也找不到 `Super Mermaid`。
2. **vendor 顯示名稱目前是 `Mark ku`，但文案與 banner 寫的是 `Markkulab`。**
   二選一：後台 `Details` 頁把 vendor 名稱改成 `Markkulab`（推薦，與 blog、VS Code
   擴充一致），或把文案與 banner 改成 `Mark ku`（banner 產生腳本見本檔最後一節）。
   兩邊不一致本身不會被退件，但使用者會看到兩個名字。

## 1. 現在能送嗎？——**可以，圖與文件都齊了**

全部規格照 [Build your presence on Marketplace](https://developer.atlassian.com/platform/marketplace/building-your-presence-on-marketplace/)。

| 素材 | 規格 | 檔案 |
|---|---|---|
| App logo | 144×144 PNG | `images/logo-144.png` |
| App banner | 1120×548 ＋ 560×274 | `images/banner-jira-*.png`、`images/banner-confluence-*.png` |
| **Jira highlights（必填 3 組）** | 每組 1840×900 ＋ 580×330 | `hl-jira-1-panel-*`、`hl-jira-2-draw-*`、`hl-jira-3-tabs-*` |
| **Confluence highlights（必填 3 組）** | 同上 | `hl-conf-1-inline-*`、`hl-conf-2-draw-*`、`hl-conf-3-types-*` |
| 圖庫補充（選填，每 highlight 最多 5 張） | 同上 | `gal-jira-4-types-*`、`gal-jira-5-source-*`、`gal-jira-6-dark-*`、`gal-conf-4-gantt-*` |
| YouTube 影片（選配） | ≤30 秒 | ⬜ 沒有，不影響送審 |

highlight 標題與說明已經印在圖上，後台的標題欄照著填即可：

| 檔名前綴 | 標題 | 說明（≤220 字元，可直接貼） |
|---|---|---|
| `hl-jira-1-panel` | Diagrams on the issue | Write a few lines of Mermaid, get a diagram — pan, zoom, search and export from the panel. |
| `hl-jira-2-draw` | Draw it, don't type it | Drag nodes and edges on a canvas. Every change round-trips back to Mermaid source, losslessly. |
| `hl-jira-3-tabs` | Several diagrams per issue | Keep the flow, the sequence and the plan on the same issue, each in its own tab. |
| `hl-conf-1-inline` | Diagrams inside your page | The macro renders in the page body — not an image, not an attachment. Source lives in the macro parameter. |
| `hl-conf-2-draw` | Draw it, don't type it | 同 Jira 那條 |
| `hl-conf-3-types` | 11 diagram types | Flowchart, sequence, class, state, ER, Gantt, pie, mindmap, timeline, user journey, git graph. |

### 這些圖是怎麼來的（重要，因為它決定了可信度）

**全部是當前程式碼跑出來的真實 UI**，用 Playwright 拍、sharp 合成，腳本在
[scripts/make-listing-images.mjs](scripts/make-listing-images.mjs)。合成只加了背景、標題與
外框 —— 產品畫面本身原樣未修，沒有重畫、沒有假的宿主外框、沒有 mock。

做法是把面板與 macro 在本機 vite 跑起來（`static/panel/vite.demo.config.ts`、
`confluence/static/ui/vite.demo.config.ts`），只把 `@forge/bridge` 換成記憶體替身，
其餘元件、CSS、mermaid 注入全部走真的那份。**改過面板 UI 就重跑這支腳本**，
免得又出現「截圖與實際 UI 不符」——那正是審查會逐張比對的項目。

08-02 手拍的那兩張已經刪掉（原始檔還在 `screenshot/`）。它們不能用的原因值得記住：
拍攝時間 10:08／10:14，之後還有 5 個改 UI 的 commit（`95a61b3` 工具列全換成圖示、
`43ee387` 匯出改選單、`8320ce2` 拖拉編輯器），Jira 那張還帶「開發」環境標籤，
Confluence 那張是編輯模式草稿頁且有內部驗收文字。

### 核准後可以再加強的兩張（不擋送審）

1. **真實 Confluence 頁面內文的合照** —— `hl-conf-1-inline` 是 macro 本身的真實渲染，
   但沒有頁面的上下文。想強化「圖真的長在內文裡」就在已發布頁面上拍一張圖文混排。
2. **DevTools Network 面板空空如也** —— 這是「app 不對外連線」最有說服力的一張，
   但必須在真站台拍（本機 dev server 會有 localhost 請求，拍了反而誤導）。

## 2. 建立 listing 的路徑

```
marketplace.atlassian.com/manage/apps
  → Create app
  → Hosting: Cloud
  → 選 Forge app（清單來自你的 developer console，app sharing 已開好）
  → Super Mermaid（Jira）／Super Mermaid（Confluence）各建一份
```

Forge app id 對號：Jira `69ba5f06-8964-4e9c-a892-86470cae6167`、
Confluence `fd93a1d5-8b3a-4a6d-8785-61624b4b8fe0`。

## 3. 逐欄要填的值

### 兩份共用

| 欄位 | 值 |
|---|---|
| Vendor / Partner | `Markkulab`（或維持 `Mark ku`，見第 0 節） |
| Pricing | **Free**（不要留任何付費、試用、聯絡業務的痕跡） |
| Hosting | Cloud only |
| Support contact | `https://github.com/markku636/jira-plugin-super-mermaid/issues` |
| Privacy policy | `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/PRIVACY.md` |
| Documentation | `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/GETTING-STARTED.en.md` ⚠️ **用 `.en` 這份** —— 原本那份是繁體中文，而 listing 是英文的，審查者與國際使用者點進去會看到中文頁 |
| End User Terms | Atlassian 範本 |
| Logo | `images/logo-144.png` |

有欄位可填就一起填（都是 08-04 新寫的，內容與 manifest／實作對得起來）：

| 欄位 | 網址 |
|---|---|
| Support 政策／24 小時回覆承諾 | `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/SUPPORT.md` |
| FAQ／已知限制（32KB、100 筆、草稿頁不開放繪圖） | `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/FAQ.md` |
| 第三方授權聲明（bundle 內所有元件＋Virgil 字型 OFL-1.1） | `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/THIRD-PARTY-NOTICES.md` |
| 授權（MIT） | `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/LICENSE` |

⚠️ 這四份與前面三份一樣，**都要先 push 到 `main` 才點得開**。目前是本機修改、未 commit。

三個 URL 請用**未登入的瀏覽器**各開一次再送 —— repo 是 public（08-04 已核對），
但這是審查者一定會點的三個連結。

### Super Mermaid for Jira

| 欄位 | 值 |
|---|---|
| App name | `Super Mermaid for Jira` |
| Summary | `Add flowcharts and sequence diagrams to any issue — your diagrams stay in your own site.` |
| Categories | Charts & reporting（主）／Workflow |
| Banner | `images/banner-jira-1120x548.png`（＋ `560x274` 標準版） |
| Description | 複製 [LISTING-COPY.md](../docs/LISTING-COPY.md) 的 **B. Super Mermaid for Jira → Description** 整段 |
| Highlight 標題 ×3 | 同上檔 B 節的 Highlights 三行 |

### Super Mermaid for Confluence

| 欄位 | 值 |
|---|---|
| App name | `Super Mermaid for Confluence` |
| Summary | `Draw flowcharts, sequence diagrams and Gantt charts inline — your diagrams stay in your own site.` |
| Categories | Charts & diagramming（主）／Documentation |
| Banner | `images/banner-confluence-1120x548.png`（＋ `560x274`） |
| Description | 複製 LISTING-COPY 的 **A. Super Mermaid for Confluence → Description** 整段 |
| Highlight 標題 ×3 | 同上檔 A 節的 Highlights 三行 |

### 權限說明欄（審查會逐條比對 manifest）

| app | scopes | 說法 |
|---|---|---|
| Jira | `read:jira-work`／`write:jira-work` | 只用於讀寫本 app 自己的 issue entity property（`com.markku.super-mermaid.diagrams`），以登入使用者身分發出 |
| Confluence | `read:page:confluence`／`write:page:confluence` | 只用於「在檢視頁面直接編輯」：讀回**那一頁**、換掉自己 macro 參數裡的原始碼、再寫回去（`savePageMacro.ts`），以登入使用者身分發出 |
| 遠端主機 | **無** | 執行期不對外請求，mermaid／svg-pan-zoom／字型全部隨 app 打包 |
| 對外連結 | 工具列 🔗 分享鈕 | 只寫剪貼簿，產生 `blog.markkulab.net/tools/mermaid-preview#pako:…`。**要主動說明這條連結會連到 Atlassian 以外的網站**，不要寫「零對外連線」這種絕對句 |

> 2026-08-04 已把 Confluence 的 scope 說法在 manifest 註解、PRIVACY.md、LISTING-COPY.md
> 三處對齊（原本寫著 `requests no API scopes at all`，與安裝同意畫面正面打架，
> 那是最典型的退件理由）。**以後改 scope 一律同步這三處＋本檔。**

## 4. 選配：把視覺編輯器寫進描述

想放的話，貼在 Description 的 `WHAT YOU GET` 清單最前面：

```
• Draw diagrams by dragging — add nodes, connect them, drag them around, and the Mermaid
  source updates as you go. Edit either way, source or canvas, and both stay in sync.
```

highlight 標題可用：

```
Draw it, don't type it
```

## 5. 送出之後，回填這裡

- [ ] 兩個 listing id（`marketplace.atlassian.com/manage/apps/<id>`）
- [ ] 送出日期 →（審核 10–15 個工作天從這天起算）
- [ ] 回填 [../README.md](../README.md)、[../README.en.md](../README.en.md)、
      [../docs/MARKETPLACE.md](../docs/MARKETPLACE.md) 的狀態欄

**紀錄規則：拿到 listing id 之前，任何文件都不准把狀態寫成「已送審」。**
08-02 就是在沒有憑證的情況下寫下「兩份 listing 已送審」，害得 08-04 才發現後台是空的、
白等兩天。

## 6. 素材重新產生

所有圖（banner、highlight、圖庫、11 圖型拼圖）都由同一支腳本產生：
[scripts/make-listing-images.mjs](scripts/make-listing-images.mjs)。
要改 vendor 名稱（`PARTNER`）、配色、標題與說明文案，都在那個檔裡。

```powershell
# 先開兩個 demo server（各佔一個終端）
cd static/panel;         npx vite --config vite.demo.config.ts   # :5199
cd confluence/static/ui; npx vite --config vite.demo.config.ts   # :5299
# 再跑
node submission/scripts/make-listing-images.mjs
```

原始擷取落在 `submission/.shots/`（已 gitignore），成品覆蓋 `submission/images/`。
playwright 借 kanban、sharp 借 blog 的 `node_modules` —— 換機器就改腳本開頭的
`REQUIRE_FROM` 那兩行。
