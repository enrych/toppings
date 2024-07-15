import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="w-[320px] h-[480px] bg-[#0f0f10] text-[#e7e7e4]">
      <div className="h-[420px]">
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
}

export default App;
