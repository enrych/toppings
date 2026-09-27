export const faq: readonly { q: string; a: readonly string[] }[] = [
  {
    q: "Does Toppings collect any data?",
    a: [
      "No. There are no analytics, no telemetry and no accounts. The extension asks for two permissions: youtube.com, so it can add controls to the player, and storage, so your settings survive restarts.",
      "One feature talks to our server. Playlist runtime sends the playlist's ID to toppings.enry.ch/api, which looks up the video durations YouTube's page doesn't show. Nothing else leaves your browser.",
      "The source is on GitHub under GPL-3.0 if you'd rather check than trust.",
    ],
  },
  {
    q: "Where are my settings stored?",
    a: [
      "In your browser's extension storage. If browser profile sync is on, they sync through your browser vendor. Toppings runs no sync of its own and never sees your settings.",
    ],
  },
  {
    q: "How do I listen without the video?",
    a: [
      "Switch to the Audio preset from the popup, the player's gear menu, or a shortcut. It collapses the player and keeps playback running; switch profiles again to bring the video back.",
    ],
  },
  {
    q: "Can I loop more than one segment?",
    a: [
      "Yes. Segments let you mark several ranges on a video and play them in order, each with its own loop count and playback rate. Z loads your last-used setup; Shift+Z starts a fresh one.",
    ],
  },
  {
    q: "What is the maximum playback speed?",
    a: [
      "16× is the ceiling, but audio decoders give up well before that. Under 4× is the practical range. Steps can be as small as 0.0625×.",
    ],
  },
  {
    q: "What are profiles?",
    a: [
      "Named bundles of YouTube settings: sidebar, comments, end cards, Shorts shelf, feed thumbnails and more. Two presets ship, Audio and Focus. Create your own, then switch from the popup, a shortcut, or the player's gear menu.",
      "Each custom profile can be exported to a JSON file and imported elsewhere. Imports are validated, so a bad file can't corrupt your settings.",
    ],
  },
  {
    q: "Is Toppings available on mobile?",
    a: [
      "Firefox for Android, yes, from addons.mozilla.org. Chrome for Android doesn't support extensions. Safari isn't planned.",
    ],
  },
  {
    q: "Can I install it without the store?",
    a: [
      "Yes. Clone the repo, run bun install and bun run build inside web-ext/, then load the dist/ folder from chrome://extensions with Developer mode on, or from about:debugging in Firefox.",
    ],
  },
  {
    q: "A feature says “unavailable on your YouTube”. Why?",
    a: [
      "YouTube A/B-tests its page structure. When Toppings can't find the element a feature needs, it marks the feature unavailable instead of breaking. Use Report on that row; a fix usually lands in the next patch release.",
    ],
  },
  {
    q: "The buttons don't appear on YouTube.",
    a: [
      "Check that the extension is enabled, reload the YouTube tab, and make sure you're on a /watch page. If all three are fine, another YouTube extension is probably conflicting; disable them one at a time.",
    ],
  },
  {
    q: "My keybindings stopped working.",
    a: [
      "Shortcuts pause while you type in a comment or the search box. Click the video to refocus it.",
    ],
  },
];
