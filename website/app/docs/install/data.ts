import type { DocsPart } from "@/lib/docs-part";

export const DOCS_INSTALL_TOC = [
  { id: "what", label: "What it does" },
  { id: "install", label: "Install" },
  { id: "first", label: "First run" },
  { id: "privacy", label: "Privacy model" },
  { id: "next", label: "What to do next" },
] as const;

export const DOCS_INSTALL_EDIT_PATH =
  "website/app/docs/page.tsx" as const;

export const DOCS_INSTALL = {
  WHAT: {
    HEADING: "What it does, before you commit",
    INTRO_PREFIX: "Toppings adds small, sharp tools to YouTube:",
    INTRO_SUFFIX: ". It adds nothing else. It removes nothing. It collects ",
    PRIVACY_LINK: { kind: "anchor", id: "privacy", label: "zero data" },
    SUFFIX_AFTER_LINK: ".",
    CALLOUT: [
      { kind: "strong", value: "Heads up:" },
      { kind: "text", value: " Toppings only runs on " },
      { kind: "code", value: "youtube.com" },
      {
        kind: "text",
        value:
          ". No data is collected, sent, or stored outside your browser. Settings sync via your browser profile only if you have profile sync turned on.",
      },
    ] as const satisfies readonly DocsPart[],
  },
  INSTALL: {
    HEADING: "Install",
    STEPS: [
      {
        title: "Open your browser's extension store",
        body: [
          {
            kind: "link",
            target: "CHROME_WEBSTORE_TOPPINGS",
            label: "Chrome Web Store",
          },
          { kind: "text", value: " for Chrome, Edge, Opera, Brave, Arc. " },
          {
            kind: "link",
            target: "FIREFOX_AMO_TOPPINGS",
            label: "Firefox Add-ons",
          },
          { kind: "text", value: " for Firefox and its forks." },
        ],
      },
      {
        title: 'Click "Add to Chrome" or "Add to Firefox"',
        body: [
          { kind: "text", value: "The browser will ask for two permissions: " },
          { kind: "code", value: "youtube.com" },
          { kind: "text", value: " access (to inject the buttons) and " },
          { kind: "code", value: "storage" },
          {
            kind: "text",
            value:
              " (to remember your settings). That's the complete list of what Toppings ever asks for.",
          },
        ],
      },
      {
        title: "Pin the toolbar icon",
        body: [
          {
            kind: "text",
            value:
              "Click the puzzle-piece in your toolbar, find Toppings, and pin it. You'll want quick access to the popup for the Audio Mode toggle and per-tab status.",
          },
        ],
      },
      {
        title: "Open YouTube",
        body: [
          {
            kind: "text",
            value:
              "Any video page. You'll see two new amber buttons next to YouTube's native controls — that's Toppings. Press ",
          },
          { kind: "code", value: "B" },
          { kind: "text", value: " to try Audio mode immediately." },
        ],
      },
    ] as const satisfies readonly {
      title: string;
      body: readonly DocsPart[];
    }[],
  },
  FIRST_RUN: {
    HEADING: "First run",
    PARAGRAPHS: [
      [
        {
          kind: "text",
          value:
            "On first run Toppings opens a welcome tab with sensible defaults: Audio Mode ",
        },
        { kind: "em", value: "available but off" },
        { kind: "text", value: ", Loop " },
        { kind: "em", value: "off" },
        { kind: "text", value: ", Shorts auto-scroll " },
        { kind: "em", value: "on" },
        { kind: "text", value: ", default playback speed " },
        { kind: "em", value: "1.0×" },
        {
          kind: "text",
          value:
            ". Override any of them from the options page — right-click the toolbar icon → ",
        },
        { kind: "strong", value: "Options" },
        { kind: "text", value: ", or click the gear in the popup." },
      ],
      [
        {
          kind: "text",
          value:
            "The options page is its own tab. You can change settings any time; changes are saved automatically.",
        },
      ],
    ] as const satisfies readonly (readonly DocsPart[])[],
  },
  PRIVACY: {
    HEADING: "Privacy model",
    BODY: [
      {
        kind: "text",
        value:
          "Toppings has no analytics, no telemetry, and no remote calls. Everything runs inside your browser and dies there. Read the source on ",
      },
      { kind: "link", target: "GITHUB_REPO", label: "GitHub" },
      { kind: "text", value: "; it's GPL-3.0 in roughly 4,200 lines." },
    ] as const satisfies readonly DocsPart[],
  },
  NEXT: {
    HEADING: "What to do next",
    ITEMS: [
      [
        { kind: "text", value: "See every shortcut Toppings ships with on the " },
        { kind: "route", target: "DOCS_KEYBINDINGS", label: "Keybindings" },
        { kind: "text", value: " page — all of them are rebindable." },
      ],
      [
        { kind: "text", value: "The most-asked questions, with answers, on the " },
        { kind: "route", target: "DOCS_FAQ", label: "FAQ" },
        { kind: "text", value: "." },
      ],
      [
        { kind: "text", value: "Found a bug or want a feature? " },
        { kind: "link", target: "GITHUB_ISSUES", label: "Open an issue on GitHub" },
        { kind: "text", value: " — we read all of them." },
      ],
    ] as const satisfies readonly (readonly DocsPart[])[],
  },
} as const;
