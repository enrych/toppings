import React from "react";
import { NavLink } from "react-router-dom";
import Icon, { IconName } from "../../../shared/components/primitives/Icon";
import IconButton from "../../../shared/components/primitives/IconButton";
import Tooltip from "../../../shared/components/primitives/Tooltip";
import { useChromeStorageLocal } from "../../../shared/hooks/useChromeStorageLocal";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "General", icon: "general" },
  { to: "/watch", label: "Watch", icon: "watch" },
  { to: "/audio-mode", label: "Audio Mode", icon: "audio" },
  { to: "/shorts", label: "Shorts", icon: "shorts" },
  { to: "/playlist", label: "Playlist", icon: "playlist" },
  { to: "/keybindings", label: "Shortcuts", icon: "keyboard" },
];

const COLLAPSED_KEY = "options_sidebar_collapsed";

export default function Sidebar() {
  const version = chrome.runtime.getManifest().version;
  const [collapsed, setCollapsed] = useChromeStorageLocal<boolean>(
    COLLAPSED_KEY,
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
              src="/assets/icons/icon48.png"
              alt="Toppings"
              className="tw-w-8 tw-h-8"
            />
          </div>
        ) : (
          <div className="tw-flex tw-items-center tw-gap-2.5">
            <img
              src="/assets/icons/icon48.png"
              alt="Toppings logo"
              className="tw-w-8 tw-h-8 tw-flex-shrink-0"
            />
            <div className="tw-min-w-0">
              <div className="tw-flex tw-items-baseline tw-gap-2">
                <h1 className="tw-text-lg tw-font-bold tw-text-fg tw-truncate">
                  Toppings
                </h1>
                <span className="tw-text-[10px] tw-text-fg-subtle tw-font-mono">
                  v{version}
                </span>
              </div>
              <p className="tw-text-xs tw-text-fg-subtle tw-mt-0.5 tw-truncate">
                Your YouTube, Your Way.
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className="tw-flex-1 tw-overflow-y-auto tw-py-3 tw-px-2">
        {!collapsed && (
          <div className="tw-text-[11px] tw-uppercase tw-tracking-wider tw-text-fg-subtle tw-font-semibold tw-px-3 tw-py-1 tw-mb-1">
            Settings
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
            <Tooltip text="Expand sidebar" side="right">
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Expand sidebar"
                onClick={() => setCollapsed(false)}
              >
                <Icon name="chevron-right" size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip text="GitHub" side="right">
              <a
                href="https://github.com/iamfaisalkhan/toppings"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                className="tw-w-7 tw-h-7 tw-inline-flex tw-items-center tw-justify-center tw-text-fg-muted hover:tw-text-fg tw-rounded-md hover:tw-bg-surface-hover tw-transition-colors"
              >
                <Icon name="external" size={14} />
              </a>
            </Tooltip>
          </>
        ) : (
          <>
            <a
              href="https://github.com/iamfaisalkhan/toppings"
              target="_blank"
              rel="noreferrer"
              className="tw-text-xs tw-text-fg-muted hover:tw-text-fg tw-transition-colors tw-inline-flex tw-items-center tw-gap-1"
            >
              GitHub
              <Icon name="external" size={11} />
            </a>
            <Tooltip text="Collapse sidebar" side="left">
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Collapse sidebar"
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
      end={item.to === "/"}
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
