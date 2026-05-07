import type { DocsPart } from "@/lib/docs-part";

export const FAQ_CATEGORIES = [
  "All",
  "Privacy",
  "Features",
  "Install",
  "Troubleshooting",
] as const;

export type FaqCategoryFilter = (typeof FAQ_CATEGORIES)[number];
export type FaqCategory = Exclude<FaqCategoryFilter, "All">;

export interface FaqEntry {
  category: FaqCategory;
  question: string;
  paragraphs: readonly (readonly DocsPart[])[];
}

export const FAQ_ENTRIES: readonly FaqEntry[] = [
  {
    category: "Privacy",
    question: "Does Toppings collect any data?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "No. Toppings has zero analytics, zero telemetry, and zero remote calls. The extension requests two permissions — access to ",
        },
        { kind: "code", value: "youtube.com" },
        {
          kind: "text",
          value:
            " (so it can inject buttons into the player) and ",
        },
        { kind: "code", value: "storage" },
        {
          kind: "text",
          value: " (so your settings survive restarts). That is the complete list.",
        },
      ],
      [
        { kind: "text", value: "Don't trust us? Read the source — it's " },
        { kind: "link", target: "GITHUB_REPO", label: "on GitHub" },
        {
          kind: "text",
          value:
            " under GPL-3.0, and your network panel will be empty while it runs.",
        },
      ],
    ],
  },
  {
    category: "Privacy",
    question: "Where are my settings stored?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "In your browser's local extension storage. If you have browser profile sync enabled, they sync across your signed-in browsers via your browser vendor's sync system. Toppings does not run its own sync — we never see your settings.",
        },
      ],
    ],
  },
  {
    category: "Features",
    question: "How does Audio mode work?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "When you toggle Audio mode, Toppings hides the video frame and keeps the audio playing. You can replace the visible canvas with a solid black screen, an animated waveform, or your own background image.",
        },
      ],
      [
        {
          kind: "text",
          value:
            "The full timeline, chapters, playback controls, and speed keep working. Perfect for podcasts, talks, and live sets you don't need to see.",
        },
      ],
    ],
  },
  {
    category: "Features",
    question: "Can I loop more than one segment?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "Currently no — Loop supports a single in/out pair per video. Multi-segment loops are on the roadmap but we're being cautious about the UI complexity.",
        },
      ],
    ],
  },
  {
    category: "Features",
    question: "What's the maximum playback speed?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "16.0× technically, but audio decoders give up well below that. We recommend staying under 4× in the custom playback rate list, and Toppings will let you set increments as small as 0.0625× if you want.",
        },
      ],
    ],
  },
  {
    category: "Install",
    question: "Is Toppings available on mobile?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "Firefox for Android, yes — install from addons.mozilla.org directly. Chrome for Android does not support extensions; there's nothing we can do until Google ships extension support. Safari is not on our roadmap (different extension format, separate audit process).",
        },
      ],
    ],
  },
  {
    category: "Install",
    question: "Can I install Toppings without the store?",
    paragraphs: [
      [
        { kind: "text", value: "Yes. Clone the GitHub repo, run " },
        { kind: "code", value: "bun install" },
        { kind: "text", value: " then " },
        { kind: "code", value: "bun run build" },
        { kind: "text", value: " in " },
        { kind: "code", value: "web-ext/" },
        { kind: "text", value: ", and load the unpacked " },
        { kind: "code", value: "dist/" },
        { kind: "text", value: " directory via " },
        { kind: "code", value: "chrome://extensions" },
        { kind: "text", value: " with Developer mode on. Same flow for Firefox via " },
        { kind: "code", value: "about:debugging" },
        { kind: "text", value: "." },
      ],
    ],
  },
  {
    category: "Features",
    question: "What are Profiles?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "Profiles are named bundles of YouTube experience settings. Instead of toggling features one at a time, you activate a profile and everything changes at once — sidebar visibility, comments, end cards, playback layout, Shorts shelf, and more.",
        },
      ],
      [
        {
          kind: "text",
          value:
            "Toppings ships two built-in presets: ",
        },
        { kind: "code", value: "Audio" },
        {
          kind: "text",
          value: " (hides the player, perfect for music/podcasts) and ",
        },
        { kind: "code", value: "Focus" },
        {
          kind: "text",
          value:
            " (hides sidebar, comments, and end cards). You can create as many custom profiles as you like and switch between them from the popup, a keyboard shortcut, or the player gear menu.",
        },
      ],
    ],
  },
  {
    category: "Features",
    question: "How do I switch profiles quickly while watching a video?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "Three ways: (1) click the extension popup — the profile list is at the bottom; (2) use a keyboard shortcut — configure one in Options → Keybindings → Profiles → Cycle Profiles; (3) open the YouTube player's gear (⚙) menu and enable the Toppings section in Options → General → Profile Surfaces.",
        },
      ],
    ],
  },
  {
    category: "Features",
    question: "Can Profiles control the home page and search results too?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "Yes. Each profile can also configure home-page settings (feed thumbnails: show/hide/blur, Shorts shelf, entire feed) and search-result settings (thumbnails, video metadata, Shorts shelf). Open Options → Profiles, edit or create a profile, and scroll to the Home and Search sections.",
        },
      ],
    ],
  },
  {
    category: "Features",
    question: "Can I share or back up my custom profiles?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "Yes. Each custom profile card in Options → Profiles has an Export button that downloads a ",
        },
        { kind: "code", value: "toppings-profile-*.json" },
        {
          kind: "text",
          value:
            " file. To import on another browser, use the Import button at the top of the My Profiles section. Imported profiles are validated — a malformed file can never corrupt your storage.",
        },
      ],
    ],
  },
  {
    category: "Features",
    question: "What is the YouTube sidebar entry in Options → General?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "When you enable 'YouTube sidebar entry' in Options → General → Profile Surfaces, a Toppings link appears in YouTube's left navigation. Clicking it opens a native-styled settings page inside YouTube — no need to leave the site. From there you can switch profiles and toggle watch-page primitives.",
        },
      ],
    ],
  },
  {
    category: "Troubleshooting",
    question: "A feature shows as 'Unavailable on your YouTube' — what does that mean?",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "YouTube runs A/B tests that change the DOM structure of the page. If Toppings can't find the element it needs, it marks that feature as unavailable rather than crashing. Hit 'Report' on the row — we'll get a GitHub issue, and we try to add a new selector strategy in the next patch release. You'll see a banner in the options page once it's fixed.",
        },
      ],
    ],
  },
  {
    category: "Troubleshooting",
    question: "Toppings buttons don't appear on YouTube.",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "Three things to check: (1) Is the extension enabled? (2) Did you reload the YouTube tab after installing? (3) Are you on a ",
        },
        { kind: "code", value: "/watch" },
        {
          kind: "text",
          value:
            " URL? Playback controls (loop, speed, seek) only appear on video pages. Profile primitives for the home page and search run on those pages automatically.",
        },
      ],
      [
        {
          kind: "text",
          value:
            "If all three are yes, open the popup — if the status dot is grey, Toppings hasn't detected an active YouTube tab. If it's amber but the buttons still don't appear, another YouTube extension may be conflicting. Disable other YouTube extensions one at a time to find the culprit.",
        },
      ],
    ],
  },
  {
    category: "Troubleshooting",
    question: "My keybindings stopped working.",
    paragraphs: [
      [
        {
          kind: "text",
          value:
            "Keybindings only fire when the YouTube page is focused — if you're typing in a comment or the search box, they pause automatically (this is intentional). Click the video to refocus.",
        },
      ],
    ],
  },
];
