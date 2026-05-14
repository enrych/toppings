import React from "react";
import PageHeader from "../../shared/components/layout/PageHeader";
import Section from "../../shared/components/layout/Section";
import Card from "../../shared/components/layout/Card";
import Switch from "../../shared/components/form/Switch";
import Select from "../../shared/components/form/Select";
import { useStoreUpdater } from "../../shared/hooks/useStoreUpdater";
import { useToast } from "../../shared/components/feedback/ToastProvider";
import { setExtensionIcon } from "../../shared/utils/browser";
import { ThemePreference } from "../../shared/utils/theme";

export default function General() {
  const { store, update } = useStoreUpdater();
  const toast = useToast();

  return (
    <>
      <PageHeader
        title="General"
        description="Master controls for the extension and per-page features."
      />

      <div className="tw-flex tw-flex-col tw-gap-8">
        <Section
          title="Extension"
          description="Turn the entire extension on or off."
        >
          <Card>
            <Switch
              label="Enable Extension"
              description="When off, no Toppings features run on YouTube."
              isEnabled={store.isExtensionEnabled}
              onToggle={(isEnabled) => {
                update((draft) => {
                  draft.isExtensionEnabled = isEnabled;
                });
                setExtensionIcon(!isEnabled);
                toast.success(
                  isEnabled ? "Extension enabled" : "Extension disabled",
                );
              }}
            />
          </Card>
        </Section>

        <Section
          title="Appearance"
          description="Choose how the extension UI looks."
        >
          <Card>
            <Select<ThemePreference>
              label="Theme"
              description="System follows your OS appearance. Affects the popup and options UI — YouTube itself is unaffected."
              value={store.ui?.theme ?? "system"}
              options={[
                {
                  value: "system",
                  label: "System",
                  description: "Match your operating system",
                },
                {
                  value: "dark",
                  label: "Dark",
                  description: "Always use dark theme",
                },
                {
                  value: "light",
                  label: "Light",
                  description: "Always use light theme",
                },
              ]}
              onChange={(theme) => {
                update((draft) => {
                  if (!draft.ui) draft.ui = { theme: "system" };
                  draft.ui.theme = theme;
                });
              }}
            />
          </Card>
        </Section>

        <Section
          title="YouTube Pages"
          description="Toggle features on individual YouTube page types."
        >
          <Card>
            <Switch
              label="Watch Page"
              description="Custom playback rates, seek, loops, audio mode."
              isEnabled={store.preferences.watch.isEnabled}
              onToggle={(isEnabled) => {
                update((draft) => {
                  draft.preferences.watch.isEnabled = isEnabled;
                });
              }}
            />
            <Switch
              label="Shorts"
              description="Playback rate and seek controls on Shorts."
              isEnabled={store.preferences.shorts.isEnabled}
              onToggle={(isEnabled) => {
                update((draft) => {
                  draft.preferences.shorts.isEnabled = isEnabled;
                });
              }}
            />
            <Switch
              label="Playlist"
              description="Show runtime statistics on playlist pages."
              isEnabled={store.preferences.playlist.isEnabled}
              onToggle={(isEnabled) => {
                update((draft) => {
                  draft.preferences.playlist.isEnabled = isEnabled;
                });
              }}
            />
          </Card>
        </Section>
      </div>
    </>
  );
}
