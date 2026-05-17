import React, {
  useEffect,
  useId,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import Field from "./Field";
import Icon from "../primitives/Icon";

interface SelectOption<T extends string> {
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

/**
 * Custom dropdown styled to match the rest of the form. Renders a button
 * trigger and a popover list. Closes on outside click, Escape, and selection.
 * Keyboard: ArrowDown/ArrowUp to navigate, Enter to select, Escape to close.
 *
 * Why not use native <select>: native dropdowns can't be themed consistently
 * across OS/browser combinations and look out of place against the dark UI.
 */
export default function Select<T extends string>({
  label,
  description,
  hint,
  value,
  options,
  onChange,
}: SelectProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(
      0,
      options.findIndex((o) => o.value === value),
    ),
  );
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        listRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const select = (optionValue: T) => {
    onChange(optionValue);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((i) => (i + delta + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) select(options[activeIndex].value);
      else setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <div className="tw-relative">
        <button
          id={id}
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onKeyDown}
          className="tw-w-44 tw-flex tw-items-center tw-justify-between tw-gap-2 tw-px-3 tw-py-2 tw-bg-bg tw-text-fg tw-text-sm tw-rounded-md tw-border tw-border-border-strong focus-visible:tw-outline-none focus-visible:tw-border-accent focus-visible:tw-ring-2 focus-visible:tw-ring-accent/30 hover:tw-border-border-strong tw-transition-colors"
        >
          <span className="tw-truncate">{selected?.label ?? "Select..."}</span>
          <Icon
            name="chevron-down"
            size={14}
            className={`tw-text-fg-muted tw-transition-transform ${open ? "tw-rotate-180" : ""}`}
          />
        </button>
        {open && (
          <ul
            ref={listRef}
            role="listbox"
            className="tw-absolute tw-right-0 tw-mt-1 tw-w-56 tw-max-h-72 tw-overflow-y-auto tw-bg-surface-2 tw-border tw-border-border-strong tw-rounded-md tw-shadow-xl tw-z-40 tw-py-1"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isActive = i === activeIndex;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => select(opt.value)}
                  className={`tw-px-3 tw-py-2 tw-cursor-pointer tw-flex tw-items-start tw-gap-2 ${
                    isActive ? "tw-bg-surface-hover" : ""
                  } ${isSelected ? "tw-text-fg" : "tw-text-fg-muted"}`}
                >
                  <span
                    className={`tw-mt-1.5 tw-w-1.5 tw-h-1.5 tw-rounded-full ${
                      isSelected ? "tw-bg-accent" : "tw-bg-transparent"
                    }`}
                  />
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-sm">{opt.label}</span>
                    {opt.description && (
                      <span className="tw-text-xs tw-text-fg-subtle">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Field>
  );
}

export type { SelectOption };
