import { defineKeys } from "@/kernel/keys";

export const shortsKeys = defineKeys({
  id: "shorts",
  title: "Shorts",
  keys: {
    toggleRate: { label: "Toggle playback rate", defaultBinding: "X" },
    seekBackward: { label: "Seek backward", defaultBinding: "A" },
    seekForward: { label: "Seek forward", defaultBinding: "D" },
  },
});
