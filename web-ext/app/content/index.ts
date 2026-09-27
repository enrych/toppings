import { bootFeatures } from "@/kernel/features";
import { onNavigate } from "@/youtube/route";
import { appSettings } from "@/app/settings";
import { playlistRuntime } from "@/features/playlist-runtime";
import { shorts } from "@/features/shorts";
import { playback } from "@/features/playback";
import { profiles } from "@/features/profiles";
import { segments } from "@/features/segments";

// Booted only once the master switch is known: the first navigation mounts
// at once, and with the switch off it must not, say, apply the default rate.
// A read that fails leaves the defaults, so Toppings still runs.
void appSettings.get().catch(() => appSettings.defaults).then((app) => {
  let enabled = app.enabled;
  const booted = bootFeatures([playlistRuntime, shorts, playback, profiles, segments], onNavigate, { enabled: () => enabled });

  // The app slice also holds the theme, which features do not read.
  appSettings.subscribe((next) => {
    if (next.enabled === enabled) return;
    enabled = next.enabled;
    booted.refresh();
  });
});
