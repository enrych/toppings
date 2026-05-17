import { MESSAGE_FIELD, MESSAGE_TYPE } from "@toppings/constants";
import type { Context } from "../context";

export async function dispatchContext(
  tabId: number,
  ctx: Exclude<Context, null>,
): Promise<void> {
  await chrome.tabs.sendMessage(
    tabId,
    JSON.stringify({
      [MESSAGE_FIELD.TYPE]: MESSAGE_TYPE.CONTEXT,
      [MESSAGE_FIELD.PAYLOAD]: ctx,
    }),
  );
}
