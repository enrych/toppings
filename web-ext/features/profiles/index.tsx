import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mountInline } from "@/kernel/dom/mount";
import { runPrimitives, type PrimitiveRun } from "@/kernel/primitives";
import { PRIMITIVES } from "@/youtube/primitives";
import { resolveRightControls } from "@/youtube/player";
import { showToast } from "@/kernel/dom/toast";
import { AudioButton, audioButtonHost, setAudioButtonState } from "./AudioButton";
import { hookGearMenu, type GearMenu } from "./gearMenu";
import { profileToggleKeys, profilesKeys } from "./keys";
import { BUILT_IN_PRESETS, PRESET_AUDIO } from "./profiles";
import { profilesSettings } from "./settings";
import { getActiveProfile, getAllProfiles, getCustomProfiles, setActiveProfileId, subscribeProfiles, toggleProfile } from "./store";

export const profiles: Feature = {
  id: "profiles",
  routes: ["watch", "playlist", "shorts", "home", "search", "other"],
  async mount({ route }) {
    const settings = await profilesSettings.get();

    let run: PrimitiveRun | undefined;
    let stopped = false;
    let audio: AudioToggle | undefined;
    let audioActive = false;
    const start = async () => {
      const active = await getActiveProfile();
      if (stopped) return;
      run?.stop();
      run = runPrimitives(PRIMITIVES, { ...active?.primitives }, route.name);
      audioActive = active?.id === PRESET_AUDIO.id;
      audio?.show(audioActive);
    };
    await start();

    let unbindToggles = () => {};
    const bindToggles = async () => {
      const all = await getAllProfiles();
      if (stopped) return;
      unbindToggles();
      unbindToggles = bindKeys(profileToggleKeys(all), Object.fromEntries(all.map((profile) => [profile.id, () => void switchProfile(profile.id)])));
    };
    await bindToggles();
    let gear: GearMenu | undefined;
    const unsubscribe = subscribeProfiles(() => {
      void start();
      void bindToggles();
      gear?.refresh();
    });


    const unbindKeys = bindKeys(profilesKeys, { cycle: () => void cycleProfile() });
    // Not awaited: the control bar can render late, and nothing else waits on it.
    if (route.name === "watch" && settings.audioButton) {
      void mountAudioToggle().then((toggle) => {
        if (stopped) return toggle?.unmount();
        audio = toggle;
        audio?.show(audioActive);
      });
    }
    gear = route.name === "watch" && settings.gearMenu ? await hookGearMenu() : undefined;

    return () => {
      stopped = true;
      unsubscribe();
      unbindKeys();
      unbindToggles();
      audio?.unmount();
      gear?.unmount();
      run?.stop();
    };
  },
};

async function switchProfile(id: string): Promise<void> {
  const now = await toggleProfile(id);
  showToast(`Profile: ${now?.name ?? "Default"}`);
}

interface AudioToggle {
  show(active: boolean): void;
  unmount(): void;
}

async function mountAudioToggle(): Promise<AudioToggle | undefined> {
  const controls = await resolveRightControls();
  if (!controls.resolved) return;
  const host = audioButtonHost();
  const button = mountInline(host, controls.element, <AudioButton active={false} />, "prepend");
  host.addEventListener("click", () => void switchProfile(PRESET_AUDIO.id));
  return {
    show(active) {
      setAudioButtonState(host, active);
      button.update(<AudioButton active={active} />);
    },
    unmount: button.unmount,
  };
}

async function cycleProfile(): Promise<void> {
  const cycle: Array<{ id: string | null; name: string }> = [
    { id: null, name: "Default" },
    ...BUILT_IN_PRESETS,
    ...(await getCustomProfiles()),
  ];
  const current = (await getActiveProfile())?.id ?? null;
  const next = cycle[(cycle.findIndex((p) => p.id === current) + 1) % cycle.length];
  await setActiveProfileId(next.id);
  showToast(`Profile: ${next.name}`);
}
