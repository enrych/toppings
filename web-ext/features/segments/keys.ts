import { defineKeys } from "@/kernel/keys";

export const segmentsKeys = defineKeys({
  id: "segments",
  title: "Segments",
  keys: {
    toggle: { label: "Toggle segments", description: "Load the last-used segments, or turn them off.", defaultBinding: "Z" },
    fresh: { label: "Fresh slate", description: "Start over with one segment spanning the video.", defaultBinding: "Shift+Z" },
    setStart: { label: "Set segment start", description: "Move the current segment's start to the playhead.", defaultBinding: "Q" },
    setEnd: { label: "Set segment end", description: "Move the current segment's end to the playhead.", defaultBinding: "E" },
    nudgeStartBackward: { label: "Nudge start backward", defaultBinding: "Shift+Q" },
    nudgeStartForward: { label: "Nudge start forward", defaultBinding: "" },
    nudgeEndBackward: { label: "Nudge end backward", defaultBinding: "" },
    nudgeEndForward: { label: "Nudge end forward", defaultBinding: "Shift+E" },
    save: { label: "Save segments", description: "Save over the loaded config, or keep a new slate under a generated name.", defaultBinding: "" },
  },
});
