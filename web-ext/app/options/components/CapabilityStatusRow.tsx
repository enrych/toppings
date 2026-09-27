import { useState } from "preact/hooks";
import Button from "@/ui/primitives/Button";
import { EXTENSION_VERSION } from "@/lib/version";
import type { CapabilityStatus } from "@/kernel/dom/capabilities";
import { addFeatureReport } from "@/kernel/dom/featureReports";

interface CapabilityStatusRowProps {
  label: string;
  primitiveId: string; // e.g. "watch.sidebar"
  status: CapabilityStatus;
}

const STATUS_CONFIG: Record<
  CapabilityStatus,
  { dot: string; text: string; hint: string }
> = {
  supported: {
    dot: "tw-bg-green-500",
    text: "Working",
    hint: "This feature is active on your YouTube.",
  },
  unsupported: {
    dot: "tw-bg-amber-500",
    text: "Unavailable on your YouTube",
    hint: "YouTube's UI on your account doesn't match any known layout for this feature.",
  },
  untested: {
    dot: "tw-bg-fg-subtle",
    text: "Not yet checked",
    hint: "Visit a YouTube watch page to check this feature.",
  },
};

export default function CapabilityStatusRow({
  label,
  primitiveId,
  status,
}: CapabilityStatusRowProps) {
  const config = STATUS_CONFIG[status];
  const [reported, setReported] = useState(false);

  const handleReport = async () => {
    // Stored before the issue is opened so the next update can tell the user
    // their report started working, whether or not they submit the issue.
    await addFeatureReport(primitiveId);
    setReported(true);

    const title = encodeURIComponent(
      `[Report] Feature unavailable: ${label} (${primitiveId})`,
    );
    const body = encodeURIComponent(
      [
        `**Feature:** ${label}`,
        `**Primitive ID:** \`${primitiveId}\``,
        `**Extension version:** ${EXTENSION_VERSION}`,
        `**Browser:** ${navigator.userAgent}`,
        "",
        "### What happened",
        "This feature shows as unavailable in my Toppings options page.",
        "",
        "### Steps to reproduce",
        "1. Install Toppings",
        "2. Open YouTube watch page",
        "3. Open Options → Watch → Feature Availability",
        `4. "${label}" shows as unavailable`,
      ].join("\n"),
    );
    window.open(
      `https://github.com/enrych/toppings/issues/new?title=${title}&body=${body}&labels=Type%3A+Bug+%F0%9F%90%9B%2CStatus%3A+Needs+Investigation`,
      "_blank",
    );
  };

  return (
    <div class="tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
      <div class="tw-flex tw-flex-col tw-gap-0.5">
        <span
          class={`tw-text-[15px] tw-font-medium tw-leading-tight ${
            status === "unsupported" ? "tw-text-fg-muted" : "tw-text-fg"
          }`}
        >
          {label}
        </span>
        <div class="tw-flex tw-items-center tw-gap-1.5">
          <span
            class={`tw-inline-block tw-w-2 tw-h-2 tw-rounded-full tw-flex-shrink-0 ${config.dot}`}
          />
          <span class="tw-text-xs tw-text-fg-subtle">{config.text}</span>
        </div>
      </div>

      {status === "unsupported" && (
        <Button size="sm" onClick={() => void handleReport()} disabled={reported} title={reported ? "Reported. The next update will tell you when it works again." : "Report this feature as unavailable"}>
          {reported ? "Reported" : "Report"}
        </Button>
      )}
    </div>
  );
}
