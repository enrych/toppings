import elementReady from "element-ready";

/**
 * The outcome of attempting to resolve a primitive's DOM target.
 *
 * `resolved: true`  — an element matched; `strategyIndex` tells you which
 *                     selector in the strategies array was the winning one.
 * `resolved: false` — no strategy matched within the allowed time.
 */
export type PrimitiveResolution =
  | { resolved: true; element: Element; strategyIndex: number }
  | { resolved: false; element: null; strategyIndex: null };

/**
 * A single YouTube UI variant selector string.
 * Ordered by likelihood (most current / most common first).
 */
export type PrimitiveStrategy = string;

/**
 * Options forwarded to the underlying element-ready watchers.
 *
 * @property stopOnDomReady - Stop watching once `DOMContentLoaded` fires.
 *                            Default: false (keep watching — YouTube is a SPA).
 * @property timeout        - Give up after this many milliseconds.
 *                            Default: 10 000 ms.
 */
export interface ResolveOptions {
  stopOnDomReady?: boolean;
  timeout?: number;
}

/**
 * Try each CSS selector strategy in order, returning the first element found.
 *
 * Strategy:
 * 1. Synchronous pass — if any selector already matches in the DOM, return
 *    immediately (zero cost on the happy path).
 * 2. Async race — fire an `elementReady` watcher for every strategy
 *    simultaneously. The first watcher to resolve a non-null element wins.
 *    A timeout governs the overall wait so we never hang indefinitely.
 *
 * Callers should write their result to the capability cache so the options UI
 * can surface unsupported primitives and avoid redundant future attempts.
 *
 * @example
 * const result = await resolveTarget([
 *   "div.ytp-right-controls",       // current variant
 *   "div.ytp-right-controls-v2",    // A/B variant B
 * ]);
 * if (result.resolved) {
 *   result.element.prepend(myButton);
 * }
 */
export async function resolveTarget(
  strategies: readonly PrimitiveStrategy[],
  options: ResolveOptions = {},
): Promise<PrimitiveResolution> {
  const { stopOnDomReady = false, timeout = 10_000 } = options;

  if (strategies.length === 0) {
    return { resolved: false, element: null, strategyIndex: null };
  }

  // 1. Synchronous pass — no async overhead when element is already present.
  for (let i = 0; i < strategies.length; i++) {
    const el = document.querySelector(strategies[i]);
    if (el) return { resolved: true, element: el, strategyIndex: i };
  }

  // 2. Async race — all strategies watch in parallel; first match wins.
  return new Promise<PrimitiveResolution>((resolve) => {
    let settled = false;

    const settle = (resolution: PrimitiveResolution): void => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(resolution);
      }
    };

    // Hard timeout — never leave watchers hanging on unsupported pages.
    const timer = setTimeout(
      () => settle({ resolved: false, element: null, strategyIndex: null }),
      timeout,
    );

    // Launch a watcher per strategy — all run in parallel; first match wins.
    // element-ready v7 does not support AbortSignal, so we rely on the
    // `settled` flag to ensure only the first resolution is acted on.
    // Remaining watchers become inert once `settled` is true.
    const watchers = strategies.map((selector, i) =>
      elementReady(selector, { stopOnDomReady })
        .then((el) => {
          if (el) {
            settle({ resolved: true, element: el, strategyIndex: i });
          }
        })
        .catch(() => {
          // Individual watcher failed — not a failure unless ALL fail.
        }),
    );

    // If every watcher finishes without resolving a match, mark unsupported.
    Promise.allSettled(watchers).then(() => {
      settle({ resolved: false, element: null, strategyIndex: null });
    });
  });
}
