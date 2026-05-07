import React from "dom-chef";
import type {
  SegmentConfig,
  Segment,
  PlayStep,
  SegmentId,
  StepId,
} from "../../../utils/segments/types";
import {
  addSegmentToConfig,
  removeSegmentFromConfig,
  generateConfigLabel,
  splitSegmentAtTime,
} from "../../../utils/segments/factories";
import type { SegmentAutoLoadPin } from "../../../utils/segments/types";
import {
  saveNamedConfig,
  deleteNamedConfig,
  setDefaultConfig,
  setLastUsed,
  getSavedConfigs,
  getVideoSegmentData,
  setAutoLoadPin,
  getAutoLoadPin,
} from "../../../utils/storage/segmentStore";
import { setSegmentButtonSaved } from "./SegmentButton";

// ---------------------------------------------------------------------------
// SegmentPanel — below-video control panel
//
// Uses dom-chef (same as rest of content scripts). The panel element is
// created once; re-renders happen imperatively via renderPanel().
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** Currently loaded config. watch.tsx reads this to know what's active. */
export let activeConfig: SegmentConfig | null = null;
let currentVideoId: string | null = null;
let onConfigChangeCallback: ((config: SegmentConfig | null) => void) | null = null;

/** Cache of saved named configs for this video — updated on save/delete. */
let savedConfigsCache: SegmentConfig[] = [];

/** Current per-video auto-load pin. Loaded in setupSegmentPanel. */
let currentPin: SegmentAutoLoadPin = null;

/** Which panel view is currently displayed. */
type ViewMode = "main" | "manage";
let viewMode: ViewMode = "main";

/** Whether the panel body is collapsed (header stays visible). */
let panelCollapsed = false;

/** Whether the Advanced Sequence section is expanded. Persists across re-renders. */
let advSectionOpen = false;

// ---------------------------------------------------------------------------
// Single global click-away handler — registered once (no accumulation)
// ---------------------------------------------------------------------------

let openMenuEl: HTMLElement | null = null;

function closeOpenMenu(): void {
  if (openMenuEl) {
    openMenuEl.style.display = "none";
    openMenuEl = null;
  }
}

document.addEventListener("click", closeOpenMenu);

// ---------------------------------------------------------------------------
// Drag-to-reorder state for sequence chips
// ---------------------------------------------------------------------------

let dragSrcStepId: StepId | null = null;
let dragSrcIdx = -1;

// ---------------------------------------------------------------------------
// Public callbacks
// ---------------------------------------------------------------------------

export function setOnConfigChange(
  cb: (config: SegmentConfig | null) => void,
): void {
  onConfigChangeCallback = cb;
}

export function getCachedNamedConfigs(): SegmentConfig[] {
  return savedConfigsCache;
}

export async function refreshNamedConfigsCache(): Promise<void> {
  if (!currentVideoId) return;
  savedConfigsCache = await getSavedConfigs(currentVideoId);
}

function emitConfigChange(config: SegmentConfig | null): void {
  activeConfig = config;
  onConfigChangeCallback?.(config);
}

// ---------------------------------------------------------------------------
// Panel DOM element (singleton, created once)
// ---------------------------------------------------------------------------

const panelId = "tppng-segment-panel";

export const SegmentPanel: HTMLElement = (
  <div
    id={panelId}
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
) as HTMLElement;

// ---------------------------------------------------------------------------
// Public lifecycle
// ---------------------------------------------------------------------------

export async function setupSegmentPanel(videoId: string): Promise<void> {
  currentVideoId = videoId;
  viewMode = "main";
  [savedConfigsCache, currentPin] = await Promise.all([
    getSavedConfigs(videoId),
    getAutoLoadPin(videoId),
  ]);
}

export function showSegmentPanel(): void {
  SegmentPanel.style.display = "block";
  if (activeConfig) renderPanel(activeConfig);
}

export function hideSegmentPanel(): void {
  SegmentPanel.style.display = "none";
}

export function renderSegmentPanel(config: SegmentConfig): void {
  activeConfig = config;
  if (SegmentPanel.style.display !== "none") {
    renderPanel(config);
  }
}

// ---------------------------------------------------------------------------
// Core render dispatcher
// ---------------------------------------------------------------------------

function renderPanel(config: SegmentConfig): void {
  const inner = document.getElementById("tppng-sp-inner");
  if (!inner) return;
  inner.innerHTML = "";
  if (viewMode === "manage") {
    inner.appendChild(buildConfigManager(config));
  } else {
    inner.appendChild(buildMainView(config));
  }
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

// First color is YouTube's red so the primary segment feels native.
const SEGMENT_COLORS = [
  "#ff3333", "#3ea6ff", "#4caf50", "#ff9800",
  "#9c27b0", "#00bcd4", "#f5c518",
];

function colorForIndex(i: number): string {
  return SEGMENT_COLORS[i % SEGMENT_COLORS.length];
}

function fmtTime(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const ss = String(s % 60).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${m}:${ss}`;
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

function buildMainView(config: SegmentConfig): HTMLElement {
  return (
    <div>
      {buildHeader(config)}
      <div id="tppng-sp-body" style={{ display: panelCollapsed ? "none" : "block" }}>
        {buildSegmentList(config)}
        {buildAdvancedSection(config)}
      </div>
    </div>
  ) as HTMLElement;
}

// ---------------------------------------------------------------------------
// Header — config switcher + save menu + close
// ---------------------------------------------------------------------------

function buildHeader(config: SegmentConfig): HTMLElement {
  return (
    <div
      id="tppng-sp-header"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px",
        flexWrap: "wrap",
      }}
    >
      {/* Title */}
      <span
        style={{
          fontWeight: 700,
          fontSize: "13px",
          color: "var(--yt-spec-text-primary, #fff)",
          letterSpacing: "0.01em",
        }}
      >
        Segments
      </span>

      {/* Config switcher dropdown */}
      {buildConfigSwitcher(config)}

      <div style={{ flex: 1 }} />

      {/* Per-video auto-load pin */}
      {buildPinButton(config)}

      {/* Save menu */}
      {buildSaveMenu(config)}

      {/* Manage configs button */}
      <button
        style={btnStyle("ghost")}
        title="Manage saved configs"
        onClick={() => {
          viewMode = "manage";
          renderPanel(config);
        }}
      >
        ☰
      </button>

      {/* Collapse button */}
      <button
        style={btnStyle("ghost")}
        title={panelCollapsed ? "Expand panel" : "Collapse panel"}
        onClick={() => {
          panelCollapsed = !panelCollapsed;
          const body = document.getElementById("tppng-sp-body");
          if (body) body.style.display = panelCollapsed ? "none" : "block";
          const btn = document.getElementById("tppng-sp-collapse-btn");
          if (btn) {
            btn.textContent = panelCollapsed ? "+" : "−";
            btn.title = panelCollapsed ? "Expand panel" : "Collapse panel";
          }
        }}
        id="tppng-sp-collapse-btn"
      >
        {panelCollapsed ? "+" : "−"}
      </button>
    </div>
  ) as HTMLElement;
}

function buildConfigSwitcher(config: SegmentConfig): HTMLElement {
  const container = (<div style={{ position: "relative", display: "inline-block" }} />) as HTMLElement;

  const trigger = (
    <button
      style={{
        ...btnStyle("ghost"),
        padding: "2px 8px",
        fontSize: "12px",
        background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08))",
        borderRadius: "4px",
        color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.7))",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
      title="Switch saved config"
    >
      <span>{config.label}</span>
      <span style={{ fontSize: "10px", opacity: "0.7" }}>▾</span>
    </button>
  ) as HTMLButtonElement;

  const menu = (
    <div
      style={{
        display: "none",
        position: "absolute",
        left: 0,
        top: "calc(100% + 4px)",
        background: "var(--yt-spec-base-background, #0f0f0f)",
        border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.15))",
        borderRadius: "8px",
        padding: "4px",
        zIndex: 9999,
        minWidth: "180px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      }}
    />
  ) as HTMLElement;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (openMenuEl === menu) {
      closeOpenMenu();
      return;
    }
    closeOpenMenu();

    // Rebuild menu contents from cache (sync)
    menu.innerHTML = "";

    if (savedConfigsCache.length === 0) {
      const empty = (
        <div style={{ padding: "8px 10px", fontSize: "12px", color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))", fontStyle: "italic" }}>
          No saved configs
        </div>
      ) as HTMLElement;
      menu.appendChild(empty);
    } else {
      for (const saved of savedConfigsCache) {
        const isActive = saved.id === config.id;
        const item = (
          <button
            style={{
              ...menuItemStyle(),
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? "var(--yt-spec-call-to-action, #3ea6ff)"
                : "var(--yt-spec-text-primary, #fff)",
            }}
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              closeOpenMenu();
              void loadSavedConfig(saved);
            }}
          >
            {isActive ? "✓ " : "  "}{saved.label}
          </button>
        ) as HTMLButtonElement;
        menu.appendChild(item);
      }
    }

    menu.style.display = "block";
    openMenuEl = menu;
  });

  container.appendChild(trigger);
  container.appendChild(menu);
  return container;
}

async function loadSavedConfig(config: SegmentConfig): Promise<void> {
  if (!currentVideoId) return;
  emitConfigChange(config);
  renderPanel(config);
  setSegmentButtonSaved(config.label);
  void setLastUsed(currentVideoId, config);
}

// ---------------------------------------------------------------------------
// Per-video auto-load pin button
// ---------------------------------------------------------------------------

/** Label + title for each pin state. */
const PIN_LABELS: Record<string, { icon: string; title: string }> = {
  null:       { icon: "○",  title: "Auto-load: use global setting — click to pin" },
  off:        { icon: "⊗",  title: "Auto-load: always OFF for this video — click to change" },
  "last-used":{ icon: "↺",  title: "Auto-load: restore last-used — click to change" },
  default:    { icon: "★",  title: "Auto-load: restore default saved config — click to change" },
};

function pinKey(pin: SegmentAutoLoadPin): string {
  if (pin === null) return "null";
  if (typeof pin === "string") return pin;
  return "specific";
}

function buildPinButton(config: SegmentConfig): HTMLElement {
  const container = (<div style={{ position: "relative", display: "inline-block" }} />) as HTMLElement;

  const key = pinKey(currentPin);
  const info = PIN_LABELS[key] ?? { icon: "📌", title: "Auto-load pin — click to change" };

  const trigger = (
    <button
      style={{
        ...btnStyle("ghost"),
        padding: "2px 6px",
        fontSize: "11px",
        color: currentPin !== null
          ? "var(--yt-spec-call-to-action, #3ea6ff)"
          : "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))",
      }}
      title={info.title}
    >
      {info.icon}
    </button>
  ) as HTMLButtonElement;

  const menu = (
    <div
      style={{
        display: "none",
        position: "absolute",
        right: 0,
        top: "calc(100% + 4px)",
        background: "var(--yt-spec-base-background, #0f0f0f)",
        border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.15))",
        borderRadius: "8px",
        padding: "4px",
        zIndex: 9999,
        minWidth: "210px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "4px 10px 6px",
          fontSize: "11px",
          color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))",
          borderBottom: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1))",
          marginBottom: "4px",
        }}
      >
        Auto-load on page open
      </div>

      {([
        [null,        "○",  "Use global setting"],
        ["off",       "⊗",  "Always off for this video"],
        ["last-used", "↺",  "Restore last-used"],
        ["default",   "★",  "Restore default saved config"],
      ] as const).map(([pinVal, icon, label]) => {
        const isActive = JSON.stringify(currentPin) === JSON.stringify(pinVal);
        return (
          <button
            key={String(pinVal)}
            style={{
              ...menuItemStyle(),
              color: isActive
                ? "var(--yt-spec-call-to-action, #3ea6ff)"
                : "var(--yt-spec-text-primary, #fff)",
              fontWeight: isActive ? 600 : 400,
            }}
            onClick={async (e: MouseEvent) => {
              e.stopPropagation();
              closeOpenMenu();
              if (!currentVideoId) return;
              currentPin = pinVal as SegmentAutoLoadPin;
              await setAutoLoadPin(currentVideoId, currentPin);
              renderPanel(config);
            }}
          >
            {icon} {label}
          </button>
        ) as HTMLButtonElement;
      })}

      {/* Specific config pins */}
      {savedConfigsCache.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1))",
            marginTop: "4px",
            paddingTop: "4px",
          }}
        >
          {savedConfigsCache.map((saved) => {
            const isActive =
              typeof currentPin === "object" &&
              currentPin !== null &&
              currentPin.configId === saved.id;
            return (
              <button
                key={saved.id}
                style={{
                  ...menuItemStyle(),
                  color: isActive
                    ? "var(--yt-spec-call-to-action, #3ea6ff)"
                    : "var(--yt-spec-text-secondary, rgba(255,255,255,0.7))",
                  fontSize: "11px",
                }}
                onClick={async (e: MouseEvent) => {
                  e.stopPropagation();
                  closeOpenMenu();
                  if (!currentVideoId) return;
                  currentPin = { configId: saved.id };
                  await setAutoLoadPin(currentVideoId, currentPin);
                  renderPanel(config);
                }}
              >
                📌 {saved.label}
              </button>
            ) as HTMLButtonElement;
          })}
        </div>
      )}
    </div>
  ) as HTMLElement;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (openMenuEl === menu) {
      closeOpenMenu();
      return;
    }
    closeOpenMenu();
    menu.style.display = "block";
    openMenuEl = menu;
  });

  container.appendChild(trigger);
  container.appendChild(menu);
  return container;
}

// ---------------------------------------------------------------------------
// Save menu
// ---------------------------------------------------------------------------

function buildSaveMenu(config: SegmentConfig): HTMLElement {
  const container = (<div style={{ position: "relative", display: "inline-block" }} />) as HTMLElement;

  const trigger = (
    <button style={btnStyle("accent")} title="Save options">
      Save ▾
    </button>
  ) as HTMLButtonElement;

  const menu = (
    <div
      style={{
        display: "none",
        position: "absolute",
        right: 0,
        top: "calc(100% + 4px)",
        background: "var(--yt-spec-base-background, #0f0f0f)",
        border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.15))",
        borderRadius: "8px",
        padding: "4px",
        zIndex: 9999,
        minWidth: "170px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      }}
    >
      <button
        style={menuItemStyle()}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          closeOpenMenu();
          void saveAsDefault(config);
        }}
      >
        Save to Default Slot
      </button>
      <button
        style={menuItemStyle()}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          closeOpenMenu();
          showSaveNameForm(config);
        }}
      >
        Save as Named Config…
      </button>
    </div>
  ) as HTMLElement;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (openMenuEl === menu) {
      closeOpenMenu();
      return;
    }
    closeOpenMenu();
    menu.style.display = "block";
    openMenuEl = menu;
  });

  container.appendChild(trigger);
  container.appendChild(menu);
  return container;
}

// ---------------------------------------------------------------------------
// Inline save-name form (replaces window.prompt)
// ---------------------------------------------------------------------------

function showSaveNameForm(config: SegmentConfig): void {
  const header = document.getElementById("tppng-sp-header");
  if (!header) return;

  // Remove any existing form.
  document.getElementById("tppng-sp-save-form")?.remove();

  const defaultLabel = generateConfigLabel(savedConfigsCache.length);

  const form = (
    <div
      id="tppng-sp-save-form"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 0",
        marginBottom: "4px",
      }}
    >
      <input
        type="text"
        id="tppng-sp-save-input"
        value={defaultLabel}
        placeholder="Config name…"
        style={{
          flex: 1,
          background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08))",
          border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.2))",
          borderRadius: "4px",
          color: "var(--yt-spec-text-primary, #fff)",
          fontSize: "12px",
          padding: "4px 8px",
          fontFamily: "inherit",
          outline: "none",
        }}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void doSaveNamed(config, (e.target as HTMLInputElement).value);
          }
          if (e.key === "Escape") {
            document.getElementById("tppng-sp-save-form")?.remove();
          }
        }}
      />
      <button
        style={btnStyle("accent")}
        onClick={() => {
          const inp = document.getElementById("tppng-sp-save-input") as HTMLInputElement | null;
          void doSaveNamed(config, inp?.value ?? "");
        }}
      >
        Save
      </button>
      <button
        style={btnStyle("ghost")}
        onClick={() => document.getElementById("tppng-sp-save-form")?.remove()}
      >
        Cancel
      </button>
    </div>
  ) as HTMLElement;

  header.after(form);

  // Auto-select the text for immediate renaming.
  requestAnimationFrame(() => {
    const inp = document.getElementById("tppng-sp-save-input") as HTMLInputElement | null;
    inp?.select();
  });
}

async function doSaveNamed(config: SegmentConfig, rawLabel: string): Promise<void> {
  const label = rawLabel.trim();
  if (!label || !currentVideoId) return;
  const named: SegmentConfig = { ...config, label, updatedAt: Date.now() };
  await saveNamedConfig(currentVideoId, named);
  savedConfigsCache = await getSavedConfigs(currentVideoId);
  document.getElementById("tppng-sp-save-form")?.remove();
  emitConfigChange(named);
  renderPanel(named);
  setSegmentButtonSaved(label);
  showToast(`Saved as "${label}" ✓`);
}

// ---------------------------------------------------------------------------
// Segment list
// ---------------------------------------------------------------------------

function buildSegmentList(config: SegmentConfig): HTMLElement {
  const list = (<div style={{ display: "flex", flexDirection: "column", gap: "5px" }} />) as HTMLElement;

  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);
  sorted.forEach((seg, i) => {
    list.appendChild(buildSegmentRow(config, seg, i));
  });

  const addBtn = (
    <button
      style={{ ...btnStyle("ghost"), marginTop: "4px", fontSize: "12px" }}
      onClick={() => addNewSegment(config)}
    >
      + Add Segment
    </button>
  ) as HTMLButtonElement;
  list.appendChild(addBtn);

  return list;
}

function buildSegmentRow(
  config: SegmentConfig,
  seg: Segment,
  index: number,
): HTMLElement {
  const color = colorForIndex(index);

  // Loop count and rate are step-level properties, not per-segment.
  // Only expose them here in simple single-step mode where the mapping is
  // unambiguous. In multi-step configs the step editor in Advanced Sequence
  // is the correct place to configure them.
  const isSimpleMode = config.sequence.length === 1;
  const step = isSimpleMode ? config.sequence[0] : null;
  const loopCount = step?.count ?? 0;
  const rate = step?.playbackRate ?? null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 10px",
        background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.05))",
        borderRadius: "8px",
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Segment number */}
      <span style={{ color, fontWeight: 700, minWidth: "18px", fontSize: "12px" }}>
        {index + 1}
      </span>

      {/* Time range */}
      <span
        style={{
          flex: 1,
          fontVariantNumeric: "tabular-nums",
          fontSize: "12px",
          color: "var(--yt-spec-text-primary, #fff)",
        }}
      >
        {fmtTime(seg.startTime)} → {fmtTime(seg.endTime)}
      </span>

      {/* Optional user label */}
      {seg.label && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
            fontStyle: "italic",
          }}
        >
          {seg.label}
        </span>
      )}

      {/* Loop count — simple mode only (single step) */}
      {isSimpleMode && (
        <label
          style={{
            fontSize: "11px",
            color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}
          title="Loop count (0 = infinite)"
        >
          ↺
          <input
            type="number"
            min="0"
            step="1"
            value={String(loopCount)}
            title="Loop count (0 = infinite)"
            style={numInputStyle()}
            onChange={(e: Event) => {
              const val = parseInt((e.target as HTMLInputElement).value, 10);
              updateStepCount(config, config.sequence[0].id, isNaN(val) ? 0 : Math.max(0, val));
            }}
          />
        </label>
      )}

      {/* Playback rate — simple mode only (single step) */}
      {isSimpleMode && (
        <label
          style={{
            fontSize: "11px",
            color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}
          title="Playback rate override"
        >
          ▶
          <input
            type="number"
            min="0.25"
            max="16"
            step="0.25"
            value={rate !== null ? String(rate) : ""}
            placeholder="1×"
            title="Playback rate override (blank = keep current)"
            style={numInputStyle()}
            onChange={(e: Event) => {
              const raw = (e.target as HTMLInputElement).value.trim();
              const val = raw === "" ? null : parseFloat(raw);
              updateStepRate(config, config.sequence[0].id, val);
            }}
          />
        </label>
      )}

      {/* Delete */}
      <button
        style={{ ...btnStyle("ghost"), padding: "2px 6px" }}
        title="Remove segment"
        onClick={() => removeSegment(config, seg.id)}
      >
        ✕
      </button>
    </div>
  ) as HTMLElement;
}

// ---------------------------------------------------------------------------
// Advanced sequence section
// ---------------------------------------------------------------------------

function buildAdvancedSection(config: SegmentConfig): HTMLElement {
  const wrapper = (<div style={{ marginTop: "6px" }} />) as HTMLElement;

  const toggle = (
    <button
      style={{
        ...btnStyle("ghost"),
        fontSize: "12px",
        color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
        width: "100%",
        textAlign: "left",
        padding: "4px 0",
      }}
      id="tppng-sp-adv-toggle"
    >
      {advSectionOpen ? "▼" : "▶"} Advanced Sequence
    </button>
  ) as HTMLButtonElement;

  const body = (
    <div id="tppng-sp-adv-body" style={{ display: advSectionOpen ? "block" : "none", marginTop: "8px" }}>
      {buildSequenceEditor(config)}
    </div>
  ) as HTMLElement;

  toggle.addEventListener("click", () => {
    advSectionOpen = !advSectionOpen;
    body.style.display = advSectionOpen ? "block" : "none";
    toggle.textContent = (advSectionOpen ? "▼" : "▶") + " Advanced Sequence";
  });

  wrapper.appendChild(toggle);
  wrapper.appendChild(body);
  return wrapper;
}

function buildSequenceEditor(config: SegmentConfig): HTMLElement {
  const list = (<div style={{ display: "flex", flexDirection: "column", gap: "8px" }} />) as HTMLElement;

  config.sequence.forEach((step, i) => {
    list.appendChild(buildStepRow(config, step, i));
  });

  const addBtn = (
    <button
      style={{ ...btnStyle("ghost"), fontSize: "12px", marginTop: "4px" }}
      onClick={() => addStep(config)}
    >
      + Add Step
    </button>
  ) as HTMLButtonElement;
  list.appendChild(addBtn);

  return list;
}

function buildStepRow(
  config: SegmentConfig,
  step: PlayStep,
  stepIndex: number,
): HTMLElement {
  const sortedSegs = [...config.segments].sort((a, b) => a.startTime - b.startTime);

  // Chips for each segment reference in this step (with drag-to-reorder)
  const chipsContainer = (<div style={{ display: "flex", gap: "4px", flexWrap: "wrap", flex: 1, minWidth: "0" }} />) as HTMLElement;

  step.segmentIds.forEach((segId, chipIdx) => {
    const seg = config.segments.find((s) => s.id === segId);
    const sortedIdx = seg ? sortedSegs.indexOf(seg) : -1;
    const label = sortedIdx >= 0 ? `Seg ${sortedIdx + 1}` : "?";
    const color = sortedIdx >= 0 ? colorForIndex(sortedIdx) : "#666";

    const chip = (
      <span
        draggable={true}
        data-chip-idx={String(chipIdx)}
        data-step-id={step.id}
        style={{
          background: color + "22",
          border: `1px solid ${color}`,
          borderRadius: "4px",
          padding: "2px 6px 2px 8px",
          fontSize: "11px",
          cursor: "grab",
          userSelect: "none",
          color: "var(--yt-spec-text-primary, #fff)",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
        title={`${label}${seg ? " (" + fmtTime(seg.startTime) + "→" + fmtTime(seg.endTime) + ")" : ""} — drag to reorder, click ✕ to remove`}
      >
        <span style={{ opacity: "0.4", fontSize: "9px", cursor: "grab" }}>⠿</span>
        {label}
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            padding: "0",
            fontSize: "10px",
            lineHeight: "1",
            opacity: "0.6",
          }}
          title="Remove from step"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            removeSegRefFromStep(config, step.id, chipIdx);
          }}
        >
          ✕
        </button>
      </span>
    ) as HTMLElement;

    // HTML5 drag-to-reorder handlers
    chip.addEventListener("dragstart", (e: DragEvent) => {
      dragSrcStepId = step.id;
      dragSrcIdx = chipIdx;
      e.dataTransfer?.setData("text/plain", String(chipIdx));
      (e.currentTarget as HTMLElement).style.opacity = "0.5";
    });
    chip.addEventListener("dragend", (e: DragEvent) => {
      (e.currentTarget as HTMLElement).style.opacity = "1";
    });
    chip.addEventListener("dragover", (e: DragEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).style.outline = `2px solid ${color}`;
    });
    chip.addEventListener("dragleave", (e: DragEvent) => {
      (e.currentTarget as HTMLElement).style.outline = "";
    });
    chip.addEventListener("drop", (e: DragEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).style.outline = "";
      if (dragSrcStepId !== step.id || dragSrcIdx === chipIdx || dragSrcIdx < 0) return;
      reorderChip(config, step.id, dragSrcIdx, chipIdx);
    });

    chipsContainer.appendChild(chip);
  });

  // Segment picker to add refs to this step
  const addSegSelect = (
    <select
      style={{
        background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08))",
        border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.2))",
        borderRadius: "4px",
        color: "var(--yt-spec-text-primary, #fff)",
        fontSize: "11px",
        padding: "2px 4px",
      }}
      onChange={(e: Event) => {
        const val = (e.target as HTMLSelectElement).value;
        if (val) {
          addSegRefToStep(config, step.id, val);
          (e.target as HTMLSelectElement).value = "";
        }
      }}
    >
      <option value="">+ Seg</option>
      {sortedSegs.map((s, i) => (
        <option key={s.id} value={s.id}>
          Seg {i + 1}
        </option>
      ))}
    </select>
  ) as HTMLSelectElement;

  return (
    <div
      style={{
        background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.04))",
        borderRadius: "8px",
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      {/* Step header: number, chips, add-seg picker, delete */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "11px",
            color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))",
            minWidth: "44px",
            fontWeight: 600,
          }}
        >
          Step {stepIndex + 1}
        </span>
        {chipsContainer}
        {addSegSelect}
        <button
          style={{ ...btnStyle("ghost"), padding: "2px 5px", fontSize: "11px" }}
          title="Remove step"
          onClick={() => removeStep(config, step.id)}
        >
          ✕
        </button>
      </div>

      {/* Step controls: count, rate, per-iteration rates */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <label
          style={{
            fontSize: "11px",
            color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Count
          <input
            type="number"
            min="0"
            step="1"
            value={String(step.count)}
            title="0 = infinite; 1+ = play N times"
            style={numInputStyle()}
            onChange={(e: Event) => {
              const val = parseInt((e.target as HTMLInputElement).value, 10);
              updateStepCount(config, step.id, isNaN(val) ? 0 : Math.max(0, val));
            }}
          />
          <span style={{ fontSize: "10px", opacity: "0.5" }}>(0=∞)</span>
        </label>

        <label
          style={{
            fontSize: "11px",
            color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Rate
          <input
            type="number"
            min="0.25"
            max="16"
            step="0.25"
            value={step.playbackRate !== null ? String(step.playbackRate) : ""}
            placeholder="default"
            title="Playback rate for this step (blank = no change)"
            style={numInputStyle()}
            onChange={(e: Event) => {
              const raw = (e.target as HTMLInputElement).value.trim();
              const val = raw === "" ? null : parseFloat(raw);
              updateStepRate(config, step.id, val);
            }}
          />
        </label>

        <label
          style={{
            fontSize: "11px",
            color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Per-iter
          <input
            type="text"
            value={step.perIterationRates.join(", ")}
            placeholder="e.g. 1, 1.5"
            title="Comma-separated rates per iteration. Last entry repeats."
            style={{ ...numInputStyle(), width: "80px" }}
            onBlur={(e: Event) => {
              const raw = (e.target as HTMLInputElement).value;
              const rates = raw
                .split(",")
                .map((v) => parseFloat(v.trim()))
                .filter((v) => !isNaN(v) && v > 0);
              updateStepPerIterationRates(config, step.id, rates);
            }}
          />
        </label>
      </div>
    </div>
  ) as HTMLElement;
}

// ---------------------------------------------------------------------------
// Config Manager view
// ---------------------------------------------------------------------------

function buildConfigManager(currentCfg: SegmentConfig): HTMLElement {
  const wrapper = (<div />) as HTMLElement;

  // Header
  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px",
      }}
    >
      <button
        style={btnStyle("ghost")}
        title="Back to editor"
        onClick={() => {
          viewMode = "main";
          renderPanel(currentCfg);
        }}
      >
        ← Back
      </button>
      <span style={{ fontWeight: 700, fontSize: "13px" }}>Saved Configs</span>
    </div>
  ) as HTMLElement;
  wrapper.appendChild(header);

  if (savedConfigsCache.length === 0) {
    const empty = (
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))",
          fontSize: "12px",
          fontStyle: "italic",
        }}
      >
        No saved configs yet. Use Save ▾ → Save as Named Config to create one.
      </div>
    ) as HTMLElement;
    wrapper.appendChild(empty);
    return wrapper;
  }

  const list = (<div style={{ display: "flex", flexDirection: "column", gap: "6px" }} />) as HTMLElement;

  void (async () => {
    const data = await getVideoSegmentData(currentVideoId ?? "");
    const defaultId = data?.defaultConfigId ?? null;

    for (const saved of savedConfigsCache) {
      const isDefault = saved.id === defaultId;
      const isLoaded = saved.id === currentCfg.id;

      // Rename input state
      let isRenaming = false;

      const row = (<div />) as HTMLElement;

      const renderRow = () => {
        row.innerHTML = "";
        row.appendChild(buildManagerRow(saved, isDefault, isLoaded, isRenaming, {
          onLoad: () => { viewMode = "main"; void loadSavedConfig(saved); },
          onSetDefault: async () => {
            if (!currentVideoId) return;
            await setDefaultConfig(currentVideoId, saved.id);
            savedConfigsCache = await getSavedConfigs(currentVideoId);
            renderPanel(currentCfg);
          },
          onDelete: async () => {
            if (!currentVideoId) return;
            await deleteNamedConfig(currentVideoId, saved.id);
            savedConfigsCache = await getSavedConfigs(currentVideoId);
            renderPanel(currentCfg);
          },
          onStartRename: () => { isRenaming = true; renderRow(); },
          onRename: async (label: string) => {
            if (!label.trim() || !currentVideoId) return;
            const updated = { ...saved, label: label.trim(), updatedAt: Date.now() };
            await saveNamedConfig(currentVideoId, updated);
            savedConfigsCache = await getSavedConfigs(currentVideoId);
            isRenaming = false;
            renderPanel(currentCfg);
          },
          onCancelRename: () => { isRenaming = false; renderRow(); },
          onShortcutChange: async (key: string) => {
            if (!currentVideoId) return;
            const updated = { ...saved, shortcutKey: key, updatedAt: Date.now() };
            await saveNamedConfig(currentVideoId, updated);
            savedConfigsCache = await getSavedConfigs(currentVideoId);
          },
        }));
      };

      renderRow();
      list.appendChild(row);
    }

    wrapper.appendChild(list);
  })();

  return wrapper;
}

interface ManagerRowCallbacks {
  onLoad: () => void;
  onSetDefault: () => Promise<void>;
  onDelete: () => Promise<void>;
  onStartRename: () => void;
  onRename: (label: string) => Promise<void>;
  onCancelRename: () => void;
  onShortcutChange: (key: string) => Promise<void>;
}

function buildManagerRow(
  config: SegmentConfig,
  isDefault: boolean,
  isLoaded: boolean,
  isRenaming: boolean,
  cbs: ManagerRowCallbacks,
): HTMLElement {
  if (isRenaming) {
    const inp = (
      <input
        type="text"
        value={config.label}
        style={{
          ...numInputStyle(),
          width: "120px",
          padding: "4px 8px",
        }}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter") void cbs.onRename((e.target as HTMLInputElement).value);
          if (e.key === "Escape") cbs.onCancelRename();
        }}
      />
    ) as HTMLInputElement;

    const row = (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {inp}
        <button style={btnStyle("accent")} onClick={() => void cbs.onRename(inp.value)}>
          OK
        </button>
        <button style={btnStyle("ghost")} onClick={() => cbs.onCancelRename()}>
          Cancel
        </button>
      </div>
    ) as HTMLElement;

    requestAnimationFrame(() => inp.select());
    return row;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        background: isLoaded
          ? "var(--yt-spec-call-to-action, #3ea6ff)18"
          : "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.05))",
        borderRadius: "8px",
        borderLeft: isLoaded
          ? "3px solid var(--yt-spec-call-to-action, #3ea6ff)"
          : "3px solid transparent",
        flexWrap: "wrap",
      }}
    >
      {/* Config label (clickable to load) */}
      <button
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--yt-spec-text-primary, #fff)",
          fontSize: "13px",
          fontWeight: isLoaded ? 700 : 400,
          padding: 0,
          textAlign: "left",
          flex: 1,
          fontFamily: "inherit",
        }}
        title="Load this config"
        onClick={() => cbs.onLoad()}
      >
        {config.label}
      </button>

      {/* Default badge */}
      {isDefault && (
        <span
          style={{
            fontSize: "10px",
            color: "var(--yt-spec-call-to-action, #3ea6ff)",
            border: "1px solid var(--yt-spec-call-to-action, #3ea6ff)",
            borderRadius: "3px",
            padding: "1px 5px",
          }}
        >
          default
        </span>
      )}

      {/* Shortcut key input */}
      <input
        type="text"
        value={config.shortcutKey ?? ""}
        placeholder="shortcut"
        title="Keyboard shortcut to load this config (e.g. Ctrl+1)"
        style={{ ...numInputStyle(), width: "70px" }}
        onBlur={(e: Event) => {
          void cbs.onShortcutChange((e.target as HTMLInputElement).value.trim());
        }}
        onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
      />

      {/* Set as default */}
      {!isDefault && (
        <button
          style={{ ...btnStyle("ghost"), fontSize: "11px", padding: "2px 5px" }}
          title="Set as default config"
          onClick={() => void cbs.onSetDefault()}
        >
          ★
        </button>
      )}

      {/* Rename */}
      <button
        style={{ ...btnStyle("ghost"), fontSize: "11px", padding: "2px 5px" }}
        title="Rename"
        onClick={() => cbs.onStartRename()}
      >
        ✎
      </button>

      {/* Delete */}
      <button
        style={{ ...btnStyle("ghost"), fontSize: "11px", padding: "2px 5px" }}
        title="Delete config"
        onClick={() => void cbs.onDelete()}
      >
        ✕
      </button>
    </div>
  ) as HTMLElement;
}

// ---------------------------------------------------------------------------
// Mutation helpers — each produces an updated config and re-renders
// ---------------------------------------------------------------------------

function mutateConfig(updater: (c: SegmentConfig) => SegmentConfig): void {
  if (!activeConfig) return;
  const next = updater(activeConfig);
  emitConfigChange(next);
  renderPanel(next);
  if (currentVideoId) void setLastUsed(currentVideoId, next);
}

function addNewSegment(config: SegmentConfig): void {
  const video = document.querySelector("video") as HTMLVideoElement | null;
  if (!video) return;
  const dur = video.duration || 100;
  const currentTime = video.currentTime;

  // Primary: split the segment at the current playhead.
  //   Left half  → [original start, playhead]
  //   Right half → [playhead, original end]
  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);
  const segAtPlayhead = sorted.find(
    (s) => currentTime > s.startTime + 0.1 && currentTime < s.endTime - 0.1,
  );
  if (segAtPlayhead) {
    const split = splitSegmentAtTime(config, segAtPlayhead.id, currentTime);
    if (split) {
      mutateConfig(() => split);
      return;
    }
  }

  // Fallback: no segment at playhead — append after the last segment.
  const lastSeg = sorted[sorted.length - 1];
  const start = lastSeg ? Math.min(lastSeg.endTime, dur - 2) : 0;
  const end = Math.min(start + Math.min(30, (dur - start) * 0.5), dur);
  mutateConfig((c) => addSegmentToConfig(c, Math.max(0, start), Math.max(start + 1, end)));
}

function removeSegment(config: SegmentConfig, segId: SegmentId): void {
  if (config.segments.length <= 1) return; // keep at least one
  mutateConfig((c) => removeSegmentFromConfig(c, segId));
}

function addStep(config: SegmentConfig): void {
  const firstSegId = config.segments[0]?.id;
  if (!firstSegId) return;
  const newStep: PlayStep = {
    id: crypto.randomUUID(),
    segmentIds: [firstSegId],
    count: 1,
    playbackRate: null,
    perIterationRates: [],
  };
  mutateConfig((_c) => ({
    ...config,
    sequence: [...config.sequence, newStep],
    updatedAt: Date.now(),
  }));
}

function removeStep(_config: SegmentConfig, stepId: StepId): void {
  mutateConfig((c) => {
    if (c.sequence.length <= 1) return c; // keep at least one step
    return { ...c, sequence: c.sequence.filter((s) => s.id !== stepId), updatedAt: Date.now() };
  });
}

function addSegRefToStep(
  _config: SegmentConfig,
  stepId: StepId,
  segId: SegmentId,
): void {
  mutateConfig((c) => ({
    ...c,
    sequence: c.sequence.map((s) =>
      s.id === stepId ? { ...s, segmentIds: [...s.segmentIds, segId] } : s,
    ),
    updatedAt: Date.now(),
  }));
}

function removeSegRefFromStep(
  _config: SegmentConfig,
  stepId: StepId,
  chipIndex: number,
): void {
  mutateConfig((c) => ({
    ...c,
    sequence: c.sequence.map((s) => {
      if (s.id !== stepId) return s;
      const newIds = s.segmentIds.filter((_, i) => i !== chipIndex);
      return newIds.length === 0 ? s : { ...s, segmentIds: newIds };
    }),
    updatedAt: Date.now(),
  }));
}

function reorderChip(
  _config: SegmentConfig,
  stepId: StepId,
  fromIdx: number,
  toIdx: number,
): void {
  mutateConfig((c) => ({
    ...c,
    sequence: c.sequence.map((s) => {
      if (s.id !== stepId) return s;
      const ids = [...s.segmentIds];
      const [removed] = ids.splice(fromIdx, 1);
      ids.splice(toIdx, 0, removed);
      return { ...s, segmentIds: ids };
    }),
    updatedAt: Date.now(),
  }));
  dragSrcStepId = null;
  dragSrcIdx = -1;
}

function updateStepCount(
  _config: SegmentConfig,
  stepId: StepId,
  count: number,
): void {
  mutateConfig((c) => ({
    ...c,
    sequence: c.sequence.map((s) => s.id === stepId ? { ...s, count } : s),
    updatedAt: Date.now(),
  }));
}

function updateStepRate(
  _config: SegmentConfig,
  stepId: StepId,
  rate: number | null,
): void {
  mutateConfig((c) => ({
    ...c,
    sequence: c.sequence.map((s) =>
      s.id === stepId ? { ...s, playbackRate: rate } : s,
    ),
    updatedAt: Date.now(),
  }));
}

function updateStepPerIterationRates(
  _config: SegmentConfig,
  stepId: StepId,
  rates: number[],
): void {
  mutateConfig((c) => ({
    ...c,
    sequence: c.sequence.map((s) =>
      s.id === stepId ? { ...s, perIterationRates: rates } : s,
    ),
    updatedAt: Date.now(),
  }));
}

// ---------------------------------------------------------------------------
// Save actions
// ---------------------------------------------------------------------------

async function saveAsDefault(config: SegmentConfig): Promise<void> {
  if (!currentVideoId) return;
  const named = { ...config, updatedAt: Date.now() };
  await saveNamedConfig(currentVideoId, named);
  await setDefaultConfig(currentVideoId, named.id);
  savedConfigsCache = await getSavedConfigs(currentVideoId);
  setSegmentButtonSaved(named.label);
  showToast("Saved to default slot ✓");
}

// ---------------------------------------------------------------------------
// Toast — uses YouTube's own paper-toast when available
// ---------------------------------------------------------------------------

function showToast(msg: string): void {
  // Try to use YouTube's own notification toast first
  const ytToast = document.querySelector("yt-notification-action-renderer") as HTMLElement | null;
  if (ytToast) {
    // Fall through to our own; YT's is not easily programmable
  }

  const existing = document.getElementById("tppng-panel-toast");
  if (existing) existing.remove();

  const toast = (
    <div
      id="tppng-panel-toast"
      style={{
        position: "fixed",
        bottom: "64px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--yt-spec-raised-background, #212121)",
        color: "var(--yt-spec-text-primary, #fff)",
        padding: "8px 18px",
        borderRadius: "20px",
        fontSize: "13px",
        zIndex: 99999,
        pointerEvents: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        fontFamily: '"YouTube Sans","Roboto",sans-serif',
      }}
    >
      {msg}
    </div>
  ) as HTMLElement;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ---------------------------------------------------------------------------
// Shared style helpers — YouTube-native variables with dark-mode fallbacks
// ---------------------------------------------------------------------------

type BtnVariant = "accent" | "ghost";

function btnStyle(variant: BtnVariant): Record<string, string> {
  const base: Record<string, string> = {
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    padding: "3px 8px",
    fontSize: "12px",
    fontFamily: "inherit",
    lineHeight: "1.4",
    transition: "opacity 0.1s",
  };
  if (variant === "accent") {
    return {
      ...base,
      background: "var(--yt-spec-call-to-action, #3ea6ff)",
      color: "var(--yt-spec-brand-button-text, #fff)",
    };
  }
  return {
    ...base,
    background: "transparent",
    color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
  };
}

function menuItemStyle(): Record<string, string> {
  return {
    display: "block",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    padding: "7px 10px",
    fontSize: "12px",
    fontFamily: "inherit",
    background: "transparent",
    color: "var(--yt-spec-text-primary, #fff)",
  };
}

function numInputStyle(): Record<string, string> {
  return {
    width: "42px",
    background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08))",
    border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.15))",
    borderRadius: "4px",
    color: "var(--yt-spec-text-primary, #fff)",
    fontSize: "11px",
    padding: "2px 4px",
    textAlign: "right",
    fontFamily: "inherit",
  };
}

// Export mutation helper needed by watch.tsx
export { mutateConfig };
