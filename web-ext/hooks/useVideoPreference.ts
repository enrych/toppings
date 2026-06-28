import { useCallback, useEffect, useState } from "react";
import {
  countAudioModePins,
  type VideoPreferenceSnapshot,
} from "../app/content_scripts/components/AudioMode/videoPreference";

export function useVideoPreference(): {
  preferences: VideoPreferenceSnapshot;
  refresh: () => void;
} {
  const [preferences, setPreferences] =
    useState<VideoPreferenceSnapshot>({ audioMode: { pinCount: 0 } });

  const refresh = useCallback(() => {
    countAudioModePins().then((pinCount) => setPreferences({ audioMode: { pinCount } }));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  return { preferences, refresh };
}
