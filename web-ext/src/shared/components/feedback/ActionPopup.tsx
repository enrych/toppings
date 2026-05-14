import React, { ReactNode, useId } from "react";
import Popup from "./Popup";
import Button, { ButtonVariant } from "../primitives/Button";

interface PopupAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  /** Auto-focus this button on open. */
  autoFocus?: boolean;
  disabled?: boolean;
}

interface ActionPopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  /** Body content rendered between description and actions. */
  children?: ReactNode;
  actions: PopupAction[];
  /** Close on backdrop click / Escape (default true). */
  dismissable?: boolean;
  widthClass?: string;
}

/**
 * Popup with a standard header (title + optional description), body slot,
 * and footer action buttons. Most product dialogs (confirm, prompt,
 * information) should use this rather than the bare Popup.
 *
 * Composition: extend by wrapping ActionPopup with a more specific API
 * (see ConfirmPopup as the canonical example).
 */
export default function ActionPopup({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  dismissable = true,
  widthClass,
}: ActionPopupProps) {
  const titleId = useId();

  return (
    <Popup
      open={open}
      onClose={onClose}
      ariaLabelledBy={titleId}
      closeOnBackdrop={dismissable}
      closeOnEscape={dismissable}
      widthClass={widthClass}
    >
      <div className="tw-px-6 tw-pt-6 tw-pb-4">
        <h2
          id={titleId}
          className="tw-text-lg tw-font-semibold tw-text-fg tw-leading-tight"
        >
          {title}
        </h2>
        {description && (
          <p className="tw-mt-2 tw-text-sm tw-text-fg-muted tw-leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="tw-px-6 tw-pb-4">{children}</div>}
      <div className="tw-px-6 tw-py-4 tw-flex tw-justify-end tw-gap-2 tw-border-t tw-border-border-subtle tw-bg-surface-hover tw-rounded-b-xl">
        {actions.map((action, i) => (
          <Button
            key={i}
            variant={action.variant ?? "secondary"}
            size="md"
            autoFocus={action.autoFocus}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </Popup>
  );
}

export type { PopupAction };
