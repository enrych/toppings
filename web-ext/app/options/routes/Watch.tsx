import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Input from "@/ui/form/Input";
import Select from "@/ui/form/Select";
import Switch from "@/ui/form/Switch";
import { isNudgeMax, isNudgeStep, isSeconds } from "@/app/options/validators";
import { useSettings } from "@/kernel/useSettings";
import { MAX_RATE, MIN_RATE, parseRates, playbackSettings } from "@/features/playback/settings";
import { segmentsSettings } from "@/features/segments/settings";
import type { AutoLoad } from "@/features/segments/store";

const isRate = (v: string) => Number.isFinite(Number(v)) && Number(v) >= MIN_RATE && Number(v) <= MAX_RATE;
const isStep = (v: string) => Number.isFinite(Number(v)) && Number(v) > 0 && Number(v) <= MAX_RATE;
const isRateList = (v: string) => parseRates(v) !== undefined;

export default function Watch() {
  const { value, update } = useSettings(playbackSettings);
  const segments = useSettings(segmentsSettings);

  return (
    <>
      <PageHeader title="Watch" description="Playback rate, seek, and segments on the watch page." />

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
              errorMessage="Must be more than 0"
              onChange={(v) => update({ seekBackward: Number(v) })}
            />
            <Input
              label="Seek forward"
              description="Seconds to seek forward."
              initialValue={String(value.seekForward)}
              validator={isSeconds}
              errorMessage="Must be more than 0"
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
            <Switch
              label="Segments"
              description="The segments button, panel and markers, and their shortcuts."
              isEnabled={segments.value.enabled}
              onToggle={(enabled) => segments.update({ enabled })}
            />
            <Select<AutoLoad>
              label="Auto-load on page open"
              description="Whether to automatically restore segments when you open a video."
              value={segments.value.autoLoad}
              options={[
                { value: "off", label: "Off — manual only (use the Toggle segments shortcut)" },
                { value: "last-used", label: "Restore last-used session" },
                { value: "default", label: "Restore default saved config" },
              ]}
              onChange={(autoLoad) => segments.update({ autoLoad })}
            />
            <Input
              label="Nudge step"
              description="Seconds a segment edge moves on the first nudge."
              initialValue={String(segments.value.nudgeBaseStep)}
              validator={(v) => isNudgeStep(v, segments.value.nudgeMaxStep)}
              errorMessage="Must be more than 0 and no more than the nudge maximum"
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
              validator={(v) => isNudgeMax(v, segments.value.nudgeBaseStep)}
              errorMessage="Must be at least the nudge step"
              onChange={(v) => segments.update({ nudgeMaxStep: Number(v) })}
            />
          </Card>
        </Section>
      </div>
    </>
  );
}
