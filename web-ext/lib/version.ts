// Mirrored by `site.version` in website/lib/site.ts on a store release; a
// pre-release like this one is not published, so the site keeps the last one.
export const EXTENSION_VERSION = "4.0.0-alpha";

// Browsers accept only dot-separated numbers as a manifest `version`, so a
// pre-release suffix travels in `version_name` instead.
export const MANIFEST_VERSION = EXTENSION_VERSION.split("-")[0];

export async function getCurrentVersion(): Promise<string> {
  try {
    const manifest = chrome.runtime.getManifest();
    return manifest.version_name ?? manifest.version;
  } catch {
    return "unknown";
  }
}
