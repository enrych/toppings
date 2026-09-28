import { defineMessage } from "@/kernel/messaging";

export interface Position {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

const readLocation = defineMessage<void, Position>("read-location");

// Pages ask the way websites do, so the browser shows its usual location
// prompt; Toppings holds no location permission of its own.
export function readPosition(): Promise<Position> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracyMeters: coords.accuracy }),
      (error) => reject(new Error(error.message || "Location unavailable")),
      { timeout: 20_000, maximumAge: 60_000 },
    ),
  );
}

export function answerLocationRequests(): void {
  readLocation.handle(() => readPosition());
}

// Chrome's background is a service worker without geolocation, so it asks an
// offscreen document of the same origin, which inherits the answer the user
// gave the options page. Firefox's background is a page and asks directly.
export async function readPositionInBackground(): Promise<Position> {
  if (process.env.BROWSER === "firefox") return readPosition();
  const url = "offscreen/index.html";
  const open = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] });
  if (open.length === 0) {
    await chrome.offscreen.createDocument({ url, reasons: ["GEOLOCATION"], justification: "Checks whether you are at a place one of your schedules uses." });
  }
  try {
    return await readLocation.send();
  } finally {
    await chrome.offscreen.closeDocument().catch(() => {});
  }
}
