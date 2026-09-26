/** @jsxImportSource dom-chef-jsx */
import { setSegmentButtonSaved } from "../SegmentButton";
import { setLastUsed } from "../segmentStore";
import type { SegmentConfig } from "../types";
import { attachMenu, closeOpenMenu } from "./menu";
import { currentVideoId, emitConfigChange, render, savedConfigs } from "./state";
import { btnStyle, dropdownStyle, menuItemStyle } from "./styles";

export async function loadSavedConfig(config: SegmentConfig): Promise<void> {
  if (!currentVideoId) return;
  emitConfigChange(config);
  render(config);
  setSegmentButtonSaved(config.label);
  void setLastUsed(currentVideoId, config);
}

export function buildConfigSwitcher(config: SegmentConfig): HTMLElement {
  const trigger = (
    <button
      style={{
        ...btnStyle("ghost"),
        padding: "2px 8px",
        fontSize: "12px",
        background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08))",
        borderRadius: "4px",
        color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.7))",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
      title="Switch saved config"
    >
      <span>{config.label}</span>
      <span style={{ fontSize: "10px", opacity: "0.7" }}>▾</span>
    </button>
  );

  const menu = <div style={dropdownStyle("left", "180px")} />;

  attachMenu(trigger, menu, () => {
    menu.innerHTML = "";
    if (savedConfigs.length === 0) {
      menu.appendChild(
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))",
            fontStyle: "italic",
          }}
        >
          No saved configs
        </div>,
      );
      return;
    }
    for (const saved of savedConfigs) {
      const isActive = saved.id === config.id;
      menu.appendChild(
        <button
          style={{
            ...menuItemStyle(),
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "var(--yt-spec-call-to-action, #3ea6ff)" : "var(--yt-spec-text-primary, #fff)",
          }}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            closeOpenMenu();
            void loadSavedConfig(saved);
          }}
        >
          {isActive ? "✓ " : "  "}
          {saved.label}
        </button>,
      );
    }
  });

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {trigger}
      {menu}
    </div>
  );
}
