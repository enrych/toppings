import React, { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Click on backdrop dismisses popup. Default true. */
  closeOnBackdrop?: boolean;
  /** Escape key dismisses popup. Default true. */
  closeOnEscape?: boolean;
  /** Aria label for the dialog (used when no visible header). */
  ariaLabel?: string;
  ariaLabelledBy?: string;
  /** Override max-width. Default tw-max-w-md. */
  widthClass?: string;
}

/**
 * Base popup primitive. Renders a centered modal in a React portal with a
 * backdrop, focus management, and dismissal handlers. Pure layout shell —
 * no header/footer/actions. Compose into ActionPopup / ConfirmPopup /
 * custom dialogs for higher-level patterns.
 *
 * Accessibility:
 * - role="dialog" + aria-modal
 * - focuses the dialog on mount, restores focus on close
 * - traps Tab within dialog while open
 * - Escape closes (configurable)
 */
export default function Popup({
  open,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  ariaLabel,
  ariaLabelledBy,
  widthClass = "tw-max-w-md",
}: PopupProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        // Trap focus within the dialog.
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Lock body scroll while modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="tw-fixed tw-inset-0 tw-z-[10000] tw-flex tw-items-center tw-justify-center tw-p-4"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-hidden="true"
        className="tw-absolute tw-inset-0 tw-bg-black/70 tw-backdrop-blur-sm tw-animate-[fadeIn_150ms_ease-out]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className={`tw-relative tw-w-full ${widthClass} tw-bg-[#18181b] tw-border tw-border-gray-700/50 tw-rounded-xl tw-shadow-2xl tw-text-gray-100 focus:tw-outline-none tw-animate-[popIn_180ms_ease-out]`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
