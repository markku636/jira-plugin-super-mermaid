# FAQ and known limits

Everything here is a deliberate limit of how the apps store data or of the Forge platform,
not a bug. Listed openly so it never comes as a surprise after installing.

## Where do my diagrams live?

| App | Stored in | Consequences |
|---|---|---|
| Jira | An issue entity property (`com.markku.super-mermaid.diagrams`) | Deleted with the issue, covered by your Jira permissions and backups |
| Confluence | The macro's own config parameter | Follows page versioning — copy the page and the diagram comes with it; roll back a version and the diagram rolls back too |

Only the Mermaid **source text** is stored. No scene file, no rendered image, and no user
identifiers (see [PRIVACY.md](PRIVACY.md)).

## Jira: how much can one issue hold?

Jira caps a single entity property at **32 KB**, and allows **100 properties per app per
issue**. All diagrams on one issue share that single 32 KB property, so the practical limit
is "a lot of diagrams, as long as each is text". The panel warns you as you approach the
limit and refuses to save past it rather than silently truncating.

If you hit it, split the diagrams across issues or shorten the source.

## Confluence: why can't I draw on a page I'm editing?

Drawing and inline saving are only offered on a **published** page. In the editor you are
working on a draft, and writing the published version underneath the editor would fight
with it. Use the macro's configuration panel while editing, or publish first and then draw.

## Can I use it offline / in an air-gapped site?

Yes, as far as the app is concerned: the rendering engine, fonts and every dependency are
bundled, and the app makes no external request. The one outbound path is the toolbar's
**share** button, which copies a link to a preview page outside Atlassian — you choose
whether to press it, and pressing it only writes to your clipboard.

## Is the visual editor lossless?

Yes — the drag-and-drop editor serializes back to Mermaid source, which is the only thing
stored. That is why there is one save path for both editing modes and never two versions of
the truth. Layout that Mermaid syntax cannot express is not preserved, by design.

## Which diagram types work?

Flowchart, sequence, class, state, entity relationship, Gantt, pie, mindmap, timeline, user
journey and git graph. Anything mermaid 11 renders should render here; the app does not
maintain its own parser.

## Dark mode?

A toolbar toggle. The app deliberately does **not** follow your operating system setting,
because that says nothing about the theme of the Jira or Confluence page it is sitting in —
you would get a dark canvas inside a light page.

## Data Center or Server?

No. These are Forge apps and Forge is a Cloud-only platform.

## Cost?

Free, with no usage limits, no trial, and no paid tier.
