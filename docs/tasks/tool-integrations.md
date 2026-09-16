---
id: task-tool-integrations
title: Generate auto-loading rules for Cursor / Claude / Copilot
type: task
status: todo
priority: medium
owner: ""
project: project-markdash
tags: [ai, integration]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [task-packaging]
blocked_by: []
---

# Generate multi-tool AI rule files

## Context

Standard AGENTS.md can only ask agents to read files on demand; Cursor, Claude Code, and Copilot support stronger auto-import or path-triggered rules.

## Scope

- `markdash init` can optionally generate `.cursor/rules/markdash.mdc`, a CLAUDE.md import snippet / `.claude/rules/...`, and `.github/instructions/markdash.instructions.md`.
- Each file references the same `docs/guide/` content to avoid maintaining duplicated rules.
- Provide a `--tools=cursor,claude,copilot` flag.

## Acceptance criteria

- Opening a task/decision/risk document in the corresponding tool activates or clearly references the relevant rule.
- Projects that only use AGENTS.md are unaffected.
