import React from "dom-chef";
import { enableAutoScroll } from "..";

const AutoScrollButton = (
  <button
    id="toppings-shorts-auto-scroll-btn"
    className="mt-[16px] yt-spec-button-shape-next yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button outline-none border-none font-medium text-white"
    onClick={enableAutoScroll}
  >
    Auto
  </button>
);

export default AutoScrollButton;
