# Toppings on YouTube

A customizable browser extension that gives you total control over YouTube—track playlist runtimes, fine-tune playback speed, auto-scroll Shorts, set custom seek durations, and more. Take control of your YouTube like never before.

---

## Why Toppings?

- **Track Playlist Runtimes**: Know exactly how much time you’ll spend binging playlists.
- **Custom Playback Controls**: Set precise playback speeds and seek durations.
- **Auto-Scroll Shorts**: Enjoy an uninterrupted flow of Shorts with automatic scrolling.
- **Deep Personalization**: Tailor every feature to fit your workflow with custom keybindings.
- **Privacy-First**: No data collection—your browsing remains yours.

---

## Get Started

- **[Download for Chrome](https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl)**
- **[Download for Firefox](https://addons.mozilla.org/en-US/firefox/addon/toppings/)**

---

## Development

Here’s how to set up Toppings for local development:

### Prerequisites

Ensure the following tools are installed:

- [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)
- A [Google API Key](https://console.developers.google.com/) with access to the YouTube API

### 📁 Project Structure

The repository is organized into three main directories:

1. **web-ext**: Contains the browser extension code.
2. **backend**: Server-side logic built with Cloudflare Workers.
3. **website**: The official homepage of the Toppings extension, built with Next.js.

---

### 🏡 Local Development Setup

#### Setting Up the Extension

1. Clone the repository:

   ```bash
   git clone https://github.com/enrych/toppings.git
   cd toppings/web-ext
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start development mode:

   For Chrome:

   ```bash
   bun run dev
   ```

   For Firefox:

   ```bash
   bun run dev:firefox
   ```

---

#### Setting Up the Server (Optional)

Some features require backend functionality. You can run the server locally using Cloudflare Workers.

1. Navigate to the backend directory:

   ```bash
   cd ../backend
   ```

2. Install `wrangler` (if not already installed):

   ```bash
   npm install -g wrangler
   ```

3. Add your Google YouTube API secret in `.dev.vars`:

   ```env
   GOOGLE_SECRET=your-google-youtube-api-key
   ```

4. Start the server:

   ```bash
   wrangler dev
   ```

---

#### Running the Website

1. Navigate to the `website` directory:

   ```bash
   cd ../website
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun run dev
   ```

---

## Feedback and Support

Feedback is always welcome! If you enjoy Toppings, consider:

- Leaving a ⭐ on [GitHub](https://github.com/enrych/toppings)
- Reviewing on:
  - [Chrome Web Store](https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl)
  - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/toppings/)

Use these channels to get involved:

- **Discussions**: For questions or feature ideas, join the [GitHub Discussions](https://github.com/enrych/toppings/discussions).
- **Issues**: Report bugs or request features in the [Issues](https://github.com/enrych/toppings/issues) section.
- **Wiki**: Find detailed documentation in the [GitHub wiki](https://github.com/enrych/toppings/wiki).

---

## Support the Project

Toppings is free and open-source. If you find it helpful, consider supporting the development through [sponsorships](https://darhkvoyd.me/sponsor).

Your support helps improve Toppings and keeps it sustainable.

---

## License

Toppings is licensed under the [GPL-3.0 License](./LICENSE). You’re free to use, modify, and distribute the extension as long as your work complies with the GPL-3.0 terms.

Happy coding! 😊
