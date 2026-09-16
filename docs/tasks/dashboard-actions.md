---
id: task-dashboard-actions
title: Dashboard quick actions that write back to frontmatter
type: task
status: todo
priority: high
owner: ""
project: project-markdash
tags: [dashboard, web, cli]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [task-mvp-dashboard, decision-markdown-only]
blocked_by: []
---

# Dashboard quick actions that write back to frontmatter

## Context

The v1 dashboard is read-only; day-to-day status changes should be safe without editing YAML by hand.

## Scope

- A local write endpoint in serve mode, allowing only whitelisted fields: status, owner, priority, due, blocked_by.
- The server parses the target document and replaces only frontmatter, preserving body and formatting.
- UI actions: start, block, complete, cancel, set owner / due date.
- Prompt for a "result and verification" note when completing a task.
- Prevent path traversal and writes outside the docs directory.

## Acceptance criteria

- Clicking a button produces a diff containing only the expected frontmatter fields.
- The body is not reformatted; invalid enum values are rejected.
- Static builds hide write actions.
