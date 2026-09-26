/** @jsxImportSource dom-chef-jsx */
import { formatDuration } from "@/lib/duration";
import { resolveTarget } from "@/features/profiles/primitives/resolve";
import { setCapabilityStatus } from "@/features/profiles/capabilityCache";
import {
  InvalidPlaylistPayload,
  PlaylistContext,
  ValidPlaylistPayload,
} from "@/app/background/context";
import { invalidateCachedPlaylist } from "./cache";

// YouTube serves two playlist layouts: the page-header one (class names are
// generated, so only the custom elements are matched) and the older sidebar one.
const HEADER_STRATEGIES = [
  "yt-page-header-renderer yt-content-metadata-view-model",
  "ytd-playlist-header-renderer .metadata-action-bar",
  "ytd-playlist-sidebar-primary-info-renderer #stats",
] as const;

const onPlaylistPage = async (ctx: PlaylistContext): Promise<void> => {
  const { payload } = ctx;

  const resolution = await resolveTarget(HEADER_STRATEGIES);
  void setCapabilityStatus("playlist.runtime", "playlist", resolution);
  if (!resolution.resolved) return;
  const metadataActionBar = resolution.element;

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
              {formatDuration(averageRuntime)}
            </span>
          </div>
          <div>
            <span>Total Runtime: </span>
            <span id="tppng-ytp-total-runtime">
              {formatDuration(totalRuntime)}
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
        formatDuration(averageRuntime);
      totalRuntimeElement.textContent = formatDuration(totalRuntime);
    }
  }
};

export default onPlaylistPage;
