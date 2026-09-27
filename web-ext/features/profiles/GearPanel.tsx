/** @jsxImportSource preact */
import type { Profile } from "./profiles";

export interface QuickToggle {
  id: string;
  label: string;
  visible: boolean;
}

export interface GearPanelProps {
  toggles: QuickToggle[];
  profiles: Profile[];
  activeProfileId: string | null;
  onToggle: (id: string, visible: boolean) => void;
  onPick: (id: string | null) => void;
  onBack: () => void;
}

const BACK_ICON = "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z";

const onEnter = (run: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    run();
  }
};

// Built from YouTube's own settings-panel classes so it inherits the menu's
// look; rendered straight into the panel, no shadow root.
export function GearPanel({ toggles, profiles, activeProfileId, onToggle, onPick, onBack }: GearPanelProps) {
  const heading = (text: string) => (
    <div class="ytp-menuitem" style="opacity:.5;pointer-events:none;font-size:11px;padding-top:8px">
      <div class="ytp-menuitem-label">{text}</div>
    </div>
  );
  const radio = (id: string | null, label: string) => {
    const checked = activeProfileId === id;
    const pick = () => onPick(checked && id !== null ? null : id);
    return (
      <div class="ytp-menuitem" role="menuitemradio" aria-checked={checked} tabIndex={0} onClick={pick} onKeyDown={onEnter(pick)}>
        <div class="ytp-menuitem-label">{label}</div>
        <div class="ytp-menuitem-content" />
      </div>
    );
  };
  return (
    <>
      <div class="ytp-panel-header">
        <div class="ytp-panel-back-button-container">
          <button class="ytp-button ytp-panel-back-button" aria-label="Back to previous menu" onClick={onBack}>
            <svg height="24" viewBox="0 0 24 24" width="24" style="fill:currentColor"><path d={BACK_ICON} /></svg>
          </button>
        </div>
        <span class="ytp-panel-title" role="heading" aria-level={2}>Toppings</span>
      </div>
      <div class="ytp-panel-menu" role="menu">
        {heading("Watch page")}
        {toggles.map((t) => {
          const flip = () => onToggle(t.id, !t.visible);
          return (
            <div class="ytp-menuitem" role="menuitemcheckbox" aria-checked={t.visible} tabIndex={0} onClick={flip} onKeyDown={onEnter(flip)}>
              <div class="ytp-menuitem-label">{t.label}</div>
              <div class="ytp-menuitem-content"><div class="ytp-menuitem-toggle-checkbox" /></div>
            </div>
          );
        })}
        {heading("Profile")}
        {radio(null, "Default (no profile)")}
        {profiles.map((p) => radio(p.id, p.name))}
      </div>
    </>
  );
}

export function GearEntry() {
  return (
    <>
      <div class="ytp-menuitem-label">Toppings</div>
      <div class="ytp-menuitem-content">
        <svg height="24" viewBox="0 0 24 24" width="24" style="fill:currentColor;opacity:.6"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
      </div>
    </>
  );
}
