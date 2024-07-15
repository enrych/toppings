import { YouTubeShortsContext } from "../../../../../background/webAppContextParsers/parseYouTubeContext";
import loadElement from "../../../../lib/loadElement";
import ToggleShortsSpeedButton from "./components/ToggleShortsSpeedButton";

const runShortsWorker = async (
  context: YouTubeShortsContext,
): Promise<void> => {
  const { shortID } = context.contextData.payload;
  const reel = (await loadElement("video", 10000, 1000)) as HTMLVideoElement;
  if (reel !== null) {
    reel.addEventListener("pause", () => {
      reelProgressTime = -1;
    });
    reel.addEventListener("play", () => {
      reelProgressTime = -1;
    });
    const nextReelButton = document.querySelector(
      "[aria-label='Next video']",
    ) as HTMLButtonElement;
    let reelProgressTime = 0;

    function playNextReel() {
      if (reel.currentTime < reelProgressTime && reel.currentTime > 0) {
        const isCommentSectionOpen = document
          .querySelector("ytd-engagement-panel-section-list-renderer")
          ?.getAttribute("visibility");
        if (isCommentSectionOpen === "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED") {
          removePlayNextReel();
          return;
        }
        reel.removeEventListener("timeupdate", playNextReel);
        nextReelButton.click();
      }
      reelProgressTime = reel.currentTime;
    }
    function removePlayNextReel() {
      reelProgressTime = -1;
      reel.removeEventListener("timeupdate", playNextReel);
    }

    reel.addEventListener("timeupdate", playNextReel);
    document.addEventListener("scroll", removePlayNextReel);
    nextReelButton.addEventListener("click", removePlayNextReel);
    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowUp") {
        removePlayNextReel();
      } else if (event.key === "ArrowDown") {
        removePlayNextReel();
      }
    });

    const actionsBar = reel
      .closest("ytd-reel-video-renderer")!
      .querySelector("#actions");

    if (actionsBar) {
      const isToggleShortsSpeedButton = actionsBar.querySelector(
        "#toppings-shorts-speed-button",
      );
      if (!isToggleShortsSpeedButton) {
        actionsBar.prepend(ToggleShortsSpeedButton);
      }
    }
  }
};

export default runShortsWorker;
