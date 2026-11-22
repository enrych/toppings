import { useEffect, useRef, useState } from "preact/hooks";
import type { SegmentConfig } from "../types";

export interface ConfigManagerProps {
  current: SegmentConfig;
  saved: SegmentConfig[];
  defaultId: string | null;
  onBack: () => void;
  onLoad: (config: SegmentConfig) => void;
  onRename: (configId: string, label: string) => void;
  onSetDefault: (configId: string) => void;
  onDelete: (configId: string) => void;
}

export function ConfigManager({ current, saved, defaultId, onBack, onLoad, onRename, onSetDefault, onDelete }: ConfigManagerProps) {
  return (
    <div>
      <div class="row header">
        <button class="btn" title="Back to editor" onClick={onBack}>← Back</button>
        <span class="title">Saved Configs</span>
      </div>
      {saved.length === 0 ? (
        <div class="empty" style="text-align:center;padding:16px">No saved configs yet. Use Save as… to create one.</div>
      ) : (
        <div class="stack">
          {saved.map((config) => (
            <SavedRow
              key={config.id}
              config={config}
              isDefault={config.id === defaultId}
              isLoaded={config.id === current.id}
              onLoad={() => onLoad(config)}
              onRename={(label) => onRename(config.id, label)}
              onSetDefault={() => onSetDefault(config.id)}
              onDelete={() => onDelete(config.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SavedRowProps {
  config: SegmentConfig;
  isDefault: boolean;
  isLoaded: boolean;
  onLoad: () => void;
  onRename: (label: string) => void;
  onSetDefault: () => void;
  onDelete: () => void;
}

function SavedRow({ config, isDefault, isLoaded, onLoad, onRename, onSetDefault, onDelete }: SavedRowProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const draftInput = useRef<HTMLInputElement>(null);
  const isRenaming = draft !== null;
  useEffect(() => {
    if (isRenaming) draftInput.current?.select();
  }, [isRenaming]);

  if (draft !== null) {
    const commit = () => {
      if (draft.trim()) onRename(draft.trim());
      setDraft(null);
    };
    return (
      <div class="row">
        <input
          class="input text"
          value={draft}
          ref={draftInput}
          onInput={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setDraft(null);
          }}
        />
        <button class="btn accent" onClick={commit}>OK</button>
        <button class="btn" onClick={() => setDraft(null)}>Cancel</button>
      </div>
    );
  }

  return (
    <div class={`saved ${isLoaded ? "loaded" : ""}`}>
      <button class="name" title="Load this config" onClick={onLoad}>{config.label}</button>
      {isDefault && <span class="badge">default</span>}
      {!isDefault && <button class="btn tiny" title="Set as default config" onClick={onSetDefault}>★</button>}
      <button class="btn tiny" title="Rename" onClick={() => setDraft(config.label)}>✎</button>
      <button class="btn tiny" title="Delete config" onClick={onDelete}>✕</button>
    </div>
  );
}
