export const BRAND_METADATA = {
  NAME: "Toppings",
  TAGLINE: "Your YouTube, Your Way.",
  ID: "toppings@enry.ch",
  LOGO: "https://raw.githubusercontent.com/enrych/toppings/main/assets/logo.png",
} as const;

/** Keep in sync with `web-ext/data/version.ts`. */
export const EXTENSION_VERSION = "3.0.3";

export const URL = {
  HOMEPAGE: "https://toppings.enry.ch",
  GREETINGS: "https://toppings.enry.ch/greetings",
  FAREWELL: "https://toppings.enry.ch/farewell",
  GITHUB_REPO: "https://github.com/enrych/toppings",
  GITHUB_COMMITS_MAIN: "https://github.com/enrych/toppings/commits/main",
  GITHUB_ISSUES: "https://github.com/enrych/toppings/issues",
  GITHUB_RELEASES: "https://github.com/enrych/toppings/releases",
  CHROME_WEBSTORE_TOPPINGS:
    "https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl",
  FIREFOX_AMO_TOPPINGS:
    "https://addons.mozilla.org/en-US/firefox/addon/toppings/",
  SPONSOR_ME: "https://darhkvoyd.me/sponsor",
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

export const FEATURES = [
  {
    name: "Audio Mode",
    description:
      "Hide the video and listen to audio only — perfect for office or background play.",
    isNew: true,
  },
  {
    name: "Custom Playback Rates",
    description:
      "Add granular speeds beyond YouTube's defaults — anywhere from 0.0625× to 16×.",
  },
  {
    name: "Toggle Playback Rate",
    description:
      "Press one key to flip between normal speed and your preferred fast rate.",
  },
  {
    name: "Loop Segments",
    description:
      "Mark a start and end point in any video to loop a section continuously.",
  },
  {
    name: "Seek Shortcuts",
    description:
      "Jump forward and backward with configurable durations via keyboard shortcuts.",
  },
  {
    name: "Shorts Auto-Scroll",
    description: "Automatically advance to the next Short when one ends.",
  },
  {
    name: "Playlist Runtime",
    description:
      "See total and average runtime stats injected at the top of playlists.",
  },
] as const;

export const UA_PATTERN = {
  CHROMIUM_LIKE: /chrome|chromium|crios|edg|opr\//i,
  FIREFOX_LIKE: /firefox|fxios/i,
} as const;

/** Install button label + link, picked from user agent in `InstallCTA`. */
export const STORE_CTA = {
  CHROME: {
    href: URL.CHROME_WEBSTORE_TOPPINGS,
    label: LABEL.ADD_TO_CHROME,
  },
  FIREFOX: {
    href: URL.FIREFOX_AMO_TOPPINGS,
    label: LABEL.ADD_TO_FIREFOX,
  },
  FALLBACK: {
    href: URL.GITHUB_REPO,
    label: LABEL.GET_TOPPINGS,
  },
} as const;

export const FEEDBACK_MAIL = {
  TO: "divyadityasnaruka@gmail.com",
  SUBJECT: "Feedback for Toppings",
} as const;

export const FEEDBACK_MAILTO = `mailto:${FEEDBACK_MAIL.TO}?subject=${encodeURIComponent(FEEDBACK_MAIL.SUBJECT)}`;
