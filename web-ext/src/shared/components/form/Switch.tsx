import React, { useId, useState } from "react";
import Field from "./Field";

interface SwitchProps {
  label: string;
  description?: string;
  hint?: string;
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

/**
 * Toggle switch row. Uses Field for layout/labelling, so styling stays
 * consistent with Input/Select/Slider/etc.
 */
export default function Switch({
  label,
  description,
  hint,
  isEnabled,
  onToggle,
}: SwitchProps) {
  const [checked, setChecked] = useState(isEnabled);
  const id = useId();

  const handleChange = () => {
    const next = !checked;
    setChecked(next);
    onToggle(next);
  };

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleChange}
        className={`tw-relative tw-inline-flex tw-h-6 tw-w-11 tw-flex-shrink-0 tw-cursor-pointer tw-rounded-full tw-border-2 tw-border-transparent tw-transition-colors tw-duration-200 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent/50 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-bg ${
          checked ? "tw-bg-accent" : "tw-bg-border-strong"
        }`}
      >
        <span
          aria-hidden="true"
          className={`tw-pointer-events-none tw-inline-block tw-h-5 tw-w-5 tw-transform tw-rounded-full tw-bg-white tw-shadow tw-ring-0 tw-transition-transform tw-duration-200 ${
            checked ? "tw-translate-x-5" : "tw-translate-x-0"
          }`}
        />
      </button>
    </Field>
  );
}
