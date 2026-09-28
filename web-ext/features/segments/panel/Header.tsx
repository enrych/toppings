import { useEffect, useRef, useState } from "preact/hooks";
import { generateConfigLabel } from "../factories";
import type { SegmentAutoLoadPin, SegmentConfig } from "../types";
import { Menu } from "./Menu";

export interface HeaderProps {
  config: SegmentConfig;
  saved: SegmentConfig[];
  pin: SegmentAutoLoadPin;
  collapsed: boolean;
  onLoad: (config: SegmentConfig) => void;
  onPin: (pin: SegmentAutoLoadPin) => void;
  onSaveDefault: () => void;
  onSaveNamed: (label: string) => void;
  onManage: () => void;
  onCollapse: () => void;
}

const PIN_OPTIONS: ReadonlyArray<[Exclude<SegmentAutoLoadPin, { configId: string }>, string, string]> = [
  [null, "○", "Use global setting"],
  ["off", "⊗", "Always off for this video"],
  ["last-used", "↺", "Restore last-used"],
  ["default", "★", "Restore default saved config"],
];

function describePin(pin: SegmentAutoLoadPin): { icon: string; title: string } {
  const option = PIN_OPTIONS.find(([value]) => value === pin);
  return option ? { icon: option[1], title: `Auto-load: ${option[2].toLowerCase()}` } : { icon: "📌", title: "Auto-load pin" };
}

export function Header({ config, saved, pin, collapsed, onLoad, onPin, onSaveDefault, onSaveNamed, onManage, onCollapse }: HeaderProps) {
  const [naming, setNaming] = useState<string | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const isNaming = naming !== null;
  useEffect(() => {
    if (isNaming) nameInput.current?.select();
  }, [isNaming]);
  const pinInfo = describePin(pin);

  return (
    <>
      <div class="row header">
        <span class="title">Segments</span>
        <Menu triggerClass="btn chip" title="Switch saved config" trigger={<>{config.label} <span style="font-size:10px;opacity:.7">▾</span></>}>
          {(close) =>
            saved.length === 0 ? (
              <div class="empty">No saved configs</div>
            ) : (
              saved.map((s) => (
                <button class={`item ${s.id === config.id ? "active" : ""}`} onClick={() => (close(), onLoad(s))}>
                  {s.id === config.id ? "✓ " : ""}{s.label}
                </button>
              ))
            )
          }
        </Menu>
        <div class="grow" />
        <Menu triggerClass={`btn tiny ${pin !== null ? "active" : ""}`} title={`${pinInfo.title} — click to change`} trigger={pinInfo.icon} align="right">
          {(close) => (
            <>
              <div class="hint">Auto-load on page open</div>
              {PIN_OPTIONS.map(([value, icon, label]) => (
                <button class={`item ${pin === value ? "active" : ""}`} onClick={() => (close(), onPin(value))}>
                  {icon} {label}
                </button>
              ))}
              {saved.length > 0 && (
                <div class="divider">
                  {saved.map((s) => (
                    <button class={`item muted ${typeof pin === "object" && pin?.configId === s.id ? "active" : ""}`} onClick={() => (close(), onPin({ configId: s.id }))}>
                      📌 {s.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Menu>
        <Menu triggerClass="btn accent" title="Save options" trigger="Save ▾" align="right">
          {(close) => (
            <>
              <button class="item" onClick={() => (close(), onSaveDefault())}>Save to Default Slot</button>
              <button class="item" onClick={() => (close(), setNaming(generateConfigLabel(saved.length)))}>Save as Named Config…</button>
            </>
          )}
        </Menu>
        <button class="btn" title="Manage saved configs" onClick={onManage}>☰</button>
        <button class="btn" title={collapsed ? "Expand panel" : "Collapse panel"} onClick={onCollapse}>{collapsed ? "+" : "−"}</button>
      </div>
      {naming !== null && (
        <div class="row" style="padding:6px 0;margin-bottom:4px">
          <input
            class="input text"
            value={naming}
            placeholder="Config name…"
            ref={nameInput}
            onInput={(e) => setNaming(e.currentTarget.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") (onSaveNamed(naming), setNaming(null));
              if (e.key === "Escape") setNaming(null);
            }}
          />
          <button class="btn accent" onClick={() => (onSaveNamed(naming), setNaming(null))}>Save</button>
          <button class="btn" onClick={() => setNaming(null)}>Cancel</button>
        </div>
      )}
    </>
  );
}
