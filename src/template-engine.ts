import { App, moment, TFile } from 'obsidian';
import { InternalTemplatesPlugin, TemplateEngineOptions, TemplaterPlugin } from './types';

interface MomentInstance {
	format(format?: string): string;
}

type MomentCreator = () => MomentInstance;

/**
 * Retrieves date and time format preferences from Obsidian's core Templates plugin.
 */
export function getObsidianTemplateOptions(app: App): TemplateEngineOptions {
	const internalPlugins = (app as unknown as {
		internalPlugins?: {
			getEnabledPluginById(id: string): InternalTemplatesPlugin | null;
		};
	}).internalPlugins;

	const templates = internalPlugins?.getEnabledPluginById('templates');
	return {
		dateFormat: templates?.options?.dateFormat,
		timeFormat: templates?.options?.timeFormat,
	};
}

/**
 * Resolves a template path to a TFile in the vault, checking:
 * 1. Direct vault path
 * 2. Adding .md extension if omitted
 * 3. Obsidian's core Templates folder location (if configured)
 * 4. Relative linkpath destination via metadataCache
 */
export function resolveTemplateFile(
	app: App,
	templatePath: string,
	sourcePath?: string,
): TFile | null {
	if (!templatePath || typeof templatePath !== 'string') {
		return null;
	}

	const normalized = templatePath.trim();
	if (!normalized) {
		return null;
	}

	// 1. Direct path
	const fileByPath = app.vault.getFileByPath(normalized);
	if (fileByPath instanceof TFile && fileByPath.extension === 'md') {
		return fileByPath;
	}

	// 2. Direct path with .md extension appended
	if (!normalized.endsWith('.md')) {
		const fileWithMd = app.vault.getFileByPath(`${normalized}.md`);
		if (fileWithMd instanceof TFile && fileWithMd.extension === 'md') {
			return fileWithMd;
		}
	}

	// 3. Within Obsidian's configured Templates folder
	const internalPlugins = (app as unknown as {
		internalPlugins?: {
			getEnabledPluginById(id: string): InternalTemplatesPlugin | null;
		};
	}).internalPlugins;
	const templatesPlugin = internalPlugins?.getEnabledPluginById('templates');
	const templateFolder = templatesPlugin?.options?.folder;
	if (templateFolder && typeof templateFolder === 'string') {
		const folderPrefix = templateFolder.endsWith('/') ? templateFolder : `${templateFolder}/`;
		const pathInFolder = `${folderPrefix}${normalized}`;
		const fileInFolder = app.vault.getFileByPath(
			pathInFolder.endsWith('.md') ? pathInFolder : `${pathInFolder}.md`,
		);
		if (fileInFolder instanceof TFile && fileInFolder.extension === 'md') {
			return fileInFolder;
		}
	}

	// 4. Relative linkpath lookup
	const fileByLink = app.metadataCache.getFirstLinkpathDest(normalized, sourcePath ?? '');
	if (fileByLink instanceof TFile && fileByLink.extension === 'md') {
		return fileByLink;
	}

	return null;
}

/**
 * Replaces placeholders using Obsidian's template engine convention (matching Obsidian's internal Ws function):
 * - {{title}} with the note title
 * - {{date}} or {{date:FORMAT}} with formatted date (respecting Obsidian's template settings)
 * - {{time}} or {{time:FORMAT}} with formatted time (respecting Obsidian's template settings)
 */
export function renderTemplateVariables(
	content: string,
	title: string,
	options?: TemplateEngineOptions,
): string {
	const momentFn = moment as unknown as MomentCreator;
	const now = momentFn();

	const defaultDateFormat = options?.dateFormat?.trim() || 'YYYY-MM-DD';
	const defaultTimeFormat = options?.timeFormat?.trim() || 'HH:mm';

	return content
		.replace(/{{title}}/gi, () => title)
		.replace(/{{(date|time)(?::(.*?))?}}/gi, (_match, type: string, customFormat?: string) => {
			const isDate = type.toLowerCase() === 'date';
			const format = customFormat?.trim() || (isDate ? defaultDateFormat : defaultTimeFormat);
			return String(now.format(format));
		});
}

/**
 * Applies template rendering using Obsidian's template engine, with support for
 * Templater (templater-obsidian) if enabled.
 */
export async function applyTemplateEngine(
	app: App,
	file: TFile,
	templateContent: string,
	options?: TemplateEngineOptions,
): Promise<string> {
	const rendered = renderTemplateVariables(templateContent, file.basename, options);

	const plugins = (app as unknown as {
		plugins?: {
			getPlugin(id: string): TemplaterPlugin | null;
		};
	}).plugins;

	const templaterPlugin = plugins?.getPlugin('templater-obsidian');
	if (templaterPlugin?.templater?.parse_template) {
		try {
			return await templaterPlugin.templater.parse_template(
				{ target_file: file, run_mode: 0 },
				rendered,
			);
		} catch (err) {
			console.error('Base Template: Templater parse_template failed, using standard render', err);
		}
	}

	return rendered;
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
