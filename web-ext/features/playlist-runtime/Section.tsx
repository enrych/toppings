import { formatClock } from "@/lib/duration";
import type { PlaylistRuntime } from "./messages";

export interface SectionProps {
  runtime: PlaylistRuntime;
  iconUrl: string;
  refreshing: boolean;
  onRefresh: () => void;
}

// A metadata line like YouTube's own "10 videos · Last updated" beside it.
// The colour is inherited, because the header card tints its text to match
// the playlist's thumbnail.
const styles = `
  :host { display: block; }
  .line { display: flex; align-items: center; gap: 6px; margin-top: 8px; font: 400 12px/18px Roboto, Arial, sans-serif; color: inherit; opacity: .8; }
  .line img { width: 14px; height: 14px; }
  .dot { opacity: .7; }
  .refresh {
    display: grid; place-items: center; width: 22px; height: 22px; margin-left: 2px; padding: 0;
    border: 0; border-radius: 50%; background: transparent; color: inherit; cursor: pointer; font-size: 13px;
  }
  .refresh:hover { background: rgba(255, 255, 255, .1); }
  .refresh:disabled { opacity: .5; cursor: default; }
`;

export function Section({ runtime, iconUrl, refreshing, onRefresh }: SectionProps) {
  return (
    <div class="line">
      <style>{styles}</style>
      <img src={iconUrl} alt="Toppings" title="Toppings" />
      <span title="Total playlist runtime">{formatClock(runtime.totalRuntime)} total</span>
      <span class="dot">·</span>
      <span title="Average video runtime">{formatClock(runtime.averageRuntime)} avg</span>
      <button class="refresh" title="Refresh playlist runtime" disabled={refreshing} onClick={onRefresh}>
        ↻
      </button>
    </div>
  );
}
