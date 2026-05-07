import type { DocsPart } from "@/lib/docs-part";

export const DOCS_PAGE = {
  INSTALL: {
    EYEBROW: "Getting started · 01",
    TITLE_HIGHLIGHT: "Toppings",
    TITLE_BEFORE: "Install ",
    TITLE_AFTER: " in 60 seconds.",
    LEDE:
      "Toppings ships on the official Chrome and Firefox stores. Install it the normal way — no sideloading, no developer mode, no account.",
    CRUMB_GROUP: "Getting started",
    CRUMB_CURRENT: "Install Toppings",
  },
  KEYBINDINGS: {
    EYEBROW: "Reference",
    TITLE_HIGHLIGHT: "yours",
    TITLE_BEFORE: "Every key, ",
    TITLE_AFTER: " to remap.",
    CRUMB_GROUP: "Reference",
    CRUMB_CURRENT: "Keybindings",
  },
  FAQ: {
    EYEBROW: "Frequently asked",
    TITLE_HIGHLIGHT: "answered",
    TITLE_BEFORE: "Questions, ",
    TITLE_AFTER: ".",
    CRUMB_GROUP: "Reference",
    CRUMB_CURRENT: "FAQ",
    LEDE: [
      [
        {
          kind: "text",
          value: "The short version of what people ask us most. If yours isn't here, ",
        },
        {
          kind: "link",
          target: "GITHUB_ISSUES",
          label: "open an issue",
        },
        { kind: "text", value: " — we read all of them." },
      ],
    ] as const satisfies readonly (readonly DocsPart[])[],
  },
  CHANGELOG: {
    EYEBROW: "What changed, and when",
    TITLE_HIGHLIGHT: "changelog",
    TITLE_BEFORE: "The ",
    TITLE_AFTER: ".",
    CRUMB_GROUP: "Reference",
    CRUMB_CURRENT: "Changelog",
    LEDE_BEFORE:
      "Every Toppings release in user-facing terms. The currently published version is ",
    LEDE_LINK_LABEL: "GitHub history",
  },
} as const;
