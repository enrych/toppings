import type { ComponentChildren } from "preact";

export default function Card({ children, class: className = "" }: { children: ComponentChildren; class?: string }) {
  return (
    <div class={`tw-bg-surface tw-border tw-border-border-subtle tw-rounded-xl ${className}`}>
      <div class="tw-px-5 tw-py-1 tw-divide-y tw-divide-border-subtle">{children}</div>
    </div>
  );
}
