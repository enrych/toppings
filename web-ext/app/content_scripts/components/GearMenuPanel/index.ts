// Rides on YouTube's own settings-panel structure, which every class name here
// depends on: .ytp-settings-menu > .ytp-panel > .ytp-panel-menu > .ytp-menuitem,
// where a sub-panel is an extra .ytp-panel sibling toggled by display.
//
// injectGearMenuEntry runs on every gear-menu open, so every mutation below has
// to reuse existing nodes rather than append a second copy.

import {
  getAllProfiles,
  getActiveProfile,
  setActiveProfileId,
} from "../../../../core/profileStore";
import {
  setSidebarVisible,
  setCommentsVisible,
  setEndCardsVisible,
  resetSidebar,
  resetComments,
  resetEndCards,
} from "../../primitives/watch";
import { applyWatchProfile } from "../../primitives/applyProfile";
import type { Profile } from "../../../../data/profiles";

const TPPNG_MENU_ITEM_ID = "tppng-gear-menu-item";
const TPPNG_PANEL_ID = "tppng-gear-panel";

interface PanelState {
  sidebarVisible: boolean;
  commentsVisible: boolean;
  endCardsVisible: boolean;
  profiles: Profile[];
  activeProfileId: string | null;
}

function makeToggleItem(
  label: string,
  checked: boolean,
  onChange: (next: boolean) => void,
): HTMLElement {
  const item = document.createElement("div");
  item.className = "ytp-menuitem";
  item.setAttribute("role", "menuitemcheckbox");
  item.setAttribute("aria-checked", String(checked));
  item.setAttribute("tabindex", "0");

  const labelEl = document.createElement("div");
  labelEl.className = "ytp-menuitem-label";
  labelEl.textContent = label;

  const content = document.createElement("div");
  content.className = "ytp-menuitem-content";

  const toggle = document.createElement("div");
  toggle.className = "ytp-menuitem-toggle-checkbox";

  content.appendChild(toggle);
  item.appendChild(labelEl);
  item.appendChild(content);

  const updateChecked = (val: boolean) => {
    item.setAttribute("aria-checked", String(val));
  };

  const handle = () => {
    const next = item.getAttribute("aria-checked") !== "true";
    updateChecked(next);
    onChange(next);
  };
  item.addEventListener("click", handle);
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handle();
    }
  });

  return item;
}

function makeSectionHeader(text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "ytp-menuitem";
  el.style.cssText =
    "opacity:0.5;pointer-events:none;font-size:11px;padding-top:8px;";
  const label = document.createElement("div");
  label.className = "ytp-menuitem-label";
  label.textContent = text;
  el.appendChild(label);
  return el;
}

function makeProfileItem(
  profile: Profile | null,
  isActive: boolean,
  onSelect: () => void,
): HTMLElement {
  const item = document.createElement("div");
  item.className = "ytp-menuitem";
  item.setAttribute("role", "menuitemradio");
  item.setAttribute("aria-checked", String(isActive));
  item.setAttribute("tabindex", "0");

  const label = document.createElement("div");
  label.className = "ytp-menuitem-label";
  label.textContent = profile ? profile.name : "Default (no profile)";
  item.appendChild(label);

  const content = document.createElement("div");
  content.className = "ytp-menuitem-content";
  item.appendChild(content);

  item.addEventListener("click", onSelect);
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  });

  return item;
}

function buildToppingsPanel(
  panelMenu: HTMLElement,
  state: PanelState,
  onClose: () => void,
): void {
  panelMenu.innerHTML = "";

  panelMenu.appendChild(makeSectionHeader("Watch page"));

  panelMenu.appendChild(
    makeToggleItem("Recommendations sidebar", state.sidebarVisible, (next) => {
      if (next) void setSidebarVisible(true);
      else void setSidebarVisible(false);
    }),
  );

  panelMenu.appendChild(
    makeToggleItem("Comments", state.commentsVisible, (next) => {
      if (next) void setCommentsVisible(true);
      else void setCommentsVisible(false);
    }),
  );

  panelMenu.appendChild(
    makeToggleItem("End cards", state.endCardsVisible, (next) => {
      if (next) void setEndCardsVisible(true);
      else void setEndCardsVisible(false);
    }),
  );

  panelMenu.appendChild(makeSectionHeader("Profile"));

  panelMenu.appendChild(
    makeProfileItem(null, state.activeProfileId === null, async () => {
      await setActiveProfileId(null);
      void applyWatchProfile();
      onClose();
    }),
  );

  for (const profile of state.profiles) {
    const isActive = profile.id === state.activeProfileId;
    panelMenu.appendChild(
      makeProfileItem(profile, isActive, async () => {
        const next = isActive ? null : profile.id;
        await setActiveProfileId(next);
        void applyWatchProfile();
        onClose();
      }),
    );
  }
}

export async function injectGearMenuEntry(
  settingsMenu: HTMLElement,
): Promise<void> {
  const mainPanel = settingsMenu.querySelector(".ytp-panel");
  if (!mainPanel) return;
  const mainPanelMenu = mainPanel.querySelector(".ytp-panel-menu");
  if (!mainPanelMenu) return;

  let tppngMenuItem = settingsMenu.querySelector(
    `#${TPPNG_MENU_ITEM_ID}`,
  ) as HTMLElement | null;

  if (!tppngMenuItem) {
    tppngMenuItem = document.createElement("div");
    tppngMenuItem.id = TPPNG_MENU_ITEM_ID;
    tppngMenuItem.className = "ytp-menuitem";
    tppngMenuItem.setAttribute("role", "menuitem");
    tppngMenuItem.setAttribute("tabindex", "0");
    tppngMenuItem.setAttribute("aria-haspopup", "true");

    const labelEl = document.createElement("div");
    labelEl.className = "ytp-menuitem-label";
    labelEl.textContent = "Toppings";
    tppngMenuItem.appendChild(labelEl);

    const content = document.createElement("div");
    content.className = "ytp-menuitem-content";
    // Inlined rather than imported: matches the right-arrow YouTube draws on its
    // own sub-menu items, and must live in the page's own DOM to inherit its styles.
    content.innerHTML =
      '<svg height="24" viewBox="0 0 24 24" width="24" style="fill:currentColor;opacity:0.6"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
    tppngMenuItem.appendChild(content);

    mainPanelMenu.prepend(tppngMenuItem);
  }

  let tppngPanel = settingsMenu.querySelector(
    `#${TPPNG_PANEL_ID}`,
  ) as HTMLElement | null;

  if (!tppngPanel) {
    tppngPanel = document.createElement("div");
    tppngPanel.id = TPPNG_PANEL_ID;
    tppngPanel.className = "ytp-panel";
    tppngPanel.style.display = "none";

    const header = document.createElement("div");
    header.className = "ytp-panel-header-back";

    const backBtn = document.createElement("button");
    backBtn.className = "ytp-panel-back-button";
    backBtn.setAttribute("aria-label", "Back");
    backBtn.innerHTML =
      '<svg height="24" viewBox="0 0 24 24" width="24" style="fill:currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';

    const title = document.createElement("span");
    title.className = "ytp-panel-title";
    title.textContent = "Toppings";

    header.appendChild(backBtn);
    header.appendChild(title);
    tppngPanel.appendChild(header);

    const panelMenu = document.createElement("div");
    panelMenu.className = "ytp-panel-menu";
    tppngPanel.appendChild(panelMenu);

    settingsMenu.appendChild(tppngPanel);

    backBtn.addEventListener("click", () => {
      tppngPanel!.style.display = "none";
      (mainPanel as HTMLElement).style.display = "";
    });
  }

  const panelMenu = tppngPanel.querySelector(
    ".ytp-panel-menu",
  ) as HTMLElement | null;
  if (!panelMenu) return;

  tppngMenuItem.onclick = async () => {
    const [profiles, activeProfile] = await Promise.all([
      getAllProfiles(),
      getActiveProfile(),
    ]);

    // Read from the DOM rather than the profile store: another profile, a
    // shortcut, or YouTube itself may have changed visibility since it was written.
    const sidebarEl = document.querySelector(
      "#secondary, ytd-watch-next-secondary-results-renderer",
    ) as HTMLElement | null;
    const commentsEl = document.querySelector(
      "ytd-comments#comments, #comments",
    ) as HTMLElement | null;
    const endCardEl = document.querySelector(
      ".ytp-ce-element, .ytp-endscreen-element",
    ) as HTMLElement | null;

    const state: PanelState = {
      sidebarVisible: !sidebarEl || sidebarEl.style.display !== "none",
      commentsVisible: !commentsEl || commentsEl.style.display !== "none",
      endCardsVisible: !endCardEl || endCardEl.style.display !== "none",
      profiles,
      activeProfileId: activeProfile?.id ?? null,
    };

    buildToppingsPanel(panelMenu, state, () => {
      tppngPanel!.style.display = "none";
      (mainPanel as HTMLElement).style.display = "";
    });

    (mainPanel as HTMLElement).style.display = "none";
    tppngPanel!.style.display = "";
  };
}
