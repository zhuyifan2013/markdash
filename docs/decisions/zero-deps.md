---
id: decision-zero-deps
title: Decision: the v1 CLI has zero third-party dependencies
type: decision
status: accepted
owner: yifanz
tags: [architecture, cli]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [task-mvp-cli, decision-markdown-only]
---

# Decision: zero-dependency CLI

## Context

Installation friction and network-restricted environments are the main early-adoption costs.

## Decision

- The CLI uses only Node built-in modules; it implements a minimal YAML frontmatter parser (only the supported subset) and a small Markdown renderer.
- The v1 dashboard uses plain HTML/CSS/JS with no build chain.
- gray-matter / zod / a frontend framework can be evaluated once the schema or rendering needs grow.

## Risks

- The hand-written YAML parser may hit edge cases. The supported scope is documented and invalid input errors clearly under `markdash validate`.
