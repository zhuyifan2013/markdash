---
id: task-packaging
title: Package the markdash CLI for installation
type: task
status: done
priority: high
owner: ai
project: project-markdash
tags: [cli, release]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [task-mvp-cli, task-codex-skill]
blocked_by: []
---

# Package the markdash CLI for installation

## Context

Previously the tool only ran via `node bin/markdash.js`; new projects need a global command or npx.

## Scope

- Verify the global `markdash` command after `npm link`.
- Complete `package.json`: files, bin, version, repository metadata.
- Support `npx markdash init` in an empty project.
- Ensure assets (guides, templates, web) are packaged correctly.
- Add a pre-release checklist (build / validate / smoke test).

## Result and verification

- `npm link` exposes the global `markdash` command (bin -> `bin/markdash.js`).
- `markdash init` in an empty `/tmp` directory produced docs/guides/templates/AGENTS.md.
- `markdash validate` passed in the fresh project (built-in documents, 0 errors).
