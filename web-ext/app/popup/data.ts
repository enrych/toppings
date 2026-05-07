import {
  EXTENSION_CONTEXT_SCOPE,
  type ExtensionContextScope,
} from "@toppings/constants";

export const POPUP_SIZE = {
  WIDTH_PX: 340,
  HEIGHT_PX: 520,
} as const;

export const POPUP_TAB_SCOPE_LABEL: Record<ExtensionContextScope, string> = {
  [EXTENSION_CONTEXT_SCOPE.WATCH]: "Watch page · active",
  [EXTENSION_CONTEXT_SCOPE.SHORTS]: "Shorts · active",
  [EXTENSION_CONTEXT_SCOPE.PLAYLIST]: "Playlist · active",
  [EXTENSION_CONTEXT_SCOPE.YOUTUBE]: "YouTube · active",
  [EXTENSION_CONTEXT_SCOPE.UNSUPPORTED]: "Open a YouTube video",
};
