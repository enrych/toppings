/** @jsxImportSource preact */
import { useRef, useState } from "preact/hooks";
import { colorForIndex, formatTimestamp } from "../format";
import type { PlayStep, SegmentConfig } from "../types";

export interface StepActions {
  addStep: () => void;
  removeStep: (stepId: string) => void;
  addToStep: (stepId: string, segmentId: string) => void;
  removeFromStep: (stepId: string, index: number) => void;
  reorder: (stepId: string, from: number, to: number) => void;
  setCount: (stepId: string, count: number) => void;
  setRate: (stepId: string, rate: number | null) => void;
  setPerIterationRates: (stepId: string, rates: number[]) => void;
}

export function SequenceEditor({ config, actions }: { config: SegmentConfig; actions: StepActions }) {
  const [open, setOpen] = useState(false);
  return (
    <div style="margin-top:6px">
      <button class="btn disclosure" onClick={() => setOpen((o) => !o)}>{open ? "▼" : "▶"} Advanced Sequence</button>
      {open && (
        <div class="stack" style="margin-top:8px">
          {config.sequence.map((step, i) => <StepRow key={step.id} config={config} step={step} index={i} actions={actions} />)}
          <button class="btn" style="align-self:flex-start" onClick={actions.addStep}>+ Add Step</button>
        </div>
      )}
    </div>
  );
}

const parseRates = (text: string) => text.split(",").map((v) => parseFloat(v.trim())).filter((v) => !isNaN(v) && v > 0);

function StepRow({ config, step, index, actions }: { config: SegmentConfig; step: PlayStep; index: number; actions: StepActions }) {
  const sorted = [...config.segments].sort((a, b) => a.startTime - b.startTime);
  const dragFrom = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  return (
    <div class="step">
      <div class="row">
        <span class="name">Step {index + 1}</span>
        <div class="chips">
          {step.segmentIds.map((segmentId, chipIndex) => {
            const segment = config.segments.find((s) => s.id === segmentId);
            const position = segment ? sorted.indexOf(segment) : -1;
            const label = position >= 0 ? `Seg ${position + 1}` : "?";
            const range = segment ? ` (${formatTimestamp(segment.startTime)}→${formatTimestamp(segment.endTime)})` : "";
            return (
              <span
                key={`${segmentId}-${chipIndex}`}
                class="segchip"
                style={{ "--seg": position >= 0 ? colorForIndex(position) : "#666" }}
                draggable
                data-over={over === chipIndex ? "" : undefined}
                title={`${label}${range} — drag to reorder`}
                onDragStart={(e) => {
                  dragFrom.current = chipIndex;
                  e.dataTransfer?.setData("text/plain", String(chipIndex));
                }}
                onDragOver={(e) => (e.preventDefault(), setOver(chipIndex))}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(null);
                  const from = dragFrom.current;
                  dragFrom.current = null;
                  if (from !== null && from !== chipIndex) actions.reorder(step.id, from, chipIndex);
                }}
              >
                <span class="grip">⠿</span>
                {label}
                <button class="x" title="Remove from step" onClick={() => actions.removeFromStep(step.id, chipIndex)}>✕</button>
              </span>
            );
          })}
        </div>
        <select
          class="select"
          value=""
          onChange={(e) => {
            if (e.currentTarget.value) actions.addToStep(step.id, e.currentTarget.value);
            e.currentTarget.value = "";
          }}
        >
          <option value="">+ Seg</option>
          {sorted.map((s, i) => <option value={s.id}>Seg {i + 1}</option>)}
        </select>
        <button class="btn tiny" title="Remove step" disabled={config.sequence.length <= 1} onClick={() => actions.removeStep(step.id)}>✕</button>
      </div>
      <div class="row" style="gap:12px">
        <label class="field" title="0 = infinite; 1+ = play N times">
          Count
          <input class="input" type="number" min="0" step="1" value={step.count} onChange={(e) => actions.setCount(step.id, Math.max(0, parseInt(e.currentTarget.value, 10) || 0))} />
          <span style="font-size:10px;opacity:.5">(0=∞)</span>
        </label>
        <label class="field" title="Playback rate for this step (blank = no change)">
          Rate
          <input
            class="input"
            type="number"
            min="0.25"
            max="16"
            step="0.25"
            placeholder="default"
            value={step.playbackRate ?? ""}
            onChange={(e) => {
              const raw = e.currentTarget.value.trim();
              actions.setRate(step.id, raw === "" ? null : parseFloat(raw));
            }}
          />
        </label>
        <label class="field" title="Comma-separated rates per iteration; the last entry repeats.">
          Per-iter
          <input class="input short" type="text" placeholder="e.g. 1, 1.5" value={step.perIterationRates.join(", ")} onBlur={(e) => actions.setPerIterationRates(step.id, parseRates(e.currentTarget.value))} />
        </label>
      </div>
    </div>
  );
}
