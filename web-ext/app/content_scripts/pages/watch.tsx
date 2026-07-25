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
import { WatchContext } from "../../background/context";
import { Storage } from "../../background/store";
import { resolveTarget } from "../../../utils/primitive";
import { setCapabilityStatus } from "../../../core/capabilityCache";
import { applyWatchProfile } from "../primitives/applyProfile";
import {
  getAllProfiles,
  getActiveProfile,
  setActiveProfileId,
} from "../../../core/profileStore";
import { BUILT_IN_PRESETS } from "../../../data/profiles";
import { CHROME_STORAGE_LOCAL_KEY } from "../../../data/core";
import { showPageToast } from "../utils/pageToast";
import { injectGearMenuEntry } from "../components/GearMenuPanel";
import { getCachedPlaylist } from "./playlistCache";
import { formatDuration } from "../../../utils/duration";

// Each array is ordered most-likely-variant first, and resolveTarget walks it in
// order. Supporting a new YouTube layout means appending a selector here, nothing else.
const STRATEGIES = {
  player: ["video"] as const,

  rightControls: [
    "div.ytp-right-controls",
  ] as const,

  progressBar: [
    "div.ytp-progress-bar-container",
  ] as const,

  panelHost: [
    "#above-the-fold",
    "ytd-watch-flexy #below",
    "#secondary-inner",
    "#columns",
  ] as const,

  settingsButton: [
    "button.ytp-settings-button",
  ] as const,

  playbackRatePanel: [
    ".ytp-panel-animate-forward",
    ".ytp-panel.ytp-panel-animate-forward",
  ] as const,

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
  if (!preferences) return;

  const playerResolution = await resolveTarget(STRATEGIES.player, {
    stopOnDomReady: false,
  });
  void setCapabilityStatus("watch.player", "watch", playerResolution);
  if (!playerResolution.resolved) return;
  player = playerResolution.element as HTMLVideoElement;

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

  document.removeEventListener("keydown", useShortcuts);
  document.addEventListener("keydown", useShortcuts);

  const rightControlsResolution = await resolveTarget(STRATEGIES.rightControls);
  void setCapabilityStatus("watch.rightControls", "watch", rightControlsResolution);
  if (rightControlsResolution.resolved) {
    rightControlsResolution.element.prepend(SegmentButton);
  }

  // Must precede setupSegments: auto-loading a saved config renders into
  // #tppng-sp-inner, which does not exist until the panel is in the DOM.
  const panelHostResolution = await resolveTarget(STRATEGIES.panelHost, {
    stopOnDomReady: false,
  });
  if (panelHostResolution.resolved) {
    document.getElementById("tppng-segment-panel")?.remove();
    (panelHostResolution.element as HTMLElement).prepend(SegmentPanel);
  }

  const progressBarResolution = await resolveTarget(STRATEGIES.progressBar);
  void setCapabilityStatus("watch.progressBar", "watch", progressBarResolution);
  if (progressBarResolution.resolved) {
    await setupSegments(
      ctx.payload.videoId ?? undefined,
      preferences.segments?.autoLoad ?? "off",
    );
    if (player) {
      initMarkers(
        progressBarResolution.element as HTMLElement,
        player,
      );
    }
  }

  const settingsResolution = await resolveTarget(STRATEGIES.settingsButton);
  void setCapabilityStatus("watch.settingsButton", "watch", settingsResolution);
  if (!settingsResolution.resolved) return;
  const playerSettingsButton = settingsResolution.element as HTMLElement;
  playerSettingsButton.removeEventListener("click", onSettingsMenu);
  playerSettingsButton.addEventListener("click", onSettingsMenu);

  // Last, so profile overrides land on top of a fully initialised Audio Mode
  // and segment panel rather than being overwritten by their setup.
  void applyWatchProfile();

  // Remove-then-add keeps this single-registered across SPA navigations, which
  // re-run this whole function against the same page.
  chrome.storage.onChanged.removeListener(onProfileStoreChanged);
  chrome.storage.onChanged.addListener(onProfileStoreChanged);

  const listId = new URL(window.location.href).searchParams.get("list");
  if (listId) {
    void injectPlaylistRuntimeInWatchPanel(listId);
  }
};

const WATCH_PANEL_RUNTIME_ID = "tppng-watch-playlist-runtime";

const WATCH_PLAYLIST_PANEL_STRATEGIES = [
  "#playlist-container .ytd-playlist-panel-renderer #header",
  "ytd-playlist-panel-renderer #header",
  "#secondary ytd-playlist-panel-renderer #header-title",
  "#secondary ytd-playlist-panel-renderer",
] as const;

async function injectPlaylistRuntimeInWatchPanel(playlistId: string): Promise<void> {
  const data = await getCachedPlaylist(playlistId);
  if (!data) return; // Nothing cached until the user has opened the playlist page itself.

  const panelResolution = await resolveTarget(WATCH_PLAYLIST_PANEL_STRATEGIES);
  if (!panelResolution.resolved) return;

  const header = panelResolution.element as HTMLElement;

  // SPA navigation re-runs this against a header that may already carry a badge.
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
    <span title="Total playlist runtime">⏱ ${formatDuration(data.totalRuntime)}</span>
    <span style="opacity:0.4">·</span>
    <span title="Average video runtime">avg ${formatDuration(data.averageRuntime)}</span>
  `;

  header.appendChild(badge);
}

const onProfileStoreChanged = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string,
): void => {
  if (area !== "local") return;
  if (!(CHROME_STORAGE_LOCAL_KEY.PROFILE_STORE in changes)) return;
  void applyWatchProfile();
};

const onSettingsMenu = async (): Promise<void> => {
  if (!player) return;

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
  if (!player || !preferences) return;
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
  if (!player) return;
  if (!preferences) return;

  const panelMenu = playbackRatePanel.querySelector(".ytp-panel-menu");
  if (!panelMenu) return;

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
            if (panelBackButton) {
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
        if (panelBackButton) {
          panelBackButton.click();
        }
        setPlaybackRate(
          Number(
            player!.getAttribute("data-tppng-playback-rate") ?? "1",
          ),
        );
      }}
    >
      <div className="ytp-menuitem-label">
        Custom (
        {Number(player!.getAttribute("data-tppng-playback-rate") ?? String(player!.playbackRate))}
        )
      </div>
    </div>
  );

  panelMenu.replaceChildren(customPlaybackRateItem, ...playbackRateItems);
};

const useShortcuts = (event: KeyboardEvent): void => {
  if (!player || !preferences) return;

  const target = event.target as HTMLElement;
  const tagName = target?.tagName;
  const isNotEditable =
    tagName !== "INPUT" &&
    tagName !== "TEXTAREA" &&
    !target.matches("#contenteditable-root.yt-formatted-string");

  if (!isNotEditable) return;

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

  if (matchesBinding(event, preferences.toggleLoopSegment.key)) {
    void toggleSegmentsLastUsed();
    return;
  }

  if (matchesBinding(event, preferences.segments?.freshSlateKey ?? "Shift+Z")) {
    activateFreshSegments();
    return;
  }

  if (matchesBinding(event, preferences.setLoopSegmentBegin.key)) {
    setActiveSegmentStart();
    return;
  }

  if (matchesBinding(event, preferences.setLoopSegmentEnd.key)) {
    setActiveSegmentEnd();
    return;
  }

  if (preferences.saveLoopSegment?.key && matchesBinding(event, preferences.saveLoopSegment.key)) {
    void saveSegmentsShortcut();
    return;
  }

  // Reads a cache rather than storage: this runs on every keydown.
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

async function cycleProfilesShortcut(): Promise<void> {
  const customProfiles = await getAllProfiles();
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
  void applyWatchProfile(); // reads back the id set on the line above
  showPageToast(`Profile: ${next.name}`);
}


let doubleTapSeekTimeout: ReturnType<typeof setTimeout>;
const onDoubleTapSeek = (dataSide: "back" | "forward", time: number): void => {
  // Synchronous rather than resolveTarget: this fires on every seek keypress,
  // and the overlay is guaranteed present once the player has loaded.
  const selector = STRATEGIES.doubleTapSeek.find((s) =>
    document.querySelector(s),
  );
  const doubleTapSeekElement = selector
    ? (document.querySelector(selector) as HTMLElement | null)
    : null;
  if (doubleTapSeekElement) {
    doubleTapSeekElement.setAttribute("data-side", dataSide);
    doubleTapSeekElement.style.display = "";
    const doubleTapSeekLabel = doubleTapSeekElement.querySelector(
      ".ytp-doubletap-tooltip-label",
    ) as HTMLElement;
    if (doubleTapSeekLabel) {
      doubleTapSeekLabel.textContent = `${time} seconds`;
    }
    const staticCircle = document.querySelector(
      ".ytp-doubletap-static-circle",
    ) as HTMLElement;
    if (staticCircle && dataSide === "back") {
      staticCircle.style.top = "50%";
      staticCircle.style.left = "10%";
      staticCircle.style.width = "110px";
      staticCircle.style.height = "110px";
      staticCircle.style.transform = "translate(-14px, -40px)";
    } else if (staticCircle && dataSide === "forward") {
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
      if (doubleTapLabel) {
        doubleTapLabel.textContent = "5 seconds";
      }
      staticCircle.style.cssText = "null";
    }, 500);
  }
};

const setPlaybackRate = (rate: number): void => {
  if (!player) return;

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

  if (playbackMenuButton) {
    playbackMenuButton.children[2].textContent =
      player.playbackRate === 1
        ? "Normal"
        : `${Number(player.playbackRate.toFixed(2))}`;
  }
};

export default onWatchPage;
