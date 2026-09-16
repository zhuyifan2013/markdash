---
id: task-validate-hooks
title: Wire validate into Git hooks and CI
type: task
status: todo
priority: medium
owner: ""
project: project-markdash
tags: [cli, validation, ci]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [task-mvp-cli]
blocked_by: []
---

# Wire validate into Git hooks and CI

## Scope

- `markdash init` can optionally install a pre-commit / pre-push hook.
- `markdash validate` supports machine-readable output (`--format json`).
- Provide a GitHub Actions example that fails PRs on broken links, duplicate ids, and invalid enums.
- Surface long-running `in_progress` tasks that have not been updated (the aggregation already exists; the CLI report is missing).

## Acceptance criteria

- Invalid documentation fails the commit or CI with a clear error.
- No false positives when documentation is unchanged.
