---
id: project-markdash
title: Markdash
type: project
status: active
health: green
owner: yifanz
tags: [markdash, meta]
created_at: 2026-09-15
updated_at: 2026-09-16
related: [task-mvp-cli, task-mvp-dashboard, decision-markdown-only]
---

# Markdash

A Markdown-driven, AI-agent-friendly project dashboard.

## Goal

- Markdown is the single source of truth; frontmatter metadata is structured state; the dashboard is only a live projection.
- Agents maintain task, decision, risk, and test documents as they work, rather than relying on people to remind them.
- A new agent only reads `docs/index.md` and the documents it links to in order to take over, with no full-repo scan.

## Current phase

MVP: dependency-free Node CLI (init / sync / validate / serve / build) + a read-only dashboard.

## Non-goals (v1)

- No database, accounts or permissions, or in-browser rich-text editing.
- No bidirectional Jira / Linear sync.
- No automatic generation of all business documents.
