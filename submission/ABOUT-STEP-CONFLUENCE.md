# About app 頁逐欄值 — Super Mermaid for Confluence

> listing id `1739220856`／version `3003000`
> 建立日期 2026-08-05。這頁是 `Make App Public` 精靈的第 2 步（Get started → **About app** → Page design → Version）。
> Jira 版的對應檔：[VERSION-STEP-JIRA.md](VERSION-STEP-JIRA.md)（那份是第 4 步）。

---

## App logo

`images/logo-confluence-144.png`（144×144，2026-08-05 新畫）

節點語言與配色跟 Jira 版一樣，頂端多兩條 slate 文字條表示「圖長在頁面內文裡」。
原始檔 [../resources/logo-confluence.svg](../resources/logo-confluence.svg)。

## App name

```
Super Mermaid for Confluence
```

## App tagline（上限 130，實際 108，結尾不能有標點）

```
Flowcharts, sequence diagrams and Gantt charts inline in your pages, drawn by dragging or written in Mermaid
```

## App summary（上限 250，實際 244）

```
Super Mermaid renders Mermaid diagrams inside your Confluence pages: write the syntax, or drag nodes on a canvas. Source lives in the macro parameter, so it follows page versioning. Runs on Atlassian, so the app makes no external request. Free.
```

## Categories（最多 2）

主分類 **Design and diagramming**（清單若寫 `Charts & diagramming` 就選那個），
第二個選 **Documentation**。以實際下拉字串為準。

## Keywords（最多 4）

`Charts/Graphs` 起手，再從清單補 `Diagrams`／`Documentation`／`Visualization` 一類。
`mermaid` 這個字不在固定清單也無所謂，它已出現在名稱、tagline、summary 與描述裡。

## Release behavior

保持預設 `Publish app immediately after approval`。

## More details（上限 1000，實際 982）

```
Super Mermaid renders diagrams in the body of your Confluence pages. Type /Super Mermaid, then write Mermaid syntax or drag nodes on a canvas.

WHY THIS ONE

It holds Atlassian's "Runs on Atlassian" designation. The rendering engine, fonts and all dependencies are bundled in, so it never calls an external domain. One exception: the share button copies a link to a preview page outside Atlassian, so a diagram travels only if you send it.

Diagram source lives in the macro parameter, so it follows page versioning. It reads and writes pages only to save diagrams you edit from the page body, as the signed-in user: if you cannot edit a page, neither can the app.

WHAT YOU GET

- Drag-and-drop editing with lossless round-trip to Mermaid source
- 11 diagram types: flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline, user journey, git graph
- Pan, zoom, in-diagram search, SVG and PNG export
- Light and dark themes, full CJK text support

Free, no usage limits.
```

## App stores personal data

**No。** [docs/PRIVACY.md](../docs/PRIVACY.md) 寫的是「No personal data is stored. The apps do not
record your name, email address, ...」。app 只存使用者自己打的圖表文字，放在該頁 macro 參數裡。
答 Yes 會跟自己的隱私權政策打架。

---

## 後面兩步用得到的

**Page design**：`images/banner-confluence-1120x548.png` ＋ `560x274`；
highlight 三組 `hl-conf-1-inline-*`、`hl-conf-2-draw-*`、`hl-conf-3-types-*`（各有 1840×900 與 580×330）；
圖庫補充 `gal-conf-4-gantt-*`。**別上錯成 `-jira-` 那批。**

**Version**：除了下面兩項，其餘與 [VERSION-STEP-JIRA.md](VERSION-STEP-JIRA.md) 完全相同
（License = MIT、App version supported = Yes、EULA 標準合約 = Yes、支援與隱私權 URL 相同）。

- Documentation：同一個 repo，仍是
  `https://github.com/markku636/jira-plugin-super-mermaid/blob/main/docs/GETTING-STARTED.en.md`
- Release summary（上限 80）：
  ```
  First public release: Mermaid diagrams inline in your pages, written or drawn
  ```
- Release notes：把 Jira 那份的第一條「Diagram panel on any Jira issue…」換成
  「Macro that renders in the page body, with the source stored in the macro parameter」，
  其餘照抄。
