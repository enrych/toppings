import elementReady from "element-ready";

export type PrimitiveResolution =
  | { resolved: true; element: Element; strategyIndex: number }
  | { resolved: false; element: null; strategyIndex: null };

export type PrimitiveStrategy = string;

export interface ResolveOptions {
  // Defaults to false: YouTube is a SPA, so the target often appears long after
  // DOMContentLoaded has fired.
  stopOnDomReady?: boolean;
  timeout?: number;
}

// Callers should record the result in the capability cache — that is what lets the
// options UI report a primitive as unsupported instead of failing silently.
export async function resolveTarget(
  strategies: readonly PrimitiveStrategy[],
  options: ResolveOptions = {},
): Promise<PrimitiveResolution> {
  const { stopOnDomReady = false, timeout = 10_000 } = options;

  if (strategies.length === 0) {
    return { resolved: false, element: null, strategyIndex: null };
  }

  for (let i = 0; i < strategies.length; i++) {
    const el = document.querySelector(strategies[i]);
    if (el) return { resolved: true, element: el, strategyIndex: i };
  }

  return new Promise<PrimitiveResolution>((resolve) => {
    let settled = false;

    const settle = (resolution: PrimitiveResolution): void => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(resolution);
      }
    };

    const timer = setTimeout(
      () => settle({ resolved: false, element: null, strategyIndex: null }),
      timeout,
    );

    // element-ready v7 takes no AbortSignal, so losing watchers cannot be
    // cancelled — the `settled` flag is what makes them inert instead.
    const watchers = strategies.map((selector, i) =>
      elementReady(selector, { stopOnDomReady })
        .then((el) => {
          if (el) {
            settle({ resolved: true, element: el, strategyIndex: i });
          }
        })
        .catch(() => {
          // Swallowed deliberately: one strategy failing is expected, and only
          // every strategy failing counts as unresolved.
        }),
    );

    Promise.allSettled(watchers).then(() => {
      settle({ resolved: false, element: null, strategyIndex: null });
    });
  });
}
