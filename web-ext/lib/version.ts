// Mirrored by `site.version` in website/lib/site.ts on a store release.
export const EXTENSION_VERSION = "4.0.0";

// Browsers accept only dot-separated numbers as a manifest `version`, so a
// pre-release suffix travels in `version_name` instead.
export const MANIFEST_VERSION = EXTENSION_VERSION.split("-")[0];
