---
created: 2026-11-06
updated: 2026-11-06
tags: [decisions, design, bases]
category: decisions
status: stable
---
# Technical Decisions

## 1. Zero-Config Design
- **Decision:** Do not create a separate plugin settings tab. Instead, allow the user to select any Markdown file in their vault directly within each Base view configuration.
- **Rationale:** Settings are naturally per-view rather than global. A user may want a "Meeting" template for their Meetings view and a "Task" template for their Tasks view in the same `.base` file.

## 2. Template Rendering & Variable Replacement
- **Decision:** Support `{{title}}`, `{{date}}`, `{{date:FORMAT}}`, `{{time}}`, and `{{time:FORMAT}}` using Obsidian's built-in `moment` instance.
- **Rationale:** Keeps dependencies minimal (zero new npm runtime packages) while covering standard template substitution patterns.

## 3. Frontmatter Precedence & Target Folder
- **Decision:** Base filter properties and group column values take precedence over template frontmatter; tags are merged without duplicates; new notes are placed in the Base view's filter folder or the vault default new-note location (not the template's folder).
- **Rationale:** When a user creates a card under a "Doing" column in a Kanban Base view, they expect the note's status to be "Doing" even if the template note default was "Draft". Empty/null column placeholders from the Base view do not wipe out valid template defaults.

## 4. Monkey-Patching `BasesNewItemMenu.prototype.open`
- **Decision:** Wrap the prototype `open` method rather than replacing the Base views wholesale.
- **Rationale:** Preserves Obsidian's built-in popover positioning, focus management, file explorer integrations, phone tab opening, and query result reactivity without reimplementing internal UI components.

