# Toppings — Repo Workflow

Top-level conventions for keeping the extension, website, and docs in sync.

## Single source of truth

| Concern | Source file | Consumers |
|---|---|---|
| **Version number** | `packages/constants/src/version.ts` (`EXTENSION_VERSION`) | Every `package.json`, `web-ext/src/manifest.json`, website footer/eyebrow, popup version pill, changelog header |
| **Release notes** | `packages/constants/src/releases.ts` (`RELEASES`) | Popup "What's new", website `/docs/changelog`, (future) GitHub Releases body |
| **Feature catalog** | `packages/constants/src/extensionFeatureCatalog.ts` (`EXTENSION_FEATURE_DEFINITIONS`) | Popup features list, docs cross-references |
| **Default keybindings** | `packages/constants/src/extensionDefaultStore.ts` | Extension defaults, `/docs/keybindings` page |
| **Brand tokens** | `website/app/globals.css` + `web-ext/src/shared/theme.css` | Marketing site + extension UI |

Never hand-edit a derived value. Edit the source.

## Cutting a release

```bash
bun run bump:patch        # 3.0.3 → 3.0.4 (no doc snapshot)
bun run bump:minor        # 3.0.3 → 3.1.0 + snapshot prior docs to /docs/v3.0/
bun run bump:major        # 3.0.3 → 4.0.0 + snapshot prior docs to /docs/v3.0/
bun run bump 3.5.0-rc.1   # explicit version (e.g. pre-release)
```

What the script does:

1. Updates `EXTENSION_VERSION` in `packages/constants/src/version.ts`.
2. Stamps the new version into `web-ext/src/manifest.json` and every
   `package.json` in the workspace.
3. Renames the topmost `version: "next"` entry in
   `packages/constants/src/releases.ts` to the new version (and dates it
   today), or injects a stub if there was no WIP entry.
4. On minor/major with `--snapshot`, copies `website/app/docs/` →
   `website/app/docs/v<MAJOR>.<MINOR>/` (using the PREVIOUS version's
   tag) and prunes anything older than `current - 2`.

After the script:

```bash
bun run check             # green ✓ before commit
git diff
# Edit RELEASES[0].items if the script inserted a TODO stub
git commit -am "v3.0.4 release"
git tag v3.0.4
```

## When you ship a feature

If your PR adds user-visible behavior, also do:

- Add a `feat` item to the **`version: "next"`** entry in
  `releases.ts`, or create one at the top of `RELEASES`. The bump
  script will fold it into the next release.
- If it's a brand-new feature category, add to
  `EXTENSION_FEATURE_DEFINITIONS`.
- Update relevant docs under `website/app/docs/*`.
- If it adds a new keybinding default, add a row to
  `website/app/docs/keybindings/page.tsx` matching the same
  surface/group.

The PR template (`.github/pull_request_template.md`) carries this
checklist. The CI workflow `.github/workflows/consistency.yml` enforces
the **hard** invariants (version sync, RELEASES has a current entry,
no TODO stubs left behind). It surfaces **warnings** for un-documented
features and aging doc snapshots without blocking the merge.

## Docs versioning

The live docs at `/docs/*` always describe the most recent release.

On a minor or major bump (run with `--snapshot`), the previous docs get
copied into `website/app/docs/v<MAJOR>.<MINOR>/` and continue to be
served. Old URLs keep working; old snapshots render with a banner
component (`components/docs/DocsVersionBanner.tsx`) that tells the
reader they're not on the latest and offers a switch.

Anything older than `current - 2` minors gets pruned automatically on
the next bump. We don't carry the full history forever — anyone needing
ancient docs can browse `https://github.com/enrych/toppings/tree/v2.3.0/website/app/docs`
or similar via the Git tag.

## What this workflow deliberately does NOT do

- Auto-publish to Chrome Web Store / Firefox Add-ons. Those audits are
  human work and we don't automate them.
- Auto-derive doc copy from code. Code can't write voice or examples;
  the consistency check warns but doesn't write.
- Sync versions to backend's deployed API. The backend has its own
  release cadence; only its `package.json` `version` field tracks the
  monorepo version (cosmetic, not enforced at runtime).
