import { render } from "preact";
import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mount } from "@/kernel/dom/mount";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import {
  findSpeedRow,
  ratePanelChips,
  resolveMoviePlayer,
  resolveRatePanel,
  resolveSettingsButton,
  resolveVideo,
  showRateInSpeedRow,
  syncRatePanel,
} from "@/youtube/player";
import { playbackKeys } from "./keys";
import { RateChips } from "./RateChips";
import { SeekFlash } from "./SeekFlash";
import { MAX_RATE, MIN_RATE, playbackSettings } from "./settings";

// Four places keep 1/16 steps exact while dropping float drift like 1.1 + 0.1.
const clamp = (rate: number) => Math.min(MAX_RATE, Math.max(MIN_RATE, Number(rate.toFixed(4))));

export const playback: Feature = {
  id: "playback",
  routes: ["watch"],
  async mount() {
    const settings = await playbackSettings.get();
    if (!settings.enabled) return;

    const player = await resolveVideo();
    void setCapabilityStatus("watch.player", "watch", player);
    if (!player.resolved) return;
    const video = player.element as HTMLVideoElement;

    const setRate = (rate: number) => {
      video.playbackRate = clamp(rate);
    };
    setRate(settings.defaultRate);

    const flash = await mountSeekFlash();
    const seek = (side: "back" | "forward", seconds: number) => {
      video.currentTime += side === "back" ? -seconds : seconds;
      flash?.show(side, seconds);
    };

    const unbindKeys = bindKeys(playbackKeys, {
      toggleRate: () => setRate(video.playbackRate === 1 ? settings.toggleRate : 1),
      increaseRate: () => setRate(video.playbackRate + settings.rateStep),
      decreaseRate: () => setRate(video.playbackRate - settings.rateStep),
      seekBackward: () => seek("back", settings.seekBackward),
      seekForward: () => seek("forward", settings.seekForward),
    });

    const unhookMenu = await hookSettingsMenu(settings.customRates, video, setRate);

    return () => {
      unbindKeys();
      unhookMenu?.();
      flash?.unmount();
    };
  },
};

async function mountSeekFlash() {
  const host = await resolveMoviePlayer();
  void setCapabilityStatus("watch.moviePlayer", "watch", host);
  if (!host.resolved) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const ui = mount("tppng-seek-flash", host.element, <SeekFlash side="forward" seconds={0} visible={false} />);
  return {
    show(side: "back" | "forward", seconds: number) {
      ui.update(<SeekFlash side={side} seconds={seconds} visible />);
      clearTimeout(timer);
      timer = setTimeout(() => ui.update(<SeekFlash side={side} seconds={seconds} visible={false} />), 600);
    },
    unmount() {
      clearTimeout(timer);
      ui.unmount();
    },
  };
}

// YouTube builds the settings menu lazily on first open and the speed panel
// on each entry, so both are hooked by click rather than resolved up front.
// It only redraws them from its own state, which a rate set straight on the
// <video> never reaches, so they follow the video's ratechange instead.
async function hookSettingsMenu(rates: number[], video: HTMLVideoElement, setRate: (rate: number) => void) {
  const button = await resolveSettingsButton();
  void setCapabilityStatus("watch.settingsButton", "watch", button);
  if (!button.resolved) return;

  let redrawPanel: (() => void) | null = null;
  const onSpeedRow = async () => {
    const panel = await resolveRatePanel();
    void setCapabilityStatus("watch.ratePanel", "watch", panel);
    if (!panel.resolved) return;
    const chips = rates.length ? ratePanelChips(panel.element) : null;
    const draw = () => {
      if (!panel.element.isConnected) return void (redrawPanel = null);
      syncRatePanel(panel.element, video.playbackRate);
      if (chips) render(<RateChips rates={rates} current={video.playbackRate} onPick={setRate} />, chips);
    };
    if (chips) {
      chips.replaceChildren();
      chips.style.flexWrap = "wrap";
    }
    redrawPanel = draw;
    draw();
  };

  // Kept rather than looked up: while a submenu is open YouTube takes the main
  // list out of the page, and the row must still be current when it returns.
  let speedRow: Element | null = null;
  const onRateChange = () => {
    const row = speedRow ?? findSpeedRow(video).element;
    if (row) showRateInSpeedRow(row, video.playbackRate);
    redrawPanel?.();
  };
  video.addEventListener("ratechange", onRateChange);

  let speedRowReported = false;
  let pending: ReturnType<typeof setTimeout> | undefined;
  const onSettings = () => {
    clearTimeout(pending);
    // The row exists only once the menu has rendered, which happens on this same
    // click, and the menu can be opened before YouTube has built every row.
    pending = setTimeout(() => {
      const found = findSpeedRow(video);
      if (!speedRowReported) {
        void setCapabilityStatus("watch.speedRow", "watch", found);
        speedRowReported = found.resolved;
      }
      if (!found.resolved) return;
      const row = found.element;
      showRateInSpeedRow(row, video.playbackRate);
      if (row !== speedRow) {
        speedRow?.removeEventListener("click", onSpeedRow);
        row.addEventListener("click", onSpeedRow);
        speedRow = row;
      }
    }, 0);
  };
  button.element.addEventListener("click", onSettings);

  return () => {
    clearTimeout(pending);
    video.removeEventListener("ratechange", onRateChange);
    button.element.removeEventListener("click", onSettings);
    speedRow?.removeEventListener("click", onSpeedRow);
  };
}
