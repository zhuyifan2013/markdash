---
id: test-multi-project-mode
title: Multi-project serve smoke test
type: test
status: passing
kind: integration
owner: ai
project: project-markdash
tags: [dashboard, cli, workspace]
created_at: 2026-09-16
updated_at: 2026-09-16
related: [task-multi-project-dashboard]
---

# Multi-project serve smoke test

## Plan

- Initialize two temporary Markdash projects.
- Start `markdash serve` from the first project without project arguments to confirm automatic sibling discovery.
- Request the workspace document list, one focused project, and a document by its workspace key.
- Confirm focused project requests preserve original document IDs and document lookup works across projects.
- Render the all-projects overview with a headless browser and confirm no console errors.

## Result

Passing. The API returned both projects without explicit project arguments, the focused project retained its original IDs, and the all-projects document lookup resolved the composite key correctly. The generated workspace summary reflected documents from both roots. Headless-browser rendering confirmed that the all-projects overview displays project cards and produces no console errors.
