export const PAGE = {
  EYEBROW: "Frequently asked",
  TITLE_BEFORE: "Questions, ",
  TITLE_HIGHLIGHT: "answered",
  TITLE_AFTER: ".",
  CRUMB_GROUP: "Reference",
  CRUMB_CURRENT: "FAQ",
} as const;

export const CATEGORIES = [
  "All",
  "Privacy",
  "Features",
  "Install",
  "Troubleshooting",
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];
export type Category = Exclude<CategoryFilter, "All">;

export type Entry = {
  CATEGORY: Category;
  QUESTION: string;
  PARAGRAPHS: readonly string[];
};

export const ENTRIES: readonly Entry[] = [
  {
    CATEGORY: "Privacy",
    QUESTION: "Does Toppings collect any data?",
    PARAGRAPHS: [
      "No. Toppings has zero analytics, zero telemetry, and zero remote calls. The extension requests two permissions — access to youtube.com (so it can inject buttons into the player) and storage (so your settings survive restarts). That is the complete list.",
      "Don't trust us? Read the source on GitHub under GPL-3.0, and your network panel will be empty while it runs.",
    ],
  },
  {
    CATEGORY: "Privacy",
    QUESTION: "Where are my settings stored?",
    PARAGRAPHS: [
      "In your browser's local extension storage. If you have browser profile sync enabled, they sync across your signed-in browsers via your browser vendor's sync system. Toppings does not run its own sync — we never see your settings.",
    ],
  },
  {
    CATEGORY: "Features",
    QUESTION: "How does Audio mode work?",
    PARAGRAPHS: [
      "When you toggle Audio mode, Toppings hides the video frame and keeps the audio playing. You can replace the visible canvas with a solid black screen, an animated waveform, or your own background image.",
      "The full timeline, chapters, playback controls, and speed keep working. Perfect for podcasts, talks, and live sets you don't need to see.",
    ],
  },
  {
    CATEGORY: "Features",
    QUESTION: "Can I loop more than one segment?",
    PARAGRAPHS: [
      "Currently no — Loop supports a single in/out pair per video. Multi-segment loops are on the roadmap but we're being cautious about the UI complexity.",
    ],
  },
  {
    CATEGORY: "Features",
    QUESTION: "What's the maximum playback speed?",
    PARAGRAPHS: [
      "16.0× technically, but audio decoders give up well below that. We recommend staying under 4× in the custom playback rate list, and Toppings will let you set increments as small as 0.0625× if you want.",
    ],
  },
  {
    CATEGORY: "Install",
    QUESTION: "Is Toppings available on mobile?",
    PARAGRAPHS: [
      "Firefox for Android, yes — install from addons.mozilla.org directly. Chrome for Android does not support extensions; there's nothing we can do until Google ships extension support. Safari is not on our roadmap (different extension format, separate audit process).",
    ],
  },
  {
    CATEGORY: "Install",
    QUESTION: "Can I install Toppings without the store?",
    PARAGRAPHS: [
      "Yes. Clone the GitHub repo, run bun install then bun run build in web-ext/, and load the unpacked dist/ directory via chrome://extensions with Developer mode on. Same flow for Firefox via about:debugging.",
    ],
  },
  {
    CATEGORY: "Features",
    QUESTION: "What are Profiles?",
    PARAGRAPHS: [
      "Profiles are named bundles of YouTube experience settings. Instead of toggling features one at a time, you activate a profile and everything changes at once — sidebar visibility, comments, end cards, playback layout, Shorts shelf, and more.",
      "Toppings ships two built-in presets: Audio (hides the player, perfect for music/podcasts) and Focus (hides sidebar, comments, and end cards). You can create as many custom profiles as you like and switch between them from the popup, a keyboard shortcut, or the player gear menu.",
    ],
  },
  {
    CATEGORY: "Features",
    QUESTION: "How do I switch profiles quickly while watching a video?",
    PARAGRAPHS: [
      "Three ways: (1) click the extension popup — the profile list is at the bottom; (2) use a keyboard shortcut — configure one in Options → Keybindings → Profiles → Cycle Profiles; (3) open the YouTube player's gear menu and enable the Toppings section in Options → General → Profile Surfaces.",
    ],
  },
  {
    CATEGORY: "Features",
    QUESTION: "Can Profiles control the home page and search results too?",
    PARAGRAPHS: [
      "Yes. Each profile can also configure home-page settings (feed thumbnails: show/hide/blur, Shorts shelf, entire feed) and search-result settings (thumbnails, video metadata, Shorts shelf). Open Options → Profiles, edit or create a profile, and scroll to the Home and Search sections.",
    ],
  },
  {
    CATEGORY: "Features",
    QUESTION: "Can I share or back up my custom profiles?",
    PARAGRAPHS: [
      "Yes. Each custom profile card in Options → Profiles has an Export button that downloads a toppings-profile-*.json file. To import on another browser, use the Import button at the top of the My Profiles section. Imported profiles are validated — a malformed file can never corrupt your storage.",
    ],
  },
  {
    CATEGORY: "Features",
    QUESTION: "What is the YouTube sidebar entry in Options → General?",
    PARAGRAPHS: [
      "When you enable 'YouTube sidebar entry' in Options → General → Profile Surfaces, a Toppings link appears in YouTube's left navigation. Clicking it opens a native-styled settings page inside YouTube — no need to leave the site. From there you can switch profiles and toggle watch-page primitives.",
    ],
  },
  {
    CATEGORY: "Troubleshooting",
    QUESTION: "A feature shows as 'Unavailable on your YouTube' — what does that mean?",
    PARAGRAPHS: [
      "YouTube runs A/B tests that change the DOM structure of the page. If Toppings can't find the element it needs, it marks that feature as unavailable rather than crashing. Hit 'Report' on the row — we'll get a GitHub issue, and we try to add a new selector strategy in the next patch release. You'll see a banner in the options page once it's fixed.",
    ],
  },
  {
    CATEGORY: "Troubleshooting",
    QUESTION: "Toppings buttons don't appear on YouTube.",
    PARAGRAPHS: [
      "Three things to check: (1) Is the extension enabled? (2) Did you reload the YouTube tab after installing? (3) Are you on a /watch URL? Playback controls (loop, speed, seek) only appear on video pages. Profile primitives for the home page and search run on those pages automatically.",
      "If all three are yes, open the popup — if the status dot is grey, Toppings hasn't detected an active YouTube tab. If it's amber but the buttons still don't appear, another YouTube extension may be conflicting. Disable other YouTube extensions one at a time to find the culprit.",
    ],
  },
  {
    CATEGORY: "Troubleshooting",
    QUESTION: "My keybindings stopped working.",
    PARAGRAPHS: [
      "Keybindings only fire when the YouTube page is focused — if you're typing in a comment or the search box, they pause automatically (this is intentional). Click the video to refocus.",
    ],
  },
];
