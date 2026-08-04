# Super Mermaid — install and use

Draw flowcharts, sequence diagrams and Gantt charts from a few lines of text, right inside
Jira issues and Confluence pages.

> 繁體中文版：[GETTING-STARTED.md](GETTING-STARTED.md)

There are two separate apps. Install whichever you need:

| App | Where it lives | Good for |
|---|---|---|
| **Super Mermaid for Confluence** | A macro **in the page body** | Documentation, architecture, process notes |
| **Super Mermaid for Jira** | A panel on the issue | Flows and sequences tied to an issue |

> Why two apps instead of one: Atlassian does not accept a single app supporting both
> products on a free listing. Splitting them is what keeps both free — no usage limits,
> no paid tier.

---

## Install

### From Marketplace

1. In Jira or Confluence, open **Settings (gear) → Apps → Explore more apps**
2. Search for **Super Mermaid**
3. Select **Get app**, choose the site, and confirm the permissions
4. Done

Requires **Jira Cloud** or **Confluence Cloud** and site admin rights.
Data Center and Server are not supported — Forge is a Cloud-only platform.

### From source (developers)

```powershell
npm install -g @forge/cli
forge login

# Confluence app
cd confluence
npm run install:all
npm run build
forge deploy
forge install -s <your-site>.atlassian.net -p confluence

# Jira app
cd ..
npm run install:all
npm run build
forge deploy
forge install -s <your-site>.atlassian.net -p jira
```

---

## Using it in Confluence

1. Edit any page
2. Type **`/Super Mermaid`** and insert it from the menu
3. The configuration panel opens — paste your Mermaid source
4. Select **Save**. The diagram is now embedded in the page body
5. To change it later: select the diagram → **Edit**, or edit it in place on the published
   page

Diagram source is stored in the macro's own parameter, so it **follows page versioning**:
copy the page and the diagram comes with it; roll back to an older version and you see the
diagram as it was then.

## Using it in Jira

1. Open any issue
2. Select the **Super Mermaid** panel
3. Select `</>` to open the source pane, paste your syntax, then **Save**
4. Use the **+** tab to keep several diagrams on the same issue

Diagrams are stored on the issue itself (32 KB per issue, roughly ten medium diagrams).

## The toolbar

Both apps share one toolbar. In Confluence it floats — hover over the diagram to see it.

| Button | What it does |
|---|---|
| 🔍− `100%` 🔍＋ | Zoom out / in. Select the percentage to return to actual size |
| ⌖ | Fit to view (double-clicking the canvas does the same) |
| 🔍 | Find text in the diagram and jump to that node; `↑` `↓` move between matches |
| ⤓ | Export: `Download PNG` / `Download SVG` |
| 🔗 | Copy a share link — the diagram travels in the URL and opens on a preview page **outside Atlassian** (see below) |
| ⧉ | Copy the Mermaid source to your clipboard |
| ✏ | **Drawing mode** (next section) |
| `</>` | Show / hide the source pane |
| 🌙 | Toggle light and dark |
| ⋯ | Display height: `Auto` / `S` / `M` / `L` / `XL` / `2XL`, or a custom pixel value |

Drag with the mouse to pan, scroll to zoom, pinch to zoom on touch devices.

> **There is no fullscreen button, on purpose.** The app runs in an iframe, so fullscreen
> would fill the iframe rather than the browser window — the diagram would end up smaller,
> not bigger. Use ⋯ to set the display height instead.

## Drawing instead of typing

Select **✏** and edit the diagram by dragging. This is the part no other Mermaid app on the
Marketplace offers, and both apps have it.

The drawing toolbar gives you: select / pan / add node / connect, seven common shapes (box,
rounded, stadium, diamond, circle, hexagon, cylinder), three line styles, undo / redo /
delete / tidy-up (re-runs the layout engine), zoom and fit, and a hand-drawn look.

Every change is **serialized straight back to Mermaid source**, so:

- Typing and dragging are two ways of editing the same thing, sharing one save path
- **Only the Mermaid source is stored** — there is no separate scene file, and therefore
  never two versions of the truth
- Layout that Mermaid syntax cannot express is not preserved, by design

> Confluence allows drawing on **published** pages only. Inside the editor you are working
> on a draft, and writing the published version underneath the editor would fight with it —
> use the macro's configuration panel in that case.

---

## Examples to copy and paste

### Flowchart

```
flowchart LR
  A[Pull request] --> B{Tests pass?}
  B -- yes --> C[Review]
  B -- no --> D[Fix and push]
  D --> B
  C --> E[Merge]
```

### Sequence diagram

```
sequenceDiagram
    autonumber
    participant U as User
    participant A as App
    participant S as Auth service

    U->>A: Open dashboard
    A->>S: Exchange refresh token
    S-->>A: Access token (15 min)
    A-->>U: Dashboard data
```

### Gantt

```
gantt
    title Project plan
    dateFormat YYYY-MM-DD
    section Design
      Interviews    :a1, 2026-08-01, 5d
      UI design     :a2, after a1, 7d
    section Build
      Back-end API  :b1, after a1, 14d
      Front-end     :b2, after a2, 10d
    section Ship
      Acceptance    :c1, after b2, 3d
```

### State diagram

```
stateDiagram-v2
    [*] --> Review
    Review --> Approved: signed off
    Review --> Returned: missing details
    Returned --> Review: resubmitted
    Approved --> [*]
```

Supported types: flowchart, sequence, class, state, ER, gantt, pie, mindmap, timeline,
user journey, git graph.

---

## Your diagrams stay in your own site

Both apps hold Atlassian's **Runs on Atlassian** designation, which means:

- **The app itself makes no external network request.** The rendering engine, fonts and
  every dependency are bundled inside the app rather than loaded from a CDN.
- Diagram content lives only in your own Confluence page or Jira issue. No third-party
  server is involved.
- The permissions each app requests are only enough to store its own diagrams, and every
  request is made **as the signed-in user**, so Atlassian's own permission model applies:
  - Jira: `read:jira-work` / `write:jira-work`, used solely for the app's own issue
    property (`com.markku.super-mermaid.diagrams`). If you cannot edit an issue, neither
    can the app.
  - Confluence: `read:page:confluence` / `write:page:confluence`, used solely to save a
    diagram you edited from the page body — it reads that one page, replaces the source in
    its own macro parameter, and writes it back. It touches no other page.

You can verify the network claim yourself: open your browser's developer tools, switch to
the Network tab, and use the app.

> **One exception: the share button 🔗.**
> It encodes the current diagram into a
> `https://blog.markkulab.net/tools/mermaid-preview#pako:…` URL and copies that to your
> clipboard. The app sends nothing (the Network tab stays empty) and the diagram sits after
> the `#`, which browsers never transmit to a server. But that preview page **is a website
> outside your Atlassian site** — once the link is shared or opened, the diagram has left
> Atlassian, and anyone with the link can see it. Nothing leaves unless you press that
> button. If your organisation does not allow it, tell your team not to use it.

---

## FAQ

**The diagram doesn't appear.**
Check that the first line is a valid diagram declaration (`flowchart`, `sequenceDiagram`,
`gantt`, …). Invalid syntax shows an error message rather than a blank space.

**Can I edit a Confluence diagram on the page itself?**
Yes, on a published page — select the diagram and edit in place, or use ✏ to draw. Inside
the page editor (a draft) use the macro's configuration panel instead.

**Does it handle Chinese, Japanese and Korean text?**
Yes — node text, labels and participant names all work.

**Can I export?**
Yes, PNG and SVG from the toolbar.

**Is Data Center or Server supported?**
No. Forge is a Cloud-only platform.

**What does it cost?**
Nothing. Free, with no usage limits.

More limits and edge cases: [FAQ.md](FAQ.md) · Support: [SUPPORT.md](SUPPORT.md) ·
Privacy: [PRIVACY.md](PRIVACY.md)
