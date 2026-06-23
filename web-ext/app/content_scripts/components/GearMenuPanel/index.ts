/**
 * GearMenuPanel — injects a "Toppings" entry into YouTube's player gear menu.
 *
 * When the user opens the gear menu (⚙), a "Toppings" item appears at the top
 * of the panel menu. Clicking it navigates into a Toppings sub-panel that lets
 * users control watch-scope primitives (sidebar, comments, end cards) and
 * switch profiles — all without leaving the video.
 *
 * YouTube's settings panel uses a fixed structure:
 *   .ytp-settings-menu > .ytp-panel > .ytp-panel-menu > .ytp-menuitem*
 * Sub-panels are created by injecting additional .ytp-panel siblings inside
 * .ytp-settings-menu. The back button at the top navigates back.
 *
 * All DOM mutations are idempotent — this file can be called on every gear
 * menu open and will reuse existing injected nodes.
 */

import { isNull } from "../../../../utils/validation";
import {
  getAllProfiles,
  getActiveProfile,
  setActiveProfileId,
} from "../../../../utils/storage/profileStore";
import {
  setSidebarVisible,
  setCommentsVisible,
  setEndCardsVisible,
  resetSidebar,
  resetComments,
  resetEndCards,
} from "../../primitives/watch";
import { applyWatchProfile } from "../../primitives/applyProfile";
import type { Profile } from "../../../../data/profiles.data";

// ---------------------------------------------------------------------------
// IDs for injected elements
// ---------------------------------------------------------------------------

const TPPNG_MENU_ITEM_ID = "tppng-gear-menu-item";
const TPPNG_PANEL_ID = "tppng-gear-panel";

// ---------------------------------------------------------------------------
// Primitive state cache (updated when panel opens)
// ---------------------------------------------------------------------------

interface PanelState {
  sidebarVisible: boolean;
  commentsVisible: boolean;
  endCardsVisible: boolean;
  profiles: Profile[];
  activeProfileId: string | null;
}

// ---------------------------------------------------------------------------
// Helper: create a YouTube-styled toggle menu item
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helper: create a YouTube-styled label item (non-interactive section header)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helper: create a profile radio item
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Build / rebuild the Toppings sub-panel content
// ---------------------------------------------------------------------------

function buildToppingsPanel(
  panelMenu: HTMLElement,
  state: PanelState,
  onClose: () => void,
): void {
  panelMenu.innerHTML = "";

  // --- Primitives section ---
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

  // --- Profile section ---
  panelMenu.appendChild(makeSectionHeader("Profile"));

  // "Default" (no profile) option
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

// ---------------------------------------------------------------------------
// Main injection function — call on every gear menu open
// ---------------------------------------------------------------------------

export async function injectGearMenuEntry(
  settingsMenu: HTMLElement,
): Promise<void> {
  // Find the main panel and its menu list.
  const mainPanel = settingsMenu.querySelector(".ytp-panel");
  if (isNull(mainPanel)) return;
  const mainPanelMenu = mainPanel.querySelector(".ytp-panel-menu");
  if (isNull(mainPanelMenu)) return;

  // --- Inject the "Toppings" entry in the main menu (idempotent) ---
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
    // Right-arrow indicator like native sub-menu items.
    content.innerHTML =
      '<svg height="24" viewBox="0 0 24 24" width="24" style="fill:currentColor;opacity:0.6"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
    tppngMenuItem.appendChild(content);

    // Prepend so it appears first in the menu.
    mainPanelMenu.prepend(tppngMenuItem);
  }

  // --- Create or reuse the Toppings sub-panel ---
  let tppngPanel = settingsMenu.querySelector(
    `#${TPPNG_PANEL_ID}`,
  ) as HTMLElement | null;

  if (!tppngPanel) {
    tppngPanel = document.createElement("div");
    tppngPanel.id = TPPNG_PANEL_ID;
    tppngPanel.className = "ytp-panel";
    tppngPanel.style.display = "none";

    // Back button header
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

    // Back button → return to main panel
    backBtn.addEventListener("click", () => {
      tppngPanel!.style.display = "none";
      (mainPanel as HTMLElement).style.display = "";
    });
  }

  const panelMenu = tppngPanel.querySelector(
    ".ytp-panel-menu",
  ) as HTMLElement | null;
  if (isNull(panelMenu)) return;

  // --- Wire the entry click to show Toppings panel ---
  tppngMenuItem.onclick = async () => {
    // Read current state.
    const [profiles, activeProfile] = await Promise.all([
      getAllProfiles(),
      getActiveProfile(),
    ]);

    // Snapshot visibility state from DOM (simplest source of truth).
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
      // Close: hide sub-panel, show main panel
      tppngPanel!.style.display = "none";
      (mainPanel as HTMLElement).style.display = "";
    });

    // Show sub-panel.
    (mainPanel as HTMLElement).style.display = "none";
    tppngPanel!.style.display = "";
  };
}
