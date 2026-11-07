import { EventRef, Plugin } from 'obsidian';
import { BasesPatcher } from './bases-patch';

export default class BaseTemplatePlugin extends Plugin {
	private patcher!: BasesPatcher;
	private basesEventRef?: EventRef;

	onload(): void {
		this.patcher = new BasesPatcher(this.app);

		this.app.workspace.onLayoutReady(() => {
			this.setupPatcher();
		});
	}

	onunload(): void {
		this.patcher?.teardown();
		if (this.basesEventRef) {
			const internalPlugins = (this.app as unknown as {
				internalPlugins?: {
					offref(ref: EventRef): void;
				};
			}).internalPlugins;
			internalPlugins?.offref(this.basesEventRef);
			this.basesEventRef = undefined;
		}
	}

	private setupPatcher(): void {
		const success = this.patcher.setup();
		if (!success && !this.basesEventRef) {
			const internalPlugins = (this.app as unknown as {
				internalPlugins?: {
					on(event: string, callback: () => void): EventRef;
				};
			}).internalPlugins;

			if (internalPlugins) {
				this.basesEventRef = internalPlugins.on('change', () => {
					if (this.patcher.setup()) {
						if (this.basesEventRef) {
							(this.app as unknown as {
								internalPlugins?: {
									offref(ref: EventRef): void;
								};
							}).internalPlugins?.offref(this.basesEventRef);
							this.basesEventRef = undefined;
						}
					}
				});
			}
		}
	}
}
