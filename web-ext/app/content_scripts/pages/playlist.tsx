import { formatDurationSeconds } from "../../../utils/duration";
import React from "dom-chef";
import elementReady from "element-ready";
import {
  InvalidPlaylistPayload,
  PlaylistContext,
  ValidPlaylistPayload,
} from "../../background/context";
import { invalidateCachedPlaylist } from "../../../utils/storage/playlistCache";

const onPlaylistPage = async (ctx: PlaylistContext): Promise<void> => {
  const { payload } = ctx;

  const metadataActionBar = await elementReady(
    "#page-manager ytd-browse > yt-page-header-renderer .yt-page-header-view-model__page-header-content yt-content-metadata-view-model",
  );
  if (!metadataActionBar) return;

  let runtimeSection = document.querySelector("div#tppng-ytp-runtime-section");

  const isValidPayload = (
    p: ValidPlaylistPayload | InvalidPlaylistPayload,
  ): p is ValidPlaylistPayload => "averageRuntime" in p && "totalRuntime" in p;

  if (!runtimeSection) {
    if (!isValidPayload(payload)) return; // skip if invalid or private playlist

    const { averageRuntime, totalRuntime } = payload;

    const playlistIdForRefresh = (payload as ValidPlaylistPayload & { playlistId?: string }).playlistId
      ?? new URL(window.location.href).searchParams.get("list")
      ?? "";

    const handleRefresh = async (btn: HTMLElement) => {
      if (!playlistIdForRefresh) return;
      btn.textContent = "↻";
      btn.setAttribute("disabled", "true");
      await invalidateCachedPlaylist(playlistIdForRefresh);
      // Reload the page so the background re-fetches fresh data.
      window.location.reload();
    };

    const refreshBtn = (
      <button
        id="tppng-ytp-refresh-btn"
        title="Refresh playlist data"
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          color: "#b9b8b8",
          cursor: "pointer",
          fontSize: "16px",
          lineHeight: 1,
          padding: "2px 4px",
          borderRadius: "4px",
        }}
        onClick={function (this: HTMLElement) { void handleRefresh(this); }}
      >
        ↻
      </button>
    ) as HTMLButtonElement;

    runtimeSection = (
      <div
        className="tw-mt-[2px] tw-box-border tw-h-fit tw-rounded-[8px] tw-bg-[rgba(101,101,101,0.4)] tw-backdrop-saturate-[180%] tw-backdrop-blur-[10px] tw-px-[15px] tw-py-[12px] tw-shadow-[0_4px_30px_rgba(0,0,0,0.1)] tw-transition-all tw-duration-300 tw-ease-in-out hover:tw-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
        id="tppng-ytp-runtime-section"
      >
        <div className="tw-mb-[6px] tw-w-full tw-flex tw-items-center">
          <img
            src={chrome.runtime.getURL("assets/icons/icon128.png")}
            className="tw-mx-[6px] tw-w-[24px]"
            alt="Toppings Icon"
          />
          <h2 className="tw-mx-[6px] tw-text-[1.6rem] tw-font-extrabold tw-text-white tw-ml-[10px]">
            Toppings
          </h2>
          {refreshBtn}
        </div>
        <div className="tw-flex tw-flex-col tw-justify-evenly tw-items-start tw-pl-[10px] tw-text-[12px] tw-text-[#b9b8b8]">
          <div>
            <span>Average Runtime: </span>
            <span id="tppng-ytp-average-runtime">
              {formatDurationSeconds(averageRuntime)}
            </span>
          </div>
          <div>
            <span>Total Runtime: </span>
            <span id="tppng-ytp-total-runtime">
              {formatDurationSeconds(totalRuntime)}
            </span>
          </div>
        </div>
      </div>
    );

    metadataActionBar.append(runtimeSection);
  } else {
    if (!isValidPayload(payload)) {
      runtimeSection.remove(); // remove section for private/invalid playlists
      return;
    }

    const { averageRuntime, totalRuntime } = payload;
    const averageRuntimeElement = document.getElementById(
      "tppng-ytp-average-runtime",
    );
    const totalRuntimeElement = document.getElementById(
      "tppng-ytp-total-runtime",
    );

    if (averageRuntimeElement && totalRuntimeElement) {
      averageRuntimeElement.textContent =
        formatDurationSeconds(averageRuntime);
      totalRuntimeElement.textContent = formatDurationSeconds(totalRuntime);
    }
  }
};

export default onPlaylistPage;
