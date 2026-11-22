import { defineKeys } from "@/kernel/keys";

export const playbackKeys = defineKeys({
  id: "playback",
  title: "Playback",
  keys: {
    toggleRate: { label: "Toggle playback rate", description: "Between 1× and your toggle rate.", defaultBinding: "X" },
    increaseRate: { label: "Increase playback rate", defaultBinding: "W" },
    decreaseRate: { label: "Decrease playback rate", defaultBinding: "S" },
    seekBackward: { label: "Seek backward", defaultBinding: "A" },
    seekForward: { label: "Seek forward", defaultBinding: "D" },
  },
});
