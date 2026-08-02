# Privacy Policy — Super Mermaid

_Last updated: 2 August 2026_

This policy covers both apps:

- **Super Mermaid for Jira**
- **Super Mermaid for Confluence**

## Summary

**These apps do not collect, transmit, or store any of your data outside your own
Atlassian site.** There are no external servers, no analytics, and no third-party services.

Both apps hold Atlassian's **Runs on Atlassian** designation, which certifies that they
run entirely on Atlassian-hosted infrastructure and declare no external egress.

## What the apps store

| App | What is stored | Where it is stored |
|---|---|---|
| Super Mermaid for Jira | The Mermaid diagram source text you type, plus a title and a last-modified timestamp | A Jira issue property on the issue you are viewing — inside your own Atlassian site |
| Super Mermaid for Confluence | The Mermaid diagram source text you type | A macro parameter on the page you are editing — inside your own Atlassian site |

That is the complete list. Nothing else is recorded.

## What the apps do **not** do

- **No personal data is stored.** The apps do not record your name, email address,
  Atlassian account ID, IP address, or any other identifier.
- **No data leaves your Atlassian site.** The apps make no network requests to any
  external domain. The diagram rendering engine, fonts, and all dependencies are
  bundled inside the app itself rather than loaded from a CDN.
- **No analytics or telemetry.** No usage tracking of any kind.
- **No third-party services.** No external APIs, no external storage, no external compute.
- **No cookies or local storage** beyond what Atlassian's own platform sets.

You can verify this yourself: open your browser's developer tools, switch to the
Network tab, and use the app. You will see no requests to any domain outside Atlassian.

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
