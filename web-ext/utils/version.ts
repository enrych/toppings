/**
 * Returns the extension's current version from the manifest.
 * Works in both background and content script contexts.
 */
export async function getCurrentVersion(): Promise<string> {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return "unknown";
  }
}
