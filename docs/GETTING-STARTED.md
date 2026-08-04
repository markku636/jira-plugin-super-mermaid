# Super Mermaid — 安裝與使用

用文字語法畫流程圖、時序圖、甘特圖，直接畫在 Jira 議題與 Confluence 頁面裡。

分成兩個獨立的 app，各自安裝：

| App | 位置 | 用途 |
|---|---|---|
| **Super Mermaid for Confluence** | 頁面**內文**中的 macro | 文件、架構圖、流程說明 |
| **Super Mermaid for Jira** | 議題右側面板 | 議題相關的流程與時序圖 |

> 為什麼是兩個而不是一個：Atlassian 不接受同時支援兩個產品的 app 以免費 listing 上架，
> 拆開才能兩邊都免費提供。兩個都免費，也都沒有用量限制。

---

## 安裝

### 從 Marketplace（一般使用者）

1. 在 Jira 或 Confluence 右上角點 **設定（齒輪）→ Apps → Explore more apps**
2. 搜尋 **Super Mermaid**
3. 點 **Get app**，選擇要安裝的站台，確認權限
4. 完成

需要 **Jira Cloud / Confluence Cloud** 與**管理員權限**。
Data Center 與 Server 版不支援（Forge 是 Cloud 專屬平台）。

### 從原始碼自行部署（開發者）

```powershell
npm install -g @forge/cli
forge login

# Confluence 版
cd confluence
npm run install:all
npm run build
forge deploy
forge install -s <你的站台>.atlassian.net -p confluence

# Jira 版
cd ..
npm run install:all
npm run build
forge deploy
forge install -s <你的站台>.atlassian.net -p jira
```

---

## 使用：Confluence

1. 編輯任一頁面
2. 輸入 **`/Super Mermaid`**，從選單插入
3. 設定面板會跳出來，把 Mermaid 語法貼進去
4. 按 **Save**，圖表就嵌在內文裡了
5. 之後要改：點一下圖表 → **編輯**

圖表原始碼存在 macro 的參數裡，**跟著頁面版本走**——複製頁面時圖表會一起被複製，
回到舊版本也會看到當時的圖。

## 使用：Jira

1. 打開任一議題
2. 右側點 **Super Mermaid** 面板
3. 點 **Source** 展開原始碼欄，貼上語法後按 **Save**
4. 用上方的 **+** 分頁可以在同一張議題放多張圖

圖表存在議題的屬性裡（單張議題上限 32KB，約可放 10 張中型圖）。

## 工具列

兩個 app 共用同一份工具列（Confluence 版是浮動的，滑到圖表上才出現）。

| 按鈕 | 功能 |
|---|---|
| 🔍− `100%` 🔍＋ | 縮小／放大。中間的百分比點一下回到原始大小 |
| ⌖ | 符合視窗（也可以在畫布上雙擊） |
| 🔍 | 在圖表中找文字並跳到該節點，找到後用 `↑` `↓` 在命中之間移動 |
| ⤓ | 匯出：`Download PNG` / `Download SVG` |
| 🔗 | 複製分享連結（圖表編碼在網址裡，開啟後會連到 Atlassian 以外的線上預覽頁；詳見下方說明） |
| ⧉ | 複製 Mermaid 原始碼到剪貼簿 |
| ✏ | **拖拉繪圖模式**（見下一節） |
| `</>` | 顯示／隱藏原始碼欄 |
| 🌙 | 切換深淺配色 |
| ⋯ | 顯示高度：`Auto` / `S` / `M` / `L` / `XL` / `2XL`，或直接輸入像素 |

圖表可以直接用滑鼠拖曳平移、滾輪縮放；觸控裝置支援雙指縮放。

> **沒有全螢幕按鈕，這是刻意的。** app 跑在 iframe 裡，全螢幕只會填滿那個
> iframe 而不是瀏覽器視窗，結果是圖反而縮進小框。要看大一點請用 ⋯ 調顯示高度。

## 使用：拖拉繪圖

不想打字就用拖的 —— 這是市集上其他 Mermaid app 沒有的功能，兩個 app 都有。

1. 按工具列的 **✏**
2. 上方會出現繪圖工具列：選取／平移／加節點／連線、七種常用外形（方框、圓角、
   體育場形、菱形、圓形、六角形、圓柱）、三種線條、復原／重做／刪除／重新排版、
   縮放與符合視窗、手繪風格
3. 在畫布上拖拉編輯，改動會**即時序列化回 Mermaid 原始碼**
4. 按 **Save** 存回議題／頁面

原始碼與拖拉是同一份資料的兩種編輯方式，共用同一條儲存路徑，不會有兩份真相。
**只有 Mermaid 原始碼被存下來**，沒有另外一份 scene 檔。

> Confluence 只在**已發布**的頁面開放繪圖。編輯器裡是草稿，直接寫已發布版本會跟
> 編輯器打架，所以那種情況請用 macro 的設定面板。

---

## 範例：直接複製貼上

### 流程圖

```
flowchart LR
  A[提出需求] --> B{可行?}
  B -- 是 --> C[排入開發]
  B -- 否 --> D[記錄並擱置]
  C --> E[上線]
```

### 時序圖

```
sequenceDiagram
    autonumber
    participant P as 玩家
    participant S as 服務端
    participant T as 三方遊戲商

    P->>S: 進入遊戲(TpId, CustId)
    S->>T: Login API
    T-->>S: 遊戲 URL
    S-->>P: 導向遊戲 URL
    P->>T: 進入遊戲下注
```

### 甘特圖

```
gantt
    title 專案時程
    dateFormat YYYY-MM-DD
    section 設計
      需求訪談      :a1, 2026-08-01, 5d
      介面設計      :a2, after a1, 7d
    section 開發
      後端 API      :b1, after a1, 14d
      前端串接      :b2, after a2, 10d
    section 上線
      驗收          :c1, after b2, 3d
```

### 狀態圖

```
stateDiagram-v2
    [*] --> 待審核
    待審核 --> 已核准: 主管同意
    待審核 --> 已退回: 資料不全
    已退回 --> 待審核: 補件
    已核准 --> [*]
```

支援的圖表類型：flowchart、sequence、class、state、ER、gantt、pie、mindmap、
timeline、user journey、git graph。

---

## 你的資料存在自己的站台裡

這兩個 app 都取得 Atlassian 的 **Runs on Atlassian** 資格，代表：

- **app 自己不對外連線。** 繪圖引擎、字型、所有相依套件都隨 app 打包，不從任何 CDN 載入。
- 圖表內容只存在你自己的 Confluence 頁面或 Jira 議題裡，不經過任何第三方伺服器。
- 兩個 app 要求的權限都只夠存自己的圖表，而且**一律以你登入的身分**發出請求，
  Atlassian 自己的權限模型直接生效：
  - Jira：`read:jira-work` / `write:jira-work`，只用於讀寫本 app 自己的議題屬性
    （`com.markku.super-mermaid.diagrams`）。沒有議題編輯權的人存不進去。
  - Confluence：`read:page:confluence` / `write:page:confluence`，只用於「在檢視頁面
    直接編輯」——讀回**那一頁**、換掉自己 macro 參數裡的原始碼、再寫回去，
    不碰其他頁面。沒有頁面編輯權的人存不進去。

企業環境可以用瀏覽器的開發者工具 Network 面板自行查證：使用過程中不會有任何
對外網域的請求。

> **唯一的例外：工具列的「分享連結」🔗。**
> 按下去會把目前這張圖編碼進一段
> `https://blog.markkulab.net/tools/mermaid-preview#pako:…` 網址，複製到你的剪貼簿。
> app 本身不會送出任何東西（所以 Network 面板還是空的），圖表內容也只放在網址 `#`
> 之後、瀏覽器不會傳給伺服器。但那個預覽頁 **是你 Atlassian 站台以外的外部網站**——
> 連結一旦被貼出去或打開，這張圖就離開了 Atlassian，而且拿到連結的人都看得到。
> 不按這顆按鈕，就不會有任何東西出去。若你的組織不允許，請直接告知團隊不要使用它。

---

## 常見問題

**圖表沒有出現？**
檢查語法第一行是不是合法的圖表類型宣告（`flowchart`、`sequenceDiagram`、`gantt` 等）。
語法有誤時會顯示錯誤訊息而不是空白。

**Confluence 的圖表可以直接在頁面上編輯嗎？**
目前要透過 macro 的設定面板編輯。點圖表 → 編輯即可開啟。

**中文會不會有問題？**
不會。節點文字、標籤、參與者名稱都支援中文。

**可以匯出嗎？**
可以，工具列有 SVG 與 PNG 兩種格式。

**Data Center / Server 版支援嗎？**
不支援。Forge 是 Atlassian Cloud 專屬的開發平台。
