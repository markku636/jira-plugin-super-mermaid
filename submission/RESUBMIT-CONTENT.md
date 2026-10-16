# 退件後重送 — 逐欄文案（兩份 listing）

> 2026-08-06。兩份 listing 都被自動退件，理由都是
> `Automatic Rejection - Not enough details on listing`。
>
> - Jira：`463339441`（2.7.0 PUBLIC by Ku Mark／2.8.0 PRIVATE by Marketplace Hub）
> - Confluence：`1739220856`（3.3.0 PUBLIC by Ku Mark／3.4.0 PRIVATE by Marketplace Hub）
>
> **版本列的 `PUBLIC` 不代表已上架。** app 層級的審核狀態才是關鍵，被退件時公開頁與
> 公開 REST API（`/rest/2/addons/<key>`）都查不到這個 app。08-06 用 API 實測 404。

---

## 一、真正的原因（2026-08-06 已確認）

`/manage/apps/<id>/versions/<build>/highlights` 的版型選的是 **`Basic`** ——
「No info needed. We will populate the basic details of your app」。
也就是**完全沒有 hero 圖、沒有 highlight、沒有 caption**，listing 上除了文字什麼都沒有。
`Not enough details on listing` 就是字面意思。

### 修法

該頁四個版型改選 **`Hero & highlights`**（第四張，「Add hero image and up to 3 highlights
with captions and details」）→ `Save` → 才會出現 hero 與 3 組 highlight 的欄位，
再照第二節貼。

⚠️ 這頁是**逐版本**的（網址帶 build number）。要 public 哪個版本，就在那個版本設 highlight，
別在 3.3.0 設完卻去 public 3.4.0。

### 其他兩個候選（highlight 補完後若還被退，再往這查）

#### 把 Marketplace Hub 那個版本設為 public

送審時 Atlassian 會生兩個版本：一個 `Released by Ku Mark`（你送的），
一個 `Released by Marketplace Hub [Atlassian]`（平台生的）。
[社群有人踩過同一個退件訊息](https://community.developer.atlassian.com/t/marketplace-submission-lacks-details/67911)，
反覆改文案都沒用，最後是把 **Marketplace Hub 那個版本**設為 public 才過。

我們兩份的版本結構跟那篇完全一樣，所以這條要試：`⋯` → 設為 public，對象是
Jira 的 `2.8.0` 與 Confluence 的 `3.4.0`。這件事官方文件沒寫，那篇的原作者說
「documented nowhere btw」。

#### Partner Verification 與 payout profile 沒完成

[另一篇](https://community.developer.atlassian.com/t/marketplace-app-listing-instantly-rejected-by-plugin-checker-with-no-reason-forge-jira-cloud/99247)
的即時退件跟 listing 內容無關，是**帳號層級**的 Marketplace Partner Verification 與
付款資料未完成。免費 app 理論上不需要 payout，但那位作者實測 Plugin Checker 兩者都要求。
後台 `Details`／vendor profile 看有沒有未完成的驗證流程。

> 三項都排除還是被退，就走 Marketplace Ecosystem 支援單請人看實際的檢查失敗項 ——
> 退件信裡有 ticket 編號，那是唯一能拿到具體原因的路。

---

## 二、Hero ＋ 3 組 Highlights（選了 `Hero & highlights` 之後照貼）

Hero 放**拖拉編輯器**，因為那是市集上另外 8 個 Mermaid app 都沒有的東西，
第一眼就該看到它。所以 3 組 highlight 裡不再重複放 draw，第三格改用圖庫那張。

### Super Mermaid for Jira

**Hero 圖**：`hl-jira-2-draw-1840x900.png`（欄位若要求別的尺寸就用 `-580x330.png`）

| # | 標題（≤50） | 說明（≤220） | 圖 |
|---|---|---|---|
| 1 | `Diagrams on the issue` | Write a few lines of Mermaid and get a diagram on the issue itself. Pan, zoom, search for a node and export to SVG or PNG without leaving Jira. | `hl-jira-1-panel-1840x900.png` ＋ `-580x330.png` |
| 2 | `Several diagrams per issue` | Add a tab per diagram: the deployment flow, the sequence between services, the rollout plan. Diagrams are stored on the issue, so they follow your existing Jira permissions and backups. | `hl-jira-3-tabs-*` |
| 3 | `Four diagram types on one issue` | One issue, four diagram types side by side: a flowchart, a sequence diagram, a state machine and a Gantt chart, each on its own tab. | `gal-jira-4-types-*` |

### Super Mermaid for Confluence

**Hero 圖**：`hl-conf-2-draw-1840x900.png`

| # | 標題（≤50） | 說明（≤220） | 圖 |
|---|---|---|---|
| 1 | `Diagrams inside your page` | The macro renders in the page body, not as an attached image. Source lives in the macro parameter, so it follows page versioning: copy the page and the diagram comes with it. | `hl-conf-1-inline-*` |
| 2 | `11 diagram types` | Flowchart, sequence, class, state, ER, Gantt, pie, mindmap, timeline, user journey and git graph, all rendered by the Mermaid engine bundled inside the app. Labels support Chinese, Japanese and Korean. | `hl-conf-3-types-*` |
| 3 | `Gantt charts in the page body` | A Gantt chart rendered inline in a Confluence page, sitting in the text flow rather than beside it. Timelines, sections and dependencies all render from a few lines of Mermaid. | `gal-conf-4-gantt-*` |

字數都在上限內（標題最長 31/50，說明最長 201/220）。

如果 hero 那格你想留給 draw 之外的東西，就把 draw 換回 highlight 第一格、hero 改用
`banner-{jira,confluence}-1120x548.png`，文案在上一版的表裡（git history）。

---

## 三、圖庫截圖的 caption（選填的圖也要有 caption 才算完整）

| 檔案 | Caption |
|---|---|
| `gal-jira-4-types-*` | One issue, four diagram types side by side: a flowchart, a sequence diagram, a state machine and a Gantt chart, each on its own tab. |
| `gal-jira-5-source-*` | Switch to Source to edit the Mermaid text directly. The canvas and the source are two views of the same diagram. |
| `gal-jira-6-dark-*` | The panel follows your Jira theme. Diagram colours, labels and the grid all adapt to dark mode. |
| `gal-conf-4-gantt-*` | A Gantt chart rendered inline in a Confluence page, sitting in the text flow rather than beside it. |

**不確定 caption 要不要填就填。** 這次退件的字面理由就是 details 不足，留白只有壞處。

---

## 四、Banner（Page design 必填）

| listing | 檔案 |
|---|---|
| Jira | `banner-jira-1120x548.png` ＋ `banner-jira-560x274.png` |
| Confluence | `banner-confluence-1120x548.png` ＋ `banner-confluence-560x274.png` |

---

## 五、其他欄位不用改

`About app` 的 tagline／summary／More details 都已接近上限（Jira 962/1000、
Confluence 982/1000），**不是這裡不足**。值在
[VERSION-STEP-JIRA.md](VERSION-STEP-JIRA.md) 與
[ABOUT-STEP-CONFLUENCE.md](ABOUT-STEP-CONFLUENCE.md)，重填時照抄。

三個 GitHub URL 也再用未登入的瀏覽器開一次 ——
`Automatic Rejection - Invalid Links` 是另一個獨立的自動退件理由，別一次踩兩個。

---

## 六、重送順序

1. `versions/<build>/highlights` 版型從 `Basic` 改成 **`Hero & highlights`** → `Save`
2. 貼 hero 圖 ＋ 3 組 highlight 的標題／說明／圖（第二節）
3. `Media` 分頁補 banner 與圖庫截圖的 caption（第三、四節）
4. `Links` 分頁確認三個 GitHub URL 都在，並用未登入的瀏覽器各開一次
5. 兩份 listing 各做一遍（Jira `463339441`、Confluence `1739220856`）
6. 紅框裡的 `Resubmit`
7. 送出後回填 [SUBMIT-SHEET.md](SUBMIT-SHEET.md) §5 的送出日期

## 七、這次學到的（別再犯）

- **版本旗標 `PUBLIC` ≠ app 已上架。** 判斷是否真的上架，用公開 REST API
  `https://marketplace.atlassian.com/rest/2/addons/<app key>` 打一次，200 才算。
- **自動退件的理由可能與真正原因無關。** `Not enough details on listing` 這句在社群
  對應到的實際成因包括 Marketplace Hub 版本沒 public、以及帳號層級驗證未完成。
- **精靈允許你跳過 Page design。** 能按下 Submit 不代表 listing 填完了。
