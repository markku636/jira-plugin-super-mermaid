# Version 頁逐欄值 — Super Mermaid for Jira

> listing id `463339441`／version `2007000`／build `2007000`
> 建立日期 2026-08-05。這頁是 `Make App Public` 精靈的第 4 步（Get started → About app → Page design → **Version**）。

---

## 1. 下拉與單選

| 欄位 | 值 | 為什麼 |
| --- | --- | --- |
| BETA release | **不勾** | 這不是 beta。勾了會在 listing 掛 beta 標籤，壓抑安裝意願 |
| License | **MIT**（找不到就選 Other open source） | repo 根目錄的 `LICENSE` 是 MIT。**不要選 `Commercial`** — 跟「免費 + 開源可自行查證」的定位打架，也違反 LISTING-COPY 的「不留任何付費痕跡」 |
| App version supported | **Yes** | `docs/SUPPORT.md` 承諾 24 小時內回覆。選 No 等於 listing 不顯示支援連結，跟自己的文件矛盾 |
| Use a standard agreement as your EULA | **Yes**（Bonterms Standard End User Agreement） | MARKETPLACE.md 寫的「End User Terms 用範本」就是這個。一人維護的免費 app 沒理由自寫條款 |

## 2. 三個 URL

支援管道（選了 App version supported = Yes 之後才會出現）

```
https://github.com/markku636/jira-plugin-super-mermaid/issues
```

Documentation — **一定要 `.en` 這份**，沒有 `.en` 的是繁體中文，listing 是英文的

```
https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/GETTING-STARTED.en.md
```

Data security and privacy statement

```
https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/PRIVACY.md
```

## 3. Release summary（上限 80 字元，實際 66）

```
First public release: diagrams on any Jira issue, written or drawn
```

## 4. Release notes（上限 1000 字元，實際 719）

```
First public release.

- Diagram panel on any Jira issue, with several diagrams per issue in tabs
- Drag-and-drop editor: add nodes, connect them, move them, and the Mermaid source updates as you go
- 11 diagram types: flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline, user journey, git graph
- Pan and zoom, pinch-to-zoom on touch devices, and search inside a diagram
- Export to SVG or PNG
- Share a diagram as a link, encoded in the URL and opened on a preview page outside Atlassian
- Light and dark themes
- Full support for Chinese, Japanese and Korean text in labels

Runs on Atlassian: the app itself makes no external network request. Diagrams are stored on the issue as an entity property.
```

---

## 按 Submit 之前

- [ ] 三個 GitHub URL 用**未登入的瀏覽器**各開一次。repo 08-04 核對是 public，但這三個連結審查者一定會點，死一個就是再等一輪
- [ ] `Compatible with Jira Service Management` 目前是勾的。`jira:issuePanel` 在 JSM 的 request 上理論上會出現（JSM issue 就是 Jira issue），但**沒實測過**。要嘛在 JSM 專案的一張 request 上點開面板出圖驗一次，要嘛取消勾選、之後走 listing 更新再加
- [ ] Vendor 顯示名稱是 `Markku666`，banner 上印的是 `Markkulab`。改 `Details` 頁或重跑 `scripts/make-listing-images.mjs`，二選一

## 送出後回填

- [ ] 送出日期 →
- [ ] Confluence listing 的同一份值（release summary／notes 要重寫成 macro 版本，其餘欄位相同，只有 Documentation 與 Categories 不同）
