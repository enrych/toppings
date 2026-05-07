import React from "react";
import Icon, { IconName } from "../primitives/Icon";
import IconButton from "../primitives/IconButton";

export type ToastTone = "success" | "error" | "info";

export interface ToastData {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Auto-dismiss after this many ms. 0 = manual dismiss only. */
  duration?: number;
}

const TONE_STYLES: Record<
  ToastTone,
  { border: string; iconColor: string; icon: IconName }
> = {
  success: {
    border: "tw-border-green-500/40",
    iconColor: "tw-text-green-400",
    icon: "check",
  },
  error: {
    border: "tw-border-red-500/40",
    iconColor: "tw-text-red-400",
    icon: "alert",
  },
  info: {
    border: "tw-border-blue-500/40",
    iconColor: "tw-text-blue-400",
    icon: "info",
  },
};

interface ToastProps {
  data: ToastData;
  onDismiss: (id: string) => void;
}

export default function Toast({ data, onDismiss }: ToastProps) {
  const style = TONE_STYLES[data.tone];

  return (
    <div
      role="status"
      className={`tw-flex tw-items-start tw-gap-3 tw-p-3 tw-pr-2 tw-bg-[#1a1a1f] tw-border ${style.border} tw-rounded-lg tw-shadow-xl tw-min-w-[280px] tw-max-w-md tw-pointer-events-auto tw-animate-[slideInRight_220ms_ease-out]`}
    >
      <div className={`tw-mt-0.5 ${style.iconColor}`}>
        <Icon name={style.icon} size={18} />
      </div>
      <div className="tw-flex-1 tw-min-w-0">
        <div className="tw-text-sm tw-font-medium tw-text-white">
          {data.title}
        </div>
        {data.description && (
          <div className="tw-text-xs tw-text-gray-400 tw-mt-0.5">
            {data.description}
          </div>
        )}
      </div>
      <IconButton
        size="sm"
        variant="ghost"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(data.id)}
      >
        <Icon name="x" size={14} />
      </IconButton>
    </div>
  );
}
