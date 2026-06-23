import { AudioModeButton } from "./AudioModeButton";
import { AudioModeOverlay } from "./AudioModeOverlay";
import {
  AudioModeCanvas,
  startVisualizer,
  stopVisualizer,
  setVisualizerSensitivity,
} from "./AudioModeVisualizer";
import {
  AudioModeUIContainer,
  initAudioModeUI,
  setModeActions,
  updateActiveMode,
  showAudioModeUI,
  hideAudioModeUI,
} from "./AudioModeUI";
import { EXTENSION_LOCAL_STORAGE_KEY } from "../../../../data/extension.data";
import {
  getAudioModePin,
  removeAudioModePin,
  setAudioModePin,
} from "../../../../utils/storage/videoPreference";
import { Storage } from "../../../background/store";
import type { PlayerLayout, PlayerVisuals } from "../../../../utils/primitive";

let isAudioModeActive = false;
let currentScreenMode: "black" | "visualizer" | "custom" = "black";
let currentCustomImageUrl = "";
let currentVideo: HTMLVideoElement | null = null;
let currentPrefs: AudioModePrefs | null = null;
let currentVideoId = "";
let currentMoviePlayer: HTMLElement | null = null;
let adObserver: MutationObserver | null = null;
let pausedForAd = false;
let videoPinned = false;
// Persists across SPA navigations within the same tab. If the user toggled
// audio mode on, we keep it on as they move between videos until they
// explicitly toggle it off.
let userWantsAudioMode = false;
// True when the current Audio Mode activation was triggered by a profile
// (not by user intent). Used to cleanly deactivate when a profile is removed.
let profileActivatedAudioMode = false;

type AudioModePrefs = Storage["preferences"]["watch"]["audioMode"];

const GLOBAL_CUSTOM_IMAGE_KEY =
  EXTENSION_LOCAL_STORAGE_KEY.AUDIO_MODE_GLOBAL_CUSTOM_IMAGE;

function loadGlobalCustomImage(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(GLOBAL_CUSTOM_IMAGE_KEY, (result) => {
      resolve((result[GLOBAL_CUSTOM_IMAGE_KEY] as string) ?? null);
    });
  });
}

function saveGlobalCustomImage(dataUrl: string) {
  chrome.storage.local.set({ [GLOBAL_CUSTOM_IMAGE_KEY]: dataUrl });
}


export async function setupAudioMode(
  moviePlayer: HTMLElement,
  videoId: string,
  prefs: AudioModePrefs,
) {
  // Reset transient per-video state but DO NOT reset userWantsAudioMode —
  // we persist the user's intent across SPA navigations.
  isAudioModeActive = false;
  currentPrefs = prefs;
  currentVideoId = videoId;
  // Cache the resolved reference — avoids re-querying the DOM with a
  // hardcoded selector later (e.g. in setYouTubeChromeHidden).
  currentMoviePlayer = moviePlayer;
  currentScreenMode = prefs.screenMode;
  currentCustomImageUrl = prefs.customBackground.globalImageUrl;
  videoPinned = false;
  AudioModeButton.setAttribute("aria-pressed", "false");
  AudioModeOverlay.classList.add("tw-hidden");
  hideAudioModeUI();
  stopVisualizer();

  const sensitivity = parseFloat(prefs.visualizerSensitivity ?? "1.5");
  setVisualizerSensitivity(isFinite(sensitivity) ? sensitivity : 1.5);

  if (!prefs.isEnabled) {
    AudioModeButton.style.display = "none";
    return;
  }

  AudioModeButton.style.display = "";
  AudioModeButton.onclick = () => toggleAudioMode();

  if (!moviePlayer.querySelector("#tppng-audio-mode-overlay")) {
    moviePlayer.appendChild(AudioModeOverlay);
  }

  if (!moviePlayer.querySelector("#tppng-audio-mode-ui")) {
    moviePlayer.appendChild(AudioModeUIContainer);
  }

  currentVideo =
    (moviePlayer.querySelector("video") as HTMLVideoElement) ?? null;

  if (currentVideo) {
    initAudioModeUI(currentVideo);
  }

  setModeActions({
    onModeChange: handleModeChange,
    onSetDefault: handleSetDefault,
    onPinToVideo: handlePinToVideo,
    onUnpinVideo: handleUnpinVideo,
    onExitAudioMode: () => {
      if (isAudioModeActive) toggleAudioMode();
    },
    onPickCustomImage: handlePickCustomImage,
  });

  // If user uploaded a local image (stored in chrome.storage.local), it
  // overrides the URL preference for the global custom background.
  const localImage = await loadGlobalCustomImage();
  if (localImage) {
    currentCustomImageUrl = localImage;
  }

  let pinAppliedAudio = false;
  if (videoId) {
    const pin = await getAudioModePin(videoId);
    if (pin?.enabled) {
      currentScreenMode = pin.screenMode;
      if (pin.imageUrl) currentCustomImageUrl = pin.imageUrl;
      videoPinned = true;
      toggleAudioMode();
      pinAppliedAudio = true;
    }
  }

  // If a pin didn't already enable audio mode for this video, but the user
  // had audio mode active on the previous video, keep it on. This makes
  // audio mode "sticky" across SPA navigation, matching user expectations.
  if (!pinAppliedAudio && userWantsAudioMode) {
    toggleAudioMode();
  }

  setupAdObserver(moviePlayer);
}

function setupAdObserver(moviePlayer: HTMLElement) {
  if (adObserver) {
    adObserver.disconnect();
  }

  adObserver = new MutationObserver(() => {
    const isAdPlaying = moviePlayer.classList.contains("ad-showing");

    if (isAdPlaying && isAudioModeActive && !pausedForAd) {
      pausedForAd = true;
      AudioModeOverlay.classList.add("tw-hidden");
      hideAudioModeUI();
      stopVisualizer();
    } else if (!isAdPlaying && pausedForAd) {
      pausedForAd = false;
      if (isAudioModeActive) {
        AudioModeOverlay.classList.remove("tw-hidden");
        applyScreenMode();
        showAudioModeUI();
      }
    }
  });

  adObserver.observe(moviePlayer, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

function handleModeChange(mode: "black" | "visualizer" | "custom") {
  currentScreenMode = mode;
  updateActiveMode(mode, videoPinned);

  if (videoPinned && currentVideoId) {
    setAudioModePin(currentVideoId, {
      enabled: true,
      screenMode: mode,
      imageUrl: mode === "custom" ? currentCustomImageUrl : undefined,
    });
  }

  if (isAudioModeActive) {
    applyScreenMode();
  }
}

function handleSetDefault(mode: "black" | "visualizer" | "custom") {
  chrome.storage.sync.get(undefined, (storage) => {
    if (storage?.preferences?.watch?.audioMode) {
      storage.preferences.watch.audioMode.screenMode = mode;
      chrome.storage.sync.set(storage);
    }
  });
}

function handlePinToVideo(mode: "black" | "visualizer" | "custom") {
  if (!currentVideoId) return;
  videoPinned = true;
  setAudioModePin(currentVideoId, {
    enabled: true,
    screenMode: mode,
    imageUrl: mode === "custom" ? currentCustomImageUrl : undefined,
  });
  updateActiveMode(mode, true);
}

function handleUnpinVideo() {
  if (!currentVideoId) return;
  videoPinned = false;
  removeAudioModePin(currentVideoId);
  updateActiveMode(currentScreenMode, false);
}

function handlePickCustomImage(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    if (typeof dataUrl !== "string") return;
    currentCustomImageUrl = dataUrl;
    saveGlobalCustomImage(dataUrl);
    if (videoPinned && currentVideoId) {
      setAudioModePin(currentVideoId, {
        enabled: true,
        screenMode: currentScreenMode,
        imageUrl: dataUrl,
      });
    }
    if (isAudioModeActive && currentScreenMode === "custom") {
      applyScreenMode();
    }
  };
  reader.readAsDataURL(file);
}

function applyScreenMode() {
  stopVisualizer();
  AudioModeOverlay.innerHTML = "";
  AudioModeOverlay.style.backgroundImage = "";

  switch (currentScreenMode) {
    case "black":
      break;

    case "visualizer":
      AudioModeOverlay.appendChild(AudioModeCanvas);
      if (currentVideo) {
        startVisualizer(currentVideo);
      }
      break;

    case "custom":
      if (currentCustomImageUrl) {
        // Wrap in double quotes; CSS.escape() is for identifiers (class
        // names/selectors) and would mangle the URL's : ; / + = characters.
        const escapedUrl = currentCustomImageUrl.replace(/"/g, '\\"');
        AudioModeOverlay.style.backgroundImage = `url("${escapedUrl}")`;
        AudioModeOverlay.style.backgroundSize = "cover";
        AudioModeOverlay.style.backgroundPosition = "center";
      }
      break;
  }
}

function setYouTubeChromeHidden(hidden: boolean) {
  // Use the cached reference from setupAudioMode — no hardcoded DOM lookup.
  if (!currentMoviePlayer) return;
  if (hidden) {
    currentMoviePlayer.classList.add("tppng-audio-mode-on");
  } else {
    currentMoviePlayer.classList.remove("tppng-audio-mode-on");
  }
}

export function toggleAudioMode() {
  isAudioModeActive = !isAudioModeActive;
  // Persist the user's intent across SPA navigations. After this toggle
  // (whether triggered by user click, keyboard shortcut, or pin restore),
  // userWantsAudioMode reflects the new state — so future page navigations
  // will keep audio mode in the same state without user action.
  userWantsAudioMode = isAudioModeActive;
  AudioModeButton.setAttribute(
    "aria-pressed",
    isAudioModeActive ? "true" : "false",
  );

  if (isAudioModeActive) {
    AudioModeOverlay.classList.remove("tw-hidden");
    requestAnimationFrame(() => {
      AudioModeOverlay.classList.remove("tw-opacity-0");
      AudioModeOverlay.classList.add("tw-opacity-100");
    });
    applyScreenMode();
    updateActiveMode(currentScreenMode, videoPinned);
    showAudioModeUI();
    setYouTubeChromeHidden(true);
  } else {
    AudioModeOverlay.classList.remove("tw-opacity-100");
    AudioModeOverlay.classList.add("tw-opacity-0");
    hideAudioModeUI();
    stopVisualizer();
    setYouTubeChromeHidden(false);
    setTimeout(() => {
      if (!isAudioModeActive) {
        AudioModeOverlay.classList.add("tw-hidden");
        AudioModeOverlay.innerHTML = "";
        AudioModeOverlay.style.backgroundImage = "";
      }
    }, 300);
  }
}

/**
 * Apply layout/visuals settings from an active profile.
 *
 * - `layout === "no-video"` → activates Audio Mode (if not already active).
 * - `visuals` → sets the screen mode overlay (black / visualizer / custom).
 * - Called with no arguments (or absent layout) → deactivates Audio Mode
 *   only if it was activated by a previous profile call; user-toggled state
 *   is preserved.
 *
 * Call this after `setupAudioMode` has run so the movie player and video
 * references are already resolved.
 */
export function applyAudioModeFromProfile(
  layout?: PlayerLayout,
  visuals?: PlayerVisuals,
): void {
  const wantsAudioMode = layout === "no-video";

  if (wantsAudioMode) {
    // Map PlayerVisuals → AudioMode screen mode.
    // "video" means "show the video" — not applicable inside Audio Mode,
    // so we default to "black" in that case.
    const screenMode: "black" | "visualizer" | "custom" =
      visuals === "visualizer" ? "visualizer"
      : visuals === "custom" ? "custom"
      : "black";

    // Update currentScreenMode so applyScreenMode picks it up.
    currentScreenMode = screenMode;

    if (!isAudioModeActive) {
      profileActivatedAudioMode = true;
      // toggleAudioMode sets userWantsAudioMode — we don't want a profile
      // activation to lock the sticky flag on, so we'll restore it after.
      const prevUserWants = userWantsAudioMode;
      toggleAudioMode();
      userWantsAudioMode = prevUserWants;
    } else {
      // Already active — just update the overlay.
      applyScreenMode();
      updateActiveMode(currentScreenMode, videoPinned);
    }
  } else {
    // No Audio Mode requested by this profile.
    if (isAudioModeActive && profileActivatedAudioMode) {
      // Deactivate — but restore userWantsAudioMode to its pre-profile value
      // so the sticky behaviour isn't affected.
      const prevUserWants = userWantsAudioMode;
      toggleAudioMode();
      userWantsAudioMode = prevUserWants;
    }
    profileActivatedAudioMode = false;
  }
}

export function teardownAudioMode() {
  isAudioModeActive = false;
  pausedForAd = false;
  videoPinned = false;
  AudioModeButton.setAttribute("aria-pressed", "false");
  AudioModeOverlay.classList.add("tw-hidden");
  hideAudioModeUI();
  stopVisualizer();
  setYouTubeChromeHidden(false);
  if (adObserver) {
    adObserver.disconnect();
    adObserver = null;
  }
}

export { AudioModeButton };
