import React from "react";

export default function Navbar() {
  return (
    <div
      className={`tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-p-[10px] tw-bg-[#18181b] tw-h-[60px] tw-w-full`}
    >
      <nav className="tw-w-full tw-flex tw-justify-evenly tw-items-center">
        <a
          href="#"
          className="tw-flex tw-items-center tw-gap-2 tw-font-medium tw-text-foreground tw-hover:bg-[#3d3d43]/50 tw-px-3 tw-py-2 tw-rounded-md tw-cursor-pointer tw-bg-[#3d3d43]/50"
          title="Dashboard"
        >
          <img src={chrome.runtime.getURL("assets/svg/home.svg")} alt="Home" />
        </a>
        <button
          className="tw-flex tw-items-center tw-gap-2 tw-font-medium tw-text-foreground tw-hover:bg-[#3d3d43]/50 tw-px-3 tw-py-2 tw-rounded-md tw-cursor-pointer"
          title="Bug Report"
          onClick={() => {
            window.open("https://www.github.com/enrych/toppings/issues");
          }}
        >
          <img
            src={chrome.runtime.getURL("assets/svg/bug_report.svg")}
            alt="Bug Report"
          />
        </button>
        <button
          className="tw-flex tw-items-center tw-gap-2 tw-font-medium tw-text-foreground tw-hover:bg-[#3d3d43]/50 tw-px-3 tw-py-2 tw-rounded-md tw-cursor-pointer"
          title="Sponsor"
          onClick={() => {
            window.open("https://darhkvoyd.me/sponsor");
          }}
        >
          <img
            src={chrome.runtime.getURL("assets/svg/heart.svg")}
            alt="Sponsor"
          />
        </button>
        <button
          className="tw-flex tw-items-center tw-gap-2 tw-font-medium tw-text-foreground tw-hover:bg-[#3d3d43]/50 tw-px-3 tw-py-2 tw-rounded-md tw-cursor-pointer"
          title="Open Preferences"
          onClick={() => {
            window.open(chrome.runtime.getURL("options/index.html"));
          }}
        >
          <img
            src={chrome.runtime.getURL("assets/svg/gear.svg")}
            alt="Settings"
          />
        </button>
      </nav>
    </div>
  );
}
