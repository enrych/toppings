import React from "dom-chef";
import elementReady from "element-ready";
import {
  initLoopSegment,
  LoopSegmentButton,
  LoopSegmentEndMarker,
  LoopSegmentStartMarker,
  toggleLoopSegment,
} from "./components/LoopSegment";
import type { YouTubeConfig } from "../../webApp.config";
import type { YouTubeWatchContext } from "../../../../../background/parsers/parseYouTubeContext";

let player: HTMLVideoElement | undefined;
let preferences: YouTubeConfig["routes"]["watch"]["preferences"] | undefined;
let keybindings: YouTubeConfig["routes"]["watch"]["keybindings"] | undefined;

const onWatchPage = async (context: YouTubeWatchContext) => {
  const webAppConfig = context.webAppConfig as YouTubeConfig;
  preferences = webAppConfig.routes.watch.preferences;
  keybindings = webAppConfig.routes.watch.keybindings;
  if (preferences === undefined || keybindings === undefined) return;

  player = await elementReady("video", {
    stopOnDomReady: false,
  });
  if (player === null || player === undefined) return;

  // Reset Player
  player.playbackRate = parseFloat(preferences.defaultSpeed);
  const labels = document.querySelectorAll(".ytp-menuitem-label");
  if (labels.length !== 0) {
    for (const label of labels) {
      if (label.textContent === "Playback speed") {
        const playbackRateButton = label.parentNode as HTMLElement;
        playbackRateButton.children[2].textContent =
          player.playbackRate === 1
            ? "Normal"
            : `${Number(player.playbackRate.toFixed(2))}`;
        break;
      }
    }
  }

  // Keyboard Shortcuts
  document.addEventListener("keydown", useShortcuts);

  // Loop Segment
  const rightControls = await elementReady("div.ytp-right-controls");
  if (rightControls) {
    rightControls.prepend(LoopSegmentButton);
  }
  const progressBar = await elementReady("div.ytp-progress-bar-container");
  if (progressBar) {
    await initLoopSegment();
    progressBar.append(LoopSegmentStartMarker, LoopSegmentEndMarker);
  }

  const doubleTapSeekElement = document.querySelector(
    ".ytp-doubletap-ui-legacy",
  );

  const playerSettingsButton = await elementReady("button.ytp-settings-button");
  if (playerSettingsButton === null || playerSettingsButton === undefined)
    return;
  playerSettingsButton.removeEventListener("click", onSettingsMenu);
  playerSettingsButton.addEventListener("click", onSettingsMenu, {
    once: true,
  });
};

const onSettingsMenu = async (): Promise<void> => {
  if (player === null || player === undefined) return;
  const settingsMenuLabels = await elementReady(".ytp-menuitem-label");
  if (settingsMenuLabels === null || settingsMenuLabels === undefined) return;
  const labels = document.querySelectorAll(".ytp-menuitem-label");
  if (labels.length === 0) return;

  for (const label of labels) {
    if (label.textContent === "Playback speed") {
      const playbackMenuButton = label.parentNode as HTMLElement;
      playbackMenuButton.children[2].textContent =
        player.playbackRate === 1
          ? "Normal"
          : `${Number(player.playbackRate.toFixed(2))}`;
      playbackMenuButton.addEventListener("click", onPlaybackSpeedMenu);
      break;
    }
  }
};

const onPlaybackSpeedMenu = async (): Promise<void> => {
  if (player === undefined || player === null) return;
  if (preferences === undefined || keybindings === undefined) return;

  const playbackRatePanel = await elementReady(".ytp-panel-animate-forward");
  if (playbackRatePanel === undefined) return;

  // Disable Native Custom PlaybackRate Slider Option
  const menuPanelOptions = playbackRatePanel.querySelector(
    ".ytp-panel-options",
  ) as HTMLElement | null;
  if (menuPanelOptions) {
    menuPanelOptions.style.display = "none";
  }

  // Replace Native PlaybackRate Items
  const panelMenu = playbackRatePanel.querySelector(".ytp-panel-menu");
  if (panelMenu === null) return;
  // TODO: Instead of sorting list each time, just sort it while saving in options
  let isCustomPlayback: "true" | "false" = "true";
  const playbackRateItems = preferences.customSpeedList.map((playbackRate) => {
    const label = playbackRate === "1.00" ? "Normal" : Number(playbackRate);
    const isAriaChecked =
      playbackRate === player!.playbackRate.toFixed(2) ? "true" : "false";
    if (isAriaChecked === "true") {
      isCustomPlayback = "false";
    }
    return (
      <div
        key={playbackRate}
        className="ytp-menuitem tppng-playback-item"
        role="menuitemradio"
        aria-checked={isAriaChecked}
        tabIndex={0}
        onClick={(_event) => {
          setPlaybackRate(Number(playbackRate));
          const panelBackButton = document.querySelector(
            ".ytp-panel-back-button",
          ) as HTMLElement | null;
          if (panelBackButton === null) return;
          panelBackButton.click();
        }}
      >
        <div className="ytp-menuitem-label">{label}</div>
      </div>
    );
  });

  const customPlaybackRateItem = (
    <div
      className={`ytp-menuitem tppng-playback-item ${isCustomPlayback === "true" ? "" : "hidden"}`}
      id="tppng-playback-custom-item"
      role="menuitemradio"
      aria-checked={isCustomPlayback}
      tabIndex={0}
      data-playback-rate={player.playbackRate}
      onClick={(event) => {
        setPlaybackRate(
          Number(event.currentTarget.getAttribute("data-playback-rate") ?? "1"),
        );
        const panelBackButton = document.querySelector(
          ".ytp-panel-back-button",
        ) as HTMLElement | null;
        if (panelBackButton === null) return;
        panelBackButton.click();
      }}
    >
      <div className="ytp-menuitem-label">Custom ({player.playbackRate})</div>
    </div>
  );
  panelMenu.replaceChildren(customPlaybackRateItem, ...playbackRateItems);
};

const useShortcuts = (event: KeyboardEvent): void => {
  if (player === null || player === undefined) return;
  if (preferences === undefined || keybindings === undefined) return;
  if (
    event.target !== null &&
    (event.target as HTMLElement).tagName !== "INPUT" &&
    (event.target as HTMLElement).tagName !== "TEXTAREA" &&
    !(event.target as HTMLElement).matches(
      "#contenteditable-root.yt-formatted-string",
    )
  ) {
    if (event.key === `${keybindings.toggleSpeedShortcut.toLowerCase()}`) {
      if (player.playbackRate !== 1) {
        setPlaybackRate(1);
      } else {
        setPlaybackRate(Number(preferences.toggleSpeed));
      }
    } else if (
      event.key === `${keybindings.seekBackwardShortcut.toLowerCase()}`
    ) {
      player.currentTime -= +preferences.seekBackward;
      onDoubleTapSeek("back", +preferences.seekBackward);
    } else if (
      event.key === `${keybindings.seekForwardShortcut.toLowerCase()}`
    ) {
      player.currentTime += +preferences.seekForward;
      onDoubleTapSeek("forward", +preferences.seekForward);
    } else if (
      event.key === `${keybindings.increaseSpeedShortcut.toLowerCase()}`
    ) {
      const increasedSpeed = Number(
        (
          Number(player.playbackRate.toFixed(2)) +
          Number((+preferences.increaseSpeed).toFixed(2))
        ).toFixed(2),
      );
      if (increasedSpeed > 16) {
        return;
      }
      setPlaybackRate(increasedSpeed);
    } else if (
      event.key === `${keybindings.decreaseSpeedShortcut.toLowerCase()}`
    ) {
      const decreasedSpeed = Number(
        (
          Number((+player.playbackRate).toFixed(2)) -
          Number((+preferences.decreaseSpeed).toFixed(2))
        ).toFixed(2),
      );
      if (decreasedSpeed < 0.0625) {
        return;
      }
      setPlaybackRate(decreasedSpeed);
    } else if (
      event.key === `${keybindings.toggleLoopSegmentShortcut.toLowerCase()}`
    ) {
      toggleLoopSegment();
    }
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
  player.playbackRate = rate;
};

export default onWatchPage;
