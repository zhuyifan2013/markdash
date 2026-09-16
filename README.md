# Markdash

> A Markdown-driven, AI-agent-friendly project dashboard.

Markdash keeps your project state in plain Markdown that lives in your repo.
Frontmatter is the structured state, the document body holds the context, and
the dashboard is a read-only projection rendered on top. No database, no
vendor lock-in — everything is diffable and reviewable with Git.

It is designed around two readers at once:

- **Humans** get a dashboard showing health, a suggested next step, the task
  board, decisions, risks, tests, and recently updated documents.
- **AI agents** get a stable document map and an explicit update policy, so a
  new agent can take over after reading `docs/index.md` and only the files it
  links to — without scanning the whole repository.

## Why Markdash

- **Single source of truth.** Tasks, decisions, risks, and tests are Markdown
  files; the dashboard never owns business data.
- **Live updates.** `markdash serve` watches `docs/` and hot-reloads the browser
  as agents or humans save files.
- **AI-native by default.** A Codex skill and short `AGENTS.md` rules tell agents
  when and how to update documentation, backed by a `validate` command.
- **Zero runtime dependencies.** The CLI uses only Node.js built-in modules; the
  dashboard is plain HTML/CSS/JavaScript with no build step.
- **Static-friendly.** Export a fully static dashboard to publish on GitHub Pages,
  Vercel, or Netlify.

## Quick start

Requirements: Node.js 18 or newer.

```bash
npm install -g markdash   # or use npx markdash <command> once published

cd your-project
markdash init       # scaffold docs/, guides, templates, and AGENTS.md
markdash serve      # open http://localhost:4147
```

During development, run validation after editing documents:

```bash
markdash validate
```

## Commands

| Command | Description |
|---|---|
| `markdash init` | Create `docs/`, guides, templates, and append a Markdash section to `AGENTS.md` |
| `markdash sync` | Scan Markdown, refresh `.markdash/cache/documents.json` and the generated block in `docs/index.md` |
| `markdash validate` | Validate frontmatter, enums, duplicate ids, and broken links; refreshes the cache |
| `markdash serve` | Start the dashboard with file watching and live reload (default port 4147, override with `--port=4200`) |
| `markdash build` | Emit a static dashboard (with inlined data) to `.markdash/dist` |

Commands exit with code `2` and print guidance when run outside a Markdash
project; `validate` exits with code `1` on validation errors.

## Document model

Every tracked file starts with YAML frontmatter using scalars and inline lists:

```yaml
---
id: login-flow
title: Login flow
type: task            # project | task | decision | risk | test | note | doc
status: in_progress
priority: high        # task/risk only: urgent | high | medium | low
owner: ai
tags: [auth, web]
related: [decision-session-strategy]
created_at: 2026-09-16
updated_at: 2026-09-16
---
```

Four distinct dimensions, never conflated:

- **type** — what the document is (decides which view shows it)
- **status** — its stage, with a per-type enum
- **priority** — importance (`P0–P3`), for tasks and risks only
- **tags** — free-form topics used only for filtering (never encode status here)

See [docs/guide/metadata-schema.md](docs/guide/metadata-schema.md) for the full
schema and [docs/guide/documentation-policy.md](docs/guide/documentation-policy.md)
for the update policy.

## Repository layout

```text
AGENTS.md                 Short router + always-on rules for agents
bin/markdash.js           CLI entry point
src/                      CLI implementation (Node built-ins only)
web/                      Static dashboard (HTML/CSS/vanilla JS)
assets/                   Guides and templates copied by `markdash init`
skill/markdash/           Distributable Codex skill
docs/                     Markdash's own project data (self-bootstrapped example)
templates/                Document templates
.markdash/cache/          Generated scan cache (gitignored)
.markdash/dist/           Generated static dashboard (gitignored)
```

This repository uses Markdash to manage itself, so `docs/` is also a working
end-to-end example.

## AI agent workflow

The included Codex skill (in `skill/markdash/`) instructs agents to:

1. Read `docs/index.md` first and only the relevant linked documents.
2. Classify work before finishing: progress / decision / risk / test / operations
   change, stale doc found, or no-knowledge-change.
3. Update the corresponding Markdown file and `updated_at` for everything except
   `no-knowledge-change`, then run `markdash validate`.

Decision rule for agents:

> If the next agent could not continue, verify results, or troubleshoot using
> only code and docs — without reading this chat — update the document.
> Otherwise, stay silent and do not create documentation noise.

## Local development

```bash
git clone https://github.com/zhuyifan2013/markdash.git
cd markdash
npm link            # makes the `markdash` command point at this checkout
markdash validate
markdash serve
```

Run the test suite (planned; see `docs/tasks/cli-tests.md`):

```bash
node --test
```

## Roadmap

- Dashboard quick actions that write back to frontmatter
- Git hooks and CI integration for `validate` (`--format json`)
- Auto-loading rule generation for Cursor, Claude Code, and GitHub Copilot
- A published npm package and an installable Codex skill release

See `docs/tasks/` for the live backlog.

## Contributing

Contributions are welcome. Please open an issue first for substantial changes,
keep the CLI dependency-free unless there is a strong reason, and run
`markdash validate` before submitting a pull request.

## License

[MIT](LICENSE)
