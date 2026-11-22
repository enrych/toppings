import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mount } from "@/kernel/dom/mount";
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
    if (!player.resolved || !actionBar.resolved) return;
    const video = player.element as HTMLVideoElement;
    const actions = actionBar.element;

    let autoScroll = settings.autoScroll;

    // YouTube loops a Short by default and puts the attribute back whenever
    // it likes, so it is taken off each time it appears.
    const unloop = () => {
      if (autoScroll) video.loop = false;
    };
    const loopWatch = new MutationObserver(unloop);
    loopWatch.observe(video, { attributes: true, attributeFilter: ["loop"] });
    unloop();
    const onEnded = () => {
      if (!autoScroll || isReelPanelOpen(video)) {
        void video.play();
        return;
      }
      nextReelButton(video)?.click();
    };
    video.addEventListener("ended", onEnded);

    const view = () => (
      <Controls
        autoScroll={autoScroll}
        fastRate={settings.toggleRate}
        isFast={video.playbackRate !== 1}
        onToggleAutoScroll={() => {
          autoScroll = !autoScroll;
          unloop();
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
      loopWatch.disconnect();
      video.removeEventListener("ended", onEnded);
    };
  },
};
