import {
  EXTENSION_CONTEXT_SCOPE,
  YOUTUBE_HOSTNAME_SUFFIX,
  YOUTUBE_URL_PATH,
  type ExtensionContextScope,
} from "../data/contract";

export function resolveScope(url: string | null): ExtensionContextScope {
  if (!url) return EXTENSION_CONTEXT_SCOPE.UNSUPPORTED;
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith(YOUTUBE_HOSTNAME_SUFFIX)) {
      return EXTENSION_CONTEXT_SCOPE.UNSUPPORTED;
    }
    if (u.pathname.startsWith(YOUTUBE_URL_PATH.WATCH)) {
      return EXTENSION_CONTEXT_SCOPE.WATCH;
    }
    if (u.pathname.startsWith(YOUTUBE_URL_PATH.SHORTS)) {
      return EXTENSION_CONTEXT_SCOPE.SHORTS;
    }
    if (u.pathname.startsWith(YOUTUBE_URL_PATH.PLAYLIST)) {
      return EXTENSION_CONTEXT_SCOPE.PLAYLIST;
    }
    return EXTENSION_CONTEXT_SCOPE.YOUTUBE;
  } catch {
    return EXTENSION_CONTEXT_SCOPE.UNSUPPORTED;
  }
}
