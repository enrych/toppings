export type PrimitiveResolution =
  | { resolved: true; element: Element; strategyIndex: number }
  | { resolved: false; element: null; strategyIndex: null };

export type PrimitiveStrategy = string;

export interface ResolveOptions {
  timeout?: number;
}

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

const UNRESOLVED: PrimitiveResolution = { resolved: false, element: null, strategyIndex: null };

// Strategies are ordered by preference, and the first to match a live element
// wins. YouTube renders long after load, so this waits for the DOM to change
// until something matches or the timeout passes. Callers record the result in
// the capability cache, which is how the options page reports a broken one.
export function resolveTarget(strategies: readonly PrimitiveStrategy[], { timeout = 10_000 }: ResolveOptions = {}): Promise<PrimitiveResolution> {
  const found = findLive(strategies);
  if (found || strategies.length === 0) return Promise.resolve(found ?? UNRESOLVED);

  return new Promise((resolve) => {
    let frame: number | undefined;
    const finish = (resolution: PrimitiveResolution) => {
      observer.disconnect();
      clearTimeout(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
      resolve(resolution);
    };
    const check = () => {
      frame = undefined;
      const match = findLive(strategies);
      if (match) finish(match);
    };
    const observer = new MutationObserver(() => {
      frame ??= requestAnimationFrame(check);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class", "style"] });
    const timer = setTimeout(() => finish(UNRESOLVED), timeout);
  });
}
