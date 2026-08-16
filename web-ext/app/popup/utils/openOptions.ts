import { OPTIONS_HTML } from "../../options/data";

export function openOptionsPage() {
  window.open(chrome.runtime.getURL(OPTIONS_HTML), "_blank");
}
