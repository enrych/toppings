import {
  EXTENSION_MESSAGE_BODY,
  EXTENSION_MESSAGE_TYPE,
} from "../../../data/extension.data";
import type { Context } from "../context";

export async function dispatchContext(
  tabId: number,
  ctx: Exclude<Context, null>,
): Promise<void> {
  await chrome.tabs.sendMessage(
    tabId,
    JSON.stringify({
      [EXTENSION_MESSAGE_BODY.TYPE]: EXTENSION_MESSAGE_TYPE.CONTEXT,
      [EXTENSION_MESSAGE_BODY.PAYLOAD]: ctx,
    }),
  );
}
