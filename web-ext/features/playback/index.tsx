import { render } from "preact";
import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mount } from "@/kernel/dom/mount";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import { settingsMenu } from "@/youtube/guide";
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

const clamp = (rate: number) => Math.min(MAX_RATE, Math.max(MIN_RATE, Number(rate.toFixed(2))));

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
      const row = findSpeedRow();
      if (row.resolved) showRateInSpeedRow(row.element, video.playbackRate);
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

    const unhookMenu = settings.customRates.length ? await hookRatePanel(settings.customRates, video, setRate) : undefined;

    return () => {
      unbindKeys();
      unhookMenu?.();
      flash?.unmount();
    };
  },
};

async function mountSeekFlash() {
  const host = await resolveMoviePlayer();
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
async function hookRatePanel(rates: number[], video: HTMLVideoElement, setRate: (rate: number) => void) {
  const button = await resolveSettingsButton();
  void setCapabilityStatus("watch.settingsButton", "watch", button);
  if (!button.resolved) return;

  const onSpeedRow = async () => {
    const panel = await resolveRatePanel();
    void setCapabilityStatus("watch.ratePanel", "watch", panel);
    if (!panel.resolved) return;
    const chips = ratePanelChips(panel.element);
    if (!chips) return;
    const draw = () => {
      syncRatePanel(panel.element, video.playbackRate);
      render(<RateChips rates={rates} current={video.playbackRate} onPick={(rate) => { setRate(rate); draw(); }} />, chips);
    };
    chips.replaceChildren();
    chips.style.flexWrap = "wrap";
    draw();
  };

  let speedRow: Element | null = null;
  const onSettings = () => {
    // The row exists only once the menu has rendered, which happens on this same click.
    setTimeout(() => {
      if (!settingsMenu()) return;
      const found = findSpeedRow();
      void setCapabilityStatus("watch.speedRow", "watch", found);
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
    button.element.removeEventListener("click", onSettings);
    speedRow?.removeEventListener("click", onSpeedRow);
  };
}
