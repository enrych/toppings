import { useEffect, useState } from "react";
import {
  EXTENSION_CONTEXT_SCOPE,
  type ExtensionContextScope,
} from "../data/contract";
import { resolveScope } from "../utils/scope";

export function useActiveTab() {
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
