import { resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

export function resolveVideo(): Promise<PrimitiveResolution> {
  return resolveTarget(["#movie_player video", "video.html5-main-video"]);
}

export function resolveMoviePlayer(): Promise<PrimitiveResolution> {
  return resolveTarget(["#movie_player"]);
}

export function resolveSettingsButton(): Promise<PrimitiveResolution> {
  return resolveTarget(["button.ytp-settings-button"]);
}

export function resolveRightControls(): Promise<PrimitiveResolution> {
  return resolveTarget(["div.ytp-right-controls"]);
}

export function resolveProgressBar(): Promise<PrimitiveResolution> {
  return resolveTarget(["div.ytp-progress-bar-container"]);
}

// Where a panel goes to sit under the player, above the title.
export function resolveBelowPlayer(): Promise<PrimitiveResolution> {
  return resolveTarget(["#above-the-fold", "ytd-watch-flexy #below", "#secondary-inner", "#columns"]);
}

// The slider-and-chips panel YouTube opens for "Playback speed".
export function resolveRatePanel(): Promise<PrimitiveResolution> {
  return resolveTarget([".ytp-settings-menu .ytp-variable-speed-panel-content"]);
}

export function findSettingsMenuItem(label: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(".ytp-menuitem-label")) {
    if (el.textContent === label) return el.parentElement;
  }
  return null;
}

export function formatRate(rate: number): string {
  return rate === 1 ? "Normal" : String(Number(rate.toFixed(2)));
}

// The value column of a settings-menu row, e.g. "Normal" next to "Playback speed".
export function setSettingsMenuValue(item: HTMLElement, text: string): void {
  const value = item.children[2] as HTMLElement | undefined;
  if (value) value.textContent = text;
}

export function ratePanelChips(panel: Element): HTMLElement | null {
  return panel.querySelector(".ytp-variable-speed-panel-chips");
}

// YouTube only redraws its panel from its own state, which a rate set
// straight on the <video> never reaches.
export function syncRatePanel(panel: Element, rate: number): void {
  const display = panel.querySelector(".ytp-variable-speed-panel-display span");
  if (display) display.textContent = `${rate.toFixed(2)}x`;
  const slider = panel.querySelector<HTMLInputElement>(".ytp-speedslider");
  if (slider) {
    if (Number(slider.max) < rate) slider.max = String(rate);
    slider.value = String(rate);
    slider.setAttribute("aria-valuenow", String(rate));
    slider.setAttribute("aria-valuetext", rate.toFixed(2));
  }
}
