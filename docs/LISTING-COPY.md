# Marketplace Listing 文案（可直接複製）

兩份 listing 的內容。英文為主 —— Marketplace 是國際市場。

**定位原則**：市集上已有 8 個以上的 Mermaid app，功能面高度重疊。不要跟它們比
功能數量，主打兩件它們沒有的：**Runs on Atlassian（app 本身零對外請求）**，以及**免費**。

> **文案紅線**：不要再寫「zero data leaving your site」「never leave Atlassian」這種
> 絕對句。工具列的分享按鈕會產生一段指向站外預覽頁的網址，那就是一條對外的路徑——
> 說法要停在「app 自己不對外連線，要不要分享出去由使用者決定」。

---

## A. Super Mermaid for Confluence

**App name**（60 字元內）

```
Super Mermaid for Confluence
```

**Summary / tagline**（一句話，會出現在搜尋結果）

```
Draw flowcharts, sequence diagrams and Gantt charts inline — your diagrams stay in your own site.
```

**Categories**

- Charts & diagramming（主）
- Documentation

**Description**

```
Write a few lines of text, get a diagram. Super Mermaid renders Mermaid syntax directly
inside your Confluence pages — flowcharts, sequence diagrams, Gantt charts, ER diagrams,
mindmaps, and more.

WHY THIS ONE

Your diagrams live in your own site. Super Mermaid holds Atlassian's "Runs on Atlassian"
designation: the rendering engine, fonts, and every dependency are bundled inside the app.
The app itself makes no network request to any external domain — you can verify that
yourself in your browser's Network tab. The one exception is the toolbar's share button:
it copies a link to your clipboard, and that link opens the diagram on a preview page
outside Atlassian, so it only travels if you choose to share it.

The only permissions it requests are read and write on Confluence pages, used solely to
save a diagram you edited straight from the page body — the app reads that one page,
updates the diagram stored in its own macro parameter, and writes it back. Every request
is made as the signed-in user, so Confluence's own permission model applies: if you cannot
edit a page, neither can the app.

For teams with data-residency or vendor-review requirements, that is usually the deciding
factor.

HOW IT WORKS

1. Type /Super Mermaid on any page
2. Paste your Mermaid syntax
3. Save — the diagram is embedded in the page body, not bolted on beside it

Diagram source is stored as a macro parameter, so it follows page versioning. Copy a page
and the diagram comes with it. Roll back to an older version and you see the diagram as it
was then.

WHAT YOU GET

• 11 diagram types: flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline,
  user journey, git graph
• Pan and zoom, pinch-to-zoom on touch devices
• Search inside a diagram and jump to the matching node
• Export to SVG or PNG
• Share a diagram as a link — the diagram is encoded in the URL and opens on a preview
  page outside Atlassian, so it only travels if you send it
• Light and dark themes
• Full support for Chinese, Japanese and Korean text in labels

Free, with no usage limits.
```

**Highlights**（3 則，各需一張圖）

1. `Diagrams inside your page` — macro 嵌在內文中、與文字混排的畫面
2. `The app calls nothing external` — DevTools Network 面板顯示零外部請求
3. `11 diagram types` — 多種圖表並排

---

## B. Super Mermaid for Jira

**App name**

```
Super Mermaid for Jira
```

**Summary / tagline**

```
Add flowcharts and sequence diagrams to any issue — your diagrams stay in your own site.
```

**Categories**

- Charts & reporting（主）
- Workflow

**Description**

```
Some issues are easier to explain with a picture. Super Mermaid adds a diagram panel to
every Jira issue — write a few lines of Mermaid syntax and get a flowchart, sequence
diagram, state machine or Gantt chart.

WHY THIS ONE

Your diagrams live in your own site. Super Mermaid holds Atlassian's "Runs on Atlassian"
designation: the rendering engine, fonts, and every dependency are bundled inside the app.
The app itself makes no network request to any external domain — verify it yourself in
your browser's Network tab. The one exception is the toolbar's share button: it copies a
link to your clipboard, and that link opens the diagram on a preview page outside
Atlassian, so it only travels if you choose to share it.

The only permissions it requests are read and write on Jira work, used solely to store your
diagrams on the issue itself. Every request is made as the signed-in user, so Jira's own
permission model applies: if you cannot edit an issue, neither can the app.

HOW IT WORKS

1. Open any issue and click the Super Mermaid panel
2. Click Source, paste your Mermaid syntax, Save
3. Use the + tab to keep several diagrams on one issue

Diagrams are stored on the issue itself, so they are deleted with it and are covered by
your existing Jira permissions and backups.

WHAT YOU GET

• 11 diagram types: flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline,
  user journey, git graph
• Multiple diagrams per issue
• Pan and zoom, pinch-to-zoom on touch devices
• Search inside a diagram and jump to the matching node
• Export to SVG or PNG
• Share a diagram as a link — the diagram is encoded in the URL and opens on a preview
  page outside Atlassian, so it only travels if you send it
• Light and dark themes
• Full support for Chinese, Japanese and Korean text in labels

Free, with no usage limits.
```

**Highlights**

1. `Diagrams on the issue` — issue 右側面板顯示流程圖
2. `The app calls nothing external` — Network 面板零外部請求
3. `Several diagrams per issue` — 多分頁畫面

---

## 兩份共用的欄位

| 欄位 | 值 |
|---|---|
| Vendor / Company | `Markkulab` |
| Support contact | `https://github.com/markku636/jira-plugin-super-mermaid/issues` |
| Privacy policy | `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/PRIVACY.md` |
| Documentation | `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/GETTING-STARTED.md` |
| Pricing | Free |
| Hosting | Cloud only |

## 素材現況

> **2026-08-04 更正**：這裡原本寫著「上面兩份文案就是 08-02 送審時實際送出的版本」——
> 那是錯的，listing 從來沒建立過（見 [MARKETPLACE.md](MARKETPLACE.md) 頂部）。
> 也就是說**這個檔案現在還是可以自由改，改完直接貼進第一版 listing，
> 不需要走任何更新流程**。可貼版本已整理在 [../submission/SUBMIT-SHEET.md](../submission/SUBMIT-SHEET.md)。

- [x] App logo（`resources/logo.svg` + `logo-144.png` + `logo-512.png`，兩個 app 共用）
- [x] 螢幕截圖（`screenshot/processed/jira-panel.webp`、`confluence-inline.webp`
      → 已轉成後台吃得下的 PNG，放在 `submission/images/`）
- [x] End User Terms（用 Atlassian 範本）
- [ ] **拖拉編輯的主視覺** —— 現有素材只有靜態渲染截圖，跟競品長得一樣；
      拖拉畫面是唯一的差異化，第一版就該放
- [ ] 描述文案要不要補上視覺編輯器 —— 段落已備在 SUBMIT-SHEET 的〈選配〉區塊

**截圖要注意的事**：靜態的渲染結果跟市集上另外 8 個 app 長得一模一樣。
真正能區隔的畫面是「拖拉編輯圖表」、「圖表嵌在 Confluence 內文中與文字混排」，以及
「DevTools Network 面板空空如也」。最後那個沒有人這樣拍，但那正是你的賣點。
