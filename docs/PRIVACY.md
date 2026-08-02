# Privacy Policy — Super Mermaid

_Last updated: 2 August 2026_

This policy covers both apps:

- **Super Mermaid for Jira**
- **Super Mermaid for Confluence**

## Summary

**These apps do not collect or transmit any of your data. Everything you type is stored
inside your own Atlassian site.** There are no external servers, no analytics, and no
third-party services. The only way anything travels outside your site is the share
button, and only when you press it — see the exception below.

Both apps hold Atlassian's **Runs on Atlassian** designation, which certifies that they
run entirely on Atlassian-hosted infrastructure and declare no external egress.

**One exception, and it is entirely under your control:** the toolbar has a **share
button**. Pressing it encodes the current diagram into a
`https://blog.markkulab.net/tools/mermaid-preview#pako:…` link and copies that link to
your clipboard. The app itself sends nothing, and the diagram sits in the URL fragment
(the part after `#`), which browsers never transmit to a server — so nothing is uploaded
by pressing the button. But that preview page **is a website outside your Atlassian
site**, so pasting the link somewhere or opening it does take the diagram out of Atlassian,
and anyone holding the link can see the diagram. If you never press that button, nothing
ever leaves.

## What the apps store

| App | What is stored | Where it is stored |
|---|---|---|
| Super Mermaid for Jira | The Mermaid diagram source text you type, plus a title and a last-modified timestamp | A Jira issue property on the issue you are viewing — inside your own Atlassian site |
| Super Mermaid for Confluence | The Mermaid diagram source text you type | A macro parameter on the page you are editing — inside your own Atlassian site |

That is the complete list. Nothing else is recorded.

## What the apps do **not** do

- **No personal data is stored.** The apps do not record your name, email address,
  Atlassian account ID, IP address, or any other identifier.
- **The apps make no network requests to any external domain.** The diagram rendering
  engine, fonts, and all dependencies are bundled inside the app itself rather than
  loaded from a CDN. The only way a diagram can travel outside your site is the share
  button described above, which you press deliberately.
- **No analytics or telemetry.** No usage tracking of any kind.
- **No third-party services.** No external APIs, no external storage, no external compute.
- **No cookies or local storage** beyond what Atlassian's own platform sets.

You can verify this yourself: open your browser's developer tools, switch to the
Network tab, and use the app. You will see no requests to any domain outside Atlassian —
including when you press Share, because that button only writes to your clipboard.

## Permissions

**Super Mermaid for Confluence** requests **no API scopes at all**. It never calls a
Confluence API.

**Super Mermaid for Jira** requests `read:jira-work` and `write:jira-work`. These are used
solely to read and write the app's own issue property (`com.markku.super-mermaid.diagrams`)
holding your diagrams. All requests are made **as the signed-in user**, so Jira's own
permission model applies: if you cannot edit an issue, the app cannot write to it either.

## Data retention and deletion

Your diagrams live inside your Jira issues and Confluence pages. They follow the
lifecycle of that content:

- Deleting the issue, page, or macro deletes the diagram with it.
- Uninstalling the app removes its access. Any remaining stored values are handled by
  Atlassian's standard app-data removal process.

Because nothing is stored outside your Atlassian site, there is no separate database to
request deletion from.

## Changes to this policy

Any change will be published at this URL with an updated date above. Material changes
will also be noted in the app's release notes.

## Contact

Questions, issues, or data requests:
<https://github.com/markku636/jira-plugin-super-mermaid/issues>
