import React from "react";
import { NavLink } from "react-router-dom";
import Icon, { IconName } from "../primitives/Icon";

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

export default function Sidebar() {
  const version = chrome.runtime.getManifest().version;

  return (
    <aside className="tw-w-60 tw-flex-shrink-0 tw-bg-[#0c0c0e] tw-border-r tw-border-gray-800 tw-h-screen tw-sticky tw-top-0 tw-flex tw-flex-col">
      <div className="tw-px-5 tw-py-5 tw-border-b tw-border-gray-800">
        <div className="tw-flex tw-items-baseline tw-gap-2">
          <h1 className="tw-text-xl tw-font-bold tw-text-white">Toppings</h1>
          <span className="tw-text-[10px] tw-text-gray-500 tw-font-mono">
            v{version}
          </span>
        </div>
        <p className="tw-text-xs tw-text-gray-500 tw-mt-0.5">
          Your YouTube, Your Way.
        </p>
      </div>

      <nav className="tw-flex-1 tw-overflow-y-auto tw-py-3 tw-px-2">
        <div className="tw-text-[11px] tw-uppercase tw-tracking-wider tw-text-gray-600 tw-font-semibold tw-px-3 tw-py-1 tw-mb-1">
          Settings
        </div>
        <ul className="tw-flex tw-flex-col tw-gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `tw-flex tw-items-center tw-gap-3 tw-px-3 tw-py-2 tw-text-sm tw-rounded-md tw-transition-colors ${
                    isActive
                      ? "tw-bg-white/[0.06] tw-text-white"
                      : "tw-text-gray-400 hover:tw-bg-white/[0.03] hover:tw-text-gray-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={
                        isActive ? "tw-text-blue-400" : "tw-text-gray-500"
                      }
                    >
                      <Icon name={item.icon} size={16} />
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="tw-px-5 tw-py-3 tw-border-t tw-border-gray-800 tw-text-xs tw-text-gray-500">
        <a
          href="https://github.com/iamfaisalkhan/toppings"
          target="_blank"
          rel="noreferrer"
          className="tw-text-gray-400 hover:tw-text-white tw-transition-colors tw-inline-flex tw-items-center tw-gap-1"
        >
          GitHub
          <Icon name="external" size={11} />
        </a>
      </div>
    </aside>
  );
}
