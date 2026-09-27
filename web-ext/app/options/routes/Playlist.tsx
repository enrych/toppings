import React from "react";
import { useSettings } from "@/kernel/useSettings";
import { playlistRuntimeSettings } from "@/features/playlist-runtime/settings";
import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Switch from "@/ui/form/Switch";

export default function Playlist() {
  const { value, update } = useSettings(playlistRuntimeSettings);

  return (
    <>
      <PageHeader title="Playlist" description="Settings for YouTube playlist pages." />

      <div className="tw-flex tw-flex-col tw-gap-8">
        <Section
          title="Runtime Statistics"
          description="The total and average runtime of a playlist, shown at the top of the page."
        >
          <Card>
            <Switch
              label="Runtime statistics"
              description="Show runtime statistics on playlist pages."
              isEnabled={value.enabled}
              onToggle={(enabled) => update({ enabled })}
            />
          </Card>
        </Section>
      </div>
    </>
  );
}
