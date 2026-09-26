/** @jsxImportSource dom-chef-jsx */
import type { Segment, SegmentConfig } from "../types";
import { colorForIndex, formatTimestamp } from "./format";
import { addNewSegment, removeSegment, updateStepCount, updateStepRate } from "./mutations";
import { btnStyle, numInputStyle } from "./styles";

export function buildSegmentList(config: SegmentConfig): HTMLElement {
  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {sorted.map((segment, i) => buildSegmentRow(config, segment, i))}
      <button style={{ ...btnStyle("ghost"), marginTop: "4px", fontSize: "12px" }} onClick={() => addNewSegment(config)}>
        + Add Segment
      </button>
    </div>
  );
}

const labelStyle = {
  fontSize: "11px",
  color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
  display: "flex",
  alignItems: "center",
  gap: "3px",
};

function buildSegmentRow(config: SegmentConfig, segment: Segment, index: number): HTMLElement {
  const color = colorForIndex(index);

  // Loop count and rate belong to steps. They are only editable here in the
  // single-step case, where the mapping is unambiguous; otherwise the sequence
  // editor is the place.
  const step = config.sequence.length === 1 ? config.sequence[0] : null;

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
      <span style={{ color, fontWeight: 700, minWidth: "18px", fontSize: "12px" }}>{index + 1}</span>

      <span style={{ flex: 1, fontVariantNumeric: "tabular-nums", fontSize: "12px", color: "var(--yt-spec-text-primary, #fff)" }}>
        {formatTimestamp(segment.startTime)} → {formatTimestamp(segment.endTime)}
      </span>

      {segment.label && (
        <span style={{ fontSize: "11px", color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))", fontStyle: "italic" }}>
          {segment.label}
        </span>
      )}

      {step && (
        <label style={labelStyle} title="Loop count (0 = infinite)">
          ↺
          <input
            type="number"
            min="0"
            step="1"
            value={String(step.count)}
            title="Loop count (0 = infinite)"
            style={numInputStyle()}
            onChange={(e: Event) => {
              const value = parseInt((e.target as HTMLInputElement).value, 10);
              updateStepCount(step.id, isNaN(value) ? 0 : Math.max(0, value));
            }}
          />
        </label>
      )}

      {step && (
        <label style={labelStyle} title="Playback rate override">
          ▶
          <input
            type="number"
            min="0.25"
            max="16"
            step="0.25"
            value={step.playbackRate !== null ? String(step.playbackRate) : ""}
            placeholder="1×"
            title="Playback rate override (blank = keep current)"
            style={numInputStyle()}
            onChange={(e: Event) => {
              const raw = (e.target as HTMLInputElement).value.trim();
              updateStepRate(step.id, raw === "" ? null : parseFloat(raw));
            }}
          />
        </label>
      )}

      <button style={{ ...btnStyle("ghost"), padding: "2px 6px" }} title="Remove segment" onClick={() => removeSegment(config, segment.id)}>
        ✕
      </button>
    </div>
  );
}
