import React, { useEffect, useState } from "react";
import { Storage, DEFAULT_STORE, getStorage } from "../background/store";
import StoreContext from "../shared/store";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { useTheme } from "../shared/hooks/useTheme";
import { useStoreUpdater } from "../shared/hooks/useStoreUpdater";
import { useChromeStorageLocalCount } from "../shared/hooks/useChromeStorageLocal";
import Switch from "../shared/components/form/Switch";
import Icon from "../shared/components/primitives/Icon";
import IconButton from "../shared/components/primitives/IconButton";
import Button from "../shared/components/primitives/Button";
import Badge from "../shared/components/primitives/Badge";
import { setExtensionIcon } from "../shared/utils/browser";
import { FEATURES, WHATS_NEW, FeatureEntry } from "../shared/features";

const POPUP_WIDTH = 360;
const POPUP_HEIGHT = 520;

function ThemeApplier({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

function openOptions(hash?: string) {
  const base = chrome.runtime.getURL("options/index.html");
  // Memory router doesn't read URL hash, so we use chrome.storage as a
  // jump-target hint — the options app reads it on mount and consumes.
  if (hash) {
    chrome.storage.local.set(
      { options_pending_route: hash },
      () => {
        window.open(base, "_blank");
      },
    );
  } else {
    window.open(base, "_blank");
  }
}

function PopupShell() {
  const { store, update } = useStoreUpdater();
  const pinnedCount = useChromeStorageLocalCount("audioMode_pin_");
  const version = chrome.runtime.getManifest().version;

  const setMasterEnabled = (isEnabled: boolean) => {
    update((draft) => {
      draft.isExtensionEnabled = isEnabled;
    });
    setExtensionIcon(!isEnabled);
  };

  return (
    <div
      className="tw-flex tw-flex-col tw-bg-bg tw-text-fg"
      style={{ width: POPUP_WIDTH, height: POPUP_HEIGHT }}
    >
      <PopupHeader version={version} />
      <div className="tw-flex-1 tw-overflow-y-auto tw-px-4 tw-py-3 tw-flex tw-flex-col tw-gap-3">
        <MasterToggleCard
          enabled={store.isExtensionEnabled}
          onToggle={setMasterEnabled}
        />
        <QuickStatsCard pinnedCount={pinnedCount} />
        <FeaturesCard />
        <WhatsNewCard />
      </div>
      <PopupFooter />
    </div>
  );
}

function PopupHeader({ version }: { version: string }) {
  return (
    <header className="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-border-b tw-border-border-default">
      <img
        src="/assets/icons/icon48.png"
        alt="Toppings"
        className="tw-w-8 tw-h-8 tw-flex-shrink-0"
      />
      <div className="tw-flex-1 tw-min-w-0">
        <div className="tw-flex tw-items-baseline tw-gap-2">
          <h1 className="tw-text-base tw-font-bold tw-text-fg">Toppings</h1>
          <span className="tw-text-[10px] tw-text-fg-subtle tw-font-mono">
            v{version}
          </span>
        </div>
        <p className="tw-text-[11px] tw-text-fg-subtle">
          Your YouTube, Your Way.
        </p>
      </div>
      <IconButton
        aria-label="Open settings"
        variant="ghost"
        size="sm"
        onClick={() => openOptions()}
      >
        <Icon name="settings" size={16} />
      </IconButton>
    </header>
  );
}

function MasterToggleCard({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <section className="tw-bg-surface tw-border tw-border-border-default tw-rounded-lg tw-px-3 tw-py-2">
      <Switch
        label="Extension Enabled"
        description="Master switch — turn off to disable all Toppings features on YouTube."
        isEnabled={enabled}
        onToggle={onToggle}
      />
    </section>
  );
}

function QuickStatsCard({ pinnedCount }: { pinnedCount: number }) {
  return (
    <section className="tw-bg-surface tw-border tw-border-border-default tw-rounded-lg tw-px-3 tw-py-2.5">
      <h2 className="tw-text-[11px] tw-uppercase tw-tracking-wider tw-text-fg-subtle tw-font-semibold tw-mb-2">
        At a Glance
      </h2>
      <div className="tw-grid tw-grid-cols-2 tw-gap-2">
        <StatCell
          icon="audio"
          label="Pinned videos"
          value={String(pinnedCount)}
        />
        <StatCell icon="general" label="Features" value={String(FEATURES.length)} />
      </div>
    </section>
  );
}

function StatCell({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  value: string;
}) {
  return (
    <div className="tw-flex tw-items-center tw-gap-2.5 tw-bg-bg tw-border tw-border-border-subtle tw-rounded-md tw-px-2.5 tw-py-2">
      <div className="tw-text-fg-muted">
        <Icon name={icon} size={16} />
      </div>
      <div className="tw-min-w-0">
        <div className="tw-text-base tw-font-semibold tw-text-fg tw-leading-tight">
          {value}
        </div>
        <div className="tw-text-[10px] tw-text-fg-subtle tw-truncate">
          {label}
        </div>
      </div>
    </div>
  );
}

function FeaturesCard() {
  return (
    <section className="tw-bg-surface tw-border tw-border-border-default tw-rounded-lg tw-px-3 tw-py-2.5">
      <h2 className="tw-text-[11px] tw-uppercase tw-tracking-wider tw-text-fg-subtle tw-font-semibold tw-mb-2">
        Features
      </h2>
      <div className="tw-flex tw-flex-col tw-gap-1">
        {FEATURES.filter((f) => f.status !== "deprecated").map((f) => (
          <FeatureRow key={f.id} feature={f} />
        ))}
      </div>
    </section>
  );
}

function FeatureRow({ feature }: { feature: FeatureEntry }) {
  return (
    <button
      onClick={() => openOptions(feature.route)}
      className="tw-flex tw-items-center tw-gap-2.5 tw-px-2 tw-py-1.5 tw-rounded-md hover:tw-bg-surface-hover tw-text-left tw-transition-colors tw-group"
    >
      <div className="tw-text-fg-muted group-hover:tw-text-fg tw-flex-shrink-0">
        <Icon name={feature.icon} size={16} />
      </div>
      <div className="tw-flex-1 tw-min-w-0">
        <div className="tw-flex tw-items-center tw-gap-1.5">
          <span className="tw-text-sm tw-font-medium tw-text-fg">
            {feature.name}
          </span>
          {feature.status === "new" && (
            <Badge tone="info" className="tw-text-[9px]">
              New
            </Badge>
          )}
          {feature.status === "beta" && (
            <Badge tone="warning" className="tw-text-[9px]">
              Beta
            </Badge>
          )}
        </div>
        <p className="tw-text-[11px] tw-text-fg-subtle tw-leading-snug tw-line-clamp-2">
          {feature.description}
        </p>
      </div>
      <Icon
        name="chevron-right"
        size={14}
        className="tw-text-fg-subtle tw-flex-shrink-0"
      />
    </button>
  );
}

function WhatsNewCard() {
  const latest = WHATS_NEW[0];
  if (!latest) return null;
  return (
    <section className="tw-bg-surface tw-border tw-border-border-default tw-rounded-lg tw-px-3 tw-py-2.5">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
        <h2 className="tw-text-[11px] tw-uppercase tw-tracking-wider tw-text-fg-subtle tw-font-semibold">
          What's New
        </h2>
        <Badge tone="info" className="tw-text-[9px]">
          v{latest.version}
        </Badge>
      </div>
      <ul className="tw-flex tw-flex-col tw-gap-1">
        {latest.items.slice(0, 4).map((item, i) => (
          <li
            key={i}
            className="tw-flex tw-items-start tw-gap-1.5 tw-text-[12px] tw-text-fg-muted tw-leading-snug"
          >
            <span className="tw-mt-1.5 tw-w-1 tw-h-1 tw-rounded-full tw-bg-accent tw-flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PopupFooter() {
  return (
    <footer className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2.5 tw-border-t tw-border-border-default tw-bg-surface">
      <div className="tw-flex tw-items-center tw-gap-1">
        <FooterAction
          icon="external"
          label="GitHub"
          onClick={() =>
            window.open("https://github.com/enrych/toppings", "_blank")
          }
        />
        <FooterAction
          icon="alert"
          label="Report a bug"
          onClick={() =>
            window.open("https://github.com/enrych/toppings/issues", "_blank")
          }
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        leadingIcon={<Icon name="settings" size={12} />}
        onClick={() => openOptions()}
      >
        Open Settings
      </Button>
    </footer>
  );
}

function FooterAction({
  icon,
  label,
  onClick,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="tw-w-7 tw-h-7 tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-text-fg-muted hover:tw-bg-surface-hover hover:tw-text-fg tw-transition-colors"
    >
      <Icon name={icon} size={14} />
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
    // Skeleton — minimal flash, full layout already sized.
    return (
      <div
        className="tw-bg-bg"
        style={{ width: POPUP_WIDTH, height: POPUP_HEIGHT }}
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
