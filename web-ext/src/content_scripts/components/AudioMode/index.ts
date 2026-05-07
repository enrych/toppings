import { AudioModeButton } from "./AudioModeButton";
import { AudioModeOverlay } from "./AudioModeOverlay";
import {
  AudioModeCanvas,
  startVisualizer,
  stopVisualizer,
} from "./AudioModeVisualizer";
import { AudioModePopover, showPopover, hidePopover } from "./AudioModePopover";
import {
  AudioModeUIContainer,
  initAudioModeUI,
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

type AudioModePrefs = Storage["preferences"]["watch"]["audioMode"];

type PerVideoPin = {
  enabled: boolean;
  screenMode: "black" | "visualizer" | "custom";
  imageUrl?: string;
};

function pinStorageKey(videoId: string): string {
  return `audioMode_pin_${videoId}`;
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
  AudioModeButton.setAttribute("aria-pressed", "false");
  AudioModeOverlay.classList.add("tw-hidden");
  hidePopover();
  hideAudioModeUI();
  stopVisualizer();

  if (!prefs.isEnabled) {
    AudioModeButton.style.display = "none";
    return;
  }

  AudioModeButton.style.display = "";
  AudioModeButton.onclick = () => toggleAudioMode();
  AudioModeButton.oncontextmenu = (e: MouseEvent) => {
    e.preventDefault();
    showPopover(currentScreenMode, onScreenModeChange, {
      isPinned: false,
      onTogglePin: () => togglePin(),
    });
  };

  if (!moviePlayer.querySelector("#tppng-audio-mode-overlay")) {
    moviePlayer.appendChild(AudioModeOverlay);
  }

  if (!moviePlayer.querySelector("#tppng-audio-mode-ui")) {
    moviePlayer.appendChild(AudioModeUIContainer);
  }

  if (!moviePlayer.querySelector("#tppng-audio-mode-popover")) {
    AudioModeButton.style.position = "relative";
    AudioModeButton.appendChild(AudioModePopover);
  }

  currentVideo =
    (moviePlayer.querySelector("video") as HTMLVideoElement) ?? null;

  if (currentVideo) {
    initAudioModeUI(currentVideo);
  }

  if (prefs.rememberPerVideo && videoId) {
    const pin = await loadPerVideoPin(videoId);
    if (pin?.enabled) {
      currentScreenMode = pin.screenMode;
      if (pin.imageUrl) currentCustomImageUrl = pin.imageUrl;
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

function togglePin() {
  if (!currentVideoId || !currentPrefs?.rememberPerVideo) return;

  loadPerVideoPin(currentVideoId).then((existing) => {
    if (existing) {
      removePerVideoPin(currentVideoId);
    } else {
      savePerVideoPin(currentVideoId, {
        enabled: isAudioModeActive,
        screenMode: currentScreenMode,
        imageUrl:
          currentScreenMode === "custom" ? currentCustomImageUrl : undefined,
      });
    }
  });
}

function onScreenModeChange(mode: "black" | "visualizer" | "custom") {
  currentScreenMode = mode;

  if (currentPrefs) {
    chrome.storage.sync.get(undefined, (storage) => {
      if (storage?.preferences?.watch?.audioMode) {
        storage.preferences.watch.audioMode.screenMode = mode;
        chrome.storage.sync.set(storage);
      }
    });
  }

  if (
    currentPrefs?.rememberPerVideo &&
    currentVideoId &&
    isAudioModeActive
  ) {
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
    showAudioModeUI();
  } else {
    AudioModeOverlay.classList.remove("tw-opacity-100");
    AudioModeOverlay.classList.add("tw-opacity-0");
    hideAudioModeUI();
    stopVisualizer();
    setTimeout(() => {
      if (!isAudioModeActive) {
        AudioModeOverlay.classList.add("tw-hidden");
        AudioModeOverlay.innerHTML = "";
        AudioModeOverlay.style.backgroundImage = "";
      }
    }, 300);
  }

  if (currentPrefs?.rememberPerVideo && currentVideoId) {
    if (isAudioModeActive) {
      savePerVideoPin(currentVideoId, {
        enabled: true,
        screenMode: currentScreenMode,
        imageUrl:
          currentScreenMode === "custom" ? currentCustomImageUrl : undefined,
      });
    } else {
      removePerVideoPin(currentVideoId);
    }
  }
}

export function teardownAudioMode() {
  isAudioModeActive = false;
  pausedForAd = false;
  AudioModeButton.setAttribute("aria-pressed", "false");
  AudioModeOverlay.classList.add("tw-hidden");
  hideAudioModeUI();
  stopVisualizer();
  hidePopover();
  if (adObserver) {
    adObserver.disconnect();
    adObserver = null;
  }
}

export { AudioModeButton };
