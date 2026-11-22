import { useEffect, useRef, useState } from "preact/hooks";
import { generateConfigLabel } from "../factories";
import type { SegmentConfig } from "../types";
import { Menu } from "./Menu";

export interface HeaderProps {
  saved: SegmentConfig[];
  // The saved config the working copy belongs to, if any.
  loaded: SegmentConfig | null;
  collapsed: boolean;
  onLoad: (config: SegmentConfig) => void;
  onSave: () => void;
  onSaveNamed: (label: string) => void;
  onManage: () => void;
  onCollapse: () => void;
}

export function Header({ saved, loaded, collapsed, onLoad, onSave, onSaveNamed, onManage, onCollapse }: HeaderProps) {
  const [naming, setNaming] = useState<string | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const isNaming = naming !== null;
  useEffect(() => {
    if (isNaming) nameInput.current?.select();
  }, [isNaming]);

  return (
    <>
      <div class="row header">
        <span class="title">Segments</span>
        <Menu triggerClass="btn chip" title="Switch saved config" trigger={<>{loaded?.label ?? "Unsaved"} <span style="font-size:10px;opacity:.7">▾</span></>}>
          {(close) =>
            saved.length === 0 ? (
              <div class="empty">No saved configs</div>
            ) : (
              saved.map((s) => (
                <button class={`item ${s === loaded ? "active" : ""}`} onClick={() => (close(), onLoad(s))}>
                  {s === loaded ? "✓ " : ""}{s.label}
                </button>
              ))
            )
          }
        </Menu>
        <div class="grow" />
        {loaded && <button class="btn accent" title={`Overwrite "${loaded.label}"`} onClick={onSave}>Save</button>}
        <button class={loaded ? "btn" : "btn accent"} title="Save as a new named config" onClick={() => setNaming(generateConfigLabel(saved.length))}>Save as…</button>
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
