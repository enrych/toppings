import { useEffect, useState } from "preact/hooks";
import { useTheme } from "@/ui/useTheme";
import { Toggle } from "@/ui/form/Switch";
import Icon, { type IconName } from "@/ui/primitives/Icon";
import { useSettings } from "@/kernel/useSettings";
import { appSettings } from "@/app/settings";
import { OPTIONS_HTML } from "@/app/options/data";
import { playbackSettings } from "@/features/playback/settings";
import { shortsSettings } from "@/features/shorts/settings";
import { getActiveProfile, getAllProfiles, setActiveProfileId, subscribeProfiles } from "@/features/profiles/store";
import type { Profile } from "@/features/profiles/profiles";
import { scheduleState } from "@/features/schedules/state";
import { skipSchedule } from "@/features/schedules/messages";
import { routeFor, type Route } from "@/youtube/route";
import { URLS } from "@/lib/urls";
import { EXTENSION_VERSION } from "@/lib/version";
import { YOUTUBE_HOSTNAME_SUFFIX } from "@/youtube/urls";

const WIDTH = 340;

const ROUTE_LABEL: Record<Route["name"], string> = {
  watch: "Watch page",
  shorts: "Shorts",
  playlist: "Playlist",
  home: "Home",
  search: "Search",
  other: "YouTube",
};

function useActiveTab() {
  const [tab, setTab] = useState<{ host: string; route: Route | null }>({ host: "", route: null });
  useEffect(() => {
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([active]) => {
      if (!active?.url) return;
      const url = new URL(active.url);
      setTab({ host: url.hostname, route: url.hostname.endsWith(YOUTUBE_HOSTNAME_SUFFIX) ? routeFor(url) : null });
    });
  }, []);
  return tab;
}

function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      setProfiles(await getAllProfiles());
      setActiveId((await getActiveProfile())?.id ?? null);
    };
    void load();
    return subscribeProfiles(() => void load());
  }, []);
  return { profiles, activeId, activate: (id: string | null) => void setActiveProfileId(id) };
}

function Row({ title, subtitle, on, onToggle, disabled }: { title: string; subtitle: string; on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <div class={`tw-flex tw-items-center tw-gap-3 tw-px-4 tw-h-14 ${disabled ? "tw-opacity-40 tw-pointer-events-none" : ""}`}>
      <div class="tw-min-w-0 tw-flex-1">
        <div class="tw-text-sm tw-text-fg tw-truncate">{title}</div>
        <div class="tw-text-xs tw-text-fg-muted tw-truncate">{subtitle}</div>
      </div>
      <Toggle on={on} onClick={onToggle} label={title} />
    </div>
  );
}

function NavButton({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} class="tw-flex-1 tw-grid tw-place-items-center tw-h-12 tw-text-fg-muted hover:tw-bg-surface-hover hover:tw-text-fg tw-transition-colors">
      <Icon name={icon} size={22} />
    </button>
  );
}

export default function App() {
  useTheme();
  const app = useSettings(appSettings);
  const playback = useSettings(playbackSettings);
  const shorts = useSettings(shortsSettings);
  const schedule = useSettings(scheduleState).value;
  const tab = useActiveTab();
  const { profiles, activeId, activate } = useProfiles();
  const onYouTube = tab.route !== null;

  return (
    <div class="tw-flex tw-flex-col tw-overflow-hidden tw-bg-bg tw-text-fg tw-rounded-xl" style={{ width: WIDTH }}>
      <header class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-h-14 tw-border-b tw-border-border-subtle">
        <img src="/assets/icons/icon48.png" alt="" class="tw-w-7 tw-h-7" />
        <div class="tw-flex-1 tw-font-display tw-text-xl tw-leading-none">Toppings</div>
        <span class="tw-text-[11px] tw-text-fg-subtle">v{EXTENSION_VERSION}</span>
      </header>

      <div class="tw-flex tw-items-center tw-gap-2.5 tw-px-4 tw-py-3 tw-bg-surface tw-border-b tw-border-border-subtle">
        <span aria-hidden class={`tw-inline-block tw-w-2 tw-h-2 tw-rounded-full ${onYouTube && app.value.enabled ? "tw-bg-accent tw-animate-[pulseAccent_1.6s_ease-out_infinite]" : "tw-bg-fg-subtle"}`} />
        <div class="tw-min-w-0 tw-flex-1">
          <div class="tw-text-[13px] tw-font-medium tw-truncate">{tab.route ? `${ROUTE_LABEL[tab.route.name]} · ${app.value.enabled ? "active" : "off"}` : "Open a YouTube page"}</div>
          <div class="tw-text-[11px] tw-text-fg-subtle tw-truncate">{tab.host || "—"}</div>
        </div>
      </div>

      <div class="tw-divide-y tw-divide-border-subtle">
        <Row title="Toppings" subtitle={app.value.enabled ? "Running on every YouTube tab" : "Turned off everywhere"} on={app.value.enabled} onToggle={() => app.update({ enabled: !app.value.enabled })} />
        <Row title="Playback controls" subtitle={`Rates · seek · default ${playback.value.defaultRate}×`} on={playback.value.enabled} onToggle={() => playback.update({ enabled: !playback.value.enabled })} disabled={!app.value.enabled} />
        <Row title="Auto-scroll Shorts" subtitle="Continue when one ends" on={shorts.value.autoScroll} onToggle={() => shorts.update({ autoScroll: !shorts.value.autoScroll })} disabled={!app.value.enabled} />
      </div>

      <div class="tw-px-4 tw-pt-3 tw-pb-2 tw-bg-surface tw-border-t tw-border-border-subtle">
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
          <span class="tw-text-[11px] tw-font-medium tw-uppercase tw-tracking-wider tw-text-fg-subtle">Profile</span>
          {activeId !== null && (
            <button type="button" class="tw-text-[11px] tw-text-fg-muted hover:tw-text-fg" onClick={() => activate(null)}>
              Clear
            </button>
          )}
        </div>
        <div class="tw-flex tw-flex-wrap tw-gap-2 tw-pb-1">
          {profiles.map((p) => {
            const active = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => activate(active ? null : p.id)}
                class={`tw-h-8 tw-px-3 tw-rounded-lg tw-text-[13px] tw-font-medium tw-transition-colors ${active ? "tw-bg-fg tw-text-bg" : "tw-bg-surface-hover tw-text-fg hover:tw-bg-border-default"}`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
        {app.value.enabled && schedule.status && (
          <div class="tw-flex tw-items-center tw-gap-2 tw-pb-1 tw-pt-1">
            <span aria-hidden class="tw-inline-block tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-accent tw-flex-shrink-0" />
            <span role="status" class="tw-min-w-0 tw-flex-1 tw-text-[11px] tw-text-fg-muted tw-truncate" title={schedule.status}>{schedule.status}</span>
            {schedule.inCharge !== null && (
              <button type="button" title="Skip this schedule for now" class="tw-text-[11px] tw-text-fg-muted hover:tw-text-fg" onClick={() => void skipSchedule.send()}>
                Skip
              </button>
            )}
          </div>
        )}
      </div>

      <nav class="tw-flex tw-border-t tw-border-border-subtle">
        <NavButton icon="bug" label="Report a bug" onClick={() => window.open(URLS.GITHUB_ISSUES, "_blank")} />
        <NavButton icon="heart" label="Add a topping" onClick={() => window.open(URLS.SPONSOR_ME, "_blank")} />
        <NavButton icon="settings" label="Open settings" onClick={() => window.open(chrome.runtime.getURL(OPTIONS_HTML), "_blank")} />
      </nav>
    </div>
  );
}
