import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mount, mountInline } from "@/kernel/dom/mount";
import { setCapabilityStatus } from "@/kernel/dom/capabilities";
import { showToast } from "@/kernel/dom/toast";
import { isTypingTarget, matchesBinding } from "@/kernel/keybinding";
import { resolveBelowPlayer, resolveProgressBar, resolveRightControls, resolveVideo } from "@/youtube/player";
import { Markers } from "./Markers";
import { Panel } from "./panel/Panel";
import { SegmentButton, segmentButtonHost, styleSegmentButton } from "./SegmentButton";
import { segmentsKeys } from "./keys";
import { SegmentSession } from "./session";
import { segmentsSettings } from "./settings";
import { indexedDbSegmentStorage, openVideoSegments, type SegmentStorage } from "./store";

export interface SegmentsDeps {
  storage: SegmentStorage;
}

export function createSegments({ storage }: SegmentsDeps): Feature {
  return {
    id: "segments",
    routes: ["watch"],
    async mount({ route }) {
      if (route.name !== "watch" || !route.videoId) return;
      const settings = await segmentsSettings.get();
      const [player, controls, bar, below] = await Promise.all([resolveVideo(), resolveRightControls(), resolveProgressBar(), resolveBelowPlayer()]);
      void setCapabilityStatus("watch.player", "watch", player);
      void setCapabilityStatus("watch.rightControls", "watch", controls);
      void setCapabilityStatus("watch.progressBar", "watch", bar);
      if (!player.resolved) return;
      const video = player.element as HTMLVideoElement;

      const session = new SegmentSession({ video, store: openVideoSegments(storage, route.videoId), settings, toast: showToast });
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
          styleSegmentButton(button.host as HTMLButtonElement, active, config && config.label !== "Default" ? config.label : null);
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

      const restore = () => void session.restore();
      if (video.readyState >= 1 && video.duration) restore();
      else video.addEventListener("loadedmetadata", restore, { once: true });

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
      // Saved configs carry their own shortcut keys, which are per video and so
      // cannot live in the static key registry.
      const onSavedShortcut = (event: KeyboardEvent) => {
        if (isTypingTarget(event.target)) return;
        const hit = session.state.saved.find((c) => c.shortcutKey && matchesBinding(event, c.shortcutKey));
        if (hit) session.load(hit);
      };
      document.addEventListener("keydown", onSavedShortcut);

      return () => {
        document.removeEventListener("keydown", onSavedShortcut);
        video.removeEventListener("loadedmetadata", restore);
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
}

export const segments = createSegments({ storage: indexedDbSegmentStorage });
