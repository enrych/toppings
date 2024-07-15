import { YouTubeShortsContext } from "../../../../../background/webAppContextParsers/parseYouTubeContext";
import loadElement from "../../../../lib/loadElement";
import { YouTubeWorkerConfig } from "../../config";
import AutoScrollButton from "./components/AutoScrollButton";
import ToggleShortsSpeedButton, {
  togglePlaybackRate,
} from "./components/TogglePlaybackRateButton";

let togglePlaybackRateKeybinding: string;
let isAutoScrollEnabled: boolean;

const runShortsWorker = async (
  context: YouTubeShortsContext,
): Promise<void> => {
  const { keybindings, preferences } = (
    context.workerConfig as YouTubeWorkerConfig
  ).routes.shorts;
  togglePlaybackRateKeybinding = keybindings.toggleSpeedShortcut;
  isAutoScrollEnabled = preferences.reelAutoScroll;

  const reel = (await loadElement("video", 10000, 1000)) as HTMLVideoElement;
  if (reel !== null) {
    document.body.removeEventListener("keydown", addShortsKeybindings);
    document.body.addEventListener("keydown", addShortsKeybindings);
    reel.loop = false;
    reel.removeEventListener("ended", autoScrollHandler);
    reel.addEventListener("ended", autoScrollHandler);

    const actions = reel
      .closest("ytd-reel-video-renderer")
      ?.querySelector("#actions");

    const isAutoScrollButton = actions?.querySelector(
      "#toppings-shorts-auto-scroll-btn",
    );
    if (!isAutoScrollButton) {
      actions?.prepend(AutoScrollButton);
      if (!isAutoScrollEnabled) {
        AutoScrollButton.classList.add("bg-white/10");
        AutoScrollButton.classList.remove("bg-white/20");
      } else {
        AutoScrollButton.classList.add("bg-white/20");
        AutoScrollButton.classList.remove("bg-white/10");
      }
    }

    const isToggleShortsSpeedButton = actions?.querySelector(
      "#toppings-shorts-toggle-playback-rate-btn",
    );
    if (!isToggleShortsSpeedButton) {
      actions?.prepend(ToggleShortsSpeedButton);
      if (reel.playbackRate === 1) {
        ToggleShortsSpeedButton.classList.add("bg-white/10");
        ToggleShortsSpeedButton.classList.remove("bg-white/20");
      } else {
        ToggleShortsSpeedButton.classList.add("bg-white/20");
        ToggleShortsSpeedButton.classList.remove("bg-white/10");
      }
    }
  }
};

export default runShortsWorker;

function addShortsKeybindings(event: KeyboardEvent) {
  if (
    event.target !== null &&
    (event.target as HTMLElement).tagName !== "INPUT" &&
    (event.target as HTMLElement).tagName !== "TEXTAREA" &&
    !(event.target as HTMLElement).matches(
      "#contenteditable-root.yt-formatted-string",
    )
  ) {
    if (event.key === `${togglePlaybackRateKeybinding.toLowerCase()}`) {
      togglePlaybackRate();
    }
  }
}

export function enableAutoScroll() {
  if (isAutoScrollEnabled) {
    isAutoScrollEnabled = false;
  } else {
    isAutoScrollEnabled = true;
  }
  AutoScrollButton.classList.toggle("bg-white/10");
  AutoScrollButton.classList.toggle("bg-white/20");
}

function autoScrollHandler(event: Event) {
  const reel = event.currentTarget as HTMLVideoElement;
  if (!isAutoScrollEnabled) {
    reel.play();
    setTimeout(() => {
      reel.loop = false;
    }, 1000);
    return;
  }
  const isCommentSectionVisibility = document
    .querySelector("ytd-engagement-panel-section-list-renderer")
    ?.getAttribute("visibility");
  if (isCommentSectionVisibility === "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED") {
    reel.play();
    setTimeout(() => {
      reel.loop = false;
    }, 1000);
    return;
  }
  const nextReelButton = document.querySelector(
    "[aria-label='Next video']",
  ) as HTMLButtonElement;

  nextReelButton.click();
}
