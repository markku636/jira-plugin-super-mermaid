# 上架 Atlassian Marketplace 檢查表

目標：**免費上架**（2026-08-02 決定）。

> ## 現況：2026-08-02 兩份 listing 都已送審
>
> Jira 與 Confluence 兩個 app 都已 `forge deploy -e production`，
> 兩份 Marketplace listing 都已送出審核，**現在是等待審核結果**（約 10–15 個工作天）。
>
> 送審前的三個阻斷項全部解除，包含當初標成 go/no-go 的 M3 視覺編輯器 ——
> 這條原本寫著「M3 完成前不要送審，否則會被以缺乏差異化打回」，已經先做完才送。
>
> 接下來只剩三件事：等結果、被退件就依審查意見修、核准後看安裝數。

要準備的東西：Marketplace 合作夥伴帳號、隱私權政策、End User Terms、支援管道、送審。
個人信箱即可，不必弄公司網域 email。

---

## 阻斷項（全部已解除）

| # | 項目 | 現況 | 說明 |
|---|---|---|---|
| B1 | Marketplace 合作夥伴帳號 | ✅ 已完成 | 送審的前置，沒有它連 listing 都建不了 |
| B2 | app 在真實站台跑過 | ✅ 已完成 | `markku666.atlassian.net`，Jira 與 Confluence 兩個 app 的 development / production 都已部署並安裝驗證 |
| B3 | M3 視覺編輯器 | ✅ 2026-08-02 完成 | **唯一的差異化。** `DrawEditor.tsx`，兩個 app 共用，拖拉結果無損序列化回 mermaid 原始碼 |

## 技術面（程式碼要改的）

- [x] `forge eligibility` 通過 → 拿到 **Runs on Atlassian** 徽章
      徽章代表「app 本身零對外請求」，對企業客戶是信任訊號，
      而且維持它零成本 —— 只要永遠不加 `permissions.external`。
      兩個 app 都 eligible，也證實 `permissions.content.styles: unsafe-inline` 不影響資格。
- [x] 部署到正式環境（兩個 app 各自跑，Confluence 要在 `confluence/` 目錄下）
      ```powershell
      ./deploy.ps1 -Environment production
      cd confluence; forge deploy -e production
      ```
- [x] 在 developer console 啟用 app 分享（sharing），並發布 developer space（`Markku666`）

## 送審要填的資料

**權限說明（我們的故事很乾淨，照抄即可）**

| 項目 | 內容 |
|---|---|
| API scopes（Jira） | `read:jira-work` / `write:jira-work` —— 僅用於讀寫本 app 自己的 issue entity property（`com.markku.super-mermaid.diagrams`），儲存使用者建立的圖表原始碼 |
| API scopes（Confluence） | `read:page:confluence` / `write:page:confluence` —— 僅用於把圖表原始碼寫回該頁面自己的 macro 參數（內文編輯用），不讀寫其他頁面 |
| 遠端主機 | **無。** app 執行期不對外發出任何請求，所有相依套件（mermaid、svg-pan-zoom、字型）皆隨 app 打包 |
| 使用者資料 | 僅儲存使用者自行輸入的圖表文字，Jira 存於 entity property、Confluence 存於 macro 參數，都不離開 Atlassian 基礎設施 |
| 分享按鈕 | 工具列的 🔗 只把一段 `blog.markkulab.net/tools/mermaid-preview#pako:…` 網址寫進剪貼簿（圖表編在 fragment 裡，不觸發任何請求）。**這是 app 唯一的對外路徑，且要使用者主動按下**；文案與隱私權政策都必須寫明它會連到 Atlassian 以外的網站 |

「無遠端主機」這點在審查時是加分項，也正是 Runs on Atlassian 的來源。**任何時候有人想加
`permissions.external`，先想清楚代價是丟掉徽章，也丟掉這個 app 唯一講得清楚的信任賣點。**

**法務／支援欄位**（送審時已全部填妥）

- [x] 隱私權政策 URL —— 用 repo 裡的 [PRIVACY.md](PRIVACY.md)，不必另外架站
- [x] End User Terms / DPA —— 用 Atlassian 範本
- [x] 支援管道 —— GitHub Issues；**承諾 24 小時內回覆**（自我要求，照 Marketplace 的最高標準走）
- [x] 文件 URL —— [GETTING-STARTED.md](GETTING-STARTED.md)

**行銷素材**

- [x] Logo（`resources/logo.svg` + `logo-144.png` + `logo-512.png`，兩個 app 共用）
- [x] 螢幕截圖（`screenshot/processed/jira-panel.webp`、`confluence-inline.webp`）
- [x] 標題與簡述、功能亮點、分類 —— 文案見 [LISTING-COPY.md](LISTING-COPY.md)
- [ ] **主視覺換成「拖拉編輯圖表」的動態畫面** —— 送審用的是靜態截圖。
      M3 已經做完，這是核准後可以立刻補強的第一件事：拖拉的畫面才是唯一能一眼
      區隔另外 8 個競品的東西，靜態渲染截圖跟它們長得一模一樣。
      同理 [LISTING-COPY.md](LISTING-COPY.md) 的描述文案目前主打
      「Runs on Atlassian + 免費」，還沒把視覺編輯器寫進去（送審版即是如此，
      要改請走 listing 更新流程，別直接覆蓋掉已送審的內容而不自知）。

## 時程與後續義務

- 審核約 **10–15 個工作天**（依當時案量浮動），2026-08-02 送出
- production 部署後，在 listing 核准前無法安裝
- 安裝數達 **100+** 後，需符合 Bug Bounty 計畫的安全標準
- 2026-02-20 更新過 Cloud App Security Requirements，每次改版前確認一次最新版

## 送審後的待辦

1. **等審核結果。** 被退件不是意外，依審查意見修完重送即可，只是又是一輪 10–15 天。
2. **核准後第一件事**：把 listing 主視覺換成拖拉編輯的動態畫面，
   並把視覺編輯器寫進描述文案（現在的文案只講 Runs on Atlassian 與免費）。
3. **blog 工具頁**：spec 已寫好放在
   `blog/docs/specs/pending/jira-super-mermaid-tool-page.spec.md`，核准拿到 listing URL 後再做。
