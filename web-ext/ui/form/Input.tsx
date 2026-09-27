import { useEffect, useId, useRef, useState } from "preact/hooks";
import Field from "./Field";
import Icon from "@/ui/primitives/Icon";

interface InputProps {
  label: string;
  description?: string;
  hint?: string;
  initialValue: string;
  placeholder?: string;
  validator?: (value: string) => boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  widthClass?: string;
}

type Status = "idle" | "checking" | "valid" | "invalid";

// Commits after a short pause in typing, and only when the value validates,
// so storage never sees a half-typed number.
export default function Input({ label, description, hint, initialValue, placeholder, validator, errorMessage, onChange, widthClass = "tw-w-44" }: InputProps) {
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const pending = useRef<() => boolean>();

  useEffect(() => setValue(initialValue), [initialValue]);
  useEffect(() => () => {
    clearTimeout(timer.current);
    pending.current?.();
  }, []);

  const onInput = (next: string) => {
    setValue(next);
    clearTimeout(timer.current);
    if (!validator) return onChange(next);
    setStatus("checking");
    const commit = () => {
      pending.current = undefined;
      if (!validator(next)) return false;
      onChange(next);
      return true;
    };
    pending.current = commit;
    timer.current = setTimeout(() => {
      if (!commit()) return setStatus("invalid");
      setStatus("valid");
      timer.current = setTimeout(() => setStatus("idle"), 1200);
    }, 500);
  };

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id} error={status === "invalid" ? (errorMessage ?? "Invalid value") : undefined}>
      <div class="tw-relative tw-inline-flex tw-items-center">
        <input
          id={id}
          type="text"
          class={`${widthClass} tw-h-9 tw-px-3 tw-rounded-lg tw-bg-surface-hover tw-text-fg tw-text-sm tw-border tw-border-transparent focus:tw-outline-none focus:tw-border-accent tw-transition-colors`}
          placeholder={placeholder}
          value={value}
          onInput={(e) => onInput(e.currentTarget.value)}
        />
        {status !== "idle" && (
          <span class="tw-absolute tw-right-2 tw-pointer-events-none">
            {status === "checking" && <span class="tw-block tw-w-3.5 tw-h-3.5 tw-rounded-full tw-border-2 tw-border-fg-subtle tw-border-t-accent tw-animate-spin" />}
            {status === "valid" && <Icon name="check" size={16} class="tw-text-success-fg" />}
            {status === "invalid" && <Icon name="x" size={16} class="tw-text-danger-fg" />}
          </span>
        )}
      </div>
    </Field>
  );
}
