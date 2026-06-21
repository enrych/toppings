export const HERO = {
  EYEBROW: "Free · Open source · v{{version}}",
  TITLE_LINE_1: "Your YouTube,",
  TITLE_BEFORE: "your ",
  TITLE_HIGHLIGHT: "way",
  TITLE_AFTER: ".",
  LEDE: "The controls YouTube never gave you — done right.",
  SOURCE_BUTTON: "Source",
  TRUST_TRACKERS_LEAD: "0 trackers.",
  TRUST_TRACKERS_REST: " No analytics, no accounts.",
  TRUST_LICENSE_LEAD: "GPL-3.0.",
  TRUST_LICENSE_REST: " Fork it, modify it, ship it.",
  SCROLL_CUE: "↓ Scroll to strip the noise",
} as const;

export const FEATURES_SECTION = {
  KICKER: "what it does",
  HEADLINE: "What YouTube left out.",
  LEDE:
    "Small, sharp tools for the things YouTube never shipped — or shipped half-done. We keep finding more.",
} as const;

export const HOW_SECTION = {
  KICKER: "no friction",
  HEADLINE: "Install and forget it.",
  LEDE:
    "Add it, open YouTube, make it yours. No accounts, no setup screens, no onboarding wizard.",
  STEPS: [
    {
      NUM: "01",
      TITLE: "Install in seconds",
      BODY: "Add Toppings from the Chrome Web Store or Firefox Add-ons. No account, no setup.",
    },
    {
      NUM: "02",
      TITLE: "Open YouTube",
      BODY: "Visit any video. Toppings appears next to the native controls.",
    },
    {
      NUM: "03",
      TITLE: "Make it yours",
      BODY: "Pick your shortcuts, default speed, audio-mode background. Toppings remembers.",
    },
  ],
} as const;

export const STATS_SECTION = {
  EYEBROW: "Free, open, and growing",
  ROWS: [
    {
      VALUE: 4.9,
      SUFFIX: "★",
      DECIMALS: 1,
      LABEL: "Chrome Web Store rating",
    },
    { VALUE: 100, SUFFIX: "%", DECIMALS: 0, LABEL: "Free & open source" },
    { VALUE: 0, SUFFIX: "", DECIMALS: 0, LABEL: "Trackers, ever" },
    { VALUE: 0, SUFFIX: "", DECIMALS: 0, LABEL: "Accounts to sign up" },
  ],
} as const;

export const KEYBINDINGS_SECTION = {
  KICKER: "the keyboard is the interface",
  IDLE_READOUT: "Press a key — B · Z · Q E · S W · A D · X",
  HEADLINE_BEFORE: "Every key, ",
  HEADLINE_HIGHLIGHT: "yours",
  HEADLINE_AFTER: " to remap.",
  LEDE:
    "Single-key defaults, all rebindable. Toppings reads keystrokes only on YouTube tabs; nothing global, nothing surprising.",
  ROWS: [
    {
      LABEL: "Toggle Audio mode",
      DESC: "Hide the video, keep the audio",
      COMBO: ["B"],
      SEP: "",
    },
    {
      LABEL: "Toggle Loop segment",
      DESC: "Loop a section continuously",
      COMBO: ["Z"],
      SEP: "",
    },
    {
      LABEL: "Set loop in / out",
      DESC: "Pin start & end to the playhead",
      COMBO: ["Q", "E"],
      SEP: "·",
    },
    {
      LABEL: "Speed down / up",
      DESC: "Step playback rate by 0.25×",
      COMBO: ["S", "W"],
      SEP: "·",
    },
    {
      LABEL: "Seek back / forward",
      DESC: "15s on watch, 5s on Shorts",
      COMBO: ["A", "D"],
      SEP: "·",
    },
    {
      LABEL: "Toggle playback rate",
      DESC: "Flip to your fast rate and back",
      COMBO: ["X"],
      SEP: "",
    },
  ],
} as const;

export const PRINCIPLES_SECTION = {
  KICKER: "the quiet layer",
  HEADLINE: "The non-negotiables.",
  LEDE: "What Toppings is, what it isn’t, and what it will never become.",
  CARDS: [
    {
      NUM: "01 · Private",
      TITLE_BEFORE: "No one's ",
      TITLE_HIGHLIGHT: "watching",
      TITLE_AFTER: " you.",
      BODY:
        "No trackers. No analytics. No accounts. Ever. A feature may talk to our server to do its job — never to profile you, and never about who you are.",
    },
    {
      NUM: "02 · Open",
      TITLE_BEFORE: "",
      TITLE_HIGHLIGHT: "Read",
      TITLE_AFTER: " the source.",
      BODY:
        "GPL-3.0, on GitHub. Audit it, fork it, ship your own. We take pull requests for anything that fits the brief: the things YouTube should have built.",
    },
    {
      NUM: "03 · Restrained",
      TITLE_BEFORE: "One ",
      TITLE_HIGHLIGHT: "job",
      TITLE_AFTER: " each.",
      BODY:
        "Every addition does one thing, does it quietly, and earns its place. We keep hunting the gaps YouTube leaves — and fill them without becoming the bloat we set out to fix.",
    },
  ],
} as const;

export const CTA_SECTION = {
  KICKER: "take it back",
  HEADLINE_BEFORE: "Take back your ",
  HEADLINE_HIGHLIGHT: "YouTube",
  HEADLINE_AFTER: ".",
  LEDE:
    "Free, forever. Open-source, forever. No account. No sign-up. Install once and forget the extension is there — the way good tools work.",
  SOURCE_BUTTON: "Source code",
  META: "Chrome · Firefox · and every Chromium browser",
} as const;

const keybindingRowIndexByKey = (
  rows: typeof KEYBINDINGS_SECTION.ROWS = KEYBINDINGS_SECTION.ROWS,
): Record<string, number> => {
  const map: Record<string, number> = {};
  rows.forEach((row, i) => {
    for (const key of row.COMBO) {
      map[key.toLowerCase()] = i;
    }
  });
  return map;
};

export const KEYBINDING_ROW_INDEX_BY_KEY = keybindingRowIndexByKey();
