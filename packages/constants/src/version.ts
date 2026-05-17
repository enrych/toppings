export const EXTENSION_VERSION = "3.0.3";

export const DOCS_VERSION_TAG = "v{{major}}.{{minor}}";

export const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;

export const EXTENSION_VERSION_DECLARATION =
  /(EXTENSION_VERSION\s*=\s*)"[^"]+"/;

export const BUMP_KIND = {
  PATCH: "patch",
  MINOR: "minor",
  MAJOR: "major",
} as const;

export type BumpKind = (typeof BUMP_KIND)[keyof typeof BUMP_KIND];

export const DOC_SNAPSHOT_RETENTION_MINORS = 2;

export const DOC_SNAPSHOT_DIR_PATTERN = /^v(\d+)\.(\d+)$/;

export const RELEASE_STUB = {
  TITLE: "TODO: one-line tagline",
  ITEM_TEXT: "TODO: add release notes for {{version}}",
} as const;

export const RELEASE_TODO_PREFIX = "TODO";

export const REPO_PATH = {
  versionTs: "packages/constants/src/version.ts",
  releasesTs: "packages/constants/src/releases.ts",
  docsDir: "website/app/docs",
  keybindingsPage: "website/app/docs/keybindings/page.tsx",
  manifestJson: "web-ext/src/manifest.json",
} as const;

export const VERSIONLESS_PACKAGE_JSONS = [
  "package.json",
  "web-ext/package.json",
  "website/package.json",
  "backend/package.json",
  "packages/constants/package.json",
  "packages/utils/package.json",
] as const;
