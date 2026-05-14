import React from "react";
import { NavLink } from "react-router-dom";
import Icon, { IconName } from "../../../shared/components/primitives/Icon";
import IconButton from "../../../shared/components/primitives/IconButton";
import Tooltip from "../../../shared/components/primitives/Tooltip";
import { useChromeStorageLocal } from "../../../shared/hooks/useChromeStorageLocal";
import {
  BROWSER_TARGET,
  CHROME_STORAGE_LOCAL_KEY,
  EXTERNAL_URL,
  LINK_REL,
  OPTIONS_ASSET_PATH,
  OPTIONS_DOCUMENT_PATH,
  OPTIONS_SIDEBAR_NAV_ITEM,
  OPTIONS_SIDEBAR_UI,
} from "toppings-constants";

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

export default function Sidebar() {
  const version = chrome.runtime.getManifest().version;
  const [collapsed, setCollapsed] = useChromeStorageLocal<boolean>(
    CHROME_STORAGE_LOCAL_KEY.OPTIONS_SIDEBAR_COLLAPSED,
    false,
  );

  return (
    <aside
      className={`tw-flex-shrink-0 tw-bg-bg tw-border-r tw-border-border-default tw-h-screen tw-sticky tw-top-0 tw-flex tw-flex-col tw-transition-[width] tw-duration-200 tw-ease-out ${
        collapsed ? "tw-w-[60px]" : "tw-w-60"
      }`}
    >
      <div
        className={`tw-py-5 tw-border-b tw-border-border-default ${collapsed ? "tw-px-0" : "tw-px-5"}`}
      >
        {collapsed ? (
          <div className="tw-flex tw-justify-center">
            <img
              src={OPTIONS_ASSET_PATH.ICON_48}
              alt={OPTIONS_SIDEBAR_UI.ALT_LOGO_COLLAPSED}
              className="tw-w-8 tw-h-8"
            />
          </div>
        ) : (
          <div className="tw-flex tw-items-center tw-gap-2.5">
            <img
              src={OPTIONS_ASSET_PATH.ICON_48}
              alt={OPTIONS_SIDEBAR_UI.ALT_LOGO}
              className="tw-w-8 tw-h-8 tw-flex-shrink-0"
            />
            <div className="tw-min-w-0">
              <div className="tw-flex tw-items-baseline tw-gap-2">
                <h1 className="tw-text-lg tw-font-bold tw-text-fg tw-truncate">
                  {OPTIONS_SIDEBAR_UI.BRAND_NAME}
                </h1>
                <span className="tw-text-[10px] tw-text-fg-subtle tw-font-mono">
                  v{version}
                </span>
              </div>
              <p className="tw-text-xs tw-text-fg-subtle tw-mt-0.5 tw-truncate">
                {OPTIONS_SIDEBAR_UI.TAGLINE}
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className="tw-flex-1 tw-overflow-y-auto tw-py-3 tw-px-2">
        {!collapsed && (
          <div className="tw-text-[11px] tw-uppercase tw-tracking-wider tw-text-fg-subtle tw-font-semibold tw-px-3 tw-py-1 tw-mb-1">
            {OPTIONS_SIDEBAR_UI.SETTINGS_SECTION_LABEL}
          </div>
        )}
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

      <div
        className={`tw-py-3 tw-border-t tw-border-border-default tw-flex ${
          collapsed
            ? "tw-flex-col tw-items-center tw-gap-2 tw-px-1"
            : "tw-items-center tw-justify-between tw-px-5"
        }`}
      >
        {collapsed ? (
          <>
            <Tooltip text={OPTIONS_SIDEBAR_UI.TOOLTIP_EXPAND} side="right">
              <IconButton
                size="sm"
                variant="ghost"
                aria-label={OPTIONS_SIDEBAR_UI.ARIA_EXPAND}
                onClick={() => setCollapsed(false)}
              >
                <Icon name="chevron-right" size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip text={OPTIONS_SIDEBAR_UI.TOOLTIP_GITHUB} side="right">
              <a
                href={EXTERNAL_URL.GITHUB_REPO}
                target={BROWSER_TARGET.BLANK}
                rel={LINK_REL.NO_REFERRER}
                aria-label={OPTIONS_SIDEBAR_UI.ARIA_GITHUB_REPO}
                className="tw-w-7 tw-h-7 tw-inline-flex tw-items-center tw-justify-center tw-text-fg-muted hover:tw-text-fg tw-rounded-md hover:tw-bg-surface-hover tw-transition-colors"
              >
                <Icon name="external" size={14} />
              </a>
            </Tooltip>
          </>
        ) : (
          <>
            <a
              href={EXTERNAL_URL.GITHUB_REPO}
              target={BROWSER_TARGET.BLANK}
              rel={LINK_REL.NO_REFERRER}
              className="tw-text-xs tw-text-fg-muted hover:tw-text-fg tw-transition-colors tw-inline-flex tw-items-center tw-gap-1"
            >
              {OPTIONS_SIDEBAR_UI.FOOTER_GITHUB_LABEL}
              <Icon name="external" size={11} />
            </a>
            <Tooltip text={OPTIONS_SIDEBAR_UI.TOOLTIP_COLLAPSE} side="left">
              <IconButton
                size="sm"
                variant="ghost"
                aria-label={OPTIONS_SIDEBAR_UI.ARIA_COLLAPSE}
                onClick={() => setCollapsed(true)}
              >
                <Icon name="chevron-left" size={14} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </div>
    </aside>
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
            : "tw-gap-3 tw-px-3 tw-py-2"
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
            className={`tw-flex-shrink-0 ${isActive ? "tw-text-accent" : "tw-text-fg-subtle"}`}
          >
            <Icon name={item.icon} size={collapsed ? 18 : 16} />
          </span>
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}
