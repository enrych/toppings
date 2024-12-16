import React from "react";

export default function Navbar() {
  const version = chrome.runtime.getManifest().version;

  return (
    <div className="tw-p-4 tw-bg-[#18181b] tw-shadow tw-h-full">
      <div className="tw-flex tw-flex-col tw-items-left">
        <h1 className="tw-text-2xl tw-font-bold">Toppings</h1>
        <div className="tw-text-xs tw-text-gray-500">
          v<span id="version">{version}</span>
        </div>
      </div>
    </div>
  );
}
