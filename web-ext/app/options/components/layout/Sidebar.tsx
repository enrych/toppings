import React from "react";
import Icon, { IconName } from "../../../../components/primitives/Icon";
import IconButton from "../../../../components/primitives/IconButton";
import Tooltip from "../../../../components/primitives/Tooltip";
import { useChromeStorageLocal } from "../../../../hooks/useChromeStorageLocal";
import { useStoreUpdater } from "../../../../hooks/useStoreUpdater";
import { BRAND_METADATA } from "@toppings/constants";
import { EXTENSION_LOCAL_STORAGE_KEY } from "../../../../data/extension.data";
import { OPTIONS_ICON_SRC, OPTIONS_PAGES } from "../../data";
import { ThemePreference } from "../../../../utils/theme";
import SidebarNavLink, { SidebarNavItem } from "./SidebarNavLink";
import SidebarThemeToggle from "./SidebarThemeToggle";
import OptionsSearch from "../../search/OptionsSearch";

const NAV_ITEMS: SidebarNavItem[] = OPTIONS_PAGES.map((page) => ({
  to: page.path,
  label: page.label,
  icon: page.icon as IconName,
}));

const COLLAPSE_LABEL_EXPAND = "Expand sidebar";
const COLLAPSE_LABEL_COLLAPSE = "Collapse sidebar";

export default function Sidebar() {
  const version = chrome.runtime.getManifest().version;
  const [collapsed, setCollapsed] = useChromeStorageLocal<boolean>(
    EXTENSION_LOCAL_STORAGE_KEY.OPTIONS_SIDEBAR_COLLAPSED,
    false,
  );
  const { store, update } = useStoreUpdater();
  const themePref: ThemePreference = store.ui?.theme ?? "system";

  const setTheme = (next: ThemePreference) => {
    update((d) => {
      if (!d.ui) d.ui = { theme: "system" };
      d.ui.theme = next;
    });
  };

  return (
    <aside
      className={`tw-flex-shrink-0 tw-bg-surface-2 tw-border-r tw-border-border-default tw-h-screen tw-sticky tw-top-0 tw-flex tw-flex-col tw-transition-[width] tw-duration-200 tw-ease-out ${collapsed ? "tw-w-[60px]" : "tw-w-[220px]"
        }`}
    >
      <div className={`tw-py-6 ${collapsed ? "tw-px-0" : "tw-px-4"}`}>
        {collapsed ? (
          <div className="tw-flex tw-justify-center">
            <img
              src={OPTIONS_ICON_SRC}
              alt={BRAND_METADATA.NAME}
              className="tw-w-7 tw-h-7"
            />
          </div>
        ) : (
          <div className="tw-flex tw-items-center tw-gap-2.5 tw-px-2">
            <img
              src={OPTIONS_ICON_SRC}
              alt=""
              className="tw-w-7 tw-h-7 tw-flex-shrink-0"
            />
            <div className="tw-min-w-0">
              <div
                className="tw-text-[17px] tw-leading-none tw-text-fg tw-truncate"
                style={{ fontWeight: 900, letterSpacing: "-0.03em" }}
              >
                {BRAND_METADATA.NAME}
              </div>
              <div className="tw-font-mono tw-text-[10px] tw-text-fg-subtle tw-mt-1">
                v{version}
              </div>
            </div>
          </div>
        )}
      </div>

      {!collapsed && <OptionsSearch />}

      <nav className="tw-flex-1 tw-overflow-y-auto tw-px-2">
        <ul className="tw-flex tw-flex-col tw-gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              {collapsed ? (
                <Tooltip text={item.label} side="right">
                  <SidebarNavLink item={item} collapsed />
                </Tooltip>
              ) : (
                <SidebarNavLink item={item} collapsed={false} />
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`tw-flex tw-flex-col tw-gap-2 tw-py-4 ${collapsed ? "tw-px-1 tw-items-center" : "tw-px-4"
          }`}
      >
        {!collapsed && (
          <SidebarThemeToggle value={themePref} onChange={setTheme} />
        )}
        <div
          className={`tw-flex ${collapsed ? "tw-justify-center" : "tw-justify-end"}`}
        >
          <Tooltip
            text={collapsed ? COLLAPSE_LABEL_EXPAND : COLLAPSE_LABEL_COLLAPSE}
            side={collapsed ? "right" : "left"}
          >
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={
                collapsed ? COLLAPSE_LABEL_EXPAND : COLLAPSE_LABEL_COLLAPSE
              }
              onClick={() => setCollapsed(!collapsed)}
            >
              <Icon name={collapsed ? "chevron-right" : "chevron-left"} size={14} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
