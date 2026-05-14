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
import {
  ARIA_PRESSED,
  CHROME_STORAGE_LOCAL_KEY,
  EXTENSION_AUDIO_MODE_DOM,
  YOUTUBE_PAGE_DOM,
} from "toppings-constants";
import { Storage } from "../../../background/store";

let isAudioModeActive = false;
let currentScreenMode: "black" | "visualizer" | "custom" = "black";
let currentCustomImageUrl = "";
let currentVideo: HTMLVideoElement | null = null;
let currentPrefs: AudioModePrefs | null = null;
let currentVideoId = "";
let adObserver: MutationObserver | null = null;
let pausedForAd = false;
let videoPinned = false;
// Persists across SPA navigations within the same tab. If the user toggled
// audio mode on, we keep it on as they move between videos until they
// explicitly toggle it off.
let userWantsAudioMode = false;

type AudioModePrefs = Storage["preferences"]["watch"]["audioMode"];

type PerVideoPin = {
  enabled: boolean;
  screenMode: "black" | "visualizer" | "custom";
  imageUrl?: string;
};

const GLOBAL_CUSTOM_IMAGE_KEY =
  CHROME_STORAGE_LOCAL_KEY.AUDIO_MODE_GLOBAL_CUSTOM_IMAGE;

function pinStorageKey(videoId: string): string {
  return `${CHROME_STORAGE_LOCAL_KEY.AUDIO_MODE_PIN_KEY_PREFIX}${videoId}`;
}

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

function loadPerVideoPin(videoId: string): Promise<PerVideoPin | null> {
  return new Promise((resolve) => {
    const key = pinStorageKey(videoId);
    chrome.storage.local.get(key, (result) => {
      resolve((result[key] as PerVideoPin) ?? null);
    });
  });
}

function savePerVideoPin(videoId: string, pin: PerVideoPin) {
  chrome.storage.local.set({ [pinStorageKey(videoId)]: pin });
}

function removePerVideoPin(videoId: string) {
  chrome.storage.local.remove(pinStorageKey(videoId));
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
  currentScreenMode = prefs.screenMode;
  currentCustomImageUrl = prefs.customBackground.globalImageUrl;
  videoPinned = false;
  AudioModeButton.setAttribute("aria-pressed", ARIA_PRESSED.FALSE);
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

  if (!moviePlayer.querySelector(`#${EXTENSION_AUDIO_MODE_DOM.OVERLAY_ELEMENT_ID}`)) {
    moviePlayer.appendChild(AudioModeOverlay);
  }

  if (!moviePlayer.querySelector(`#${EXTENSION_AUDIO_MODE_DOM.UI_CONTAINER_ELEMENT_ID}`)) {
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
    const pin = await loadPerVideoPin(videoId);
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
    const isAdPlaying = moviePlayer.classList.contains(
      YOUTUBE_PAGE_DOM.AD_SHOWING_CLASS,
    );

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
    savePerVideoPin(currentVideoId, {
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
  savePerVideoPin(currentVideoId, {
    enabled: true,
    screenMode: mode,
    imageUrl: mode === "custom" ? currentCustomImageUrl : undefined,
  });
  updateActiveMode(mode, true);
}

function handleUnpinVideo() {
  if (!currentVideoId) return;
  videoPinned = false;
  removePerVideoPin(currentVideoId);
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
      savePerVideoPin(currentVideoId, {
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
  const moviePlayer = document.getElementById(
    YOUTUBE_PAGE_DOM.MOVIE_PLAYER_ELEMENT_ID,
  );
  if (!moviePlayer) return;
  if (hidden) {
    moviePlayer.classList.add(EXTENSION_AUDIO_MODE_DOM.MOVIE_PLAYER_AUDIO_MODE_CLASS);
  } else {
    moviePlayer.classList.remove(
      EXTENSION_AUDIO_MODE_DOM.MOVIE_PLAYER_AUDIO_MODE_CLASS,
    );
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
    isAudioModeActive ? ARIA_PRESSED.TRUE : ARIA_PRESSED.FALSE,
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

export function teardownAudioMode() {
  isAudioModeActive = false;
  pausedForAd = false;
  videoPinned = false;
  AudioModeButton.setAttribute("aria-pressed", ARIA_PRESSED.FALSE);
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
