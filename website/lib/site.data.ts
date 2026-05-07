import { URLS } from "@toppings/constants";

export const HTML_LANG = "en";

export const METADATA = {
  TITLE: "Toppings — Your YouTube, your way.",
  DESCRIPTION:
    "A free, open-source browser extension. Audio mode, custom playback rates, looped segments, Shorts auto-scroll, playlist runtimes. Small. Considered. Out of your way.",
} as const;

export const LABEL = {
  DOCS: "Docs",
  SEARCH_DOCS: "Search the docs…",
  ADD_TO_CHROME: "Add to Chrome",
  ADD_TO_FIREFOX: "Add to Firefox",
  GET_TOPPINGS: "Get Toppings",
  READ_DOCS: "Read the docs",
  WHATS_NEW: "What’s new",
  CHANGELOG: "Changelog",
  KEYBINDINGS: "Keybindings",
  FAQ: "FAQ",
  SOURCE_CODE: "Source code",
  REPORT_BUG: "Report a bug",
  BECOME_SPONSOR: "Become a sponsor",
} as const;

export const ROUTE = {
  HOME: "/",
  DOCS: "/docs",
  DOCS_KEYBINDINGS: "/docs/keybindings",
  DOCS_FAQ: "/docs/faq",
  DOCS_CHANGELOG: "/docs/changelog",
  GREETINGS: "/greetings",
  FAREWELL: "/farewell",
} as const;

export const UA_PATTERN = {
  CHROMIUM_LIKE: /chrome|chromium|crios|edg|opr\//i,
  FIREFOX_LIKE: /firefox|fxios/i,
} as const;

export const INSTALL = {
  chrome: {
    url: URLS.CHROME_WEBSTORE_TOPPINGS,
    label: LABEL.ADD_TO_CHROME,
  },
  firefox: {
    url: URLS.FIREFOX_AMO_TOPPINGS,
    label: LABEL.ADD_TO_FIREFOX,
  },
  unknown: {
    url: URLS.GITHUB_REPO,
    label: LABEL.GET_TOPPINGS,
  },
} as const;

export const HERO = {
  EYEBROW: "Free · Open source · v{{version}}",
  HEADLINE_LINE_1: "Your YouTube,",
  HEADLINE_LINE_2_BEFORE: "your ",
  HEADLINE_LINE_2_HIGHLIGHT: "way",
  HEADLINE_LINE_2_AFTER: ".",
  LEDE: "The controls YouTube never gave you — done right.",
  FIREFOX_BUTTON: "Firefox",
  SOURCE_BUTTON: "Source",
  TRUST_TRACKERS_LEAD: "0 trackers.",
  TRUST_TRACKERS_REST: " No analytics, no accounts.",
  TRUST_LICENSE_LEAD: "GPL-3.0.",
  TRUST_LICENSE_REST: " Fork it, modify it, ship it.",
  SCROLL_CUE: "↓ Scroll to strip the noise",
} as const;
