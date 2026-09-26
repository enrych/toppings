// Mirrored by `site.version` in website/lib/site.ts; bump both on release.
export const EXTENSION_VERSION = "3.0.3";

export async function getCurrentVersion(): Promise<string> {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return "unknown";
  }
}
