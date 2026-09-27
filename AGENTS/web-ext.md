# AGENTS/web-ext.md

Scoped rules for `web-ext/`, the Chrome and Firefox extension. Read [`../AGENTS.md`](../AGENTS.md) first — its rules, especially the comment policy, apply here in full.

---

## 1. COMMANDS

Run from `web-ext/`:

| Command | What it does |
| --- | --- |
| `bun run dev` | Build into `dist/` (Chrome, MV3) and rebuild on change |
| `bun run dev:firefox` | Same, transformed to MV2 |
| `bun run build` / `build:firefox` | Production build |
| `bun run check` | `tsc --noEmit` (app and `scripts/`), then `bun test` |
| `bun run release` / `release:firefox` | Build, then zip `dist/` via `scripts/release.ts` |

The build is `scripts/build.ts`: `Bun.build` per entry (IIFE, no code splitting), Tailwind through its PostCSS API from `tailwind.config.ts`, static copies, and the manifest transform. Set `DIST=<dir>` to build somewhere other than `dist/`, so a Chrome and a Firefox build can coexist. CSS is not imported from JS: the popup and options pages link their stylesheet; the content script ships none, because everything it injects is styled inside its own shadow roots.

---

## 2. ENTRY POINTS

Four entries, all under `app/` (`scripts/build.ts`):

| Entry | Source | Runs in |
| --- | --- | --- |
| `background` | `app/background/index.ts` | Service worker (MV3) / background page (MV2) |
| `content` | `app/content/index.ts` | Injected into YouTube pages |
| `popup` | `app/popup/index.tsx` | Toolbar popup |
| `options` | `app/options/index.tsx` | Options page |

The content script does one thing: `bootFeatures([...features], onNavigate, { enabled })`. The background serves feature messages, migrates the pre-kernel store on install, and keeps the toolbar icon in step with the master switch.

---

## 3. THE KERNEL

Every feature is one folder under `features/` exporting a `Feature` (`kernel/features.ts`). The kernel mounts a feature on each navigation that lands on one of its `routes` and calls the returned unmount on the next, so `mount` always starts from a clean page and never has to be idempotent. YouTube is a single-page app; `youtube/route.ts` turns its `yt-navigate-finish` event into a `Route`.

A feature folder holds, as needed:

- `settings.ts` — its slice: `defineSettings(id, defaults, { legacy?, area? })` (`kernel/settings.ts`), stored as `settings:<id>` in `chrome.storage.sync` (or `local` for data too big or personal to roam). `legacy` maps the pre-kernel store into the slice; `migrateSettings` runs each once. Pages read a slice with `useSettings`.
- `keys.ts` — its keyboard actions: `defineKeys({ id, title, keys })` (`kernel/keys.ts`). A feature binds handlers at mount with `bindKeys`; the user's overrides live in the `keybindings` slice by action id (`playback.seekForward`); the Shortcuts page renders every group from the registries. Data-driven shortcuts (a saved segment config's own key) are the feature's business.
- `messages.ts` — anything the background must do for it: `defineMessage(kind)` (`kernel/messaging.ts`), handled in a `background.ts` next to the feature.
- `index.tsx` — the `Feature`. Where it needs a page element it asks `youtube/` (`resolveVideo`, `resolveGuideSettingsSection`, …), which wraps `resolveTarget` (`kernel/dom/resolve.ts`) around ordered selector strategies, and records the outcome with `setCapabilityStatus` so the options page can say a selector broke. **Selectors live in `youtube/`, not in features.**
- UI is Preact. `mount()` (`kernel/dom/mount.ts`) renders into a shadow root so YouTube's CSS and ours never meet; `mountInline()` renders into a host the caller shapes when the element must take YouTube's own classes (a `.ytp-button`, a settings-menu row). In-page styles read YouTube's colour tokens through `themeTokens` (`kernel/dom/theme.ts`) and so follow the page's theme. `showToast` (`kernel/dom/toast.tsx`) is the shared notice.
- Profiles are built on primitives: `youtube/primitives.ts` catalogues each page knob (id, routes, strategies, `parse`, idempotent `apply`, `reset`), and `runPrimitives` (`kernel/primitives.ts`) keeps a set of values applied while the page re-renders and restores everything on stop.
- Tests run under Bun with happy-dom; `test/setup.ts` registers the DOM and an in-memory `chrome.storage` that emits change events. A feature takes anything it cannot get from the page as a `deps` object (a fetcher, a storage) so tests mount it against HTML fixtures of each YouTube layout. `features/playlist-runtime/index.test.ts` and `features/segments/index.test.ts` are the patterns.

Live verification covers both browsers. Chromium: Playwright loading the built `dist/`. Firefox: Puppeteer over WebDriver BiDi with `browser.installExtension`, launched with `-remote-allow-system-access`; BiDi will not navigate to `moz-extension://` pages directly, so a throwaway copy of the build lists `options/*` and `popup/*` as web-accessible and is reached from a normal page. Headless, logged-out YouTube serves older layouts than a signed-in browser, so a strategy list should carry both.

---

## 4. PAGES

`app/popup/` and `app/options/` are Preact pages (`preact/hooks`; `preact/compat` only for portals). Options routes by hash (`app/options/router.ts`); the search box (`app/options/search/`) locates a result by its rendered label, so a copy edit in a page must land in `searchIndex.ts` too.

The pages wear the Toppings brand, shared with the website: ink, bone and ember on `--color-*` tokens in `ui/theme.css`, Gloock for display (`tw-font-display`) and Instrument Sans for text, both bundled in `assets/fonts` so the popup never calls a third party. Only what Toppings draws inside YouTube takes YouTube's palette (`kernel/dom/theme.ts`). Tailwind runs prefixed and without preflight; `ui/base.css` is the reset, and sets the font on `body` because Chrome gives extension pages' body its own system font. Tailwind's opacity modifiers (`tw-bg-accent/50`) do nothing on these variable colours — use `color-mix` in a style attribute instead.

---

## 5. STORAGE

| Layer | Holds | Accessed via |
| --- | --- | --- |
| `chrome.storage.sync` | Every settings slice, `settings:<id>` | `kernel/settings.ts` |
| `chrome.storage.local` | The profile store (`settings:profiles`), feature reports, per-device UI flags | `features/profiles/store.ts`, `kernel/dom/featureReports.ts`, `lib/useChromeStorageLocal.ts` |
| IndexedDB | Capability cache, per-video segment data | `lib/indexedDb.ts`, `kernel/dom/capabilities.ts`, `features/segments/store.ts` |

A slice is read with its defaults merged in, which is also how a new setting reaches existing users. The pre-kernel store (`isExtensionEnabled`, `ui`, `preferences`) is migrated once by `app/background/migrations.ts` and then removed; `migrations.test.ts` pins the mapping.

---

## 6. MANIFEST AND VERSIONING

- `app/manifest.json` is the **MV3 source of truth**. The MV2 Firefox variant is generated at build time by the transform in `scripts/build.ts` (flips `manifest_version`, folds `host_permissions` into `permissions`, renames `action` → `browser_action`, flattens `web_accessible_resources`). Never hand-maintain a second manifest; extend the transform.
- Version lives in `lib/version.ts` as `EXTENSION_VERSION` and is injected into the manifest at build time. It is also mirrored in `website/lib/site.ts` (`site.version`) on release — update both.

---

## 7. LAYOUT

```text
web-ext/
├── app/                 # The four surfaces, and only their shells
│   ├── background/      # Install hooks, migrations, message handlers, icon
│   ├── content/         # bootFeatures
│   ├── options/         # Preact options page: router, layout, search, routes/
│   ├── popup/           # Preact toolbar popup
│   └── settings.ts      # The app slice: master switch and theme
├── kernel/              # Feature contract, settings, keys, messaging, primitives,
│                        # dom/ (resolve, mount, capabilities, reports, theme, toast)
├── youtube/             # Routes, navigation, selectors per page area, the primitive catalogue
├── features/            # One folder per thing the extension does
│   ├── playback/        # Default rate, rate and seek keys, custom rates in the speed panel
│   ├── playlist-runtime/# Runtime statistics on playlist and watch pages
│   ├── profiles/        # Presets, profile store, gear-menu panel, native settings, import/export
│   ├── segments/        # Engine, session, storage, markers, button, panel/
│   └── shorts/          # Auto-scroll, rate and seek on Shorts
├── lib/                 # Plumbing with no YouTube or kernel knowledge: storage keys,
│                        # indexedDb, duration, urls, version, brand
├── ui/                  # Shared page components: form, feedback, layout, primitives, theme
├── test/                # Bun test preload
└── scripts/             # build.ts (Bun.build + manifest transform), release.ts
```

Imports across folders use the `@/` root alias; same-folder imports stay relative. There are no barrel `index.ts` files: import the file that defines what you need. Options routes stay under `app/options/routes` because they do not map one-to-one onto features.

A helper that only one feature uses lives in that feature's folder. It moves to `kernel/` when it is about running features, to `youtube/` when it is about YouTube's page, and to `lib/` only when it is neither.

---

## 8. YOUTUBE-SPECIFIC GOTCHAS

- Selectors in `youtube/` target YouTube's markup and break when YouTube ships changes. They are the correct place for a "why" comment naming the layout variant a strategy targets.
- YouTube's Polymer lists (the guide, the settings menu) drop foreign children when they re-render; anything injected into one must be put back on a `MutationObserver` (`features/profiles/index.tsx`).
- The player's speed panel is a slider with preset chips, not a menu list; the playback feature replaces the chips and syncs the slider and display itself, because YouTube only redraws them from its own state.
- The desktop player has no double-tap seek overlay to reuse; the playback feature draws its own.
- Firefox's `chrome.*` namespace is callback-only under MV2: called for a promise it returns `undefined`. The code calls `chrome.*` promise-style, and the Firefox build rewrites the global to `browser` (`scripts/build.ts`). Never pass callbacks to extension APIs, or the Firefox build breaks the other way.
- YouTube's theme reaches shadow roots as `--yt-sys-color-baseline--*` custom properties on `<html>`; a shadow host reset with `all: initial` would discard them.
