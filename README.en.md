# Super Mermaid for Jira

[繁體中文](./README.md) ｜ **English**

Atlassian Forge app: view and **visually edit** Mermaid diagrams inside Jira issues.

The third host of `react-super-mermaid` (the other two are the blog and the VS Code extension).

## Positioning

Marketplace already lists 8+ Mermaid apps for Jira, and **every one of them is
"paste syntax → render SVG."** This app's only real footing is the lib's unique
**drag-and-drop visual editor with a lossless round-trip back to Mermaid source**.
The copy never competes with those renderers on feature count — it says exactly one
thing: **they can only type, this one lets you drag**.

That's why milestone M3 (wiring up the visual editor) was the project's go/no-go,
not a nice-to-have — completed 2026-08-02 (`DrawEditor.tsx`, shared by both apps).

## Status

**2026-08-02: both Marketplace listings have been submitted and are awaiting Atlassian
review (roughly 10–15 business days).**

| Milestone | Status |
|---|---|
| M0 skeleton | ✅ Done |
| M1 Viewer | ✅ Done (verified live on `markku666.atlassian.net`) |
| M2 Edit & save | ✅ Done (Jira stores an issue property, Confluence stores a macro parameter) |
| M3 Visual editor | ✅ Done (drag-and-drop editing with lossless round-trip; both apps share the same save path) |
| M4 Listing | 🟡 Both listings submitted, awaiting review |

This repo now houses **two independent Forge apps** — a cross-product app
(`app.compatibility` declaring both jira and confluence) is not eligible for a free
listing, so it was split into two single-product apps, at the cost of two listings
and two review rounds. Details in [docs/MARKETPLACE.md](docs/MARKETPLACE.md).

| App | Location | App ID suffix | Module |
|---|---|---|---|
| Super Mermaid for Jira | repo root | `69ba5f06…` | `jira:issuePanel` (side panel) |
| Super Mermaid for Confluence | `confluence/` | `fd93a1d5…` | `macro` (`layout: block`, genuinely embedded in the page body) |

Both apps are deployed to development and production, and both pass `forge eligibility`
(Runs on Atlassian). **`forge` commands must be run from each app's own directory** —
the Confluence one is not a git submodule, just a plain subdirectory.

## Quick start

Forge CLI is already installed and logged in; for day-to-day updates just run:

```powershell
./deploy.ps1                          # Jira app → development (build + lint + deploy + eligibility)
./deploy.ps1 -Environment production  # the production environment used for the listing
cd confluence; npm run deploy         # the Confluence app must be run from its own directory
```

Day-to-day development:

```powershell
npm run dev                    # Vite dev server (develop the UI standalone)
forge tunnel                   # hot-reload inside a real Jira site
npm run typecheck              # root + panel
```

One-time setup, only needed on a new machine:

```powershell
npm install -g @forge/cli
forge login                    # the Atlassian account is a4756830@gmail.com, not the hotmail one
npm run install:all
```

> **Login gotcha**: the token must be created at
> <https://go.atlassian.com/forge-cli-api-token> (with Forge scope) — old
> no-scope-style tokens always fail. And **if the email is wrong, the error message
> lies and claims "The API token is no longer valid,"** which sends people down a
> pointless loop of regenerating tokens.

> PowerShell 5.1 has no `&&`. Chain commands with `;` plus `if ($?)` instead.
> Also note the local machine runs Node 24 while the Forge CLI officially supports
> LTS (18/20/22) — if the CLI complains about compatibility, switch Node versions.

## Architecture

```
manifest.yml            Jira app: module declarations, scopes, CSP
src/index.ts             Forge resolver (deliberately near-empty, see below)
static/panel/           Custom UI (Vite + React 18 + TS)
  src/App.tsx           panel body: tabs, loading, saving, source/draw mode toggle
  src/DrawEditor.tsx    drag-and-drop drawing editor (M3, also shared by Confluence)
  src/Toolbar.tsx       our own English-language toolbar
  src/storage.ts        issue property read/write
  src/shareLink.ts      share link
  scripts/copy-assets.mjs   copies the Virgil font into public/
resources/              panel icon and Marketplace logo
confluence/             Confluence app (an independent Forge app, its own manifest and app id)
  static/ui/src/macro.tsx        in-page rendering and inline editing
  static/ui/src/config.tsx       macro config panel
  static/ui/src/savePageMacro.ts writes back to the page's macro parameter
```

> **Confluence Custom UI cannot use a single multi-entry build.** `resource.path`
> *is* that iframe's own web root; a multi-entry build produces a shared
> `build/assets/`, and `build/macro/index.html` referencing `../assets/…` escapes
> that root — a 404 once deployed. The fix is to drive two independent builds via
> `--mode`, each self-contained (one for the `macro` resource, one for `config`).

### Three deliberate design decisions

**1. Data access skips the resolver.** The frontend reads and writes the issue
property directly with `@forge/bridge`'s `requestJira`, i.e. it acts "as the
signed-in user" — Jira's permission model applies automatically, and anyone without
edit rights gets a 403 on write. Going through `api.asApp()` instead would mean
re-implementing that permission check by hand, which is only another place to get
it wrong. The resolver is kept in reserve for work that genuinely needs the server
side later (cross-issue queries, webhook triggers).

**2. Only the Mermaid source is stored, never the scene JSON.** The visual editor's
round-trip is already lossless, so storing both would just create two sources of
truth.

**3. The lib's built-in toolbar is not used.** `react-super-mermaid`'s UI strings
are hardcoded in Traditional Chinese (styles / search / export… / fullscreen),
which is a listing-blocking problem for an international market.
`MermaidViewerHandle` exposes 24 imperative methods, enough to build our own
English toolbar with zero risk of upstream drift. The long-term fix is adding a
`labels` prop to the lib itself, which would benefit the blog and the VS Code
extension too.

## The one line that must never be crossed: `permissions.external`

The disqualifying conditions for the "Runs on Atlassian" badge are
`permissions.external`, remotes, Connect modules, providers, and dynamic web
triggers — and this badge is **the one trust signal this app can state plainly**:
the app makes no outbound request at runtime. So "the app makes zero outbound
requests" isn't engineering fastidiousness — it *is* the app's selling point.

Three known outbound-connection traps, all sealed:

| Trap | How it's sealed |
|---|---|
| The lib's sketch-theme font defaults to jsDelivr | `fontUrl="./Virgil.woff2"` + `copy-assets.mjs` ships it with the bundle |
| The lib falls back to a CDN if it can't find mermaid | `mermaid={{ instance }}` injected explicitly |
| Same, for svg-pan-zoom | `svgPanZoom={{ instance }}` injected explicitly |

**But the public copy must never claim "your data never leaves Atlassian."** The
toolbar's 🔗 share button generates a
`blog.markkulab.net/tools/mermaid-preview#pako:…` URL and copies it to the
clipboard — it triggers no request itself (so it doesn't affect badge eligibility,
see `shareLink.ts`), but the moment anyone opens that link, the diagram has left
Atlassian's site. The wording always stops at "**the app itself makes no outbound
connection; whether to share it out is the user's own choice**," and the listing,
privacy policy, and docs must all say plainly that the share link is an external
page.

Conversely, `permissions.content.styles: ['unsafe-inline']` **does not** affect
eligibility — and it's necessary, because mermaid injects `<style>` tags into the
SVG and the lib itself has 4 spots doing `document.createElement('style')`, all of
which Forge Custom UI's default `style-src 'self'` would otherwise block.

Always run this after touching `manifest.yml`:

```powershell
forge eligibility
```

## Verification

Following the sibling repos' zero-CI convention, the quality gates are:

1. `npm run typecheck` (root + panel)
2. `forge lint`
3. `forge eligibility` — run every time the manifest changes
4. Manual verification on the real Jira development site, screenshots archived under
   `outputs/<topic>_<date>/`
5. **Confirm zero external requests in the browser's Network panel** — more
   trustworthy than any CLI check
   (pressing 🔗 share should also produce zero requests — it only writes to the
   clipboard, never opens the link)

Automating a Jira login in Playwright is hard, so M1–M3 rely on manual verification
plus screenshots rather than pretending there's automated test coverage.

## Listing

**Free, no usage limits, every feature unlocked.** What's needed is a Marketplace
partner account, a privacy policy, End User Terms, a support channel, and the
submission itself — details in [docs/MARKETPLACE.md](docs/MARKETPLACE.md).

> The Runs on Atlassian badge is still worth keeping — it signals "this app makes
> zero outbound requests" to enterprise buyers, and the entire cost of keeping it is
> **never adding `permissions.external`**.

The repo's own license is still undecided (the sibling lib is MIT, and the two
aren't in conflict, but a license still needs to be picked explicitly).
