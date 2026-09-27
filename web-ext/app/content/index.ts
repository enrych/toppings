import { bootFeatures } from "@/kernel/features";
import { onNavigate } from "@/youtube/route";
import { appSettings } from "@/app/settings";
import { playlistRuntime } from "@/features/playlist-runtime";
import { shorts } from "@/features/shorts";
import { playback } from "@/features/playback";
import { profiles } from "@/features/profiles";
import { segments } from "@/features/segments";

let enabled = true;
const booted = bootFeatures([playlistRuntime, shorts, playback, profiles, segments], onNavigate, { enabled: () => enabled });

void appSettings.get().then((app) => {
  enabled = app.enabled;
  booted.refresh();
});
appSettings.subscribe((app) => {
  enabled = app.enabled;
  booted.refresh();
});
