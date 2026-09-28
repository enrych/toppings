import { bootFeatures, type Booted } from "@/kernel/features";
import { onNavigate } from "@/youtube/route";
import { appSettings } from "@/app/settings";
import { playlistRuntime } from "@/features/playlist-runtime";
import { shorts } from "@/features/shorts";
import { playback } from "@/features/playback";
import { profiles } from "@/features/profiles";
import { segments } from "@/features/segments";
import { scheduleNotices } from "@/features/schedules";

const TAKEOVER_EVENT = "tppng:takeover";

// An update cuts off the content script in tabs already open: Firefox unloads
// it, Chrome leaves it running without the extension. The background starts
// this copy in those tabs, and it asks an older one to step down first, or
// every shortcut would fire twice.
document.dispatchEvent(new Event(TAKEOVER_EVENT));
let booted: Booted | undefined;
let handedOver = false;
document.addEventListener(
  TAKEOVER_EVENT,
  () => {
    handedOver = true;
    booted?.stop();
  },
  { once: true },
);

// Booted only once the master switch is known: the first navigation mounts
// at once, and with the switch off it must not, say, apply the default rate.
// A read that fails leaves the defaults, so Toppings still runs.
void appSettings.get().catch(() => appSettings.defaults).then((app) => {
  if (handedOver) return;
  let enabled = app.enabled;
  booted = bootFeatures([playlistRuntime, shorts, playback, profiles, segments, scheduleNotices], onNavigate, { enabled: () => enabled });

  // The app slice also holds the theme, which features do not read.
  appSettings.subscribe((next) => {
    if (next.enabled === enabled) return;
    enabled = next.enabled;
    booted?.refresh();
  });
});
