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
import { resolveVideo } from "@/youtube/player";
import { WatchContext } from "@/app/background/context";
import { Storage } from "@/lib/store";
import { resolveTarget } from "@/kernel/dom/resolve";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";

const STRATEGIES = {
  rightControls: ["div.ytp-right-controls"] as const,
  progressBar: ["div.ytp-progress-bar-container"] as const,
  panelHost: ["#above-the-fold", "ytd-watch-flexy #below", "#secondary-inner", "#columns"] as const,
} as const;

let player: HTMLVideoElement | undefined;
let preferences: Storage["preferences"]["watch"] | undefined;

const onWatchPage = async (ctx: WatchContext) => {
  const { store } = ctx;
  preferences = store.preferences.watch;
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

};

export default onWatchPage;
