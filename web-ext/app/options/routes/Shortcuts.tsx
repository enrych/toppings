import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Keybinding from "@/ui/form/Keybinding";
import { useSettings } from "@/kernel/useSettings";
import { actionId, bindingOf, keybindings, type KeyGroup } from "@/kernel/keys";
import { playbackKeys } from "@/features/playback/keys";
import { profilesKeys } from "@/features/profiles/keys";
import { segmentsKeys } from "@/features/segments/keys";
import { shortsKeys } from "@/features/shorts/keys";

const GROUPS: { group: KeyGroup; description: string }[] = [
  { group: playbackKeys, description: "On the watch page." },
  { group: segmentsKeys, description: "On the watch page, while segments are loaded where it applies." },
  { group: shortsKeys, description: "On the Shorts player." },
  { group: profilesKeys, description: "Anywhere on YouTube." },
];

// Every feature's actions, straight from its key registry.
export default function Shortcuts() {
  const { value: stored, update } = useSettings(keybindings);

  return (
    <>
      <PageHeader title="Shortcuts" description="Click a shortcut to record a new one. Backspace or Escape clears it." />

      <div class="tw-flex tw-flex-col tw-gap-8">
        {GROUPS.map(({ group, description }) => (
          <Section key={group.id} id={group.id} title={group.title} description={description}>
            <Card>
              {Object.entries(group.keys).map(([key, definition]) => (
                <Keybinding
                  key={key}
                  label={definition.label}
                  description={definition.description}
                  value={bindingOf(group, key, stored)}
                  onChange={(binding) => update({ [actionId(group, key)]: binding })}
                />
              ))}
            </Card>
          </Section>
        ))}
      </div>
    </>
  );
}
