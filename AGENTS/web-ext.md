# AGENTS/web-ext.md

Scoped rules for `web-ext/`, the Chrome and Firefox extension. Read [`../AGENTS.md`](../AGENTS.md) first — its rules, especially the comment policy, apply here in full.

---

## 1. COMMANDS

Run from `web-ext/`:

| Command | What it does |
| --- | --- |
| `bun run dev` | Webpack watch build into `dist/` (Chrome, MV3) |
| `bun run dev:firefox` | Same, transformed to MV2 |
| `bun run build` | Production build |
| `bun run type-check` | `tsc --noEmit` |
| `bun test` | Bun's runner, for `*.test.ts` files |
| `bun run release` | Build, then zip via `scripts/release.js` |

`bun run test` is aliased to `type-check` only — it does **not** run `bun test`. Run both when you change logic.

**Known breakage:** `type-check` currently fails with `TS2688: Cannot find type definition file for 'chai' / 'mocha'`. `tsconfig.json` lists both in `compilerOptions.types` but neither is installed. Pre-existing and unrelated to any new change — report it as such rather than "fixing" it inside an unrelated task.

---

## 2. ENTRY POINTS

Four webpack entries, all under `app/` (`scripts/build.js`):

| Entry | Source | Runs in |
| --- | --- | --- |
| `background` | `app/background/index.ts` | Service worker (MV3) / background page (MV2) |
| `content` | `app/content_scripts/index.ts` | Injected into YouTube pages |
| `popup` | `app/popup/index.tsx` | Toolbar popup |
| `options` | `app/options/index.tsx` | Options page |

---

## 3. THE TWO RENDERING WORLDS

This is the single most important thing to get right in this project.

- **`app/popup/`, `app/options/`, `components/`** — real React with `react-dom`, hooks, state, context.
- **`app/content_scripts/`** — **dom-chef**, not React. JSX there compiles to real DOM nodes at call time. There is no reconciler, no re-render, no hooks. A component is a function that returns an `HTMLElement` you insert yourself and update by hand or replace outright.

Both use `jsx: "react-jsx"` and the same Babel preset, so a file's imports are the only signal. Check them before writing JSX. Reaching for `useState` in a content script fails at runtime, not at build.

---

## 4. STORAGE LAYERS

Three, with different rules. Constants live in `data/core.ts`.

| Layer | Holds | Accessed via |
| --- | --- | --- |
| `chrome.storage.sync` | User settings, shape of `DEFAULT_STORE` (`data/store.ts`) | `app/background/store.ts`, `core/useChromeStorageSync.ts` |
| `chrome.storage.local` | Profiles, feature reports — keys in `CHROME_STORAGE_LOCAL_KEY` | `core/profileStore.ts`, `core/featureReports.ts`, `core/useChromeStorageLocal.ts` |
| IndexedDB | Capability cache, segment data — stores in `BROWSER_STORAGE_IDB_STORE` | `utils/indexedDb.ts`, `core/capabilityCache.ts` |

**`DEFAULT_STORE` is the schema.** `mergeDefaults` (`utils/object.ts`) overlays stored values on it and **drops keys absent from the defaults**, and `syncStorageWithDefaults` writes the result back. Adding a setting means adding it to `DEFAULT_STORE`; removing one from `DEFAULT_STORE` removes it from every user's storage on next sync. Every `storage.sync.set` in the codebase writes this one shape — keep it that way, or `mergeDefaults` will quietly delete whatever does not fit.

---

## 5. MANIFEST AND VERSIONING

- `app/manifest.json` is the **MV3 source of truth**. The MV2 Firefox variant is generated at build time by the transform in `scripts/build.js` (flips `manifest_version`, folds `host_permissions` into `permissions`, renames `action` → `browser_action`, flattens `web_accessible_resources`). Never hand-maintain a second manifest; extend the transform.
- Version lives in `data/version.ts` as `EXTENSION_VERSION` and is injected into the manifest at build time. It is also mirrored in `website/lib/version.ts` on release — update both.

---

## 6. LAYOUT

```text
web-ext/
├── app/
│   ├── background/          # Service worker: storage, API, context dispatch
│   ├── content_scripts/
│   │   ├── pages/           # Per-page-type entry logic (watch, playlist, shorts)
│   │   ├── primitives/      # YouTube DOM selectors, grouped by page
│   │   ├── segments/        # Segment engine, store, markers
│   │   └── components/      # dom-chef UI injected into YouTube
│   ├── options/             # React options page (routes, search)
│   └── popup/               # React toolbar popup
├── components/              # Shared React UI (form, layout, feedback, primitives)
├── core/                    # Cross-cutting state: stores, hooks, caches
├── data/                    # Constants and schemas: store, core, urls, brand, profiles
├── utils/                   # Pure helpers, one file per domain
└── scripts/                 # build.js (webpack + manifest transform), release.js
```

`utils/` is one file per domain (`object.ts`, `duration.ts`, `keybinding.ts`, …). A new helper goes in the existing domain file. Create a new one only when the domain genuinely does not exist yet — not for a single function.

---

## 7. YOUTUBE-SPECIFIC GOTCHAS

- **YouTube is a SPA — the content script never re-runs on navigation.** The background listens to `chrome.webNavigation.onHistoryStateUpdated` (`app/background/index.ts`) and dispatches a `CONTEXT` message; `app/content_scripts/index.ts` receives it and routes to a per-scope handler. So a page handler runs repeatedly against a live DOM it did not start with: it must be idempotent, must not double-inject, and must tear down what the previous route left behind. Nothing is cleaned up for you.
- Selectors in `app/content_scripts/primitives/` target YouTube's markup and break when YouTube ships changes. They are the correct place for a "why" comment naming the layout variant a selector targets — that is exactly the external constraint the code cannot state on its own.
