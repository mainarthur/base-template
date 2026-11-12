---
id: ADR-003
title: "Obsidian Template Engine Integration and Type-Safe Variable Rendering"
status: Accepted
date: 2026-11-12
deciders: [Artur Kh]
consulted: []
informed: []
tags: [adr, architecture, templates, typesafe]
---
# ADR-003: Obsidian Template Engine Integration and Type-Safe Variable Rendering

## Context and Problem Statement
Template rendering in `src/template-engine.ts` relied on untyped `moment()` calls, causing `@typescript-eslint` unsafe warnings (`no-unsafe-assignment`, `no-unsafe-return`, `no-unsafe-call`, `no-unsafe-member-access`). Furthermore, variable formatting should integrate directly with Obsidian's core `templates` plugin settings (respecting user-configured date and time formats, template folder resolution) and support community template engines like Templater (`templater-obsidian`).

## Decision Drivers
- Zero `@typescript-eslint` unsafe warnings under strict type-checked linting.
- Respect Obsidian's native `templates` core plugin configurations (`dateFormat`, `timeFormat`, `folder`).
- Extensible support for community template engines (`templater-obsidian`).

## Considered Options
- **Option 1**: Implement strict `MomentInstance` typing, query Obsidian's internal `templates` plugin options for date/time formats and template folder resolution, and provide fallback support for Templater.
- **Option 2**: Require `@types/moment` and ignore Obsidian's configured template settings.

## Decision Outcome
Chosen option: **Option 1**, because:
- Introducing a typed `MomentCreator` and `MomentInstance` contract eliminates all unsafe assignments/calls/returns at compile time without extra dependencies.
- Reading `dateFormat` and `timeFormat` from `app.internalPlugins.getEnabledPluginById('templates')` respects the user's Obsidian preferences across the vault.
- Supports Templater's `parse_template` when `templater-obsidian` is active.

### Consequences
- Good: Fully type-safe and compliant with GitHub CI / CodeQL / ESLint strict rules.
- Good: Seamless user experience matching Obsidian's native template behavior.

