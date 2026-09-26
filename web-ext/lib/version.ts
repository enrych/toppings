/** Canonical extension version — also copy to `website/lib/version.ts` on release. */
export const EXTENSION_VERSION = "3.0.3";

export async function getCurrentVersion(): Promise<string> {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return "unknown";
  }
}
