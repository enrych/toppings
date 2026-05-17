# web-ext changelog

Work-in-progress notes for the current extension version. Fold items into
`packages/constants/src/releases.ts` when cutting a release.

## Unreleased (3.0.3+)

### Fix

- **Preserve preferences on install/update** — `onInstalled` no longer
  replaces `chrome.storage.sync` with bare defaults. New or changed default
  keys are merged in; existing user values are kept (`syncStorageWithDefaults`
  in `src/background/store.ts`).
