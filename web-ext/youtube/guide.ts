import { findTarget, resolveTarget, type PrimitiveResolution } from "@/kernel/dom/resolve";

// The section of the left drawer that holds YouTube's own Settings entry,
// falling back to the drawer's section list.
export function resolveGuideSettingsSection(): Promise<PrimitiveResolution> {
  return resolveTarget(["ytd-guide-section-renderer:has(a[href='/account']) #items", "ytd-guide-renderer #sections", "#guide-inner-content"]);
}

export function settingsMenu(): { menu: HTMLElement; mainPanel: HTMLElement; mainList: HTMLElement } | null {
  const menu = findTarget([".ytp-settings-menu"]).element as HTMLElement | null;
  const mainPanel = menu?.querySelector<HTMLElement>(".ytp-panel");
  const mainList = mainPanel?.querySelector<HTMLElement>(".ytp-panel-menu");
  return menu && mainPanel && mainList ? { menu, mainPanel, mainList } : null;
}
