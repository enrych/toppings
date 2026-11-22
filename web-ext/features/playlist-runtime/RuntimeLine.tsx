import { credit } from "@/kernel/dom/credit";
import { formatClock } from "@/lib/duration";
import type { PlaylistRuntime } from "./messages";
import { skeletonStyle } from "./skeleton";

export interface RuntimeLineProps {
  // null while the runtime is on its way.
  runtime: PlaylistRuntime | null;
  // YouTube's separator in the row above, or null where it spaces items instead.
  separator: string | null;
  onRefresh?: () => void;
}

// Font and colour are inherited from the host, which copies them from
// YouTube's own metadata text beside it.
const styles = `
  :host { display: block; }
  .line { display: flex; align-items: center; min-height: 18px; }
  .sep { margin: 0 4px; }
  .spaced { margin-left: 8px; }
  .refresh {
    display: grid; place-items: center; width: 18px; height: 18px; margin-left: 6px; padding: 0;
    border: 0; border-radius: 50%; background: transparent; color: inherit; font-size: 12px; line-height: 1; cursor: pointer;
  }
  .refresh:hover { background: rgba(127, 127, 127, .2); }
  ${skeletonStyle}
`;

export function RuntimeLine({ runtime, separator, onRefresh }: RuntimeLineProps) {
  return (
    <div class="line" title={credit("Total and average playlist runtime")}>
      <style>{styles}</style>
      {runtime ? (
        <>
          <span>{formatClock(runtime.totalRuntime)} total</span>
          {separator ? <span class="sep" aria-hidden="true">{separator}</span> : null}
          <span class={separator ? undefined : "spaced"}>{formatClock(runtime.averageRuntime)} avg</span>
          {onRefresh && (
            <button class="refresh" title={credit("Refresh playlist runtime")} onClick={onRefresh}>
              ↻
            </button>
          )}
        </>
      ) : (
        <span class="bone" style={{ width: "140px" }} aria-label="Loading playlist runtime" />
      )}
    </div>
  );
}
