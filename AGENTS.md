# Agent guide

This repository uses **Markdash**: Markdown is the single source of truth, frontmatter
metadata powers the dashboard, and everything under `.markdash/` is generated.

## Required reading (before starting)

1. `docs/index.md` - project status and the document map
2. `docs/guide/agent-workflow.md` - start-work / finish-work flow
3. Only the task, decision, risk, test, or operations documents linked from the index that are relevant to this task

Do not scan or rewrite every document unless necessary.

## Mandatory rules (always in effect)

- When task status, requirements, decisions, risks, tests, or deployment/run details change, you **must** update the corresponding Markdown file and its frontmatter.
- Before finishing a task, read `docs/guide/documentation-policy.md` to decide whether documentation needs updating.
- Before creating or editing frontmatter, read `docs/guide/metadata-schema.md`.
- After documentation changes, run `npx markdash validate` (or `node bin/markdash.js validate` locally).
- Never hand-edit generated files under `.markdash/cache/`.
- Decision rule: if the next agent could not continue, verify, or troubleshoot from code + docs alone (without this chat), update the document. Otherwise, do not create documentation noise.
