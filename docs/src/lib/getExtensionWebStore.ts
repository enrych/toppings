const getExtensionWebStore = () => {
  let userAgent = navigator.userAgent;
  let isSupported: boolean = false;
  let browser: string = "browser";

  const extensionWebStore = {
    chromium:
      "https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl",
    default: "https://www.github.com/enrych/toppings",
  };
  let store: string = extensionWebStore.default;

  if (userAgent.match(/chrome|chromium|crios/i)) {
    isSupported = true;
    browser = "chrome";
    store = extensionWebStore.chromium;
  } else if (userAgent.match(/edg/i)) {
    isSupported = true;
    browser = "edge";
    store = extensionWebStore.chromium;
  } else if (userAgent.match(/opr\//i)) {
    isSupported = true;
    browser = "opera";
    store = extensionWebStore.chromium;
  } else if (userAgent.match(/firefox|fxios/i)) {
    browser = "firefox";
  } else if (userAgent.match(/safari/i)) {
    browser = "safari";
  }

  return {
    isSupported,
    browser,
    store,
  };
};

export default getExtensionWebStore;
