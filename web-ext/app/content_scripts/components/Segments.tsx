import elementReady from "element-ready";
import { SegmentEngine } from "../segments/engine";
import { SegmentMarkersController } from "../segments/markers";
import { createFreshConfig, removeSegmentFromConfig, updateSegmentTimes } from "../segments/factories";
import {
  getLastUsed,
  setLastUsed,
  getAutoloadConfig,
} from "../segments/segmentStore";
import type { SegmentConfig, SegmentId } from "../segments/types";
import {
  SegmentPanel,
  setupSegmentPanel,
  showSegmentPanel,
  hideSegmentPanel,
  renderSegmentPanel,
  setOnConfigChange,
  activeConfig,
  refreshNamedConfigsCache,
  getCachedNamedConfigs,
} from "./SegmentPanel";
import {
  SegmentButton,
  setSegmentButtonActive,
  setSegmentButtonSaved,
} from "./SegmentButton";
import { showPageToast } from "../utils/pageToast";

let engine: SegmentEngine | null = null;
let markersCtrl: SegmentMarkersController | null = null;
let currentVideoId: string | null = null;
let video: HTMLVideoElement | null = null;
let isActive = false;

// Retained so SPA navigation can detach the previous listener; the button element is a singleton.
let segButtonClickHandler: (() => void) | null = null;

// Buffered rather than applied during drag: applying a config rebuilds the marker DOM
// the user is still holding. Flushed on drag end.
let latestDragConfig: SegmentConfig | null = null;

let lastNudgeMarker: "start" | "end" | null = null;
let lastNudgeDirection: "forward" | "backward" | null = null;
let currentNudgeStep = 1;
let lastNudgeTime = 0;
const NUDGE_RESET_GAP_MS = 600;

export { SegmentButton, SegmentPanel, getCachedNamedConfigs, refreshNamedConfigsCache };

// autoLoad is the global preference; a per-video pin overrides it. Defaults to "off"
// so segments never auto-enable for a user who has not opted in.
export async function setupSegments(
  videoId?: string,
  autoLoad: "off" | "last-used" | "default" = "off",
): Promise<void> {
  currentVideoId = videoId ?? null;
  video = (await elementReady("video")) as HTMLVideoElement | null;

  teardown();

  if (!currentVideoId || !video) return;

  await setupSegmentPanel(currentVideoId);

  setOnConfigChange((config) => {
    if (config) {
      applyConfig(config, /* skipMarkerRebuild */ false);
    }
  });

  if (segButtonClickHandler) {
    SegmentButton.removeEventListener("click", segButtonClickHandler);
  }
  segButtonClickHandler = () => void toggleSegmentsLastUsed();
  SegmentButton.addEventListener("click", segButtonClickHandler);

  const restore = async () => {
    if (!video || !currentVideoId) return;
    const dur = video.duration || 0;

    const config = await getAutoloadConfig(currentVideoId, dur, autoLoad);
    if (!config) return;

    const clamped = clampConfigToDuration(config, dur);
    enableSegments(clamped, /* showToast */ true);
  };

  if (video.readyState >= 1 && video.duration) {
    await restore();
  } else {
    video.addEventListener("loadedmetadata", () => void restore(), { once: true });
  }
}

function enableSegments(config: SegmentConfig, toast = false): void {
  if (!video) return;

  if (engine) engine.stop();
  engine = new SegmentEngine(video, config);
  engine.start();

  if (markersCtrl) {
    markersCtrl.setSegments(config.segments);
    markersCtrl.showAll();
  }

  renderSegmentPanel(config);
  showSegmentPanel();
  setSegmentButtonActive(true);
  setSegmentButtonSaved(config.label !== "Default" ? config.label : null);

  isActive = true;

  if (toast) {
    showPageToast("↺ Segments restored");
  }
}

function disableSegments(): void {
  if (engine) {
    engine.stop();
    engine = null;
  }
  if (markersCtrl) {
    markersCtrl.hideAll();
  }
  hideSegmentPanel();
  setSegmentButtonActive(false);
  setSegmentButtonSaved(null);
  isActive = false;

  if (currentVideoId && activeConfig) {
    void setLastUsed(currentVideoId, activeConfig);
  }
}

// Pass skipMarkerRebuild during a drag: rebuilding replaces the marker elements
// the pointer is currently bound to.
function applyConfig(config: SegmentConfig, skipMarkerRebuild = false): void {
  if (!video) return;
  if (engine) {
    engine.setConfig(config);
  } else {
    engine = new SegmentEngine(video, config);
    if (isActive) engine.start();
  }
  if (markersCtrl && !skipMarkerRebuild) {
    markersCtrl.setSegments(config.segments);
    if (isActive) markersCtrl.showAll();
  }
}

function teardown(): void {
  if (engine) {
    engine.stop();
    engine = null;
  }
  if (markersCtrl) {
    markersCtrl.destroy();
    markersCtrl = null;
  }
  latestDragConfig = null;
  isActive = false;
  setSegmentButtonActive(false);
  setSegmentButtonSaved(null);
  hideSegmentPanel();
}

export function initMarkers(
  progressBarContainer: HTMLElement,
  videoEl: HTMLVideoElement,
): void {
  if (markersCtrl) markersCtrl.destroy();
  markersCtrl = new SegmentMarkersController(progressBarContainer, videoEl);

  markersCtrl.onSegmentsChanged((segs) => {
    if (!activeConfig) return;
    const updated: SegmentConfig = {
      ...activeConfig,
      segments: segs,
      updatedAt: Date.now(),
    };
    applyConfig(updated, /* skipMarkerRebuild */ true);
    latestDragConfig = updated;
  });

  markersCtrl.onDragEnd(() => {
    const cfg = latestDragConfig;
    latestDragConfig = null;
    if (!cfg) return;
    applyConfig(cfg, /* skipMarkerRebuild */ false);
    renderSegmentPanel(cfg);
    if (currentVideoId) void setLastUsed(currentVideoId, cfg);
  });

  markersCtrl.onMergeRequest((keepId, removeId) => {
    if (!activeConfig) return;
    const keepSeg = activeConfig.segments.find((s) => s.id === keepId);
    const removeSeg = activeConfig.segments.find((s) => s.id === removeId);
    if (!keepSeg || !removeSeg) return;

    let merged = updateSegmentTimes(
      activeConfig,
      keepId,
      keepSeg.startTime,
      removeSeg.endTime,
    );
    merged = removeSegmentFromConfig(merged, removeId);

    applyConfig(merged);
    renderSegmentPanel(merged);
    if (currentVideoId) void setLastUsed(currentVideoId, merged);
    showPageToast("Segments merged");
  });

  if (activeConfig && isActive) {
    markersCtrl.setSegments(activeConfig.segments);
    markersCtrl.showAll();
  }
}

export async function toggleSegmentsLastUsed(): Promise<void> {
  if (isActive) {
    disableSegments();
    return;
  }

  if (!video) return;
  const dur = video.duration || 0;

  let config: SegmentConfig | null = null;
  if (currentVideoId) {
    config = await getLastUsed(currentVideoId);
  }
  if (!config) {
    config = createFreshConfig(dur);
  }

  enableSegments(config);
}

export function activateFreshSegments(): void {
  if (!video) return;
  const dur = video.duration || 0;
  const fresh = createFreshConfig(dur);
  enableSegments(fresh);
  showPageToast("Fresh segments slate");
}

export function setActiveSegmentStart(): void {
  if (!isActive || !video || !engine || !activeConfig) return;
  const seg = engine.getSegmentAt(video.currentTime);
  if (!seg) return;

  const newStart = Math.max(0, Math.min(video.currentTime, seg.endTime - 0.1));
  const updated = updateSegmentTimes(activeConfig, seg.id, newStart, seg.endTime);
  applyConfig(updated);
  renderSegmentPanel(updated);
  if (markersCtrl) markersCtrl.updateSegmentPosition(seg.id, "start", newStart);
  if (currentVideoId) void setLastUsed(currentVideoId, updated);
}

export function setActiveSegmentEnd(): void {
  if (!isActive || !video || !engine || !activeConfig) return;
  const seg = engine.getSegmentAt(video.currentTime);
  if (!seg) return;

  const dur = video.duration || 0;
  const newEnd = Math.max(seg.startTime + 0.1, Math.min(video.currentTime, dur));
  const updated = updateSegmentTimes(activeConfig, seg.id, seg.startTime, newEnd);
  applyConfig(updated);
  renderSegmentPanel(updated);
  if (markersCtrl) markersCtrl.updateSegmentPosition(seg.id, "end", newEnd);
  if (currentVideoId) void setLastUsed(currentVideoId, updated);
}

function computeNudgeStep(
  marker: "start" | "end",
  direction: "forward" | "backward",
  baseStep: number,
  multiplier: number,
  maxStep: number,
): number {
  const now = Date.now();
  const isSame =
    lastNudgeMarker === marker &&
    lastNudgeDirection === direction &&
    now - lastNudgeTime < NUDGE_RESET_GAP_MS;

  const step = isSame
    ? Math.min(currentNudgeStep * multiplier, maxStep)
    : baseStep;

  lastNudgeMarker = marker;
  lastNudgeDirection = direction;
  currentNudgeStep = step;
  lastNudgeTime = now;
  return step;
}

export function nudgeActiveSegmentStart(
  direction: "forward" | "backward",
  baseStep: number,
  multiplier: number,
  maxStep: number,
): void {
  if (!isActive || !video || !engine || !activeConfig) return;
  const seg = engine.getSegmentAt(video.currentTime);
  if (!seg) return;

  const step = computeNudgeStep("start", direction, baseStep, multiplier, maxStep);
  if (!video.duration) return;

  const newStart =
    direction === "forward"
      ? Math.min(seg.startTime + step, seg.endTime - 0.1)
      : Math.max(0, seg.startTime - step);

  const updated = updateSegmentTimes(activeConfig, seg.id, newStart, seg.endTime);
  applyConfig(updated);
  if (markersCtrl) markersCtrl.updateSegmentPosition(seg.id, "start", newStart);
  video.currentTime = newStart;
  if (currentVideoId) void setLastUsed(currentVideoId, updated);
}

export function nudgeActiveSegmentEnd(
  direction: "forward" | "backward",
  baseStep: number,
  multiplier: number,
  maxStep: number,
): void {
  if (!isActive || !video || !engine || !activeConfig) return;
  const seg = engine.getSegmentAt(video.currentTime);
  if (!seg) return;

  const step = computeNudgeStep("end", direction, baseStep, multiplier, maxStep);
  const dur = video.duration;
  if (!dur) return;

  const newEnd =
    direction === "forward"
      ? Math.min(seg.endTime + step, dur)
      : Math.max(seg.startTime + 0.1, seg.endTime - step);

  const updated = updateSegmentTimes(activeConfig, seg.id, seg.startTime, newEnd);
  applyConfig(updated);
  if (markersCtrl) markersCtrl.updateSegmentPosition(seg.id, "end", newEnd);
  if (currentVideoId) void setLastUsed(currentVideoId, updated);
}

export async function saveSegmentsShortcut(): Promise<void> {
  if (!currentVideoId) return;

  if (isActive && activeConfig) {
    const { saveNamedConfig, setDefaultConfig } = await import(
      "../segments/segmentStore"
    );
    const named = { ...activeConfig, updatedAt: Date.now() };
    await saveNamedConfig(currentVideoId, named);
    await setDefaultConfig(currentVideoId, named.id);
    await refreshNamedConfigsCache();
    showPageToast("Segments saved ✓");
    setSegmentButtonSaved(named.label);
  } else {
    await setLastUsed(currentVideoId, null);
    showPageToast("Last-used segments cleared");
  }
}

export async function activateNamedConfig(config: SegmentConfig): Promise<void> {
  if (!video) return;
  const dur = video.duration || 0;
  const clamped = clampConfigToDuration(config, dur);
  enableSegments(clamped);
  showPageToast(`Segments: ${clamped.label}`);
  setSegmentButtonSaved(clamped.label);
}

function clampConfigToDuration(
  config: SegmentConfig,
  duration: number,
): SegmentConfig {
  if (!duration || duration <= 0) return config;
  return {
    ...config,
    segments: config.segments.map((s) => {
      const start = Math.max(0, Math.min(s.startTime, duration - 0.1));
      const end = Math.max(start + 0.1, Math.min(s.endTime, duration));
      return { ...s, startTime: start, endTime: end };
    }),
  };
}

export function isSegmentsActive(): boolean {
  return isActive;
}

export function getActiveConfig(): SegmentConfig | null {
  return activeConfig;
}
