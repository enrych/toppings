import Icon, { type IconName } from "../primitives/Icon";
import IconButton from "../primitives/IconButton";

export type ToastTone = "success" | "error" | "info";

export interface ToastData {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  duration?: number;
}

const ICON: Record<ToastTone, { name: IconName; color: string }> = {
  success: { name: "check", color: "tw-text-success-fg" },
  error: { name: "alert", color: "tw-text-danger-fg" },
  info: { name: "info", color: "tw-text-info-fg" },
};

export default function Toast({ data, onDismiss }: { data: ToastData; onDismiss: (id: string) => void }) {
  const icon = ICON[data.tone];
  return (
    <div role="status" class="tw-flex tw-items-start tw-gap-3 tw-p-3 tw-pr-2 tw-bg-surface-2 tw-rounded-lg tw-shadow-xl tw-min-w-[280px] tw-max-w-md tw-pointer-events-auto tw-animate-[slideInRight_220ms_ease-out]">
      <div class={`tw-mt-0.5 ${icon.color}`}>
        <Icon name={icon.name} size={18} />
      </div>
      <div class="tw-flex-1 tw-min-w-0">
        <div class="tw-text-sm tw-text-fg">{data.title}</div>
        {data.description && <div class="tw-text-xs tw-text-fg-muted tw-mt-0.5">{data.description}</div>}
      </div>
      <IconButton size="sm" aria-label="Dismiss notification" onClick={() => onDismiss(data.id)}>
        <Icon name="x" size={14} />
      </IconButton>
    </div>
  );
}
