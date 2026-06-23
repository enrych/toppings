import React, { useState } from "react";
import PageHeader from "../../../components/layout/PageHeader";
import Section from "../../../components/layout/Section";
import Card from "../../../components/layout/Card";
import Switch from "../../../components/form/Switch";
import Select from "../../../components/form/Select";
import { useStoreUpdater } from "../../../hooks/useStoreUpdater";
import { useToast } from "../../../components/feedback/ToastProvider";
import { useCapabilityCache } from "../../../hooks/useCapabilityCache";
import { setExtensionIcon } from "../../../utils/browser";
import { ThemePreference } from "../../../utils/theme";

export default function General() {
  const { store, update } = useStoreUpdater();
  const toast = useToast();
  const { rescan } = useCapabilityCache();
  const [isRescanning, setIsRescanning] = useState(false);

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
          title="Profile Surfaces"
          description="Choose where profile controls appear. The popup switcher is always available. Keyboard shortcut is configured in Keybindings."
        >
          <Card>
            <Switch
              label="Popup profile switcher"
              description="Show the profile list in the extension popup. Always on — cannot be disabled."
              isEnabled={true}
              onToggle={() => {
                toast.info("The popup switcher is always available.");
              }}
            />
            <Switch
              label="Player gear menu (⚙)"
              description="Adds a Toppings section to the video player's settings menu for quick access to primitives and profiles."
              isEnabled={store.ui?.gearMenuEnabled ?? false}
              onToggle={(isEnabled) => {
                update((draft) => {
                  if (!draft.ui) draft.ui = { theme: "system", gearMenuEnabled: false, nativeSettingsEnabled: false };
                  draft.ui.gearMenuEnabled = isEnabled;
                });
                toast.success(
                  isEnabled
                    ? "Gear menu injection enabled — open the ⚙ menu on a video to try it"
                    : "Gear menu injection disabled",
                );
              }}
            />
            <Switch
              label="YouTube sidebar entry"
              description="Adds a 'Toppings' entry to YouTube's left navigation sidebar with a native-styled settings page."
              isEnabled={store.ui?.nativeSettingsEnabled ?? false}
              onToggle={(isEnabled) => {
                update((draft) => {
                  if (!draft.ui) draft.ui = { theme: "system", gearMenuEnabled: false, nativeSettingsEnabled: false };
                  draft.ui.nativeSettingsEnabled = isEnabled;
                });
                toast.success(
                  isEnabled
                    ? "Sidebar entry enabled — visit YouTube to see it"
                    : "Sidebar entry disabled",
                );
              }}
            />
          </Card>
        </Section>

        <Section
          title="Feature Diagnostics"
          description="If a feature isn't working, use this to force the extension to re-check which features are compatible with your YouTube."
        >
          <Card>
            <div className="tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
              <div className="tw-flex tw-flex-col tw-gap-0.5">
                <span className="tw-text-[15px] tw-font-medium tw-text-fg tw-leading-tight">
                  Re-scan Capabilities
                </span>
                <span className="tw-text-xs tw-text-fg-subtle">
                  Clears the cached feature compatibility check. Features will
                  be re-tested next time you visit a YouTube page.
                </span>
              </div>
              <button
                type="button"
                disabled={isRescanning}
                onClick={async () => {
                  setIsRescanning(true);
                  await rescan();
                  setIsRescanning(false);
                  toast.success("Cache cleared — visit YouTube to re-check features.");
                }}
                className="tw-flex-shrink-0 tw-text-sm tw-font-medium tw-text-fg tw-border tw-border-border-default tw-rounded-lg tw-px-3 tw-py-1.5 hover:tw-bg-surface-hover tw-transition-colors disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
              >
                {isRescanning ? "Clearing…" : "Re-scan"}
              </button>
            </div>
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
