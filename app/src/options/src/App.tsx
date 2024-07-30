import React, { useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ConfigContext from "./store";
import { ExtensionConfig } from "../../extension.config";

function App() {
  const loadedConfig = useLoaderData() as ExtensionConfig;
  const [config, setConfig] = useState<ExtensionConfig>(loadedConfig);

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      <div className="flex h-screen bg-[#0f0f10] text-[#e7e7e4]">
        <Sidebar />
        <div className="py-6 px-16 overflow-y-auto w-full">
          <Outlet />
        </div>
      </div>
    </ConfigContext.Provider>
  );
}

export default App;
