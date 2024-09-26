import React from "dom-chef";
import elementReady from "element-ready";
import type { YouTubeShortsContext } from "../../../../background/parsers/parseYouTubeContext";
import type { YouTubeConfig } from "../webApp.config";

let player: HTMLVideoElement | undefined;
let keybindings: YouTubeConfig["routes"]["shorts"]["keybindings"] | undefined;
let preferences: YouTubeConfig["routes"]["shorts"]["preferences"] | undefined;

const onShortsPage = async (context: YouTubeShortsContext): Promise<void> => {
  const webAppConfig = context.webAppConfig as YouTubeConfig;
  keybindings = webAppConfig.routes.shorts.keybindings;
  preferences = webAppConfig.routes.shorts.preferences;
  if (keybindings === undefined || preferences === undefined) return;

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
    if (!preferences.reelAutoScroll) {
      AutoScrollButton.classList.add("bg-white/10");
      AutoScrollButton.classList.remove("bg-white/20");
    } else {
      AutoScrollButton.classList.add("bg-white/20");
      AutoScrollButton.classList.remove("bg-white/10");
    }
  }

  // Toggle Playback Rate
  const togglePlaybackRateButton = playerActions.querySelector(
    "#tppng-toggle-playback-rate",
  );
  if (!togglePlaybackRateButton) {
    playerActions.prepend(TogglePlaybackRateButton);
    if (player.playbackRate === 1) {
      TogglePlaybackRateButton.classList.add("bg-white/10");
      TogglePlaybackRateButton.classList.remove("bg-white/20");
    } else {
      TogglePlaybackRateButton.classList.add("bg-white/20");
      TogglePlaybackRateButton.classList.remove("bg-white/10");
    }
  }
};

function useShortcuts(event: KeyboardEvent) {
  if (player === null || player === undefined) return;
  if (keybindings === undefined) return;
  if (
    event.target !== null &&
    (event.target as HTMLElement).tagName !== "INPUT" &&
    (event.target as HTMLElement).tagName !== "TEXTAREA" &&
    !(event.target as HTMLElement).matches(
      "#contenteditable-root.yt-formatted-string",
    )
  ) {
    if (event.key === `${keybindings.toggleSpeedShortcut.toLowerCase()}`) {
      togglePlaybackRate();
    }
  }
}

let setupTimeoutId: ReturnType<typeof setTimeout>;
function setupAutoScroll() {
  if (player === null || player === undefined) return;
  if (!preferences?.reelAutoScroll) return;
  clearTimeout(setupTimeoutId);
  setupTimeoutId = setTimeout(() => {
    player?.removeAttribute("loop");
  }, 400);
}

function scrollToNextReel() {
  if (player === null || player === undefined) return;
  if (preferences === undefined) return;
  if (!preferences.reelAutoScroll) {
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
    className="mt-[16px] yt-spec-button-shape-next yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button outline-none border-none font-medium text-white"
    onClick={enableAutoScroll}
  >
    Auto
  </button>
);

const TogglePlaybackRateButton = (
  <button
    id="#tppng-toggle-playback-rate"
    className="yt-spec-button-shape-next yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button outline-none border-none font-medium text-white"
    onClick={togglePlaybackRate}
  >
    2x
  </button>
);

function togglePlaybackRate() {
  if (player === null || player === undefined) return;
  player.playbackRate = player.playbackRate === 1 ? 2 : 1;
  TogglePlaybackRateButton.classList.toggle("bg-white/10");
  TogglePlaybackRateButton.classList.toggle("bg-white/20");
}

function enableAutoScroll() {
  if (preferences === undefined) return;
  preferences.reelAutoScroll = !preferences.reelAutoScroll;
  AutoScrollButton.classList.toggle("bg-white/10");
  AutoScrollButton.classList.toggle("bg-white/20");
}

export default onShortsPage;
