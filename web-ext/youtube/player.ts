import { findWithin, resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

// Matched by its icon: the row has no id, and its label is in the viewer's
// language.
const SPEED_ROW_STRATEGIES = [`.ytp-settings-menu .ytp-panel-menu > .ytp-menuitem:has(path[d^="M12 1c1.44 0 2.87.28 4.21.83"])`] as const;
const SPEED_ROW_ENGLISH_LABEL = "Playback speed";

const normalLabels = new WeakMap<Element, string>();

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

// The bar itself, not its container: it is the stacking context YouTube
// layers its progress fill, chapter marks and playhead dot in.
export function resolveProgressBar(): Promise<PrimitiveResolution> {
  return resolveTarget(["div.ytp-progress-bar-container div.ytp-progress-bar", "div.ytp-progress-bar-container"]);
}

// Where a panel goes to sit under the player, above the title.
export function resolveBelowPlayer(): Promise<PrimitiveResolution> {
  return resolveTarget(["#above-the-fold", "ytd-watch-flexy #below", "#secondary-inner", "#columns"]);
}

// The slider-and-chips panel YouTube opens for "Playback speed".
export function resolveRatePanel(): Promise<PrimitiveResolution> {
  return resolveTarget([".ytp-settings-menu .ytp-variable-speed-panel-content"]);
}

// The player a control belongs to. Its settings menu stays in the page while
// closed, so lookups inside it do not require anything to be on screen.
export function playerOf(control: Element): ParentNode {
  return control.closest(".html5-video-player") ?? document;
}

// The English label keeps English players working if YouTube swaps the icon.
export function findSpeedRow(inPlayer: Element): PrimitiveResolution {
  const player = playerOf(inPlayer);
  const byIcon = findWithin(player, SPEED_ROW_STRATEGIES);
  if (byIcon.resolved) return byIcon;
  for (const label of player.querySelectorAll(".ytp-settings-menu .ytp-menuitem-label")) {
    if (label.textContent === SPEED_ROW_ENGLISH_LABEL && label.parentElement) {
      return { resolved: true, element: label.parentElement, strategyIndex: SPEED_ROW_STRATEGIES.length };
    }
  }
  return byIcon;
}

// YouTube words 1x in the viewer's language ("Normal", "Standard") and every
// other rate as a bare number, so the word is kept from YouTube's own label.
export function showRateInSpeedRow(row: Element, rate: number): void {
  const value = row.querySelector(".ytp-menuitem-content");
  if (!value) return;
  const shown = value.textContent ?? "";
  if (shown && !/\p{Nd}/u.test(shown)) normalLabels.set(row, shown);
  value.textContent = rate === 1 ? (normalLabels.get(row) ?? "1") : String(Number(rate.toFixed(4)));
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

// Ads play in the content's own <video>; YouTube marks the player meanwhile.
export function isAdShowing(video: Element): boolean {
  return video.closest(".html5-video-player")?.classList.contains("ad-showing") ?? false;
}
