import { AudioModeButton } from "./AudioModeButton";
import { AudioModeOverlay } from "./AudioModeOverlay";
import {
  AudioModeCanvas,
  startVisualizer,
  stopVisualizer,
} from "./AudioModeVisualizer";
import {
  AudioModeUIContainer,
  initAudioModeUI,
  setModeActions,
  updateActiveMode,
  showAudioModeUI,
  hideAudioModeUI,
} from "./AudioModeUI";
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

type AudioModePrefs = Storage["preferences"]["watch"]["audioMode"];

type PerVideoPin = {
  enabled: boolean;
  screenMode: "black" | "visualizer" | "custom";
  imageUrl?: string;
};

const GLOBAL_CUSTOM_IMAGE_KEY = "audioMode_globalCustomImage";

function pinStorageKey(videoId: string): string {
  return `audioMode_pin_${videoId}`;
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
  isAudioModeActive = false;
  currentPrefs = prefs;
  currentVideoId = videoId;
  currentScreenMode = prefs.screenMode;
  currentCustomImageUrl = prefs.customBackground.globalImageUrl;
  videoPinned = false;
  AudioModeButton.setAttribute("aria-pressed", "false");
  AudioModeOverlay.classList.add("tw-hidden");
  hideAudioModeUI();
  stopVisualizer();

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

  if (videoId) {
    const pin = await loadPerVideoPin(videoId);
    if (pin?.enabled) {
      currentScreenMode = pin.screenMode;
      if (pin.imageUrl) currentCustomImageUrl = pin.imageUrl;
      videoPinned = true;
      toggleAudioMode();
    }
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
        AudioModeOverlay.style.backgroundImage = `url(${CSS.escape(currentCustomImageUrl)})`;
        AudioModeOverlay.style.backgroundSize = "cover";
        AudioModeOverlay.style.backgroundPosition = "center";
      }
      break;
  }
}

function setYouTubeChromeHidden(hidden: boolean) {
  const moviePlayer = document.getElementById("movie_player");
  if (!moviePlayer) return;
  if (hidden) {
    moviePlayer.classList.add("tppng-audio-mode-on");
  } else {
    moviePlayer.classList.remove("tppng-audio-mode-on");
  }
}

export function toggleAudioMode() {
  isAudioModeActive = !isAudioModeActive;
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
