import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const version = chrome.runtime.getManifest().version;
  const location = useLocation();

  return (
    <div
      className={`p-6 bg-[#18181b] shadow h-full flex flex-col items-center transition-all duration-300 ${isCollapsed ? "w-24" : "w-64"}`}
    >
      <header className="flex justify-between items-center mb-8 w-full">
        {!isCollapsed && (
          <div className="flex flex-col items-left">
            <h1 className="text-2xl font-bold">Toppings</h1>
            <div className="text-xs text-gray-500">
              v<span id="version">{version}</span>
            </div>
          </div>
        )}
        <img
          className={`px-3 py-2 rounded hover:bg-[#3d3d43]/50 transition-all duration-300 ${isCollapsed ? "rotate-180" : ""} cursor-pointer`}
          src={chrome.runtime.getURL("assets/icons/arrowhead-left.svg")}
          alt="Arrowhead Left"
          onClick={() => {
            setIsCollapsed((prev) => !prev);
          }}
        />
      </header>
      <nav className="space-y-4 w-full">
        <Link
          className={`flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer ${location.pathname === "/" ? "bg-[#3d3d43]/50" : ""}`}
          to="/"
        >
          <img
            src={chrome.runtime.getURL("assets/icons/gear.svg")}
            alt="Gear"
          />
          <div
            className={`transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
          >
            General
          </div>
        </Link>
        <Link
          className={`flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer ${location.pathname === "/advanced" ? "bg-[#3d3d43]/50" : ""}`}
          to="/advanced"
        >
          <img
            src={chrome.runtime.getURL("assets/icons/brackets.svg")}
            alt="Brackets"
          />
          <div
            className={`transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
          >
            Advanced
          </div>
        </Link>
      </nav>
    </div>
  );
}
