import { EXTERNAL_URL } from "./links";
import { EXTENSION_VERSION } from "./version";

export const WEBSITE_METADATA = {
  TITLE: "Toppings — Your YouTube, your way.",
  DESCRIPTION:
    "A free, open-source browser extension. Audio mode, custom playback rates, looped segments, Shorts auto-scroll, playlist runtimes. Small. Considered. Out of your way.",
} as const;

export const WEBSITE_HTML_LANG = "en";

export const WEBSITE_BRAND = {
  NAME: "Toppings",
} as const;

/**
 * Internal route for the docs section. Replaced the legacy GitHub-hosted
 * wiki (https://github.com/enrych/toppings/wiki) with on-site docs — the
 * Next.js basePath ("/toppings") is applied automatically by <Link>.
 */
export const WEBSITE_INTERNAL_ROUTE = {
  HOME: "/",
  DOCS: "/docs",
  DOCS_KEYBINDINGS: "/docs/keybindings",
  DOCS_FAQ: "/docs/faq",
} as const;

export const WEBSITE_SCROLL = {
  NAVBAR_BORDER_THRESHOLD_PX: 8,
} as const;

export const WEBSITE_NAV_LINK = {
  WIKI_LABEL: "Read Wiki",
  SPONSOR_LABEL: "Become a sponsor",
} as const;

export const WEBSITE_INSTALL_CTA = {
  CHROME_LABEL: "Add to Chrome",
  FIREFOX_LABEL: "Add to Firefox",
  UNKNOWN_LABEL: "Get Toppings",
} as const;

export const WEBSITE_UA_PATTERN = {
  CHROMIUM_LIKE: /chrome|chromium|crios|edg|opr\//i,
  FIREFOX_LIKE: /firefox|fxios/i,
} as const;

export const WEBSITE_FOOTER_GROUP_TITLE = {
  PRODUCT: "Product",
  DOCS: "Docs",
  OPEN_SOURCE: "Open source",
} as const;

export const WEBSITE_FOOTER_LINK_LABEL = {
  ADD_TO_CHROME: "Add to Chrome",
  ADD_TO_FIREFOX: "Add to Firefox",
  WHATS_NEW: "What’s new",
  READ_WIKI: "Read Wiki",
  KEYBINDINGS: "Keybindings",
  FAQ: "FAQ",
  SOURCE_CODE: "Source code",
  REPORT_BUG: "Report a bug",
  BECOME_SPONSOR: "Become a sponsor",
} as const;

export const WEBSITE_FOOTER_COPY = {
  TAGLINE:
    "A free, open-source browser extension for total control over YouTube. Built by Enrych.",
  LICENSE_LINE_PREFIX: "GPL-3.0 · ",
  LICENSE_LINE_SUFFIX: " · Toppings",
} as const;

export const WEBSITE_FOOTER_BRAND_ALT = "";

export const WEBSITE_VERSION_DISPLAY = {
  HERO_EYEBROW: `Free · Open source · v${EXTENSION_VERSION}`,
  FOOTER_FALLBACK: EXTENSION_VERSION,
} as const;

export const WEBSITE_FOOTER_LINK_GROUPS = [
  {
    title: WEBSITE_FOOTER_GROUP_TITLE.PRODUCT,
    links: [
      {
        label: WEBSITE_FOOTER_LINK_LABEL.ADD_TO_CHROME,
        href: EXTERNAL_URL.CHROME_WEBSTORE_TOPPINGS,
      },
      {
        label: WEBSITE_FOOTER_LINK_LABEL.ADD_TO_FIREFOX,
        href: EXTERNAL_URL.FIREFOX_AMO_TOPPINGS,
      },
      {
        label: WEBSITE_FOOTER_LINK_LABEL.WHATS_NEW,
        href: EXTERNAL_URL.GITHUB_RELEASES,
      },
    ],
  },
  {
    title: WEBSITE_FOOTER_GROUP_TITLE.DOCS,
    links: [
      {
        label: WEBSITE_FOOTER_LINK_LABEL.READ_WIKI,
        href: WEBSITE_INTERNAL_ROUTE.DOCS,
      },
      {
        label: WEBSITE_FOOTER_LINK_LABEL.KEYBINDINGS,
        href: WEBSITE_INTERNAL_ROUTE.DOCS_KEYBINDINGS,
      },
      {
        label: WEBSITE_FOOTER_LINK_LABEL.FAQ,
        href: WEBSITE_INTERNAL_ROUTE.DOCS_FAQ,
      },
    ],
  },
  {
    title: WEBSITE_FOOTER_GROUP_TITLE.OPEN_SOURCE,
    links: [
      {
        label: WEBSITE_FOOTER_LINK_LABEL.SOURCE_CODE,
        href: EXTERNAL_URL.GITHUB_REPO,
      },
      {
        label: WEBSITE_FOOTER_LINK_LABEL.REPORT_BUG,
        href: EXTERNAL_URL.GITHUB_ISSUES,
      },
      {
        label: WEBSITE_FOOTER_LINK_LABEL.BECOME_SPONSOR,
        href: EXTERNAL_URL.SPONSOR,
      },
    ],
  },
] as const;

export const WEBSITE_HERO = {
  EYEBROW: WEBSITE_VERSION_DISPLAY.HERO_EYEBROW,
  HEADLINE_LINE_1: "Your YouTube,",
  HEADLINE_LINE_2_BEFORE: "your ",
  HEADLINE_LINE_2_HIGHLIGHT: "way",
  HEADLINE_LINE_2_AFTER: ".",
  LEDE:
    "A free, open-source browser extension. Audio mode, custom playback rates, looped segments, playlist runtimes, Shorts auto-scroll. Small. Considered. Out of your way.",
  FIREFOX_BUTTON: "Firefox",
  SOURCE_BUTTON: "Source",
  TRUST_TRACKERS_LEAD: "0 trackers.",
  TRUST_TRACKERS_REST: " No data leaves your browser.",
  TRUST_LICENSE_LEAD: "GPL-3.0.",
  TRUST_LICENSE_REST: " Yours to fork, modify, ship.",
} as const;

export const WEBSITE_HOME_FEATURE_GRID = {
  SECTION_HEADLINE: "Four small superpowers.",
  SECTION_LEDE_PART_1:
    "We didn\u2019t redesign YouTube. We added the four buttons it",
  SECTION_LEDE_PART_2: " forgot — nothing more, nothing less.",
  ROWS: [
    {
      index: "01",
      title: "Loop a segment",
      body: "Drop two markers on the timeline. Anything between them loops, forever.",
      kbd: "⇧ L",
    },
    {
      index: "02",
      title: "Custom playback",
      body: "Set rates from 0.25x to 4x in any increment. Persists per channel.",
      kbd: ", · .",
    },
    {
      index: "03",
      title: "Auto-scroll Shorts",
      body: "When a Short ends, jump to the next. No taps. No thumbs.",
      kbd: "auto",
    },
    {
      index: "04",
      title: "Playlist runtimes",
      body: "See exactly how long that 47-video binge will take. Before you start.",
      kbd: "live",
    },
  ],
} as const;

export const WEBSITE_HOME_HOW_IT_WORKS = {
  SECTION_HEADLINE: "Three steps. Zero friction.",
  SECTION_LEDE:
    "Install, open YouTube, make it yours. No accounts, no setup screens, no waiting for an onboarding wizard.",
  STEPS: [
    {
      num: "01",
      title: "Install in seconds",
      body: "Add Toppings from the Chrome Web Store or Firefox Add-ons. No account, no setup.",
    },
    {
      num: "02",
      title: "Open YouTube",
      body: "Visit any video. Toppings appears next to the native controls.",
    },
    {
      num: "03",
      title: "Make it yours",
      body: "Pick your shortcuts, default speed, audio-mode background. Toppings remembers.",
    },
  ],
} as const;

export const WEBSITE_HOME_STATS_STRIP = {
  EYEBROW: "Trusted by viewers",
  ROWS: [
    {
      value: 7,
      suffix: "+",
      decimals: 0,
      label: "Power features",
    },
    {
      value: 4.8,
      suffix: "★",
      decimals: 1,
      label: "Avg user rating",
    },
    {
      value: 100,
      suffix: "%",
      decimals: 0,
      label: "Free forever",
    },
    {
      value: 2,
      suffix: " min",
      decimals: 0,
      label: "To install",
    },
  ],
} as const;

export const WEBSITE_HOME_INVERSE = {
  SECTION_HEADLINE_BEFORE: "Listen, don’t ",
  SECTION_HEADLINE_HIGHLIGHT: "watch",
  SECTION_HEADLINE_AFTER: ".",
  SECTION_LEDE:
    "Audio Mode strips the video and keeps the controls. Same playback. Same chapters. A fraction of the battery. Perfect for podcasts and live sets you didn’t come for the picture.",
  STATS: [
    {
      number: "−87",
      unit: "%",
      label: "Bandwidth used",
    },
    {
      number: "2.4",
      unit: "h",
      label: "Extra battery, avg.",
    },
    {
      number: "0",
      unit: "",
      label: "Bytes sent to us",
    },
  ],
} as const;

export const WEBSITE_HOME_KEYBINDINGS = {
  SECTION_HEADLINE_BEFORE: "Every key, ",
  SECTION_HEADLINE_HIGHLIGHT: "yours",
  SECTION_HEADLINE_AFTER: " to remap.",
  SECTION_LEDE:
    "Six defaults, all rebindable. Toppings reads keystrokes only on YouTube tabs — nothing global, nothing surprising.",
  ROWS: [
    {
      label: "Toggle Audio mode",
      desc: "Strip the video, keep the audio",
      combo: ["⇧", "A"],
      sep: "+",
    },
    {
      label: "Toggle Loop segment",
      desc: "Show two draggable markers",
      combo: ["⇧", "L"],
      sep: "+",
    },
    {
      label: "Speed down / up",
      desc: "Step in increments of 0.25x",
      combo: [",", "."],
      sep: "·",
    },
    {
      label: "Seek back / forward",
      desc: "Custom seek duration",
      combo: ["←", "→"],
      sep: "·",
    },
    {
      label: "Set loop in / out",
      desc: "Pins the marker to playhead",
      combo: ["I", "O"],
      sep: "·",
    },
    {
      label: "Open Toppings popup",
      desc: "From any YouTube page",
      combo: ["⇧", "T"],
      sep: "+",
    },
  ],
} as const;

export const WEBSITE_HOME_PRINCIPLES = {
  SECTION_HEADLINE: "Three rules.",
  SECTION_LEDE:
    "What Toppings is, what it isn’t, and what it will never become.",
  CARDS: [
    {
      num: "01 · Private",
      title_before: "Zero bytes ",
      title_highlight: "leave",
      title_after: ".",
      body:
        "Toppings never sees your watch history, your search, or your tabs. No analytics. No telemetry. No “anonymous usage.” Everything runs inside your browser and dies there.",
    },
    {
      num: "02 · Open",
      title_before: "",
      title_highlight: "Read",
      title_after: " the source.",
      body:
        "GPL-3.0, on GitHub, in 4,200 lines. Audit, fork, ship your own. We accept pull requests for features that fit the brief — “small superpowers that YouTube forgot.”",
    },
    {
      num: "03 · Restrained",
      title_before: "One ",
      title_highlight: "job",
      title_after: " each.",
      body:
        "Audio mode. Loop. Speed. Auto-scroll. Runtimes. We will say no to thousands of features before we say yes to the next one. The point of Toppings is what we left out.",
    },
  ],
} as const;

export const WEBSITE_HOME_FINAL_CTA = {
  HEADLINE_BEFORE: "Take back your ",
  HEADLINE_HIGHLIGHT: "YouTube",
  HEADLINE_AFTER: ".",
  LEDE:
    "Free, forever. Open-source, forever. No account. No sign-up. Install once and forget the extension is there — the way good tools work.",
  FIREFOX_BUTTON: "Firefox",
  SOURCE_BUTTON: "Source code",
  META: "Chrome · Firefox · Edge · Opera · Brave",
} as const;

export const WEBSITE_GREETINGS = {
  TITLE_SUCCESS: "Success!",
  TITLE_SET: "You're All Set!",
  BODY: "Thank you for installing our extension.",
  BODY_LINE_2: "Happy browsing!",
  WIKI_BUTTON: "Read Wiki",
  ILLUSTRATION_ALT: "hero",
  QUESTION_MARK_ALT: "Question Mark",
} as const;

export const WEBSITE_FAREWELL = {
  TITLE_GOODBYE: "Goodbye!",
  TITLE_MISS: "We'll Miss You!",
  BODY:
    "We're sorry to see you go. We'd love to hear about any feedback you may have.",
  FEEDBACK_BUTTON: "Help Us Improve!",
  FORM_ICON_ALT: "Form",
  ILLUSTRATION_ALT: "hero",
} as const;

export const WEBSITE_FEEDBACK_MAIL = {
  TO: "divyadityasnaruka@gmail.com",
  SUBJECT: "Feedback for Toppings",
} as const;

export const WEBSITE_FEEDBACK_MAILTO_HREF = `mailto:${WEBSITE_FEEDBACK_MAIL.TO}?subject=${encodeURIComponent(WEBSITE_FEEDBACK_MAIL.SUBJECT)}`;

export const WEBSITE_PRIMARY_BUTTON_HOVER_HEX = "#fc9c26";

export const WEBSITE_PRIMARY_BUTTON_HOVER_TW = "hover:bg-[#fc9c26]";

export const WEBSITE_LINK_PROTOCOL_PREFIX = "http";

export const WEBSITE_INSTALL_DESTINATION = {
  chrome: {
    url: EXTERNAL_URL.CHROME_WEBSTORE_TOPPINGS,
    label: WEBSITE_INSTALL_CTA.CHROME_LABEL,
  },
  firefox: {
    url: EXTERNAL_URL.FIREFOX_AMO_TOPPINGS,
    label: WEBSITE_INSTALL_CTA.FIREFOX_LABEL,
  },
  unknown: {
    url: EXTERNAL_URL.GITHUB_REPO_WWW,
    label: WEBSITE_INSTALL_CTA.UNKNOWN_LABEL,
  },
} as const;
