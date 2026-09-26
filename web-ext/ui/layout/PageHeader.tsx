import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="tw-mb-8 tw-pb-6 tw-border-b tw-border-border-default">
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-4">
        <div>
          <h1 className="tw-text-3xl tw-font-bold tw-text-fg tw-tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="tw-text-fg-muted tw-mt-2 tw-text-sm tw-max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="tw-flex tw-gap-2">{actions}</div>}
      </div>
    </div>
  );
}
