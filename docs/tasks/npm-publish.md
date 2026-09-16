---
id: task-npm-publish
title: Publish markdash to the npm registry
type: task
status: todo
priority: medium
owner: ""
project: project-markdash
tags: [cli, release, npm]
created_at: 2026-09-16
updated_at: 2026-09-16
related: [task-packaging]
blocked_by: []
---

# Publish markdash to the npm registry

## Context

`npm install -g markdash` and `npx markdash` are documented as the long-term install path but do not work until the package is published and the package name is available.

## Scope

- Check whether the `markdash` name is available on npm; choose a scoped fallback (e.g. `@zhuyifan2013/markdash`) if taken.
- Verify packaged contents via `npm pack` / `npm publish --dry-run` (bin, src, web, assets, skill, README, LICENSE).
- Confirm a clean-room install and run from the tarball, including `markdash init` in an empty project.
- Tag and publish the first release; document the upgrade path.

## Acceptance criteria

- `npx markdash init` works without cloning the repository.
- The installed package contains no generated cache or dist artifacts.
- README install instructions match the published name and version.
