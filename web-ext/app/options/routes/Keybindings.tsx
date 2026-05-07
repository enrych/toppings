import React from "react";
import PageHeader from "../../../components/layout/PageHeader";
import Section from "../../../components/layout/Section";
import Card from "../../../components/layout/Card";
import Keybinding from "../../../components/form/Keybinding";
import Input from "../../../components/form/Input";
import { useStoreUpdater } from "../../../hooks/useStoreUpdater";

export default function Keybindings() {
  const { store, update } = useStoreUpdater();
  const w = store.preferences.watch;
  const s = store.preferences.shorts;
  const nudge = w.nudgeLoopSegment;
  const seg = w.segments;

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
              label="Segments: Load Last Used / Toggle"
              description="Load the last-used segment config and enable it. If segments are already active, disables them."
              value={w.toggleLoopSegment.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.toggleLoopSegment.key = key;
                });
              }}
            />
            <Keybinding
              label="Segments: Fresh Slate"
              description="Always start a brand-new segment config: one segment spanning the full video, looping infinitely."
              value={seg?.freshSlateKey ?? "Shift+Z"}
              onChange={(key) => {
                update((draft) => {
                  if (!draft.preferences.watch.segments) {
                    draft.preferences.watch.segments = { freshSlateKey: key };
                  } else {
                    draft.preferences.watch.segments.freshSlateKey = key;
                  }
                });
              }}
            />
            <Keybinding
              label="Segments: Set Start of Active"
              description="Pin the start marker of the active segment (the one containing the playhead) to the current time."
              value={w.setLoopSegmentBegin.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.setLoopSegmentBegin.key = key;
                });
              }}
            />
            <Keybinding
              label="Segments: Set End of Active"
              description="Pin the end marker of the active segment to the current time."
              value={w.setLoopSegmentEnd.key}
              onChange={(key) => {
                update((draft) => {
                  draft.preferences.watch.setLoopSegmentEnd.key = key;
                });
              }}
            />
            <Keybinding
              label="Segments: Save to Default Slot"
              description="While segments active: saves to default slot. While segments off: clears the last-used record for this video."
              value={w.saveLoopSegment?.key ?? ""}
              onChange={(key) => {
                update((draft) => {
                  if (!draft.preferences.watch.saveLoopSegment) {
                    draft.preferences.watch.saveLoopSegment = { key };
                  } else {
                    draft.preferences.watch.saveLoopSegment.key = key;
                  }
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
          id="profiles"
          title="Profiles"
          description="Cycle through your profiles without leaving the video."
        >
          <Card>
            <Keybinding
              label="Cycle Profiles"
              value={w.cycleProfiles?.key ?? ""}
              onChange={(key) => {
                update((draft) => {
                  if (!draft.preferences.watch.cycleProfiles) {
                    draft.preferences.watch.cycleProfiles = { key };
                  } else {
                    draft.preferences.watch.cycleProfiles.key = key;
                  }
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="nudge"
          title="Segments Nudge"
          description="Fine-tune segment markers with accelerating nudge shortcuts. Rapid consecutive presses multiply the step up to the max."
        >
          <Card>
            <Keybinding
              label="Nudge Active Segment Start Backward"
              description="Move the start marker of the active segment back (with acceleration)."
              value={nudge?.startBackwardKey ?? ""}
              onChange={(key) => {
                update((draft) => {
                  if (!draft.preferences.watch.nudgeLoopSegment) return;
                  draft.preferences.watch.nudgeLoopSegment.startBackwardKey = key;
                });
              }}
            />
            <Keybinding
              label="Nudge Active Segment Start Forward"
              description="Move the start marker of the active segment forward (with acceleration)."
              value={nudge?.startForwardKey ?? ""}
              onChange={(key) => {
                update((draft) => {
                  if (!draft.preferences.watch.nudgeLoopSegment) return;
                  draft.preferences.watch.nudgeLoopSegment.startForwardKey = key;
                });
              }}
            />
            <Keybinding
              label="Nudge Active Segment End Forward"
              description="Move the end marker of the active segment forward (with acceleration)."
              value={nudge?.endForwardKey ?? ""}
              onChange={(key) => {
                update((draft) => {
                  if (!draft.preferences.watch.nudgeLoopSegment) return;
                  draft.preferences.watch.nudgeLoopSegment.endForwardKey = key;
                });
              }}
            />
            <Keybinding
              label="Nudge Active Segment End Backward"
              description="Move the end marker of the active segment back (with acceleration)."
              value={nudge?.endBackwardKey ?? ""}
              onChange={(key) => {
                update((draft) => {
                  if (!draft.preferences.watch.nudgeLoopSegment) return;
                  draft.preferences.watch.nudgeLoopSegment.endBackwardKey = key;
                });
              }}
            />
          </Card>
          <Card>
            <Input
              label="Base Step (seconds)"
              description="How many seconds the first press nudges the marker."
              hint="Default: 1"
              initialValue={nudge?.baseStep ?? "1"}
              placeholder="1"
              validator={(v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0}
              errorMessage="Must be a positive number."
              onChange={(val) => {
                update((draft) => {
                  if (!draft.preferences.watch.nudgeLoopSegment) return;
                  draft.preferences.watch.nudgeLoopSegment.baseStep = val;
                });
              }}
            />
            <Input
              label="Multiplier"
              description="Step multiplier applied on rapid consecutive presses. Use 1 to disable acceleration."
              hint="Default: 2"
              initialValue={nudge?.multiplier ?? "2"}
              placeholder="2"
              validator={(v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 1}
              errorMessage="Must be ≥ 1."
              onChange={(val) => {
                update((draft) => {
                  if (!draft.preferences.watch.nudgeLoopSegment) return;
                  draft.preferences.watch.nudgeLoopSegment.multiplier = val;
                });
              }}
            />
            <Input
              label="Max Step (seconds)"
              description="The nudge step will not exceed this value."
              hint="Default: 16"
              initialValue={nudge?.maxStep ?? "16"}
              placeholder="16"
              validator={(v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0}
              errorMessage="Must be a positive number."
              onChange={(val) => {
                update((draft) => {
                  if (!draft.preferences.watch.nudgeLoopSegment) return;
                  draft.preferences.watch.nudgeLoopSegment.maxStep = val;
                });
              }}
            />
          </Card>
        </Section>
      </div>
    </>
  );
}
