export const HOME = {
  FEATURE_GRID: {
    SECTION_KICKER: "what it does",
    SECTION_HEADLINE: "What YouTube left out.",
    SECTION_LEDE:
      "Small, sharp tools for the things YouTube never shipped — or shipped half-done. We keep finding more.",
  },
  HOW_IT_WORKS: {
    SECTION_KICKER: "no friction",
    SECTION_HEADLINE: "Install and forget it.",
    SECTION_LEDE:
      "Add it, open YouTube, make it yours. No accounts, no setup screens, no onboarding wizard.",
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
  },
  STATS_STRIP: {
    EYEBROW: "Free, open, and growing",
    ROWS: [
      {
        value: 4.9,
        suffix: "★",
        decimals: 1,
        label: "Chrome Web Store rating",
      },
      { value: 100, suffix: "%", decimals: 0, label: "Free & open source" },
      { value: 0, suffix: "", decimals: 0, label: "Trackers, ever" },
      { value: 0, suffix: "", decimals: 0, label: "Accounts to sign up" },
    ],
  },
  KEYBINDINGS: {
    SECTION_KICKER: "the keyboard is the interface",
    IDLE_READOUT: "Press a key — B · Z · Q E · S W · A D · X",
    SECTION_HEADLINE_BEFORE: "Every key, ",
    SECTION_HEADLINE_HIGHLIGHT: "yours",
    SECTION_HEADLINE_AFTER: " to remap.",
    SECTION_LEDE:
      "Single-key defaults, all rebindable. Toppings reads keystrokes only on YouTube tabs; nothing global, nothing surprising.",
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
    ],
  },
  PRINCIPLES: {
    SECTION_KICKER: "the quiet layer",
    SECTION_HEADLINE: "The non-negotiables.",
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
  },
  FINAL_CTA: {
    SECTION_KICKER: "take it back",
    HEADLINE_BEFORE: "Take back your ",
    HEADLINE_HIGHLIGHT: "YouTube",
    HEADLINE_AFTER: ".",
    LEDE:
      "Free, forever. Open-source, forever. No account. No sign-up. Install once and forget the extension is there — the way good tools work.",
    FIREFOX_BUTTON: "Firefox",
    SOURCE_BUTTON: "Source code",
    META: "Chrome · Firefox · and every Chromium browser",
  },
} as const;
