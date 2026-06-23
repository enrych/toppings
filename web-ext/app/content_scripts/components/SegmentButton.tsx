import React from "dom-chef";

// ---------------------------------------------------------------------------
// SegmentButton — control bar button for the Segments feature
//
// Icon states communicate the feature state clearly without relying on colour:
//   Inactive  → segment bars are outlined (hollow) — "idle / off"
//   Active    → segment bars are filled (solid) — "playing segments"
//
// This mirrors how YouTube's own buttons work (CC, subtitles, etc.).
// ---------------------------------------------------------------------------

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

/**
 * Toggle the visual active/inactive state.
 *
 * Active   → filled segment bars, full opacity, subtle background (YouTube press style)
 * Inactive → outlined segment bars, dimmed opacity
 */
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

/**
 * Update the button tooltip to show the loaded config name.
 * No colour change — state is communicated by fill/outline only.
 * Pass null to reset to the default tooltip.
 */
export function setSegmentButtonSaved(configLabel: string | null): void {
  SegmentButton.title = configLabel ? `Segments — ${configLabel}` : "Segments";
}
