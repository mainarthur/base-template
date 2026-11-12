---
created: 2026-11-06
updated: 2026-11-06
tags: [architecture, bases, templates]
category: architecture
status: stable
---
# Architecture Overview

## Overview
The **Base Template** plugin integrates with Obsidian's internal `bases` plugin (`app.internalPlugins.getEnabledPluginById('bases')`) to provide per-view template configuration for Obsidian Base views (`.base` files and embedded Base views).

## Key Components

### 1. View Configuration Extension (`src/bases-patch.ts`)
- Injects a `template` option of type `file` into `BasesViewRegistration.options` for all view layouts (Table, Cards, List, Kanban, and custom Base views).
- Allows users to select any `.md` note in the vault directly in the **Configure view** menu.
- The selection is stored automatically by Obsidian in the `.base` file under each view's configuration.

### 2. Creation Pipeline Interception (`src/bases-patch.ts`)
- Monkey-patches `newItemMenu.open(baseFileName, frontmatterProcessor)` on `BasesNewItemMenu.prototype`.
- Resolves the template note configured in `viewConfig.get('template')`.
- Intercepts `app.fileManager.createNewFile` to write the template body with replaced placeholders.
- Merges frontmatter cleanly:
  1. Template default values are preserved.
  2. Non-null Base filter properties override template properties.
  3. Frontmatter `tags` arrays are merged and deduplicated.
  4. Contextual processors (such as clicking `+` on a specific Kanban column) run on top.

### 3. Template Engine (`src/template-engine.ts`)
- Handles template file resolution across full paths and relative wikilinks.
- Replaces variables:
  - `{{title}}`: File title/basename.
  - `{{date}}` / `{{date:FORMAT}}`: Formatted date using Obsidian's bundled `moment`.
  - `{{time}}` / `{{time:FORMAT}}`: Formatted time using `moment`.
- Merges frontmatter structures.

### 4. Lifecycle Management (`src/main.ts`)
- Initializes patching on `workspace.onLayoutReady`.
- Reacts to internal plugin enablement/disablement.
- Fully cleans up prototype modifications and registration options on `onunload`.

