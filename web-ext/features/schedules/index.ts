import type { Feature } from "@/kernel/features";
import { showToast } from "@/kernel/dom/toast";
import { scheduleState } from "./state";

const NOTICE_MS = 4000;

// Tells whoever is watching that a schedule switched, or is about to, so a
// profile that changes on its own is never a mystery. Only notices that
// arrive while mounted are shown: an old one would be news about the past.
export const scheduleNotices: Feature = {
  id: "schedule-notices",
  routes: ["watch", "playlist", "shorts", "home", "search", "other"],
  mount() {
    let seen: number | null = null;
    void scheduleState.get().then((state) => (seen ??= state.notice?.id ?? null));
    return scheduleState.subscribe(({ notice }) => {
      if (!notice || notice.id === seen) return;
      seen = notice.id;
      if (document.visibilityState === "visible") showToast(notice.text, NOTICE_MS);
    });
  },
};
