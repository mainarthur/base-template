---
title: Prepare Base Template for Obsidian Community Plugin Release
created: 2026-11-12
updated: 2026-11-12
type: task
category: task
tags: [task, release, community]
status: Done
priority: 🔥 High Priority
epic: "[[docs/Architecture|Architecture]]"
---
# Prepare Base Template for Obsidian Community Plugin Release

## Description
Prepare the plugin repository and release metadata to satisfy all Obsidian Community Plugin developer guidelines and automated validation checks in `obsidianmd/obsidian-releases`.

## Completed Steps
- [x] Standardize `manifest.json` description (no "Obsidian", no "this plugin", ending in period).
- [x] Update `LICENSE` copyright to `2026 Artur Kh`.
- [x] Remove empty boilerplate `styles.css`.
- [x] Update `.github/workflows/release.yml` to publish public releases automatically.
- [x] Write comprehensive user-facing `README.md` with usage guides and variable reference.
- [x] Migrate memdoc vault to `docs/obsidian/` with ADR registry and atomic shards.
- [x] Verify ESLint and TypeScript build.

