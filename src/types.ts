import {
	App,
	BasesAllOptions,
	BasesViewConfig,
	BasesViewRegistration,
	Component,
	FileManager,
	TFile,
	TFolder,
} from 'obsidian';

export interface FileManagerInternal extends FileManager {
	createNewFile(
		folder: TFolder | null,
		name?: string,
		ext?: string,
		initialContent?: string,
	): Promise<TFile>;
}

export interface InternalBasesPlugin {
	name: string;
	id: string;
	registrations: Record<string, BasesViewRegistrationInternal>;
	getRegistrations(): Record<string, BasesViewRegistrationInternal>;
	getRegistration(type: string): BasesViewRegistrationInternal | null;
	registerView(type: string, registration: BasesViewRegistrationInternal): void;
	deregisterView(type: string): void;
}

export type BasesViewRegistrationInternal = BasesViewRegistration & {
	options?: (config: BasesViewConfig) => BasesAllOptions[];
};

export interface BasesQueryControllerInternal {
	app: App;
	viewName: string;
	sourcePath: string;
	query?: {
		file?: TFile;
		newItemFolder?: string;
		newItemTemplate?: string;
		getViewConfig(name?: string): BasesViewConfig | undefined;
	};
	newItemMenu?: BasesNewItemMenu;
	getViewConfig(): BasesViewConfig | undefined;
}

export interface BasesNewItemMenu extends Component {
	app: App;
	queryController?: BasesQueryControllerInternal;
	query?: BasesQueryControllerInternal['query'];
	viewConfig?: BasesViewConfig;
	containerEl?: HTMLElement;
	button?: {
		buttonEl: HTMLElement;
	};
	popover?: unknown;
	newlyCreatedFile?: TFile | null;
	open(
		baseFileName?: string,
		frontmatterProcessor?: (frontmatter: Record<string, unknown>, file: TFile) => void,
	): Promise<void>;
}

export interface InternalTemplatesPlugin {
	options?: {
		folder?: string;
		dateFormat?: string;
		timeFormat?: string;
	};
}

export interface TemplateEngineOptions {
	dateFormat?: string;
	timeFormat?: string;
}

export interface TemplaterPlugin {
	templater?: {
		parse_template?: (
			opt: { target_file: TFile; run_mode: number },
			content: string,
		) => Promise<string>;
	};
}
