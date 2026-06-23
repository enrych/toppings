import React, { KeyboardEvent, useEffect, useId, useState } from "react";
import Field from "./Field";
import { formatBindingDisplay, recordBinding } from "../../utils/keybinding";

interface KeybindingProps {
  label: string;
  description?: string;
  hint?: string;
  value: string;
  onChange: (key: string) => void;
}

export default function Keybinding({
  label,
  description,
  hint,
  value,
  onChange,
}: KeybindingProps) {
  const id = useId();
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    // value is the source of truth — no internal shadow needed.
  }, [value]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const isClear = e.keyCode === 8 || e.keyCode === 27; // Backspace / Escape
    if (isClear) {
      onChange("");
      setRecording(false);
      return;
    }

    const combo = recordBinding(e.nativeEvent);
    if (combo !== null) {
      onChange(combo);
      setRecording(false);
    }
    // If combo is null (modifier-only press), stay in recording mode.
  };

  const displayValue = formatBindingDisplay(value);

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <input
        id={id}
        type="text"
        readOnly
        value={recording ? "Press keys…" : displayValue || "(unset)"}
        onFocus={() => setRecording(true)}
        onBlur={() => setRecording(false)}
        onKeyDown={onKeyDown}
        title={value || undefined}
        className={`tw-w-32 tw-px-3 tw-py-2 tw-bg-bg tw-text-fg tw-text-sm tw-text-center tw-font-mono tw-rounded-md tw-border tw-cursor-pointer focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-accent/30 tw-transition-colors ${
          recording
            ? "tw-border-accent tw-text-accent"
            : "tw-border-border-strong hover:tw-border-border-strong"
        }`}
      />
    </Field>
  );
}
