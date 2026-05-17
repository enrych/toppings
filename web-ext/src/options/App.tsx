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
  OPTIONS_PAGES,
  STORAGE_KEY,
} from "@toppings/constants";

function ThemeApplier({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

const SECTION_NAV_BY_SEGMENT: Record<string, React.ComponentType> = {
  watch: WatchRail,
  "audio-mode": AudioModeRail,
  keybindings: KeybindingsRail,
};

const RAILS = Object.fromEntries(
  OPTIONS_PAGES.filter((page) => page.sectionNav).map((page) => [
    page.path,
    SECTION_NAV_BY_SEGMENT[page.segment],
  ]),
) as Partial<Record<string, React.ComponentType>>;

function PendingRouteHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    chrome.storage.local.get(
      [STORAGE_KEY.OPTIONS_PENDING_ROUTE],
      (result) => {
        const route = result[
          STORAGE_KEY.OPTIONS_PENDING_ROUTE
        ] as string | undefined;
        if (
          route &&
          typeof route === "string" &&
          route.startsWith("/")
        ) {
          navigate(route, { replace: true });
          chrome.storage.local.remove([
            STORAGE_KEY.OPTIONS_PENDING_ROUTE,
          ]);
        }
      },
    );
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
