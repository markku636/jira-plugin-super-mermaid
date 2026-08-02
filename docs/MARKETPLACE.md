# 上架 Atlassian Marketplace 檢查表

目標：**先以免費名義上架**（2026-08-02 決定）。付費留待之後再說。

> ## 現況：2026-08-02 兩份 listing 都已送審
>
> Jira 與 Confluence 兩個 app 都已 `forge deploy -e production`，
> 兩份 Marketplace listing 都已送出審核，**現在是等待審核結果**（約 10–15 個工作天）。
>
> 送審前的四個阻斷項全部解除，包含當初標成 go/no-go 的 M3 視覺編輯器 ——
> 這條原本寫著「M3 完成前不要送審，否則會被以缺乏差異化打回」，已經先做完才送。
>
> 接下來只剩三件事：等結果、被退件就依審查意見修、核准後看安裝數。

## 免費 vs 付費：這個決定省掉什麼

選免費之後，下列項目**全部不需要**：

- ❌ 公司網域 email —— 私有網域只在「付費 app 的 Partner Portal 存取權」被要求，
  免費 app 用個人信箱即可。`apps@markkulab.net` 現階段不必弄。
- ❌ `app.licensing.enabled` 與授權閘門程式碼 —— 免費 app 的 `license` 物件是 undefined
- ❌ 稅務與收款資訊
- ❌ 「production 每次安裝都計費」的顧慮

還是要的：合作夥伴帳號、隱私權政策、End User Terms、支援管道、送審。

**之後想改成付費**：可行，但會影響既有安裝者，且要補齊上面整組。
所以先靠免費把安裝數與評價養起來，是合理的順序。

---

## 阻斷項（全部已解除）

| # | 項目 | 現況 | 說明 |
|---|---|---|---|
| B1 | ~~公司網域 email~~ | ✅ 免除 | 改走免費後不再需要 |
| B2 | Marketplace 合作夥伴帳號 | ✅ 已完成 | 送審的前置，沒有它連 listing 都建不了 |
| B3 | app 在真實站台跑過 | ✅ 已完成 | `markku666.atlassian.net`，Jira 與 Confluence 兩個 app 的 development / production 都已部署並安裝驗證 |
| B4 | M3 視覺編輯器 | ✅ 2026-08-02 完成 | **唯一的差異化。** `DrawEditor.tsx`，兩個 app 共用，拖拉結果無損序列化回 mermaid 原始碼 |

## 技術面（程式碼要改的）

- [x] `forge eligibility` 通過 → 拿到 **Runs on Atlassian** 徽章
      免費 app 沒有營收要分，但徽章代表「零對外傳輸」，對企業客戶是信任訊號，
      而且維持它是免費的 —— 只要永遠不加 `permissions.external`。
      兩個 app 都 eligible，也證實 `permissions.content.styles: unsafe-inline` 不影響資格。
- [x] 部署到正式環境（兩個 app 各自跑，Confluence 要在 `confluence/` 目錄下）
      ```powershell
      ./deploy.ps1 -Environment production
      cd confluence; forge deploy -e production
      ```
- [x] 在 developer console 啟用 app 分享（sharing），並發布 developer space（`Markku666`）

> 授權（licensing）相關工作**免費 app 不需要**。之後若改付費，要補上
> `app.licensing.enabled: true`、`context.license.active` 閘門，
> 並用 `forge install --license active|inactive|trial` 測三種狀態。
> 建議屆時的策略是「檢視免費、視覺編輯付費」，讓未付費者仍看得到圖以形成擴散。

## 送審要填的資料

**權限說明（我們的故事很乾淨，照抄即可）**

| 項目 | 內容 |
|---|---|
| API scopes（Jira） | `read:jira-work` / `write:jira-work` —— 僅用於讀寫本 app 自己的 issue entity property（`com.markku.super-mermaid.diagrams`），儲存使用者建立的圖表原始碼 |
| API scopes（Confluence） | `read:page:confluence` / `write:page:confluence` —— 僅用於把圖表原始碼寫回該頁面自己的 macro 參數（內文編輯用），不讀寫其他頁面 |
| 遠端主機 | **無。** 本 app 不對外傳送任何資料，所有相依套件（mermaid、svg-pan-zoom、字型）皆隨 app 打包 |
| 使用者資料 | 僅儲存使用者自行輸入的圖表文字，Jira 存於 entity property、Confluence 存於 macro 參數，都不離開 Atlassian 基礎設施 |

「無遠端主機」這點在審查時是加分項，也正是 Runs on Atlassian 的來源。**任何時候有人想加
`permissions.external`，先想清楚代價是整份營收分潤。**

**法務／支援欄位**（送審時已全部填妥）

- [x] 隱私權政策 URL —— 用 repo 裡的 [PRIVACY.md](PRIVACY.md)，不必另外架站
- [x] End User Terms / DPA —— 用 Atlassian 範本
- [x] 支援管道 —— GitHub Issues；**承諾 24 小時內回覆**（付費 app 的硬要求，免費也照這個標準走）
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

## 定價

**現階段：Free。**

之後若要改付費，先記住這些限制：

- 只能選 **Free** 或 **Paid via Atlassian**（cloud app 不能自行收款）
- 計價是階梯制：**≤10 人固定月費 + 11 人以上按人頭**，不是一次買斷
- 原本設想的目標是最小級距 US$5/月
- 屆時才需要公司網域 email（Partner Portal 存取權）與稅務收款資訊

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
4. **之後想改付費**：可行但會影響既有安裝者，且要補齊公司網域 email、
   `app.licensing.enabled` 與授權閘門、稅務收款資訊。
   屆時的策略建議是「檢視免費、視覺編輯付費」，讓未付費者仍看得到圖以形成擴散。
