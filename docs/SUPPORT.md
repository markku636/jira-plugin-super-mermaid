# Support

**Super Mermaid for Jira** and **Super Mermaid for Confluence** are free apps maintained by
Markkulab.

## How to get help

| What | Where |
|---|---|
| Bug reports, questions, feature requests | [GitHub Issues](https://github.com/markku636/jira-plugin-super-mermaid/issues) |
| Getting started | [docs/GETTING-STARTED.md](GETTING-STARTED.md) |
| Privacy and permissions | [docs/PRIVACY.md](PRIVACY.md) |
| Known limits | [docs/FAQ.md](FAQ.md) |

**Response target: within 24 hours** on working days, for both apps.

## What to include in a bug report

The more of these you can give, the faster it gets fixed:

1. Which app and which host — Jira issue panel, or Confluence macro.
2. The Mermaid source that reproduces it (the toolbar's copy button gets you the exact text).
3. What you expected versus what you saw. A screenshot of the panel helps.
4. Browser and version.
5. Anything in the browser console (`F12` → Console).

Please **do not** paste confidential diagram content into a public issue. Reduce it to the
smallest snippet that still reproduces the problem, or describe the shape of it.

## What is out of scope

- **Mermaid syntax itself.** If the same source fails in the
  [Mermaid live editor](https://mermaid.live), it is an upstream mermaid question.
- **Data Center and Server.** These apps are Forge apps, and Forge is Cloud-only.
- **Recovering deleted diagrams.** Diagram source lives inside your Jira issue property or
  Confluence macro parameter, so it follows your own site's version history and backups —
  the app keeps no copy of its own. Confluence page history is usually the fastest route
  back.

## Security

Please report suspected vulnerabilities privately first: open a GitHub issue asking for a
contact channel without technical detail, and details will be exchanged directly. Do not
post a working exploit publicly before it is fixed.
