---
title: Implement Base View Template Setting & New Button Logic
created: 2026-11-06
updated: 2026-11-06
type: task
category: task
tags: [task, bases, templates]
status: Done
priority: 🔥 High Priority
epic: "[[docs/Architecture|Architecture]]"
---
# Implement Base View Template Setting & New Button Logic

## Description
Add a "Template" setting to Obsidian Base view configuration menus (Table, Cards, List, Kanban, etc.) that overrides the New button / new note logic to populate new notes with the selected template's body and merged frontmatter.

## Requirements
- [x] In view configuration, add a file picker setting named "Template".
- [x] Persist setting into the active view's configuration in `.base`.
- [x] Intercept note creation via the toolbar "New" button, Kanban column `+`, and `bases:add-item`.
- [x] Render template variables: `{{title}}`, `{{date}}`, `{{time}}`.
- [x] Merge template frontmatter with Base filter properties and column group values.
- [x] Maintain clean unload / cleanup lifecycle.

## Changes Made
- `src/types.ts`: Type definitions for Obsidian internal Bases plugin and query controller.
- `src/template-engine.ts`: Template file resolution, variable replacement, and frontmatter merging.
- `src/bases-patch.ts`: Monkey-patching view registration options and `newItemMenu.open`.
- `src/main.ts`: Plugin lifecycle management.
- `manifest.json`: Bumped `minAppVersion` to `1.10.0`.

## Verification
- `npm run lint` passed with 0 errors.
- `npm run build` completed successfully (`main.js` generated).
- Automated tests verified template variable replacement and frontmatter merging.

