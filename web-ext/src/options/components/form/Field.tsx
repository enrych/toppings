import React, { ReactNode } from "react";
import Icon from "../primitives/Icon";
import Tooltip from "../primitives/Tooltip";

interface FieldProps {
  label: string;
  description?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  /** When true, label and control stack vertically. Default is horizontal. */
  stacked?: boolean;
}

/**
 * The canonical "settings row" wrapper. Pair a label (with optional inline
 * description tooltip) with a control on the right. Use `hint` for helper
 * text rendered below the control, and `error` for validation errors.
 *
 * All form components (Switch, Input, Select, etc.) compose this so spacing,
 * label styling, and accessibility stay consistent across the app.
 */
export default function Field({
  label,
  description,
  hint,
  error,
  htmlFor,
  children,
  stacked = false,
}: FieldProps) {
  const labelEl = (
    <div className="tw-flex tw-items-center tw-gap-2">
      <label
        htmlFor={htmlFor}
        className="tw-text-[15px] tw-font-medium tw-text-gray-100 tw-leading-tight"
      >
        {label}
      </label>
      {description && (
        <Tooltip text={description}>
          <Icon
            name="info"
            size={16}
            className="tw-text-gray-500 hover:tw-text-gray-300"
          />
        </Tooltip>
      )}
    </div>
  );

  if (stacked) {
    return (
      <div className="tw-w-full tw-flex tw-flex-col tw-gap-2 tw-py-3">
        {labelEl}
        <div>{children}</div>
        {(hint || error) && (
          <div
            className={`tw-text-xs ${error ? "tw-text-red-400" : "tw-text-gray-500"}`}
          >
            {error || hint}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tw-w-full tw-flex tw-flex-col tw-gap-1 tw-py-3">
      <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-gap-4">
        {labelEl}
        <div className="tw-flex-shrink-0">{children}</div>
      </div>
      {(hint || error) && (
        <div
          className={`tw-text-xs ${error ? "tw-text-red-400" : "tw-text-gray-500"}`}
        >
          {error || hint}
        </div>
      )}
    </div>
  );
}
