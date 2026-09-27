import { drawWaveform } from "@/lib/waveform";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";

export type CoverMode = "black" | "visualizer" | "custom";

// Above the picture (z-index 10), the scrubbing frame preview (16) and the
// pre-play thumbnail; below the spinner (18) and the controls (59), so the
// player stays fully usable while the video cannot be seen.
const COVER_Z_INDEX = "17";

interface Cover {
  mode: CoverMode;
  element: HTMLElement;
  stop?: () => void;
}

const IMAGE_KEY = CHROME_STORAGE_LOCAL_KEY.VISUALS_IMAGE;

const covers = new WeakMap<HTMLElement, Cover>();
const imageCovers = new Set<HTMLElement>();
let watchingImage = false;
let imageChanges = 0;

// Idempotent, since primitives re-apply whenever the page re-renders.
export function showCover(player: HTMLElement, mode: CoverMode): void {
  const current = covers.get(player);
  if (current?.mode === mode && current.element.isConnected) return;
  removeCover(player);

  const element = document.createElement("div");
  Object.assign(element.style, { position: "absolute", inset: "0", zIndex: COVER_Z_INDEX, background: "#000 center / cover no-repeat", pointerEvents: "none" });
  player.append(element);
  const cover: Cover = { mode, element };
  covers.set(player, cover);

  const video = player.querySelector("video");
  if (mode === "visualizer" && video) {
    const canvas = element.appendChild(document.createElement("canvas"));
    Object.assign(canvas.style, { display: "block", width: "100%", height: "100%" });
    cover.stop = drawWaveform(canvas, video);
  }
  if (mode === "custom") {
    imageCovers.add(element);
    watchImage();
    // A read that returns after the image changed would repaint the old one.
    const changesSeen = imageChanges;
    void chrome.storage.local.get(IMAGE_KEY).then((stored) => {
      if (imageChanges === changesSeen) paintImage(element, stored[IMAGE_KEY]);
    });
  }
}

export function removeCover(player: HTMLElement): void {
  const cover = covers.get(player);
  cover?.stop?.();
  cover?.element.remove();
  if (cover) imageCovers.delete(cover.element);
  covers.delete(player);
}

function paintImage(element: HTMLElement, image: unknown): void {
  element.style.backgroundImage = typeof image === "string" ? `url("${image}")` : "";
}

// An image picked in the options page shows on a player that is already
// covered, rather than only after the next navigation.
function watchImage(): void {
  if (watchingImage) return;
  watchingImage = true;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !(IMAGE_KEY in changes)) return;
    imageChanges++;
    for (const element of imageCovers) paintImage(element, changes[IMAGE_KEY].newValue);
  });
}
