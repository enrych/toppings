import { render } from "preact";
import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mountInline } from "@/kernel/dom/mount";
import { runPrimitives, type PrimitiveRun } from "@/kernel/primitives";
import type { RouteName } from "@/youtube/route";
import { PRIMITIVES, watchComments, watchEndCards, watchSidebar, type Visibility } from "@/youtube/primitives";
import { resolveRightControls, resolveSettingsButton, settingsMenu } from "@/youtube/player";
import { showToast } from "@/kernel/dom/toast";
import { GearEntry, GearPanel, type QuickToggle } from "./GearPanel";
import { AudioButton, audioButtonHost, setAudioButtonState } from "./AudioButton";
import { profileToggleKeys, profilesKeys } from "./keys";
import { BUILT_IN_PRESETS, PRESET_AUDIO, type Profile } from "./profiles";
import { profilesSettings } from "./settings";
import { getActiveProfile, getAllProfiles, getCustomProfiles, setActiveProfileId, subscribeProfiles, toggleProfile } from "./store";

const QUICK_TOGGLES = [watchSidebar, watchComments, watchEndCards];
const GEAR_ENTRY_ID = "tppng-gear-entry";
const GEAR_PANEL_ID = "tppng-gear-panel";

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
    const unsubscribe = subscribeProfiles(() => {
      void start();
      void bindToggles();
    });

    const page: PageControls = {
      route: route.name,
      toggles: () =>
        route.name === "watch"
          ? QUICK_TOGGLES.map((p) => ({ id: p.id, label: p.label, visible: (run?.get(p.id) as Visibility | undefined)?.visible ?? true }))
          : [],
      setVisible: (id, visible) => run?.set(id, { visible }),
    };

    const unbindKeys = bindKeys(profilesKeys, { cycle: () => void cycleProfile() });
    // Not awaited: the control bar can render late, and nothing else waits on it.
    if (route.name === "watch" && settings.audioButton) {
      void mountAudioToggle().then((toggle) => {
        if (stopped) return toggle?.unmount();
        audio = toggle;
        audio?.show(audioActive);
      });
    }
    const gear = route.name === "watch" && settings.gearMenu ? await hookGearMenu(page) : undefined;

    return () => {
      stopped = true;
      unsubscribe();
      unbindKeys();
      unbindToggles();
      audio?.unmount();
      gear?.();
      run?.stop();
    };
  },
};

interface PageControls {
  route: RouteName;
  toggles(): QuickToggle[];
  setVisible(id: string, visible: boolean): void;
}

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

// YouTube builds the settings menu on first open and may rebuild it, so the
// entry is (re)attached on every click of the gear button.
async function hookGearMenu(page: PageControls) {
  const button = await resolveSettingsButton();
  if (!button.resolved) return;

  const onOpen = () =>
    setTimeout(() => {
      const parts = settingsMenu(button.element);
      if (!parts) return;
      const { menu, mainPanel, mainList } = parts;

      let panel = menu.querySelector<HTMLElement>(`#${GEAR_PANEL_ID}`);
      if (!panel) {
        panel = document.createElement("div");
        panel.id = GEAR_PANEL_ID;
        panel.className = "ytp-panel";
        menu.append(panel);
      }
      // YouTube reopens its menu on whichever panel was showing, so a menu
      // closed from ours would come back without YouTube's own settings.
      panel.hidden = true;
      mainPanel.style.display = "";
      const back = () => {
        panel!.hidden = true;
        mainPanel.style.display = "";
      };
      const draw = async (all: Profile[]) => {
        const active = (await getActiveProfile())?.id ?? null;
        render(
          <GearPanel
            toggles={page.toggles()}
            profiles={all}
            activeProfileId={active}
            onToggle={(id, visible) => {
              page.setVisible(id, visible);
              void draw(all);
            }}
            onPick={async (id) => {
              await setActiveProfileId(id);
              back();
            }}
            onBack={back}
          />,
          panel!,
        );
      };

      let entry = mainList.querySelector<HTMLElement>(`#${GEAR_ENTRY_ID}`);
      if (!entry) {
        entry = document.createElement("div");
        entry.id = GEAR_ENTRY_ID;
        entry.className = "ytp-menuitem";
        entry.setAttribute("role", "menuitem");
        entry.setAttribute("aria-haspopup", "true");
        entry.tabIndex = 0;
        mainList.prepend(entry);
      }
      render(<GearEntry />, entry);
      entry.onclick = async () => {
        await draw(await getAllProfiles());
        mainPanel.style.display = "none";
        panel!.hidden = false;
      };
    }, 0);

  button.element.addEventListener("click", onOpen);
  return () => {
    button.element.removeEventListener("click", onOpen);
    document.getElementById(GEAR_ENTRY_ID)?.remove();
    document.getElementById(GEAR_PANEL_ID)?.remove();
    const parts = settingsMenu(button.element);
    if (parts) parts.mainPanel.style.display = "";
  };
}
