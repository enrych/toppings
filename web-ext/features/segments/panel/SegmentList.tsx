/** @jsxImportSource preact */
import { colorForIndex, formatTimestamp } from "../format";
import type { SegmentConfig } from "../types";

export interface SegmentListProps {
  config: SegmentConfig;
  onAdd: () => void;
  onRemove: (segmentId: string) => void;
  onCount: (stepId: string, count: number) => void;
  onRate: (stepId: string, rate: number | null) => void;
}

export function SegmentList({ config, onAdd, onRemove, onCount, onRate }: SegmentListProps) {
  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);
  // Loop count and rate belong to steps; they are editable here only when
  // there is a single step, where the mapping is unambiguous.
  const step = config.sequence.length === 1 ? config.sequence[0] : null;

  return (
    <div class="stack">
      {sorted.map((segment, index) => (
        <div class="segment" key={segment.id} style={{ "--seg": colorForIndex(index) }}>
          <span class="index">{index + 1}</span>
          <span class="range">{formatTimestamp(segment.startTime)} → {formatTimestamp(segment.endTime)}</span>
          {segment.label && <span class="note">{segment.label}</span>}
          {step && (
            <label class="field" title="Loop count (0 = infinite)">
              ↺
              <input class="input" type="number" min="0" step="1" value={step.count} onChange={(e) => onCount(step.id, Math.max(0, parseInt(e.currentTarget.value, 10) || 0))} />
            </label>
          )}
          {step && (
            <label class="field" title="Playback rate override (blank = keep current)">
              ▶
              <input
                class="input"
                type="number"
                min="0.25"
                max="16"
                step="0.25"
                placeholder="1×"
                value={step.playbackRate ?? ""}
                onChange={(e) => {
                  const raw = e.currentTarget.value.trim();
                  onRate(step.id, raw === "" ? null : parseFloat(raw));
                }}
              />
            </label>
          )}
          <button class="btn tiny" title="Remove segment" disabled={config.segments.length <= 1} onClick={() => onRemove(segment.id)}>✕</button>
        </div>
      ))}
      <button class="btn" style="align-self:flex-start;margin-top:4px" onClick={onAdd}>+ Add Segment</button>
    </div>
  );
}
