import { App, moment, TFile } from 'obsidian';

/**
 * Resolves a template path to a TFile in the vault.
 */
export function resolveTemplateFile(app: App, templatePath: string, sourcePath?: string): TFile | null {
	if (!templatePath || typeof templatePath !== 'string') {
		return null;
	}

	const normalized = templatePath.trim();
	if (!normalized) {
		return null;
	}

	const fileByPath = app.vault.getFileByPath(normalized);
	if (fileByPath instanceof TFile && fileByPath.extension === 'md') {
		return fileByPath;
	}

	const fileByLink = app.metadataCache.getFirstLinkpathDest(normalized, sourcePath ?? '');
	if (fileByLink instanceof TFile && fileByLink.extension === 'md') {
		return fileByLink;
	}

	return null;
}

/**
 * Replaces basic template placeholders:
 * - {{title}} with the note title
 * - {{date}} or {{date:FORMAT}} with formatted date
 * - {{time}} or {{time:FORMAT}} with formatted time
 */
export function renderTemplateVariables(content: string, title: string): string {
	const now = moment();

	return content
		.replace(/{{title}}/gi, () => title)
		.replace(/{{date(?::([^}]+))?}}/gi, (_match, format?: string) => {
			return now.format(format?.trim() || 'YYYY-MM-DD');
		})
		.replace(/{{time(?::([^}]+))?}}/gi, (_match, format?: string) => {
			return now.format(format?.trim() || 'HH:mm');
		});
}

/**
 * Merges template frontmatter with Base filter properties:
 * - Non-null base properties (from filters) override template frontmatter.
 * - Null/empty base properties (from unconstrained view columns) preserve template defaults.
 * - Tags arrays are merged without duplicates.
 */
export function mergeFrontmatter(
	target: Record<string, unknown>,
	rawTemplateFrontmatter: Record<string, unknown>,
	baseFilterFrontmatter: Record<string, unknown>,
): void {
	// 1. Restore template properties that were overwritten by null/undefined column placeholders
	for (const [key, value] of Object.entries(rawTemplateFrontmatter)) {
		if (target[key] === null || target[key] === undefined) {
			target[key] = value;
		}
	}

	// 2. Always merge tags from template and base filter without duplicates
	if ('tags' in rawTemplateFrontmatter || 'tags' in baseFilterFrontmatter) {
		const templateTags = normalizeTags(rawTemplateFrontmatter.tags);
		const baseTags = normalizeTags(baseFilterFrontmatter.tags);
		const targetTags = normalizeTags(target.tags);
		const combined = Array.from(new Set([...templateTags, ...baseTags, ...targetTags]));
		target.tags = combined;
	}

	// 3. Apply non-null base filter properties (except tags which are handled above)
	for (const [key, value] of Object.entries(baseFilterFrontmatter)) {
		if (value === null || value === undefined || key === 'tags') {
			continue;
		}
		target[key] = value;
	}
}

function normalizeTags(tags: unknown): string[] {
	if (Array.isArray(tags)) {
		return tags.filter((t): t is string => typeof t === 'string');
	}
	if (typeof tags === 'string') {
		return tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
	}
	return [];
}
