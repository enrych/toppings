import React, { useState } from "react";
import { Outlet, useLoaderData, useLocation } from "react-router-dom";
import StoreContext from "./store";
import { Storage } from "../background/store";
import AppLayout from "./components/layout/AppLayout";
import { ToastProvider } from "./components/feedback/ToastProvider";
import { ConfirmProvider } from "./components/feedback/ConfirmProvider";
import { SectionsRail as WatchRail } from "./routes/Watch";
import { SectionsRail as AudioModeRail } from "./routes/AudioMode";
import { SectionsRail as KeybindingsRail } from "./routes/Keybindings";

/**
 * Map of routes that have a section anchor rail to the rail component.
 * Pages without an entry render with full width.
 */
const RAILS: Record<string, React.ComponentType> = {
  "/watch": WatchRail,
  "/audio-mode": AudioModeRail,
  "/keybindings": KeybindingsRail,
};

function App() {
  const loadedStore = useLoaderData() as Storage;
  const [store, setStore] = useState<Storage>(loadedStore);
  const location = useLocation();
  const Rail = RAILS[location.pathname];

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      <ToastProvider>
        <ConfirmProvider>
          <AppLayout rightRail={Rail ? <Rail /> : undefined}>
            <Outlet />
          </AppLayout>
        </ConfirmProvider>
      </ToastProvider>
    </StoreContext.Provider>
  );
}

export default App;
