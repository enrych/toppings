/** @jsxImportSource dom-chef-jsx */
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
} from "@/features/segments/Segments";
import { isTypingTarget, matchesBinding } from "@/lib/keybinding";
import { resolveSettingsButton, resolveVideo } from "@/youtube/player";
import { WatchContext } from "@/app/background/context";
import { Storage } from "@/lib/store";
import { resolveTarget } from "@/kernel/dom/resolve";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import { applyWatchProfile } from "@/features/profiles/applyProfile";
import {
  getCustomProfiles,
  getActiveProfile,
  setActiveProfileId,
} from "@/features/profiles/profileStore";
import { BUILT_IN_PRESETS } from "@/features/profiles/profiles";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import { showPageToast } from "@/lib/pageToast";
import { injectGearMenuEntry } from "@/features/profiles/gearMenu";

const STRATEGIES = {
  rightControls: ["div.ytp-right-controls"] as const,
  progressBar: ["div.ytp-progress-bar-container"] as const,
  panelHost: ["#above-the-fold", "ytd-watch-flexy #below", "#secondary-inner", "#columns"] as const,
} as const;

let player: HTMLVideoElement | undefined;
let preferences: Storage["preferences"]["watch"] | undefined;
let gearMenuEnabled = false;

const onWatchPage = async (ctx: WatchContext) => {
  const { store } = ctx;
  preferences = store.preferences.watch;
  gearMenuEnabled = !!(store.ui?.gearMenuEnabled);
  if (!preferences) return;

  const playerResolution = await resolveVideo();
  if (!playerResolution.resolved) return;
  player = playerResolution.element as HTMLVideoElement;

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

  const settingsResolution = await resolveSettingsButton();
  if (!settingsResolution.resolved) return;
  const playerSettingsButton = settingsResolution.element as HTMLElement;
  playerSettingsButton.removeEventListener("click", onSettingsMenu);
  playerSettingsButton.addEventListener("click", onSettingsMenu);

  // Last, so profile overrides land on top of a fully initialised segment
  // panel rather than being overwritten by its setup.
  void applyWatchProfile();

  // Remove-then-add keeps this single-registered across SPA navigations, which
  // re-run this whole function against the same page.
  chrome.storage.onChanged.removeListener(onProfileStoreChanged);
  chrome.storage.onChanged.addListener(onProfileStoreChanged);
};

const onProfileStoreChanged = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string,
): void => {
  if (area !== "local") return;
  if (!(CHROME_STORAGE_LOCAL_KEY.PROFILE_STORE in changes)) return;
  void applyWatchProfile();
};

const onSettingsMenu = (): void => {
  if (!gearMenuEnabled) return;
  const settingsMenu = document.querySelector<HTMLElement>(".ytp-settings-menu");
  if (settingsMenu) void injectGearMenuEntry(settingsMenu);
};

const useShortcuts = (event: KeyboardEvent): void => {
  if (!player || !preferences) return;

  if (isTypingTarget(event.target)) return;

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
  // getCustomProfiles, not getAllProfiles: the presets are prepended below, and
  // getAllProfiles already includes them.
  const customProfiles = await getCustomProfiles();
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

export default onWatchPage;
