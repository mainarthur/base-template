---
id: ADR-001
title: "Base View Template Architecture and Creation Hook"
status: Accepted
date: 2026-11-06
deciders: [Artur Kh]
consulted: []
informed: []
tags: [adr, architecture, bases, templates]
---
# ADR-001: Base View Template Architecture and Creation Hook

## Context and Problem Statement
Obsidian Bases (`.base` files) provides database-like views for notes, but lacks a built-in mechanism to assign specific template notes to individual views or populate newly created items from a template. We need an integration that adds a "Template" setting to all Base views and automatically populates notes created via the view's "New" actions.

## Decision Drivers
- Non-invasive integration with Obsidian's internal `bases` plugin.
- Zero-configuration overhead: settings should live within each view's definition in `.base`.
- Clean lifecycle: no memory leaks, unregister cleanly on plugin unload.
- Accurate frontmatter merging: Base filters and Kanban group assignments must take precedence without erasing template defaults.

## Considered Options
- **Option 1**: Monkey-patch `BasesNewItemMenu.prototype.open` and inject `Template` into `BasesViewRegistration.options`.
- **Option 2**: Re-implement custom Base views from scratch for Table, Cards, List, and Kanban.
- **Option 3**: Intercept vault file creation globally via `vault.on('create')`.

## Decision Outcome
Chosen option: **Option 1**, because:
- Injecting `{ type: 'file', key: 'template' }` into `BasesViewRegistration.options` allows Obsidian to natively persist the template path into the `.base` file.
- Monkey-patching `BasesNewItemMenu.prototype.open` intercepts all creation triggers (New button, Kanban column `+`, `bases:add-item` command) while reusing Obsidian's native popover, layout, and mobile tab handling.
- Monkey-patching can be cleanly undone on `onunload`.

### Consequences
- Good: Fully compatible with all native Base view layouts and mobile apps.
- Good: Preserves Obsidian's built-in popover positioning, focus management, and keyboard navigation.
- Bad: Relies on internal Base plugin structures which require version boundary checking (`minAppVersion: 1.10.0`).

