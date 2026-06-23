import React from "react";
import { NavLink } from "react-router-dom";
import Icon, { IconName } from "../../../../components/primitives/Icon";
import { OPTIONS_PAGES } from "../../data";

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: IconName;
}

export default function SidebarNavLink({
  item,
  collapsed,
}: {
  item: SidebarNavItem;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.to === OPTIONS_PAGES[0].path}
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
