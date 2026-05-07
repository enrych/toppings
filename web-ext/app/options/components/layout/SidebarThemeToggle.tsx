import React from "react";
import { ThemePreference } from "../../../../utils/theme";

const THEME_OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: "system", label: "System" },
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
];

export default function SidebarThemeToggle({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (next: ThemePreference) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="tw-inline-flex tw-w-full tw-p-0.5 tw-rounded-full tw-border tw-border-border-default"
      style={{ background: "var(--color-bg)" }}
    >
      {THEME_OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={`tw-flex-1 tw-inline-flex tw-items-center tw-justify-center tw-gap-1 tw-px-2 tw-py-1.5 tw-text-[11px] tw-font-medium tw-rounded-full tw-cursor-pointer tw-transition-colors tw-duration-150 ${
              active
                ? "tw-bg-surface tw-text-fg"
                : "tw-text-fg-muted hover:tw-text-fg"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
