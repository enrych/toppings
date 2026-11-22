export const faq: readonly { q: string; a: readonly string[] }[] = [
  {
    q: "Does Toppings collect any data?",
    a: [
      "No. There are no analytics, no telemetry and no accounts. The extension asks for youtube.com, so it can add controls to the player; storage, so your settings survive restarts; alarms, so schedules can switch profiles on time; and scripting, so an update reaches YouTube tabs you already have open. Chrome also lists offscreen, a hidden page used only to check your location for a place schedule.",
      "Toppings never asks for your location up front. If you add a place schedule, your browser asks then, and the places you save stay on your device.",
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
      "Press B, click the headphones button beside the player's controls, or pick Audio in the popup. It covers the video with a waveform that moves with the sound, while the controls, progress bar and seeking keep working. Press B again to go back to what you had before.",
    ],
  },
  {
    q: "Can I loop more than one segment?",
    a: [
      "Yes. Mark several ranges on a video and each one loops as many times as you set, at its own speed, before the next takes over. Leave the count empty and it loops until you stop it. Z loads your last-used setup; Shift+Z starts a fresh one. A setup you want to keep can be saved under a name for that video.",
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
      "Named bundles of YouTube settings: sidebar, comments, end cards, Shorts shelves, feed thumbnails and more. Two presets ship, Audio and Focus. Create your own, then switch from the popup, the player's gear menu, or a shortcut; every profile can have its own.",
      "Each custom profile can be exported to a JSON file and imported elsewhere. Imports are validated, so a bad file can't corrupt your settings.",
    ],
  },
  {
    q: "Can a profile turn on by itself?",
    a: [
      "Yes, with a schedule: during set hours on chosen days, or while you're at a place you saved. When it ends, you get back the profile you had before. If you switch profiles yourself in the middle, your choice stands until the schedule ends.",
      "While a schedule is in charge, the toolbar icon shows the profile's first letter; five minutes before a change it counts down instead, and YouTube tabs show a short note. You can skip a schedule for the rest of its window from the popup.",
    ],
  },
  {
    q: "Is Toppings available on mobile?",
    a: [
      "Not yet. Toppings works on desktop YouTube; the mobile site is laid out differently and isn't supported. Chrome for Android doesn't run extensions at all, and Safari isn't planned.",
    ],
  },
  {
    q: "Can I install it without the store?",
    a: [
      "Yes. Clone the repo, run bun install and bun run build inside web-ext/, then load the dist/ folder from chrome://extensions with Developer mode on, or from about:debugging in Firefox.",
    ],
  },
  {
    q: "The buttons don't appear on YouTube.",
    a: [
      "Check that the extension is enabled, reload the YouTube tab, and make sure you're on a /watch page. If all three are fine, another YouTube extension may be conflicting; disable them one at a time. YouTube also changes its page often, so if something stopped working overnight, open an issue on GitHub and say which control went missing.",
    ],
  },
  {
    q: "My keybindings stopped working.",
    a: [
      "Shortcuts pause while you type in a comment or the search box. Click the video to refocus it.",
    ],
  },
];
