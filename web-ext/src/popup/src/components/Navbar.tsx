import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-[10px] bg-[#18181b] h-[60px] w-full`}
    >
      <nav className="tw-w-full tw-flex tw-justify-evenly tw-items-center">
        <Link
          className={`flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer ${location.pathname === "/" ? "bg-[#3d3d43]/50" : ""}`}
          title="Dashboard"
          to="/"
        >
          <img
            src={chrome.runtime.getURL("assets/icons/home.svg")}
            alt="Home"
          />
        </Link>
        <button
          className="flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer"
          title="Bug Report"
          onClick={() => {
            window.open("https://www.github.com/enrych/toppings/issues");
          }}
        >
          <img
            src={chrome.runtime.getURL("assets/icons/bug_report.svg")}
            alt="Bug Report"
          />
        </button>
        <button
          className="flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer"
          title="Sponsor"
          onClick={() => {
            window.open("https://darhkvoyd.me/sponsor");
          }}
        >
          <img
            src={chrome.runtime.getURL("assets/icons/heart.svg")}
            alt="Sponsor"
          />
        </button>
        <button
          className="flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer"
          title="Open Preferences"
          onClick={() => {
            window.open(chrome.runtime.getURL("options/index.html"));
          }}
        >
          <img
            src={chrome.runtime.getURL("assets/icons/gear.svg")}
            alt="Settings"
          />
        </button>
      </nav>
    </div>
  );
}
