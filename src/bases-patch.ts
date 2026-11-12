import {
	App,
	BasesAllOptions,
	BasesViewConfig,
	BasesViewRegistration,
	Notice,
	TFile,
} from 'obsidian';
import {
	BasesNewItemMenu,
	BasesQueryControllerInternal,
	BasesViewRegistrationInternal,
	FileManagerInternal,
	InternalBasesPlugin,
} from './types';
import {
	applyTemplateEngine,
	getObsidianTemplateOptions,
	mergeFrontmatter,
	resolveTemplateFile,
} from './template-engine';

export class BasesPatcher {
	private app: App;
	private originalOptions = new Map<string, ((config: BasesViewConfig) => BasesAllOptions[]) | undefined>();
	private originalRegisterView?: (type: string, reg: BasesViewRegistrationInternal) => void;
	private originalNewItemMenuOpen?: BasesNewItemMenu['open'];
	private patchedProto?: BasesNewItemMenu;
	private basesPlugin?: InternalBasesPlugin;

	constructor(app: App) {
		this.app = app;
	}

	public setup(): boolean {
		const internalPlugins = (this.app as unknown as {
			internalPlugins?: {
				getEnabledPluginById(id: string): InternalBasesPlugin | null;
			};
		}).internalPlugins;

		const bases = internalPlugins?.getEnabledPluginById('bases');
		if (!bases) {
			return false;
		}

		this.basesPlugin = bases;
		this.patchRegistrations(bases);
		this.patchRegisterView(bases);
		this.findAndPatchNewItemMenuProto();

		return true;
	}

	public teardown(): void {
		// Restore registrations options
		if (this.basesPlugin) {
			for (const [type, origOptions] of this.originalOptions.entries()) {
				const reg = this.basesPlugin.getRegistration(type);
				if (reg) {
					reg.options = origOptions;
				}
			}
			this.originalOptions.clear();

			if (this.originalRegisterView) {
				this.basesPlugin.registerView = this.originalRegisterView;
				this.originalRegisterView = undefined;
			}
		}

		// Restore newItemMenu.open
		if (this.patchedProto && this.originalNewItemMenuOpen) {
			this.patchedProto.open = this.originalNewItemMenuOpen;
			this.patchedProto = undefined;
			this.originalNewItemMenuOpen = undefined;
		}
	}

	private patchRegistrations(bases: InternalBasesPlugin): void {
		const registrations = bases.getRegistrations();
		for (const [type, reg] of Object.entries(registrations)) {
			this.wrapViewOptions(type, reg);
			this.wrapFactory(reg);
		}
	}

	private patchRegisterView(bases: InternalBasesPlugin): void {
		const origRegisterView = bases.registerView.bind(bases);
		this.originalRegisterView = origRegisterView;

		bases.registerView = (type: string, reg: BasesViewRegistrationInternal) => {
			this.wrapViewOptions(type, reg);
			this.wrapFactory(reg);
			origRegisterView(type, reg);
		};
	}

	private wrapViewOptions(type: string, reg: BasesViewRegistrationInternal): void {
		if (this.originalOptions.has(type)) {
			return;
		}

		const origOptions = reg.options;
		this.originalOptions.set(type, origOptions);

		reg.options = (config: BasesViewConfig): BasesAllOptions[] => {
			const options = origOptions ? [...origOptions(config)] : [];

			const hasTemplateOption = options.some(
				(opt) =>
					(opt as unknown as { key?: string }).key === 'template' ||
					(opt as unknown as { items?: Array<{ key?: string }> }).items?.some(
						(i) => i.key === 'template',
					),
			);

			if (!hasTemplateOption) {
				options.push({
					type: 'file',
					key: 'template',
					displayName: 'Template',
					placeholder: 'Select template file...',
					filter: (file: TFile) => file.extension === 'md',
				} as unknown as BasesAllOptions);
			}

			return options;
		};
	}

	private wrapFactory(reg: BasesViewRegistration): void {
		const origFactory = reg.factory;
		reg.factory = (controller, containerEl) => {
			const view = origFactory(controller, containerEl);
			const internalCtrl = controller as unknown as BasesQueryControllerInternal;
			if (internalCtrl?.newItemMenu) {
				this.patchNewItemMenuProto(internalCtrl.newItemMenu);
			}
			return view;
		};
	}

	private findAndPatchNewItemMenuProto(): void {
		// Check existing leaves of type 'bases'
		const baseLeaves = this.app.workspace.getLeavesOfType('bases');
		for (const leaf of baseLeaves) {
			const view = leaf.view as unknown as { controller?: BasesQueryControllerInternal };
			if (view?.controller?.newItemMenu) {
				this.patchNewItemMenuProto(view.controller.newItemMenu);
				return;
			}
		}
	}

	private patchNewItemMenuProto(newItemMenuInstance: BasesNewItemMenu): void {
		const proto = Object.getPrototypeOf(newItemMenuInstance) as BasesNewItemMenu;
		if (!proto || this.patchedProto) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/unbound-method -- Save original open method to delegate and restore on unload
		const origOpen = proto.open;
		this.originalNewItemMenuOpen = origOpen;
		this.patchedProto = proto;

		// eslint-disable-next-line @typescript-eslint/no-this-alias -- Preserve reference to BasesPatcher instance inside function expression
		const self = this;

		proto.open = async function (
			baseFileName?: string,
			frontmatterProcessor?: (frontmatter: Record<string, unknown>, file: TFile) => void,
		): Promise<void> {
			const queryController = this.queryController;
			const viewConfig = this.viewConfig ?? queryController?.getViewConfig();
			const templateSetting = viewConfig?.get('template');

			if (!templateSetting || typeof templateSetting !== 'string') {
				return origOpen.call(this, baseFileName, frontmatterProcessor);
			}

			const templateFile = resolveTemplateFile(
				self.app,
				templateSetting,
				queryController?.sourcePath,
			);

			if (!templateFile) {
				new Notice(`Base template not found: "${templateSetting}"`);
				return origOpen.call(this, baseFileName, frontmatterProcessor);
			}

			let templateRaw = '';
			try {
				templateRaw = await self.app.vault.read(templateFile);
			} catch (err) {
				console.error('Base Template: failed to read template file', err);
				new Notice('Failed to read template note');
				return origOpen.call(this, baseFileName, frontmatterProcessor);
			}

			const templateCache = self.app.metadataCache.getFileCache(templateFile);
			const rawTemplateFrontmatter: Record<string, unknown> = templateCache?.frontmatter
				? { ...templateCache.frontmatter }
				: {};
			delete rawTemplateFrontmatter.position;

			const fileManager = self.app.fileManager as FileManagerInternal;
			// eslint-disable-next-line @typescript-eslint/unbound-method -- Storing reference to restore in finally
			const origCreateNewFile = fileManager.createNewFile;

			const query = this.query;
			const origRootTemplate = query?.newItemTemplate;
			if (query && query.newItemTemplate) {
				// Temporarily clear root template so view template takes precedence and target folder is not forced to root template
				query.newItemTemplate = undefined;
			}

			const templateOptions = getObsidianTemplateOptions(self.app);

			// Intercept createNewFile to populate with rendered template
			fileManager.createNewFile = async function (...args: Parameters<FileManagerInternal['createNewFile']>) {
				const created = await origCreateNewFile.apply(fileManager, args);

				if (created instanceof TFile) {
					try {
						const rendered = await applyTemplateEngine(
							self.app,
							created,
							templateRaw,
							templateOptions,
						);
						await self.app.vault.modify(created, rendered);
					} catch (modifyErr) {
						console.error('Base Template: failed to populate template content', modifyErr);
					}
				}
				return created;
			};

			const wrappedProcessor = (
				frontmatter: Record<string, unknown>,
				file: TFile,
			) => {
				const currentBaseProps = { ...frontmatter };
				mergeFrontmatter(frontmatter, rawTemplateFrontmatter, currentBaseProps);

				if (frontmatterProcessor) {
					frontmatterProcessor(frontmatter, file);
				}
			};

			try {
				await origOpen.call(this, baseFileName, wrappedProcessor);
			} finally {
				fileManager.createNewFile = origCreateNewFile;
				if (query) {
					query.newItemTemplate = origRootTemplate;
				}
			}
		};
	}
}
