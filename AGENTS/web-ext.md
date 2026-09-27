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

The build is `scripts/build.ts`: `Bun.build` per entry (IIFE, no code splitting), Tailwind through its PostCSS API from `tailwind.config.ts`, static copies, and the manifest transform. CSS is not imported from JS: the content script's stylesheet is listed in the manifest, and the popup and options pages link theirs.

---

## 2. ENTRY POINTS

Four entries, all under `app/` (`scripts/build.ts`):

| Entry | Source | Runs in |
| --- | --- | --- |
| `background` | `app/background/index.ts` | Service worker (MV3) / background page (MV2) |
| `content` | `app/content/index.ts` | Injected into YouTube pages |
| `popup` | `app/popup/index.tsx` | Toolbar popup |
| `options` | `app/options/index.tsx` | Options page |

---

## 3. THE KERNEL, AND WHAT STILL RUNS ON THE OLD PATH

The extension is moving feature by feature onto a small kernel. Ported so far: **playlist-runtime**. Everything else (playback, segments, shorts, profiles) still runs on the legacy path: background `getContext` → `CONTEXT` message → `app/content/index.ts` scope handlers. Port the next feature the same way; do not add to the legacy path.

A kernel feature is one folder under `features/` exporting a `Feature` (`kernel/features.ts`):

- `routes`: which `youtube/route.ts` routes it runs on. The kernel mounts it on every navigation that lands there and calls the returned unmount on the next one, so `mount` starts from a clean page and never has to be idempotent.
- `settings.ts`: its own slice via `defineSettings(id, defaults, legacy?)` (`kernel/settings.ts`), stored under `settings:<id>` in `chrome.storage.sync`. `legacy` reads the value out of the old store shape; `migrateSettings` in the background runs it once before the legacy resync. Options pages read a slice with `useSettings`.
- `messages.ts`: anything the background must do for it (API calls) is a `defineMessage` (`kernel/messaging.ts`); the background registers the handler in a `background.ts` next to the feature.
- UI is Preact (`/** @jsxImportSource preact */`) rendered into a shadow root with `kernel/dom/mount.ts`, styled inline; YouTube's CSS and ours never meet.
- DOM lookups go through `resolveTarget` (`kernel/dom/resolve.ts`) with the strategies in `youtube/` and the result recorded with `setCapabilityStatus`, so the options page can report a broken selector.
- Tests run under Bun with happy-dom (`test/setup.ts` registers the DOM and an in-memory `chrome.storage`). A feature takes its outside world as a `deps` object so tests mount it against HTML fixtures of each YouTube layout; `features/playlist-runtime/index.test.ts` is the pattern.

## 4. THE TWO RENDERING WORLDS

This is the single most important thing to get right in this project.

- **`app/popup/`, `app/options/`, `ui/`** — real React with `react-dom`, hooks, state, context.
- **`app/content/`, and the content-script code under `features/`** — **dom-chef**, not React. JSX there compiles to real DOM nodes at call time. There is no reconciler, no re-render, no hooks. A component is a function that returns an `HTMLElement` you insert yourself and update by hand or replace outright.

A content-script file declares its world with `/** @jsxImportSource dom-chef-jsx */` as its first line; that routes its JSX to `app/content/jsx/jsx-runtime.ts`, which builds DOM nodes with dom-chef and types elements as `HTMLElement` with native event handlers. Without the pragma a file gets React's runtime and React's types. Reaching for `useState` in a content script fails at runtime, not at build.

---

## 5. STORAGE LAYERS

Three, with different rules. Keys live in `lib/storageKeys.ts`.

| Layer | Holds | Accessed via |
| --- | --- | --- |
| `chrome.storage.sync` | Legacy settings, shape of `DEFAULT_STORE` (`lib/store.ts`); kernel slices under `settings:<feature>` | `lib/store.ts`, `lib/useChromeStorageSync.ts`; `kernel/settings.ts` |
| `chrome.storage.local` | Profiles, feature reports — keys in `CHROME_STORAGE_LOCAL_KEY` | `features/profiles/profileStore.ts`, `features/profiles/featureReports.ts`, `lib/useChromeStorageLocal.ts` |
| IndexedDB | Capability cache, segment data — stores in `BROWSER_STORAGE_IDB_STORE` | `lib/indexedDb.ts`, `features/profiles/capabilityCache.ts`, `features/segments/segmentStore.ts` |

**`DEFAULT_STORE` is the schema.** `mergeDefaults` (`lib/object.ts`) overlays stored values on it and **drops keys absent from the defaults**, and `syncStorageWithDefaults` writes the result back. Adding a setting means adding it to `DEFAULT_STORE`; removing one from `DEFAULT_STORE` removes it from every user's storage on next sync. Every `storage.sync.set` in the codebase writes this one shape — keep it that way, or `mergeDefaults` will quietly delete whatever does not fit.

---

## 6. MANIFEST AND VERSIONING

- `app/manifest.json` is the **MV3 source of truth**. The MV2 Firefox variant is generated at build time by the transform in `scripts/build.ts` (flips `manifest_version`, folds `host_permissions` into `permissions`, renames `action` → `browser_action`, flattens `web_accessible_resources`). Never hand-maintain a second manifest; extend the transform.
- Version lives in `data/version.ts` as `EXTENSION_VERSION` and is injected into the manifest at build time. It is also mirrored in `website/lib/site.ts` (`site.version`) on release — update both.

---

## 7. LAYOUT

```text
web-ext/
├── app/                 # The four surfaces, and only their shells
│   ├── background/      # Service worker: context dispatch, install hooks
│   ├── content/         # Content-script entry, its CSS, the dom-chef JSX runtime
│   ├── options/         # React options page: router, layout, search, routes/
│   └── popup/           # React toolbar popup
├── kernel/              # Feature contract, settings slices, messaging, DOM resolve + mount
├── youtube/             # Routes, navigation event, per-page DOM strategies (kernel features)
├── features/            # One folder per thing the extension does
│   ├── playback/        # Rates, seek, double-tap, the player menu (watch page)
│   ├── playlist/        # Playlist page, cache, API client
│   ├── profiles/        # Presets, profile store, primitives/ (YouTube DOM strategies),
│   │                    # applyProfile, gear menu, native settings, import/export,
│   │                    # capability cache, feature reports
│   ├── segments/        # Engine, store, markers, button, panel
│   └── shorts/          # Shorts page
├── lib/                 # Plumbing any feature may use: store schema and helpers,
│                        # storage keys, protocol, YouTube constants, indexedDb,
│                        # keybinding, duration, object, browser, version
├── ui/                  # Shared React components: form, feedback, layout, primitives, theme
└── scripts/             # build.ts (Bun.build + manifest transform), release.ts
```

Imports across folders use the `@/` root alias (`@/lib/store`); same-folder imports stay relative. There are no barrel `index.ts` files: import the file that defines what you need. Options routes stay under `app/options/routes` because they do not map one-to-one onto features (Keybindings spans all of them).

A helper that only one feature uses lives in that feature's folder. It moves to `lib/` when a second feature needs it, not before.

---

## 8. YOUTUBE-SPECIFIC GOTCHAS

- **YouTube is a SPA — the content script never re-runs on navigation.** The background listens to `chrome.webNavigation.onHistoryStateUpdated` (`app/background/index.ts`) and dispatches a `CONTEXT` message; `app/content/index.ts` receives it and routes to a per-scope handler. So a page handler runs repeatedly against a live DOM it did not start with: it must be idempotent, must not double-inject, and must tear down what the previous route left behind. Nothing is cleaned up for you.
- Selectors in `features/profiles/primitives/` target YouTube's markup and break when YouTube ships changes. They are the correct place for a "why" comment naming the layout variant a selector targets — that is exactly the external constraint the code cannot state on its own.
