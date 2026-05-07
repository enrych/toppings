import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/layout/PageHeader";
import Section from "../../../components/layout/Section";
import Card from "../../../components/layout/Card";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";
import CapabilityStatusRow from "../../../components/feedback/CapabilityStatusRow";
import { useStoreUpdater } from "../../../hooks/useStoreUpdater";
import { useCapabilityCache } from "../../../hooks/useCapabilityCache";
import { isNumericInRange } from "@toppings/utils";
import { isCustomPlaybackRatesList } from "../utils/validators";
import {
  getUndismissedRecovered,
  dismissRecovered,
  type RecoveredFeature,
} from "../../../utils/storage/featureReports";

// All watch-page primitives the extension currently supports.
// When a new primitive is added, append an entry here.
const WATCH_PRIMITIVES: { id: string; label: string }[] = [
  { id: "watch.player",        label: "Video Player" },
  { id: "watch.rightControls", label: "Player Controls Bar" },
  { id: "watch.progressBar",   label: "Progress Bar" },
  { id: "watch.moviePlayer",   label: "Movie Player Container" },
  { id: "watch.settingsButton",label: "Settings Button" },
  { id: "watch.sidebar",       label: "Recommendations Sidebar" },
  { id: "watch.comments",      label: "Comments Section" },
  { id: "watch.endCards",      label: "End Screen Cards" },
];

function useRecoveredFeatures() {
  const [recovered, setRecovered] = useState<RecoveredFeature[]>([]);

  useEffect(() => {
    getUndismissedRecovered().then(setRecovered);
  }, []);

  const dismiss = async (primitiveId: string) => {
    await dismissRecovered(primitiveId);
    setRecovered((prev) => prev.filter((r) => r.primitiveId !== primitiveId));
  };

  return { recovered, dismiss };
}

export default function Watch() {
  const { store, update } = useStoreUpdater();
  const { getStatus, isLoading } = useCapabilityCache();
  const { recovered, dismiss } = useRecoveredFeatures();
  const w = store.preferences.watch;

  return (
    <>
      <PageHeader
        title="Watch"
        description="Settings for the YouTube watch page — playback rate, seek, and loop controls."
      />

      {/* Recovery banners — shown when a previously-reported feature is now working */}
      {recovered.map((r) => (
        <div
          key={r.primitiveId}
          className="tw-flex tw-items-start tw-justify-between tw-gap-4 tw-p-4 tw-rounded-xl tw-border tw-border-green-500/30 tw-bg-green-500/10"
        >
          <div className="tw-flex tw-flex-col tw-gap-0.5">
            <span className="tw-text-sm tw-font-semibold tw-text-green-400">
              A feature you reported is now working 🎉
            </span>
            <span className="tw-text-xs tw-text-fg-subtle">
              <code className="tw-font-mono">{r.primitiveId}</code> is now
              supported on your YouTube. You can re-scan to confirm.
            </span>
          </div>
          <button
            type="button"
            onClick={() => void dismiss(r.primitiveId)}
            className="tw-flex-shrink-0 tw-text-xs tw-text-fg-subtle hover:tw-text-fg tw-transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="tw-flex tw-flex-col tw-gap-8">
        <Section
          id="playback-rate"
          title="Playback Rate"
          description="Configure custom rate options and the default rate applied when a video starts."
        >
          <Card>
            <Input
              label="Default Playback Rate"
              description="Rate applied to every video on load. 1 = Normal."
              initialValue={w.defaultPlaybackRate.value}
              validator={(v) => isNumericInRange(v, 0.0625, 16)}
              errorMessage="Must be between 0.0625 and 16"
              onChange={(value) => {
                update((draft) => {
                  draft.preferences.watch.defaultPlaybackRate.value = value;
                });
              }}
            />
            <Input
              label="Custom Playback Rates"
              description="Leave empty to use YouTube's speed menu. Or comma-separated rates (must include 1)."
              initialValue={w.customPlaybackRates.join(", ")}
              validator={isCustomPlaybackRatesList}
              errorMessage="Must include 1, separated by commas, between 0.0625 and 16"
              inputWidthClass="tw-w-72"
              onChange={(value) => {
                update((draft) => {
                  const trimmed = value.trim();
                  draft.preferences.watch.customPlaybackRates =
                    trimmed === ""
                      ? []
                      : trimmed
                          .split(",")
                          .map((r) => Number(r.trim()).toFixed(2));
                });
              }}
            />
            <Input
              label="Toggle Playback Rate"
              description="Rate to switch to when pressing the toggle shortcut."
              initialValue={w.togglePlaybackRate.value}
              validator={(v) => isNumericInRange(v, 0.0625, 16)}
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
              validator={(v) => isNumericInRange(v, 0, 16)}
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
              validator={(v) => isNumericInRange(v, 0, 16)}
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
              validator={(v) => isNumericInRange(v, 0, Infinity)}
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
              validator={(v) => isNumericInRange(v, 0, Infinity)}
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
          title="Segments"
          description="Define multiple time-range segments on any video and play them in sequence."
        >
          <Card>
            <Select
              label="Auto-load on page open"
              description="Whether to automatically restore segments when you open a video. Per-video pins (set in the player panel) override this setting."
              value={store.preferences.watch.segments?.autoLoad ?? "off"}
              options={[
                { value: "off", label: "Off — manual only (press Z to load)" },
                { value: "last-used", label: "Restore last-used session" },
                { value: "default", label: "Restore default saved config" },
              ]}
              onChange={(value) => {
                update((draft) => {
                  if (!draft.preferences.watch.segments) {
                    draft.preferences.watch.segments = {
                      freshSlateKey: "Shift+Z",
                      autoLoad: value as "off" | "last-used" | "default",
                    };
                  } else {
                    draft.preferences.watch.segments.autoLoad =
                      value as "off" | "last-used" | "default";
                  }
                });
              }}
            />
          </Card>
        </Section>

        <Section
          id="feature-availability"
          title="Feature Availability"
          description="Shows which features are active on your YouTube. YouTube's interface varies by account — if something shows as unavailable, tap Report to notify the developer."
        >
          <Card>
            {isLoading ? (
              <div className="tw-py-4 tw-text-sm tw-text-fg-subtle tw-text-center">
                Checking features…
              </div>
            ) : (
              WATCH_PRIMITIVES.map(({ id, label }) => (
                <CapabilityStatusRow
                  key={id}
                  primitiveId={id}
                  label={label}
                  status={getStatus(id)}
                />
              ))
            )}
          </Card>
        </Section>
      </div>
    </>
  );
}
