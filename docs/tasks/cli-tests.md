---
id: task-cli-tests
title: Add tests for frontmatter, scanning, validation, and commands
type: task
status: todo
priority: medium
owner: ""
project: project-markdash
tags: [testing, cli]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [task-mvp-cli, decision-zero-deps]
blocked_by: []
---

# CLI test suite

## Scope

- Use the built-in Node test runner (`node --test`) to keep zero runtime dependencies.
- Cover frontmatter scalars, inline lists, invalid nested YAML, dates, and enums.
- Cover scan/validate: duplicate ids, broken `related`, blocked without `blocked_by`.
- Smoke-test init / sync / build / serve in temporary directories.

## Acceptance criteria

- `node --test` passes.
- Changes to parsing or rules do not break the self-bootstrapped markdash repo.
