import { useId, useState } from "preact/hooks";
import Field from "./Field";
import { formatBindingDisplay, recordBinding } from "@/kernel/keybinding";

interface KeybindingProps {
  label: string;
  description?: string;
  hint?: string;
  value: string;
  onChange: (key: string) => void;
}

export default function Keybinding({ label, description, hint, value, onChange }: KeybindingProps) {
  const id = useId();
  const [recording, setRecording] = useState(false);

  const onKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "Backspace" || e.key === "Escape") {
      onChange("");
      setRecording(false);
      return;
    }
    // A modifier-only press keeps recording rather than committing.
    const combo = recordBinding(e);
    if (combo === null) return;
    onChange(combo);
    setRecording(false);
  };

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <input
        id={id}
        type="text"
        readOnly
        value={recording ? "Press keys…" : formatBindingDisplay(value) || "Unset"}
        onFocus={() => setRecording(true)}
        onBlur={() => setRecording(false)}
        onKeyDown={onKeyDown}
        title={value || undefined}
        class={`tw-w-32 tw-h-9 tw-px-3 tw-rounded-lg tw-text-sm tw-text-center tw-font-mono tw-cursor-pointer tw-border focus:tw-outline-none tw-transition-colors ${
          recording ? "tw-border-accent tw-text-accent tw-bg-surface-hover" : "tw-border-transparent tw-bg-surface-hover tw-text-fg"
        } ${!value && !recording ? "tw-text-fg-subtle" : ""}`}
      />
    </Field>
  );
}
