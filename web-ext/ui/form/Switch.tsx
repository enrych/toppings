import { useId } from "preact/hooks";
import Field from "./Field";

interface SwitchProps {
  label: string;
  description?: string;
  hint?: string;
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

// YouTube's toggle: a track that tints to the accent with a white knob.
export function Toggle({ on, onClick, id, label }: { on: boolean; onClick: () => void; id?: string; label?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      class="tw-relative tw-inline-flex tw-h-[14px] tw-w-[36px] tw-flex-shrink-0 tw-rounded-full tw-transition-colors tw-duration-150 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent"
      style={{ background: on ? "color-mix(in srgb, var(--color-accent) 50%, transparent)" : "var(--color-fg-subtle)" }}
    >
      <span
        aria-hidden="true"
        class={`tw-pointer-events-none tw-absolute tw-top-1/2 -tw-translate-y-1/2 tw-h-5 tw-w-5 tw-rounded-full tw-shadow-md tw-transition-transform tw-duration-150 ${
          on ? "tw-bg-accent tw-translate-x-4" : "tw-bg-surface-2 tw-translate-x-0"
        }`}
      />
    </button>
  );
}

export default function Switch({ label, description, hint, isEnabled, onToggle }: SwitchProps) {
  const id = useId();
  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <Toggle id={id} on={isEnabled} onClick={() => onToggle(!isEnabled)} />
    </Field>
  );
}
