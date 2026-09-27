import type { ComponentChildren } from "preact";
import Icon from "@/ui/primitives/Icon";
import Tooltip from "@/ui/primitives/Tooltip";

interface FieldProps {
  label: string;
  description?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ComponentChildren;
}

export default function Field({ label, description, hint, error, htmlFor, children }: FieldProps) {
  return (
    <div class="tw-w-full tw-flex tw-flex-col tw-gap-1 tw-py-3">
      <div class="tw-w-full tw-flex tw-justify-between tw-items-center tw-gap-4">
        <div class="tw-flex tw-items-center tw-gap-2">
          <label for={htmlFor} class="tw-text-[15px] tw-text-fg tw-leading-tight">
            {label}
          </label>
          {description && (
            <Tooltip text={description}>
              <Icon name="info" size={16} class="tw-text-fg-subtle hover:tw-text-fg-muted" />
            </Tooltip>
          )}
        </div>
        <div class="tw-flex-shrink-0">{children}</div>
      </div>
      {(hint || error) && <div class={`tw-text-xs ${error ? "tw-text-danger-fg" : "tw-text-fg-subtle"}`}>{error || hint}</div>}
    </div>
  );
}
