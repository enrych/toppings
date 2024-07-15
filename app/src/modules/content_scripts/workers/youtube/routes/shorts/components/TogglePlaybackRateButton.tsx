import React from "dom-chef";

export function togglePlaybackRate() {
  const reel = document.querySelector("video")!;
  if (reel.playbackRate === 1) {
    reel.playbackRate = 2;
  } else {
    reel.playbackRate = 1;
  }
  TogglePlaybackRateButton.classList.toggle("bg-white/10");
  TogglePlaybackRateButton.classList.toggle("bg-white/20");
}

const TogglePlaybackRateButton = (
  <button
    id="toppings-shorts-toggle-playback-rate-btn"
    className="yt-spec-button-shape-next yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button outline-none border-none font-medium text-white"
    onClick={togglePlaybackRate}
  >
    2x
  </button>
);

export default TogglePlaybackRateButton;
