/** @jsxImportSource dom-chef-jsx */
import { deleteNamedConfig, getVideoSegmentData, saveNamedConfig, setDefaultConfig } from "../segmentStore";
import type { SegmentConfig } from "../types";
import { loadSavedConfig } from "./configSwitcher";
import { currentVideoId, reloadSavedConfigs, render, savedConfigs, setViewMode } from "./state";
import { btnStyle, numInputStyle } from "./styles";

export function buildConfigManager(current: SegmentConfig): HTMLElement {
  const wrapper = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <button
          style={btnStyle("ghost")}
          title="Back to editor"
          onClick={() => {
            setViewMode("main");
            render(current);
          }}
        >
          ← Back
        </button>
        <span style={{ fontWeight: 700, fontSize: "13px" }}>Saved Configs</span>
      </div>
    </div>
  );

  if (savedConfigs.length === 0) {
    wrapper.appendChild(
      <div style={{ padding: "16px", textAlign: "center", color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))", fontSize: "12px", fontStyle: "italic" }}>
        No saved configs yet. Use Save ▾ → Save as Named Config to create one.
      </div>,
    );
    return wrapper;
  }

  const list = <div style={{ display: "flex", flexDirection: "column", gap: "6px" }} />;
  wrapper.appendChild(list);

  void (async () => {
    const data = await getVideoSegmentData(currentVideoId ?? "");
    const defaultId = data?.defaultConfigId ?? null;
    for (const saved of savedConfigs) {
      list.appendChild(buildManagerRow(saved, saved.id === defaultId, saved.id === current.id, current));
    }
  })();

  return wrapper;
}

function buildManagerRow(saved: SegmentConfig, isDefault: boolean, isLoaded: boolean, current: SegmentConfig): HTMLElement {
  const row = <div />;

  const update = async (change: Partial<SegmentConfig>) => {
    if (!currentVideoId) return;
    await saveNamedConfig(currentVideoId, { ...saved, ...change, updatedAt: Date.now() });
    await reloadSavedConfigs();
  };

  const rename = async (label: string) => {
    if (!label.trim()) return;
    await update({ label: label.trim() });
    render(current);
  };

  const renderEditing = () => {
    const input = (
      <input
        type="text"
        value={saved.label}
        style={{ ...numInputStyle(), width: "120px", padding: "4px 8px" }}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter") void rename(input.value);
          if (e.key === "Escape") renderReading();
        }}
      />
    ) as HTMLInputElement;
    row.replaceChildren(
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {input}
        <button style={btnStyle("accent")} onClick={() => void rename(input.value)}>
          OK
        </button>
        <button style={btnStyle("ghost")} onClick={renderReading}>
          Cancel
        </button>
      </div>,
    );
    requestAnimationFrame(() => input.select());
  };

  const renderReading = () => {
    row.replaceChildren(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          background: isLoaded ? "var(--yt-spec-call-to-action, #3ea6ff)18" : "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.05))",
          borderRadius: "8px",
          borderLeft: isLoaded ? "3px solid var(--yt-spec-call-to-action, #3ea6ff)" : "3px solid transparent",
          flexWrap: "wrap",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--yt-spec-text-primary, #fff)",
            fontSize: "13px",
            fontWeight: isLoaded ? 700 : 400,
            padding: 0,
            textAlign: "left",
            flex: 1,
            fontFamily: "inherit",
          }}
          title="Load this config"
          onClick={() => {
            setViewMode("main");
            void loadSavedConfig(saved);
          }}
        >
          {saved.label}
        </button>

        {isDefault && (
          <span
            style={{
              fontSize: "10px",
              color: "var(--yt-spec-call-to-action, #3ea6ff)",
              border: "1px solid var(--yt-spec-call-to-action, #3ea6ff)",
              borderRadius: "3px",
              padding: "1px 5px",
            }}
          >
            default
          </span>
        )}

        <input
          type="text"
          value={saved.shortcutKey ?? ""}
          placeholder="shortcut"
          title="Keyboard shortcut to load this config (e.g. Ctrl+1)"
          style={{ ...numInputStyle(), width: "70px" }}
          onBlur={(e: Event) => void update({ shortcutKey: (e.target as HTMLInputElement).value.trim() })}
          onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
        />

        {!isDefault && (
          <button
            style={{ ...btnStyle("ghost"), fontSize: "11px", padding: "2px 5px" }}
            title="Set as default config"
            onClick={async () => {
              if (!currentVideoId) return;
              await setDefaultConfig(currentVideoId, saved.id);
              await reloadSavedConfigs();
              render(current);
            }}
          >
            ★
          </button>
        )}

        <button style={{ ...btnStyle("ghost"), fontSize: "11px", padding: "2px 5px" }} title="Rename" onClick={renderEditing}>
          ✎
        </button>

        <button
          style={{ ...btnStyle("ghost"), fontSize: "11px", padding: "2px 5px" }}
          title="Delete config"
          onClick={async () => {
            if (!currentVideoId) return;
            await deleteNamedConfig(currentVideoId, saved.id);
            await reloadSavedConfigs();
            render(current);
          }}
        >
          ✕
        </button>
      </div>,
    );
  };

  renderReading();
  return row;
}
