import type { ComponentChildren } from "preact";

interface SectionProps {
  id?: string;
  title: string;
  description?: string;
  actions?: ComponentChildren;
  children: ComponentChildren;
}

export default function Section({ id, title, description, actions, children }: SectionProps) {
  return (
    <section id={id} class="tw-scroll-mt-6">
      <div class="tw-flex tw-items-end tw-justify-between tw-gap-4 tw-mb-3">
        <div>
          <h2 class="tw-text-base tw-font-medium tw-text-fg">{title}</h2>
          {description && <p class="tw-text-sm tw-text-fg-muted tw-mt-0.5">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
