import React from "dom-chef";

export const AudioModeButton = (
  <button
    className="ytp-button tw-text-center"
    aria-pressed="false"
    aria-label="Toggle Audio Mode"
    title="Audio Mode"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="tw-w-full tw-h-full tw-p-[25%]"
    >
      <path
        d="M12 1C8.96 1 6.5 3.46 6.5 6.5V12.5C6.5 15.54 8.96 18 12 18C15.04 18 17.5 15.54 17.5 12.5V6.5C17.5 3.46 15.04 1 12 1ZM14.5 12.5C14.5 13.88 13.38 15 12 15C10.62 15 9.5 13.88 9.5 12.5V6.5C9.5 5.12 10.62 4 12 4C13.38 4 14.5 5.12 14.5 6.5V12.5Z"
        fill="#ffffff"
      />
      <path
        d="M4 12.5C4 16.64 7.09 20.06 11 20.45V23H13V20.45C16.91 20.06 20 16.64 20 12.5H18C18 15.81 15.31 18.5 12 18.5C8.69 18.5 6 15.81 6 12.5H4Z"
        fill="#ffffff"
      />
    </svg>
  </button>
);
