import { MAX_RATE, MIN_RATE } from "@/youtube/player";
import { formatClock } from "@/lib/duration";
import { colorForIndex } from "../format";
import type { Segment, SegmentConfig } from "../types";

export interface SegmentListProps {
  config: SegmentConfig;
  onAdd: () => void;
  onRemove: (segmentId: string) => void;
  onChange: (segmentId: string, change: Pick<Segment, "loops"> | Pick<Segment, "rate">) => void;
}

// A blank field is null; anything invalid puts back the value it replaced.
function commitNumber(input: HTMLInputElement, current: number | null, isValid: (n: number) => boolean, commit: (value: number | null) => void): void {
  const raw = input.value.trim();
  const value = raw === "" ? null : Number(raw);
  if (value === null ? input.validity.badInput : !isValid(value)) input.value = current === null ? "" : String(current);
  else commit(value);
}

export function SegmentList({ config, onAdd, onRemove, onChange }: SegmentListProps) {
  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);

  return (
    <div class="stack">
      {sorted.map((segment, index) => (
        <div class="segment" key={segment.id} style={{ "--seg": colorForIndex(index) }}>
          <span class="index">{index + 1}</span>
          <span class="range">{formatClock(segment.startTime)} → {formatClock(segment.endTime)}</span>
          <label class="field" title="Times to play before moving on (blank = loop forever)">
            ↺
            <input
              class="input"
              type="number"
              min="1"
              step="1"
              placeholder="∞"
              value={segment.loops ?? ""}
              onChange={(e) => commitNumber(e.currentTarget, segment.loops, (n) => Number.isInteger(n) && n >= 1, (loops) => onChange(segment.id, { loops }))}
            />
          </label>
          <label class="field" title={`Playback rate, ${MIN_RATE} to ${MAX_RATE} (blank = keep current)`}>
            ▶
            <input
              class="input"
              type="number"
              min={MIN_RATE}
              max={MAX_RATE}
              step="any"
              placeholder="1×"
              value={segment.rate ?? ""}
              onChange={(e) => commitNumber(e.currentTarget, segment.rate, (n) => n >= MIN_RATE && n <= MAX_RATE, (rate) => onChange(segment.id, { rate }))}
            />
          </label>
          <button class="btn tiny" title="Remove segment" disabled={config.segments.length <= 1} onClick={() => onRemove(segment.id)}>✕</button>
        </div>
      ))}
      <button class="btn" style="align-self:flex-start;margin-top:4px" onClick={onAdd}>+ Add Segment</button>
    </div>
  );
}
