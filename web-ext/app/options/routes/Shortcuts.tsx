import { useEffect, useState } from "preact/hooks";
import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Keybinding from "@/ui/form/Keybinding";
import { useSettings } from "@/kernel/useSettings";
import { actionId, bindingOf, keybindings, type KeyGroup } from "@/kernel/keys";
import { playbackKeys } from "@/features/playback/keys";
import { profilesKeys, profileToggleKeys } from "@/features/profiles/keys";
import { getAllProfiles, subscribeProfiles } from "@/features/profiles/store";
import { segmentsKeys } from "@/features/segments/keys";
import { shortsKeys } from "@/features/shorts/keys";

const GROUPS: { group: KeyGroup; description: string }[] = [
  { group: playbackKeys, description: "On the watch page." },
  { group: segmentsKeys, description: "On the watch page, while segments are loaded where it applies." },
  { group: shortsKeys, description: "On the Shorts player." },
];

export default function Shortcuts() {
  const { value: stored, update } = useSettings(keybindings);
  const [profilesGroup, setProfilesGroup] = useState<KeyGroup>(profilesKeys);

  useEffect(() => {
    const load = async () => {
      const toggles = profileToggleKeys(await getAllProfiles());
      setProfilesGroup({ ...profilesKeys, keys: { ...profilesKeys.keys, ...toggles.keys } });
    };
    void load();
    return subscribeProfiles(() => void load());
  }, []);

  const groups = [
    ...GROUPS,
    { group: profilesGroup, description: "Anywhere on YouTube. A profile's shortcut switches to it; press again to go back." },
  ];

  return (
    <>
      <PageHeader title="Shortcuts" description="Click a shortcut to record a new one. Backspace clears it; Escape cancels." />

      <div class="tw-flex tw-flex-col tw-gap-8">
        {groups.map(({ group, description }) => (
          <Section key={group.id} id={group.id} title={group.title} description={description}>
            <Card>
              {Object.entries(group.keys).map(([key, definition]) => {
                const id = actionId(group, key);
                return (
                  <Keybinding
                    key={key}
                    label={definition.label}
                    description={definition.description}
                    value={bindingOf(group, key, stored)}
                    onChange={(binding) => update({ [id]: binding })}
                    // The slice merges on write, so an override is dropped by
                    // writing undefined, which bindingOf reads as the default.
                    onReset={stored[id] == null ? undefined : () => update({ [id]: undefined })}
                  />
                );
              })}
            </Card>
          </Section>
        ))}
      </div>
    </>
  );
}
