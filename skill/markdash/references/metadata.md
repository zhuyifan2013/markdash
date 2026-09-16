# Markdash metadata reference

Every tracked document starts with YAML frontmatter using only scalars and
inline lists (no nested structures).

## Common fields

| field | required | notes |
|---|---|---|
| id | yes | unique repo-wide, kebab-case, stable |
| title | yes | display title |
| type | yes | project / task / decision / risk / test / note / doc |
| status | yes | enum depends on type |
| owner | no | person or agent |
| tags | no | inline list, free-form topics for filtering |
| created_at | yes | YYYY-MM-DD |
| updated_at | yes | update on every substantive change |
| related | no | inline list of other document ids |

## Type-specific

- task: status `backlog|todo|in_progress|blocked|review|done|cancelled`;
  `priority: urgent|high|medium|low`; optional `due`, `project`, `blocked_by[]`.
  - backlog = unscheduled idea; todo = committed and ready to pick up.
  - blocked requires non-empty `blocked_by`.
  - done requires a result/verification note in the body.
- decision: status `proposed|accepted|deprecated|superseded`;
  use `supersedes: <id>` when replacing an earlier decision.
- risk: status `open|mitigated|closed`; `probability` and `impact` each
  `low|medium|high`; optional `mitigation`.
- test: status `planned|passing|failing|skipped`; `kind: unit|integration|e2e|manual`.
- project: status `active|on_hold|done|archived`; `health: green|yellow|red`.
- note / doc: status `active|stale|archived`.

## Example

```yaml
---
id: login-flow
title: Login flow
type: task
status: in_progress
priority: high
owner: ai
due: 2026-09-20
tags: [auth, frontend]
related: [decision-session-strategy]
blocked_by: []
created_at: 2026-09-16
updated_at: 2026-09-16
---
```

## Rules

- File name should match id: `docs/tasks/login-flow.md`.
- References always use ids, never relative paths, so files can move.
- Never create tags named like `todo` or `in_progress`; state lives in `status`.
- `<!-- markdash:generated -->` blocks and `.markdash/cache|dist` are generated.
