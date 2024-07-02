import { Outlet, useLoaderData } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ConfigContext from "./store";
import { Config } from "../../background/store";

function App() {
  const config = useLoaderData() as Config;

  return (
    <ConfigContext.Provider value={config}>
      <div className="flex h-screen bg-[#0f0f10] text-[#e7e7e4]">
        <Sidebar />
        <div className="p-8 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </ConfigContext.Provider>
  );
}

export default App;
