import { credit } from "@/kernel/dom/credit";

// State is shown by fill, never by colour, the same way YouTube's own
// control-bar toggles do it and the only cue that survives colour-blindness.
export function SegmentButton({ active }: { active: boolean }) {
  const bar = (x: number, width: number) => (
    <rect x={x} y="6" width={width} height="12" rx="1.5" fill={active ? "white" : "none"} stroke={active ? "none" : "white"} stroke-width="1.5" />
  );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {bar(2, 7)}
      {bar(11, 7)}
      {bar(20, 2)}
    </svg>
  );
}

export function segmentButtonHost(): HTMLButtonElement {
  const host = document.createElement("button");
  host.id = "tppng-segment-button";
  host.className = "ytp-button";
  host.setAttribute("aria-label", "Segments playback");
  return host;
}

export function setSegmentButtonState(host: HTMLButtonElement, active: boolean, label: string | null): void {
  host.setAttribute("aria-pressed", String(active));
  host.title = credit(label ? `Segments: ${label}` : "Segments");
}
