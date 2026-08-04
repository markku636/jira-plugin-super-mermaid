# 上架 Atlassian Marketplace 檢查表

目標：**免費上架**（2026-08-02 決定）。

> ## 現況：2026-08-04 listing 還沒建立，送審尚未開始
>
> Jira 與 Confluence 兩個 app 都已 `forge deploy -e production` 並在
> `markku666.atlassian.net` 驗證過 —— **技術面備妥，但 Marketplace 上一份 listing 都沒有。**
>
> 08-02 這份文件曾寫著「兩份 listing 都已送審」。那是**沒有憑證的斷言**：
> 08-04 登入合作夥伴後台（vendor `Mark ku` / id `256255156`）看到的是 `No apps`，
> repo 裡也找不到任何 listing id 或後台截圖。10–15 個工作天的鐘從未開始走。
>
> **紀錄規則（別再犯）：拿到 listing id（`marketplace.atlassian.com/manage/apps/<id>`）
> 之前，狀態一律寫「未送審」。** 建立 listing 與送審只能由人在網頁後台完成，
> Forge CLI 沒有這個指令，自動化也碰不到 —— 所以這一步的狀態永遠只能靠人回填。
>
> 送審材料已打包在 [../submission/](../submission/)：逐欄文案 + logo + 截圖 + 檢查清單。

要準備的東西：Marketplace 合作夥伴帳號、隱私權政策、End User Terms、支援管道、送審。
個人信箱即可，不必弄公司網域 email。

---

## 阻斷項（技術面已全部解除）

| # | 項目 | 現況 | 說明 |
|---|---|---|---|
| B1 | Marketplace 合作夥伴帳號 | ✅ 已完成 | vendor `Mark ku`（id `256255156`）。⚠️ 後台必須用 **`a4756830@gmail.com`** 登入 —— 用公司帳號登入會看到另一個空的 vendor profile，`Create app` 的清單裡也找不到這兩個 Forge app |
| B2 | app 在真實站台跑過 | ✅ 已完成 | `markku666.atlassian.net`，Jira 與 Confluence 兩個 app 的 development / production 都已部署並安裝驗證 |
| B3 | M3 視覺編輯器 | ✅ 2026-08-02 完成 | **唯一的差異化。** `DrawEditor.tsx`，兩個 app 共用，拖拉結果無損序列化回 mermaid 原始碼 |

## 送審前要修的

- [x] **B4　Confluence 的權限說法跟 manifest 對不起來 —— 2026-08-04 已修**
      `confluence/manifest.yml` 實際宣告 `read:page:confluence` 與
      `write:page:confluence`（內文直接編輯要用，`savePageMacro.ts` 走 `requestConfluence`
      讀回 ADF 再寫回去，以登入使用者身分、只碰當前那一頁），但當時
      [PRIVACY.md](PRIVACY.md) 寫著「requests **no API scopes at all**」、
      [LISTING-COPY.md](LISTING-COPY.md) 寫著「It requests no Confluence API permissions
      at all」，連 manifest 自己的註解都還寫「刻意沒有 permissions.scopes」。
      安裝同意畫面會把兩個 scope 列給使用者看，跟隱私權政策正面打架 ——
      典型退件理由。已四處一起改：manifest 註解、PRIVACY 的 Permissions 段、
      listing 描述、本檔。**未來改 scope 一律同步這四處。**
- [x] **B5　隱私權政策的站外連結揭露已 push**
      「分享按鈕會產生 `blog.markkulab.net` 連結」那段已在 `95e43c7` 進 `main`，
      GitHub 上那份是新版（08-04 核對過 `main` 與 `origin/main` 齊平）。
- [x] GitHub repo 是 **public**（08-04 以 API 核對 `private: false`）。
      隱私權政策、文件、支援三個欄位全指向它，private 會讓審查者三個連結一次全開不了。
- [ ] （核准後再做）把隱私權政策與文件搬到 blog 的固定網址。
      GitHub blob URL 會隨 repo 改名、搬家、預設分支更名而死，
      而 listing 上的死連結是要走更新流程才能修的東西。

## 技術面（送審前已完成）

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

## 每次改版的固定流程（兩個 app 各跑一次）

- [ ] `npm run typecheck` —— 根 `tsconfig.json` **絕不能設 `noEmit: true`**，
      Forge 用 ts-loader 打包 `src/`，設了會以「TypeScript emitted no output」部署失敗
- [ ] `npm run lint`（= `forge lint`）
- [ ] `npm run eligibility`（= `forge eligibility`）—— 改過 manifest 或升級過 lib 就一定要跑
- [ ] development 環境部署，在 `markku666.atlassian.net` 實際點過
- [ ] production 部署。Jira 有 `deploy:prod` script，**Confluence 沒有**，
      要手打 `forge deploy -e production`（或去 `confluence/package.json` 補上這條）
- [ ] 在 Marketplace 後台建新版本、寫 release notes
- 版本號兩個 app 各自算（現在 Jira `0.2.0`、Confluence `0.1.0`）。不必對齊成同一號 ——
  對齊只會生出「這版其實沒改任何東西」的空版本
- ⚠️ **新增 scope 的版本，已安裝站台的管理員要重新同意才會升級**，
  沒同意的站台會停在舊版。加 scope 前先確定真的必要

## 維持 Runs on Atlassian 的紅線（每次 PR 都要看）

- [ ] manifest 沒有 `permissions.external`、`remotes`、`providers`、dynamic web trigger、
      Connect 模組 —— 失格條件只有這幾項
- [ ] **升級 `react-super-mermaid` 之後重新確認**：`fontUrl="./Virgil.woff2"` 還在、
      mermaid 與 svg-pan-zoom 仍以 `{{instance}}` 明確注入。
      lib 的預設字型指向 jsDelivr，相依套件的第三段 fallback 也是 CDN ——
      **升級 lib 是最可能在沒人察覺的情況下把 CDN 引回來的路徑**
- [ ] 用 DevTools Network 面板實際看一遍：整段操作零外部網域請求
      （這同時就是 listing 那張「Network 面板空空如也」的截圖素材）
- `permissions.content.styles: unsafe-inline` **不影響資格**（兩個 app 的 eligibility 已實證）。
  不必為了徽章去拔它，拔掉反而會讓 mermaid 塞進 SVG 的 `<style>` 全被擋掉

## 授權與第三方素材（沒人催，但被抓到很麻煩）

- [x] repo 根目錄的 LICENSE **已補（MIT，2026-08-04）**。挑 MIT 是為了跟
      `react-super-mermaid`（MIT）一致；要換別的授權現在換成本最低。
      public repo 沒有授權檔等於保留所有權利，別人不能合法 fork，
      跟「開源讓你自己查證我沒偷傳資料」的立場自相矛盾
- [x] `THIRD-PARTY-NOTICES.md` **已寫（2026-08-04）**：mermaid 11.16.0 MIT、
      react-super-mermaid 0.6.87 MIT、svg-pan-zoom 3.6.2 BSD-2、react/react-dom 18.3.1 MIT、
      d3 7.9.0 ISC、cytoscape 3.34.0 MIT、DOMPurify 3.4.12 MPL-2.0/Apache-2.0、
      KaTeX 0.16.47 MIT —— 版本是對 `static/panel/node_modules` 實查的，全部允許再散布
- [x] **`Virgil.woff2` 的授權已查清：SIL Open Font License 1.1，允許隨軟體 bundle 與散布。**
      來源 [excalidraw/virgil](https://github.com/excalidraw/virgil)。Excalidraw 後來換成
      Excalifont 是為了可讀性、不是授權問題（兩者都是 OFL-1.1）。
      字型「自己用」跟「隨產品散布」本來是兩件事，這條確認過就不再是風險
- [x] app 名稱裡的 "Mermaid" 是第三方 OSS 專案名 —— `THIRD-PARTY-NOTICES.md` 的
      Trademarks 段已寫明「非 mermaid-js 官方作品」。listing 描述要不要也放一行由你決定

## 常見退件原因自我檢查（審查者會做的事，先自己做一遍）

- [ ] 描述講的功能，安裝後都真的找得到
      （現行文案沒提視覺編輯器，那是「少講」不是「多講」，安全）
- [ ] 截圖是真實 UI：沒有 mock、沒有未上線功能、沒有真實客戶資料或可辨識的人名
- [ ] 權限說明 = manifest 的實際 scope（見 B4，目前不一致）
- [ ] 隱私權政策 / 文件 / 支援三個 URL，用**未登入的瀏覽器**各開一次
- [ ] 支援管道真的有人在看 —— 承諾 24 小時回覆，GitHub Issues 的通知就要開著
- [ ] 拿一個**乾淨的站台**（不是開發用的那個）從安裝走到出圖。
      開發站台留著舊版本、舊資料與既有權限，測不出真實的首次安裝體驗
- [ ] 免費 listing 裡沒有任何付費升級、試用、聯絡業務的暗示

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
- [x] **主視覺放「拖拉編輯圖表」的畫面 —— 2026-08-04 已產出**
      `hl-jira-2-draw` / `hl-conf-2-draw`（1840×900 ＋ 580×330），拍的是當前程式碼
      跑出來的真實編輯器。拖拉畫面是市集上另外 8 個 app 都沒有的東西，第一版就放。
      因為 listing 還沒建立，這件事不必等核准、也不必走更新流程 —— 08-02 那條
      「送審版文案沒寫視覺編輯器，要改得走更新流程」的限制隨著「其實沒送審」一起消失。
      六張必填 highlight 加四張圖庫補充都在 `submission/images/`，
      產生腳本 [../submission/scripts/make-listing-images.mjs](../submission/scripts/make-listing-images.mjs)。
      **改過面板 UI 就重跑那支**，否則截圖會再次與實際 UI 不符。
- [ ] 描述文案要不要補上視覺編輯器 —— 段落已備在
      [../submission/SUBMIT-SHEET.md](../submission/SUBMIT-SHEET.md) 的〈選配〉區塊，由你決定。

## 時程

- 審核約 **10–15 個工作天**（依當時案量浮動），**從送出那天起算 —— 目前尚未送出**
- production 部署後，在 listing 核准前無法從 Marketplace 安裝
  （`forge install` 走的是另一條路，不受影響）
- **被退件不是意外。** 依審查意見修完重送即可，代價是再等一輪 10–15 天

## 核准之後

**T+0（拿到 listing 當天）**

- [ ] 記下兩個 listing URL，回填 [README](../README.md) 與 [GETTING-STARTED.md](GETTING-STARTED.md)
- [ ] 主視覺換成拖拉編輯的動態畫面
- [ ] 描述文案補上視覺編輯器（走 listing 更新流程）
- [ ] 自己從 Marketplace 真的安裝一次 —— 跟 `forge install` 是兩條路，
      第一次上架務必親自走過公開路徑

**T+7**

- [ ] blog 工具頁 —— spec 已寫好：`blog/docs/specs/pending/jira-super-mermaid-tool-page.spec.md`
- [ ] 互導流：`react-super-mermaid` 的 README、VS Code 擴充頁、blog 三處都放 Marketplace 連結。
      三個宿主互相導流是免費 app 唯一不花錢的流量來源
- [ ] Atlassian Community 發一篇（可選）

**T+30**

- [ ] 看後台 analytics：安裝數、移除率、評論
- [ ] **評論一律回。** 免費 app 沒有業務也沒有廣告，評分就是全部的信任來源
- [ ] 移除率若偏高，先查是不是卡在「Confluence 要進設定面板才能編輯」這類第一次體驗問題

## 長期義務

- [ ] 安裝數達 **100+** 後，需符合 Bug Bounty 計畫的安全標準（逼近 100 之前先把要求讀完）
- [ ] Cloud App Security Requirements：2026-02-20 更新過一版，**每次改版前確認一次最新版**
- [ ] 相依套件 CVE：`static/panel` 的依賴很深（mermaid 拖著整組 d3），
      開 Dependabot 或排定期 `npm audit`，別等使用者回報
- [ ] Forge 平台淘汰公告：runtime 現在是 `nodejs22.x`。Atlassian 會強制淘汰舊 runtime，
      屆時**不重新部署就會停擺**，跟你有沒有在改程式無關
- [ ] 使用者會踩到的限制寫進 FAQ：Jira entity property 單筆 32KB、每 app 100 筆；
      Confluence 草稿頁不開放繪圖（會跟編輯器打架）

## 刻意不做的事（有人提議時的標準答案）

| 提議 | 答案 |
|---|---|
| 加 `permissions.external` 或任何 CDN | **不做。** 丟掉 Runs on Atlassian = 丟掉這個 app 唯一講得清楚的賣點 |
| 合併成一個跨產品 app | **不做。** 跨產品 app 不支援免費 listing，合併就必須收費 |
| 改成收費 | 現在不做。要多出公司網域 email、授權閘門、稅務、production 計費四件事 |
| 申請 Cloud Fortified | 現在不做。門檻遠高於一人維護的免費 app（大致是 Bug Bounty + 24/7 支援 + 可靠度承諾，確切要求以官方頁為準），先看安裝數再說 |
| 支援 Data Center / Server | **不做。** Forge 是 Cloud 專屬平台 |
