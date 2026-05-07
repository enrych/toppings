import elementReady from "element-ready";
import { SegmentEngine } from "../../../utils/segments/engine";
import { SegmentMarkersController } from "../../../utils/segments/markers";
import { createFreshConfig, removeSegmentFromConfig, updateSegmentTimes } from "../../../utils/segments/factories";
import {
  getLastUsed,
  setLastUsed,
  getAutoloadConfig,
} from "../../../utils/storage/segmentStore";
import type { SegmentConfig, SegmentId } from "../../../utils/segments/types";
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

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let engine: SegmentEngine | null = null;
let markersCtrl: SegmentMarkersController | null = null;
let currentVideoId: string | null = null;
let video: HTMLVideoElement | null = null;
let isActive = false;

// Track the current button click handler so SPA navigation doesn't stack listeners.
let segButtonClickHandler: (() => void) | null = null;

/**
 * Holds the latest config produced by dragging a marker.
 * We do NOT call applyConfig during drag (that would destroy marker DOM),
 * so we buffer here and flush in the onDragEnd handler.
 */
let latestDragConfig: SegmentConfig | null = null;

// Nudge acceleration state
let lastNudgeMarker: "start" | "end" | null = null;
let lastNudgeDirection: "forward" | "backward" | null = null;
let currentNudgeStep = 1;
let lastNudgeTime = 0;
const NUDGE_RESET_GAP_MS = 600;

// ---------------------------------------------------------------------------
// Public re-exports
// ---------------------------------------------------------------------------

export { SegmentButton, SegmentPanel, getCachedNamedConfigs, refreshNamedConfigsCache };

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

/**
 * Initialise the segments system for a new watch page.
 *
 * @param videoId       The YouTube video ID.
 * @param autoLoad      Global auto-load preference. Per-video pins override this.
 *                      Defaults to "off" so segments never auto-enable unless
 *                      the user has configured otherwise.
 */
export async function setupSegments(
  videoId?: string,
  autoLoad: "off" | "last-used" | "default" = "off",
): Promise<void> {
  currentVideoId = videoId ?? null;
  video = (await elementReady("video")) as HTMLVideoElement | null;

  // Tear down any previous session.
  teardown();

  if (!currentVideoId || !video) return;

  await setupSegmentPanel(currentVideoId);

  // Wire panel config-change → engine + markers update.
  // This fires when the user changes something via the panel UI.
  setOnConfigChange((config) => {
    if (config) {
      // Do NOT rebuild markers here — applyConfig triggers a full marker rebuild
      // which would interfere if the panel change happens during drag.
      // The panel itself is already re-rendered by the mutation helpers.
      applyConfig(config, /* skipMarkerRebuild */ false);
    }
  });

  // Button click → toggle. Remove previous handler first so SPA navigation
  // doesn't accumulate duplicate listeners (the button element is a singleton).
  if (segButtonClickHandler) {
    SegmentButton.removeEventListener("click", segButtonClickHandler);
  }
  segButtonClickHandler = () => void toggleSegmentsLastUsed();
  SegmentButton.addEventListener("click", segButtonClickHandler);

  // Restore saved state once video metadata is available.
  const restore = async () => {
    if (!video || !currentVideoId) return;
    const dur = video.duration || 0;

    // getAutoloadConfig returns null when the effective setting is "off"
    // or no config exists for the chosen mode.
    const config = await getAutoloadConfig(currentVideoId, dur, autoLoad);
    if (!config) return; // auto-load is disabled; wait for user to press Z

    const clamped = clampConfigToDuration(config, dur);
    enableSegments(clamped, /* showToast */ true);
  };

  if (video.readyState >= 1 && video.duration) {
    await restore();
  } else {
    video.addEventListener("loadedmetadata", () => void restore(), { once: true });
  }
}

// ---------------------------------------------------------------------------
// Enable / disable
// ---------------------------------------------------------------------------

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

/**
 * Apply a config update.
 *
 * @param skipMarkerRebuild  When true, the engine is updated but markers are
 *                           NOT rebuilt.  Pass true during drag operations so
 *                           the marker DOM elements aren't destroyed mid-drag.
 */
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

// ---------------------------------------------------------------------------
// Marker controller wiring (called from watch.tsx after DOM is ready)
// ---------------------------------------------------------------------------

export function initMarkers(
  progressBarContainer: HTMLElement,
  videoEl: HTMLVideoElement,
): void {
  if (markersCtrl) markersCtrl.destroy();
  markersCtrl = new SegmentMarkersController(progressBarContainer, videoEl);

  // During drag: update only the engine — no marker rebuild, no panel re-render.
  // Buffering the latest config in `latestDragConfig` for the onDragEnd flush.
  markersCtrl.onSegmentsChanged((segs) => {
    if (!activeConfig) return;
    const updated: SegmentConfig = {
      ...activeConfig,
      segments: segs,
      updatedAt: Date.now(),
    };
    // Engine update only — skipMarkerRebuild = true prevents destroying markers
    // while the user is still dragging them.
    applyConfig(updated, /* skipMarkerRebuild */ true);
    latestDragConfig = updated;
  });

  // After drag ends: flush — rebuild markers with final positions, update panel,
  // and persist the last-used snapshot.
  markersCtrl.onDragEnd(() => {
    const cfg = latestDragConfig;
    latestDragConfig = null;
    if (!cfg) return;
    // Full applyConfig: marker rebuild now safe (drag is done).
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

// ---------------------------------------------------------------------------
// Keyboard shortcut handlers (called from watch.tsx useShortcuts)
// ---------------------------------------------------------------------------

/**
 * Z key: if active → toggle off; if inactive → load last-used (or fresh).
 */
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

/**
 * Shift+Z: always start a fresh slate (full video, 1 segment, infinite loop).
 */
export function activateFreshSegments(): void {
  if (!video) return;
  const dur = video.duration || 0;
  const fresh = createFreshConfig(dur);
  enableSegments(fresh);
  showPageToast("Fresh segments slate");
}

/**
 * Q key: set the start boundary of the active segment to the current playhead.
 */
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

/**
 * E key: set the end boundary of the active segment to the current playhead.
 */
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

// ---------------------------------------------------------------------------
// Nudge — accelerating marker movement
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Save / clear shortcut
// ---------------------------------------------------------------------------

export async function saveSegmentsShortcut(): Promise<void> {
  if (!currentVideoId) return;

  if (isActive && activeConfig) {
    const { saveNamedConfig, setDefaultConfig } = await import(
      "../../../utils/storage/segmentStore"
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

// ---------------------------------------------------------------------------
// Named config shortcut
// ---------------------------------------------------------------------------

export async function activateNamedConfig(config: SegmentConfig): Promise<void> {
  if (!video) return;
  const dur = video.duration || 0;
  const clamped = clampConfigToDuration(config, dur);
  enableSegments(clamped);
  showPageToast(`Segments: ${clamped.label}`);
  setSegmentButtonSaved(clamped.label);
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

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
