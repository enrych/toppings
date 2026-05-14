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

function ThemeApplier({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

/**
 * Map of routes that have a section anchor rail to the rail component.
 * Pages without an entry render with full width.
 */
const RAILS: Record<string, React.ComponentType> = {
  "/watch": WatchRail,
  "/audio-mode": AudioModeRail,
  "/keybindings": KeybindingsRail,
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
    chrome.storage.local.get("options_pending_route", (result) => {
      const route = result.options_pending_route as string | undefined;
      if (route && typeof route === "string" && route.startsWith("/")) {
        navigate(route, { replace: true });
        chrome.storage.local.remove("options_pending_route");
      }
    });
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
