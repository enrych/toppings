import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../core/capabilityCache";

const STRATEGIES = [
  "ytd-comments#comments",
  "#comments",
  "ytd-item-section-renderer #contents ytd-comments",
  "ytd-watch-flexy #comments",
] as const;

let hiddenByToppings = false;

export async function setCommentsVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("watch.comments", "watch", resolution);

  if (!resolution.resolved) return;

  const comments = resolution.element as HTMLElement;
  if (visible) {
    if (hiddenByToppings) {
      comments.style.display = "";
      hiddenByToppings = false;
    }
  } else {
    comments.style.display = "none";
    hiddenByToppings = true;
  }
}

export function resetComments(): void {
  if (!hiddenByToppings) return;
  const el = STRATEGIES
    .map((s) => document.querySelector<HTMLElement>(s))
    .find(Boolean) ?? null;
  if (el) el.style.display = "";
  hiddenByToppings = false;
}
