import { useEffect, useId, useRef, useState } from "preact/hooks";
import Field from "./Field";
import Icon from "@/ui/primitives/Icon";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SelectProps<T extends string> {
  label: string;
  description?: string;
  hint?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

// A native <select> cannot be themed consistently across browsers.
export default function Select<T extends string>({ label, description, hint, value, options, onChange }: SelectProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(Math.max(0, options.findIndex((o) => o.value === value)));
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) pick(options[active].value);
      else setOpen(true);
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <div class="tw-relative" ref={root}>
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKeyDown}
          class="tw-h-9 tw-w-44 tw-flex tw-items-center tw-justify-between tw-gap-2 tw-px-3 tw-rounded-lg tw-bg-surface-hover tw-text-fg tw-text-sm hover:tw-bg-border-default focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-accent tw-transition-colors"
        >
          <span class="tw-truncate">{selected?.label ?? "Select…"}</span>
          <Icon name="chevron-down" size={14} class={`tw-text-fg-muted tw-transition-transform ${open ? "tw-rotate-180" : ""}`} />
        </button>
        {open && (
          <ul role="listbox" class="tw-absolute tw-right-0 tw-mt-1 tw-w-60 tw-max-h-72 tw-overflow-y-auto tw-bg-surface-2 tw-rounded-xl tw-shadow-xl tw-z-40 tw-py-2">
            {options.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(opt.value)}
                class={`tw-px-4 tw-py-2 tw-cursor-pointer tw-flex tw-items-start tw-gap-3 ${i === active ? "tw-bg-surface-hover" : ""}`}
              >
                <span class="tw-w-4 tw-flex-shrink-0 tw-text-fg">{opt.value === value && <Icon name="check" size={16} />}</span>
                <span class="tw-flex tw-flex-col">
                  <span class="tw-text-sm tw-text-fg">{opt.label}</span>
                  {opt.description && <span class="tw-text-xs tw-text-fg-muted">{opt.description}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
