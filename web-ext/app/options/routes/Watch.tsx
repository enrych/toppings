import { useEffect, useState } from "preact/hooks";
import Button from "@/ui/primitives/Button";
import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Input from "@/ui/form/Input";
import Select from "@/ui/form/Select";
import Switch from "@/ui/form/Switch";
import CapabilityStatusRow from "@/app/options/components/CapabilityStatusRow";
import { useSettings } from "@/kernel/useSettings";
import { useCapabilityCache } from "@/kernel/dom/useCapabilities";
import { MAX_RATE, MIN_RATE, parseRates, playbackSettings } from "@/features/playback/settings";
import { segmentsSettings } from "@/features/segments/settings";
import type { AutoLoad } from "@/features/segments/store";
import {
  getUndismissedRecovered,
  dismissRecovered,
  type RecoveredFeature,
} from "@/kernel/dom/featureReports";

// Adding a watch-page primitive means appending an entry here; nothing
// discovers them automatically.
const WATCH_PRIMITIVES: { id: string; label: string }[] = [
  { id: "watch.player",        label: "Video Player" },
  { id: "watch.rightControls", label: "Player Controls Bar" },
  { id: "watch.progressBar",   label: "Progress Bar" },
  { id: "watch.moviePlayer",   label: "Movie Player Container" },
  { id: "watch.settingsButton",label: "Settings Button" },
  { id: "watch.ratePanel",     label: "Playback Speed Panel" },
  { id: "watch.sidebar",       label: "Recommendations Sidebar" },
  { id: "watch.comments",      label: "Comments Section" },
  { id: "watch.endCards",      label: "End Screen Cards" },
];

const isRate = (v: string) => Number.isFinite(Number(v)) && Number(v) >= MIN_RATE && Number(v) <= MAX_RATE;
const isStep = (v: string) => Number.isFinite(Number(v)) && Number(v) > 0 && Number(v) <= MAX_RATE;
const isSeconds = (v: string) => Number.isFinite(Number(v)) && Number(v) >= 0;
const isRateList = (v: string) => parseRates(v) !== undefined;

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
  const { value, update } = useSettings(playbackSettings);
  const segments = useSettings(segmentsSettings);
  const { getStatus, isLoading } = useCapabilityCache();
  const { recovered, dismiss } = useRecoveredFeatures();

  return (
    <>
      <PageHeader title="Watch" description="Playback rate, seek, and segments on the watch page." />

      {recovered.map((r) => (
        <div key={r.primitiveId} class="tw-flex tw-items-start tw-justify-between tw-gap-4 tw-p-4 tw-mb-6 tw-rounded-xl tw-bg-success-bg">
          <div class="tw-flex tw-flex-col tw-gap-0.5">
            <span class="tw-text-sm tw-font-medium tw-text-success-fg">A feature you reported works again</span>
            <span class="tw-text-xs tw-text-fg-muted">
              <code>{r.primitiveId}</code> now resolves on your YouTube.
            </span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => void dismiss(r.primitiveId)}>Dismiss</Button>
        </div>
      ))}

      <div class="tw-flex tw-flex-col tw-gap-8">
        <Section
          id="playback-rate"
          title="Playback rate"
          description="Custom rate options and the default rate applied when a video starts."
        >
          <Card>
            <Switch
              label="Playback controls"
              description="Default rate, rate shortcuts and seek shortcuts on the watch page."
              isEnabled={value.enabled}
              onToggle={(enabled) => update({ enabled })}
            />
            <Input
              label="Default playback rate"
              description="Rate applied to every video on load. 1 = Normal."
              initialValue={String(value.defaultRate)}
              validator={isRate}
              errorMessage={`Must be between ${MIN_RATE} and ${MAX_RATE}`}
              onChange={(v) => update({ defaultRate: Number(v) })}
            />
            <Input
              label="Custom playback rates"
              description="Leave empty to keep YouTube's speed menu, or comma-separated rates that include 1."
              initialValue={value.customRates.join(", ")}
              validator={isRateList}
              errorMessage={`Comma-separated rates between ${MIN_RATE} and ${MAX_RATE}, including 1`}
              widthClass="tw-w-72"
              onChange={(v) => update({ customRates: parseRates(v) ?? [] })}
            />
            <Input
              label="Toggle playback rate"
              description="Rate to switch to with the toggle shortcut."
              initialValue={String(value.toggleRate)}
              validator={isRate}
              errorMessage={`Must be between ${MIN_RATE} and ${MAX_RATE}`}
              onChange={(v) => update({ toggleRate: Number(v) })}
            />
            <Input
              label="Playback rate step"
              description="Amount the rate changes on the increase and decrease shortcuts."
              initialValue={String(value.rateStep)}
              validator={isStep}
              errorMessage={`Must be between 0 and ${MAX_RATE}`}
              onChange={(v) => update({ rateStep: Number(v) })}
            />
          </Card>
        </Section>

        <Section id="seek" title="Seek" description="How far to jump on the seek shortcuts.">
          <Card>
            <Input
              label="Seek backward"
              description="Seconds to seek backward."
              initialValue={String(value.seekBackward)}
              validator={isSeconds}
              onChange={(v) => update({ seekBackward: Number(v) })}
            />
            <Input
              label="Seek forward"
              description="Seconds to seek forward."
              initialValue={String(value.seekForward)}
              validator={isSeconds}
              onChange={(v) => update({ seekForward: Number(v) })}
            />
          </Card>
        </Section>

        <Section
          id="segments"
          title="Segments"
          description="Time-range segments on any video, played in sequence."
        >
          <Card>
            <Select<AutoLoad>
              label="Auto-load on page open"
              description="Whether to automatically restore segments when you open a video. Per-video pins (set in the player panel) override this setting."
              value={segments.value.autoLoad}
              options={[
                { value: "off", label: "Off — manual only (press Z to load)" },
                { value: "last-used", label: "Restore last-used session" },
                { value: "default", label: "Restore default saved config" },
              ]}
              onChange={(autoLoad) => segments.update({ autoLoad })}
            />
            <Input
              label="Nudge step"
              description="Seconds a segment edge moves on the first nudge."
              initialValue={String(segments.value.nudgeBaseStep)}
              validator={isSeconds}
              onChange={(v) => segments.update({ nudgeBaseStep: Number(v) })}
            />
            <Input
              label="Nudge multiplier"
              description="How much the step grows on each repeated nudge in the same direction."
              initialValue={String(segments.value.nudgeMultiplier)}
              validator={isStep}
              onChange={(v) => segments.update({ nudgeMultiplier: Number(v) })}
            />
            <Input
              label="Nudge maximum"
              description="Largest step a repeated nudge can reach, in seconds."
              initialValue={String(segments.value.nudgeMaxStep)}
              validator={isSeconds}
              onChange={(v) => segments.update({ nudgeMaxStep: Number(v) })}
            />
          </Card>
        </Section>

        <Section
          id="feature-availability"
          title="Feature availability"
          description="Which features work on your YouTube. Its layout varies by account; report anything shown as unavailable."
        >
          <Card>
            {isLoading ? (
              <div class="tw-py-4 tw-text-sm tw-text-fg-subtle tw-text-center">
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
