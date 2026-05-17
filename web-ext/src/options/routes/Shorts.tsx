import React from "react";
import PageHeader from "../../shared/components/layout/PageHeader";
import Section from "../../shared/components/layout/Section";
import Card from "../../shared/components/layout/Card";
import Switch from "../../shared/components/form/Switch";
import Input from "../../shared/components/form/Input";
import { useStoreUpdater } from "../../shared/hooks/useStoreUpdater";

export default function Shorts() {
  const { store, update } = useStoreUpdater();
  const s = store.preferences.shorts;

  const isValidNumeric = (v: string, min: number, max: number) => {
    const n = parseFloat(v);
    return !isNaN(n) && n >= min && n <= max;
  };

  return (
    <>
      <PageHeader
        title="Shorts"
        description="Settings for the YouTube Shorts player."
      />

      <div className="tw-flex tw-flex-col tw-gap-8">
        <Section title="Behavior" description="How Shorts playback responds.">
          <Card>
            <Switch
              label="Auto-Scroll"
              description="Automatically scroll to the next reel when one ends."
              isEnabled={s.reelAutoScroll.value}
              onToggle={(isEnabled) => {
                update((draft) => {
                  draft.preferences.shorts.reelAutoScroll.value = isEnabled;
                });
              }}
            />
          </Card>
        </Section>

        <Section
          title="Playback Rate"
          description="Toggle between normal speed and a custom rate."
        >
          <Card>
            <Input
              label="Toggle Playback Rate"
              description="Rate to switch to when pressing the toggle shortcut."
              initialValue={s.togglePlaybackRate.value}
              validator={(v) => isValidNumeric(v, 0.0625, 16)}
              errorMessage="Must be between 0.0625 and 16"
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.shorts.togglePlaybackRate.value = value;
                });
              }}
            />
          </Card>
        </Section>

        <Section title="Seek" description="How far to jump on seek shortcuts.">
          <Card>
            <Input
              label="Seek Backward"
              description="Seconds to seek backward."
              initialValue={s.seekBackward.value}
              validator={(v) => isValidNumeric(v, 0, Infinity)}
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.shorts.seekBackward.value = value;
                });
              }}
            />
            <Input
              label="Seek Forward"
              description="Seconds to seek forward."
              initialValue={s.seekForward.value}
              validator={(v) => isValidNumeric(v, 0, Infinity)}
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.shorts.seekForward.value = value;
                });
              }}
            />
          </Card>
        </Section>
      </div>
    </>
  );
}
