import React from "react";
import { NavLink } from "react-router-dom";
import Icon, { IconName } from "../../../shared/components/primitives/Icon";
import IconButton from "../../../shared/components/primitives/IconButton";
import Tooltip from "../../../shared/components/primitives/Tooltip";
import { useChromeStorageLocal } from "../../../shared/hooks/useChromeStorageLocal";
import { useStoreUpdater } from "../../../shared/hooks/useStoreUpdater";
import {
  CHROME_STORAGE_LOCAL_KEY,
  OPTIONS_ASSET_PATH,
  OPTIONS_DOCUMENT_PATH,
  OPTIONS_SIDEBAR_NAV_ITEM,
  OPTIONS_SIDEBAR_UI,
} from "toppings-constants";
import { ThemePreference } from "../../../shared/utils/theme";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = OPTIONS_SIDEBAR_NAV_ITEM.map((item) => ({
  to: item.documentPath,
  label: item.label,
  icon: item.icon as IconName,
}));

/**
 * Sidebar — implements the Claude Design handoff for the extension options
 * page sidebar.
 *
 *  - 220px wide brand column on a sunken surface (`bg-surface-2`).
 *  - Brand wordmark in Inter 900 with version label underneath.
 *  - Stroke-icon vertical nav with active state.
 *  - Theme toggle pill at the bottom: System / Dark / Light, with the
 *    active option lifted onto a `bg-surface` chip. Reads/writes from
 *    `store.ui.theme` via `useStoreUpdater`.
 *  - The legacy collapse-to-60px behavior is preserved as a one-button
 *    toggle, since it's a power-user nicety; the design doesn't show it
 *    but it doesn't conflict either (theme pill hides when collapsed).
 */
export default function Sidebar() {
  const version = chrome.runtime.getManifest().version;
  const [collapsed, setCollapsed] = useChromeStorageLocal<boolean>(
    CHROME_STORAGE_LOCAL_KEY.OPTIONS_SIDEBAR_COLLAPSED,
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
      className={`tw-flex-shrink-0 tw-bg-surface-2 tw-border-r tw-border-border-default tw-h-screen tw-sticky tw-top-0 tw-flex tw-flex-col tw-transition-[width] tw-duration-200 tw-ease-out ${
        collapsed ? "tw-w-[60px]" : "tw-w-[220px]"
      }`}
    >
      {/* Brand */}
      <div
        className={`tw-py-6 ${collapsed ? "tw-px-0" : "tw-px-4"}`}
      >
        {collapsed ? (
          <div className="tw-flex tw-justify-center">
            <img
              src={OPTIONS_ASSET_PATH.ICON_48}
              alt={OPTIONS_SIDEBAR_UI.ALT_LOGO_COLLAPSED}
              className="tw-w-7 tw-h-7"
            />
          </div>
        ) : (
          <div className="tw-flex tw-items-center tw-gap-2.5 tw-px-2">
            <img
              src={OPTIONS_ASSET_PATH.ICON_48}
              alt={OPTIONS_SIDEBAR_UI.ALT_LOGO}
              className="tw-w-7 tw-h-7 tw-flex-shrink-0"
            />
            <div className="tw-min-w-0">
              <div
                className="tw-text-[17px] tw-leading-none tw-text-fg tw-truncate"
                style={{ fontWeight: 900, letterSpacing: "-0.03em" }}
              >
                {OPTIONS_SIDEBAR_UI.BRAND_NAME}
              </div>
              <div className="tw-font-mono tw-text-[10px] tw-text-fg-subtle tw-mt-1">
                v{version}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="tw-flex-1 tw-overflow-y-auto tw-px-2">
        <ul className="tw-flex tw-flex-col tw-gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              {collapsed ? (
                <Tooltip text={item.label} side="right">
                  <NavItemLink item={item} collapsed />
                </Tooltip>
              ) : (
                <NavItemLink item={item} collapsed={false} />
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer area — theme pill + collapse toggle */}
      <div
        className={`tw-flex tw-flex-col tw-gap-2 tw-py-4 ${
          collapsed ? "tw-px-1 tw-items-center" : "tw-px-4"
        }`}
      >
        {!collapsed && (
          <ThemeTogglePill value={themePref} onChange={setTheme} />
        )}
        <div
          className={`tw-flex ${collapsed ? "tw-justify-center" : "tw-justify-end"}`}
        >
          <Tooltip
            text={
              collapsed
                ? OPTIONS_SIDEBAR_UI.TOOLTIP_EXPAND
                : OPTIONS_SIDEBAR_UI.TOOLTIP_COLLAPSE
            }
            side={collapsed ? "right" : "left"}
          >
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={
                collapsed
                  ? OPTIONS_SIDEBAR_UI.ARIA_EXPAND
                  : OPTIONS_SIDEBAR_UI.ARIA_COLLAPSE
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

/**
 * Compact 3-button pill (System / Dark / Light) matching the design's
 * theme-toggle treatment. Active button gets a lifted `bg-surface` chip.
 */
function ThemeTogglePill({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (next: ThemePreference) => void;
}) {
  const options: { id: ThemePreference; label: string; icon: IconName }[] = [
    { id: "system", label: "System", icon: "panel-left" },
    { id: "dark", label: "Dark", icon: "audio" },
    { id: "light", label: "Light", icon: "settings" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="tw-inline-flex tw-w-full tw-p-0.5 tw-rounded-full tw-border tw-border-border-default"
      style={{ background: "var(--color-bg)" }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={`tw-flex-1 tw-inline-flex tw-items-center tw-justify-center tw-gap-1 tw-px-2 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-full tw-cursor-pointer tw-transition-colors tw-duration-150 ${
              active
                ? "tw-bg-surface tw-text-fg"
                : "tw-text-fg-muted hover:tw-text-fg"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface NavItemLinkProps {
  item: NavItem;
  collapsed: boolean;
}

function NavItemLink({ item, collapsed }: NavItemLinkProps) {
  return (
    <NavLink
      to={item.to}
      end={item.to === OPTIONS_DOCUMENT_PATH.HOME}
      className={({ isActive }) =>
        `tw-flex tw-items-center tw-rounded-md tw-transition-colors tw-text-sm ${
          collapsed
            ? "tw-justify-center tw-w-10 tw-h-10 tw-mx-auto"
            : "tw-gap-2.5 tw-px-2.5 tw-py-2"
        } ${
          isActive
            ? "tw-bg-surface-hover tw-text-fg"
            : "tw-text-fg-muted hover:tw-bg-surface-hover hover:tw-text-fg"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className="tw-flex-shrink-0"
            style={{
              color: isActive ? "var(--color-fg)" : "var(--color-fg-muted)",
            }}
          >
            <Icon name={item.icon} size={collapsed ? 18 : 16} />
          </span>
          {!collapsed && <span className="tw-text-[13px]">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}
