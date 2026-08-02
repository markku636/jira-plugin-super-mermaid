# Super Mermaid — 安裝與使用

用文字語法畫流程圖、時序圖、甘特圖，直接畫在 Jira 議題與 Confluence 頁面裡。

分成兩個獨立的 app，各自安裝：

| App | 位置 | 用途 |
|---|---|---|
| **Super Mermaid for Confluence** | 頁面**內文**中的 macro | 文件、架構圖、流程說明 |
| **Super Mermaid for Jira** | 議題右側面板 | 議題相關的流程與時序圖 |

> 為什麼是兩個而不是一個：Atlassian 規定同時支援兩個產品的 app 只能付費上架。
> 拆開才能兩邊都免費。

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

| 按鈕 | 功能 |
|---|---|
| `−` `+` `Fit` `1:1` | 縮放與符合視窗 |
| 搜尋框 `↑` `↓` | 在圖表中找文字並跳到該節點 |
| `SVG` `PNG` | 匯出圖檔 |
| `Source` | 顯示／隱藏原始碼（僅 Jira） |
| `Dark` `Light` | 切換深淺配色 |
| `⛶` | 全螢幕 |

圖表可以直接用滑鼠拖曳平移、滾輪縮放；觸控裝置支援雙指縮放。

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

## 你的資料不會離開 Atlassian

這兩個 app 都取得 Atlassian 的 **Runs on Atlassian** 資格，代表：

- **零對外連線。** 繪圖引擎、字型、所有相依套件都隨 app 打包，不從任何 CDN 載入。
- 圖表內容只存在你自己的 Confluence 頁面或 Jira 議題裡，不經過任何第三方伺服器。
- Confluence 版**連 API 權限都不需要**——它不呼叫任何 Confluence API。

企業環境可以用瀏覽器的開發者工具 Network 面板自行查證：使用過程中不會有任何
對外網域的請求。

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
