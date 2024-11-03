import React from "react";

import AppsConfig from "../components/Apps";

export default function Apps() {
  return (
    <div className="tw-p-6">
      <h1 className="tw-text-gray-300 tw-text-4xl tw-font-bold tw-mb-4">Apps</h1>
      <h2 className="text-gray-400 text-[12px] mb-8">
        Manage your web apps settings and preferences
      </h2>
      <hr className="mb-8 border-gray-600/30" />
      <AppsConfig />
    </div>
  );
}
