import React, { useState } from "react";
import { Outlet, useLoaderData, useLocation } from "react-router-dom";
import StoreContext from "../../context/store";
import { Storage } from "../background/store";
import ThemeApplier from "../../components/ThemeApplier";
import AppLayout from "./components/layout/AppLayout";
import { ToastProvider } from "../../components/feedback/ToastProvider";
import { ConfirmProvider } from "../../components/feedback/ConfirmProvider";
import { SECTION_RAILS } from "./routing";

export default function App() {
  const loadedStore = useLoaderData() as Storage;
  const [store, setStore] = useState<Storage>(loadedStore);
  const location = useLocation();
  const Rail = SECTION_RAILS[location.pathname];

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      <ThemeApplier>
        <ToastProvider>
          <ConfirmProvider>
            <AppLayout rightRail={Rail ? <Rail /> : undefined}>
              <Outlet />
            </AppLayout>
          </ConfirmProvider>
        </ToastProvider>
      </ThemeApplier>
    </StoreContext.Provider>
  );
}
