import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mount, mountInline } from "@/kernel/dom/mount";
import { showToast } from "@/kernel/dom/toast";
import { resolveBelowPlayer, resolveProgressBar, resolveRightControls, resolveVideo } from "@/youtube/player";
import { Markers } from "./Markers";
import { Panel } from "./panel/Panel";
import { SegmentButton, segmentButtonHost, setSegmentButtonState } from "./SegmentButton";
import { segmentsKeys } from "./keys";
import { SegmentSession } from "./session";
import { segmentsSettings } from "./settings";
import { openVideoSegments } from "./store";

export const segments: Feature = {
  id: "segments",
  routes: ["watch"],
  async mount({ route }) {
    if (route.name !== "watch" || !route.videoId) return;
    const settings = await segmentsSettings.get();
    if (!settings.enabled) return;
    const [player, controls, bar, below] = await Promise.all([resolveVideo(), resolveRightControls(), resolveProgressBar(), resolveBelowPlayer()]);
    if (!player.resolved) return;
    const video = player.element as HTMLVideoElement;

    const session = new SegmentSession({ video, store: openVideoSegments(route.videoId), settings, toast: showToast });
    await session.init();

    const button = controls.resolved ? mountInline(segmentButtonHost(), controls.element, <SegmentButton active={false} />, "prepend") : undefined;
    if (button) button.host.onclick = () => void session.toggle();
    // The handles rest above the bar, which YouTube would otherwise clip.
    const track = bar.element as HTMLElement | null;
    if (track) track.style.overflow = "visible";
    const markers = track ? mount("tppng-segment-markers", track, null) : undefined;
    const panel = below.resolved ? mount("tppng-segment-panel", below.element, null, "prepend") : undefined;
    const playhead = () => ({ time: video.currentTime, duration: video.duration || 0 });

    const draw = () => {
      const { active, config } = session.state;
      if (button) {
        button.update(<SegmentButton active={active} />);
        setSegmentButtonState(button.host as HTMLButtonElement, active, session.loaded?.label ?? null);
      }
      markers?.update(
        <Markers
          segments={active && config ? config.segments : []}
          duration={video.duration || 0}
          track={track!}
          onPreview={(segments) => session.preview(segments)}
          onSeek={(time) => (video.currentTime = time)}
          onCommit={() => session.commitPreview()}
          onMerge={(keep, remove) => session.merge(keep, remove)}
        />,
      );
      panel?.update(<Panel session={session} playhead={playhead} />);
    };
    const unsubscribe = session.subscribe(draw);
    draw();

    // Retried as playback goes on, because a pre-roll ad loads its own
    // metadata into the video first and holds it until the ad is over.
    const restore = () => {
      if (!session.ready) return;
      video.removeEventListener("loadedmetadata", restore);
      video.removeEventListener("timeupdate", restore);
      void session.restore();
    };
    video.addEventListener("loadedmetadata", restore);
    video.addEventListener("timeupdate", restore);
    restore();

    const unbindKeys = bindKeys(segmentsKeys, {
      toggle: () => void session.toggle(),
      fresh: () => session.fresh(),
      setStart: () => session.setStart(),
      setEnd: () => session.setEnd(),
      nudgeStartBackward: () => session.nudgeMarker("start", "backward"),
      nudgeStartForward: () => session.nudgeMarker("start", "forward"),
      nudgeEndBackward: () => session.nudgeMarker("end", "backward"),
      nudgeEndForward: () => session.nudgeMarker("end", "forward"),
      save: () => void session.save(),
    });
    return () => {
      video.removeEventListener("loadedmetadata", restore);
      video.removeEventListener("timeupdate", restore);
      unbindKeys();
      unsubscribe();
      session.dispose();
      button?.unmount();
      markers?.unmount();
      panel?.unmount();
      if (track) track.style.overflow = "";
    };
  },
};
