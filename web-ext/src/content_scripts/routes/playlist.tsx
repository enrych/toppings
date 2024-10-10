import React from "dom-chef";
import elementReady from "element-ready";
import {
  PlaylistContext,
  ValidPlaylistPayload,
} from "../../background/context";
import { formatRuntime } from "../../lib/formatRuntime";

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
        className="metadata-text-wrapper style-scope ytd-playlist-header-renderer box-border h-fit rounded-[8px] bg-[rgba(101,101,101,0.4)] backdrop-saturate-[180%] backdrop-blur-[10px] px-[15px] py-[12px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
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

export default onPlaylistPage;
