---
id: decision-markdown-only
title: Decision: Markdown is the single source of truth, no database
type: decision
status: accepted
owner: yifanz
tags: [architecture]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [project-markdash]
---

# Decision: Markdown only

## Context

Humans, agents, Git, and the dashboard need to share one project state without double-writing data or vendor lock-in.

## Decision

- `docs/**/*.md` is the single source of truth; frontmatter is the structured state.
- `.markdash/cache/` and the generated block in `docs/index.md` are reproducible artifacts and must not be hand-edited.
- The dashboard never writes business data; future quick actions must write back to the Markdown frontmatter.

## Consequences

- Portable, diffable, and reviewable; advanced querying is limited to scanning and JSON aggregation. An index can be considered later if scale demands it.
