import React, { useState } from "react";
import { EXTENSION_VERSION } from "../../data/version";
import type { CapabilityStatus } from "../../utils/storage/capabilityCache";
import { addFeatureReport } from "../../utils/storage/featureReports";

interface CapabilityStatusRowProps {
  /** Human-readable feature name, e.g. "Recommendations Sidebar" */
  label: string;
  /** Internal primitive ID, e.g. "watch.sidebar" */
  primitiveId: string;
  /** Current cached status */
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

/**
 * Renders a single row showing the capability status of a watch-page
 * primitive. Unsupported primitives include a Report button that opens a
 * pre-filled GitHub issue so the developer can add a new selector strategy.
 */
export default function CapabilityStatusRow({
  label,
  primitiveId,
  status,
}: CapabilityStatusRowProps) {
  const config = STATUS_CONFIG[status];
  const [reported, setReported] = useState(false);

  const handleReport = async () => {
    // 1. Store the report locally so we can notify the user when it's fixed.
    await addFeatureReport(primitiveId);
    setReported(true);

    // 2. Open a pre-filled GitHub issue for the developer.
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
    <div className="tw-w-full tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-3">
      {/* Label + status badge */}
      <div className="tw-flex tw-flex-col tw-gap-0.5">
        <span
          className={`tw-text-[15px] tw-font-medium tw-leading-tight ${
            status === "unsupported" ? "tw-text-fg-muted" : "tw-text-fg"
          }`}
        >
          {label}
        </span>
        <div className="tw-flex tw-items-center tw-gap-1.5">
          <span
            className={`tw-inline-block tw-w-2 tw-h-2 tw-rounded-full tw-flex-shrink-0 ${config.dot}`}
          />
          <span className="tw-text-xs tw-text-fg-subtle">{config.text}</span>
        </div>
      </div>

      {/* Report button — only shown when unsupported */}
      {status === "unsupported" && (
        <button
          type="button"
          onClick={() => void handleReport()}
          disabled={reported}
          title={reported ? "Report submitted — we'll notify you when it's fixed" : "Report this feature as unavailable"}
          className="tw-flex-shrink-0 tw-text-xs tw-font-medium tw-text-fg-subtle tw-border tw-border-border-default tw-rounded-md tw-px-2.5 tw-py-1 hover:tw-bg-surface-hover hover:tw-text-fg tw-transition-colors disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
        >
          {reported ? "Reported ✓" : "Report"}
        </button>
      )}
    </div>
  );
}
