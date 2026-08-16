export async function getCurrentVersion(): Promise<string> {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return "unknown";
  }
}
