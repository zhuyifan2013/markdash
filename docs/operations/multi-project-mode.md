---
id: operations-multi-project-mode
title: Run the multi-project dashboard
type: doc
status: active
owner: markdash
tags: [operations, dashboard, workspace]
created_at: 2026-09-16
updated_at: 2026-09-16
related: [decision-multi-project-mode, test-multi-project-mode]
---

# Run the multi-project dashboard

Start one server from any initialized project. Markdash automatically discovers
initialized projects in sibling directories:

```bash
cd /path/to/projects/project-a
markdash serve
```

The current project is always included. Use explicit roots when you need exact control or projects are not siblings:

```bash
markdash serve --project=/path/to/project-a --project=/path/to/project-b
```

If the default port is already taken and you did not pass `--port`, Markdash automatically tries the next port up to ten times. To start another merged dashboard manually:

```bash
markdash serve --port=4148
```

The sidebar switches between **All projects** and a focused project. All-projects mode uses workspace-scoped document keys internally, so duplicate document IDs in different repositories cannot collide. Each project's Markdown, cache, and generated index remain local to that repository. Static builds remain single-project.

If a listed folder is not initialized, stop and run `markdash init` in that folder before serving it.
