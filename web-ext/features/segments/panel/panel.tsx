/** @jsxImportSource dom-chef-jsx */
import { getAutoLoadPin, getSavedConfigs } from "../segmentStore";
import type { SegmentConfig } from "../types";
import { buildConfigManager } from "./configManager";
import { buildHeader } from "./header";
import { buildSegmentList } from "./segmentList";
import { buildAdvancedSection } from "./sequenceEditor";
import * as state from "./state";

export { activeConfig, setOnConfigChange } from "./state";
export { mutateConfig } from "./mutations";

// The below-video control panel. The element is created once; re-renders
// replace its contents, dom-chef having no reconciler.
export const SegmentPanel: HTMLElement = (
  <div
    id="tppng-segment-panel"
    style={{
      display: "none",
      background: "var(--yt-spec-base-background, #0f0f0f)",
      border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1))",
      borderRadius: "12px",
      padding: "12px 16px",
      margin: "8px 0 4px",
      color: "var(--yt-spec-text-primary, #fff)",
      fontFamily: '"YouTube Sans","Roboto",sans-serif',
      fontSize: "13px",
      boxSizing: "border-box",
    }}
  >
    <div id="tppng-sp-inner" />
  </div>
);

export async function setupSegmentPanel(videoId: string): Promise<void> {
  state.setVideo(videoId);
  // Storage failures must not throw: setupSegments wires the button click
  // handler after this call, and a rejection would leave a dead button.
  try {
    const [saved, pin] = await Promise.all([getSavedConfigs(videoId), getAutoLoadPin(videoId)]);
    state.setSavedConfigs(saved);
    state.setPin(pin);
  } catch (error) {
    console.error("[toppings] segment storage unavailable", error);
    state.setSavedConfigs([]);
    state.setPin(null);
  }
}

export function showSegmentPanel(): void {
  SegmentPanel.style.display = "block";
  if (state.activeConfig) renderPanel(state.activeConfig);
}

export function hideSegmentPanel(): void {
  SegmentPanel.style.display = "none";
}

export function renderSegmentPanel(config: SegmentConfig): void {
  state.setActiveConfig(config);
  if (SegmentPanel.style.display !== "none") renderPanel(config);
}

export function getCachedNamedConfigs(): SegmentConfig[] {
  return state.savedConfigs;
}

export const refreshNamedConfigsCache = state.reloadSavedConfigs;

function renderPanel(config: SegmentConfig): void {
  const inner = document.getElementById("tppng-sp-inner");
  if (!inner) return;
  inner.replaceChildren(state.viewMode === "manage" ? buildConfigManager(config) : buildMainView(config));
}

state.setRenderer(renderPanel);

function buildMainView(config: SegmentConfig): HTMLElement {
  return (
    <div>
      {buildHeader(config)}
      <div id="tppng-sp-body" style={{ display: state.panelCollapsed ? "none" : "block" }}>
        {buildSegmentList(config)}
        {buildAdvancedSection(config)}
      </div>
    </div>
  );
}
