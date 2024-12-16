import React, { useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import Navbar from "./components/Navbar";
import StoreContext from "./store";
import { Storage } from "../background/store";

function App() {
  const loadedStore = useLoaderData() as Storage;
  const [store, setStore] = useState<Storage>(loadedStore);

  return (
    <StoreContext.Provider value={{ store: store, setStore: setStore }}>
      <div className="tw-min-h-screen tw-bg-[#0f0f10] tw-text-[#e7e7e4]">
        <Navbar />
        <div className="tw-py-6 tw-px-16 tw-overflow-y-auto tw-w-full">
          <Outlet />
        </div>
      </div>
    </StoreContext.Provider>
  );
}

export default App;
