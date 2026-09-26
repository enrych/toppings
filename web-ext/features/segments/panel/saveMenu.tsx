/** @jsxImportSource dom-chef-jsx */
import { showPageToast } from "@/lib/pageToast";
import { generateConfigLabel } from "../factories";
import { setSegmentButtonSaved } from "../SegmentButton";
import { saveNamedConfig, setDefaultConfig } from "../segmentStore";
import type { SegmentConfig } from "../types";
import { attachMenu, closeOpenMenu } from "./menu";
import { currentVideoId, emitConfigChange, reloadSavedConfigs, render, savedConfigs } from "./state";
import { btnStyle, dropdownStyle, menuItemStyle } from "./styles";

const FORM_ID = "tppng-sp-save-form";

export function buildSaveMenu(config: SegmentConfig): HTMLElement {
  const trigger = (
    <button style={btnStyle("accent")} title="Save options">
      Save ▾
    </button>
  );

  const menu = (
    <div style={dropdownStyle("right", "170px")}>
      <button
        style={menuItemStyle()}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          closeOpenMenu();
          void saveAsDefault(config);
        }}
      >
        Save to Default Slot
      </button>
      <button
        style={menuItemStyle()}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          closeOpenMenu();
          showSaveNameForm(config);
        }}
      >
        Save as Named Config…
      </button>
    </div>
  );

  attachMenu(trigger, menu);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {trigger}
      {menu}
    </div>
  );
}

function showSaveNameForm(config: SegmentConfig): void {
  const header = document.getElementById("tppng-sp-header");
  if (!header) return;
  document.getElementById(FORM_ID)?.remove();

  const input = (
    <input
      type="text"
      value={generateConfigLabel(savedConfigs.length)}
      placeholder="Config name…"
      style={{
        flex: 1,
        background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08))",
        border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.2))",
        borderRadius: "4px",
        color: "var(--yt-spec-text-primary, #fff)",
        fontSize: "12px",
        padding: "4px 8px",
        fontFamily: "inherit",
        outline: "none",
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          void saveNamed(config, input.value);
        }
        if (e.key === "Escape") form.remove();
      }}
    />
  ) as HTMLInputElement;

  const form = (
    <div id={FORM_ID} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 0", marginBottom: "4px" }}>
      {input}
      <button style={btnStyle("accent")} onClick={() => void saveNamed(config, input.value)}>
        Save
      </button>
      <button style={btnStyle("ghost")} onClick={() => form.remove()}>
        Cancel
      </button>
    </div>
  );

  header.after(form);
  requestAnimationFrame(() => input.select());
}

async function saveNamed(config: SegmentConfig, rawLabel: string): Promise<void> {
  const label = rawLabel.trim();
  if (!label || !currentVideoId) return;
  const named: SegmentConfig = { ...config, label, updatedAt: Date.now() };
  await saveNamedConfig(currentVideoId, named);
  await reloadSavedConfigs();
  document.getElementById(FORM_ID)?.remove();
  emitConfigChange(named);
  render(named);
  setSegmentButtonSaved(label);
  showPageToast(`Saved as "${label}" ✓`);
}

async function saveAsDefault(config: SegmentConfig): Promise<void> {
  if (!currentVideoId) return;
  const named = { ...config, updatedAt: Date.now() };
  await saveNamedConfig(currentVideoId, named);
  await setDefaultConfig(currentVideoId, named.id);
  await reloadSavedConfigs();
  setSegmentButtonSaved(named.label);
  showPageToast("Saved to default slot ✓");
}
