import { Context } from "../context";

/**
 * Dispatches the provided context to the specified tab using `chrome.tabs.sendMessage`.
 *
 * @param {number} tabId - The ID of the tab to send the message to.
 * @param {Context} ctx - The context to be sent to the tab.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 *
 * @remarks
 * - **Serialization in different browsers:**
 *   - **Firefox**: Uses the Structured Clone Algorithm.
 *   - **Chrome**: Currently uses JSON serialization, but may adopt the Structured Clone Algorithm in the future (Chrome issue 248548).
 *
 * - **Structured Clone Algorithm** (used by Firefox):
 *   - Supports a broader range of object types compared to JSON serialization.
 *
 * - **JSON Serialization** (used by Chrome):
 *   - Does not handle certain object types like DOM objects natively.
 *   - Objects with a `toJSON()` method (e.g., `URL`, `PerformanceEntry`) can be serialized with JSON, but they are still not structured cloneable.
 *
 * @note For extensions relying on `toJSON()`, use `JSON.stringify()` followed by `JSON.parse()` to ensure the message is structurally cloneable across browsers.
 */
export const dispatchContext = async (
  tabId: number,
  ctx: Exclude<Context, null>,
): Promise<void> => {
  // For URL, To ensure the message is structurally cloneable across browsers.
  const message = { type: "context", payload: ctx };
  const serializedContext = JSON.stringify(message);
  // sendMessage will throw "Error: Could not establish connection. Receiving end does not exist."
  // if there is no content script loaded in the given tab. This error is
  // noisy and mysterious (it usually doesn't have a valid line number), so we silence it.
  return await chrome.tabs
    .sendMessage(tabId, serializedContext)
    .catch(() => {});
};
