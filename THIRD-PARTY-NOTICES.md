# Third-party notices

Both Forge apps (`Super Mermaid for Jira` and `Super Mermaid for Confluence`) **bundle**
their dependencies into the shipped Custom UI resource rather than loading anything from a
CDN. That is what makes the "Runs on Atlassian" designation possible, and it also means
this app redistributes the components below. Each is used under its own license.

Versions verified 2026-08-04 against `static/panel/node_modules`. The complete dependency
tree, including transitive packages not listed here, is in the `package-lock.json` files.

## Bundled at runtime

| Component | Version | License |
|---|---|---|
| [mermaid](https://github.com/mermaid-js/mermaid) | 11.16.0 | MIT |
| [react-super-mermaid](https://github.com/markku636/react-super-mermaid) | 0.6.87 | MIT |
| [svg-pan-zoom](https://github.com/bumbu/svg-pan-zoom) | 3.6.2 | BSD-2-Clause |
| [react](https://react.dev) | 18.3.1 | MIT |
| [react-dom](https://react.dev) | 18.3.1 | MIT |
| [d3](https://d3js.org) (via mermaid) | 7.9.0 | ISC |
| [cytoscape](https://js.cytoscape.org) (via mermaid, mindmaps) | 3.34.0 | MIT |
| [DOMPurify](https://github.com/cure53/DOMPurify) (via mermaid) | 3.4.12 | MPL-2.0 OR Apache-2.0 |
| [KaTeX](https://katex.org) (via mermaid, math labels) | 0.16.47 | MIT |
| `@forge/bridge` | ^4.4.0 | Atlassian — used under the Atlassian Developer Terms |

## Bundled font

**Virgil** (`static/panel/public/Virgil.woff2`, 61 KB) — the hand-drawn font used by the
sketch look. It ships inside the app on purpose: `react-super-mermaid` defaults to fetching
it from jsDelivr, and any CDN fetch would forfeit "Runs on Atlassian". The app therefore
passes `fontUrl="./Virgil.woff2"` and serves it from its own resource.

Virgil is Excalidraw's original hand-drawn font, published at
[github.com/excalidraw/virgil](https://github.com/excalidraw/virgil) under the
**SIL Open Font License 1.1**, which permits bundling, embedding and redistribution with
software. Excalidraw has since replaced it with Excalifont (also OFL-1.1) for legibility
reasons, not licensing ones. Verified 2026-08-04.

> If the font ever fails to load, the sketch look falls back to
> `KaiTi / Comic Sans MS / cursive` — rendering never breaks, and no external request is
> made in either case.

## Trademarks

"Mermaid" is the name of the third-party open-source project whose syntax this app renders.
**This app is not affiliated with, endorsed by, or an official product of the mermaid-js
project.** Atlassian, Jira and Confluence are trademarks of Atlassian Pty Ltd.
