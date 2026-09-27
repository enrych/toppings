import { defineSettings } from "@/kernel/settings";

export const playlistRuntimeSettings = defineSettings(
  "playlist-runtime",
  { enabled: true },
  (store) => {
    const legacy = (store.preferences as { playlist?: { isEnabled?: boolean } } | undefined)?.playlist;
    return legacy?.isEnabled === undefined ? undefined : { enabled: legacy.isEnabled };
  },
);
