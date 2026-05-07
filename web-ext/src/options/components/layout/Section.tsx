import React, { ReactNode } from "react";

interface SectionProps {
  /** Optional id — used as the anchor target for in-page navigation. */
  id?: string;
  title: string;
  description?: string;
  /** Optional element rendered top-right of the section header (button, badge, etc.). */
  headerActions?: ReactNode;
  children: ReactNode;
}

/**
 * A titled grouping within a settings page. The `id` is used by the in-page
 * anchor nav to scroll to the section when clicked.
 */
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
          <h2 className="tw-text-lg tw-font-semibold tw-text-white">{title}</h2>
          {description && (
            <p className="tw-text-sm tw-text-gray-500 tw-mt-1">{description}</p>
          )}
        </div>
        {headerActions && <div>{headerActions}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}
