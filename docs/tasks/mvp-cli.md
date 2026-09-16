---
id: task-mvp-cli
title: MVP: dependency-free Node CLI
type: task
status: done
priority: high
owner: ai
project: project-markdash
tags: [cli]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [project-markdash, decision-markdown-only, decision-zero-deps]
blocked_by: []
---

# MVP: dependency-free Node CLI

## Scope

- `markdash init`: scaffold docs folders, guides, templates, and an AGENTS.md snippet.
- `markdash sync`: scan Markdown, parse frontmatter, generate `.markdash/cache/documents.json`.
- `markdash validate`: validate schema, duplicate ids, broken `related` links, enums, and refresh the cache.
- `markdash serve`: local HTTP server with file watching, dashboard, data API, and SSE live reload.
- `markdash build`: emit a static dashboard with inlined data.

## Result and verification

- Implemented in `bin/markdash.js` and `src/`, using only Node built-in modules.
- Self-bootstrapped in this repo: `validate` passes (15 documents, 0 errors / 0 warnings).
- `build` produces `.markdash/dist`; `serve` exposes a working `/api/documents`.
- Verified automatic hot reload on new Markdown and that `docs/index.md` is not rewritten when unchanged, avoiding a watch loop.
