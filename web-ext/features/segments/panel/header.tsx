/** @jsxImportSource dom-chef-jsx */
import type { SegmentConfig } from "../types";
import { buildConfigSwitcher } from "./configSwitcher";
import { buildPinButton } from "./pinButton";
import { buildSaveMenu } from "./saveMenu";
import { panelCollapsed, render, setViewMode, toggleCollapsed } from "./state";
import { btnStyle } from "./styles";

export function buildHeader(config: SegmentConfig): HTMLElement {
  const collapseTitle = (collapsed: boolean) => (collapsed ? "Expand panel" : "Collapse panel");

  const collapse = (
    <button
      style={btnStyle("ghost")}
      title={collapseTitle(panelCollapsed)}
      onClick={() => {
        const collapsed = toggleCollapsed();
        const body = document.getElementById("tppng-sp-body");
        if (body) body.style.display = collapsed ? "none" : "block";
        collapse.textContent = collapsed ? "+" : "−";
        collapse.title = collapseTitle(collapsed);
      }}
    >
      {panelCollapsed ? "+" : "−"}
    </button>
  );

  return (
    <div id="tppng-sp-header" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
      <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--yt-spec-text-primary, #fff)", letterSpacing: "0.01em" }}>
        Segments
      </span>
      {buildConfigSwitcher(config)}
      <div style={{ flex: 1 }} />
      {buildPinButton(config)}
      {buildSaveMenu(config)}
      <button
        style={btnStyle("ghost")}
        title="Manage saved configs"
        onClick={() => {
          setViewMode("manage");
          render(config);
        }}
      >
        ☰
      </button>
      {collapse}
    </div>
  );
}
