import React, { KeyboardEvent, useEffect, useId, useState } from "react";
import Field from "./Field";

interface KeybindingProps {
  label: string;
  description?: string;
  hint?: string;
  value: string;
  onChange: (key: string) => void;
}

/**
 * Single-key capture input. Click/focus to capture, then press a letter or
 * number. Backspace/Escape clears the binding.
 */
export default function Keybinding({
  label,
  description,
  hint,
  value,
  onChange,
}: KeybindingProps) {
  const id = useId();
  const [recording, setRecording] = useState(false);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const isLetterOrDigit =
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 65 && e.keyCode <= 90);
    const isClear = e.keyCode === 8 || e.keyCode === 27;

    if (isLetterOrDigit) {
      e.preventDefault();
      const key = String.fromCharCode(e.keyCode);
      setDisplay(key);
      onChange(key);
    } else if (isClear) {
      e.preventDefault();
      setDisplay("");
      onChange("");
    }
  };

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <input
        id={id}
        type="text"
        readOnly
        value={recording ? "Press a key…" : display || "(unset)"}
        onFocus={() => setRecording(true)}
        onBlur={() => setRecording(false)}
        onKeyDown={onKeyDown}
        className={`tw-w-32 tw-px-3 tw-py-2 tw-bg-[#0a0a0c] tw-text-white tw-text-sm tw-text-center tw-font-mono tw-rounded-md tw-border tw-cursor-pointer focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500/30 tw-transition-colors ${
          recording
            ? "tw-border-blue-500 tw-text-blue-300"
            : "tw-border-gray-600/50 hover:tw-border-gray-500"
        }`}
      />
    </Field>
  );
}
