import { themeTokens } from "@/kernel/dom/theme";
import { formatClock } from "@/lib/duration";
import type { PlaylistRuntime } from "./messages";
import { skeletonStyle } from "./skeleton";

// Matches the "channel · 2/10" line above it in the playlist panel.
const styles = `
  ${themeTokens}
  :host { display: block; }
  .badge { display: flex; align-items: center; gap: 4px; margin-top: 2px; min-height: 18px; font: 400 12px/1.5 Roboto, Arial, sans-serif; color: var(--tp-text-2); }
  .dot { opacity: .7; }
  ${skeletonStyle}
`;

// null while the runtime is on its way.
export function Badge({ runtime }: { runtime: PlaylistRuntime | null }) {
  return (
    <div class="badge">
      <style>{styles}</style>
      {runtime ? (
        <>
          <span title="Total playlist runtime">{formatClock(runtime.totalRuntime)} total</span>
          <span class="dot">·</span>
          <span title="Average video runtime">{formatClock(runtime.averageRuntime)} avg</span>
        </>
      ) : (
        <span class="bone" style={{ width: "130px" }} aria-label="Loading playlist runtime" />
      )}
    </div>
  );
}
