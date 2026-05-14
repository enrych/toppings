import React, { ReactNode } from "react";
import ActionPopup from "./ActionPopup";

interface ConfirmPopupProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as destructive. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Two-button confirm dialog. Built on ActionPopup. Use directly for one-off
 * confirms, or use the `useConfirm()` hook for an imperative
 * `await confirm(...)` API.
 */
export default function ConfirmPopup({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmPopupProps) {
  return (
    <ActionPopup
      open={open}
      onClose={onCancel}
      title={title}
      description={message}
      actions={[
        { label: cancelLabel, onClick: onCancel, variant: "secondary" },
        {
          label: confirmLabel,
          onClick: onConfirm,
          variant: danger ? "danger" : "primary",
          autoFocus: true,
        },
      ]}
    />
  );
}
