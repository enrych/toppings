import { render } from "preact";
import { playerOf, resolveSettingsButton, settingsMenu } from "@/youtube/player";
import type { Profile } from "./profiles";
import { getActiveProfile, getAllProfiles, setActiveProfileId } from "./store";

const ROW_ID = "tppng-profile-row";
const PANEL_ID = "tppng-profile-panel";
// Room left for the player's control bar below an open menu.
const CONTROLS_CLEARANCE = 120;
const LAYERS_ICON = "M12 16.54l-7.37-5.73L3 12.07l9 7 9-7-1.63-1.27zM12 14l7.36-5.73L21 7l-9-7-9 7 1.63 1.27L12 14zm0-11.47L17.74 7 12 11.47 6.26 7 12 2.53z";

export interface GearMenu {
  refresh(): void;
  unmount(): void;
}

// A Profile row in YouTube's settings menu, built from YouTube's own markup:
// icon, label, and the current value, with YouTube drawing the chevron for
// a row that opens a submenu.
function ProfileRow({ name }: { name: string }) {
  return (
    <>
      <div class="ytp-menuitem-icon">
        <svg height="24" viewBox="0 0 24 24" width="24">
          <path d={LAYERS_ICON} fill="#fff" />
        </svg>
      </div>
      <div class="ytp-menuitem-label">Profile</div>
      <div class="ytp-menuitem-content">{name}</div>
    </>
  );
}

// The submenu, shaped like YouTube's Quality list: its header with a back
// button, then radio rows YouTube draws the checkmark on. Clicks stop here:
// YouTube handles its menu's classes itself, and since it never opened this
// submenu, its "back" would close the whole menu.
function ProfilePanel({ profiles, activeId, onPick, onBack }: { profiles: readonly Profile[]; activeId: string | null; onPick: (id: string | null) => void; onBack: () => void }) {
  const option = (id: string | null, name: string) => (
    <div
      class="ytp-menuitem"
      role="menuitemradio"
      aria-checked={activeId === id}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onPick(id);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onPick(id);
      }}
    >
      <div class="ytp-menuitem-label">{name}</div>
    </div>
  );
  return (
    <>
      <div class="ytp-panel-header">
        <div class="ytp-panel-back-button-container">
          <button
            class="ytp-button ytp-panel-back-button"
            aria-label="Back to previous menu"
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
          />
        </div>
        <span class="ytp-panel-title" role="heading" aria-level={2}>
          Profile
        </span>
      </div>
      <div class="ytp-panel-menu" role="menu">
        {option(null, "Default")}
        {profiles.map((profile) => option(profile.id, profile.name))}
      </div>
    </>
  );
}

// YouTube builds the menu on first open and may rebuild it, so the row is
// (re)attached on each click of the gear button.
export async function hookGearMenu(): Promise<GearMenu | undefined> {
  const button = await resolveSettingsButton();
  if (!button.resolved) return;
  const gear = button.element as HTMLElement;
  let closeSubmenu: (() => void) | null = null;
  let watchedMenu: HTMLElement | null = null;

  // YouTube reopens its menu on whichever panel is in it, so the main one goes
  // back as soon as the menu hides.
  const hidden = new MutationObserver(() => {
    if (watchedMenu && getComputedStyle(watchedMenu).display === "none") closeSubmenu?.();
  });

  const drawRow = async () => {
    const parts = settingsMenu(gear);
    if (!parts) return;
    if (watchedMenu !== parts.menu) {
      hidden.disconnect();
      hidden.observe(parts.menu, { attributes: true, attributeFilter: ["style", "class", "aria-hidden"] });
      watchedMenu = parts.menu;
    }
    let row = parts.mainList.querySelector<HTMLElement>(`#${ROW_ID}`);
    if (!row) {
      row = document.createElement("div");
      row.id = ROW_ID;
      row.className = "ytp-menuitem";
      row.setAttribute("role", "menuitem");
      row.setAttribute("aria-haspopup", "true");
      row.tabIndex = 0;
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        void openSubmenu();
      });
      row.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        void openSubmenu();
      });
      parts.mainList.append(row);
      render(<ProfileRow name={(await getActiveProfile())?.name ?? "Default"} />, row);
      growToFit(parts.menu, parts.mainPanel, parts.mainList, gear);
      return;
    }
    render(<ProfileRow name={(await getActiveProfile())?.name ?? "Default"} />, row);
  };

  const openSubmenu = async () => {
    const parts = settingsMenu(gear);
    if (!parts || closeSubmenu) return;
    const { menu, mainPanel } = parts;
    const [profiles, active] = await Promise.all([getAllProfiles(), getActiveProfile()]);
    const saved = { menu: menu.getAttribute("style"), panel: mainPanel.getAttribute("style"), list: parts.mainList.getAttribute("style") };

    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.className = "ytp-panel";
    const close = () => {
      closeSubmenu = null;
      render(null, panel);
      panel.replaceWith(mainPanel);
      restoreStyle(menu, saved.menu);
      restoreStyle(mainPanel, saved.panel);
      restoreStyle(parts.mainList, saved.list);
    };
    const pick = async (id: string | null) => {
      await setActiveProfileId(id);
      close();
      await drawRow();
      (mainPanel.querySelector<HTMLElement>(`#${ROW_ID}`) ?? mainPanel).focus();
    };
    render(<ProfilePanel profiles={profiles} activeId={active?.id ?? null} onPick={(id) => void pick(id)} onBack={close} />, panel);
    mainPanel.replaceWith(panel);
    fitMenu(menu, panel, gear);
    closeSubmenu = close;
    panel.querySelector<HTMLElement>("[aria-checked=true]")?.focus();
  };

  const onGear = () => setTimeout(() => void drawRow(), 0);
  gear.addEventListener("click", onGear);

  return {
    refresh: () => void drawRow(),
    unmount() {
      gear.removeEventListener("click", onGear);
      hidden.disconnect();
      closeSubmenu?.();
      document.getElementById(ROW_ID)?.remove();
    },
  };
}

// YouTube sized the open menu before the row went in, so it would sit cut off
// below the last row; the menu grows by what the row added, up to the room
// the player leaves, as YouTube itself does when it opens with the row there.
function growToFit(menu: HTMLElement, panel: HTMLElement, list: HTMLElement, gear: HTMLElement): void {
  if (!list.style.height) return;
  // The list is not clipped at its own height; the panel around it is.
  const missing = list.scrollHeight - parseFloat(list.style.height);
  if (missing <= 0) return;
  const player = playerOf(gear) as HTMLElement;
  const room = (player.clientHeight || window.innerHeight) - CONTROLS_CLEARANCE - menu.offsetHeight;
  const extra = Math.min(missing, Math.max(room, 0));
  for (const element of [list, panel, menu]) {
    if (element.style.height) element.style.height = `${parseFloat(element.style.height) + extra}px`;
  }
}

function restoreStyle(element: HTMLElement, style: string | null): void {
  if (style === null) element.removeAttribute("style");
  else element.setAttribute("style", style);
}

// YouTube sizes the menu to each panel with inline styles when it swaps
// panels itself; a panel swapped in by hand has to do the same.
function fitMenu(menu: HTMLElement, panel: HTMLElement, gear: HTMLElement): void {
  const list = panel.querySelector<HTMLElement>(".ytp-panel-menu")!;
  const header = panel.querySelector<HTMLElement>(".ytp-panel-header")!;
  for (const element of [menu, panel, list]) {
    element.style.width = "";
    element.style.height = "";
  }
  menu.style.width = "max-content";
  const width = Math.ceil(panel.getBoundingClientRect().width);
  const player = playerOf(gear) as HTMLElement;
  const room = (player.clientHeight || window.innerHeight) - CONTROLS_CLEARANCE - header.offsetHeight;
  const listHeight = Math.min(list.scrollHeight, Math.max(room, 0));
  list.style.height = `${listHeight}px`;
  const height = header.offsetHeight + listHeight;
  for (const element of [menu, panel]) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  }
}
