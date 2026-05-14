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
 * Toggle switch row — matches the Claude Design handoff for the extension UI:
 *   - 34×20px pill
 *   - 16×16 round handle with 2px inset
 *   - Off state: handle is `fg` color on a 10%-on-bg track
 *   - On state: track is amber, handle becomes `on-accent` (ink) at +14px
 *
 * Composes Field so spacing/labels stay consistent with the rest of the
 * form components.
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
        className={`tw-relative tw-inline-flex tw-h-5 tw-w-[34px] tw-flex-shrink-0 tw-cursor-pointer tw-rounded-full tw-transition-colors tw-duration-[240ms] tw-ease-out focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent/50 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-bg ${
          checked
            ? "tw-bg-accent"
            : "tw-bg-surface-hover tw-border tw-border-border-default"
        }`}
      >
        <span
          aria-hidden="true"
          className={`tw-pointer-events-none tw-absolute tw-top-[2px] tw-left-[2px] tw-inline-block tw-h-4 tw-w-4 tw-transform tw-rounded-full tw-transition-transform tw-duration-[240ms] tw-ease-out ${
            checked ? "tw-bg-[--color-accent-fg] tw-translate-x-[14px]" : "tw-bg-fg tw-translate-x-0"
          }`}
        />
      </button>
    </Field>
  );
}
