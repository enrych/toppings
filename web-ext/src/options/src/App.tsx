import React, { useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ConfigContext from "./store";
import { Storage } from "../../background/store";

function App() {
  const loadedConfig = useLoaderData() as Storage;
  const [config, setConfig] = useState<Storage>(loadedConfig);

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      <div className="flex h-screen bg-[#0f0f10] text-[#e7e7e4]">
        <Sidebar />
        <div className="tw-py-6 tw-px-16 tw-overflow-y-auto tw-w-full">
          <Outlet />
        </div>
      </div>
    </ConfigContext.Provider>
  );
}

export default App;
