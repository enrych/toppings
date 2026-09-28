export type PrimitiveResolution =
  | { resolved: true; element: Element; strategyIndex: number }
  | { resolved: false; element: null; strategyIndex: null };

export type PrimitiveStrategy = string;

export interface ResolveOptions {
  timeout?: number;
}

const UNRESOLVED: PrimitiveResolution = { resolved: false, element: null, strategyIndex: null };

// YouTube keeps the pages you navigated away from alive but hidden, and parks
// unused layouts under display:none, so a selector can match a header or
// player that is not on screen. Only rendered elements count.
function isRendered(element: Element): boolean {
  return !element.closest("[hidden]") && (element.checkVisibility?.() ?? true);
}

function findLive(strategies: readonly PrimitiveStrategy[]): PrimitiveResolution | null {
  for (let i = 0; i < strategies.length; i++) {
    for (const element of document.querySelectorAll(strategies[i])) {
      if (isRendered(element)) return { resolved: true, element, strategyIndex: i };
    }
  }
  return null;
}

// For looking inside a root that was itself resolved live. There YouTube hides
// elements on purpose (a closed menu, buttons a narrow layout tucks away), and
// those still count.
export function findWithin(root: ParentNode, strategies: readonly PrimitiveStrategy[]): PrimitiveResolution {
  for (let i = 0; i < strategies.length; i++) {
    const element = root.querySelector(strategies[i]);
    if (element) return { resolved: true, element, strategyIndex: i };
  }
  return UNRESOLVED;
}

// Strategies are ordered by preference, and the first to match a live element
// wins. YouTube renders long after load, so this waits for the DOM to change
// until something matches or the timeout passes. Callers record the result in
// the capability cache, which is how the options page reports a broken one.
export function resolveTarget(strategies: readonly PrimitiveStrategy[], { timeout = 10_000 }: ResolveOptions = {}): Promise<PrimitiveResolution> {
  const found = findLive(strategies);
  if (found || strategies.length === 0) return Promise.resolve(found ?? UNRESOLVED);

  return new Promise((resolve) => {
    let pending: ReturnType<typeof setTimeout> | undefined;
    const finish = (resolution: PrimitiveResolution) => {
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(pending);
      resolve(resolution);
    };
    const check = () => {
      pending = undefined;
      const match = findLive(strategies);
      if (match) finish(match);
    };
    // Batched on a timer rather than an animation frame, which never comes in
    // a background tab and would leave a page opened there unresolved.
    const observer = new MutationObserver(() => {
      pending ??= setTimeout(check, 16);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class", "style"] });
    const timer = setTimeout(() => finish(UNRESOLVED), timeout);
  });
}
