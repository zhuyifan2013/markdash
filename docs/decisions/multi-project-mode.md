---
id: decision-multi-project-mode
title: Serve projects together in a workspace mode
type: decision
status: accepted
owner: markdash
project: project-markdash
tags: [dashboard, cli, workspace]
created_at: 2026-09-16
updated_at: 2026-09-16
related: [decision-markdown-only, task-multi-project-dashboard]
---

# Serve projects together in a workspace mode

## Context

Each project already owns its Markdown, configuration, cache, and generated index. Running one dashboard per project avoids coupling, but creates separate ports and makes local cross-project work harder.

## Alternatives

- Keep one process per project and require different ports.
- Add a cross-project database or registry.
- Let one server read multiple initialized repositories without copying their state.

## Decision

`markdash serve` automatically discovers initialized sibling projects and also supports explicit workspace roots through repeatable `--project` arguments. It builds a read-only projection per root, names projects for display, watches each docs directory, and returns a combined summary when the dashboard is in all-projects mode. Focused project requests use that project's original document IDs.

## Impact

Users can inspect multiple local projects in one browser tab without changing each project's data model. There is still no cross-project database or automatic mutation of project content beyond the existing generated index. Static builds remain single-project.
