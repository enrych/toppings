import React from "dom-chef";

type ScreenMode = "black" | "visualizer" | "custom";
type OnModeAction = {
  onModeChange: (mode: ScreenMode) => void;
  onSetDefault: (mode: ScreenMode) => void;
  onPinToVideo: (mode: ScreenMode) => void;
  onUnpinVideo: () => void;
  onExitAudioMode: () => void;
};

let video: HTMLVideoElement | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;
let modeActions: OnModeAction | null = null;
let activeScreenMode: ScreenMode = "black";
let isPinnedForVideo = false;

const PlayIcon = `<svg viewBox="0 0 24 24" fill="white" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>`;
const PauseIcon = `<svg viewBox="0 0 24 24" fill="white" width="32" height="32"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

const playPauseBtn = (
  <button
    className="tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-2 tw-rounded-full hover:tw-bg-white/10 tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-12"
    aria-label="Play/Pause"
  />
) as HTMLButtonElement;
playPauseBtn.innerHTML = PlayIcon;

const progressBarFill = (
  <div className="tw-h-full tw-bg-red-500 tw-rounded-full tw-transition-none" style={{ width: "0%" }} />
);

const progressBar = (
  <div className="tw-flex-1 tw-h-1 tw-bg-white/20 tw-rounded-full tw-cursor-pointer tw-relative tw-group hover:tw-h-[6px] tw-transition-all">
    {progressBarFill}
  </div>
) as HTMLDivElement;

const currentTimeEl = (
  <span className="tw-text-white/70 tw-text-xs tw-font-mono tw-min-w-[40px]">0:00</span>
);

const durationEl = (
  <span className="tw-text-white/70 tw-text-xs tw-font-mono tw-min-w-[40px] tw-text-right">0:00</span>
);

const volumeSlider = (
  <input
    type="range"
    min="0"
    max="1"
    step="0.05"
    className="tw-w-20 tw-h-1 tw-accent-white tw-cursor-pointer"
    aria-label="Volume"
  />
) as HTMLInputElement;

const VolumeIcon = `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;

const volumeBtn = (
  <button
    className="tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-1 tw-rounded hover:tw-bg-white/10 tw-flex tw-items-center tw-justify-center"
    aria-label="Mute"
  />
) as HTMLButtonElement;
volumeBtn.innerHTML = VolumeIcon;

const CloseIcon = `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

const closeBtn = (
  <button
    className="tw-absolute tw-top-4 tw-right-4 tw-bg-black/40 tw-border tw-border-white/20 tw-cursor-pointer tw-p-2 tw-rounded-full hover:tw-bg-white/20 tw-flex tw-items-center tw-justify-center tw-w-9 tw-h-9 tw-z-10"
    aria-label="Exit Audio Mode"
    title="Exit Audio Mode"
    onClick={() => {
      if (modeActions) modeActions.onExitAudioMode();
    }}
  />
) as HTMLButtonElement;
closeBtn.innerHTML = CloseIcon;

const titleEl = (
  <div className="tw-text-white tw-text-xl tw-font-semibold tw-text-center tw-max-w-[80%] tw-truncate" />
);

const channelEl = (
  <div className="tw-text-white/60 tw-text-sm tw-text-center tw-mt-1" />
);

// --- Mode switcher (in-player) ---

const modeButtons: { mode: ScreenMode; label: string; el: HTMLButtonElement }[] = [
  { mode: "black", label: "Black", el: null as any },
  { mode: "visualizer", label: "Visualizer", el: null as any },
  { mode: "custom", label: "Custom", el: null as any },
];

for (const item of modeButtons) {
  item.el = (
    <button
      className="tw-px-3 tw-py-1.5 tw-text-[12px] tw-rounded-full tw-border tw-border-white/20 tw-bg-transparent tw-text-white/70 tw-cursor-pointer hover:tw-bg-white/10 tw-transition-colors"
      data-tppng-mode-btn={item.mode}
      onClick={() => {
        if (modeActions) modeActions.onModeChange(item.mode);
      }}
    >
      {item.label}
    </button>
  ) as HTMLButtonElement;
}

const setDefaultBtn = (
  <button
    className="tw-px-3 tw-py-1.5 tw-text-[11px] tw-rounded-full tw-border tw-border-white/10 tw-bg-transparent tw-text-white/40 tw-cursor-pointer hover:tw-bg-white/10 hover:tw-text-white/70 tw-transition-colors"
    onClick={() => {
      if (modeActions) modeActions.onSetDefault(activeScreenMode);
      updateSetDefaultBtn(true);
    }}
  >
    Set as Default
  </button>
) as HTMLButtonElement;

const pinBtn = (
  <button
    className="tw-px-3 tw-py-1.5 tw-text-[11px] tw-rounded-full tw-border tw-border-white/10 tw-bg-transparent tw-text-white/40 tw-cursor-pointer hover:tw-bg-white/10 hover:tw-text-white/70 tw-transition-colors"
    onClick={() => {
      if (!modeActions) return;
      if (isPinnedForVideo) {
        modeActions.onUnpinVideo();
        isPinnedForVideo = false;
      } else {
        modeActions.onPinToVideo(activeScreenMode);
        isPinnedForVideo = true;
      }
      updatePinBtn();
    }}
  >
    Pin to Video
  </button>
) as HTMLButtonElement;

const modeSwitcher = (
  <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap tw-justify-center">
    {modeButtons.map((b) => b.el)}
    <div className="tw-w-px tw-h-4 tw-bg-white/10" />
    {setDefaultBtn}
    {pinBtn}
  </div>
);

export const AudioModeUIContainer = (
  <div
    id="tppng-audio-mode-ui"
    className="tw-absolute tw-inset-0 tw-z-[9001] tw-hidden tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-transparent"
    style={{ pointerEvents: "auto" }}
  >
    {closeBtn}
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-flex-1 tw-gap-2">
      {titleEl}
      {channelEl}
    </div>
    <div className="tw-w-full tw-px-8 tw-pb-6 tw-flex tw-flex-col tw-gap-3">
      <div className="tw-flex tw-items-center tw-justify-center tw-mb-2">
        {modeSwitcher}
      </div>
      <div className="tw-flex tw-items-center tw-gap-3">
        {currentTimeEl}
        {progressBar}
        {durationEl}
      </div>
      <div className="tw-flex tw-items-center tw-justify-center tw-gap-4">
        {playPauseBtn}
        <div className="tw-flex tw-items-center tw-gap-2">
          {volumeBtn}
          {volumeSlider}
        </div>
      </div>
    </div>
  </div>
) as HTMLDivElement;

export function initAudioModeUI(videoElement: HTMLVideoElement) {
  video = videoElement;

  playPauseBtn.onclick = () => {
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  progressBar.onclick = (e: MouseEvent) => {
    if (!video) return;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  volumeSlider.value = String(videoElement.volume);
  volumeSlider.oninput = () => {
    if (!video) return;
    video.volume = parseFloat(volumeSlider.value);
    video.muted = false;
  };

  volumeBtn.onclick = () => {
    if (!video) return;
    video.muted = !video.muted;
  };

  video.addEventListener("play", updatePlayPauseIcon);
  video.addEventListener("pause", updatePlayPauseIcon);
  updatePlayPauseIcon();
}

export function setModeActions(actions: OnModeAction) {
  modeActions = actions;
}

export function updateActiveMode(mode: ScreenMode, pinned: boolean) {
  activeScreenMode = mode;
  isPinnedForVideo = pinned;

  for (const btn of modeButtons) {
    if (btn.mode === mode) {
      btn.el.classList.remove("tw-border-white/20", "tw-text-white/70", "tw-bg-transparent");
      btn.el.classList.add("tw-border-white/60", "tw-text-white", "tw-bg-white/10");
    } else {
      btn.el.classList.remove("tw-border-white/60", "tw-text-white", "tw-bg-white/10");
      btn.el.classList.add("tw-border-white/20", "tw-text-white/70", "tw-bg-transparent");
    }
  }

  updatePinBtn();
  updateSetDefaultBtn(false);
}

function updatePinBtn() {
  pinBtn.textContent = isPinnedForVideo ? "Unpin Video" : "Pin to Video";
  if (isPinnedForVideo) {
    pinBtn.classList.remove("tw-text-white/40", "tw-border-white/10");
    pinBtn.classList.add("tw-text-white/70", "tw-border-white/30");
  } else {
    pinBtn.classList.remove("tw-text-white/70", "tw-border-white/30");
    pinBtn.classList.add("tw-text-white/40", "tw-border-white/10");
  }
}

function updateSetDefaultBtn(justSet: boolean) {
  if (justSet) {
    setDefaultBtn.textContent = "Default Set!";
    setTimeout(() => {
      setDefaultBtn.textContent = "Set as Default";
    }, 1500);
  }
}

export function showAudioModeUI() {
  AudioModeUIContainer.classList.remove("tw-hidden");
  updateMetadata();
  startProgressUpdates();
}

export function hideAudioModeUI() {
  AudioModeUIContainer.classList.add("tw-hidden");
  stopProgressUpdates();
}

function updatePlayPauseIcon() {
  if (!video) return;
  playPauseBtn.innerHTML = video.paused ? PlayIcon : PauseIcon;
}

function updateMetadata() {
  const titleElement = document.querySelector(
    "yt-formatted-string.style-scope.ytd-watch-metadata",
  ) as HTMLElement | null;
  const channelElement = document.querySelector(
    "ytd-channel-name yt-formatted-string a",
  ) as HTMLElement | null;

  titleEl.textContent = titleElement?.textContent ?? "Unknown Title";
  channelEl.textContent = channelElement?.textContent ?? "Unknown Channel";
}

function startProgressUpdates() {
  stopProgressUpdates();
  progressInterval = setInterval(() => {
    if (!video || isNaN(video.duration)) return;
    const percent = (video.currentTime / video.duration) * 100;
    (progressBarFill as HTMLElement).style.width = `${percent}%`;
    (currentTimeEl as HTMLElement).textContent = formatTime(video.currentTime);
    (durationEl as HTMLElement).textContent = formatTime(video.duration);
  }, 250);
}

function stopProgressUpdates() {
  if (progressInterval !== null) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
