export function setExtensionIcon(disabled: boolean) {
  const prefix = disabled ? "disabled_" : "";
  const path = {
    16: `/assets/icons/${prefix}icon16.png`,
    32: `/assets/icons/${prefix}icon32.png`,
    48: `/assets/icons/${prefix}icon48.png`,
    128: `/assets/icons/${prefix}icon128.png`,
  };
  // Firefox still ships MV2, where the toolbar button is browserAction.
  // @ts-ignore chrome-types only declares MV3
  void (chrome.action ?? chrome.browserAction).setIcon({ path });
}
