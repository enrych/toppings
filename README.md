<p align="center">
  <img src="assets/logo-transparent.png" alt="" width="96" height="96" />
</p>

<h1 align="center">Toppings</h1>

<p align="center">
  <strong>Your YouTube, your way.</strong><br />
  A free, open-source browser extension that adds the controls YouTube's player is missing.
</p>

<p align="center">
  <a href="https://toppings.enry.ch">toppings.enry.ch</a> ·
  <a href="https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl">Chrome Web Store</a> ·
  <a href="https://addons.mozilla.org/en-US/firefox/addon/toppings/">Firefox Add-ons</a>
</p>

---

I built Toppings because YouTube's player is missing things I wanted every day. It's a side project, it's free, and it stays that way. Everything it adds looks like YouTube, follows YouTube's light or dark theme, and gets out of the way.

## What it does

- **Profiles.** Presets that reshape YouTube in one switch. *Audio* collapses the player and keeps the sound. *Focus* hides the sidebar, comments and end cards. You can make your own, and export or import them as JSON.
- **Loop segments.** Mark in and out points and loop a section. You can also line up several segments, each with its own loop count and speed.
- **Custom playback rates.** Speeds YouTube doesn't offer, from 0.0625× to 16×, right in the player's own speed panel.
- **Toggle rate.** One key flips between 1× and your preferred fast rate.
- **Seek shortcuts.** Jump back and forward by however many seconds you like.
- **Shorts auto-scroll.** Moves on to the next Short when one ends.
- **Playlist runtime.** Shows the total and average runtime at the top of every playlist.

Every shortcut can be rebound. The defaults are listed at [toppings.enry.ch/docs/keybindings](https://toppings.enry.ch/docs/keybindings).

## Privacy

There are no accounts, no analytics and no trackers. Your settings live in your browser's extension storage. The one exception is playlist runtime. YouTube's page doesn't expose video durations, so the extension sends the playlist ID to a small Cloudflare Worker at `toppings.enry.ch/api`, which asks the YouTube Data API. That's all it sends.

## Docs

- [Getting started](https://toppings.enry.ch/docs)
- [Keybindings](https://toppings.enry.ch/docs/keybindings)
- [FAQ](https://toppings.enry.ch/docs/faq)
- [Changelog](https://toppings.enry.ch/docs/changelog)

## Hacking on it

The repo holds three projects, each on [Bun](https://bun.sh):

| Folder | What it is |
| --- | --- |
| [`web-ext/`](web-ext) | The extension, for Chrome (MV3) and Firefox (MV2) from one codebase |
| [`backend/`](backend) | The Cloudflare Worker behind `/api` |
| [`website/`](website) | [toppings.enry.ch](https://toppings.enry.ch), a static Next.js export on Cloudflare Pages |

If you use a coding agent, point it at [`AGENTS.md`](AGENTS.md) first. That file holds the house rules, and each project has its own scoped notes.

### Extension

```bash
cd web-ext
bun install
bun run dev            # builds dist/ for Chrome and rebuilds on change
bun run dev:firefox    # same, as a Firefox MV2 build
```

To load it in Chrome, open `chrome://extensions`, turn on Developer mode, click **Load unpacked** and pick `web-ext/dist`. In Firefox, open `about:debugging`, go to **This Firefox**, click **Load Temporary Add-on** and pick `web-ext/dist/manifest.json`.

`bun run check` type-checks and runs the tests. `bun run build` makes a production build.

A dev build asks the local Worker for playlist runtimes, so start the backend too if you're working on that feature.

### Backend

You need a [YouTube Data API v3 key](https://console.cloud.google.com/apis/library/youtube.googleapis.com).

```bash
cd backend
bun install
echo "YOUTUBE_DATA_API_V3_KEY=your-key" > .dev.vars   # gitignored
bun run dev            # wrangler dev on http://127.0.0.1:8787
```

### Website

```bash
cd website
bun install
bun run dev
```

`bun run check` runs the type-check and lint. `bun run build` writes the static site to `out/`.

Pushes to `main` deploy the website and the backend. The extension ships to the stores by hand.

## Bugs, ideas, help

Found something broken or have an idea? [Open an issue](https://github.com/enrych/toppings/issues). YouTube changes its page often, so if a feature shows as unavailable in the options page, the **Report** button there fills in most of the issue for you.

## Add a topping

Toppings is free and always will be. If it saves you time, you can [add a topping](https://darhkvoyd.me/sponsor) to keep it going. A ⭐ here or a review on the [Chrome Web Store](https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/toppings/) helps a lot too.

## License

[GPL-3.0](LICENSE). Fork it, change it, ship it. Keep it open.
