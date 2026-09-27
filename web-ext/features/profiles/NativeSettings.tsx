/** @jsxImportSource preact */
import { themeTokens } from "@/kernel/dom/theme";
import type { Profile } from "./profiles";
import type { QuickToggle } from "./GearPanel";

const OVERLAY_STYLE = `
  ${themeTokens}
  .overlay {
    position: fixed; inset: 0; z-index: 100000; overflow-y: auto;
    background: var(--tp-bg);
    color: var(--tp-text);
    font: 14px/1.4 var(--tp-font);
  }
  .header {
    position: sticky; top: 0; z-index: 1; display: flex; align-items: center; gap: 16px;
    padding: 16px 24px; background: inherit;
    border-bottom: 1px solid var(--tp-additive);
  }
  .back {
    display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%;
    border: 0; background: none; color: inherit; cursor: pointer; padding: 0;
  }
  .back:hover { background: var(--tp-additive); }
  .title { font-size: 20px; font-weight: 600; }
  .body { max-width: 900px; margin: 0 auto; padding: 24px 24px 64px; }
  .section { margin-bottom: 32px; }
  .section-title {
    margin-bottom: 12px; font-size: 13px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
    color: var(--tp-text-2);
  }
  .card { border-radius: 12px; overflow: hidden; background: var(--tp-raised); }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; }
  .chip {
    padding: 6px 14px; border: 0; border-radius: 20px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer;
    background: var(--tp-additive); color: var(--tp-text);
  }
  .chip[aria-pressed="true"] { background: var(--tp-accent); color: #fff; }
  .row {
    display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer;
    border-bottom: 1px solid var(--tp-additive);
  }
  .row:last-child { border-bottom: 0; }
  .row:hover { background: var(--tp-additive); }
  .row-label { flex: 1; font-weight: 500; }
  .toggle {
    position: relative; flex-shrink: 0; width: 36px; height: 20px; border-radius: 10px;
    background: var(--tp-outline); transition: background .15s;
  }
  .toggle::after {
    content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%;
    background: #fff; transition: transform .15s;
  }
  .toggle[data-on] { background: var(--tp-accent); }
  .toggle[data-on]::after { transform: translateX(16px); }
  .options {
    padding: 10px 20px; border-radius: 20px; font: inherit; font-weight: 500; cursor: pointer;
    border: 1px solid var(--tp-outline); background: none; color: inherit;
  }
  .options:hover { background: var(--tp-additive); }
`;

export interface NativeSettingsProps {
  open: boolean;
  profiles: Profile[];
  activeProfileId: string | null;
  toggles: QuickToggle[];
  onPick: (id: string | null) => void;
  onToggle: (id: string, visible: boolean) => void;
  onOpenOptions: () => void;
  onClose: () => void;
}

export function NativeSettings({ open, profiles, activeProfileId, toggles, onPick, onToggle, onOpenOptions, onClose }: NativeSettingsProps) {
  const chip = (id: string | null, label: string) => {
    const active = activeProfileId === id;
    return (
      <button class="chip" aria-pressed={active} onClick={() => onPick(active && id !== null ? null : id)}>
        {label}
      </button>
    );
  };
  return (
    <>
      <style>{OVERLAY_STYLE}</style>
      {open && (
        <div class="overlay" role="dialog" aria-label="Toppings settings">
          <div class="header">
            <button class="back" aria-label="Back to YouTube" onClick={onClose}>
              <svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            </button>
            <div class="title">Toppings Settings</div>
          </div>
          <div class="body">
            <div class="section">
              <div class="section-title">Active profile</div>
              <div class="card chips">
                {chip(null, "Default")}
                {profiles.map((p) => chip(p.id, p.name))}
              </div>
            </div>
            {toggles.length > 0 && (
              <div class="section">
                <div class="section-title">Watch page</div>
                <div class="card">
                  {toggles.map((t) => (
                    <div class="row" onClick={() => onToggle(t.id, !t.visible)}>
                      <div class="row-label">{t.label}</div>
                      <div class="toggle" data-on={t.visible || undefined} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div class="section">
              <button class="options" onClick={onOpenOptions}>Open full settings ↗</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const LINK_STYLE = `
  ${themeTokens}
  :host { display: block; }
  .link {
    display: flex; align-items: center; gap: 16px; height: 40px; margin: 4px 12px; padding: 0 24px;
    border-radius: 10px; cursor: pointer; font: 14px var(--tp-font);
    color: var(--tp-text);
  }
  .link:hover { background: var(--tp-additive); }
  svg { flex-shrink: 0; opacity: .8; }
`;

export function GuideLink({ onOpen }: { onOpen: () => void }) {
  return (
    <>
      <style>{LINK_STYLE}</style>
      <div class="link" role="button" tabIndex={0} onClick={onOpen}>
        <svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
        <span>Toppings</span>
      </div>
    </>
  );
}
