---
id: task-multi-project-dashboard
title: Multi-project dashboard
type: task
status: done
priority: high
owner: ai
project: project-markdash
tags: [dashboard, cli, workspace]
created_at: 2026-09-16
updated_at: 2026-09-16
related: [task-mvp-dashboard, decision-multi-project-mode]
blocked_by: []
---

# Multi-project dashboard

## Context

Running one dashboard per project requires separate ports and context switches. A local dashboard should be able to project several initialized Markdash repositories at once while each repository remains the source of truth for its own documents.

## Scope

- `markdash serve` automatically discovers initialized sibling projects.
- It also accepts repeatable `--project=/absolute/path` arguments for explicit control.
- The API returns the project list and a workspace-level summary.
- The dashboard can show all projects or focus on one project.
- File watching and live reload cover every served project.

## Acceptance criteria

- Two initialized projects can be served in one process without separate ports.
- A project started without arguments automatically includes initialized sibling projects.
- The dashboard can switch between projects without losing the selected view.
- Opening a document resolves it in the correct project, including when document IDs repeat across projects.
- Single-project behavior and static builds remain compatible.

## Result

Implemented workspace serving with automatic sibling discovery, explicit project roots, per-project watchers, a project selector, and a combined overview. Workspace-scoped document keys avoid collisions while original document IDs remain unchanged in each project.

## Verification

- `node --check` passed for the CLI, server, and dashboard scripts.
- A temporary two-project smoke test passed document listing, focused project requests, and cross-project document lookup.
- A sibling auto-discovery smoke test confirmed that `markdash serve` without arguments merged two projects.
- A headless-browser render test confirmed that the all-projects overview displays correctly without console errors.
- `markdash validate` passed for this repository.
