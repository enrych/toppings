import React from "dom-chef";

const ToggleShortsSpeedButton = (
  <div
    id="#toppings-shorts-speed-button"
    className="yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button"
  >
    <button
      onClick={() => {
        const shortsVideo = document.querySelector("video")!;
        if (shortsVideo.playbackRate === 1) {
          shortsVideo.playbackRate = 2;
        } else {
          shortsVideo.playbackRate = 1;
        }
      }}
    >
      2x
    </button>
  </div>
);

export default ToggleShortsSpeedButton;
