export const PAGE = {
  EYEBROW: "Getting started · 01",
  TITLE_BEFORE: "Install ",
  TITLE_HIGHLIGHT: "Toppings",
  TITLE_AFTER: " in 60 seconds.",
  LEDE:
    "Toppings ships on the official Chrome and Firefox stores. Install it the normal way — no sideloading, no developer mode, no account.",
  CRUMB_GROUP: "Getting started",
  CRUMB_CURRENT: "Install Toppings",
  CRUMB_LINK_GROUP: true,
} as const;

export const TOC = [
  { ID: "what", LABEL: "What it does" },
  { ID: "install", LABEL: "Install" },
  { ID: "first", LABEL: "First run" },
  { ID: "privacy", LABEL: "Privacy model" },
  { ID: "next", LABEL: "What to do next" },
] as const;

export const EDIT_PATH = "website/app/docs/page.tsx" as const;

/** Shown in the install page footer; update when copy changes. */
export const LAST_UPDATED = "21 Jun 2026" as const;
