import { useSettings } from "@/kernel/useSettings";
import { shortsSettings } from "@/features/shorts/settings";
import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Switch from "@/ui/form/Switch";
import Input from "@/ui/form/Input";

const isRate = (v: string) => Number.isFinite(Number(v)) && Number(v) >= 0.0625 && Number(v) <= 16;
const isSeconds = (v: string) => Number.isFinite(Number(v)) && Number(v) >= 0;

export default function Shorts() {
  const { value, update } = useSettings(shortsSettings);

  return (
    <>
      <PageHeader title="Shorts" description="Settings for the YouTube Shorts player." />

      <div class="tw-flex tw-flex-col tw-gap-8">
        <Section title="Behavior" description="How Shorts playback responds.">
          <Card>
            <Switch
              label="Shorts features"
              description="Auto-scroll, seek and rate controls on Shorts."
              isEnabled={value.enabled}
              onToggle={(enabled) => update({ enabled })}
            />
            <Switch
              label="Auto-scroll"
              description="Continue to the next Short when one ends."
              isEnabled={value.autoScroll}
              onToggle={(autoScroll) => update({ autoScroll })}
            />
          </Card>
        </Section>

        <Section title="Playback rate" description="Toggle between normal speed and a custom rate.">
          <Card>
            <Input
              label="Toggle playback rate"
              description="Rate to switch to with the toggle button or shortcut."
              initialValue={String(value.toggleRate)}
              validator={isRate}
              errorMessage="Must be between 0.0625 and 16"
              onChange={(v) => update({ toggleRate: Number(v) })}
            />
          </Card>
        </Section>

        <Section title="Seek" description="How far to jump on the seek shortcuts.">
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
      </div>
    </>
  );
}
