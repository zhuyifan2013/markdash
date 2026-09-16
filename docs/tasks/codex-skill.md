---
id: task-codex-skill
title: Publish the Markdash Codex skill
type: task
status: done
priority: medium
owner: ai
project: project-markdash
tags: [skill, ai]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [task-packaging, task-tool-integrations]
blocked_by: []
---

# Publish the Markdash Codex skill

## Scope

- Write an installable `SKILL.md` covering start-work, documentation-update, and finish-with-validate flows.
- Define the precedence between the skill defaults and the project's `docs/guide/` rules.
- Provide an example project and a minimal demo repository.
- Explain when to create task / decision / risk / test / note documents to avoid over-documenting.

## Result and verification

- Created the distributable skill: `skill/markdash/SKILL.md` plus `references/metadata.md` and `references/workflow.md`.
- Installed to `~/.codex/skills/markdash/` with standard frontmatter (name / description / metadata).
- Uses progressive disclosure: shared workflow in the entry point; field details and the event map are loaded on demand from references.
