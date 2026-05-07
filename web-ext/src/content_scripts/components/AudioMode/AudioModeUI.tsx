import React from "dom-chef";

let video: HTMLVideoElement | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;

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

const titleEl = (
  <div className="tw-text-white tw-text-xl tw-font-semibold tw-text-center tw-max-w-[80%] tw-truncate" />
);

const channelEl = (
  <div className="tw-text-white/60 tw-text-sm tw-text-center tw-mt-1" />
);

export const AudioModeUIContainer = (
  <div
    id="tppng-audio-mode-ui"
    className="tw-absolute tw-inset-0 tw-z-[61] tw-hidden tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-transparent"
    style={{ pointerEvents: "auto" }}
  >
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-flex-1 tw-gap-2">
      {titleEl}
      {channelEl}
    </div>
    <div className="tw-w-full tw-px-8 tw-pb-6 tw-flex tw-flex-col tw-gap-3">
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
