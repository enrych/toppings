import React from "react";
import PageHeader from "../../shared/components/layout/PageHeader";
import Section from "../../shared/components/layout/Section";
import SectionNav from "../../shared/components/layout/SectionNav";
import Card from "../../shared/components/layout/Card";
import Keybinding from "../../shared/components/form/Keybinding";
import { useStoreUpdater } from "../../shared/hooks/useStoreUpdater";

export const sectionNavItems = [
  { id: "watch", label: "Watch" },
  { id: "shorts", label: "Shorts" },
  { id: "audio", label: "Audio Mode" },
];

export const SectionsRail = () => <SectionNav items={sectionNavItems} />;

export default function Keybindings() {
  const { store, update } = useStoreUpdater();
  const w = store.preferences.watch;
  const s = store.preferences.shorts;
  const am = store.preferences.watch.audioMode;

  return (
    <>
      <PageHeader
        title="Keyboard Shortcuts"
        description="All keybindings in one place. Click a key to record a new binding, press Backspace or Escape to clear."
      />

      <div className="tw-flex tw-flex-col tw-gap-8">
        <Section
          id="watch"
          title="Watch Page"
          description="Shortcuts for the YouTube watch player."
        >
          <Card>
            <Keybinding
              label="Toggle Playback Rate"
              value={w.togglePlaybackRate.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.togglePlaybackRate.key = key;
                });
              }}
            />
            <Keybinding
              label="Increase Playback Rate"
              value={w.increasePlaybackRate.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.increasePlaybackRate.key = key;
                });
              }}
            />
            <Keybinding
              label="Decrease Playback Rate"
              value={w.decreasePlaybackRate.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.decreasePlaybackRate.key = key;
                });
              }}
            />
            <Keybinding
              label="Seek Backward"
              value={w.seekBackward.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.seekBackward.key = key;
                });
              }}
            />
            <Keybinding
              label="Seek Forward"
              value={w.seekForward.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.seekForward.key = key;
                });
              }}
            />
            <Keybinding
              label="Toggle Loop Segment"
              value={w.toggleLoopSegment.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.toggleLoopSegment.key = key;
                });
              }}
            />
            <Keybinding
              label="Set Loop Segment Begin"
              value={w.setLoopSegmentBegin.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.setLoopSegmentBegin.key = key;
                });
              }}
            />
            <Keybinding
              label="Set Loop Segment End"
              value={w.setLoopSegmentEnd.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.setLoopSegmentEnd.key = key;
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="shorts"
          title="Shorts"
          description="Shortcuts for the Shorts player."
        >
          <Card>
            <Keybinding
              label="Toggle Playback Rate"
              value={s.togglePlaybackRate.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.shorts.togglePlaybackRate.key = key;
                });
              }}
            />
            <Keybinding
              label="Seek Backward"
              value={s.seekBackward.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.shorts.seekBackward.key = key;
                });
              }}
            />
            <Keybinding
              label="Seek Forward"
              value={s.seekForward.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.shorts.seekForward.key = key;
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="audio"
          title="Audio Mode"
          description="Shortcut for toggling audio mode on the watch page."
        >
          <Card>
            <Keybinding
              label="Toggle Audio Mode"
              value={am.toggleAudioMode.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.audioMode.toggleAudioMode.key = key;
                });
              }}
            />
          </Card>
        </Section>
      </div>
    </>
  );
}
