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
> 但「送出去了」不等於「只能等」：下面〈審核期間就該修的〉那幾項是審查者
> 現在點下去就會看到的不一致，跟審核結果無關，現在就能修完。

要準備的東西：Marketplace 合作夥伴帳號、隱私權政策、End User Terms、支援管道、送審。
個人信箱即可，不必弄公司網域 email。

---

## 阻斷項（送審前，全部已解除）

| # | 項目 | 現況 | 說明 |
|---|---|---|---|
| B1 | Marketplace 合作夥伴帳號 | ✅ 已完成 | 送審的前置，沒有它連 listing 都建不了 |
| B2 | app 在真實站台跑過 | ✅ 已完成 | `markku666.atlassian.net`，Jira 與 Confluence 兩個 app 的 development / production 都已部署並安裝驗證 |
| B3 | M3 視覺編輯器 | ✅ 2026-08-02 完成 | **唯一的差異化。** `DrawEditor.tsx`，兩個 app 共用，拖拉結果無損序列化回 mermaid 原始碼 |

## 審核期間就該修的（不等結果，現在做）

- [ ] **B4　Confluence 的權限說法跟 manifest 對不起來 —— 最可能被退件的一項**
      `confluence/manifest.yml` 實際宣告了 `read:page:confluence` 與
      `write:page:confluence`（內文直接編輯要用，走 REST 讀回 ADF 再寫回去），但
      [PRIVACY.md](PRIVACY.md) 的 Permissions 段寫著
      「requests **no API scopes at all**. It never calls a Confluence API」，
      [LISTING-COPY.md](LISTING-COPY.md) 的 Confluence 描述也寫
      「It requests no Confluence API permissions at all」。
      使用者安裝時的同意畫面會把這兩個 scope 明白列出來，跟隱私權政策正面打架 ——
      這正是審查會抓、也應該被抓的類型。
      三處一起改：manifest 註解、PRIVACY 的 Permissions 段、listing 描述。
      下面〈送審要填的資料〉那張表反而是對的，照它的說法寫。
- [ ] **B5　改好的隱私權政策還沒 commit，審查者現在看到的是舊版**
      listing 的 Privacy policy 與 Documentation 兩個欄位都指向 GitHub `main` 的 blob，
      但「分享按鈕會產生站外連結」那段說明目前只在本機工作目錄（未 commit、未 push）。
      線上那份還寫著 `No data leaves your Atlassian site` 這種絕對句，
      而 app 確實有一顆會產生 `blog.markkulab.net` 連結的按鈕 ——
      **說法與行為不一致就是退件理由**，而這件事 commit + push 就解決。
- [ ] 確認 GitHub repo 是 **public**。隱私權政策、文件、支援三個欄位全指向它，
      repo 只要是 private，審查者三個連結一次全開不了。
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

- [ ] repo 根目錄**沒有 LICENSE 檔**。public repo 沒有授權檔等於保留所有權利，別人不能合法 fork，
      跟「開源讓你自己查證我沒偷傳資料」的立場自相矛盾。挑一個補上
- [ ] `THIRD-PARTY-NOTICES`：這個 app 是把 mermaid、d3、svg-pan-zoom、字型
      **整包打進 bundle 出貨**的，逐一確認授權允許再散布，並列出來
- [ ] **`static/panel/public/Virgil.woff2` 的授權要單獨確認。**
      字型「自己用」跟「隨產品散布給別人」是兩件事，
      而它正是為了不連 jsDelivr 才被收進 bundle 的
- [ ] app 名稱裡的 "Mermaid" 是第三方 OSS 專案名 ——
      listing 描述與 README 各放一行「非 mermaid-js 官方作品」，成本一行，省掉爭議

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
- [ ] **主視覺換成「拖拉編輯圖表」的動態畫面** —— 送審用的是靜態截圖。
      M3 已經做完，這是核准後可以立刻補強的第一件事：拖拉的畫面才是唯一能一眼
      區隔另外 8 個競品的東西，靜態渲染截圖跟它們長得一模一樣。
      同理 [LISTING-COPY.md](LISTING-COPY.md) 的描述文案目前主打
      「Runs on Atlassian + 免費」，還沒把視覺編輯器寫進去（送審版即是如此，
      要改請走 listing 更新流程，別直接覆蓋掉已送審的內容而不自知）。

## 時程

- 審核約 **10–15 個工作天**（依當時案量浮動），2026-08-02 送出
- production 部署後，在 listing 核准前無法安裝
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
