import React, { useEffect, useState } from "react";
import { Storage, DEFAULT_STORE, getStorage } from "../background/store";
import StoreContext from "../shared/store";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { useTheme } from "../shared/hooks/useTheme";
import { useStoreUpdater } from "../shared/hooks/useStoreUpdater";
import { setExtensionIcon } from "../shared/utils/browser";
import {
  CHROME_RUNTIME_PATH,
  CHROME_STORAGE_LOCAL_KEY,
  EXTERNAL_URL,
  BROWSER_TARGET,
} from "toppings-constants";

/**
 * Popup — implements the Claude Design handoff for the extension UI.
 *
 * Layout (340 × 440):
 *  - Brand head (logo + wordmark + version pill)
 *  - Live status row (amber pulse dot + page context + URL)
 *  - Feature toggle list wired to the store: Audio Mode, Loop, Auto-scroll
 *    Shorts, Playback speed (the last one shows the current default rate
 *    as a kbd-style chip rather than a toggle, mirroring the design)
 *  - 4-button bottom nav (home / report bug / sponsor / open settings)
 *
 * The token system in shared/theme.css now matches the design's extension
 * palette exactly, so this component never hardcodes hex values — every
 * surface and text color references a CSS variable.
 */

const POPUP_W = 340;
const POPUP_H = 440;

function ThemeApplier({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

function openOptions() {
  const url = chrome.runtime.getURL(CHROME_RUNTIME_PATH.OPTIONS_INDEX_HTML);
  window.open(url, BROWSER_TARGET.BLANK);
}

/** Lightweight async hook: which tab is the popup attached to? */
function useActiveTab() {
  const [info, setInfo] = useState<{
    url: string | null;
    page: "watch" | "shorts" | "playlist" | "youtube-other" | "other";
  }>({ url: null, page: "other" });

  useEffect(() => {
    chrome.tabs?.query?.({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs?.[0]?.url ?? null;
      let page: typeof info.page = "other";
      try {
        const u = new URL(url ?? "");
        if (u.hostname.endsWith("youtube.com")) {
          if (u.pathname.startsWith("/watch")) page = "watch";
          else if (u.pathname.startsWith("/shorts")) page = "shorts";
          else if (u.pathname.startsWith("/playlist")) page = "playlist";
          else page = "youtube-other";
        }
      } catch {}
      setInfo({ url, page });
    });
  }, []);

  return info;
}

/** Minimal switch — matches the design's 34×20 pill exactly. */
function TinySwitch({
  on,
  onClick,
}: {
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="tw-relative tw-inline-flex tw-h-5 tw-w-[34px] tw-flex-shrink-0 tw-cursor-pointer tw-rounded-full tw-transition-colors tw-duration-[240ms] tw-ease-out focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent/50 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-bg"
      style={{
        background: on
          ? "var(--color-accent)"
          : "var(--color-surface-hover)",
        border: on ? "none" : "1px solid var(--color-border-default)",
      }}
    >
      <span
        aria-hidden
        className="tw-pointer-events-none tw-absolute tw-top-[2px] tw-left-[2px] tw-inline-block tw-h-4 tw-w-4 tw-rounded-full tw-transition-transform tw-duration-[240ms] tw-ease-out"
        style={{
          transform: on ? "translateX(14px)" : "translateX(0)",
          background: on ? "var(--color-accent-fg)" : "var(--color-fg)",
        }}
      />
    </button>
  );
}

function PopupShell() {
  const { store, update } = useStoreUpdater();
  const version = chrome.runtime.getManifest().version;
  const tab = useActiveTab();

  // Status row labels driven from the live tab context.
  const statusLabel = (() => {
    switch (tab.page) {
      case "watch":
        return "Watch page · active";
      case "shorts":
        return "Shorts · active";
      case "playlist":
        return "Playlist · active";
      case "youtube-other":
        return "YouTube · active";
      default:
        return "Open a YouTube video";
    }
  })();
  const statusUrl = (() => {
    if (!tab.url) return "—";
    try {
      const u = new URL(tab.url);
      const path = u.pathname.length > 28 ? u.pathname.slice(0, 28) + "…" : u.pathname;
      return `${u.hostname}${path}`;
    } catch {
      return tab.url;
    }
  })();

  // Toggles wired to the store. We use the master `isExtensionEnabled`
  // for the global on/off and individual feature flags for the rest.
  const masterOn = store.isExtensionEnabled;
  const audioOn = store.preferences.watch.audioMode?.isEnabled ?? false;
  const loopOn = store.preferences.watch.isEnabled;
  const shortsAuto = store.preferences.shorts.reelAutoScroll.value;
  const defaultRate = store.preferences.watch.defaultPlaybackRate.value;

  const toggleMaster = () => {
    const next = !masterOn;
    update((d) => {
      d.isExtensionEnabled = next;
    });
    setExtensionIcon(!next);
  };
  const toggleAudio = () =>
    update((d) => {
      if (!d.preferences.watch.audioMode) return;
      d.preferences.watch.audioMode.isEnabled =
        !d.preferences.watch.audioMode.isEnabled;
    });
  const toggleLoop = () =>
    update((d) => {
      d.preferences.watch.isEnabled = !d.preferences.watch.isEnabled;
    });
  const toggleShorts = () =>
    update((d) => {
      d.preferences.shorts.reelAutoScroll.value =
        !d.preferences.shorts.reelAutoScroll.value;
    });

  return (
    <div
      className="tw-flex tw-flex-col tw-overflow-hidden tw-text-fg"
      style={{
        width: POPUP_W,
        height: POPUP_H,
        background: "var(--color-bg)",
        borderRadius: 12,
        border: "1px solid var(--color-border-default)",
      }}
    >
      {/* Brand head */}
      <header className="tw-flex tw-items-center tw-gap-2.5 tw-px-4 tw-py-3.5 tw-border-b tw-border-border-default">
        <img
          src="/assets/icons/icon48.png"
          alt=""
          className="tw-w-7 tw-h-7"
        />
        <div
          className="tw-flex-1 tw-text-[17px] tw-leading-none tw-font-black tw-tracking-[-0.03em]"
          style={{ fontWeight: 900 }}
        >
          Toppings
        </div>
        <span
          className="tw-font-mono tw-text-[10px] tw-leading-none tw-px-2 tw-py-1 tw-rounded-full tw-border tw-border-border-default tw-text-fg-subtle"
        >
          v{version}
        </span>
      </header>

      {/* Status row */}
      <div
        className="tw-flex tw-items-center tw-gap-2.5 tw-px-4 tw-py-3.5 tw-border-b tw-border-border-default"
        style={{ background: "var(--color-surface)" }}
      >
        <span
          aria-hidden
          className="tw-inline-block tw-w-2 tw-h-2 tw-rounded-full"
          style={{
            background: tab.page === "other" ? "var(--color-fg-subtle)" : "var(--color-accent)",
            animation:
              tab.page === "other" ? undefined : "pulseAmber 1.6s ease-out infinite",
          }}
        />
        <div className="tw-min-w-0 tw-flex-1">
          <div className="tw-text-[13px] tw-font-semibold tw-text-fg tw-truncate">
            {statusLabel}
          </div>
          <div className="tw-font-mono tw-text-[11px] tw-text-fg-subtle tw-truncate tw-mt-0.5">
            {statusUrl}
          </div>
        </div>
      </div>

      {/* Toggle list */}
      <div className="tw-flex-1 tw-overflow-y-auto">
        <PopupRow
          title="Extension"
          subtitle={masterOn ? "Running on every YouTube tab" : "Globally disabled"}
          control={<TinySwitch on={masterOn} onClick={toggleMaster} />}
          onActivate={toggleMaster}
        />
        <PopupRow
          title="Audio mode"
          subtitle="Strip the video"
          control={<TinySwitch on={audioOn} onClick={toggleAudio} />}
          onActivate={toggleAudio}
          disabled={!masterOn}
        />
        <PopupRow
          title="Watch features"
          subtitle="Loop · rates · seek"
          control={<TinySwitch on={loopOn} onClick={toggleLoop} />}
          onActivate={toggleLoop}
          disabled={!masterOn}
        />
        <PopupRow
          title="Auto-scroll Shorts"
          subtitle="Continue when one ends"
          control={<TinySwitch on={shortsAuto} onClick={toggleShorts} />}
          onActivate={toggleShorts}
          disabled={!masterOn}
        />
        <PopupRow
          title="Playback speed"
          subtitle="Default for new videos"
          control={
            <span
              className="tw-inline-flex tw-items-center tw-justify-center tw-min-w-[28px] tw-h-[22px] tw-px-2 tw-rounded tw-font-mono tw-text-[11px]"
              style={{
                background: "var(--color-surface-hover)",
                color: "var(--color-fg-muted)",
              }}
            >
              {defaultRate}x
            </span>
          }
        />
      </div>

      {/* Bottom nav */}
      <nav
        className="tw-grid tw-grid-cols-4 tw-border-t tw-border-border-default"
        style={{ background: "var(--color-surface-2)" }}
      >
        <NavBtn
          label="Home"
          active
          onClick={() => undefined}
          path="M3 11l9-8 9 8 M5 10v10h14V10"
        />
        <NavBtn
          label="Report a bug"
          onClick={() => window.open(EXTERNAL_URL.GITHUB_ISSUES, BROWSER_TARGET.BLANK)}
          path="M8 2 H16 V22 H8z M3 7l4-1 M3 12l4-1 M3 17l4-1 M21 7l-4-1 M21 12l-4-1 M21 17l-4-1"
        />
        <NavBtn
          label="Become a sponsor"
          onClick={() => window.open(EXTERNAL_URL.SPONSOR, BROWSER_TARGET.BLANK)}
          path="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
        <NavBtn
          label="Open preferences"
          onClick={openOptions}
          path="M12 9 a3 3 0 1 0 0 6 a3 3 0 1 0 0-6z M19.4 15 a1.65 1.65 0 0 0 .33 1.82 a2 2 0 1 1-2.83 2.83 a1.65 1.65 0 0 0-1.82-.33 a1.65 1.65 0 0 0-1 1.51 V21 a2 2 0 1 1-4 0 a1.65 1.65 0 0 0-1-1.51 a1.65 1.65 0 0 0-1.82.33 a2 2 0 1 1-2.83-2.83 a1.65 1.65 0 0 0 .33-1.82 a1.65 1.65 0 0 0-1.51-1 H3 a2 2 0 1 1 0-4 h.09 a1.65 1.65 0 0 0 1.51-1 a1.65 1.65 0 0 0-.33-1.82 a2 2 0 1 1 2.83-2.83 a1.65 1.65 0 0 0 1.82.33 h.09 a1.65 1.65 0 0 0 1-1.51 V3 a2 2 0 1 1 4 0 v.09 a1.65 1.65 0 0 0 1 1.51 a1.65 1.65 0 0 0 1.82-.33 a2 2 0 1 1 2.83 2.83 a1.65 1.65 0 0 0-.33 1.82 V9 a1.65 1.65 0 0 0 1.51 1 H21 a2 2 0 1 1 0 4 h-.09 a1.65 1.65 0 0 0-1.51 1 z"
        />
      </nav>
    </div>
  );
}

/** A single row in the popup toggle list. Whole row is the hit target. */
function PopupRow({
  title,
  subtitle,
  control,
  onActivate,
  disabled,
}: {
  title: string;
  subtitle: string;
  control: React.ReactNode;
  onActivate?: () => void;
  disabled?: boolean;
}) {
  const clickable = !!onActivate && !disabled;
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      onClick={clickable ? onActivate : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate?.();
              }
            }
          : undefined
      }
      className={`tw-grid tw-grid-cols-[1fr_auto] tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-border-b tw-border-border-default tw-transition-colors tw-duration-150 ${
        clickable ? "tw-cursor-pointer hover:tw-bg-surface-hover" : ""
      } ${disabled ? "tw-opacity-50 tw-pointer-events-none" : ""}`}
    >
      <div className="tw-min-w-0">
        <div className="tw-text-[13.5px] tw-font-medium tw-text-fg tw-truncate">
          {title}
        </div>
        <div className="tw-font-mono tw-text-[11px] tw-text-fg-subtle tw-truncate tw-mt-0.5">
          {subtitle}
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>{control}</div>
    </div>
  );
}

/** Bottom-nav icon button. Tiny SVG with stroke-only style. */
function NavBtn({
  label,
  active,
  onClick,
  path,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  path: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`tw-relative tw-grid tw-place-items-center tw-py-3.5 tw-cursor-pointer tw-transition-colors tw-duration-150 hover:tw-bg-surface-hover ${
        active ? "tw-text-fg" : "tw-text-fg-muted hover:tw-text-fg"
      }`}
    >
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={path} />
      </svg>
      {active && (
        <span
          aria-hidden
          className="tw-absolute tw-bottom-1.5 tw-left-1/2 -tw-translate-x-1/2 tw-w-4 tw-h-0.5 tw-rounded-full"
          style={{ background: "var(--color-accent)" }}
        />
      )}
    </button>
  );
}

export default function App() {
  const [store, setStore] = useState<Storage>(DEFAULT_STORE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getStorage().then((s) => {
      setStore(s);
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <div
        style={{
          width: POPUP_W,
          height: POPUP_H,
          background: "var(--color-bg)",
        }}
      />
    );
  }

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      <ThemeApplier>
        <ToastProvider>
          <PopupShell />
        </ToastProvider>
      </ThemeApplier>
    </StoreContext.Provider>
  );
}
