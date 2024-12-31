import React from "dom-chef";
import elementReady from "element-ready";
import {
  setupLoopSegment,
  LoopSegmentButton,
  LoopSegmentEndMarker,
  LoopSegmentStartMarker,
  toggleLoopSegment,
  setLoopSegmentStart,
  setLoopSegmentEnd,
} from "../components/LoopSegment";
import { WatchContext } from "../../background/context";
import { Storage } from "../../background/store";

let player: HTMLVideoElement | undefined;
let playbackMenuButton: HTMLElement | undefined;
let preferences: Storage["preferences"]["watch"] | undefined;

const onWatchPage = async (ctx: WatchContext) => {
  const { store } = ctx;
  preferences = store.preferences.watch;
  if (preferences === undefined) return;

  player = await elementReady("video", {
    stopOnDomReady: false,
  });
  if (player === null || player === undefined) return;

  // Reset Player
  player.playbackRate = parseFloat(preferences.defaultPlaybackRate.value);
  const labels = document.querySelectorAll(".ytp-menuitem-label");
  if (labels.length !== 0) {
    for (const label of labels) {
      if (label.textContent === "Playback speed") {
        const playbackMenuButton = label.parentNode as HTMLElement;
        playbackMenuButton.children[2].textContent =
          player.playbackRate === 1
            ? "Normal"
            : `${Number(player.playbackRate.toFixed(2))}`;
        break;
      }
    }
  }

  // Keyboard Shortcuts
  document.removeEventListener("keydown", useShortcuts);
  document.addEventListener("keydown", useShortcuts);

  // Loop Segment
  const rightControls = await elementReady("div.ytp-right-controls");
  if (rightControls) {
    rightControls.prepend(LoopSegmentButton);
  }
  const progressBar = await elementReady("div.ytp-progress-bar-container");
  if (progressBar) {
    await setupLoopSegment();
    progressBar.append(LoopSegmentStartMarker, LoopSegmentEndMarker);
  }

  const playerSettingsButton = await elementReady("button.ytp-settings-button");
  if (playerSettingsButton === undefined) return;
  playerSettingsButton.removeEventListener("click", onSettingsMenu);
  playerSettingsButton.addEventListener("click", onSettingsMenu);
};

const onSettingsMenu = async (): Promise<void> => {
  if (player === null || player === undefined) return;

  const menuItemLabels = await elementReady(".ytp-menuitem-label");
  if (menuItemLabels === undefined) return;
  const labels = document.querySelectorAll(".ytp-menuitem-label");
  if (labels.length === 0) return;

  for (const label of labels) {
    if (label.textContent === "Playback speed") {
      playbackMenuButton = label.parentNode as HTMLElement;
      playbackMenuButton.children[2].textContent =
        player.playbackRate === 1
          ? "Normal"
          : `${Number(player.playbackRate.toFixed(2))}`;

      playbackMenuButton.removeEventListener("click", onPlaybackRateMenu);
      playbackMenuButton.addEventListener("click", onPlaybackRateMenu);
      break;
    }
  }
};

const onPlaybackRateMenu = async (): Promise<void> => {
  if (player === undefined || player === null) return;

  const playbackRatePanel = await elementReady(".ytp-panel-animate-forward");
  if (playbackRatePanel === undefined) return;

  // Disable Native Custom PlaybackRate Slider Option
  const menuPanelOptions = playbackRatePanel.querySelector(
    ".ytp-panel-options",
  ) as HTMLElement | null;
  if (menuPanelOptions) {
    menuPanelOptions.style.display = "none";
  }

  replacePlaybackItems(playbackRatePanel);
};

const replacePlaybackItems = (playbackRatePanel: HTMLElement) => {
  if (player === undefined || player === null) return;
  if (preferences === undefined) return;

  // Replace Native PlaybackRate Items
  const panelMenu = playbackRatePanel.querySelector(".ytp-panel-menu");
  if (panelMenu === null) return;

  const currentRate = player.playbackRate.toFixed(2);
  const isPresetRate = preferences.customPlaybackRates.some(
    (rate) => rate === currentRate,
  );

  const playbackRateItems = preferences.customPlaybackRates.map(
    (playbackRate) => {
      const label = playbackRate === "1.00" ? "Normal" : Number(playbackRate);
      const isAriaChecked = playbackRate === currentRate ? "true" : "false";

      return (
        <div
          key={playbackRate}
          className="tw-ytp-menuitem tw-tppng-playback-item"
          role="menuitemradio"
          aria-checked={isAriaChecked}
          tabIndex={0}
          data-tppng-playback-rate={playbackRate}
          onClick={(_event) => {
            const panelBackButton = document.querySelector(
              ".ytp-panel-back-button",
            ) as HTMLElement | null;
            if (panelBackButton !== null) {
              panelBackButton.click();
            }
            setPlaybackRate(Number(playbackRate));
          }}
        >
          <div className="tw-ytp-menuitem-label">{label}</div>
        </div>
      );
    },
  );

  const customPlaybackRateItem = (
    <div
      className="tw-ytp-menuitem tw-tppng-playback-item"
      id="tppng-playback-custom-item"
      role="menuitemradio"
      aria-checked={isPresetRate ? "false" : "true"}
      tabIndex={0}
      style={{ display: isPresetRate ? "none" : "" }}
      onClick={(_event) => {
        const panelBackButton = document.querySelector(
          ".ytp-panel-back-button",
        ) as HTMLElement | null;
        if (panelBackButton !== null) {
          panelBackButton.click();
        }
        setPlaybackRate(
          Number(player!.getAttribute("data-tppng-playback-rate") ?? "1"),
        );
      }}
    >
      <div className="tw-ytp-menuitem-label">
        Custom (
        {Number(
          player!.getAttribute("data-tppng-playback-rate") ??
            player!.playbackRate,
        )}
        )
      </div>
    </div>
  );

  panelMenu.replaceChildren(customPlaybackRateItem, ...playbackRateItems);
};

const useShortcuts = (event: KeyboardEvent): void => {
  if (!player || !preferences) return;

  const target = event.target as HTMLElement;
  const tagName = target?.tagName;
  const isNotEditable =
    tagName !== "INPUT" &&
    tagName !== "TEXTAREA" &&
    !target.matches("#contenteditable-root.yt-formatted-string");

  if (!isNotEditable) return;

  const key = event.key.toLowerCase();

  switch (key) {
    case preferences.togglePlaybackRate.key.toLowerCase(): {
      setPlaybackRate(
        player.playbackRate !== 1
          ? 1
          : Number(preferences.togglePlaybackRate.value),
      );
      break;
    }
    case preferences.seekBackward.key.toLowerCase(): {
      const value = Number(preferences.seekBackward.value);
      player.currentTime -= value;
      onDoubleTapSeek("back", value);
      break;
    }
    case preferences.seekForward.key.toLowerCase(): {
      const value = Number(preferences.seekForward.value);
      player.currentTime += value;
      onDoubleTapSeek("forward", value);
      break;
    }
    case preferences.increasePlaybackRate.key.toLowerCase(): {
      const value = Number(preferences.increasePlaybackRate.value);
      const increasedPlaybackRate = Number(
        (player.playbackRate + value).toFixed(2),
      );
      if (increasedPlaybackRate <= 16) {
        setPlaybackRate(increasedPlaybackRate);
      }
      break;
    }
    case preferences.decreasePlaybackRate.key.toLowerCase(): {
      const value = Number(preferences.decreasePlaybackRate.value);
      const decreasedPlaybackRate = Number(
        (player.playbackRate - value).toFixed(2),
      );
      if (decreasedPlaybackRate >= 0.0625) {
        setPlaybackRate(decreasedPlaybackRate);
      }
      break;
    }
    case preferences.toggleLoopSegment.key.toLowerCase(): {
      toggleLoopSegment();
      break;
    }
    case preferences.setLoopSegmentBegin.key.toLowerCase(): {
      setLoopSegmentStart();
      break;
    }
    case preferences.setLoopSegmentEnd.key.toLowerCase(): {
      setLoopSegmentEnd();
      break;
    }
    default:
      break;
  }
};

let doubleTapSeekTimeout: ReturnType<typeof setTimeout>;
const onDoubleTapSeek = (dataSide: "back" | "forward", time: number): void => {
  const doubleTapSeekElement = document.querySelector(
    ".ytp-doubletap-ui-legacy",
  ) as HTMLElement | null;
  if (doubleTapSeekElement !== null) {
    doubleTapSeekElement.setAttribute("data-side", dataSide);
    doubleTapSeekElement.style.display = "";
    const doubleTapSeekLabel = doubleTapSeekElement.querySelector(
      ".ytp-doubletap-tooltip-label",
    ) as HTMLElement;
    if (doubleTapSeekLabel !== null) {
      doubleTapSeekLabel.textContent = `${time} seconds`;
    }
    const staticCircle = document.querySelector(
      ".ytp-doubletap-static-circle",
    ) as HTMLElement;
    if (staticCircle !== null && dataSide === "back") {
      staticCircle.style.top = "50%";
      staticCircle.style.left = "10%";
      staticCircle.style.width = "110px";
      staticCircle.style.height = "110px";
      staticCircle.style.transform = "translate(-14px, -40px)";
    } else if (staticCircle !== null && dataSide === "forward") {
      staticCircle.style.top = "50%";
      staticCircle.style.left = "80%";
      staticCircle.style.width = "110px";
      staticCircle.style.height = "110px";
      staticCircle.style.transform = "translate(-28px, -40px)";
    }
    clearTimeout(doubleTapSeekTimeout);
    doubleTapSeekTimeout = setTimeout(() => {
      (doubleTapSeekElement as HTMLElement).setAttribute("data-side", "null");
      (doubleTapSeekElement as HTMLElement).style.display = "none";
      const doubleTapLabel = (
        doubleTapSeekElement as HTMLElement
      ).querySelector(".ytp-doubletap-tooltip-label");
      if (doubleTapLabel !== null) {
        doubleTapLabel.textContent = "5 seconds";
      }
      staticCircle.style.cssText = "null";
    }, 500);
  }
};

const setPlaybackRate = (rate: number): void => {
  if (player === null || player === undefined) return;

  const prevPlaybackRate = player.playbackRate.toFixed(2);
  const prevPlaybackMenuItem =
    document.querySelector(
      `.tppng-playback-item[data-tppng-playback-rate="${prevPlaybackRate}"]`,
    ) || document.querySelector("#tppng-playback-custom-item");
  if (prevPlaybackMenuItem) {
    prevPlaybackMenuItem.ariaChecked = "false";
  }

  player.playbackRate = rate;

  const nextPlaybackRate = player.playbackRate.toFixed(2);
  const nextPlaybackMenuItem: HTMLElement | null =
    document.querySelector(
      `.tppng-playback-item[data-tppng-playback-rate="${nextPlaybackRate}"]`,
    ) || document.querySelector("#tppng-playback-custom-item");
  if (nextPlaybackMenuItem) {
    nextPlaybackMenuItem.ariaChecked = "true";
    if (nextPlaybackMenuItem.id === "tppng-playback-custom-item") {
      player.setAttribute(
        "data-tppng-playback-rate",
        player.playbackRate.toFixed(2),
      );
      nextPlaybackMenuItem.style.display = "";
      const customPlaybackItemLabel = document.querySelector(
        "#tppng-playback-custom-item > .ytp-menuitem-label",
      );
      if (customPlaybackItemLabel) {
        customPlaybackItemLabel.textContent = `Custom (${player.playbackRate})`;
      }
    }
  }

  if (playbackMenuButton !== null && playbackMenuButton !== undefined) {
    playbackMenuButton.children[2].textContent =
      player.playbackRate === 1
        ? "Normal"
        : `${Number(player.playbackRate.toFixed(2))}`;
  }
};

export default onWatchPage;
