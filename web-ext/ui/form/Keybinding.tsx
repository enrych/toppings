import { useId, useState } from "preact/hooks";
import Field from "./Field";
import Button from "@/ui/primitives/Button";
import { formatBindingDisplay, recordBinding } from "@/kernel/keybinding";

interface KeybindingProps {
  label: string;
  description?: string;
  hint?: string;
  value: string;
  onChange: (key: string) => void;
  onReset?: () => void;
}

export default function Keybinding({ label, description, hint, value, onChange, onReset }: KeybindingProps) {
  const id = useId();
  const [recording, setRecording] = useState(false);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab") return;
    if (!recording) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      setRecording(true);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "Escape") {
      setRecording(false);
      return;
    }
    if (e.key === "Backspace") {
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
      <div class="tw-flex tw-items-center tw-gap-2">
        {onReset && (
          <Button size="sm" variant="ghost" title="Back to the default shortcut" onClick={onReset}>
            Reset
          </Button>
        )}
        <input
          id={id}
          type="text"
          readOnly
          value={recording ? "Press keys…" : formatBindingDisplay(value) || "Unset"}
          onFocus={() => setRecording(true)}
          onClick={() => setRecording(true)}
          onBlur={() => setRecording(false)}
          onKeyDown={onKeyDown}
          title={value || undefined}
          class={`tw-w-32 tw-h-9 tw-px-3 tw-rounded-lg tw-text-sm tw-text-center tw-font-mono tw-cursor-pointer tw-border focus:tw-outline-none tw-transition-colors ${
            recording ? "tw-border-accent tw-text-accent tw-bg-surface-hover" : "tw-border-transparent tw-bg-surface-hover tw-text-fg"
          } ${!value && !recording ? "tw-text-fg-subtle" : ""}`}
        />
      </div>
    </Field>
  );
}
