import React from "dom-chef";
import elementReady from "element-ready";
import {
  PlaylistContext,
  ValidPlaylistPayload,
} from "../../background/context";

const onPlaylistPage = async (ctx: PlaylistContext): Promise<void> => {
  const { playlistId } = ctx.payload;
  const metadataActionBar = await elementReady("div.metadata-action-bar");
  if (metadataActionBar === null || metadataActionBar === undefined) return;

  let runtimeSection = document.querySelector("div#tppng-ytp-runtime-section");
  if (runtimeSection === null) {
    if (playlistId === "WL" || playlistId === "LL") return;
    const { averageRuntime, totalRuntime } =
      ctx.payload as ValidPlaylistPayload;

    runtimeSection = (
      <div
        className="metadata-text-wrapper style-scope ytd-playlist-header-renderer tw-box-border tw-h-fit tw-rounded-[8px] tw-bg-[rgba(101,101,101,0.4)] tw-backdrop-saturate-[180%] tw-backdrop-blur-[10px] tw-px-[15px] tw-py-[12px] tw-shadow-[0_4px_30px_rgba(0,0,0,0.1)] tw-transition-all tw-duration-300 tw-ease-in-out hover:tw-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
        id="tppng-ytp-runtime-section"
      >
        <div className="mb-[6px] w-full flex items-center">
          <img
            src={chrome.runtime.getURL("assets/icons/logo/icon128.png")}
            className="mx-[6px] w-[24px]"
            alt="Toppings Icon"
          />
          <h2 className="mx-[6px] text-[1.6rem] font-extrabold text-white ml-[10px]">
            Toppings
          </h2>
        </div>
        <div className="flex flex-col justify-evenly items-start pl-[10px] text-[12px] text-[#b9b8b8]">
          <div>
            <span>Average Runtime: </span>
            <span id="tppng-ytp-average-runtime">
              {formatRuntime(averageRuntime)}
            </span>
          </div>
          <div>
            <span>Total Runtime: </span>
            <span id="tppng-ytp-total-runtime">
              {formatRuntime(totalRuntime)}
            </span>
          </div>
        </div>
      </div>
    );

    if (metadataActionBar.lastChild === null) return;
    metadataActionBar.insertBefore(
      runtimeSection,
      metadataActionBar.lastChild.previousSibling,
    );
  } else {
    if (playlistId === "WL" || playlistId === "LL") {
      runtimeSection.remove();
      return;
    } else {
      const { averageRuntime, totalRuntime } =
        ctx.payload as ValidPlaylistPayload;
      const averageRuntimeElement = document.getElementById(
        "tppng-ytp-average-runtime",
      );
      const totalRuntimeElement = document.getElementById(
        "tppng-ytp-total-runtime",
      );

      if (averageRuntimeElement && totalRuntimeElement) {
        averageRuntimeElement.textContent = formatRuntime(averageRuntime);
        totalRuntimeElement.textContent = formatRuntime(totalRuntime);
      }
    }
  }
};

/**
 * Formats the runtime seconds into a human-readable string.
 *
 * @param {number} seconds - The seconds in the runtime.
 * @returns {string} - A formatted string representing the runtime.
 */
function formatRuntime(seconds: number): string {
  const days = Math.floor(seconds / 86400); // 1 day = 24 hours * 60 minutes * 60 seconds
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  }

  if (remainingSeconds > 0) {
    parts.push(
      `${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`,
    );
  }

  if (parts.length === 0) {
    parts.push("0 seconds");
  }

  return parts.join(", ");
}

export default onPlaylistPage;
