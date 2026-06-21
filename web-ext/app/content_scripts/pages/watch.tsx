import React from "dom-chef";
import {
  setupSegments,
  SegmentButton,
  SegmentPanel,
  initMarkers,
  toggleSegmentsLastUsed,
  activateFreshSegments,
  setActiveSegmentStart,
  setActiveSegmentEnd,
  nudgeActiveSegmentStart,
  nudgeActiveSegmentEnd,
  saveSegmentsShortcut,
  activateNamedConfig,
  getCachedNamedConfigs,
} from "../components/Segments";
import { matchesBinding } from "../../../utils/keybinding";
import { coalesce, defaultTo } from "../../../utils/access";
import { isNull } from "../../../utils/validation";
import { WatchContext } from "../../background/context";
import { Storage } from "../../background/store";
import { resolveTarget } from "../../../utils/primitive";
import { setCapabilityStatus } from "../../../utils/storage/capabilityCache";
import { applyWatchProfile } from "../primitives/applyProfile";
import {
  getAllProfiles,
  getActiveProfile,
  setActiveProfileId,
} from "../../../utils/storage/profileStore";
import { BUILT_IN_PRESETS } from "../../../data/profiles.data";
import { showPageToast } from "../utils/pageToast";
import { injectGearMenuEntry } from "../components/GearMenuPanel";
import { getCachedPlaylist } from "../../../utils/storage/playlistCache";
import { formatDurationSeconds } from "../../../utils/duration";

// ---------------------------------------------------------------------------
// Selector strategy registries
//
// Each array is ordered by likelihood (current / most common variant first).
// To support a new YouTube UI variant, append a selector to the relevant
// array — no other code needs to change.
// ---------------------------------------------------------------------------

const STRATEGIES = {
  /** Main video element. */
  player: ["video"] as const,

  /** Right-hand player control bar — where we inject our buttons. */
  rightControls: [
    "div.ytp-right-controls",
  ] as const,

  /** Progress bar container — where we inject loop segment markers. */
  progressBar: [
    "div.ytp-progress-bar-container",
  ] as const,

  /** Below-video area — where the segment panel is injected. */
  panelHost: [
    "#above-the-fold",
    "ytd-watch-flexy #below",
    "#secondary-inner",
    "#columns",
  ] as const,

  /** Gear/settings button that opens the player settings panel. */
  settingsButton: [
    "button.ytp-settings-button",
  ] as const,

  /** Playback speed panel when opened from settings menu. */
  playbackRatePanel: [
    ".ytp-panel-animate-forward",
    ".ytp-panel.ytp-panel-animate-forward",
  ] as const,

  /** Double-tap seek overlay shown after A/D seek shortcuts. */
  doubleTapSeek: [
    ".ytp-doubletap-ui-legacy",
    ".ytp-doubletap-ui",
  ] as const,
} as const;

let player: HTMLVideoElement | undefined;
let playbackMenuButton: HTMLElement | undefined;
let preferences: Storage["preferences"]["watch"] | undefined;
let gearMenuEnabled = false;

const onWatchPage = async (ctx: WatchContext) => {
  const { store } = ctx;
  preferences = store.preferences.watch;
  gearMenuEnabled = !!(store.ui?.gearMenuEnabled);
  if (isNull(preferences)) return;

  // Resolve video element — fundamental; bail if missing.
  const playerResolution = await resolveTarget(STRATEGIES.player, {
    stopOnDomReady: false,
  });
  void setCapabilityStatus("watch.player", "watch", playerResolution);
  if (!playerResolution.resolved) return;
  player = playerResolution.element as HTMLVideoElement;

  // Reset Player
  player.playbackRate = parseFloat(preferences.defaultPlaybackRate.value);
  const labels = document.querySelectorAll(".ytp-menuitem-label");
  if (labels.length !== 0) {
    for (const label of labels) {
      if (label.textContent === "Playback speed") {
        const playbackMenuButton = label.parentNode as HTMLElement;
        playbackMenuButton.children[2].textContent =
          player.playbackRate === 1
            ? "Normal"
            : `${Number(player.playbackRate.toFixed(2))}`;
        break;
      }
    }
  }

  // Keyboard Shortcuts
  document.removeEventListener("keydown", useShortcuts);
  document.addEventListener("keydown", useShortcuts);

  // Segment button — inject into right controls bar.
  const rightControlsResolution = await resolveTarget(STRATEGIES.rightControls);
  void setCapabilityStatus("watch.rightControls", "watch", rightControlsResolution);
  if (rightControlsResolution.resolved) {
    rightControlsResolution.element.prepend(SegmentButton);
  }

  // Inject segment panel below the video player FIRST so that renderPanel()
  // can find #tppng-sp-inner when setupSegments auto-loads a saved config.
  // resolveTarget polls until the element exists, avoiding the race where
  // YouTube's SPA content hasn't rendered yet on a fresh page load.
  const panelHostResolution = await resolveTarget(STRATEGIES.panelHost, {
    stopOnDomReady: false,
  });
  if (panelHostResolution.resolved) {
    document.getElementById("tppng-segment-panel")?.remove();
    (panelHostResolution.element as HTMLElement).prepend(SegmentPanel);
  }

  // Segments — set up engine + markers + panel.
  const progressBarResolution = await resolveTarget(STRATEGIES.progressBar);
  void setCapabilityStatus("watch.progressBar", "watch", progressBarResolution);
  if (progressBarResolution.resolved) {
    await setupSegments(
      ctx.payload.videoId ?? undefined,
      preferences.segments?.autoLoad ?? "off",
    );
    // Wire marker controller to the progress bar container.
    if (player) {
      initMarkers(
        progressBarResolution.element as HTMLElement,
        player,
      );
    }
  }

  // Settings button — attach listener for playback speed menu.
  const settingsResolution = await resolveTarget(STRATEGIES.settingsButton);
  void setCapabilityStatus("watch.settingsButton", "watch", settingsResolution);
  if (!settingsResolution.resolved) return;
  const playerSettingsButton = settingsResolution.element as HTMLElement;
  playerSettingsButton.removeEventListener("click", onSettingsMenu);
  playerSettingsButton.addEventListener("click", onSettingsMenu);

  // Apply the active profile's watch-scope primitives (or restore defaults
  // if no profile is active). This runs after all setup above so Audio Mode
  // and other components are fully initialised before profile overrides land.
  void applyWatchProfile();

  // React to profile changes made from the popup or options page without a
  // full page reload. The listener is idempotent — re-adding via
  // addListener with the same function reference is a no-op in MV3.
  chrome.storage.onChanged.removeListener(onProfileStoreChanged);
  chrome.storage.onChanged.addListener(onProfileStoreChanged);

  // If watching as part of a playlist, inject runtime info into the
  // watch page's playlist panel.
  const listId = new URL(window.location.href).searchParams.get("list");
  if (listId) {
    void injectPlaylistRuntimeInWatchPanel(listId);
  }
};

// ---------------------------------------------------------------------------
// Playlist runtime in watch panel (#4)
// ---------------------------------------------------------------------------

const WATCH_PANEL_RUNTIME_ID = "tppng-watch-playlist-runtime";

/**
 * Strategies for the playlist panel header inside the watch page.
 * Ordered by most common YouTube layout variant first.
 */
const WATCH_PLAYLIST_PANEL_STRATEGIES = [
  "#playlist-container .ytd-playlist-panel-renderer #header",
  "ytd-playlist-panel-renderer #header",
  "#secondary ytd-playlist-panel-renderer #header-title",
  "#secondary ytd-playlist-panel-renderer",
] as const;

async function injectPlaylistRuntimeInWatchPanel(playlistId: string): Promise<void> {
  const data = await getCachedPlaylist(playlistId);
  if (!data) return; // No cached data — skip (playlist page will cache on visit)

  const panelResolution = await resolveTarget(WATCH_PLAYLIST_PANEL_STRATEGIES);
  if (!panelResolution.resolved) return;

  const header = panelResolution.element as HTMLElement;

  // Remove existing badge if already injected (SPA navigation).
  header.querySelector(`#${WATCH_PANEL_RUNTIME_ID}`)?.remove();

  const badge = document.createElement("div");
  badge.id = WATCH_PANEL_RUNTIME_ID;
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--yt-spec-text-secondary, rgba(255,255,255,0.7));
    margin-top: 4px;
    font-family: "YouTube Sans","Roboto",sans-serif;
  `;

  badge.innerHTML = `
    <span title="Total playlist runtime">⏱ ${formatDurationSeconds(data.totalRuntime)}</span>
    <span style="opacity:0.4">·</span>
    <span title="Average video runtime">avg ${formatDurationSeconds(data.averageRuntime)}</span>
  `;

  header.appendChild(badge);
}

/**
 * Fired whenever chrome.storage.local changes. Re-applies the watch profile
 * when the active profile store is updated from the popup or options page.
 */
const onProfileStoreChanged = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string,
): void => {
  if (area !== "local") return;
  if (!("toppings:profile_store" in changes)) return;
  void applyWatchProfile();
};

const onSettingsMenu = async (): Promise<void> => {
  if (isNull(player)) return;

  const menuItemLabelResolution = await resolveTarget([".ytp-menuitem-label"], {
    stopOnDomReady: false,
  });
  if (!menuItemLabelResolution.resolved) return;
  const labels = document.querySelectorAll(".ytp-menuitem-label");
  if (labels.length === 0) return;

  for (const label of labels) {
    if (label.textContent === "Playback speed") {
      playbackMenuButton = label.parentNode as HTMLElement;
      playbackMenuButton.children[2].textContent =
        player.playbackRate === 1
          ? "Normal"
          : `${Number(player.playbackRate.toFixed(2))}`;

      playbackMenuButton.removeEventListener("click", onPlaybackRateMenu);
      playbackMenuButton.addEventListener("click", onPlaybackRateMenu);
      break;
    }
  }

  // Inject the Toppings entry into the gear menu settings panel (opt-in).
  if (gearMenuEnabled) {
    const settingsMenu = document.querySelector(
      ".ytp-settings-menu",
    ) as HTMLElement | null;
    if (settingsMenu) {
      void injectGearMenuEntry(settingsMenu);
    }
  }
};

const onPlaybackRateMenu = async (): Promise<void> => {
  if (isNull(player) || isNull(preferences)) return;
  if (preferences.customPlaybackRates.length === 0) return;

  const panelResolution = await resolveTarget(STRATEGIES.playbackRatePanel, {
    stopOnDomReady: false,
  });
  if (!panelResolution.resolved) return;
  const playbackRatePanel = panelResolution.element as HTMLElement;

  const menuPanelOptions = playbackRatePanel.querySelector(
    ".ytp-panel-options",
  ) as HTMLElement | null;
  if (menuPanelOptions) {
    menuPanelOptions.style.display = "none";
  }

  replacePlaybackItems(playbackRatePanel);
};

const replacePlaybackItems = (playbackRatePanel: HTMLElement) => {
  if (isNull(player)) return;
  if (isNull(preferences)) return;

  // Replace Native PlaybackRate Items
  const panelMenu = playbackRatePanel.querySelector(".ytp-panel-menu");
  if (isNull(panelMenu)) return;

  const currentRate = player.playbackRate;
  const isPresetRate = preferences.customPlaybackRates.some(
    (rate) => parseFloat(rate) === currentRate,
  );

  const playbackRateItems = preferences.customPlaybackRates.map(
    (playbackRate) => {
      const label = parseFloat(playbackRate) === 1 ? "Normal" : Number(playbackRate);
      const isAriaChecked =
        parseFloat(playbackRate) === currentRate ? "true" : "false";

      return (
        <div
          key={playbackRate}
          className="ytp-menuitem tw-tppng-playback-item"
          role="menuitemradio"
          aria-checked={isAriaChecked}
          tabIndex={0}
          data-tppng-playback-rate={playbackRate}
          onClick={(_event) => {
            const panelBackButton = document.querySelector(
              ".ytp-panel-back-button",
            ) as HTMLElement | null;
            if (!isNull(panelBackButton)) {
              panelBackButton.click();
            }
            setPlaybackRate(Number(playbackRate));
          }}
        >
          <div className="ytp-menuitem-label">{label}</div>
        </div>
      );
    },
  );

  const customPlaybackRateItem = (
    <div
      className="ytp-menuitem tw-tppng-playback-item"
      id="tppng-playback-custom-item"
      role="menuitemradio"
      aria-checked={isPresetRate ? "false" : "true"}
      tabIndex={0}
      style={{ display: isPresetRate ? "none" : "" }}
      onClick={(_event) => {
        const panelBackButton = document.querySelector(
          ".ytp-panel-back-button",
        ) as HTMLElement | null;
        if (!isNull(panelBackButton)) {
          panelBackButton.click();
        }
        setPlaybackRate(
          Number(
            defaultTo(player!.getAttribute("data-tppng-playback-rate"), "1"),
          ),
        );
      }}
    >
      <div className="ytp-menuitem-label">
        Custom (
        {Number(
          coalesce(
            player!.getAttribute("data-tppng-playback-rate"),
            String(player!.playbackRate),
          ),
        )}
        )
      </div>
    </div>
  );

  panelMenu.replaceChildren(customPlaybackRateItem, ...playbackRateItems);
};

const useShortcuts = (event: KeyboardEvent): void => {
  if (isNull(player) || isNull(preferences)) return;

  const target = event.target as HTMLElement;
  const tagName = target?.tagName;
  const isNotEditable =
    tagName !== "INPUT" &&
    tagName !== "TEXTAREA" &&
    !target.matches("#contenteditable-root.yt-formatted-string");

  if (!isNotEditable) return;

  // ---------------------------------------------------------------------------
  // Segment nudge (accelerating, modifier-aware) — targets active segment
  // ---------------------------------------------------------------------------
  if (preferences.nudgeLoopSegment) {
    const cfg = preferences.nudgeLoopSegment;
    const baseStep = Math.max(0.1, parseFloat(cfg.baseStep) || 1);
    const multiplier = Math.max(1, parseFloat(cfg.multiplier) || 2);
    const maxStep = Math.max(baseStep, parseFloat(cfg.maxStep) || 16);

    if (matchesBinding(event, cfg.startBackwardKey)) {
      event.preventDefault();
      nudgeActiveSegmentStart("backward", baseStep, multiplier, maxStep);
      return;
    }
    if (matchesBinding(event, cfg.startForwardKey)) {
      event.preventDefault();
      nudgeActiveSegmentStart("forward", baseStep, multiplier, maxStep);
      return;
    }
    if (matchesBinding(event, cfg.endForwardKey)) {
      event.preventDefault();
      nudgeActiveSegmentEnd("forward", baseStep, multiplier, maxStep);
      return;
    }
    if (matchesBinding(event, cfg.endBackwardKey)) {
      event.preventDefault();
      nudgeActiveSegmentEnd("backward", baseStep, multiplier, maxStep);
      return;
    }
  }

  // ---------------------------------------------------------------------------
  // All other watch shortcuts — checked with exact modifier matching.
  // ---------------------------------------------------------------------------
  if (matchesBinding(event, preferences.togglePlaybackRate.key)) {
    setPlaybackRate(
      player.playbackRate !== 1
        ? 1
        : Number(preferences.togglePlaybackRate.value),
    );
    return;
  }

  if (matchesBinding(event, preferences.seekBackward.key)) {
    const value = Number(preferences.seekBackward.value);
    player.currentTime -= value;
    onDoubleTapSeek("back", value);
    return;
  }

  if (matchesBinding(event, preferences.seekForward.key)) {
    const value = Number(preferences.seekForward.value);
    player.currentTime += value;
    onDoubleTapSeek("forward", value);
    return;
  }

  if (matchesBinding(event, preferences.increasePlaybackRate.key)) {
    const value = Number(preferences.increasePlaybackRate.value);
    const increasedPlaybackRate = Number((player.playbackRate + value).toFixed(2));
    if (increasedPlaybackRate <= 16) {
      setPlaybackRate(increasedPlaybackRate);
    }
    return;
  }

  if (matchesBinding(event, preferences.decreasePlaybackRate.key)) {
    const value = Number(preferences.decreasePlaybackRate.value);
    const decreasedPlaybackRate = Number((player.playbackRate - value).toFixed(2));
    if (decreasedPlaybackRate >= 0.0625) {
      setPlaybackRate(decreasedPlaybackRate);
    }
    return;
  }

  // Z — load last-used segments / toggle off
  if (matchesBinding(event, preferences.toggleLoopSegment.key)) {
    void toggleSegmentsLastUsed();
    return;
  }

  // Shift+Z (or configurable) — fresh slate
  if (matchesBinding(event, preferences.segments?.freshSlateKey ?? "Shift+Z")) {
    activateFreshSegments();
    return;
  }

  // Q / E — set active segment's start / end to playhead
  if (matchesBinding(event, preferences.setLoopSegmentBegin.key)) {
    setActiveSegmentStart();
    return;
  }

  if (matchesBinding(event, preferences.setLoopSegmentEnd.key)) {
    setActiveSegmentEnd();
    return;
  }

  // Save shortcut — save active config to default slot (or clear last-used)
  if (preferences.saveLoopSegment?.key && matchesBinding(event, preferences.saveLoopSegment.key)) {
    void saveSegmentsShortcut();
    return;
  }

  // Named config shortcuts — sync cache lookup (no DB hit on every keydown)
  const namedConfigs = getCachedNamedConfigs();
  for (const config of namedConfigs) {
    if (config.shortcutKey && matchesBinding(event, config.shortcutKey)) {
      void activateNamedConfig(config);
      return;
    }
  }

  if (preferences.cycleProfiles?.key && matchesBinding(event, preferences.cycleProfiles.key)) {
    void cycleProfilesShortcut();
    return;
  }
};

/**
 * Cycle through all available profiles (presets first, then custom) plus the
 * "no profile" state. On each invocation, advance one step and apply the next
 * profile, then show a brief on-page toast with the profile name.
 */
async function cycleProfilesShortcut(): Promise<void> {
  // Build the ordered cycle: [null (no profile), ...presets, ...custom]
  const customProfiles = await getAllProfiles();
  // getAllProfiles returns only custom (non-preset) profiles.
  const cycle: Array<{ id: string | null; name: string }> = [
    { id: null, name: "Default" },
    ...BUILT_IN_PRESETS.map((p) => ({ id: p.id, name: p.name })),
    ...customProfiles.map((p) => ({ id: p.id, name: p.name })),
  ];

  const activeProfile = await getActiveProfile();
  const currentId = activeProfile?.id ?? null;

  const currentIdx = cycle.findIndex((c) => c.id === currentId);
  const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % cycle.length;
  const next = cycle[nextIdx];

  await setActiveProfileId(next.id);
  void applyWatchProfile(); // reads storage; next.id is already set
  showPageToast(`Profile: ${next.name}`);
}


let doubleTapSeekTimeout: ReturnType<typeof setTimeout>;
const onDoubleTapSeek = (dataSide: "back" | "forward", time: number): void => {
  // Use synchronous querySelector here — the double-tap element is always
  // present in the DOM once the player is loaded, so resolveTarget's async
  // path is not needed.
  const selector = STRATEGIES.doubleTapSeek.find((s) =>
    document.querySelector(s),
  );
  const doubleTapSeekElement = selector
    ? (document.querySelector(selector) as HTMLElement | null)
    : null;
  if (!isNull(doubleTapSeekElement)) {
    doubleTapSeekElement.setAttribute("data-side", dataSide);
    doubleTapSeekElement.style.display = "";
    const doubleTapSeekLabel = doubleTapSeekElement.querySelector(
      ".ytp-doubletap-tooltip-label",
    ) as HTMLElement;
    if (!isNull(doubleTapSeekLabel)) {
      doubleTapSeekLabel.textContent = `${time} seconds`;
    }
    const staticCircle = document.querySelector(
      ".ytp-doubletap-static-circle",
    ) as HTMLElement;
    if (!isNull(staticCircle) && dataSide === "back") {
      staticCircle.style.top = "50%";
      staticCircle.style.left = "10%";
      staticCircle.style.width = "110px";
      staticCircle.style.height = "110px";
      staticCircle.style.transform = "translate(-14px, -40px)";
    } else if (!isNull(staticCircle) && dataSide === "forward") {
      staticCircle.style.top = "50%";
      staticCircle.style.left = "80%";
      staticCircle.style.width = "110px";
      staticCircle.style.height = "110px";
      staticCircle.style.transform = "translate(-28px, -40px)";
    }
    clearTimeout(doubleTapSeekTimeout);
    doubleTapSeekTimeout = setTimeout(() => {
      (doubleTapSeekElement as HTMLElement).setAttribute("data-side", "null");
      (doubleTapSeekElement as HTMLElement).style.display = "none";
      const doubleTapLabel = (
        doubleTapSeekElement as HTMLElement
      ).querySelector(".ytp-doubletap-tooltip-label");
      if (!isNull(doubleTapLabel)) {
        doubleTapLabel.textContent = "5 seconds";
      }
      staticCircle.style.cssText = "null";
    }, 500);
  }
};

const setPlaybackRate = (rate: number): void => {
  if (isNull(player)) return;

  const prevPlaybackRate = player.playbackRate.toFixed(2);
  const prevPlaybackMenuItem =
    document.querySelector(
      `.tppng-playback-item[data-tppng-playback-rate="${prevPlaybackRate}"]`,
    ) || document.querySelector("#tppng-playback-custom-item");
  if (prevPlaybackMenuItem) {
    prevPlaybackMenuItem.ariaChecked = "false";
  }

  player.playbackRate = rate;

  const nextPlaybackRate = player.playbackRate.toFixed(2);
  const nextPlaybackMenuItem: HTMLElement | null =
    document.querySelector(
      `.tppng-playback-item[data-tppng-playback-rate="${nextPlaybackRate}"]`,
    ) || document.querySelector("#tppng-playback-custom-item");
  if (nextPlaybackMenuItem) {
    nextPlaybackMenuItem.ariaChecked = "true";
    if (nextPlaybackMenuItem.id === "tppng-playback-custom-item") {
      player.setAttribute(
        "data-tppng-playback-rate",
        player.playbackRate.toFixed(2),
      );
      nextPlaybackMenuItem.style.display = "";
      const customPlaybackItemLabel = document.querySelector(
        "#tppng-playback-custom-item > .ytp-menuitem-label",
      );
      if (customPlaybackItemLabel) {
        customPlaybackItemLabel.textContent = `Custom (${player.playbackRate})`;
      }
    }
  }

  if (!isNull(playbackMenuButton)) {
    playbackMenuButton.children[2].textContent =
      player.playbackRate === 1
        ? "Normal"
        : `${Number(player.playbackRate.toFixed(2))}`;
  }
};

export default onWatchPage;
