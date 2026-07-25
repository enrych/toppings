import React from "dom-chef";

// State is shown by fill, never by colour — the same way YouTube signals its own
// control-bar toggles, and the only cue that survives a colour-blind viewer.

export const SegmentButton = (
  <button
    className="ytp-button"
    aria-pressed="false"
    aria-label="Segments playback"
    title="Segments"
    id="tppng-segment-button"
    style={{ opacity: "0.7" }}
  >
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/*
        Three segment blocks on a timeline.
        Outlined = inactive (segments off).
        Filled   = active  (segments playing).
      */}
      <rect
        className="tppng-sb-bar"
        x="2" y="6" width="7" height="12" rx="1.5"
        fill="none" stroke="white" strokeWidth="1.5"
      />
      <rect
        className="tppng-sb-bar"
        x="11" y="6" width="7" height="12" rx="1.5"
        fill="none" stroke="white" strokeWidth="1.5"
      />
      <rect
        className="tppng-sb-bar"
        x="20" y="6" width="2" height="12" rx="1"
        fill="none" stroke="white" strokeWidth="1.5"
      />
    </svg>
  </button>
) as HTMLButtonElement;

export function setSegmentButtonActive(active: boolean): void {
  SegmentButton.setAttribute("aria-pressed", active ? "true" : "false");

  const bars = SegmentButton.querySelectorAll<SVGRectElement>(".tppng-sb-bar");
  if (active) {
    SegmentButton.style.opacity = "1";
    SegmentButton.style.background = "rgba(255,255,255,0.15)";
    SegmentButton.style.borderRadius = "4px";
    bars.forEach((r) => {
      r.setAttribute("fill", "white");
      r.setAttribute("stroke", "none");
    });
  } else {
    SegmentButton.style.opacity = "0.7";
    SegmentButton.style.background = "";
    SegmentButton.style.borderRadius = "";
    bars.forEach((r) => {
      r.setAttribute("fill", "none");
      r.setAttribute("stroke", "white");
    });
  }
}

export function setSegmentButtonSaved(configLabel: string | null): void {
  SegmentButton.title = configLabel ? `Segments — ${configLabel}` : "Segments";
}
