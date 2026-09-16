---
id: task-mvp-dashboard
title: MVP: read-only dashboard
type: task
status: done
priority: high
owner: ai
project: project-markdash
tags: [dashboard, web]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [project-markdash, decision-markdown-only]
blocked_by: []
---

# MVP: read-only dashboard

## Scope

- Overview: health, in-progress / blocked tasks, high risks, overdue and stale items, recent updates.
- Task board: columns by status, with priority / owner / tag filtering.
- Decisions & risks: timeline and a probability x impact risk matrix.
- Tests page: aggregate test documents by status.
- Documents page: title / tag / owner full-text filter, side panel rendering Markdown and related links.
- v1 is plain static HTML/CSS/vanilla JS with no build chain; supports live data in serve and `data.json` fallback in build.

## Result and verification

- Implemented in `web/index.html`, `web/styles.css`, `web/app.js`.
- The browser re-fetches data on the SSE update event; saving Markdown refreshes the UI automatically.
- The `build` output opens from any static server and falls back to `data.json`.
