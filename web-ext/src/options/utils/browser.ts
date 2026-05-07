export function getBrowserEngine(): "firefox" | "chromium" {
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    if (navigator.userAgent.includes("Firefox")) return "firefox";
    if (
      navigator.userAgent.includes("Chrome") ||
      navigator.userAgent.includes("Edg") ||
      navigator.userAgent.includes("OPR")
    ) {
      return "chromium";
    }
  }
  return "chromium";
}

export function setExtensionIcon(disabled: boolean) {
  const prefix = disabled ? "disabled_" : "";
  const path = {
    16: `/assets/icons/${prefix}icon16.png`,
    32: `/assets/icons/${prefix}icon32.png`,
    48: `/assets/icons/${prefix}icon48.png`,
    128: `/assets/icons/${prefix}icon128.png`,
  };
  const browser = getBrowserEngine();
  if (browser === "firefox") {
    // @ts-ignore: Firefox MV2 uses browserAction
    chrome.browserAction.setIcon({ path });
  } else {
    chrome.action.setIcon({ path });
  }
}
