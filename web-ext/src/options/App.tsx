import React, { useEffect, useState } from "react";
import { Outlet, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import StoreContext from "../shared/store";
import { Storage } from "../background/store";
import AppLayout from "./components/layout/AppLayout";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { ConfirmProvider } from "../shared/components/feedback/ConfirmProvider";
import { useTheme } from "../shared/hooks/useTheme";
import { SectionsRail as WatchRail } from "./routes/Watch";
import { SectionsRail as AudioModeRail } from "./routes/AudioMode";
import { SectionsRail as KeybindingsRail } from "./routes/Keybindings";
import {
  CHROME_STORAGE_LOCAL_KEY,
  OPTIONS_RAIL_PATH,
  ROUTE_PATH_ABSOLUTE_PREFIX,
} from "toppings-constants";

function ThemeApplier({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

/**
 * Map of routes that have a section anchor rail to the rail component.
 * Pages without an entry render with full width.
 */
const RAILS: Partial<Record<string, React.ComponentType>> = {
  [OPTIONS_RAIL_PATH.WATCH]: WatchRail,
  [OPTIONS_RAIL_PATH.AUDIO_MODE]: AudioModeRail,
  [OPTIONS_RAIL_PATH.KEYBINDINGS]: KeybindingsRail,
};

/**
 * Consume `options_pending_route` from chrome.storage.local and navigate
 * to it on mount. Used by the popup (and future surfaces) to deep-link
 * into specific options routes since the memory router can't read URL
 * hashes/paths. The pending key is cleared after consumption.
 */
function PendingRouteHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    chrome.storage.local.get(
      [CHROME_STORAGE_LOCAL_KEY.OPTIONS_PENDING_ROUTE],
      (result) => {
        const route = result[
          CHROME_STORAGE_LOCAL_KEY.OPTIONS_PENDING_ROUTE
        ] as string | undefined;
        if (
          route &&
          typeof route === "string" &&
          route.startsWith(ROUTE_PATH_ABSOLUTE_PREFIX)
        ) {
          navigate(route, { replace: true });
          chrome.storage.local.remove([
            CHROME_STORAGE_LOCAL_KEY.OPTIONS_PENDING_ROUTE,
          ]);
        }
      },
    );
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function App() {
  const loadedStore = useLoaderData() as Storage;
  const [store, setStore] = useState<Storage>(loadedStore);
  const location = useLocation();
  const Rail = RAILS[location.pathname];

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      <ThemeApplier>
        <ToastProvider>
          <ConfirmProvider>
            <PendingRouteHandler />
            <AppLayout rightRail={Rail ? <Rail /> : undefined}>
              <Outlet />
            </AppLayout>
          </ConfirmProvider>
        </ToastProvider>
      </ThemeApplier>
    </StoreContext.Provider>
  );
}

export default App;
