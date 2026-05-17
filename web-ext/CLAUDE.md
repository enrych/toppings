# Toppings web-ext — Maintainer notes

## Code layout

```
src/
  background/           Service worker + storage schema
  content_scripts/      Code injected into youtube.com
  popup/                Browser-action popup UI
  options/              Full-page settings UI (router + routes)
  shared/               Code reused across popup + options
    components/
      primitives/       Icon, Button, IconButton, Badge, Tooltip
      form/             Field, Switch, Input, Select, Slider,
                        Keybinding, FilePicker
      feedback/         Popup → ActionPopup → ConfirmPopup,
                        Toast + ToastProvider, ConfirmProvider
      layout/           Card, Section, SectionNav, PageHeader
    hooks/              useStoreUpdater, useChromeStorageLocal,
                        useChromeStorageLocalCount, useTheme
    utils/              browser detection, theme resolution
    store.tsx           Shared StoreContext
    theme.css           CSS variable tokens for all themes
    features.ts         Central feature registry — see below
```

**Rule of thumb:** any new UI primitive goes in `src/shared/`. Only put
something in `src/options/` or `src/popup/` if it is genuinely specific
to that surface (e.g. the options sidebar, the popup shell).

## Theming

All colors flow through CSS variables defined in `src/shared/theme.css`.
Components use semantic Tailwind tokens (`tw-bg-surface`, `tw-text-fg`,
etc.) — never hardcode hex values.

Theme is applied via `data-theme="dark|light"` on `<html>`. User
preference (system/dark/light) lives in `store.ui.theme`. The
`useTheme()` hook reads the preference, resolves "system" via
`matchMedia`, and writes the attribute on every render.

To add a new color token:

1. Define the variable in both the dark and light blocks of
   `shared/theme.css`.
2. Add it to the `colors:` extension in `scripts/build.js` so Tailwind
   exposes it as a utility class.
3. Use `tw-{token}-{utility}` in components.

## Features registry — KEEP UP TO DATE

`src/shared/features.ts` is the canonical catalog of user-facing
features. The popup and (potentially) other UIs render from it.

When you ship a feature:

1. Add a `FeatureEntry` to `FEATURES` with id, name, description, icon,
   route, status, and surfaces.
2. Add a one-line summary to the latest `WHATS_NEW` entry. Bump the
   `version` on each release.

When you remove or change a feature visibly, update the same files. The
file header has the full rules.

## Storage

- `chrome.storage.sync` — user preferences from `DEFAULT_STORE` (small,
  syncs across devices).
- `chrome.storage.local` — anything large or device-specific (uploaded
  background images, per-video pins, UI state like sidebar collapse,
  popup-to-options deep-link hints).

When you add a new preference, add it to `DEFAULT_STORE` in
`src/background/store.ts`. The `getStorage()` deep-merge ensures existing
installs pick up the new key without manual migration.

## Building

- `bun install` (once)
- `bun run dev` for watch mode
- `bun run build` for production

The webpack config in `scripts/build.js` produces four bundles
(background, content, popup, options) plus copied assets.
