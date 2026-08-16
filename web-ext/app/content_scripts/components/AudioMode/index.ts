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
import { CHROME_STORAGE_LOCAL_KEY } from "../../../../data/core";
import {
  getAudioModePin,
  removeAudioModePin,
  setAudioModePin,
} from "./videoPreference";
import { Storage } from "../../../background/store";
import type { PlayerLayout, PlayerVisuals } from "../../../../data/profiles";

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
// Survives SPA navigation so audio mode stays on across videos until the user
// turns it off themselves.
let userWantsAudioMode = false;
// Separates a profile-driven activation from a user-driven one, so removing the
// profile can undo only what the profile did.
let profileActivatedAudioMode = false;

type AudioModePrefs = Storage["preferences"]["watch"]["audioMode"];

const GLOBAL_CUSTOM_IMAGE_KEY =
  CHROME_STORAGE_LOCAL_KEY.AUDIO_MODE_GLOBAL_CUSTOM_IMAGE;

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
  // Per-video state resets here; userWantsAudioMode deliberately does not,
  // because that is the flag carrying the user's intent across navigations.
  isAudioModeActive = false;
  currentPrefs = prefs;
  currentVideoId = videoId;
  // Cached so later callers never have to re-query with a hardcoded selector.
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

  // An uploaded local image outranks the URL preference.
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

  // A per-video pin has already had its say; this is the sticky carry-over
  // from the previous video, which must not override it.
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
        // Quote-escaped by hand: CSS.escape targets identifiers and would
        // mangle the : ; / + = characters a URL depends on.
        const escapedUrl = currentCustomImageUrl.replace(/"/g, '\\"');
        AudioModeOverlay.style.backgroundImage = `url("${escapedUrl}")`;
        AudioModeOverlay.style.backgroundSize = "cover";
        AudioModeOverlay.style.backgroundPosition = "center";
      }
      break;
  }
}

function setYouTubeChromeHidden(hidden: boolean) {
  if (!currentMoviePlayer) return;
  if (hidden) {
    currentMoviePlayer.classList.add("tppng-audio-mode-on");
  } else {
    currentMoviePlayer.classList.remove("tppng-audio-mode-on");
  }
}

export function toggleAudioMode() {
  isAudioModeActive = !isAudioModeActive;
  // Every caller of this function counts as user intent, which is why profile
  // activation below has to save and restore this flag around its own call.
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

// Must run after setupAudioMode: it depends on the movie player and video
// references resolved there. Deactivation only undoes a profile's own
// activation, so a user who turned audio mode on keeps it.
export function applyAudioModeFromProfile(
  layout?: PlayerLayout,
  visuals?: PlayerVisuals,
): void {
  const wantsAudioMode = layout === "no-video";

  if (wantsAudioMode) {
    // "video" has no meaning once the video is hidden, so it falls back to black.
    const screenMode: "black" | "visualizer" | "custom" =
      visuals === "visualizer" ? "visualizer"
      : visuals === "custom" ? "custom"
      : "black";

    currentScreenMode = screenMode;

    if (!isAudioModeActive) {
      profileActivatedAudioMode = true;
      // Saved and restored so a profile activation does not masquerade as
      // user intent and stick across later navigations.
      const prevUserWants = userWantsAudioMode;
      toggleAudioMode();
      userWantsAudioMode = prevUserWants;
    } else {
      applyScreenMode();
      updateActiveMode(currentScreenMode, videoPinned);
    }
  } else {
    if (isAudioModeActive && profileActivatedAudioMode) {
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
