import { getSavedConfigs } from "../segmentStore";
import type { SegmentAutoLoadPin, SegmentConfig } from "../types";

// Module state shared by the panel's sections. Other modules read these
// bindings live and change them only through the functions below.
export let activeConfig: SegmentConfig | null = null;
export let currentVideoId: string | null = null;
export let savedConfigs: SegmentConfig[] = [];
export let currentPin: SegmentAutoLoadPin = null;
export let viewMode: "main" | "manage" = "main";
export let panelCollapsed = false;
export let advancedOpen = false;

let onConfigChange: ((config: SegmentConfig | null) => void) | null = null;
let renderer: ((config: SegmentConfig) => void) | null = null;

export function setOnConfigChange(callback: (config: SegmentConfig | null) => void): void {
  onConfigChange = callback;
}

// Sections re-render through here so none of them has to import the panel
// module that imports them.
export function setRenderer(fn: (config: SegmentConfig) => void): void {
  renderer = fn;
}

export function render(config: SegmentConfig): void {
  renderer?.(config);
}

export function setActiveConfig(config: SegmentConfig | null): void {
  activeConfig = config;
}

export function emitConfigChange(config: SegmentConfig | null): void {
  activeConfig = config;
  onConfigChange?.(config);
}

export function setVideo(videoId: string): void {
  currentVideoId = videoId;
  viewMode = "main";
}

export function setSavedConfigs(configs: SegmentConfig[]): void {
  savedConfigs = configs;
}

export async function reloadSavedConfigs(): Promise<void> {
  if (!currentVideoId) return;
  savedConfigs = await getSavedConfigs(currentVideoId);
}

export function setPin(pin: SegmentAutoLoadPin): void {
  currentPin = pin;
}

export function setViewMode(mode: "main" | "manage"): void {
  viewMode = mode;
}

export function toggleCollapsed(): boolean {
  panelCollapsed = !panelCollapsed;
  return panelCollapsed;
}

export function toggleAdvanced(): boolean {
  advancedOpen = !advancedOpen;
  return advancedOpen;
}
