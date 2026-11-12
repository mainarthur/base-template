# Prompts & Execution Log

## 2026-11-12 — Release Initialization for Obsidian Community Directory

- **Prompt Summary:** Prepare plugin repository for community release (`https://community.obsidian.md/`), migrate memdoc to `docs/obsidian/`, and establish 1.0.0 release readiness.
- **Key Decisions:**
  - Approved compliant manifest description.
  - Removed unused `styles.css` (zero-CSS footprint).
  - Configured `release.yml` for direct public release upon tag push.
  - Sharded ADRs and moved memory vault to `docs/obsidian/`.
- **Files Modified/Created:**
  - `manifest.json` [MODIFIED]
  - `LICENSE` [MODIFIED]
  - `styles.css` [DELETED]
  - `.github/workflows/release.yml` [MODIFIED]
  - `README.md` [MODIFIED]
  - `docs/obsidian/` [MIGRATED & EXPANDED]
- **Verification:** ESLint, TypeScript compilation, release validation checks.

## 2026-11-06 — Implement Base View Template Setting & New Button Logic

- **Prompt Summary:** Add a "Template" setting to Obsidian Base view configurations that overrides the "New" button logic and uses the selected template for creating notes.
- **Key Decisions:**
  - Zero-config architecture (setting resides directly in `.base` view configuration).
  - Variable substitution (`{{title}}`, `{{date}}`, `{{time}}`).
  - Base filter and group column precedence over template frontmatter, preserving template defaults over null column placeholders.
  - Monkey-patching `BasesNewItemMenu.prototype.open` and wrapping `BasesViewRegistration.options`.
- **Files Modified/Created:**
  - `src/types.ts` [NEW]
  - `src/template-engine.ts` [NEW]
  - `src/bases-patch.ts` [NEW]
  - `src/main.ts` [MODIFIED]
  - `src/settings.ts` [DELETED]
  - `manifest.json` [MODIFIED]
  - `versions.json` [MODIFIED]
- **Verification:** ESLint, TypeScript compilation, esbuild bundle, and unit testing of template rendering and frontmatter merging logic.
