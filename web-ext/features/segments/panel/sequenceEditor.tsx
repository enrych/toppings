/** @jsxImportSource dom-chef-jsx */
import type { PlayStep, SegmentConfig, StepId } from "../types";
import { colorForIndex, formatTimestamp } from "./format";
import {
  addSegmentToStep,
  addStep,
  removeSegmentFromStep,
  removeStep,
  reorderStepSegments,
  updateStepCount,
  updateStepPerIterationRates,
  updateStepRate,
} from "./mutations";
import { advancedOpen, toggleAdvanced } from "./state";
import { btnStyle, numInputStyle } from "./styles";

export function buildAdvancedSection(config: SegmentConfig): HTMLElement {
  const label = (open: boolean) => `${open ? "▼" : "▶"} Advanced Sequence`;

  const body = (
    <div style={{ display: advancedOpen ? "block" : "none", marginTop: "8px" }}>
      {buildSequenceEditor(config)}
    </div>
  );

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
      onClick={() => {
        const open = toggleAdvanced();
        body.style.display = open ? "block" : "none";
        toggle.textContent = label(open);
      }}
    >
      {label(advancedOpen)}
    </button>
  );

  return (
    <div style={{ marginTop: "6px" }}>
      {toggle}
      {body}
    </div>
  );
}

function buildSequenceEditor(config: SegmentConfig): HTMLElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {config.sequence.map((step, i) => buildStepRow(config, step, i))}
      <button style={{ ...btnStyle("ghost"), fontSize: "12px", marginTop: "4px" }} onClick={() => addStep(config)}>
        + Add Step
      </button>
    </div>
  );
}

// Drag-to-reorder source, shared by the chips of whichever step is being dragged.
let dragSource: { stepId: StepId; index: number } | null = null;

const controlLabelStyle = {
  fontSize: "11px",
  color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

function buildStepRow(config: SegmentConfig, step: PlayStep, stepIndex: number): HTMLElement {
  const sortedSegments = [...config.segments].sort((a, b) => a.startTime - b.startTime);

  const chips = step.segmentIds.map((segmentId, chipIndex) => {
    const segment = config.segments.find((s) => s.id === segmentId);
    const sortedIndex = segment ? sortedSegments.indexOf(segment) : -1;
    const label = sortedIndex >= 0 ? `Seg ${sortedIndex + 1}` : "?";
    const color = sortedIndex >= 0 ? colorForIndex(sortedIndex) : "#666";
    const range = segment ? ` (${formatTimestamp(segment.startTime)}→${formatTimestamp(segment.endTime)})` : "";

    const chip = (
      <span
        draggable={true}
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
        title={`${label}${range} — drag to reorder, click ✕ to remove`}
      >
        <span style={{ opacity: "0.4", fontSize: "9px", cursor: "grab" }}>⠿</span>
        {label}
        <button
          style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "0", fontSize: "10px", lineHeight: "1", opacity: "0.6" }}
          title="Remove from step"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            removeSegmentFromStep(step.id, chipIndex);
          }}
        >
          ✕
        </button>
      </span>
    );

    chip.addEventListener("dragstart", (e: DragEvent) => {
      dragSource = { stepId: step.id, index: chipIndex };
      e.dataTransfer?.setData("text/plain", String(chipIndex));
      chip.style.opacity = "0.5";
    });
    chip.addEventListener("dragend", () => {
      chip.style.opacity = "1";
    });
    chip.addEventListener("dragover", (e: DragEvent) => {
      e.preventDefault();
      chip.style.outline = `2px solid ${color}`;
    });
    chip.addEventListener("dragleave", () => {
      chip.style.outline = "";
    });
    chip.addEventListener("drop", (e: DragEvent) => {
      e.preventDefault();
      chip.style.outline = "";
      if (!dragSource || dragSource.stepId !== step.id || dragSource.index === chipIndex) return;
      reorderStepSegments(step.id, dragSource.index, chipIndex);
      dragSource = null;
    });

    return chip;
  });

  const picker = (
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
        const select = e.target as HTMLSelectElement;
        if (!select.value) return;
        addSegmentToStep(step.id, select.value);
        select.value = "";
      }}
    >
      <option value="">+ Seg</option>
      {sortedSegments.map((s, i) => (
        <option value={s.id}>Seg {i + 1}</option>
      ))}
    </select>
  );

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
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))", minWidth: "44px", fontWeight: 600 }}>
          Step {stepIndex + 1}
        </span>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", flex: 1, minWidth: "0" }}>{chips}</div>
        {picker}
        <button style={{ ...btnStyle("ghost"), padding: "2px 5px", fontSize: "11px" }} title="Remove step" onClick={() => removeStep(step.id)}>
          ✕
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <label style={controlLabelStyle}>
          Count
          <input
            type="number"
            min="0"
            step="1"
            value={String(step.count)}
            title="0 = infinite; 1+ = play N times"
            style={numInputStyle()}
            onChange={(e: Event) => {
              const value = parseInt((e.target as HTMLInputElement).value, 10);
              updateStepCount(step.id, isNaN(value) ? 0 : Math.max(0, value));
            }}
          />
          <span style={{ fontSize: "10px", opacity: "0.5" }}>(0=∞)</span>
        </label>

        <label style={controlLabelStyle}>
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
              updateStepRate(step.id, raw === "" ? null : parseFloat(raw));
            }}
          />
        </label>

        <label style={controlLabelStyle}>
          Per-iter
          <input
            type="text"
            value={step.perIterationRates.join(", ")}
            placeholder="e.g. 1, 1.5"
            title="Comma-separated rates per iteration. Last entry repeats."
            style={{ ...numInputStyle(), width: "80px" }}
            onBlur={(e: Event) => {
              const rates = (e.target as HTMLInputElement).value
                .split(",")
                .map((v) => parseFloat(v.trim()))
                .filter((v) => !isNaN(v) && v > 0);
              updateStepPerIterationRates(step.id, rates);
            }}
          />
        </label>
      </div>
    </div>
  );
}
