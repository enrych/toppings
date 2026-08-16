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
  stacked?: boolean;
}

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
        className="tw-text-[15px] tw-font-medium tw-text-fg tw-leading-tight"
      >
        {label}
      </label>
      {description && (
        <Tooltip text={description}>
          <Icon
            name="info"
            size={16}
            className="tw-text-fg-subtle hover:tw-text-fg-muted"
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
            className={`tw-text-xs ${error ? "tw-text-danger-fg" : "tw-text-fg-subtle"}`}
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
          className={`tw-text-xs ${error ? "tw-text-danger-fg" : "tw-text-fg-subtle"}`}
        >
          {error || hint}
        </div>
      )}
    </div>
  );
}
