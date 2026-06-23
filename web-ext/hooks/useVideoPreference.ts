import { useCallback, useEffect, useState } from "react";
import {
  loadVideoPreferenceSnapshot,
  type VideoPreferenceSnapshot,
} from "../utils/storage/videoPreference";

const EMPTY_SNAPSHOT: VideoPreferenceSnapshot = {
  audioMode: { pinCount: 0 },
};

export function useVideoPreference(): {
  preferences: VideoPreferenceSnapshot;
  refresh: () => void;
} {
  const [preferences, setPreferences] =
    useState<VideoPreferenceSnapshot>(EMPTY_SNAPSHOT);

  const refresh = useCallback(() => {
    loadVideoPreferenceSnapshot().then(setPreferences);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  return { preferences, refresh };
}
