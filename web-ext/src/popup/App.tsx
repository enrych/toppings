import React from "react";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="tw-w-[320px] tw-h-[480px] tw-bg-[#0f0f10] tw-text-[#e7e7e4]">
      <div className="tw-h-[420px]">
        <div className="tw-p-6 tw-h-full">
          <h1 className="tw-text-gray-300 tw-text-4xl tw-font-bold tw-mb-4">
            Welcome To Toppings!
          </h1>
          <h2 className="tw-text-gray-400 tw-text-[12px] tw-mb-8">
            Your YouTube! Your Way!
          </h2>

          <hr className="tw-mb-8 tw-border-gray-600/30" />
        </div>
      </div>
      <Navbar />
    </div>
  );
}

export default App;
