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
    "A free, open-source browser extension that fixes what YouTube forgot — and keeps finding more. Small. Considered. Out of your way.",
  FIREFOX_BUTTON: "Firefox",
  SOURCE_BUTTON: "Source",
  TRUST_TRACKERS_LEAD: "0 trackers.",
  TRUST_TRACKERS_REST: " No analytics, no accounts.",
  TRUST_LICENSE_LEAD: "GPL-3.0.",
  TRUST_LICENSE_REST: " Yours to fork, modify, ship.",
} as const;

/**
 * Only the section framing lives here — the feature rows render from
 * the canonical EXTENSION_FEATURE_DEFINITIONS catalog, so shipping a
 * feature updates the website with zero copy edits. Keep this
 * headline/lede count-agnostic on purpose.
 */
export const WEBSITE_HOME_FEATURE_GRID = {
  SECTION_HEADLINE: "The buttons YouTube forgot.",
  SECTION_LEDE:
    "Each one fixes something YouTube left broken — or never built at all. The list grows as we find more.",
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
  EYEBROW: "Free, open, and growing",
  ROWS: [
    { value: 4.9, suffix: "★", decimals: 1, label: "Chrome Web Store rating" },
    { value: 100, suffix: "%", decimals: 0, label: "Free & open source" },
    { value: 0, suffix: "", decimals: 0, label: "Trackers, ever" },
    { value: 0, suffix: "", decimals: 0, label: "Accounts to sign up" },
  ],
} as const;

export const WEBSITE_HOME_INVERSE = {
  SECTION_HEADLINE_BEFORE: "Listen, don’t ",
  SECTION_HEADLINE_HIGHLIGHT: "watch",
  SECTION_HEADLINE_AFTER: ".",
  SECTION_LEDE:
    "Audio Mode hides the video and keeps every control — same playback, same chapters, same shortcuts. For the podcasts and live sets you never came to look at.",
  STATS: [
    { number: "3", unit: "", label: "Backgrounds — black · visualizer · custom" },
    { number: "1", unit: "", label: "Key to toggle it (B)" },
    { number: "0", unit: "", label: "Accounts or setup" },
  ],
} as const;

export const WEBSITE_HOME_KEYBINDINGS = {
  SECTION_HEADLINE_BEFORE: "Every key, ",
  SECTION_HEADLINE_HIGHLIGHT: "yours",
  SECTION_HEADLINE_AFTER: " to remap.",
  SECTION_LEDE:
    "Single-key defaults on YouTube, plus a browser shortcut for the popup — all rebindable. Toppings reads keystrokes only on YouTube tabs; nothing global, nothing surprising.",
  ROWS: [
    {
      label: "Toggle Audio mode",
      desc: "Hide the video, keep the audio",
      combo: ["B"],
      sep: "",
    },
    {
      label: "Toggle Loop segment",
      desc: "Loop a section continuously",
      combo: ["Z"],
      sep: "",
    },
    {
      label: "Set loop in / out",
      desc: "Pin start & end to the playhead",
      combo: ["Q", "E"],
      sep: "·",
    },
    {
      label: "Speed down / up",
      desc: "Step playback rate by 0.25×",
      combo: ["S", "W"],
      sep: "·",
    },
    {
      label: "Seek back / forward",
      desc: "15s on watch, 5s on Shorts",
      combo: ["A", "D"],
      sep: "·",
    },
    {
      label: "Toggle playback rate",
      desc: "Flip to your fast rate and back",
      combo: ["X"],
      sep: "",
    },
    {
      label: "Open the popup",
      desc: "From any page · rebindable in your browser",
      combo: ["Ctrl / ⌘", "Shift", "Y"],
      sep: " + ",
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
      title_before: "No one's ",
      title_highlight: "watching",
      title_after: " you.",
      body:
        "No trackers. No analytics. No accounts. Ever. A feature may talk to our server to do its job — never to profile you, and never about who you are.",
    },
    {
      num: "02 · Open",
      title_before: "",
      title_highlight: "Read",
      title_after: " the source.",
      body:
        "GPL-3.0, on GitHub. Audit it, fork it, ship your own. We take pull requests for anything that fits the brief: the things YouTube should have built.",
    },
    {
      num: "03 · Restrained",
      title_before: "One ",
      title_highlight: "job",
      title_after: " each.",
      body:
        "Every addition does one thing, does it quietly, and earns its place. We keep hunting the gaps YouTube leaves — and fill them without becoming the bloat we set out to fix.",
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
