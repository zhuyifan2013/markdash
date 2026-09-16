# Markdash workflow reference

## Event -> document

| Event | Action |
|---|---|
| New task arrives | Create / update `docs/tasks/*.md` |
| Work starts | status -> `in_progress` |
| Blocked | status -> `blocked`, fill `blocked_by` |
| Task finished | status -> `done`, record result + verification |
| Approach chosen | New `docs/decisions/*.md` |
| Decision replaced | old -> `superseded`, link new via `supersedes` |
| Risk discovered | New / update `docs/risks/*.md` |
| Test conclusion | Update `docs/tests/*.md` |
| Run/deploy/config changed | Update `docs/operations/*.md` |
| Meeting / research / unconfirmed idea | Write `docs/notes/*.md` |
| Tentative note becomes authoritative | Promote note into the proper folder |

## Do not document

- Merely reading code, searching files, or understanding current state.
- Temporary debugging with no reusable conclusion.
- Abandoned experiments with no future value.
- Pure formatting, comments, or no-impact renames.
- Anything already accurately documented.

Threshold: only record information that affects later decisions, execution,
testing, handoff, or troubleshooting.

## Decisions vs tasks

- A task is "what to do / current stage"; it flows todo -> in_progress -> done.
- A decision is "why this choice"; it is a durable constraint on future work.
  Finished work is a task; a choice that keeps constraining future work is a
  decision (lightweight ADR; product decisions are allowed, not just technical).

## Validation and sync

- Run `markdash validate` after doc changes; it reports invalid enums,
  duplicate ids, broken related links, blocked-without-blocked_by, and
  done-without-result warnings, and refreshes the cache.
- `markdash serve` watches `docs/` and hot-reloads; no manual sync needed.
- Editing `.markdash/config.json` requires restarting serve.
- `markdash build` aborts on validation errors and emits a static dashboard.
