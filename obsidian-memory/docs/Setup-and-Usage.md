---
created: 2026-11-06
updated: 2026-11-06
tags: [setup, usage, guide]
category: guide
status: stable
---
# Setup and Usage

## Installation
1. Build the plugin release artifacts:
   ```bash
   npm run build
   ```
2. Copy `main.js` and `manifest.json` into your Obsidian vault:
   ```bash
   <Vault>/.obsidian/plugins/base-template/
   ```
3. In Obsidian, go to **Settings → Community plugins**, reload, and enable **Base Template**.

## Configuring a Template for a Base View
1. Open any `.base` file or note containing an embedded base (`![[MyBase.base]]`).
2. Click the view switcher icon in the toolbar, then click the gear icon or choose **Configure view** (or right-click the active view tab).
3. Scroll down in the view configuration settings form to the **Template** setting.
4. Select any Markdown (`.md`) note from your vault.

## Creating Notes from Base Views
- Click the **New** button in the Base toolbar, or click the `+` button at the bottom of any Kanban column.
- The new note will be created with:
  - The template note's body content.
  - Substituted variables (`{{title}}`, `{{date}}`, `{{time}}`).
  - Merged frontmatter (template properties + view filter properties + group values).

