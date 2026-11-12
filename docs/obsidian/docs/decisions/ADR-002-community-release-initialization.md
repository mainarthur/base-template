---
id: ADR-002
title: "Community Release Standards and Zero-CSS Strategy"
status: Accepted
date: 2026-11-12
deciders: [Artur Kh]
consulted: []
informed: []
tags: [adr, release, community-plugins]
---
# ADR-002: Community Release Standards and Zero-CSS Strategy

## Context and Problem Statement
To publish Base Template on the official Obsidian Community Plugins registry (`obsidian-releases`), the repository must pass strict automated validation rules and developer guidelines, including manifest naming standards, license compliance, and efficient asset delivery.

## Decision Drivers
- Pass `obsidian-releases` GitHub Actions validation suite.
- Clean distribution artifacts: avoid unnecessary stylesheets when native styles are sufficient.
- Immediate public release availability upon tag push.

## Considered Options
- **Option 1**: Strip unused `styles.css`, use automated GitHub Action for direct public release upon pushing SemVer tag, omit optional `fundingUrl` until established.
- **Option 2**: Retain empty `styles.css`, keep GitHub releases in draft mode, add placeholder donation links.

## Decision Outcome
Chosen option: **Option 1**, because:
- Obsidian guidelines recommend deleting `styles.css` if custom styles are not needed, saving an HTTP request and vault parse overhead.
- Direct release creation without `--draft` satisfies the automated release existence check in `validate-plugin-entry.yml`.
- Manifest description strictly adheres to guidelines (no mention of "Obsidian", no "This plugin allows", proper punctuation).

### Consequences
- Good: Fully compliant with `validate-plugin-entry.yml`.
- Good: Lean release payload (`main.js` and `manifest.json` only).

