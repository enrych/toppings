export interface WorkerConfig {
	generalSettings: WorkerConfigGeneralSettings;
	routes?: Record<string, WorkerConfigRouteConfig>;
}

export interface WorkerConfigGeneralSettings {
	isEnabled: boolean;
}

export interface WorkerConfigRouteConfig {
	isEnabled: boolean;
	keybindings?: Record<string, string>;
	preferences?: Record<string, any>;
}
