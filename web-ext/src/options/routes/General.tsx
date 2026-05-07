import React from "react";
import PageHeader from "../components/layout/PageHeader";
import Section from "../components/layout/Section";
import Card from "../components/layout/Card";
import Switch from "../components/form/Switch";
import { useStoreUpdater } from "../hooks/useStoreUpdater";
import { useToast } from "../components/feedback/ToastProvider";
import { setExtensionIcon } from "../utils/browser";

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
