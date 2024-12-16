import React from "dom-chef";
import elementReady from "element-ready";
import type { Storage } from "../../background/store";
import type { ShortsContext } from "../../background/context";

let player: HTMLVideoElement | undefined;
let preferences: Storage["preferences"]["shorts"] | undefined;

const onShortsPage = async (ctx: ShortsContext) => {
  const { store } = ctx;
  preferences = store.preferences.shorts;
  if (preferences === undefined) return;

  player = await elementReady("ytd-reel-video-renderer[is-active] video", {
    stopOnDomReady: false,
  });
  if (player === undefined) return;

  const playerActions = player
    .closest("ytd-reel-video-renderer[is-active]")
    ?.querySelector("#actions");
  if (!playerActions) return;

  // Keyboard Shortcuts
  document.body.removeEventListener("keydown", useShortcuts);
  document.body.addEventListener("keydown", useShortcuts);

  // Auto Scroll
  setupAutoScroll();
  player.removeEventListener("playing", setupAutoScroll);
  player.addEventListener("playing", setupAutoScroll);
  player.removeEventListener("ended", scrollToNextReel);
  player.addEventListener("ended", scrollToNextReel);

  const autoScrollButton = playerActions.querySelector("#tppng-auto-scroll");
  if (!autoScrollButton) {
    playerActions.prepend(AutoScrollButton);
    if (!preferences.reelAutoScroll.value) {
      AutoScrollButton.classList.add("tw-bg-white/10");
      AutoScrollButton.classList.remove("tw-bg-white/20");
    } else {
      AutoScrollButton.classList.add("tw-bg-white/20");
      AutoScrollButton.classList.remove("tw-bg-white/10");
    }
  }

  // Toggle Playback Rate
  const togglePlaybackRateButton = playerActions.querySelector(
    "#tppng-toggle-playback-rate",
  );
  if (!togglePlaybackRateButton) {
    playerActions.prepend(TogglePlaybackRateButton);
    if (player.playbackRate === 1) {
      TogglePlaybackRateButton.classList.add("tw-bg-white/10");
      TogglePlaybackRateButton.classList.remove("tw-bg-white/20");
    } else {
      TogglePlaybackRateButton.classList.add("tw-bg-white/20");
      TogglePlaybackRateButton.classList.remove("tw-bg-white/10");
    }
  }
};

function useShortcuts(event: KeyboardEvent) {
  if (player === null || player === undefined) return;
  if (preferences === undefined) return;
  if (
    event.target !== null &&
    (event.target as HTMLElement).tagName !== "INPUT" &&
    (event.target as HTMLElement).tagName !== "TEXTAREA" &&
    !(event.target as HTMLElement).matches(
      "#contenteditable-root.yt-formatted-string",
    )
  ) {
    if (event.key === `${preferences.togglePlaybackRate.key.toLowerCase()}`) {
      togglePlaybackRate();
    }
  }
}

let setupTimeoutId: ReturnType<typeof setTimeout>;
function setupAutoScroll() {
  if (player === null || player === undefined) return;
  if (!preferences?.reelAutoScroll.value) return;
  clearTimeout(setupTimeoutId);
  setupTimeoutId = setTimeout(() => {
    player?.removeAttribute("loop");
  }, 400);
}

function scrollToNextReel() {
  if (player === null || player === undefined) return;
  if (preferences === undefined) return;
  if (!preferences.reelAutoScroll.value) {
    player.play();
    return;
  }

  const isCommentsExpanded = document
    .querySelector("ytd-engagement-panel-section-list-renderer")
    ?.getAttribute("visibility");
  if (isCommentsExpanded === "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED") {
    player.play();
    return;
  }
  const nextReelButton = document.querySelector(
    "[aria-label='Next video']",
  ) as HTMLButtonElement;

  nextReelButton.click();
}

const AutoScrollButton = (
  <button
    id="#tppng-auto-scroll"
    className="tw-mt-[16px] yt-spec-button-shape-next yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button tw-outline-none tw-border-none tw-font-medium tw-text-white"
    onClick={enableAutoScroll}
  >
    Auto
  </button>
);

const TogglePlaybackRateButton = (
  <button
    id="#tppng-toggle-playback-rate"
    className="yt-spec-button-shape-next yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button tw-outline-none tw-border-none tw-font-medium tw-text-white"
    onClick={togglePlaybackRate}
  >
    2x
  </button>
);

function togglePlaybackRate() {
  if (player === null || player === undefined) return;
  player.playbackRate = player.playbackRate === 1 ? 2 : 1;
  TogglePlaybackRateButton.classList.toggle("tw-bg-white/10");
  TogglePlaybackRateButton.classList.toggle("tw-bg-white/20");
}

function enableAutoScroll() {
  if (preferences === undefined) return;
  preferences.reelAutoScroll.value = !preferences.reelAutoScroll.value;
  AutoScrollButton.classList.toggle("tw-bg-white/10");
  AutoScrollButton.classList.toggle("tw-bg-white/20");
}

export default onShortsPage;
