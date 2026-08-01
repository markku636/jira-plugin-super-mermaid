# 上架 Atlassian Marketplace 檢查表

目標：**先以免費名義上架**（2026-08-02 決定）。付費留待之後再說。

> **先看這句**：書面作業（合作夥伴帳號、隱私權政策）可以現在就平行進行，
> 但**在 M3 視覺編輯器完成之前不要送審**。目前的功能與市集上 8 個競品完全重疊，
> 會被以「缺乏差異化」打回，重送要再等一輪 10–15 個工作天。

## 免費 vs 付費：這個決定省掉什麼

選免費之後，下列項目**全部不需要**：

- ❌ 公司網域 email —— 私有網域只在「付費 app 的 Partner Portal 存取權」被要求，
  免費 app 用 hotmail 即可。`apps@markkulab.net` 現階段不必弄。
- ❌ `app.licensing.enabled` 與授權閘門程式碼 —— 免費 app 的 `license` 物件是 undefined
- ❌ 稅務與收款資訊
- ❌ 「production 每次安裝都計費」的顧慮

還是要的：合作夥伴帳號、隱私權政策、End User Terms、支援管道、送審。

**之後想改成付費**：可行，但會影響既有安裝者，且要補齊上面整組。
所以先靠免費把安裝數與評價養起來，是合理的順序。

---

## 阻斷項（不解決就無法進行）

| # | 項目 | 現況 | 說明 |
|---|---|---|---|
| B1 | ~~公司網域 email~~ | ✅ 免除 | 改走免費後不再需要 |
| B2 | **Marketplace 合作夥伴帳號** | ❌ 未申請 | 需簽 Marketplace Partner Agreement。免費 app 用現有 hotmail 即可 |
| B3 | **app 從未在真實 Jira 跑過** | ❌ | 需要有效的 **Forge scoped token**：https://go.atlassian.com/forge-cli-api-token（舊式無 scope 的 token 會回 "API token is no longer valid"）。之後跑 `.\deploy.ps1 -Install` |
| B4 | **M3 視覺編輯器** | ❌ 未開始 | **唯一的差異化。** 沒有它，這就是市集上第 9 個一樣的 mermaid 渲染器 |

## 技術面（程式碼要改的）

- [ ] `forge eligibility` 通過 → 拿到 **Runs on Atlassian** 徽章
      免費 app 沒有營收要分，但徽章代表「零對外傳輸」，對企業客戶是信任訊號，
      而且維持它是免費的 —— 只要永遠不加 `permissions.external`。
- [ ] 部署到正式環境
      ```powershell
      forge deploy -e production
      ```
- [ ] 在 developer console 啟用 app 分享（sharing），並發布 developer space

> 授權（licensing）相關工作**免費 app 不需要**。之後若改付費，要補上
> `app.licensing.enabled: true`、`context.license.active` 閘門，
> 並用 `forge install --license active|inactive|trial` 測三種狀態。
> 建議屆時的策略是「檢視免費、視覺編輯付費」，讓未付費者仍看得到圖以形成擴散。

## 送審要填的資料

**權限說明（我們的故事很乾淨，照抄即可）**

| 項目 | 內容 |
|---|---|
| API scopes | `read:jira-work` / `write:jira-work` —— 僅用於讀寫本 app 自己的 issue entity property（`com.markku.super-mermaid.diagrams`），儲存使用者建立的圖表原始碼 |
| 遠端主機 | **無。** 本 app 不對外傳送任何資料，所有相依套件（mermaid、svg-pan-zoom、字型）皆隨 app 打包 |
| 使用者資料 | 僅儲存使用者自行輸入的圖表文字，存放於 Atlassian 託管的 entity property，不離開 Atlassian 基礎設施 |

「無遠端主機」這點在審查時是加分項，也正是 Runs on Atlassian 的來源。**任何時候有人想加
`permissions.external`，先想清楚代價是整份營收分潤。**

**法務／支援欄位**

- [ ] 隱私權政策 URL（可掛在 markkulab.net 底下）
- [ ] End User Terms / DPA —— Atlassian 有提供可改的範本，直接用
- [ ] 支援管道與**承諾 24 小時內回覆**（這是付費 app 的要求，不是建議）
- [ ] 文件 URL

**行銷素材**

- [ ] Logo、橫幅、螢幕截圖
- [ ] 標題與簡述、功能亮點、分類
- [ ] **主視覺一定要是「拖拉編輯圖表」的動態畫面** —— 那是唯一能一眼區隔競品的東西。
      靜態的渲染截圖跟其他 8 個 app 長得一模一樣。

## 定價

**現階段：Free。**

之後若要改付費，先記住這些限制：

- 只能選 **Free** 或 **Paid via Atlassian**（cloud app 不能自行收款）
- 計價是階梯制：**≤10 人固定月費 + 11 人以上按人頭**，不是一次買斷
- 原本設想的目標是最小級距 US$5/月
- 屆時才需要公司網域 email（Partner Portal 存取權）與稅務收款資訊

## 時程與後續義務

- 審核約 **10–15 個工作天**（依當時案量浮動）
- production 部署後，在 listing 核准前無法安裝
- 安裝數達 **100+** 後，需符合 Bug Bounty 計畫的安全標準
- 2026-02-20 更新過 Cloud App Security Requirements，送審前確認一次最新版

## 建議順序

1. **現在就開始**（有前置時間，且不依賴程式碼）：B1 公司信箱 → B2 合作夥伴帳號 → 隱私權政策
2. **平行進行**：B3 部署到開發站台，把 M1/M2 實際驗證過
3. **關鍵路徑**：B4 視覺編輯器
4. M3 完成後再做行銷素材（因為主視覺要錄視覺編輯的畫面）
5. 最後才 `forge deploy -e production` 並送審
