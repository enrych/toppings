import { useEffect, useState } from "react";
import {
  EXTENSION_CONTEXT_SCOPE,
  YOUTUBE_HOSTNAME_SUFFIX,
  YOUTUBE_URL_PATH,
  type ExtensionContextScope,
} from "../data/contract";

function resolveScope(url: string | null): ExtensionContextScope {
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

export function useScope() {
  const [url, setUrl] = useState<string | null>(null);
  const [scope, setScope] = useState<ExtensionContextScope>(
    EXTENSION_CONTEXT_SCOPE.UNSUPPORTED,
  );

  useEffect(() => {
    chrome.tabs?.query?.({ active: true, currentWindow: true }, (tabs) => {
      const tabUrl = tabs?.[0]?.url ?? null;
      setUrl(tabUrl);
      setScope(resolveScope(tabUrl));
    });
  }, []);

  return { url, scope };
}
