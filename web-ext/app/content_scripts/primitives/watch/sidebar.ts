import { resolveTarget } from "../../../../utils/primitive";
import { setCapabilityStatus } from "../../../../core/capabilityCache";

const STRATEGIES = [
  "#secondary",
  "ytd-watch-next-secondary-results-renderer",
  "#related",
  "ytd-watch-flexy #secondary-inner",
] as const;

let hiddenByToppings = false;

export async function setSidebarVisible(visible: boolean): Promise<void> {
  const resolution = await resolveTarget(STRATEGIES);
  void setCapabilityStatus("watch.sidebar", "watch", resolution);

  if (!resolution.resolved) return;

  const sidebar = resolution.element as HTMLElement;
  if (visible) {
    if (hiddenByToppings) {
      sidebar.style.display = "";
      hiddenByToppings = false;
    }
  } else {
    sidebar.style.display = "none";
    hiddenByToppings = true;
  }
}

export function resetSidebar(): void {
  if (!hiddenByToppings) return;
  const el = STRATEGIES
    .map((s) => document.querySelector<HTMLElement>(s))
    .find(Boolean) ?? null;
  if (el) el.style.display = "";
  hiddenByToppings = false;
}
