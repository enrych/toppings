import Icon from "@/ui/primitives/Icon";
import IconButton from "@/ui/primitives/IconButton";
import Tooltip from "@/ui/primitives/Tooltip";
import { useChromeStorageLocal } from "@/lib/useChromeStorageLocal";
import { BRAND_METADATA } from "@/lib/brand";
import { CHROME_STORAGE_LOCAL_KEY } from "@/lib/storageKeys";
import { useTheme } from "@/ui/useTheme";
import { OPTIONS_ICON_SRC, OPTIONS_PAGES } from "../data";
import { hrefFor, useRoute } from "../router";
import SidebarThemeToggle from "./SidebarThemeToggle";
import OptionsSearch from "../search/OptionsSearch";

export default function Sidebar() {
  const version = chrome.runtime.getManifest().version;
  const [collapsed, setCollapsed] = useChromeStorageLocal<boolean>(CHROME_STORAGE_LOCAL_KEY.OPTIONS_SIDEBAR_COLLAPSED, false);
  const { theme, setTheme } = useTheme();
  const active = useRoute();
  const collapseLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <aside class={`tw-flex-shrink-0 tw-h-screen tw-sticky tw-top-0 tw-flex tw-flex-col tw-bg-bg tw-border-r tw-border-border-subtle tw-transition-[width] tw-duration-200 ${collapsed ? "tw-w-[72px]" : "tw-w-[240px]"}`}>
      <div class={`tw-py-5 ${collapsed ? "tw-px-0" : "tw-px-4"}`}>
        <div class={`tw-flex tw-items-center tw-gap-3 ${collapsed ? "tw-justify-center" : "tw-px-2"}`}>
          <img src={OPTIONS_ICON_SRC} alt={collapsed ? BRAND_METADATA.NAME : ""} class="tw-w-7 tw-h-7 tw-flex-shrink-0" />
          {!collapsed && (
            <div class="tw-min-w-0">
              <div class="tw-text-lg tw-leading-none tw-font-medium tw-text-fg tw-truncate">{BRAND_METADATA.NAME}</div>
              <div class="tw-text-[11px] tw-text-fg-subtle tw-mt-1">v{version}</div>
            </div>
          )}
        </div>
      </div>

      {!collapsed && <OptionsSearch />}

      <nav class="tw-flex-1 tw-overflow-y-auto tw-px-3">
        <ul class="tw-flex tw-flex-col tw-gap-0.5">
          {OPTIONS_PAGES.map((page) => {
            const isActive = page.segment === active;
            const link = (
              <a
                href={hrefFor(page.segment)}
                aria-current={isActive ? "page" : undefined}
                class={`tw-flex tw-items-center tw-rounded-lg tw-text-sm tw-transition-colors ${collapsed ? "tw-justify-center tw-w-12 tw-h-12 tw-mx-auto" : "tw-gap-4 tw-px-3 tw-h-10"} ${
                  isActive ? "tw-bg-surface-hover tw-text-fg tw-font-medium" : "tw-text-fg hover:tw-bg-surface-hover"
                }`}
              >
                <Icon name={page.icon} size={collapsed ? 22 : 20} />
                {!collapsed && <span>{page.label}</span>}
              </a>
            );
            return <li key={page.segment}>{collapsed ? <Tooltip text={page.label}>{link}</Tooltip> : link}</li>;
          })}
        </ul>
      </nav>

      <div class={`tw-flex tw-flex-col tw-gap-2 tw-py-4 ${collapsed ? "tw-px-2 tw-items-center" : "tw-px-4"}`}>
        {!collapsed && <SidebarThemeToggle value={theme} onChange={setTheme} />}
        <div class={`tw-flex ${collapsed ? "tw-justify-center" : "tw-justify-end"}`}>
          <Tooltip text={collapseLabel} side={collapsed ? "right" : "left"}>
            <IconButton size="sm" aria-label={collapseLabel} onClick={() => setCollapsed(!collapsed)}>
              <Icon name={collapsed ? "chevron-right" : "chevron-left"} size={16} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
