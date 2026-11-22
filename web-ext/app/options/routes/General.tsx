import PageHeader from "@/ui/layout/PageHeader";
import Section from "@/ui/layout/Section";
import Card from "@/ui/layout/Card";
import Switch from "@/ui/form/Switch";
import { useToast } from "@/ui/feedback/ToastProvider";
import { useSettings } from "@/kernel/useSettings";
import { appSettings } from "@/kernel/appSettings";
import { profilesSettings } from "@/features/profiles/settings";

export default function General() {
  const app = useSettings(appSettings);
  const surfaces = useSettings(profilesSettings);
  const toast = useToast();

  return (
    <>
      <PageHeader title="General" description="The master switch, and where profile controls appear." />

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

        <Section title="Profile surfaces" description="Extra places to switch profiles from. The popup always has a switcher.">
          <Card>
            <Switch
              label="Player gear menu"
              description="A Profile row in the player's settings menu, for switching profiles without leaving the video."
              isEnabled={surfaces.value.gearMenu}
              onToggle={(gearMenu) => surfaces.update({ gearMenu })}
            />
            <Switch
              label="Audio button in the player"
              description="A headphones button beside the player's controls that turns the Audio profile on and off."
              isEnabled={surfaces.value.audioButton}
              onToggle={(audioButton) => surfaces.update({ audioButton })}
            />
          </Card>
        </Section>
      </div>
    </>
  );
}
