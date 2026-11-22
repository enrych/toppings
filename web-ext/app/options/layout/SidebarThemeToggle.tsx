import type { ThemePreference } from "@/ui/useTheme";

const OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: "system", label: "System" },
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
];

export default function SidebarThemeToggle({ value, onChange }: { value: ThemePreference; onChange: (next: ThemePreference) => void }) {
  return (
    <div role="radiogroup" aria-label="Appearance" class="tw-inline-flex tw-w-full tw-p-0.5 tw-rounded-full tw-bg-surface-hover">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          onClick={() => onChange(opt.id)}
          class={`tw-flex-1 tw-h-7 tw-text-xs tw-font-medium tw-rounded-full tw-transition-colors ${value === opt.id ? "tw-bg-fg tw-text-bg" : "tw-text-fg-muted hover:tw-text-fg"}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
