import { useState } from "preact/hooks";
import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Switch from "@/ui/form/Switch";
import Select from "@/ui/form/Select";
import Button from "@/ui/primitives/Button";
import { useToast } from "@/ui/feedback/ToastProvider";
import { useSettings } from "@/kernel/useSettings";
import { useCapabilityCache } from "@/kernel/dom/useCapabilities";
import { appSettings, type ThemePreference } from "@/app/settings";
import { profilesSettings } from "@/features/profiles/settings";

export default function General() {
  const app = useSettings(appSettings);
  const surfaces = useSettings(profilesSettings);
  const toast = useToast();
  const { rescan } = useCapabilityCache();
  const [rescanning, setRescanning] = useState(false);

  return (
    <>
      <PageHeader title="General" description="The master switch, appearance, and where profile controls appear." />

      <div class="tw-flex tw-flex-col tw-gap-8">
        <Section title="Extension">
          <Card>
            <Switch
              label="Enable Toppings"
              description="When off, nothing runs on YouTube."
              isEnabled={app.value.enabled}
              onToggle={(enabled) => {
                app.update({ enabled });
                toast.success(enabled ? "Toppings enabled" : "Toppings disabled");
              }}
            />
          </Card>
        </Section>

        <Section title="Appearance">
          <Card>
            <Select<ThemePreference>
              label="Appearance"
              description="For the popup and this page. YouTube itself is untouched."
              value={app.value.theme}
              options={[
                { value: "system", label: "Use device theme" },
                { value: "dark", label: "Dark theme" },
                { value: "light", label: "Light theme" },
              ]}
              onChange={(theme) => app.update({ theme })}
            />
          </Card>
        </Section>

        <Section title="Profile surfaces" description="Extra places to switch profiles from. The popup always has a switcher.">
          <Card>
            <Switch
              label="Player gear menu"
              description="A Toppings section in the player's settings menu, with quick toggles and profiles."
              isEnabled={surfaces.value.gearMenu}
              onToggle={(gearMenu) => surfaces.update({ gearMenu })}
            />
            <Switch
              label="YouTube sidebar entry"
              description="A Toppings entry in YouTube's left navigation that opens a native-styled settings page."
              isEnabled={surfaces.value.nativeSettings}
              onToggle={(nativeSettings) => surfaces.update({ nativeSettings })}
            />
            <Switch
              label="Audio button in the player"
              description="A headphones button beside the player's controls that turns the Audio profile on and off."
              isEnabled={surfaces.value.audioButton}
              onToggle={(audioButton) => surfaces.update({ audioButton })}
            />
          </Card>
        </Section>

        <Section title="Diagnostics" description="If a feature is not working, clear the compatibility check so it runs again on your next YouTube visit.">
          <Card>
            <div class="tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
              <div class="tw-flex tw-flex-col tw-gap-0.5">
                <label for="rescan-features" class="tw-text-[15px] tw-text-fg tw-leading-tight">Re-scan features</label>
                <span class="tw-text-xs tw-text-fg-subtle">Features are re-checked the next time you open YouTube.</span>
              </div>
              <Button
                id="rescan-features"
                size="sm"
                disabled={rescanning}
                onClick={async () => {
                  setRescanning(true);
                  await rescan();
                  setRescanning(false);
                  toast.success("Cache cleared", "Open YouTube to re-check features.");
                }}
              >
                {rescanning ? "Clearing…" : "Re-scan"}
              </Button>
            </div>
          </Card>
        </Section>
      </div>
    </>
  );
}
