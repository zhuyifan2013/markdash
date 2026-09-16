---
name: markdash
description: Maintain a Markdown-driven, AI-friendly project dashboard. Use when a project has a docs/ folder with Markdash frontmatter, when the user asks to initialize Markdash, or when task status, decisions, risks, tests, or project handoff information changes and should be recorded in Markdown and shown on the dashboard.
metadata:
  short-description: Markdown-native project dashboard workflow
---

# Markdash

Markdash keeps project state in `docs/**/*.md`: frontmatter is structured
state, body text is context, and the dashboard is a read-only projection.
The CLI is the source of truth for validation and rendering.

## Command availability

Prefer the installed command; fall back to the local binary if unavailable.

- Installed: `markdash <cmd>`
- Local checkout: `node node_modules/.bin/markdash <cmd>` or
  `node <repo>/bin/markdash.js <cmd>` from the project root.

Commands: `init`, `sync`, `validate`, `serve` (default http://localhost:4147), `build`.

## Starting work in a Markdash project

1. Read `docs/index.md` first; follow its document map and read only the
   task/decision/risk/test/operations files relevant to the current task.
   Do not scan or rewrite every document.
2. When beginning a tracked task, set its `status: in_progress`.
3. If the project is not initialized and the user wants Markdash, run
   `markdash init`, which creates `docs/`, guides, templates, and appends a
   Markdash section to `AGENTS.md`. Do not initialize without user intent.

## Finishing work (mandatory check)

Before the final response, classify the work and update the matching document:

- progress-change (new/started/blocked/resumed/done/cancelled task) -> `docs/tasks/`
- decision-change (a chosen approach, or an old one replaced) -> `docs/decisions/`
- risk-change (new hazard, dependency, constraint, mitigation) -> `docs/risks/`
- test-change (plan, result, defect, verification) -> `docs/tests/`
- operations-change (env, deploy, config, build, run) -> `docs/operations/`
- stale-doc-found -> update the document or mark `status: stale`

If classification is `no-knowledge-change` (routine reading, abandoned
experiments with no reusable value, no-impact cleanup), create no documentation.

Decision rule: if the next agent could not continue, verify, or troubleshoot
from code + docs alone (without this chat), update the relevant document.
Otherwise stay silent — do not create documentation noise.

After any documentation change, update `updated_at` and run `markdash validate`.
Fix reported errors before delivering. `validate` refreshes the cache; run
`sync` explicitly only when the generated block in `docs/index.md` must be
refreshed outside a running server. When `markdash serve` is running, saved
Markdown is picked up automatically.

Never hand-edit `.markdash/cache/` or `.markdash/dist/`. Generated blocks in
`docs/index.md` are delimited by `<!-- markdash:generated -->` and must not be
edited by hand.

## Creating or editing frontmatter

Read `references/metadata.md` before writing frontmatter. Key invariants:

- Four distinct dimensions, never conflated:
  `type` (what it is), `status` (its stage), `priority` (importance, task/risk),
  `tags` (free-form topics for filtering). Do not encode status as a tag.
- `id` is unique, kebab-case, and stable; `related` / `project` / `supersedes`
  reference ids, not paths.
- Frontmatter supports only the Markdash subset: scalars and inline lists
  (`tags: [a, b]`). No nested YAML.

## Document type guidance

Read `references/workflow.md` for the event -> document mapping, per-type
status meanings (e.g. task `backlog` vs `todo`; decision `accepted` /
`superseded`), and the "what not to document" list, when deciding what to write
or how to move a document through its lifecycle.

## Defaults vs project rules

If the project contains its own `docs/guide/` or `AGENTS.md` rules, those take
precedence over this skill for project-specific conventions; this skill
provides the default Markdash workflow.
