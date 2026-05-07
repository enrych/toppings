import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Section from "../components/layout/Section";
import SectionNav from "../components/layout/SectionNav";
import Card from "../components/layout/Card";
import Input from "../components/form/Input";
import { useStoreUpdater } from "../hooks/useStoreUpdater";

export const sectionNavItems = [
  { id: "playback-rate", label: "Playback Rate" },
  { id: "seek", label: "Seek" },
  { id: "loop", label: "Loop Segments" },
];

export const SectionsRail = () => <SectionNav items={sectionNavItems} />;

export default function Watch() {
  const { store, update } = useStoreUpdater();
  const w = store.preferences.watch;

  const isValidNumeric = (v: string, min: number, max: number) => {
    const n = parseFloat(v);
    return !isNaN(n) && n >= min && n <= max;
  };

  const customPlaybackRatesValidator = (inValue: string) => {
    const regex = /^(\d+(\.\d+)?)(\s*,\s*\d+(\.\d+)?)*$/;
    const playbackRates = inValue.split(",").map((r) => r.trim());
    if (!regex.test(inValue) || playbackRates.length <= 1) return false;
    const rates = playbackRates.map(parseFloat);
    return (
      !rates.includes(NaN) &&
      rates.includes(1) &&
      !rates.some((r) => r < 0.0625 || r > 16)
    );
  };

  return (
    <>
      <PageHeader
        title="Watch"
        description="Settings for the YouTube watch page — playback rate, seek, and loop controls."
      />

      <div className="tw-flex tw-flex-col tw-gap-8">
        <Section
          id="playback-rate"
          title="Playback Rate"
          description="Configure custom rate options and the default rate applied when a video starts."
        >
          <Card>
            <Input
              label="Default Playback Rate"
              description="Rate applied to every video on load. 1.00 = Normal."
              initialValue={w.defaultPlaybackRate.value}
              validator={(v) => isValidNumeric(v, 0.0625, 16)}
              errorMessage="Must be between 0.0625 and 16"
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.defaultPlaybackRate.value = value;
                });
              }}
            />
            <Input
              label="Custom Playback Rates"
              description="Comma-separated list of rates shown in the speed menu. Must include 1."
              initialValue={w.customPlaybackRates.toString()}
              validator={customPlaybackRatesValidator}
              errorMessage="Must include 1, separated by commas, between 0.0625 and 16"
              inputWidthClass="tw-w-72"
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.customPlaybackRates = value
                    .split(",")
                    .map((r) => Number(r.trim()).toFixed(2));
                });
              }}
            />
            <Input
              label="Toggle Playback Rate"
              description="Rate to switch to when pressing the toggle shortcut."
              initialValue={w.togglePlaybackRate.value}
              validator={(v) => isValidNumeric(v, 0.0625, 16)}
              errorMessage="Must be between 0.0625 and 16"
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.togglePlaybackRate.value = value;
                });
              }}
            />
            <Input
              label="Increase Playback Rate Step"
              description="Amount the rate goes up when pressing the increase shortcut."
              initialValue={w.increasePlaybackRate.value}
              validator={(v) => isValidNumeric(v, 0, 16)}
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.increasePlaybackRate.value = value;
                });
              }}
            />
            <Input
              label="Decrease Playback Rate Step"
              description="Amount the rate goes down when pressing the decrease shortcut."
              initialValue={w.decreasePlaybackRate.value}
              validator={(v) => isValidNumeric(v, 0, 16)}
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.decreasePlaybackRate.value = value;
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="seek"
          title="Seek"
          description="How far to jump when pressing the seek shortcuts."
        >
          <Card>
            <Input
              label="Seek Backward"
              description="Seconds to seek backward."
              initialValue={w.seekBackward.value}
              validator={(v) => isValidNumeric(v, 0, Infinity)}
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.seekBackward.value = value;
                });
              }}
            />
            <Input
              label="Seek Forward"
              description="Seconds to seek forward."
              initialValue={w.seekForward.value}
              validator={(v) => isValidNumeric(v, 0, Infinity)}
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.seekForward.value = value;
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="loop"
          title="Loop Segments"
          description="Mark a section of any video to loop continuously."
        >
          <Card>
            <p className="tw-text-sm tw-text-gray-400 tw-py-3">
              Use the loop button in the player or the keyboard shortcuts to
              mark loop start/end points. Configure shortcuts on the{" "}
              <Link
                to="/keybindings"
                className="tw-text-blue-400 hover:tw-text-blue-300"
              >
                Shortcuts
              </Link>{" "}
              page.
            </p>
          </Card>
        </Section>
      </div>
    </>
  );
}
