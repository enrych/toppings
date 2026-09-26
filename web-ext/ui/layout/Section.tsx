import React, { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title: string;
  description?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

export default function Section({
  id,
  title,
  description,
  headerActions,
  children,
}: SectionProps) {
  return (
    <section id={id} className="tw-scroll-mt-6">
      <div className="tw-flex tw-items-end tw-justify-between tw-mb-3">
        <div>
          <h2 className="tw-text-lg tw-font-semibold tw-text-fg">{title}</h2>
          {description && (
            <p className="tw-text-sm tw-text-fg-muted tw-mt-1">{description}</p>
          )}
        </div>
        {headerActions && <div>{headerActions}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}
