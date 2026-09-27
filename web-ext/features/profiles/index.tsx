import { render } from "preact";
import type { Feature } from "@/kernel/features";
import { bindKeys } from "@/kernel/keys";
import { mount } from "@/kernel/dom/mount";
import { runPrimitives, type PrimitiveRun } from "@/kernel/primitives";
import type { RouteName } from "@/youtube/route";
import { PRIMITIVES, watchComments, watchEndCards, watchSidebar, type Visibility } from "@/youtube/primitives";
import { resolveSettingsButton } from "@/youtube/player";
import { resolveGuideSettingsSection, settingsMenu } from "@/youtube/guide";
import { showToast } from "@/kernel/dom/toast";
import { GearEntry, GearPanel, type QuickToggle } from "./GearPanel";
import { GuideLink, NativeSettings } from "./NativeSettings";
import { profilesKeys } from "./keys";
import { openOptions } from "./messages";
import { BUILT_IN_PRESETS, type Profile } from "./profiles";
import { profilesSettings } from "./settings";
import { getActiveProfile, getAllProfiles, getCustomProfiles, setActiveProfileId, subscribeProfiles } from "./store";

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
    const start = async () => {
      const active = await getActiveProfile();
      if (stopped) return;
      run?.stop();
      run = runPrimitives(PRIMITIVES, { ...active?.primitives }, route.name);
    };
    await start();
    const unsubscribe = subscribeProfiles(() => void start());

    const page: PageControls = {
      route: route.name,
      toggles: () =>
        route.name === "watch"
          ? QUICK_TOGGLES.map((p) => ({ id: p.id, label: p.label, visible: (run?.get(p.id) as Visibility | undefined)?.visible ?? true }))
          : [],
      setVisible: (id, visible) => run?.set(id, { visible }),
    };

    const unbindKeys = bindKeys(profilesKeys, { cycle: () => void cycleProfile() });
    const gear = route.name === "watch" && settings.gearMenu ? await hookGearMenu(page) : undefined;
    const native = settings.nativeSettings ? await mountNativeSettings(page) : undefined;

    return () => {
      stopped = true;
      unsubscribe();
      unbindKeys();
      gear?.();
      native?.();
      run?.stop();
    };
  },
};

interface PageControls {
  route: RouteName;
  toggles(): QuickToggle[];
  setVisible(id: string, visible: boolean): void;
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

async function mountNativeSettings(page: PageControls) {
  const guide = await resolveGuideSettingsSection();
  if (!guide.resolved) return;

  let open = false;
  let all: Profile[] = [];
  let activeId: string | null = null;
  const overlay = mount("tppng-native-settings", document.body, view());
  const link = mount("tppng-guide-link", guide.element, <GuideLink onOpen={() => void show()} />);
  // The guide is a Polymer repeat that drops foreign children when it
  // re-renders, so the link is put back whenever that happens.
  const keepLink = new MutationObserver(() => {
    if (!link.host.isConnected) guide.element.append(link.host);
  });
  keepLink.observe(guide.element, { childList: true });

  function view() {
    return (
      <NativeSettings
        open={open}
        profiles={all}
        activeProfileId={activeId}
        toggles={page.toggles()}
        onPick={async (id) => {
          await setActiveProfileId(id);
          await refresh();
        }}
        onToggle={(id, visible) => {
          page.setVisible(id, visible);
          overlay.update(view());
        }}
        onOpenOptions={() => void openOptions.send()}
        onClose={() => {
          open = false;
          overlay.update(view());
        }}
      />
    );
  }
  async function refresh() {
    [all, activeId] = [await getAllProfiles(), (await getActiveProfile())?.id ?? null];
    overlay.update(view());
  }
  async function show() {
    open = true;
    await refresh();
  }

  return () => {
    keepLink.disconnect();
    overlay.unmount();
    link.unmount();
  };
}
