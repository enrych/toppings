import { Config } from "./store";

export interface WorkerConfig {
  generalSettings: WorkerConfigGeneralSettings;
  routes?: WorkerConfigRoutes;
}

export interface WorkerConfigGeneralSettings {
  isEnabled: boolean;
}

export interface WorkerConfigRoutes {
  [route: string]: {
    isEnabled: boolean;
    keybindings?: Record<string, string>;
    preferences?: Record<string, any>;
  };
}

export function getConfig(): Promise<Config> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(undefined, (storage) => {
      resolve(storage as Config);
    });
  });
}

export function getAllWorkersConfigs(): Promise<Record<string, WorkerConfig>> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("workers", (storage) => {
      resolve(storage.workers);
    });
  });
}

function getWorkerConfig(worker: string): Promise<WorkerConfig> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("workers", (storage) => {
      resolve(storage.workers[worker]);
    });
  });
}

export default getWorkerConfig;
