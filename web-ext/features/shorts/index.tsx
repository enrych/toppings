import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mount } from "@/kernel/dom/mount";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import { isReelPanelOpen, nextReelButton, resolveReelActionBar, resolveReelVideo } from "@/youtube/shorts";
import { Controls } from "./Controls";
import { shortsKeys } from "./keys";
import { shortsSettings } from "./settings";

export const shorts: Feature = {
  id: "shorts",
  routes: ["shorts"],
  async mount() {
    const settings = await shortsSettings.get();
    if (!settings.enabled) return;
    const [player, actionBar] = await Promise.all([resolveReelVideo(), resolveReelActionBar()]);
    void setCapabilityStatus("shorts.player", "shorts", player);
    void setCapabilityStatus("shorts.actionBar", "shorts", actionBar);
    if (!player.resolved || !actionBar.resolved) return;
    const video = player.element as HTMLVideoElement;
    const actions = actionBar.element;

    let autoScroll = settings.autoScroll;

    // YouTube loops a Short by default; the loop attribute comes back after
    // playback starts, so it is stripped shortly after each "playing".
    let unloop: ReturnType<typeof setTimeout> | undefined;
    const onPlaying = () => {
      clearTimeout(unloop);
      if (autoScroll) unloop = setTimeout(() => video.removeAttribute("loop"), 400);
    };
    const onEnded = () => {
      if (!autoScroll || isReelPanelOpen(video)) {
        void video.play();
        return;
      }
      nextReelButton(video)?.click();
    };
    video.addEventListener("playing", onPlaying);
    video.addEventListener("ended", onEnded);
    onPlaying();

    const view = () => (
      <Controls
        autoScroll={autoScroll}
        fastRate={settings.toggleRate}
        isFast={video.playbackRate !== 1}
        onToggleAutoScroll={() => {
          autoScroll = !autoScroll;
          void shortsSettings.set({ autoScroll });
          controls.update(view());
        }}
        onToggleRate={toggleRate}
      />
    );
    const toggleRate = () => {
      video.playbackRate = video.playbackRate === 1 ? settings.toggleRate : 1;
      controls.update(view());
    };
    const controls = mount("tppng-shorts-controls", actions, view(), "prepend");

    const unbindKeys = bindKeys(shortsKeys, {
      toggleRate,
      seekBackward: () => (video.currentTime -= settings.seekBackward),
      seekForward: () => (video.currentTime += settings.seekForward),
    });

    return () => {
      unbindKeys();
      controls.unmount();
      clearTimeout(unloop);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("ended", onEnded);
    };
  },
};
