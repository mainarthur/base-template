# Base Template

Configure template notes for Obsidian Base views and automatically populate newly created items with rendered template bodies, variable substitutions, and merged frontmatter.

[![GitHub Release](https://img.shields.io/github/v/release/mainarthur/base-template?include_prereleases&color=7c3aed)](https://github.com/mainarthur/base-template/releases)
[![License](https://img.shields.io/github/license/mainarthur/base-template?color=blue)](LICENSE)

---

## Features

- 📑 **Per-View Template Configuration**: Assign a specific template note to any Base view layout (Table, Kanban, Cards, List, or custom view types).
- 🔘 **Seamless Creation Workflow**: Overrides the toolbar **New** button, the `+` button at the bottom of Kanban columns, and the `Bases: Add item` command to create notes using your selected template.
- 🪄 **Dynamic Variable Replacement**: Supports `{{title}}`, `{{date}}`, `{{time}}`, and custom date/time formats (e.g., `{{date:YYYY-MM-DD}}`, `{{time:HH:mm}}`).
- 🧩 **Smart Frontmatter Merging**:
  - Preserves template frontmatter defaults when table columns are empty.
  - Automatically applies non-null view filter values (e.g. `status: In Progress`).
  - Merges and deduplicates `tags` arrays across the template and view filters.
  - Applies Kanban group/column properties on top when clicking `+` in a specific column.
- 🎯 **Target Folder Resolution**: Places new notes in the Base filter folder or the vault default new note location (not in the template's folder).
- ⚡ **Zero Global Configuration**: Configuration lives directly inside your `.base` files per view. No extra global settings needed.

---

## Installation

### From Community Plugins (Recommended)

1. In Obsidian, open **Settings → Community plugins**.
2. Turn on Community plugins if disabled.
3. Click **Browse** and search for **Base Template**.
4. Click **Install**, then **Enable**.

### Manual Installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/mainarthur/base-template/releases/latest).
2. Create a folder in your vault: `<vault>/.obsidian/plugins/base-template/`.
3. Copy `main.js` and `manifest.json` into that folder.
4. Reload Obsidian and enable **Base Template** in **Settings → Community plugins**.

---

## Usage

### 1. Assigning a Template to a Base View

1. Open any `.base` file or a note containing an embedded base (`![[MyBase.base]]`).
2. Click the view switcher icon in the toolbar, then select **Configure view** (or right-click the active view tab).
3. Scroll down in the view configuration menu to the **Template** setting.
4. Select any Markdown note in your vault to act as the template for this view.

### 2. Creating New Items

- Click the **New** button in the Base toolbar.
- Or click the `+` button at the bottom of any column in a Kanban Base view.
- Or trigger the `Bases: Add item` command from the Command Palette (`Ctrl/Cmd + P`).

The new note will be created with the template's content, formatted variables, and merged frontmatter properties.

---

## Template Syntax Reference

The plugin supports standard template placeholders in both frontmatter and note body:

| Placeholder | Description | Example Output |
| :--- | :--- | :--- |
| `{{title}}` | The basename / title of the created file | `My Project Task` |
| `{{date}}` | Current date (`YYYY-MM-DD`) | `2026-11-12` |
| `{{date:FORMAT}}` | Current date with custom format | `{{date:dddd, MMMM Do YYYY}}` → `Thursday, November 12th 2026` |
| `{{time}}` | Current time (`HH:mm`) | `14:30` |
| `{{time:FORMAT}}` | Current time with custom format | `{{time:HH:mm:ss}}` → `14:30:45` |

### Example Template Note (`Templates/Project-Task.md`)

````markdown
---
status: Backlog
priority: Normal
tags:
  - task
  - project
---
# {{title}}

Created on {{date:YYYY-MM-DD}} at {{time}}.

## Objectives
- [ ] Initial planning
- [ ] Implementation
- [ ] Review
````

When created from a Base view filtered to `status: In Progress`, the new note's `status` will automatically be set to `In Progress` while keeping `priority: Normal`, merging tags, and replacing `{{title}}` and `{{date}}`.

---

## Compatibility

- Requires Obsidian **v1.10.0** or later with the core **Bases** plugin enabled.
- Fully compatible with desktop and mobile (iOS and Android).

---

## License

MIT / 0-BSD License — see [LICENSE](LICENSE) for details.
