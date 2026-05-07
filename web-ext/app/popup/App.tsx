import React, { useEffect, useState } from "react";
import { Storage, DEFAULT_STORE, getStorage } from "../background/store";
import StoreContext from "../../context/store";
import ThemeApplier from "../../components/ThemeApplier";
import { ToastProvider } from "../../components/feedback/ToastProvider";
import { useStoreUpdater } from "../../hooks/useStoreUpdater";
import { useActiveTab } from "../../hooks/useActiveTab";
import { EXTENSION_CONTEXT_SCOPE, URLS } from "@toppings/constants";
import { setExtensionIcon } from "../../utils/browser";
import { POPUP_TAB_SCOPE_LABEL, POPUP_SIZE } from "./data";
import { formatTabUrlShort } from "./utils/formatTabUrl";
import TinySwitch from "./components/TinySwitch";
import PopupRow from "./components/PopupRow";
import NavBtn from "./components/NavBtn";
import { openOptionsPage } from "./utils/openOptions";
import type { Profile } from "../../data/profiles.data";
import { BUILT_IN_PRESETS } from "../../data/profiles.data";
import {
  getCustomProfiles,
  setActiveProfileId,
} from "../../utils/storage/profileStore";

function usePopupProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveId] = useState<string | null>(null);

  const load = () => {
    chrome.storage.local.get("toppings:profile_store", (result) => {
      const stored = result["toppings:profile_store"] as
        | { activeProfileId: string | null; profiles: Profile[] }
        | undefined;
      setActiveId(stored?.activeProfileId ?? null);
      const custom: Profile[] = Array.isArray(stored?.profiles)
        ? stored!.profiles.sort((a, b) => a.createdAt - b.createdAt)
        : [];
      setProfiles([...BUILT_IN_PRESETS, ...custom]);
    });
  };

  useEffect(() => {
    load();
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
    ) => {
      if ("toppings:profile_store" in changes) load();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const activate = async (id: string | null) => {
    await setActiveProfileId(id);
    setActiveId(id);
  };

  return { profiles, activeProfileId, activate };
}

function PopupShell() {
  const { store, update } = useStoreUpdater();
  const version = chrome.runtime.getManifest().version;
  const tab = useActiveTab();
  const { profiles, activeProfileId, activate } = usePopupProfiles();

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

  return (
    <div
      className="tw-flex tw-flex-col tw-overflow-hidden tw-text-fg"
      style={{
        width: POPUP_SIZE.WIDTH_PX,
        height: POPUP_SIZE.HEIGHT_PX,
        background: "var(--color-bg)",
        borderRadius: 12,
        border: "1px solid var(--color-border-default)",
      }}
    >
      <header className="tw-flex tw-items-center tw-gap-2.5 tw-px-4 tw-py-3.5 tw-border-b tw-border-border-default">
        <img src="/assets/icons/icon48.png" alt="" className="tw-w-7 tw-h-7" />
        <div
          className="tw-flex-1 tw-text-[17px] tw-leading-none tw-font-black tw-tracking-[-0.03em]"
          style={{ fontWeight: 900 }}
        >
          Toppings
        </div>
        <span className="tw-font-mono tw-text-[10px] tw-leading-none tw-px-2 tw-py-1 tw-rounded-full tw-border tw-border-border-default tw-text-fg-subtle">
          v{version}
        </span>
      </header>

      <div
        className="tw-flex tw-items-center tw-gap-2.5 tw-px-4 tw-py-3.5 tw-border-b tw-border-border-default"
        style={{ background: "var(--color-surface)" }}
      >
        <span
          aria-hidden
          className="tw-inline-block tw-w-2 tw-h-2 tw-rounded-full"
          style={{
            background:
              tab.scope === EXTENSION_CONTEXT_SCOPE.UNSUPPORTED
                ? "var(--color-fg-subtle)"
                : "var(--color-accent)",
            animation:
              tab.scope === EXTENSION_CONTEXT_SCOPE.UNSUPPORTED
                ? undefined
                : "pulseAmber 1.6s ease-out infinite",
          }}
        />
        <div className="tw-min-w-0 tw-flex-1">
          <div className="tw-text-[13px] tw-font-semibold tw-text-fg tw-truncate">
            {POPUP_TAB_SCOPE_LABEL[tab.scope]}
          </div>
          <div className="tw-font-mono tw-text-[11px] tw-text-fg-subtle tw-truncate tw-mt-0.5">
            {formatTabUrlShort(tab.url)}
          </div>
        </div>
      </div>

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
          control={
            <TinySwitch
              on={audioOn}
              onClick={() =>
                update((d) => {
                  if (!d.preferences.watch.audioMode) return;
                  d.preferences.watch.audioMode.isEnabled =
                    !d.preferences.watch.audioMode.isEnabled;
                })
              }
            />
          }
          onActivate={() =>
            update((d) => {
              if (!d.preferences.watch.audioMode) return;
              d.preferences.watch.audioMode.isEnabled =
                !d.preferences.watch.audioMode.isEnabled;
            })
          }
          disabled={!masterOn}
        />
        <PopupRow
          title="Watch features"
          subtitle="Loop · rates · seek"
          control={
            <TinySwitch
              on={loopOn}
              onClick={() =>
                update((d) => {
                  d.preferences.watch.isEnabled = !d.preferences.watch.isEnabled;
                })
              }
            />
          }
          onActivate={() =>
            update((d) => {
              d.preferences.watch.isEnabled = !d.preferences.watch.isEnabled;
            })
          }
          disabled={!masterOn}
        />
        <PopupRow
          title="Auto-scroll Shorts"
          subtitle="Continue when one ends"
          control={
            <TinySwitch
              on={shortsAuto}
              onClick={() =>
                update((d) => {
                  d.preferences.shorts.reelAutoScroll.value =
                    !d.preferences.shorts.reelAutoScroll.value;
                })
              }
            />
          }
          onActivate={() =>
            update((d) => {
              d.preferences.shorts.reelAutoScroll.value =
                !d.preferences.shorts.reelAutoScroll.value;
            })
          }
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

        {/* Profile switcher */}
        <div
          className="tw-px-4 tw-pt-3 tw-pb-1"
          style={{ background: "var(--color-surface)" }}
        >
          <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
            <span className="tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wider tw-text-fg-subtle">
              Profile
            </span>
            {activeProfileId !== null && (
              <button
                className="tw-text-[11px] tw-text-fg-subtle hover:tw-text-fg tw-transition-colors"
                onClick={() => void activate(null)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="tw-flex tw-flex-col tw-gap-1 tw-pb-2">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => void activate(isActive ? null : p.id)}
                  className="tw-flex tw-items-center tw-gap-2 tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-left tw-transition-colors tw-duration-100"
                  style={{
                    background: isActive
                      ? "var(--color-accent)"
                      : "var(--color-surface-hover)",
                    border: "none",
                    cursor: "pointer",
                    color: isActive ? "#fff" : "var(--color-fg)",
                  }}
                >
                  <span
                    className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-flex-shrink-0"
                    style={{
                      background: isActive
                        ? "rgba(255,255,255,0.7)"
                        : "var(--color-fg-subtle)",
                    }}
                  />
                  <span className="tw-text-[13px] tw-font-medium tw-truncate tw-flex-1">
                    {p.name}
                  </span>
                  {p.isPreset && (
                    <span
                      className="tw-text-[10px] tw-opacity-60 tw-flex-shrink-0"
                    >
                      preset
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <nav
        className="tw-grid tw-grid-cols-4 tw-border-t tw-border-border-default"
        style={{ background: "var(--color-surface-2)" }}
      >
        <NavBtn label="Home" active onClick={() => undefined} path="M3 11l9-8 9 8 M5 10v10h14V10" />
        <NavBtn
          label="Report a bug"
          onClick={() => window.open(URLS.GITHUB_ISSUES, "_blank")}
          path="M8 2 H16 V22 H8z M3 7l4-1 M3 12l4-1 M3 17l4-1 M21 7l-4-1 M21 12l-4-1 M21 17l-4-1"
        />
        <NavBtn
          label="Become a sponsor"
          onClick={() => window.open(URLS.SPONSOR_ME, "_blank")}
          path="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
        <NavBtn
          label="Open preferences"
          onClick={openOptionsPage}
          path="M12 9 a3 3 0 1 0 0 6 a3 3 0 1 0 0-6z M19.4 15 a1.65 1.65 0 0 0 .33 1.82 a2 2 0 1 1-2.83 2.83 a1.65 1.65 0 0 0-1.82-.33 a1.65 1.65 0 0 0-1 1.51 V21 a2 2 0 1 1-4 0 a1.65 1.65 0 0 0-1-1.51 a1.65 1.65 0 0 0-1.82.33 a2 2 0 1 1-2.83-2.83 a1.65 1.65 0 0 0 .33-1.82 a1.65 1.65 0 0 0-1.51-1 H3 a2 2 0 1 1 0-4 h.09 a1.65 1.65 0 0 0 1.51-1 a1.65 1.65 0 0 0-.33-1.82 a2 2 0 1 1 2.83-2.83 a1.65 1.65 0 0 0 1.82.33 h.09 a1.65 1.65 0 0 0 1-1.51 V3 a2 2 0 1 1 4 0 v.09 a1.65 1.65 0 0 0 1 1.51 a1.65 1.65 0 0 0 1.82-.33 a2 2 0 1 1 2.83 2.83 a1.65 1.65 0 0 0-.33 1.82 V9 a1.65 1.65 0 0 0 1.51 1 H21 a2 2 0 1 1 0 4h-.09 a1.65 1.65 0 0 0-1.51 1z"
        />
      </nav>
    </div>
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
          width: POPUP_SIZE.WIDTH_PX,
          height: POPUP_SIZE.HEIGHT_PX,
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
