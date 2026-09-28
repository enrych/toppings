import { credit } from "@/kernel/dom/credit";

export interface ControlsProps {
  autoScroll: boolean;
  fastRate: number;
  isFast: boolean;
  onToggleAutoScroll: () => void;
  onToggleRate: () => void;
}

// Two round buttons in the reel's action column, drawn like YouTube's own.
const styles = `
  .stack { display: flex; flex-direction: column; gap: 16px; align-items: center; margin-bottom: 16px; }
  button { width: 48px; height: 48px; border: 0; border-radius: 50%; cursor: pointer;
    background: rgba(255,255,255,0.1); color: #fff; font: 500 12px/1 "Roboto", "Arial", sans-serif; }
  button:hover { background: rgba(255,255,255,0.2); }
  button.on { background: rgba(255,255,255,0.3); }
`;

export function Controls({ autoScroll, fastRate, isFast, onToggleAutoScroll, onToggleRate }: ControlsProps) {
  return (
    <div class="stack">
      <style>{styles}</style>
      <button class={autoScroll ? "on" : ""} title={credit("Auto-scroll to the next Short")} aria-pressed={autoScroll} onClick={onToggleAutoScroll}>
        Auto
      </button>
      <button class={isFast ? "on" : ""} title={credit("Toggle playback rate")} aria-pressed={isFast} onClick={onToggleRate}>
        {fastRate}×
      </button>
    </div>
  );
}
